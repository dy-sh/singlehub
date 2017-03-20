/**
 * Created by Derwish (derwish.pro@gmail.com) on 20.30.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {Node} from "../../../node";
import Utils from "../../../utils";
import {Container, Side} from "../../../container";
import * as mys from "./types"


let split, _;
if (typeof (window) === 'undefined') { //for backside only
    split = require("split");
    _ = require("lodash");
}


let GATEWAY_ID = 0;
let BROADCAST_ID = 255;
let NODE_SELF_SENSOR_ID = 255;


export class MySensorsController extends Node {
    nodes = [];
    isConnected = false;
    port;
    version;

    constructor() {
        super();
        this.title = "MYS Controller";
        this.descriprion = '';
        this.addInput("[connect]", "boolean");
        this.addOutput("connected", "boolean");


        this.settings["enable"] = {description: "Enable", value: false, type: "boolean"};
        this.settings["port"] = {description: "Serial port name", value: "/dev/tty.SLAB_USBtoUART", type: "string"};
        this.settings["baudRate"] = {description: "Baud rate", value: 115200, type: "number"};

    }

    onSettingsChanged() {
        if (this.side == Side.server) {
            if (this.port)
                this.port.close();

            let port = this.settings["port"].value;
            let baudRate = this.settings["baudRate"].value;

            if (this.settings["enable"].value)
                this.connectToSerialPort(port, baudRate);
        }
    }


    connectToSerialPort(portName: string, baudRate = 115200) {
        if (!portName) throw Error("portName is not defined!");

        let that=this;

        let SerialPort = require("serialport");
        this.port = new SerialPort(portName, {baudRate: baudRate, autoOpen: false});

        this.port.on("open", function () {
            that.debug("Port connected");
        });

        this.port.on("error", function (err) {
            that.debugErr(err);
        });

        this.port.on("close", function () {
            that.debug("Port closed");
        });

        this.port.on("disconnect", function (err) {
            that.debug("Port disconnected. " + err);
        });

        this.port.pipe(split()).on("data", that._readPortData.bind(this));

        this.debug("Connecting to " + portName + " at " + baudRate + " ...");
        this.port.open();
    };


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

        //log message
        if (message.messageType == mys.messageType.C_INTERNAL
            && message.subType == mys.internalDataType.I_LOG_MESSAGE)
            this.debug("<   " + data);
        else
            this.debug("<   " + data);

        if (message.nodeId == GATEWAY_ID)
            this._receiveGatewayMessage(message);
        else
            this._receiveNodeMessage(message);
    };


    _receiveGatewayMessage(message) {

        switch (message.messageType) {
            case mys.messageType.C_INTERNAL:
                switch (message.subType) {

                    case mys.internalDataType.I_GATEWAY_READY:
                        this.isConnected = true;
                        this.debug("Gateway connected.");
                        this.sendGetGatewayVersion();
                        break;

                    case mys.internalDataType.I_VERSION:
                        this.version = message.payload;
                        this.debug("Gateway version: " + message.payload);
                        break;
                }
        }
    };


    sendGetGatewayVersion() {
        this.sendMessage({
            nodeId: GATEWAY_ID,
            sensorId: BROADCAST_ID,
            messageType: mys.messageType.C_INTERNAL,
            subType: mys.internalDataType.I_VERSION
        });
    };

    _receiveNodeMessage(message) {


        if (message.nodeId != BROADCAST_ID) {
            let node = this.getNode(message.nodeId);
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


    _proceedPresentation(message) {
        if (message.sensorId == NODE_SELF_SENSOR_ID) {
            if (message.subType == mys.sensorType.S_ARDUINO_NODE ||
                message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE
            ) {
                let node = this.getNode(message.nodeId);
                let isRepeatingNode = message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE;
                let version = message.payload;

                if (node.isRepeatingNode !== isRepeatingNode
                    || node.version !== version
                ) {
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
                // this.emit("sensorUpdated", sensor, "type");
            }
        }
    };


    _proceedSet(message) {
        let node = this.getNode(message.nodeId);
        let sensor = this.getSensor(message.nodeId, message.sensorId);

        sensor.state = message.payload;
        sensor.lastSeen = Date.now();

        if (sensor.dataType !== message.subType) {
            sensor.dataType = message.subType;
            this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] dataType updated: [${mys.sensorDataTypeKey[message.subType]}]`);
            // this.emit("sensorUpdated", sensor, "type");
        }

        this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] updated: [${message.payload}]`);
        // this.emit("sensorUpdated", sensor, "state");

    };


    _proceedReq(message) {
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
    };


    _proceedInternal(message) {
        switch (message.subType) {

            case (mys.internalDataType.I_ID_REQUEST):
                let id = this._getNewNodeId();
                if (!id) return;
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
                    // this.emit("nodeUpdated", n1, "sketchName");
                }
                break;

            case ( mys.internalDataType.I_SKETCH_VERSION):
                let n2 = this.getNode(message.nodeId);
                if (n2.sketchVersion !== message.payload) {
                    n2.sketchVersion = message.payload;
                    this.debug(`Node[${message.nodeId}] sketch version: [${message.payload}]`);
                    // this.emit("nodeUpdated", n2, "sketchVersion");
                }
                break;

            case ( mys.internalDataType.I_BATTERY_LEVEL):
                let n3 = this.getNode(message.nodeId);
                n3.batteryLevel = +message.payload;
                this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] battery level: [${message.payload}]`);
                // this.emit("nodeUpdated", n3, "batteryLevel");
                break;

            case ( mys.internalDataType.I_CONFIG):
                this.sendMessage({
                    nodeId: message.nodeId,
                    sensorId: BROADCAST_ID,
                    messageType: mys.messageType.C_INTERNAL,
                    subType: mys.internalDataType.I_CONFIG,
                    payload: "M"
                });
                break;

            case ( mys.internalDataType.I_TIME):
                this.sendMessage({
                    nodeId: message.nodeId,
                    sensorId: message.sensorId,
                    messageType: mys.messageType.C_INTERNAL,
                    subType: mys.internalDataType.I_TIME,
                    payload: Math.ceil(Date.now() / 1000)
                });
                break;
        }
    };


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
    };


    getNodeIfExist = function (nodeId) {
        return _.find(this.nodes, {'id': nodeId});
    };

    getNode = function (nodeId) {
        let node = _.find(this.nodes, {'id': nodeId});
        if (!node) node = this._registerNode(nodeId);
        return node;
    };


    getSensorIfExist = function (nodeId, sensorId) {
        let node = this.getNodeIfExist(nodeId);
        if (!node) return;

        return _.find(node.sensors, {'id': sensorId});
    };

    getSensor = function (nodeId, sensorId) {
        let node = this.getNode(nodeId);

        let sensor = _.find(node.sensors, {'sensorId': sensorId});
        if (!sensor) sensor = this._registerSensor(nodeId, sensorId);

        return sensor;
    };


    _registerNode = function (nodeId) {
        let node = this.getNodeIfExist(nodeId);

        if (!node) {
            node = {
                id: nodeId,
                sensors: [],
                registered: Date.now(),
                lastSeen: Date.now()
            };

            this.nodes.push(node);
            this.debug(`Node[${nodeId}] registered.`);
            this.emit("newNode", node);
        }
        return node;
    };


    _registerSensor = function (nodeId, sensorId) {
        let node = this.getNode(nodeId);

        let sensor = _.find(node.sensors, {'sensorId': sensorId});
        if (!sensor) {
            sensor = {
                nodeId: nodeId,
                sensorId: sensorId,
                lastSeen: Date.now()
            };

            node.sensors.push(sensor);
            this.debug(`Node[${nodeId}] Sensor[${sensorId}] registered.`);
            this.emit("newSensor", sensor);
        }

        return sensor;
    };


    _getNewNodeId = function () {
        for (let i = 1; i < 255; i++) {
            let node = this.getNodeIfExist(i);
            if (!node)
                return i;
        }

        this.debugErr('Can`t register new node. There are no available id.');
    };

}
Container.registerNodeType("protocols/mys-controller", MySensorsController);
