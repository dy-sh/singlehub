/**
 * Created by Derwish on 01.07.2016.
 */

var mys = require('./mysensors');

var debug = require('debug')('gateway:mys       ');
var debugLog = require('debug')('gateway:mys:log   ');
var debugMes = require('debug')('gateway:mys:mes   ');
var debugErr = require('debug')('gateway:mys:error ');
debugErr.color = 1;

var _ = require("lodash");
var eventEmitter = require("events");
var util = require("util");
var split = require("split");

var GATEWAY_ID = 0;
var BROADCAST_ID = 255;
var NODE_SELF_SENSOR_ID = 255;

var gateway = new Gateway;

module.exports = gateway;


function Gateway() {
	eventEmitter.call(this);

	this.nodes = [];
	this.isConnected = false;
}
util.inherits(Gateway, eventEmitter);


Gateway.prototype.connectToSerialPort = function (portName, baudRate) {
	if (!portName) throw new Error("portName is not defined!");
	baudRate = baudRate || 115200;

	var SerialPort = require("serialport").SerialPort;
	this.port = new SerialPort(portName, {baudrate: baudRate}, false);

	this.port.on("open", function () {
		debug("Port connected");
	});

	this.port.on("error", function (err) {
		debugErr("Connection failed. " + err);
		setTimeout(this.connect, 1000);
	});

	this.port.on("close", function () {
		debug("Port closed. ");
	});

	this.port.on("disconnect", function (err) {
		debug("Port disconnected. " + err);
		d
	});

	this.port.pipe(split()).on("data", this._readPortData.bind(this));

	this.connect = function () {
		debug("Connecting to " + portName + " at " + baudRate + " ...");
		var self = this;
		this.port.open();
	};

	this.connect();
};


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
		debugLog("<   " + data);
	else
		debugMes("<   " + data);

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
					this.isConnected = true;
					debug("Gateway connected.");
					this.sendGetGatewayVersion();
					break;

				case mys.internal.I_VERSION:
					this.version = message.payload;
					debug("Gateway version: " + message.payload);
					break;
			}
	}
};


Gateway.prototype.sendGetGatewayVersion = function () {
	this.sendMessage({
		node_id: GATEWAY_ID,
		sensor_id: BROADCAST_ID,
		message_type: mys.message_type.C_INTERNAL,
		sub_type: mys.internal.I_VERSION
	});
};

Gateway.prototype._receiveNodeMessage = function (message) {


	if (message.node_id != BROADCAST_ID) {
		var node = this.getNode(message.node_id);
		node.last_seen = new Date();
	}

	switch (message.message_type) {
		case mys.message_type.C_PRESENTATION:
			this._proceedPresentation(message);
			break;
		case mys.message_type.C_SET:
			this._proceedSet(message);
			break;
		case mys.message_type.C_REQ:
			this._proceedReq(message);
			break;
		case mys.message_type.C_INTERNAL:
			this._proceedInternal(message);
			break;
	}
};


Gateway.prototype._proceedPresentation = function (message) {
	if (message.sensor_id == NODE_SELF_SENSOR_ID) {
		if (message.sub_type == mys.presentation.S_ARDUINO_NODE ||
			message.sub_type == mys.presentation.S_ARDUINO_REPEATER_NODE
		) {
			var node = this.getNode(message.node_id);
			var isRepeater = message.sub_type == mys.presentation.S_ARDUINO_NODE;
			var version = message.payload;

			if (node.isRepeater !== isRepeater
				|| node.version !== version
			) {
				node.isRepeater = isRepeater;
				node.version = version;
				debug(`Node[${node.id}] version: [${version}]`);
			}
		}

	}
	else {
		var sensor = this.getSensor(message.node_id, message.sensor_id);
		if (sensor.type !== message.sub_type) {
			sensor.type = message.sub_type;
			debug(`Node[${message.node_id}] Sensor[${message.sensor_id}] presented: [${mys.presentation_key[message.sub_type]}]`);
			var node = this.getNode(message.node_id);
			this.emit("sensorUpdated", node, "sensor.type", sensor);
		}
	}
};


Gateway.prototype._proceedSet = function (message) {
	var node = this.getNode(message.node_id);
	var sensor = this.getSensor(message.node_id, message.node_id);

	sensor.value = message.payload;
	sensor.last_seen = Date.now();

	if (sensor.type !== message.sub_type) {
		sensor.type = message.sub_type;
		debug(`Node[${message.node_id}] Sensor[${message.sensor_id}] type updated: [${mys.presentation_key[message.sub_type]}]`);
		this.emit("sensorUpdated", node, "sensor.type", sensor);
	}

	debug(`Node[${message.node_id}] Sensor[${message.sensor_id}] updated: [${message.payload}]`);
	this.emit("sensorUpdated", node, "sensor.value", sensor);

};


