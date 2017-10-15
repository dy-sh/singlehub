/**
 * Created by Derwish (derwish.pro@gmail.com) on 20.30.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../../../node";
import Utils from "../../../utils";
import { Container, Side } from "../../../container";
import * as mys from "./mys-types"
import { ContainerNode } from "../../main";
import { debug } from "util";
import { I_MYS_Node, I_MYS_Message, I_MYS_Sensor } from "./mys-types";
import { MySensorsNode, I_MYS_Node_Properties } from "./mys-node";
import * as split from "split";




let GATEWAY_ID = 0;
let BROADCAST_ID = 255;
let NODE_SELF_SENSOR_ID = 255;


export class MySensorsControllerNode extends ContainerNode {
    nodes: { [id: number]: I_MYS_Node } = {};
    isConnected = false;
    port;
    version;

    constructor(container) {
        super(container);
        this.title = "MYS Controller";
        this.descriprion = "MySensors protocol serial-gateway controller.<br><br>" +
            "You can use multiple MySensors serial/ethernet gateways at the same time. " +
            "Each gateway is a separate container. Nodes that the gateway detected are automatically added to the container.<br>" +
            "Click \"Open\" on this node to enter inside container and you will see registered MySensors nodes.<br><br>" +
            "To connect to the gateway, set port name and baud-rate in the node settings and check \"Enable\" checkbox (master switch). " +
            "Input pin \"Enable\" is optional and will not work if node is not enabled in the settings (using Enable checkbox).";
        this.addInput("[connect]", "boolean");
        this.addOutput("connected", "boolean");


        this.settings["enable"] = { description: "Enable", value: false, type: "boolean" };
        this.settings["port"] = { description: "Serial port name", value: "/dev/tty.SLAB_USBtoUART", type: "string" };
        this.settings["baudRate"] = { description: "Baud rate", value: 115200, type: "number" };
        this.settings["debug"] = { description: "Show debug messages in console", value: false, type: "boolean" };
        // this.settings["unknown_nodes"] = {description: "Register unknown nodes (otherwise will register only when presentation)", value: true, type: "boolean"};

    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server) {
            this.setOutputData(0, false);

            // connect if "connect" input disconnected or input data==true
            if (this.settings["enable"].value
                && (this.inputs[0].link == null || this.inputs[0].data == true))
                this.connectToSerialPort();
        }
    }

    changeTitle() {
        this.title = "MYS: " + this.settings["name"].value;
        this.size = this.computeSize();
        this.sub_container.name = this.title;

        // if (this.container.db)
        //     this.container.db.updateNode(this.id,this.container.id,{$set:{}})
        // if (this.side==Side.server)
    }

    onRemoved() {
        if (this.side == Side.server) {
            if (this.port)
                this.port.close();
        }

        super.onRemoved();
    }

    onAfterSettingsChange(oldSettings) {
        super.onAfterSettingsChange(oldSettings);


        if (this.side == Side.server) {
            if (!this.settings["enable"].value)
                this.disconnectFromGateway();
            else if (this.inputs[0].data != false && (!this.isConnected || !this.port || this.port.path != this.settings["port"].value || this.port.baudRate != this.settings["baudRate"].value)) {
                this.disconnectFromGateway();
                this.connetToGateway();
            }
        }
    }

    onInputUpdated() {
        if (this.inputs[0].updated && this.settings["enable"].value) {
            if (this.inputs[0].data != false)
                this.connetToGateway();
            else
                this.disconnectFromGateway();
        }
    }

    connetToGateway() {
        this.connectToSerialPort();
    }

    disconnectFromGateway() {
        if (this.port)
            this.port.close();
    }

    connectToSerialPort() {
        let portName = this.settings["port"].value;
        let baudRate = this.settings["baudRate"].value;

        if (!portName) {
            this.debugErr("Port name is not defined!");
            return;
        }


        let SerialPort = require("serialport");
        this.port = new SerialPort(portName, { baudRate: baudRate, autoOpen: false });

        this.port.on("open", () => {
            this.debugInfo("Port connected");
        });

        this.port.on("error", (err) => {
            this.debugErr(err);
        });

        this.port.on("close", () => {
            this.debugInfo(this.isConnected ? "Port closed. Gatewey disconnected." : "Port closed");
            this.isConnected = false;
            this.setOutputData(0, this.isConnected);
        });

        this.port.on("disconnect", (err) => {
            this.debugInfo(this.isConnected ? "Port disconnected. Gatewey disconnected." : "Port disconnected");
            this.isConnected = false;
            this.setOutputData(0, this.isConnected);
        });

        const Readline = SerialPort.parsers.Readline;
        const parser = this.port.pipe(new Readline({ delimiter: '\n' }));
        parser.on('data', (data) => this.readPortData(data));

        this.debugInfo("Connecting to " + portName + " at " + baudRate + "...");
        this.port.open();
    };


    readPortData(data: string) {
        let mess = data.split(";");
        if (mess.length < 5) {
            this.debugErr("Can`t parse message: " + data);
            return;
        }

        let message: I_MYS_Message = {
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

        try {
            if (message.nodeId == GATEWAY_ID)
                this.receiveGatewayMessage(message);
            else
                this.receive_MYS_Message(message);
        } catch (e) {
            console.log(e);
        }
    };


    receiveGatewayMessage(message: I_MYS_Message) {
        if (message.messageType == mys.messageType.C_INTERNAL) {
            if (message.subType == mys.internalDataType.I_GATEWAY_READY) {
                this.isConnected = true;
                this.setOutputData(0, this.isConnected);
                this.debugInfo("Gateway connected");

                //send get gateway version
                let message: I_MYS_Message = {
                    nodeId: GATEWAY_ID,
                    sensorId: BROADCAST_ID,
                    messageType: mys.messageType.C_INTERNAL,
                    subType: mys.internalDataType.I_VERSION
                };
                this.send_MYS_Message(message);
            }

            else if (message.subType == mys.internalDataType.I_VERSION) {
                this.version = message.payload;
                this.debug("Gateway version: " + message.payload);

                //db update
                if (this.container.db)
                    this.container.db.updateNode(this.id, this.container.id, {
                        $set: { version: this.version }
                    });
            }
        }

    };


    receive_MYS_Message(message: I_MYS_Message) {
        if (message.nodeId != BROADCAST_ID) {
            let node = this.get_MYS_Node(message.nodeId);
            if (!node) node = this.register_MYS_Node(message.nodeId);
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
    };


    receivePresentMessage(message: I_MYS_Message) {
        if (message.sensorId == NODE_SELF_SENSOR_ID) {
            if (message.subType == mys.sensorType.S_ARDUINO_NODE ||
                message.subType == mys.sensorType.S_ARDUINO_REPEATER_NODE
            ) {
                let node = this.get_MYS_Node(message.nodeId);
                if (!node) node = this.register_MYS_Node(message.nodeId);
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

            //presentstion

            this.debug(`Node[${message.nodeId}] Sensor[${message.sensorId}] presented: [${mys.sensorTypeKey[message.subType]}]`);

            //register supported types
            let supportedTypes: [number] = mys.getSensorDataTypes(message.subType);
            if (supportedTypes) {
                supportedTypes.forEach(type => {
                    let node = this.get_MYS_Node(message.nodeId);
                    if (!node) node = this.register_MYS_Node(message.nodeId);

                    let sensor = this.get_MYS_Sensor(message.nodeId, message.sensorId, type);
                    if (!sensor) sensor = this.register_MYS_Sensor(message.nodeId, message.sensorId, type, message.subType);

                    //update sensor type
                    if (sensor.type != message.subType) {
                        sensor.type = message.subType;
                        // let shub_node = this.get_SHub_Node(node);
                        if (this.container.db)
                            this.container.db.updateNode(node.shub_node_id, node.shub_node_cid, {
                                $set: { "properties.mys_node": node }
                            });
                    }
                    // this.emit("sensorUpdated", sensor, "type");
                });
            }
        }
    };


    receiveSetMessage(message: I_MYS_Message) {
        let node = this.get_MYS_Node(message.nodeId);
        if (!node) this.register_MYS_Node(message.nodeId);

        let sensor = this.get_MYS_Sensor(message.nodeId, message.sensorId, message.subType);
        if (!sensor) sensor = this.register_MYS_Sensor(message.nodeId, message.sensorId, message.subType);

        sensor.state = message.payload;
        sensor.lastSeen = Date.now();

        if (sensor.dataType !== message.subType) {
            sensor.dataType = message.subType;
            this.debug(`Node[${message.nodeId}] sensor[${message.sensorId}] data type updated: [${mys.sensorDataTypeKey[message.subType]}]`);

            //db update
            if (this.container.db)
                this.container.db.updateNode(node.shub_node_id, node.shub_node_cid, {
                    $set: { "properties.mys_node": node }
                });

            // this.emit("sensorUpdated", sensor, "type");
        }

        this.debug(`Node[${message.nodeId}] sensor[${message.sensorId}] updated: [${message.payload}]`);
        // this.emit("sensorUpdated", sensor, "state");

        let shub_node = this.get_SHub_Node(node);
        shub_node.setOutputData(sensor.shub_node_slot, message.payload);
    };


    receiveReqMessage(message: I_MYS_Message) {
        let sensor = this.get_MYS_Sensor(message.nodeId, message.sensorId, message.subType);
        if (!sensor)
            return;

        this.send_MYS_Message({
            nodeId: message.nodeId,
            sensorId: message.sensorId,
            messageType: mys.messageType.C_SET,
            ack: 0,
            subType: sensor.dataType,
            payload: sensor.state
        });
    };


    receiveInternalMessage(message: I_MYS_Message) {
        switch (message.subType) {

            case (mys.internalDataType.I_ID_REQUEST):
                let id = this.getNew_MYS_NodeId();
                if (!id) return;
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
                if (!n1) n1 = this.register_MYS_Node(message.nodeId);
                if (n1.sketchName !== message.payload) {
                    n1.sketchName = message.payload;
                    this.debug(`Node[${message.nodeId}] sketch name: [${message.payload}]`);
                    // this.emit("nodeUpdated", n1, "sketchName");
                }
                break;

            case (mys.internalDataType.I_SKETCH_VERSION):
                let n2 = this.get_MYS_Node(message.nodeId);
                if (!n2) n2 = this.register_MYS_Node(message.nodeId);
                if (n2.sketchVersion !== message.payload) {
                    n2.sketchVersion = message.payload;
                    this.debug(`Node[${message.nodeId}] sketch version: [${message.payload}]`);
                    // this.emit("nodeUpdated", n2, "sketchVersion");
                }
                break;

            case (mys.internalDataType.I_BATTERY_LEVEL):
                let n3 = this.get_MYS_Node(message.nodeId);
                if (!n3) n3 = this.register_MYS_Node(message.nodeId);
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
    };


    send_MYS_Message(message: I_MYS_Message) {
        let arr = [
            message.nodeId,
            message.sensorId,
            message.messageType,
            message.ack || 0,
            message.subType,
            message.payload
        ];

        let mess =
            arr[0] + ";" + arr[1] + ";" + arr[2] + ";" + arr[3] + ";" + arr[4] + ";" + arr[5] + ";";

        this.debug("  > " + mess);
        try {
            this.port.write(mess + "\n");
        }
        catch (e) {
            console.log(e);
        }
    };


    get_MYS_Node(nodeId: number): I_MYS_Node {
        return this.nodes[nodeId];
    };

    get_MYS_Sensor(nodeId: number, sensorId: number, dataType: number): I_MYS_Sensor {
        if (!this.nodes[nodeId])
            return null;

        return this.nodes[nodeId].sensors[sensorId + "-" + dataType];
    };

    // add_MYS_Node(node: I_MYS_Node) {
    //     this.nodes[node.id] = node;
    //     this.debug(`Node [${node.id}] added`);
    // };


    register_MYS_Node(nodeId: number): I_MYS_Node {
        if (this.nodes[nodeId]) {
            this.debugErr("Can't register node [" + nodeId + "]. Already exist");
            return;
        }

        let node: I_MYS_Node = {
            id: nodeId,
            sensors: {},
            registered: Date.now(),
            lastSeen: Date.now()
        };

        this.nodes[nodeId] = node;
        this.debug(`Node [${nodeId}] registered`);
        //       this.emit("newNode", node);

        let properties: I_MYS_Node_Properties = {
            mys_node_id: nodeId,
            mys_contr_node_id: this.id,
            mys_contr_node_cid: this.container.id,
            mys_node: node
        };

        let shub_node = this.sub_container.createNode("protocols/mys-node", {
            properties: properties,
            pos: this.sub_container.findFreeSpaceForNode([50, 50], [180, 100])
        });

        node.shub_node_id = shub_node.id;
        node.shub_node_cid = shub_node.container.id;
        shub_node['mys_node'] = node;

        //db update
        if (this.container.db)
            this.container.db.updateNode(shub_node.id, shub_node.container.id, {
                $set: { "properties.mys_node": node }
            });


        // //db update
        // if (this.container.db)
        //     this.container.db.updateNode(this.id, this.container.id, {
        //         $set: { nodes: this.nodes }
        //     });

        //send message to client side
        this.container.server_editor_socket.emit('node-create', {
            id: shub_node.id,
            cid: shub_node.container.id,
            type: shub_node.type,
            pos: shub_node.pos,
            properties: { mys_node_id: nodeId }
        });

        return node;
    };


    register_MYS_Sensor(nodeId: number, sensorId: number, dataType: number, sensorType: number = null): I_MYS_Sensor {
        let node = this.get_MYS_Node(nodeId);
        if (!node) node = this.register_MYS_Node(nodeId);

        let sensor = this.get_MYS_Sensor(nodeId, sensorId, dataType);
        if (sensor) {
            this.debugErr("Can't register node [" + nodeId + "] sensor [" + sensorId + "] datatype [" + dataType + "]. Already exist");
            return;
        }

        let shub_node = this.get_SHub_Node(node);

        let free_slot = shub_node.getFreeInputId();
        let inputName = (free_slot + 1) + " - sensor" + sensorId + " (" + mys.sensorDataTypeKey[dataType] + ")";
        let outputName = (free_slot + 1) + "";

        //add input and output
        let i_id = shub_node.addInput(inputName);
        let o_id = shub_node.addOutput(outputName);
        if (i_id != o_id)
            throw "SingleHub node has different inputs and outputs slots count!";

        //send to eitor side for add input\output
        shub_node.sendAddInputToEditorSide(inputName);
        shub_node.sendAddOutputToEditorSide(outputName);

        sensor = {
            nodeId: nodeId,
            sensorId: sensorId,
            dataType: dataType,
            lastSeen: Date.now(),
            shub_node_slot: i_id
        };

        if (sensorType != null)
            sensor.type = sensorType;

        node.sensors[sensorId + "-" + dataType] = sensor;

        this.debug(`Node[${nodeId}] sensor[${sensorId}] type[${dataType}] registered`);
        //        this.emit("newSensor", sensor);

        let s_shub_node = shub_node.serialize(true);
        if (this.container.db)
            this.container.db.updateNode(shub_node.id, shub_node.container.id, {
                $set: { "properties.mys_node": node, inputs: s_shub_node.inputs, outputs: s_shub_node.outputs }
            });

        shub_node.sendMessageToEditorSide({ mys_node: node });


        return sensor;
    };


    remove_MYS_Node(nodeId: number, remove_SHUB_Node = true) {
        let node = this.nodes[nodeId];
        if (!node) {
            this.debugErr("Can't remove node [" + nodeId + "]. Does not exist");
            return;
        }

        if (remove_SHUB_Node) {
            let shub_node = this.get_SHub_Node(node);
            this.sub_container.remove(shub_node);
        }

        delete this.nodes[nodeId];

        this.debug(`Node [${nodeId}] removed`);
    };


    remove_MYS_Sensor(nodeId: number, sensorId: number, dataType: number) {
        let node = this.get_MYS_Node(nodeId);
        if (!node) {
            this.debugErr("Can't remove node [" + nodeId + "] sensor [" + sensorId + "]. Node does not exist");
            return;
        }

        let sensor = this.get_MYS_Sensor(nodeId, sensorId, dataType);
        if (!sensor) {
            this.debugErr("Can't remove node [" + nodeId + "] sensor [" + sensorId + "]. Sensor does not exist");
            return;
        }

        let shub_node = this.get_SHub_Node(node);

        //remove sensor
        delete node.sensors[sensorId + "-" + dataType];

        //remove input and output
        shub_node.removeInput(sensor.shub_node_slot);
        shub_node.removeOutput(sensor.shub_node_slot);

        //send to eitor side for remove input\output
        shub_node.sendRemoveInputToEditorSide(sensor.shub_node_slot);
        shub_node.sendRemoveOutputToEditorSide(sensor.shub_node_slot);

        this.debug(`Node[${nodeId}] sensor[${sensorId}] removed`);

        let s_shub_node = shub_node.serialize(true);
        if (this.container.db)
            this.container.db.updateNode(shub_node.id, shub_node.container.id, {
                $set: { "properties.mys_node": node, inputs: s_shub_node.inputs, outputs: s_shub_node.outputs }
            });
    };



    getNew_MYS_NodeId(): number {
        for (let i = 1; i < 255; i++) {
            let node = this.get_MYS_Node(i);
            if (!node)
                return i;
        }

        this.debugErr('Can`t register new node. There are no available id.');
    };


    get_SHub_Node(node: I_MYS_Node): MySensorsNode {
        let shub_cont = Container.containers[node.shub_node_cid];
        if (!shub_cont)
            return null;

        return <MySensorsNode>shub_cont._nodes[node.shub_node_id];
    }

}
Container.registerNodeType("protocols/mys-controller", MySensorsControllerNode);
