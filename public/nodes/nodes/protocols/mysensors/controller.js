/**
 * Created by Derwish (derwish.pro@gmail.com) on 20.30.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../../node", "../../../container", "./types", "../../main"], factory);
    }
})(function (require, exports) {
    "use strict";
    const node_1 = require("../../../node");
    const container_1 = require("../../../container");
    const mys = require("./types");
    const main_1 = require("../../main");
    let split, _;
    if (typeof (window) === 'undefined') {
        split = require("split");
        _ = require("lodash");
    }
    let GATEWAY_ID = 0;
    let BROADCAST_ID = 255;
    let NODE_SELF_SENSOR_ID = 255;
    class MySensorsController extends main_1.ContainerNode {
        constructor(container) {
            super(container);
            this.nodes = [];
            this.isConnected = false;
            this.title = "MYS Controller";
            this.descriprion = 'MySensors protocol controller.';
            this.addInput("[connect]", "boolean");
            this.addOutput("connected", "boolean");
            this.settings["enable"] = { description: "Enable", value: false, type: "boolean" };
            this.settings["port"] = { description: "Serial port name", value: "/dev/tty.SLAB_USBtoUART", type: "string" };
            this.settings["baudRate"] = { description: "Baud rate", value: 115200, type: "number" };
            this.settings["debug"] = { description: "Show debug messages in console", value: false, type: "boolean" };
        }
        onAdded() {
            if (this.side == container_1.Side.server) {
                this.setOutputData(0, false);
                // connect if "connect" input disconnected or input data==true
                if (this.settings["enable"].value
                    && (this.inputs[0].link == null || this.inputs[0].data == true))
                    this.connectToSerialPort();
            }
        }
        onRemoved() {
            if (this.side == container_1.Side.server) {
                if (this.port)
                    this.port.close();
            }
            super.onRemoved();
        }
        onSettingsChanged() {
            if (this.side == container_1.Side.server) {
                if (this.port)
                    this.port.close();
                if (this.settings["enable"].value)
                    this.connectToSerialPort();
            }
        }
        connectToSerialPort() {
            let portName = this.settings["port"].value;
            let baudRate = this.settings["baudRate"].value;
            if (!portName) {
                this.debugErr("Port name is not defined!");
                return;
            }
            let that = this;
            let SerialPort = require("serialport");
            this.port = new SerialPort(portName, { baudRate: baudRate, autoOpen: false });
            this.port.on("open", function () {
                that.debugInfo("Port connected");
            });
            this.port.on("error", function (err) {
                that.debugErr(err);
            });
            this.port.on("close", function () {
                that.debugInfo("Port closed");
                that.isConnected = false;
                that.setOutputData(0, that.isConnected);
            });
            this.port.on("disconnect", function (err) {
                that.debugErr("Port disconnected. " + err);
                that.isConnected = false;
                that.setOutputData(0, that.isConnected);
            });
            this.port.pipe(split()).on("data", that._readPortData.bind(this));
            this.debugInfo("Connecting to " + portName + " at " + baudRate + "...");
            this.port.open();
        }
        ;
        _readPortData(data) {
            let mess = data.split(";");
            if (mess.length < 5) {
                this.debugErr("Can`t parse message: " + data);
                return;
            }
            let message = {
                nodeId: +mess[0],
                sensorId: +mess[1],
                messageType: +mess[2],
                ack: +mess[3],
                subType: +mess[4],
                payload: mess[5]
            };
            if (message.messageType != 3
                || message.subType != 9
                || this.settings["debug"].value)
                this.debug("<   " + data);
            if (message.nodeId == GATEWAY_ID)
                this._receiveGatewayMessage(message);
            else
                this.receiveNodeMessage(message);
        }
        ;
        _receiveGatewayMessage(message) {
            switch (message.messageType) {
                case mys.messageType.C_INTERNAL:
                    switch (message.subType) {
                        case mys.internalDataType.I_GATEWAY_READY:
                            this.isConnected = true;
                            this.setOutputData(0, this.isConnected);
                            this.debugInfo("Gateway connected");
                            this.sendGetGatewayVersion();
                            break;
                        case mys.internalDataType.I_VERSION:
                            this.version = message.payload;
                            this.debug("Gateway version: " + message.payload);
                            break;
                    }
            }
        }
        ;
        sendGetGatewayVersion() {
            let message = {
                nodeId: GATEWAY_ID,
                sensorId: BROADCAST_ID,
                messageType: mys.messageType.C_INTERNAL,
                subType: mys.internalDataType.I_VERSION
            };
            this.sendMessage(message);
        }
        ;
        receiveNodeMessage(message) {
            if (message.nodeId != BROADCAST_ID) {
                let node = this.getNode(message.nodeId);
                node.lastSeen = Date.now();
            }
            switch (message.messageType) {
                case mys.messageType.C_PRESENTATION:
                    this.proceedPresentation(message);
                    break;
                case mys.messageType.C_SET:
                    this.proceedSet(message);
                    break;
                case mys.messageType.C_REQ:
                    this.proceedReq(message);
                    break;
                case mys.messageType.C_INTERNAL:
                    this.proceedInternal(message);
                    break;
            }
        }
        ;
        proceedPresentation(message) {
            if (message.sensorId == NODE_SELF_SENSOR_ID) {
                if (message.subType == mys.sensorType.S_ARDUINO_NODE ||
                    message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE) {
                    let node = this.getNode(message.nodeId);
                    let isRepeatingNode = message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE;
                    let version = message.payload;
                    if (node.isRepeatingNode !== isRepeatingNode
                        || node.version !== version) {
                        node.isRepeatingNode = isRepeatingNode;
                        node.version = version;
                        this.debug(`Node[${node.id}] version: [${version}]`);
                    }
                }
            }
            else {
                let sensor = this.getSensor(message.nodeId, message.sensorId);
                if (sensor.type !== message.subType) {
                    sensor.type = message.subType;
                    sensor.dataType = mys.getDefaultDataType(message.subType);
                    this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] presented: [${mys.sensorTypeKey[message.subType]}]`);
                    console.log(sensor.dataType);
                    let node = this.getNode(message.nodeId);
                }
            }
        }
        ;
        proceedSet(message) {
            let node = this.getNode(message.nodeId);
            let sensor = this.getSensor(message.nodeId, message.sensorId);
            sensor.state = message.payload;
            sensor.lastSeen = Date.now();
            if (sensor.dataType !== message.subType) {
                sensor.dataType = message.subType;
                this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] dataType updated: [${mys.sensorDataTypeKey[message.subType]}]`);
            }
            this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] updated: [${message.payload}]`);
            // this.emit("sensorUpdated", sensor, "state");
        }
        ;
        proceedReq(message) {
            let sensor = this.getSensorIfExist(message.nodeId, message.sensorId);
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
        }
        ;
        proceedInternal(message) {
            switch (message.subType) {
                case (mys.internalDataType.I_ID_REQUEST):
                    let id = this.getNewNodeId();
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
                    let n1 = this.getNode(message.nodeId);
                    if (n1.sketchName !== message.payload) {
                        n1.sketchName = message.payload;
                        this.debug(`Node[${message.nodeId}] sketch name: [${message.payload}]`);
                    }
                    break;
                case (mys.internalDataType.I_SKETCH_VERSION):
                    let n2 = this.getNode(message.nodeId);
                    if (n2.sketchVersion !== message.payload) {
                        n2.sketchVersion = message.payload;
                        this.debug(`Node[${message.nodeId}] sketch version: [${message.payload}]`);
                    }
                    break;
                case (mys.internalDataType.I_BATTERY_LEVEL):
                    let n3 = this.getNode(message.nodeId);
                    n3.batteryLevel = +message.payload;
                    this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] battery level: [${message.payload}]`);
                    // this.emit("nodeUpdated", n3, "batteryLevel");
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
                    this.sendMessage({
                        nodeId: message.nodeId,
                        sensorId: message.sensorId,
                        messageType: mys.messageType.C_INTERNAL,
                        subType: mys.internalDataType.I_TIME,
                        payload: Math.ceil(Date.now() / 1000)
                    });
                    break;
            }
        }
        ;
        sendMessage(message) {
            let arr = [
                message.nodeId,
                message.sensorId,
                message.messageType,
                message.ack || 0,
                message.subType,
                message.payload
            ];
            let mess = _.join(arr, ";");
            this.debug("  > " + mess);
            this.port.write(mess + "\n");
        }
        ;
        getNodeIfExist(nodeId) {
            return _.find(this.nodes, { 'id': nodeId });
        }
        ;
        getNode(nodeId) {
            let node = _.find(this.nodes, { 'id': nodeId });
            if (!node)
                node = this.registerNode(nodeId);
            return node;
        }
        ;
        getSensorIfExist(nodeId, sensorId) {
            let node = this.getNodeIfExist(nodeId);
            if (!node)
                return;
            return _.find(node.sensors, { 'id': sensorId });
        }
        ;
        getSensor(nodeId, sensorId) {
            let node = this.getNode(nodeId);
            let sensor = _.find(node.sensors, { 'sensorId': sensorId });
            if (!sensor)
                sensor = this.registerSensor(nodeId, sensorId);
            return sensor;
        }
        ;
        registerNode(nodeId) {
            let node = this.getNodeIfExist(nodeId);
            if (!node) {
                node = {
                    id: nodeId,
                    sensors: [],
                    registered: Date.now(),
                    lastSeen: Date.now()
                };
                this.nodes.push(node);
                this.debug(`Node [${nodeId}] registered`);
                //       this.emit("newNode", node);
                this.sub_container.createNode("protocols/mys-node", { mys_id: nodeId });
            }
            return node;
        }
        ;
        registerSensor(nodeId, sensorId) {
            let node = this.getNode(nodeId);
            let sensor = _.find(node.sensors, { 'sensorId': sensorId });
            if (!sensor) {
                sensor = {
                    nodeId: nodeId,
                    sensorId: sensorId,
                    lastSeen: Date.now()
                };
                node.sensors.push(sensor);
                this.debug(`Node[${nodeId}] Sensor[${sensorId}] registered.`);
            }
            return sensor;
        }
        ;
        getNewNodeId() {
            for (let i = 1; i < 255; i++) {
                let node = this.getNodeIfExist(i);
                if (!node)
                    return i;
            }
            this.debugErr('Can`t register new node. There are no available id.');
        }
        ;
    }
    exports.MySensorsController = MySensorsController;
    container_1.Container.registerNodeType("protocols/mys-controller", MySensorsController);
    class MySensorsNode extends node_1.Node {
        constructor() {
            super();
            this.title = "MYS node";
            this.descriprion = "MySensors node";
        }
        onInputUpdated() {
        }
    }
    container_1.Container.registerNodeType("protocols/mys-node", MySensorsNode, false);
});
//# sourceMappingURL=controller.js.map