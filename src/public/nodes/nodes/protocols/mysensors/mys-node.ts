import { Node } from "../../../node";
import Utils from "../../../utils";
import { Container, Side } from "../../../container";
import * as mys from "./mys-types"
import { ContainerNode } from "../../main";
import { debug } from "util";
import { I_MYS_Node, I_MYS_Sensor } from "./mys-types";
import { MySensorsControllerNode } from "./mys-controller";


export class MySensorsNode extends Node {
    mys_node: I_MYS_Node;
    mys_contr_node_id: number;
    mys_contr_node_cid: number;

    constructor() {
        super();

        // this.title = "MYS node";
        this.descriprion = "MySensors node";
    }


    onInputUpdated() {
        for (let i in this.inputs) {
            if (this.inputs[i].updated) {
                let controller = this.getControllerNode();
                if (!controller) {
                    this.debugErr("Can't send message. Controller not found");
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
                })

            }
        }
    }

    getControllerNode(): MySensorsControllerNode {
        let cont = Container.containers[this.mys_contr_node_cid];
        if (cont) {
            return <MySensorsControllerNode>cont._nodes[this.mys_contr_node_id];
        }
    }

    onAdded() {
        this.title = "MYS node " + this.properties['mys_node_id'];
    }

    onDbReaded() {
        //add this MYS_Node to controller node
        this.getControllerNode().nodes[this.mys_node.id] = this.mys_node;
        this.debug(`Node [${this.mys_node.id}] restored`);
    }

    onRemoved() {
        if (this.side == Side.server) {
            let controller = this.getControllerNode();
            controller.remove_MYS_Node(this.mys_node.id, false);
        }
    }

    getSensorInSlot(slot: number): I_MYS_Sensor {
        for (let s in this.mys_node.sensors) {
            let sensor = this.mys_node.sensors[s];
            if (sensor.shub_node_slot == slot)
                return sensor;
        }
    }
}
Container.registerNodeType("protocols/mys-node", MySensorsNode, false);
