var mys = require('./mysensors');

var debug = require('debug')('gateway:mys');
var debugLog = require('debug')('gateway:mys:log');
var debugMes = require('debug')('gateway:mys:mes');
var debugErr = require('debug')('gateway:mys:error');
debugErr.color = 1;

var split = require("split");
var _ = require("lodash");

var GATEWAY_ID = 0;
var NEWNODE_ID = 255;
var NODE_SELF_SENSOR_ID = 255;


module.exports.serialGateway = function (portName, baudRate) {
	if (!portName) throw new Error("portName is not defined!");
	baudRate = baudRate || 115200;

	var SerialPort = require("serialport").SerialPort;
	var port = new SerialPort(portName, {baudrate: baudRate}, false);

	function connect() {
		debug("Connecting to " + portName + " at " + baudRate + " ...");
		port.open();
	}

	port.on("open", function () {
		debug("Connected");
	});

	port.on("error", function (err) {
		debugErr("Connection failed. " + err);
		setTimeout(connect, 1000);
	});

	port.on("close", function () {
		debug("Connection closed. ");
	});

	port.on("disconnect", function (err) {
		debug("Disconnected. " + err);
	});

	connect();

	return new Gateway(port);
};


function Gateway(port) {

	this.port = port;
	this.nodes = [];

	port.pipe(split()).on("data", this._readPortData.bind(this));
}


Gateway.prototype._readPortData = function (data) {
	var mess = data.split(";");
	if (mess.length < 5) {
		debugErr("Can`t parse message: " + data);
		return;
	}

	var message = {
		node_id: +mess[0],
		sensor_id: +mess[1],
		message_type: +mess[2],
		ack: +mess[3],
		sub_type: +mess[4],
		payload: mess[5]
	};

	//log message
	if (message.message_type == mys.message_type.C_INTERNAL
		&& message.sub_type == mys.internal.I_LOG_MESSAGE)
		debugLog(data);
	else
		debugMes(data);

	if (message.node_id == GATEWAY_ID)
		this._receiveGatewayMessage(message);
	else
		this._receiveNodeMessage(message);
};


Gateway.prototype._receiveGatewayMessage = function (message) {

	switch (message.message_type) {
		case mys.message_type.C_INTERNAL:
			switch (message.sub_type) {

				case mys.internal.I_GATEWAY_READY:
					this.ready = true;
					debug("Gateway is ready.");
					break;
				case mys.internal.I_VERSION:
					this.version = message.payload;
					break;
			}
	}
};


Gateway.prototype._receiveNodeMessage = function (message) {

	//var nodeId = message.node_id;

	// if (nodeId != NEWNODE_ID) {
	// 	var node = this.getNode(nodeId);
	// 	if (!node) node = this._registerNode(nodeId);
	// }

	switch (message.message_type) {
		case mys.message_type.C_PRESENTATION:
			this._proceedPresentstion(message);
			break;

		// case mys.message_type.C_INTERNAL:
		// 	switch (message.sub_type) {
		//
		// 	}
	}
};


Gateway.prototype.getNode = function (node_id) {
	return _.find(this.nodes, {'id': node_id})
};

Gateway.prototype.getSensor = function (node_id, sensor_id) {
	var node = this.getNode(node_id);
	if (!node) return;

	return _.find(node.sensors, {'id': sensor_id});
};

Gateway.prototype._registerNode = function (node_id) {
	var node = this.getNode(node_id);

	if (!node) {
		node = {
			id: node_id,
			sensors: [],
			registered: new Date(),
			last_seen: new Date()
		};

		this.nodes.push(node);
		debug(`Node[${node_id}] registered.`);
	}
	return node;
};


Gateway.prototype._registerSensor = function (node_id, sensor_id) {
	var node = this.getNode(node_id);
	if (!node) node = this._registerNode(node_id);

	var sensor = _.find(node.sensors, {'id': sensor_id});
	if (!sensor) {
		sensor = {
			id: sensor_id,
			last_seen: new Date()
		};

		node.sensors.push(sensor);
		debug(`Node[${node_id}] Sensor[${sensor_id}] registered.`);
	}

	return sensor;
};


Gateway.prototype._proceedPresentstion = function (message) {
	if (message.sensor_id == NODE_SELF_SENSOR_ID) {

	}
	else {
		var sensor = this.getSensor(message.node_id, message.sensor_id);
		if (!sensor) sensor = this._registerSensor(message.node_id, message.sensor_id);
		if (sensor.type !== message.sub_type) {
			sensor.type = message.sub_type;
			debug(`Node[${message.node_id}] Sensor[${message.sensor_id}] presented: [${mys.presentation_key[message.sub_type]}]`);
		}
	}
};