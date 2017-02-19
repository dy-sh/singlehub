/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

// namespace MyNodes {

// let debug = require('debug')('nodes:            ');
// let debugLog = require('debug')('nodes:log         ');
// let debugMes = require('debug')('modes:mes         ');
// let debugErr = require('debug')('nodes:error       ');

import {Nodes} from "../nodes";
import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


//Constant
export class ConstantNode extends Node {
    constructor() {
        super();
        this.title = "Constant";
        this.desc = "Constant value";
        this.addOutput("value", "number");
        this.properties = {value: 1.0};
        this.editable = {property: "value", type: "number"};
    }

    setValue = function (v) {
        if (typeof(v) == "string") v = parseFloat(v);
        this.properties["value"] = v;
    }

    onExecute = function () {
        this.setOutputData(0, parseFloat(this.properties["value"]));
    }

    onDrawBackground = function (ctx) {
        //show the current value
        let val = Utils.formatAndTrimValue(this.properties["value"]);
        this.outputs[0].label = val;
    };

    onWidget = function (e, widget) {
        if (widget.name == "value")
            this.setValue(widget.value);
    }
}
Nodes.registerNodeType("main/constant", ConstantNode);


//Container: a node that contains a container of other nodes
export class ContainerNode extends Node {
    sub_container: Container;

    constructor() {
        super();

        this.title = "Container";
        this.desc = "Contain other nodes";

        this.size = [120, 20];
    }


    onAdded = function () {
        this.sub_container.container_node = this;
        this.sub_container.parent_container_id = this.container.id;
    };

    onBeforeCreated = function () {
        this.sub_container = new Container();
        this.sub_container_id = this.sub_container.id;
        this.title = "Container " + this.sub_container.id;


        let rootContainer = Container.containers[0];
        if (rootContainer.db)
            rootContainer.db.updateLastContainerId(this.sub_container_id);

    }

    onRemoved = function () {
        for (let id in this.sub_container._nodes) {
            let node = this.sub_container._nodes[id];
            node.container.remove(node);
        }

        delete Container.containers[this.sub_container.id];
    };


    getExtraMenuOptions = function (renderer) {
        let that = this;
        return [{
            content: "Open", callback: function () {
                renderer.openContainer(that.sub_container,true);
            }
        }];
    }

    onExecute = function () {
        this.sub_container.runStep();
    }

    configure(data, from_db = false) {
        super.configure(data);

        this.sub_container = Container.containers[data.sub_container.id];
        if (!this.sub_container)
            this.sub_container = new Container(data.sub_container.id);

        if (data.sub_container)
            this.sub_container.configure(data.sub_container, true);

    }

    serialize(for_db = false) {
        let data = super.serialize(for_db);

        (<any>data).sub_container = this.sub_container.serialize(!for_db);

        return data;
    }

    clone() {

        let node = Nodes.createNode(this.type);
        let data = this.serialize();
        delete data["id"];
        delete data["inputs"];
        delete data["outputs"];
        node.configure(data);
        return node;
    }


}
Nodes.registerNodeType("main/container", ContainerNode);


//Input for a container
export class ContainerInputNode extends Node {
    constructor() {
        super();

        this.title = "Input";
        this.desc = "Input of the container";

        this.addOutput("input", null);

        this.properties = {type: null};
    }

    onAdded = function () {

    }

    onAfterCreated = function () {


        //add output on container node
        let cont_node = this.container.container_node;
        let id = cont_node.addInput(null, this.properties.type);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = id;

        //update name
        // this.outputs[0].name = cont_node.inputs[id].name;
        this.title = "Input " + (id + 1);

        if (this.container.db) {
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {inputs: cont_node.inputs});
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {size: cont_node.size});
        }
    }

    onRemoved = function () {
        //remove  output on container node
        let cont_node = this.container.container_node;
        cont_node.disconnectInput(this.properties.slot);
        cont_node.removeInput(this.properties.slot);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = -1;

        if (this.container.db) {
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {inputs: cont_node.inputs});
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {size: cont_node.size});
        }
    }

    onExecute = function () {
        let cont_node = this.container.container_node;
        let val = cont_node.inputs[this.properties.slot].data;
        this.setOutputData(0, val);
    }


}
Nodes.registerNodeType("main/input", ContainerInputNode);


//Output for a container
export class ContainerOutputNode extends Node {
    constructor() {
        super();
        this.title = "Ouput";
        this.desc = "Output of the container";

        this.addInput("output", null);

        this.properties = {type: null};
    }

    onAdded = function () {


    }

    onAfterCreated = function () {

        //add output on container node
        let cont_node = this.container.container_node;
        let id = cont_node.addOutput(null, this.properties.type);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = id;

        //update name
        // this.inputs[0].name = cont_node.outputs[id].name;
        this.title = "Output " + (id + 1);

        if (this.container.db) {
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {outputs: cont_node.outputs});
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {size: cont_node.size});
        }
    }

    onRemoved = function () {
        //remove  output on container node
        let cont_node = this.container.container_node;
        cont_node.disconnectOutput(this.properties.slot);
        cont_node.removeOutput(this.properties.slot);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = -1;

        if (this.container.db) {
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {outputs: cont_node.outputs});
            this.container.db.updateNode(cont_node.id, cont_node.container.id, {size: cont_node.size});
        }
    }


    onExecute = function () {
        let cont_node = this.container.container_node;
        let val = this.getInputData(0);
        cont_node.outputs[this.properties.slot].data = val;
    }


}
Nodes.registerNodeType("main/output", ContainerOutputNode);
