import { Node } from "../../../node";
import Utils from "../../../utils";
import { Container, Side } from "../../../container";
import * as mys from "./mys-types"
import { ContainerNode } from "../../main";
import { debug } from "util";
import { I_MYS_Node, I_MYS_Sensor } from "./mys-types";
import { MySensorsControllerNode } from "./mys-controller";
import { Editor } from "../../../../js/editor/editor";
import { Renderer } from "../../../../js/editor/renderer";


// <div class="field">
//     <label>Node Type</label>
//     <input id="node-panel-nodetype" type="text" name="first-name" value="Unknown">
// </div>

let nodeConfigureTemplate = `

    <div class="ui small modal" id="node-panel-modal">
      <div class="header" id="node-panel-title"></div>
      <div class="content">
        <div class="ui form" id="node-panel-body">
            <div class="field">
                Last seen: <span id="node-panel-lastseen"></span>
            </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui cancel button">Cancel</div>
        <div class="ui ok blue button">OK</div>
      </div>
    </div>
`;

export interface I_MYS_Node_Properties {
    mys_node_id: number,
    mys_contr_node_id: number,
    mys_contr_node_cid: number,
    mys_node: I_MYS_Node
}

export class MySensorsNode extends Node {
    properties: I_MYS_Node_Properties;

    constructor() {
        super();

        // this.title = "MYS node";
        this.descriprion = "MySensors node";
        this.settings["send-true"] = {
            description: "Send 1/0 instead of true/false", value: true, type: "boolean"
        };

        this.contextMenu["configure"] = { title: "Configure", onClick: this.onConfigureClick }
    }

    onConfigureClick(node: MySensorsNode, editor: Editor, renderer: Renderer) {

        let mys_node = node.properties.mys_node;

        //clear old body
        let body = $('#node-panel');
        body.empty();

        body.append(nodeConfigureTemplate);
        $('#node-panel-title').html("MySensors Node " + node.properties.mys_node_id);
        let lastSeen = moment(mys_node.lastSeen).format("DD/MM/YYYY HH:mm:ss");
        $("#node-panel-lastseen").html(lastSeen);

        //modal panel
        (<any>$('#node-panel-modal')).modal({
            dimmerSettings: { opacity: 0.3 },
            onApprove: function () {


            }
        }).modal('setting', 'transition', 'fade up').modal('show');
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

                if (!controller.isConnected)
                    return;

                let val = this.inputs[i].data;

                //conver boolean
                if (typeof val == "boolean" && this.settings["send-true"].value)
                    val = val ? 1 : 0;

                controller.send_MYS_Message({
                    nodeId: this.properties.mys_node.id,
                    sensorId: sensor.sensorId,
                    messageType: mys.messageType.C_SET,
                    ack: 0,
                    subType: sensor.dataType,
                    payload: val
                })

            }
        }
    }

    getControllerNode(): MySensorsControllerNode {
        let cont = Container.containers[this.properties.mys_contr_node_cid];
        if (cont) {
            return <MySensorsControllerNode>cont._nodes[this.properties.mys_contr_node_id];
        }
    }

    onAdded() {
        this.title = "MYS node " + this.properties.mys_node_id;
    }

    onDbReaded() {
        //add this MYS_Node to controller node
        this.getControllerNode()
            .nodes[this.properties.mys_node.id] = this.properties.mys_node;
        this.debug(`Node [${this.properties.mys_node.id}] restored`);
    }

    onRemoved() {
        if (this.side == Side.server) {
            let controller = this.getControllerNode();
            controller.remove_MYS_Node(this.properties.mys_node.id, false);
        }
    }

    getSensorInSlot(slot: number): I_MYS_Sensor {
        for (let s in this.properties.mys_node.sensors) {
            let sensor = this.properties.mys_node.sensors[s];
            if (sensor.shub_node_slot == slot)
                return sensor;
        }
    }
}
Container.registerNodeType("protocols/mys-node", MySensorsNode);
