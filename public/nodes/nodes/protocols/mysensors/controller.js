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
    let split;
    //let _;
    if (typeof (window) === 'undefined') {
        split = require("split");
    }
    let GATEWAY_ID = 0;
    let BROADCAST_ID = 255;
    let NODE_SELF_SENSOR_ID = 255;
    class MySensorsController extends main_1.ContainerNode {
        constructor(container) {
            super(container);
            this.nodes = {};
            this.isConnected = false;
            this.title = "MYS Controller";
            this.descriprion = 'MySensors protocol controller.';
            this.addInput("[connect]", "boolean");
            this.addOutput("connected", "boolean");
            this.settings["enable"] = { description: "Enable", value: false, type: "boolean" };
            this.settings["port"] = { description: "Serial port name", value: "/dev/tty.SLAB_USBtoUART", type: "string" };
            this.settings["baudRate"] = { description: "Baud rate", value: 115200, type: "number" };
            this.settings["debug"] = { description: "Show debug messages in console", value: false, type: "boolean" };
            // this.settings["unknown_nodes"] = {description: "Register unknown nodes (otherwise will register only when presentation)", value: true, type: "boolean"};
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
            this.port.pipe(split()).on("data", that.readPortData.bind(this));
            this.debugInfo("Connecting to " + portName + " at " + baudRate + "...");
            this.port.open();
        }
        ;
        readPortData(data) {
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
                this.receiveGatewayMessage(message);
            else
                this.receive_MYS_Message(message);
        }
        ;
        receiveGatewayMessage(message) {
            switch (message.messageType) {
                case mys.messageType.C_INTERNAL:
                    switch (message.subType) {
                        case mys.internalDataType.I_GATEWAY_READY:
                            this.isConnected = true;
                            this.setOutputData(0, this.isConnected);
                            this.debugInfo("Gateway connected");
                            //send get gateway version
                            let message = {
                                nodeId: GATEWAY_ID,
                                sensorId: BROADCAST_ID,
                                messageType: mys.messageType.C_INTERNAL,
                                subType: mys.internalDataType.I_VERSION
                            };
                            this.send_MYS_Message(message);
                            break;
                        case mys.internalDataType.I_VERSION:
                            this.version = message.payload;
                            this.debug("Gateway version: " + message.payload);
                            break;
                    }
            }
        }
        ;
        receive_MYS_Message(message) {
            if (message.nodeId != BROADCAST_ID) {
                let node = this.get_MYS_Node(message.nodeId);
                if (!node)
                    node = this.register_MYS_Node(message.nodeId);
                node.lastSeen = Date.now();
            }
            switch (message.messageType) {
                case mys.messageType.C_PRESENTATION:
                    this.receivePresentMessage(message);
                    break;
                case mys.messageType.C_SET:
                    this.receiveSetMessage(message);
                    break;
                case mys.messageType.C_REQ:
                    this.receiveReqMessage(message);
                    break;
                case mys.messageType.C_INTERNAL:
                    this.receiveInternalMessage(message);
                    break;
            }
        }
        ;
        receivePresentMessage(message) {
            if (message.sensorId == NODE_SELF_SENSOR_ID) {
                if (message.subType == mys.sensorType.S_ARDUINO_NODE ||
                    message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE) {
                    let node = this.get_MYS_Node(message.nodeId);
                    if (!node)
                        node = this.register_MYS_Node(message.nodeId);
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
                let sensor = this.get_MYS_Sensor(message.nodeId, message.sensorId);
                if (!sensor)
                    sensor = this.register_MYS_Sensor(message.nodeId, message.sensorId);
                if (sensor.type !== message.subType) {
                    sensor.type = message.subType;
                    sensor.dataType = mys.getDefaultDataType(message.subType);
                    this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] presented: [${mys.sensorTypeKey[message.subType]}]`);
                    let node = this.get_MYS_Node(message.nodeId);
                    if (!node)
                        node = this.register_MYS_Node(message.nodeId);
                }
            }
        }
        ;
        receiveSetMessage(message) {
            let node = this.get_MYS_Node(message.nodeId);
            if (!node)
                this.register_MYS_Node(message.nodeId);
            let sensor = this.get_MYS_Sensor(message.nodeId, message.sensorId);
            if (!sensor)
                sensor = this.register_MYS_Sensor(message.nodeId, message.sensorId);
            sensor.state = message.payload;
            sensor.lastSeen = Date.now();
            if (sensor.dataType !== message.subType) {
                sensor.dataType = message.subType;
                this.debug(`Node[${message.nodeId}] sensor[${message.sensorId}] data type updated: [${mys.sensorDataTypeKey[message.subType]}]`);
                //db update
                if (this.container.db)
                    this.container.db.updateNode(node.shub_node_id, node.shub_node_cid, {
                        $set: { mys_node: node }
                    });
            }
            this.debug(`Node[${message.nodeId}] sensor[${message.sensorId}] updated: [${message.payload}]`);
            // this.emit("sensorUpdated", sensor, "state");
            let shub_node = this.get_SHub_Node(node);
            shub_node.setOutputData(sensor.shub_node_slot, message.payload);
        }
        ;
        receiveReqMessage(message) {
            let sensor = this.get_MYS_Sensor(message.nodeId, message.sensorId);
            if (!sensor)
                return;
            this.send_MYS_Message({
                nodeId: message.nodeId,
                sensorId: message.sensorId,
                messageType: mys.messageType.C_SET,
                ack: 0,
                subType: sensor.type,
                payload: sensor.state
            });
        }
        ;
        receiveInternalMessage(message) {
            switch (message.subType) {
                case (mys.internalDataType.I_ID_REQUEST):
                    let id = this.getNew_MYS_NodeId();
                    if (!id)
                        return;
                    this.send_MYS_Message({
                        nodeId: BROADCAST_ID,
                        sensorId: BROADCAST_ID,
                        messageType: mys.messageType.C_INTERNAL,
                        subType: mys.internalDataType.I_ID_RESPONSE,
                        payload: "" + id
                    });
                    break;
                case (mys.internalDataType.I_SKETCH_NAME):
                    let n1 = this.get_MYS_Node(message.nodeId);
                    if (!n1)
                        n1 = this.register_MYS_Node(message.nodeId);
                    if (n1.sketchName !== message.payload) {
                        n1.sketchName = message.payload;
                        this.debug(`Node[${message.nodeId}] sketch name: [${message.payload}]`);
                    }
                    break;
                case (mys.internalDataType.I_SKETCH_VERSION):
                    let n2 = this.get_MYS_Node(message.nodeId);
                    if (!n2)
                        n2 = this.register_MYS_Node(message.nodeId);
                    if (n2.sketchVersion !== message.payload) {
                        n2.sketchVersion = message.payload;
                        this.debug(`Node[${message.nodeId}] sketch version: [${message.payload}]`);
                    }
                    break;
                case (mys.internalDataType.I_BATTERY_LEVEL):
                    let n3 = this.get_MYS_Node(message.nodeId);
                    if (!n3)
                        n3 = this.register_MYS_Node(message.nodeId);
                    n3.batteryLevel = +message.payload;
                    this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] battery level: [${message.payload}]`);
                    // this.emit("nodeUpdated", n3, "batteryLevel");
                    break;
                case (mys.internalDataType.I_CONFIG):
                    this.send_MYS_Message({
                        nodeId: message.nodeId,
                        sensorId: BROADCAST_ID,
                        messageType: mys.messageType.C_INTERNAL,
                        subType: mys.internalDataType.I_CONFIG,
                        payload: "M"
                    });
                    break;
                case (mys.internalDataType.I_TIME):
                    this.send_MYS_Message({
                        nodeId: message.nodeId,
                        sensorId: message.sensorId,
                        messageType: mys.messageType.C_INTERNAL,
                        subType: mys.internalDataType.I_TIME,
                        payload: "" + Math.ceil(Date.now() / 1000)
                    });
                    break;
            }
        }
        ;
        send_MYS_Message(message) {
            let arr = [
                message.nodeId,
                message.sensorId,
                message.messageType,
                message.ack || 0,
                message.subType,
                message.payload
            ];
            let mess = arr[0] + ";" + arr[1] + ";" + arr[2] + ";" + arr[3] + ";" + arr[4] + ";" + arr[5] + ";";
            this.debug("  > " + mess);
            this.port.write(mess + "\n");
        }
        ;
        get_MYS_Node(nodeId) {
            return this.nodes[nodeId];
        }
        ;
        get_MYS_Sensor(nodeId, sensorId) {
            if (!this.nodes[nodeId])
                return null;
            return this.nodes[nodeId].sensors[sensorId];
        }
        ;
        register_MYS_Node(nodeId) {
            if (this.nodes[nodeId]) {
                this.debugErr("Can't register node [" + nodeId + "]. Already exist");
                return;
            }
            let node = {
                id: nodeId,
                sensors: {},
                registered: Date.now(),
                lastSeen: Date.now()
            };
            this.nodes[nodeId] = node;
            this.debug(`Node [${nodeId}] registered`);
            //       this.emit("newNode", node);
            let shub_node = this.sub_container.createNode("protocols/mys-node", {
                mys_contr_node_id: this.id,
                mys_contr_node_cid: this.container.id,
                properties: { mys_node_id: nodeId }
            });
            node.shub_node_id = shub_node.id;
            node.shub_node_cid = shub_node.container.id;
            shub_node['mys_node'] = node;
            if (this.container.db)
                this.container.db.updateNode(shub_node.id, shub_node.container.id, {
                    $set: { mys_node: node }
                });
            return node;
        }
        ;
        register_MYS_Sensor(nodeId, sensorId) {
            let node = this.get_MYS_Node(nodeId);
            if (!node)
                node = this.register_MYS_Node(nodeId);
            let sensor = node.sensors[sensorId];
            if (sensor) {
                this.debugErr("Can't register node [" + nodeId + "] sensor [" + sensorId + "]. Already exist");
                return;
            }
            let shub_node = this.get_SHub_Node(node);
            //add input and output
            let i_id = shub_node.addInput("[sensor " + sensorId + "]");
            let o_id = shub_node.addOutput("sensor " + sensorId);
            if (i_id != o_id)
                throw "SingleHub node has different inputs and outputs slots count!";
            sensor = {
                nodeId: nodeId,
                sensorId: sensorId,
                lastSeen: Date.now(),
                shub_node_slot: i_id
            };
            node.sensors[sensorId] = sensor;
            this.debug(`Node[${nodeId}] sensor[${sensorId}] registered`);
            //        this.emit("newSensor", sensor);
            let s_shub_node = shub_node.serialize(true);
            if (this.container.db)
                this.container.db.updateNode(shub_node.id, shub_node.container.id, {
                    $set: { mys_node: node, inputs: s_shub_node.inputs, outputs: s_shub_node.outputs }
                });
            return sensor;
        }
        ;
        getNew_MYS_NodeId() {
            for (let i = 1; i < 255; i++) {
                let node = this.get_MYS_Node(i);
                if (!node)
                    return i;
            }
            this.debugErr('Can`t register new node. There are no available id.');
        }
        ;
        get_SHub_Node(node) {
            let shub_cont = container_1.Container.containers[node.shub_node_cid];
            if (!shub_cont)
                return null;
            return shub_cont._nodes[node.shub_node_id];
        }
    }
    exports.MySensorsController = MySensorsController;
    container_1.Container.registerNodeType("protocols/mys-controller", MySensorsController);
    class MySensorsNode extends node_1.Node {
        constructor() {
            super();
            // this.title = "MYS node";
            this.descriprion = "MySensors node";
        }
        onInputUpdated() {
            for (let i in this.inputs) {
                if (this.inputs[i].updated) {
                    let cont = container_1.Container.containers[this.mys_contr_node_cid];
                    if (!cont) {
                        this.debugErr("Can't send message. Controller node not found");
                        return;
                    }
                    let controller = cont._nodes[this.mys_contr_node_id];
                    if (!controller) {
                        this.debugErr("Can't send message. Controller node not found");
                        return;
                    }
                    let sensor = this.getSensorInSlot(+i);
                    if (!sensor) {
                        this.debugErr("Can't send message. Sensor not found");
                        return;
                    }
                    controller.send_MYS_Message({
                        nodeId: this.mys_node.id,
                        sensorId: sensor.sensorId,
                        messageType: mys.messageType.C_SET,
                        ack: 0,
                        subType: sensor.dataType,
                        payload: this.inputs[i].data
                    });
                }
            }
        }
        onAdded() {
            this.title = "MYS node " + this.properties['mys_node_id'];
        }
        getSensorInSlot(slot) {
            for (let s in this.mys_node.sensors) {
                let sensor = this.mys_node.sensors[s];
                if (sensor.shub_node_slot == slot)
                    return sensor;
            }
        }
    }
    container_1.Container.registerNodeType("protocols/mys-node", MySensorsNode, false);
});
//# sourceMappingURL=controller.js.map