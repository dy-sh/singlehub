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
        this.descriprion = "MySensors node. <br><br>" +
            "This node is automatically added to the \"MYS-controller\" container as soon as a new node is detected. <br>" +
            "When the hardware MYS-node presents the sensors, or sending sensor data, " +
            "then all the necessary pins will be automatically added to this node, " +
            "and you can immediately send and receive messages to the hardware node. <br><br>" +
            "You can also edit the sensors by calling \"Configure\" from this node context menu. " +
            "In the config page, you can add new sensors manually, delete unnecessary sensors, change their type, etc. <br>" +
            "If one sensor in your hardware node works with several types of data at once, " +
            "then you can add several sensors with the same ID, but with different data types. <br>" +
            "Note that you can not add two sensors with the same ID and data type. <br>" +
            "You do not need to specify the \"Sensor Type\", but you must specify the \"Data Type\". " +
            "The sensor type is filled in automatically when the node presents the sensors. " +
            "This setting does not affect anything at this moment. <br>" +
            "If you do not properly configure the node, then the configuration window will not be closed " +
            "until you correct the problem, or cancel the changes. " +
            "You can see the warning message in the browser console to find out what it is not properly configured. <br><br>" +
            "You can change some more node settings by calling the \"Settings\" in node context menu.";

        this.settings["send-true"] = {
            description: "Send 1/0 instead of true/false", value: true, type: "boolean"
        };

        this.contextMenu["configure"] = { title: "Configure", onClick: this.onConfigureClick }
    }

    onConfigureClick() {

        this.slots = [];
        for (let key in this.inputs)
            this.slots.push(+key);


        let mys_node = this.properties.mys_node;


        if (!$('#mys-panel-modal').length) {
            //create modal panel
            let body = $('#node-panel');
            body.append(' <div class="ui small modal" id="mys-panel-modal"> </div>');
        }

        let panel = $('#mys-panel-modal');
        panel.empty();

        panel.append(`
      <div class="header" id="mys-panel-title"></div>
      <div class="scrolling content">
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
        $('#mys-panel-title').html("MySensors Node " + this.properties.mys_node_id);

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
        $('#mys-panel-addsensor').click(() => {
            let sensor: I_MYS_Sensor = {
                nodeId: mys_node.id,
                sensorId: 0,
                type: null,
                dataType: 0
            }

            let newId = this.slots.length == 0 ? 0 : this.slots[this.slots.length - 1] + 1;
            this.slots.push(newId);
            this.addSensorToForm(newId, sensor);
        });

        //sensors
        for (let s in this.inputs) {
            let sensor = this.getSensorInSlot(+s);
            let slot = sensor.shub_node_slot;
            this.addSensorToForm(slot, sensor);
        }

        //open modal
        (<any>$('#mys-panel-modal')).modal({
            dimmerSettings: { opacity: 0.3 },
            onApprove: function () {
                let slots = [];

                //get form data 
                let i = 0;
                for (let s of this.slots) {
                    slots.push({
                        slot: i++,
                        id: $('#mys-panel-sonsor-id' + s).val(),
                        type: $('#mys-panel-sonsor-type' + s).val(),
                        datatype: $('#mys-panel-sonsor-datatype' + s).val(),
                    })
                }

                //check not empty and convert to numbers
                for (var n = 0; n < slots.length; n++) {
                    let s = slots[n];
                    if (s.id == "" || s.id == null || s.datatype == "" || s.datatype == null) {
                        this.debugWarn("Cant edit MYS-node. Check form data for missing values.");
                        return false;
                    }
                    s.id = +s.id;
                    s.datatype = +s.datatype;
                    s.type = (s.type == "" || s.type == null) ? null : +s.type;
                }

                //check for duplicates
                for (var x = 0; x < slots.length; x++) {
                    var slot1 = slots[x];
                    for (var y = 0; y < slots.length; y++) {
                        if (x == y) continue;
                        var slot2 = slots[y];
                        if (slot1.id == slot2.id && slot1.datatype == slot2.datatype) {
                            this.debugWarn("Cant edit MYS-node. Check form data for duplicates.");
                            return false;
                        }
                    }
                }

                //send data
                this.sendMessageToServerSide({
                    slots: slots
                });

                // //rename inputs/outputs
                // for (var n = 0; n < slots.length; n++) {
                //     let s = slots[n];
                //     if (node.inputs[s.slot]) {
                //         node.inputs[s.slot].name = (s.slot + 1) + " - sensor" + s.id + " (" + mys.sensorDataTypeKey[s.datatype] + ")";
                //         node.outputs[s.slot].name = (s.slot + 1) + "";
                //         node.updateInputsLabels();
                //         node.updateOutputsLabels();
                //     }
                // }
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
       <input type="number" id="mys-panel-sonsor-id`+ slot + `" name="mys-panel-sonsor-id` + slot + `" value="` + sensor.sensorId + `"> 
    </div>
    <div class="seven wide field">
       <label>Sensor Type</label>
       <input type="number" id="mys-panel-sonsor-type`+ slot + `" name="mys-panel-sonsor-type` + slot + `" value="` + sensorType + `"> 
    </div>
    <div class="seven wide field">
       <label>Data Type</label>
       <input type="number" id="mys-panel-sonsor-datatype`+ slot + `" name="mys-panel-sonsor-datatype` + slot + `" value="` + dataType + `"> 
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

            let controller = this.getControllerNode();

            let inputsCount = this.getInputsCount();
            //remove sensors
            if (data.slots.length < inputsCount) {
                for (let i = data.slots.length; i < inputsCount; i++) {
                    let sensor = this.getSensorInSlot(i);
                    if (sensor) this.getControllerNode().remove_MYS_Sensor(sensor.nodeId, sensor.sensorId, sensor.dataType);
                    // if (this.inputs[i]) this.removeInput(i);
                    // if (this.outputs[i]) this.removeOutput(i);
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
            let changed = false;
            for (let s of data.slots) {

                let node = this.properties.mys_node;
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

                    //rename inputs/outputs
                    this.inputs[s.slot].name = (s.slot + 1) + " - sensor" + sensor.sensorId + " (" + mys.sensorDataTypeKey[sensor.dataType] + ")";
                    this.outputs[s.slot].name = (s.slot + 1) + "";
                }
            }

            if (changed) {
                this.container.db.updateNode(this.id, this.container.id, {
                    $set: { "properties.mys_node": this.properties.mys_node, inputs: this.inputs, outputs: this.outputs }
                });

            }
            this.sendMessageToEditorSide({ mys_node: this.properties.mys_node, inputs: this.inputs, outputs: this.outputs });
        }
    }

    onGetMessageToEditorSide(data) {
        if (data.mys_node)
            this.properties.mys_node = data.mys_node;
        if (data.inputs)
            this.inputs = data.inputs;
        if (data.outputs)
            this.outputs = data.outputs;
        this.setDirtyCanvas(true, true);
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
