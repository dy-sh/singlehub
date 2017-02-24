/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var mys = require('./mysensors');
    var debug = require('debug')('gateway:mys:      ');
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
    function Gateway() {
        eventEmitter.call(this);
        this.nodes = [];
        this.isConnected = false;
    }
    util.inherits(Gateway, eventEmitter);
    Gateway.prototype.connectToSerialPort = function (portName, baudRate) {
        if (!portName)
            throw new Error("portName is not defined!");
        baudRate = baudRate || 115200;
        baudRate = 115200;
        var SerialPort = require("serialport");
        this.port = new SerialPort(portName, { baudRate: baudRate, autoOpen: false });
        this.port.on("open", function () {
            debug("Port connected");
        });
        this.port.on("error", function (err) {
            debugErr(err);
        });
        this.port.on("close", function () {
            debug("Port closed. ");
        });
        this.port.on("disconnect", function (err) {
            debug("Port disconnected. " + err);
        });
        this.port.pipe(split()).on("data", this._readPortData.bind(this));
        debug("Connecting to " + portName + " at " + baudRate + " ...");
        this.port.open();
    };
    Gateway.prototype._readPortData = function (data) {
        var mess = data.split(";");
        if (mess.length < 5) {
            debugErr("Can`t parse message: " + data);
            return;
        }
        var message = {
            nodeId: +mess[0],
            sensorId: +mess[1],
            messageType: +mess[2],
            ack: +mess[3],
            subType: +mess[4],
            payload: mess[5]
        };
        //log message
        if (message.messageType == mys.messageType.C_INTERNAL
            && message.subType == mys.internalDataType.I_LOG_MESSAGE)
            debugLog("<   " + data);
        else
            debugMes("<   " + data);
        if (message.nodeId == GATEWAY_ID)
            this._receiveGatewayMessage(message);
        else
            this._receiveNodeMessage(message);
    };
    Gateway.prototype._receiveGatewayMessage = function (message) {
        switch (message.messageType) {
            case mys.messageType.C_INTERNAL:
                switch (message.subType) {
                    case mys.internalDataType.I_GATEWAY_READY:
                        this.isConnected = true;
                        debug("Gateway connected.");
                        this.sendGetGatewayVersion();
                        break;
                    case mys.internalDataType.I_VERSION:
                        this.version = message.payload;
                        debug("Gateway version: " + message.payload);
                        break;
                }
        }
    };
    Gateway.prototype.sendGetGatewayVersion = function () {
        this.sendMessage({
            nodeId: GATEWAY_ID,
            sensorId: BROADCAST_ID,
            messageType: mys.messageType.C_INTERNAL,
            subType: mys.internalDataType.I_VERSION
        });
    };
    Gateway.prototype._receiveNodeMessage = function (message) {
        if (message.nodeId != BROADCAST_ID) {
            var node = this.getNode(message.nodeId);
            node.lastSeen = Date.now();
        }
        switch (message.messageType) {
            case mys.messageType.C_PRESENTATION:
                this._proceedPresentation(message);
                break;
            case mys.messageType.C_SET:
                this._proceedSet(message);
                break;
            case mys.messageType.C_REQ:
                this._proceedReq(message);
                break;
            case mys.messageType.C_INTERNAL:
                this._proceedInternal(message);
                break;
        }
    };
    Gateway.prototype._proceedPresentation = function (message) {
        if (message.sensorId == NODE_SELF_SENSOR_ID) {
            if (message.subType == mys.sensorType.S_ARDUINO_NODE ||
                message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE) {
                var node = this.getNode(message.nodeId);
                var isRepeatingNode = message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE;
                var version = message.payload;
                if (node.isRepeatingNode !== isRepeatingNode
                    || node.version !== version) {
                    node.isRepeatingNode = isRepeatingNode;
                    node.version = version;
                    debug(`Node[${node.id}] version: [${version}]`);
                }
            }
        }
        else {
            var sensor = this.getSensor(message.nodeId, message.sensorId);
            if (sensor.type !== message.subType) {
                sensor.type = message.subType;
                sensor.dataType = mys.getDefaultDataType(message.subType);
                debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] presented: [${mys.sensorTypeKey[message.subType]}]`);
                console.log(sensor.dataType);
                var node = this.getNode(message.nodeId);
                this.emit("sensorUpdated", sensor, "type");
            }
        }
    };
    Gateway.prototype._proceedSet = function (message) {
        var node = this.getNode(message.nodeId);
        var sensor = this.getSensor(message.nodeId, message.sensorId);
        sensor.state = message.payload;
        sensor.lastSeen = Date.now();
        if (sensor.dataType !== message.subType) {
            sensor.dataType = message.subType;
            debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] dataType updated: [${mys.sensorDataTypeKey[message.subType]}]`);
            this.emit("sensorUpdated", sensor, "type");
        }
        debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] updated: [${message.payload}]`);
        this.emit("sensorUpdated", sensor, "state");
    };
    Gateway.prototype._proceedReq = function (message) {
        var sensor = this.getSensorIfExist(message.nodeId, message.sensorId);
        if (!sensor)
            return;
        this.sendMessage({
            nodeId: message.nodeId,
            sensorId: message.sensorId,
            messageType: mys.messageType.C_SET,
            ack: 0,
            subType: sensor.type,
            payload: sensor.state
        });
    };
    Gateway.prototype._proceedInternal = function (message) {
        switch (message.subType) {
            case (mys.internalDataType.I_ID_REQUEST):
                var id = this._getNewNodeId();
                if (!id)
                    return;
                this.sendMessage({
                    nodeId: BROADCAST_ID,
                    sensorId: BROADCAST_ID,
                    messageType: mys.messageType.C_INTERNAL,
                    subType: mys.internalDataType.I_ID_RESPONSE,
                    payload: id
                });
                break;
            case (mys.internalDataType.I_SKETCH_NAME):
                var node = this.getNode(message.nodeId);
                if (node.sketchName !== message.payload) {
                    node.sketchName = message.payload;
                    debug(`Node[${message.nodeId}] sketch name: [${message.payload}]`);
                    this.emit("nodeUpdated", node, "sketchName");
                }
                break;
            case (mys.internalDataType.I_SKETCH_VERSION):
                var node = this.getNode(message.nodeId);
                if (node.sketchVersion !== message.payload) {
                    node.sketchVersion = message.payload;
                    debug(`Node[${message.nodeId}] sketch version: [${message.payload}]`);
                    this.emit("nodeUpdated", node, "sketchVersion");
                }
                break;
            case (mys.internalDataType.I_BATTERY_LEVEL):
                var node = this.getNode(message.nodeId);
                node.batteryLevel = +message.payload;
                debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] battery level: [${message.payload}]`);
                this.emit("nodeUpdated", node, "batteryLevel");
                break;
            case (mys.internalDataType.I_CONFIG):
                this.sendMessage({
                    nodeId: message.nodeId,
                    sensorId: BROADCAST_ID,
                    messageType: mys.messageType.C_INTERNAL,
                    subType: mys.internalDataType.I_CONFIG,
                    payload: "M"
                });
                break;
            case (mys.internalDataType.I_TIME):
                this.this.sendMessage({
                    nodeId: message.nodeId,
                    sensorId: message.sensorId,
                    messageType: mys.messageType.C_INTERNAL,
                    subType: mys.internalDataType.I_TIME,
                    payload: Math.ceil(Date.now() / 1000)
                });
                break;
        }
    };
    Gateway.prototype.sendMessage = function (message) {
        var arr = [
            message.nodeId,
            message.sensorId,
            message.messageType,
            message.ack || 0,
            message.subType,
            message.payload
        ];
        var mess = _.join(arr, ";");
        debugMes("  > " + mess);
        this.port.write(mess + "\n");
    };
    Gateway.prototype.getNodeIfExist = function (nodeId) {
        return _.find(this.nodes, { 'id': nodeId });
    };
    Gateway.prototype.getNode = function (nodeId) {
        var node = _.find(this.nodes, { 'id': nodeId });
        if (!node)
            node = this._registerNode(nodeId);
        return node;
    };
    Gateway.prototype.getSensorIfExist = function (nodeId, sensorId) {
        var node = this.getNodeIfExist(nodeId);
        if (!node)
            return;
        return _.find(node.sensors, { 'id': sensorId });
    };
    Gateway.prototype.getSensor = function (nodeId, sensorId) {
        var node = this.getNode(nodeId);
        var sensor = _.find(node.sensors, { 'sensorId': sensorId });
        if (!sensor)
            sensor = this._registerSensor(nodeId, sensorId);
        return sensor;
    };
    Gateway.prototype._registerNode = function (nodeId) {
        var node = this.getNodeIfExist(nodeId);
        if (!node) {
            node = {
                id: nodeId,
                sensors: [],
                registered: Date.now(),
                lastSeen: Date.now()
            };
            this.nodes.push(node);
            debug(`Node[${nodeId}] registered.`);
            this.emit("newNode", node);
        }
        return node;
    };
    Gateway.prototype._registerSensor = function (nodeId, sensorId) {
        var node = this.getNode(nodeId);
        var sensor = _.find(node.sensors, { 'sensorId': sensorId });
        if (!sensor) {
            sensor = {
                nodeId: nodeId,
                sensorId: sensorId,
                lastSeen: Date.now()
            };
            node.sensors.push(sensor);
            debug(`Node[${nodeId}] Sensor[${sensorId}] registered.`);
            this.emit("newSensor", sensor);
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
    var mys_gateway = new Gateway;
    exports.mys_gateway = mys_gateway;
});
//# sourceMappingURL=gateway.js.map