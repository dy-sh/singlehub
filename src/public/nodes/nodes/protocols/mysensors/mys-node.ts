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
//     <input id="mys-panel-nodetype" type="text" name="first-name" value="Unknown">
// </div>





export interface I_MYS_Node_Properties {
    mys_node_id: number,
    mys_contr_node_id: number,
    mys_contr_node_cid: number,
    mys_node: I_MYS_Node
}

export class MySensorsNode extends Node {
    properties: I_MYS_Node_Properties;

    private slots: number[];

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

        node.slots = [];
        for (let key in node.inputs)
            node.slots.push(+key);


        let mys_node = node.properties.mys_node;


        if (!$('#mys-panel-modal').length) {
            //create modal panel
            let body = $('#node-panel');
            body.append(' <div class="ui small modal" id="mys-panel-modal"> </div>');
        }

        let panel = $('#mys-panel-modal');
        panel.empty();

        panel.append(`
      <div class="header" id="mys-panel-title"></div>
      <div class="content">
        <div class="ui form" id="mys-panel-form">
            <div class="field">
                Sketch: <span id="mys-panel-sketch"></span>
            </div>
             <div class="field">
                Last seen: <span id="mys-panel-lastseen"></span>
            </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui cancel button">Cancel</div>
        <div class="ui ok blue button">OK</div>
      </div>
`);

        //title
        $('#mys-panel-title').html("MySensors Node " + node.properties.mys_node_id);

        //last seen
        let lastSeen = moment(mys_node.lastSeen).format("DD/MM/YYYY HH:mm:ss");
        $("#mys-panel-lastseen").html(lastSeen);

        //sketch
        $("#mys-panel-sketch").html(mys_node.sketchName + " " + mys_node.sketchVersion);

        let form = $('#mys-panel-form');

        form.append(`
    <div class="field">
      <label></label>
      <button id="mys-panel-addsensor" class="ui button">Add Sensor</button>
    </div>
        `);

        //add new sensor
        $('#mys-panel-addsensor').click(function () {
            let sensor: I_MYS_Sensor = {
                nodeId: mys_node.id,
                sensorId: 0,
                type: null,
                dataType: 0
            }

            let newId = node.slots.length == 0 ? 0 : node.slots[node.slots.length - 1] + 1;
            node.slots.push(newId);
            node.addSensorToForm(newId, sensor);
        });

        //sensors
        for (let s in mys_node.sensors) {
            let sensor = mys_node.sensors[s];
            let slot = sensor.shub_node_slot;

            node.addSensorToForm(slot, sensor);
        }