Gateway.prototype._proceedReq = function (message) {
	var sensor = this.getSensorIfExist(message.node_id, message.sensor_id);
	if (!sensor)
		return;

	this.sendMessage({
		node_id: message.node_id,
		sensor_id: message.sensor_id,
		message_type: mys.message_type.C_SET,
		ack: 0,
		sub_type: sensor.type,
		payload: sensor.value
	});
};


Gateway.prototype._proceedInternal = function (message) {
	switch (message.sub_type) {

		case (mys.internal.I_ID_REQUEST):
			var id = this._getNewNodeId();
			if (!id) return;
			this.sendMessage({
				node_id: BROADCAST_ID,
				sensor_id: BROADCAST_ID,
				message_type: mys.message_type.C_INTERNAL,
				sub_type: mys.internal.I_ID_RESPONSE,
				payload: id
			});
			break;

		case (mys.internal.I_SKETCH_NAME):
			var node = this.getNode(message.node_id);
			if (node.sketchName !== message.payload) {
				node.sketchName = message.payload;
				debug(`Node[${message.node_id}] Sensor[${message.sensor_id}] sketch name: [${message.payload}]`);
				this.emit("nodeUpdated", node, "sketchName");
			}
			break;

		case ( mys.internal.I_SKETCH_VERSION):
			var node = this.getNode(message.node_id);
			if (node.sketchVersion !== message.payload) {
				node.sketchVersion = message.payload;
				debug(`Node[${message.node_id}] Sensor[${message.sensor_id}] sketch version: [${message.payload}]`);
				this.emit("nodeUpdated", node, "sketchVersion");
			}
			break;

		case ( mys.internal.I_BATTERY_LEVEL):
			var node = this.getNode(message.node_id);
			node.batteryLevel = +message.payload;
			debug(`Node[${message.node_id}] Sensor[${message.sensor_id}] battery level: [${message.payload}]`);
			this.emit("nodeUpdated", node, "batteryLevel");
			break;

		case ( mys.internal.I_CONFIG):
			this.sendMessage({
				node_id: message.node_id,
				sensor_id: BROADCAST_ID,
				message_type: mys.message_type.C_INTERNAL,
				sub_type: mys.internal.I_CONFIG,
				payload: "M"
			});
			break;

		case ( mys.internal.I_TIME):
			this.this.sendMessage({
				node_id: message.node_id,
				sensor_id: message.sensor_id,
				message_type: mys.message_type.C_INTERNAL,
				sub_type: mys.internal.I_TIME,
				payload: Math.ceil(Date.now() / 1000)
			});
			break;
	}
};


Gateway.prototype.sendMessage = function (message) {
	var arr = [
		message.node_id,
		message.sensor_id,
		message.message_type,
		message.ack || 0,
		message.sub_type,
		message.payload
	];

	var mess = _.join(arr, ";");

	debugMes("  > " + mess);
	this.port.write(mess + "\n");
};


Gateway.prototype.getNodeIfExist = function (node_id) {
	return _.find(this.nodes, {'id': node_id});
};

Gateway.prototype.getNode = function (node_id) {
	var node = _.find(this.nodes, {'id': node_id});
	if (!node) node = this._registerNode(node_id);
	return node;
};


Gateway.prototype.getSensorIfExist = function (node_id, sensor_id) {
	var node = this.getNodeIfExist(node_id);
	if (!node) return;

	return _.find(node.sensors, {'id': sensor_id});
};

Gateway.prototype.getSensor = function (node_id, sensor_id) {
	var node = this.getNode(node_id);

	var sensor = _.find(node.sensors, {'id': sensor_id});
	if (!sensor) sensor = this._registerSensor(node_id, sensor_id);

	return sensor;
};


Gateway.prototype._registerNode = function (node_id) {
	var node = this.getNodeIfExist(node_id);

	if (!node) {
		node = {
			id: node_id,
			sensors: [],
			registered: new Date(),
			last_seen: new Date()
		};

		this.nodes.push(node);
		debug(`Node[${node_id}] registered.`);
		this.emit("nodeRegistered", node);
	}
	return node;
};


Gateway.prototype._registerSensor = function (node_id, sensor_id) {
	var node = this.getNode(node_id);

	var sensor = _.find(node.sensors, {'id': sensor_id});
	if (!sensor) {
		sensor = {
			id: sensor_id,
			node_id: node_id,
			last_seen: new Date()
		};

		node.sensors.push(sensor);
		debug(`Node[${node_id}] Sensor[${sensor_id}] registered.`);
		this.emit("sensorRegistered", node, "sensor", sensor);
	}

	return sensor;
};


Gateway.prototype._getNewNodeId = function () {
	for (var i = 1; i < 255; i++) {
		var node = this.getNodeIfExist(i);
		if (!node)
			return i;
	}

	debugErr('Can`t register new node. There are no available id.');
};

