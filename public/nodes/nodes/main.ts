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


        this.sub_container = new Container();
        this.sub_container._container_node = this;

        this.sub_container.onContainerInputAdded = this.onContainerInputAdded.bind(this);
        this.sub_container.onContainerInputRenamed = this.onContainerInputRenamed.bind(this);
        this.sub_container.onContainerInputTypeChanged = this.onContainerInputTypeChanged.bind(this);

        this.sub_container.onContainerOutputAdded = this.onContainerOutputAdded.bind(this);
        this.sub_container.onContainerOutputRenamed = this.onContainerOutputRenamed.bind(this);
        this.sub_container.onContainerOutputTypeChanged = this.onContainerOutputTypeChanged.bind(this);
    }


    onAdded = function () {
        this.sub_container.parent_container_id = this.container.id;
    };

    onRemoved = function () {
        delete Container.containers[this.sub_container.id];
    };


    onContainerInputAdded(name, type) {
        //add input to the node
        this.addInput(name, type);
    }

    onContainerInputRenamed(oldname, name) {
        let slot = this.findInputSlot(oldname);
        if (slot == -1)
            return;
        let info = this.getInputInfo(slot);
        info.name = name;
    }

    onContainerInputTypeChanged(name, type) {
        let slot = this.findInputSlot(name);
        if (slot == -1)
            return;
        let info = this.getInputInfo(slot);
        info.type = type;
    }

    onContainerOutputAdded(name, type) {
        //add output to the node
        this.addOutput(name, type);
    }

    onContainerOutputRenamed(oldname, name) {
        let slot = this.findOutputSlot(oldname);
        if (slot == -1)
            return;
        let info = this.getOutputInfo(slot);
        info.name = name;
    }

    onContainerOutputTypeChanged(name, type) {
        let slot = this.findOutputSlot(name);
        if (slot == -1)
            return;
        let info = this.getOutputInfo(slot);
        info.type = type;
    }

    getExtraMenuOptions = function (renderer) {
        let that = this;
        return [{
            content: "Open", callback: function () {
                renderer.openContainer(that.sub_container);
            }
        }];
    }

    onExecute = function () {

        //send inputs to sub_container global inputs
        if (this.inputs)
            for (let i = 0; i < this.inputs.length; i++) {
                let input = this.inputs[i];
                let value = this.getInputData(i);
                this.sub_container.setGlobalInputData(input.name, value);
            }

        //execute
        this.sub_container.runStep();

        //send sub_container global outputs to outputs
        if (this.outputs)
            for (let i = 0; i < this.outputs.length; i++) {
                let output = this.outputs[i];
                let value = this.sub_container.getGlobalOutputData(output.name);
                this.setOutputData(i, value);
            }
    }

    configure(o) {
        Node.prototype.configure.call(this, o);
        //this.sub_container.configure(o.container);
    }

    serialize() {
        let data = Node.prototype.serialize.call(this);
        data.sub_container = this.sub_container.serialize();
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

        //random name to avoid problems with other outputs when added
        let input_name = "input_" + (Math.random() * 1000).toFixed();

        this.addOutput(input_name, null);

        this.properties = {name: input_name, type: null};

        let that = this;

        Object.defineProperty(this.properties, "name", {
            get: function () {
                return input_name;
            },
            set: function (v) {
                if (v == "")
                    return;

                let info = that.getOutputInfo(0);
                if (info.name == v)
                    return;
                info.name = v;
                if (that.container)
                    that.container.renameGlobalInput(input_name, v);
                input_name = v;
            },
            enumerable: true
        });

        Object.defineProperty(this.properties, "type", {
            get: function () {
                return that.outputs[0].type;
            },
            set: function (v) {
                that.outputs[0].type = v;
                if (that.container)
                    that.container.changeGlobalInputType(input_name, that.outputs[0].type);
            },
            enumerable: true
        });
    }

//When added to container tell the container this is a new global input
    onAdded = function () {
        if (this.isBackside())
            this.container.addGlobalInput(this.properties.name, this.properties.type);
    }

    onExecute = function () {
        let name = this.properties.name;

        //read from global input
        let data = this.container.global_inputs[name];
        if (!data) return;

        //put through output
        this.setOutputData(0, data.value);
    }
}
Nodes.registerNodeType("main/input", ContainerInputNode);


//Output for a container
export class ContainerOutputNode extends Node {
    constructor() {
        super();
        this.title = "Ouput";
        this.desc = "Output of the container";
        //random name to avoid problems with other outputs when added
        let output_name = "output_" + (Math.random() * 1000).toFixed();

        this.addInput(output_name, null);

        this.properties = {name: output_name, type: null};

        let that = this;

        Object.defineProperty(this.properties, "name", {
            get: function () {
                return output_name;
            },
            set: function (v) {
                if (v == "")
                    return;

                let info = that.getInputInfo(0);
                if (info.name == v)
                    return;
                info.name = v;
                if (that.container)
                    that.container.renameGlobalOutput(output_name, v);
                output_name = v;
            },
            enumerable: true
        });

        Object.defineProperty(this.properties, "type", {
            get: function () {
                return that.inputs[0].type;
            },
            set: function (v) {
                that.inputs[0].type = v;
                if (that.container)
                    that.container.changeGlobalInputType(output_name, that.inputs[0].type);
            },
            enumerable: true
        });
    }

    onAdded = function () {
        if (this.isBackside())
            this.container.addGlobalOutput(this.properties.name, this.properties.type);
    }

    onExecute = function () {
        this.container.setGlobalOutputData(this.properties.name, this.getInputData(0));
    }
}
Nodes.registerNodeType("main/output", ContainerOutputNode);