        //open modal
        (<any>$('#mys-panel-modal')).modal({
            dimmerSettings: { opacity: 0.3 },
            onApprove: function () {
                let slots = [];


                let i = 0;
                for (let s of node.slots) {
                    slots.push({
                        slot: i++,
                        id: $('#mys-panel-sonsor-id' + s).val(),
                        type: $('#mys-panel-sonsor-type' + s).val(),
                        datatype: $('#mys-panel-sonsor-datatype' + s).val(),
                    })
                }

                node.sendMessageToServerSide({
                    slots: slots
                });
            }
        }).modal('setting', 'transition', 'fade up').modal('show');

    }


    addSensorToForm(slot, sensor) {

        let form = $('#mys-panel-form');


        let dataType = sensor.dataType;
        let sensorType = sensor.type != null ? sensor.type : "";
        // let dataType = mys.sensorDataTypeKey[sensor.dataType];
        // let sensorType = mys.sensorTypeKey[sensor.type];

        form.append(`
  <div id="mys-panel-sensor`+ slot + `" class="fields">
    <div class="three wide field">
       <label>Sensor ID</label>
       <input type="text" id="mys-panel-sonsor-id`+ slot + `" name="mys-panel-sonsor-id` + slot + `" value="` + sensor.sensorId + `"> 
    </div>
    <div class="seven wide field">
       <label>Type</label>
       <input type="text" id="mys-panel-sonsor-type`+ slot + `" name="mys-panel-sonsor-type` + slot + `" value="` + sensorType + `"> 
    </div>
    <div class="seven wide field">
       <label>Data Type</label>
       <input type="text" id="mys-panel-sonsor-datatype`+ slot + `" name="mys-panel-sonsor-datatype` + slot + `" value="` + dataType + `"> 
    </div>
    <div class="three wide field">
      <label>Remove</label>
      <button id="mys-panel-remove-sensor`+ slot + `" class="ui button">X</button>
    </div>
  </div>  
`);

        let that = this;

        $("#mys-panel-remove-sensor" + slot).click(function () {
            $("#mys-panel-sensor" + slot).remove();
            that.slots = that.slots.filter(item => item !== slot);
        })
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

    onGetMessageToServerSide(data) {
        if (data.slots) {
            //convert strings
            data.slots.forEach(s => {
                s.id = (s.id == "" || s.id == null) ? 0 : +s.id;
                s.datatype = (s.datatype == "" || s.datatype == null) ? 0 : +s.datatype;
                s.type = (s.type == "" || s.type == null) ? null : +s.type;
            });

            //check for duplicates
            for (var x = 0; x < data.slots.length; x++) {
                var slot1 = data.slots[x];
                for (var y = 0; y < data.slots.length; y++) {
                    if (x == y) continue;
                    var slot2 = data.slots[y];
                    if (slot1.id == slot2.id && slot1.datatype == slot2.datatype) {
                        this.debugWarn("Cant edit MYS-node. Check form data for missing values or duplicates.");
                        return;
                    }
                }
            }


            let controller = this.getControllerNode();

            let inputsCount = this.getInputsCount();
            //remove sensors
            if (data.slots.length < inputsCount) {
                for (let i = data.slots.length; i < inputsCount; i++) {
                    let sensor = this.getSensorInSlot(i);
                    if (sensor) this.getControllerNode().remove_MYS_Sensor(sensor.nodeId, sensor.sensorId, sensor.dataType);
                    if (this.inputs[i]) this.removeInput(i);
                    if (this.outputs[i]) this.removeOutput(i);
                }
            }
            //add sensors
            else if (data.slots.length > inputsCount) {
                for (let i = inputsCount; i < data.slots.length; i++) {
                    let s = data.slots[i];
                    let sensor = this.getControllerNode().register_MYS_Sensor(this.properties.mys_node.id, s.id, s.datatype);
                    if (!sensor) this.debugErr("Cant edit MYS node. Cant create sensor");
                }
            }
            //change sensors
            for (let s of data.slots) {
                console.log(s);
                let changed = false;

                let node = this.getControllerNode().get_MYS_Node(this.properties.mys_node_id);
                let sensor = this.getSensorInSlot(s.slot);

                if (!sensor || sensor.sensorId != s.id || sensor.dataType != s.datatype || sensor.type != s.type) {
                    changed = true;

                    //remove old sensor
                    if (sensor)
                        delete node.sensors[sensor.sensorId + "-" + sensor.dataType];

                    //add new sensor
                    sensor = {
                        nodeId: this.properties.mys_node_id,
                        sensorId: s.id,
                        dataType: s.datatype,
                        lastSeen: null,
                        shub_node_slot: s.slot
                    }

                    if (s.type != null)
                        sensor.type = s.type;

                    node.sensors[sensor.sensorId + "-" + sensor.dataType] = sensor;
                }

                if (changed)
                    this.container.db.updateNode(this.id, this.container.id, {
                        $set: { "properties.mys_node": node }
                    });
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

    // addInput(name?: string, type?: string, extra_info?: any): number {
    //     this.getControllerNode().register_MYS_Sensor()
    //     return super.addInput(name, type, extra_info);
    // }

    // addOutput(name?: string, type?: string, extra_info?: any): number {
    //     return super.addOutput(name, type, extra_info);
    // }

    // removeInput(id: number): void {
    //     let sensor = this.getSensorInSlot(id);
    //     if (sensor) this.getControllerNode().remove_MYS_Sensor(sensor.nodeId, sensor.sensorId, sensor.dataType);
    //     super.removeInput(id);
    // }

    // removeOutput(id: number): void {
    //     let sensor = this.getSensorInSlot(id);
    //     if (sensor) this.getControllerNode().remove_MYS_Sensor(sensor.nodeId, sensor.sensorId, sensor.dataType);
    //     super.removeOutput(id);
    // }
}
Container.registerNodeType("protocols/mys-node", MySensorsNode);
