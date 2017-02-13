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
        this.sub_container.container_node = this;
    }


    onAdded = function () {
        this.sub_container.parent_container_id = this.container.id;
    };

    onRemoved = function () {
        delete Container.containers[this.sub_container.id];
    };


    getExtraMenuOptions = function (renderer) {
        let that = this;
        return [{
            content: "Open", callback: function () {
                renderer.openContainer(that.sub_container);
            }
        }];
    }

    onExecute = function () {

        // //send inputs to sub_container global inputs
        // if (this.inputs)
        //     for (let i = 0; i < this.inputs.length; i++) {
        //         let input = this.inputs[i];
        //         let value = this.getInputData(i);
        //         this.sub_container.container_node.setContainerInputData(input.name, value);
        //     }

        //execute
        this.sub_container.runStep();

        // //send sub_container global outputs to outputs
        // if (this.outputs)
        //     for (let i = 0; i < this.outputs.length; i++) {
        //         let output = this.outputs[i];
        //         let value = this.sub_container.container_node.getContainerOutputData(output.name);
        //         this.setOutputData(i, value);
        //     }
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


    //rename the global input
    // renameContainerInput(old_name, name) {
    //     if (name == old_name)
    //         return;
    //
    //     if (!this.container_inputs[old_name])
    //         return false;
    //
    //     if (this.container_inputs[name]) {
    //         console.error("there is already one input with that name");
    //         return false;
    //     }
    //
    //     this.container_inputs[name] = this.container_inputs[old_name];
    //     delete this.container_inputs[old_name];
    //
    //     let slot = this.findInputSlot(old_name);
    //     if (slot == -1)
    //         return;
    //     let info = this.getInputInfo(slot);
    //     info.name = name;
    // }

    // changeConainerInputType(name, type) {
    //     if (!this.container_inputs[name])
    //         return false;
    //
    //     if (this.container_inputs[name].type.toLowerCase() == type.toLowerCase())
    //         return;
    //
    //     this.container_inputs[name].type = type;
    //
    //     let slot = this.findInputSlot(name);
    //     if (slot == -1)
    //         return;
    //     let info = this.getInputInfo(slot);
    //     info.type = type;
    // }


// rename the global output
//     renameContainerOutput(old_name, name) {
//         if (!this.container_outputs[old_name])
//             return false;
//
//         if (this.container_outputs[name]) {
//             console.error("there is already one output with that name");
//             return false;
//         }
//
//         this.container_outputs[name] = this.container_outputs[old_name];
//         delete this.container_outputs[old_name];
//
//         let slot = this.findOutputSlot(old_name);
//         if (slot == -1)
//             return;
//         let info = this.getOutputInfo(slot);
//         info.name = name;
//     }

    // changeContainerOutputType(name, type) {
    //     if (!this.container_outputs[name])
    //         return false;
    //
    //     if (this.container_outputs[name].type.toLowerCase() == type.toLowerCase())
    //         return;
    //
    //     this.container_outputs[name].type = type;
    //
    //     let slot = this.findOutputSlot(name);
    //     if (slot == -1)
    //         return;
    //     let info = this.getOutputInfo(slot);
    //     info.type = type;
    // }


}
Nodes.registerNodeType("main/container", ContainerNode);


//Input for a container
export class ContainerInputNode extends Node {
    constructor() {
        super();

        this.title = "Input";
        this.desc = "Input of the container";

        this.addOutput("input", null);

        this.properties = {name: "input", type: null};

        let that = this;

        // Object.defineProperty(this.properties, "name", {
        //     get: function () {
        //         return input_name;
        //     },
        //     set: function (v) {
        //         if (v == "")
        //             return;
        //
        //         let info = that.getOutputInfo(0);
        //         if (info.name == v)
        //             return;
        //         info.name = v;
        //         if (that.container)
        //             that.container.renameContainerInput(input_name, v);
        //         input_name = v;
        //     },
        //     enumerable: true
        // });
        //
        // Object.defineProperty(this.properties, "type", {
        //     get: function () {
        //         return that.outputs[0].type;
        //     },
        //     set: function (v) {
        //         that.outputs[0].type = v;
        //         if (that.container)
        //             that.container.changeConainerInputType(input_name, that.outputs[0].type);
        //     },
        //     enumerable: true
        // });


    }

    onAdded = function () {
        if (this.isBackside()) {
            let name = this.getNewContainerInputName();
            this.properties.name = name;
            this.outputs[0].name = this.properties.name;
        }
    }

    onCreated = function () {
        //add output on container node
        let cont_node = this.container.container_node;
        cont_node.addInput(this.properties.name, this.properties.type);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = cont_node.inputs.length - 1;

        //update output name
        this.outputs[0].name = this.properties.name;
    }

    onRemoved = function () {
        //remove  output on container node
        let cont_node = this.container.container_node;
        cont_node.disconnectInput(this.properties.slot);
        cont_node.removeInput(this.properties.slot);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = -1;
    }

    onExecute = function () {
        let cont_node = this.container.container_node;
        let val = cont_node.inputs[this.properties.slot].data;
        this.setOutputData(0, val);
    }

    getNewContainerInputName(): string {
        let maxInput = 0;
        let cont_node = this.container.container_node;
        if (cont_node.inputs) {
            for (let input of cont_node.inputs) {
                if (input.name.startsWith("input ")) {
                    let substr = input.name.substring(7, input.name.length - 1);
                    let num = parseInt(substr);
                    if (num > maxInput)
                        maxInput = num;
                }
            }
        }

        return "input " + ++maxInput;
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

        this.properties = {name: "output", type: null};

        let that = this;

        // Object.defineProperty(this.properties, "name", {
        //     get: function () {
        //         return output_name;
        //     },
        //     set: function (v) {
        //         if (v == "")
        //             return;
        //
        //         let info = that.getInputInfo(0);
        //         if (info.name == v)
        //             return;
        //         info.name = v;
        //         if (that.container)
        //             that.container.renameContainerOutput(output_name, v);
        //         output_name = v;
        //     },
        //     enumerable: true
        // });
        //
        // Object.defineProperty(this.properties, "type", {
        //     get: function () {
        //         return that.inputs[0].type;
        //     },
        //     set: function (v) {
        //         that.inputs[0].type = v;
        //         if (that.container)
        //             that.container.changeConainerInputType(output_name, that.inputs[0].type);
        //     },
        //     enumerable: true
        // });
    }

    onAdded = function () {
        if (this.isBackside()) {
            let name = this.getNewContainerOutputName();
            this.properties.name = name;
            this.inputs[0].name = this.properties.name;
        }
    }

    onCreated = function () {
        //add output on container node
        let cont_node = this.container.container_node;
        cont_node.addOutput(this.properties.name, this.properties.type);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = cont_node.outputs.length - 1;

        //update input name
        this.inputs[0].name = this.properties.name;
    }

    onRemoved = function () {
        //remove  output on container node
        let cont_node = this.container.container_node;
        cont_node.disconnectOutput(this.properties.slot);
        cont_node.removeOutput(this.properties.slot);
        cont_node.setDirtyCanvas(true, true);
        this.properties.slot = -1;
    }


    onExecute = function () {
        let cont_node = this.container.container_node;
        let val = this.getInputData(0);
        cont_node.outputs[this.properties.slot].data = val;
    }

    getNewContainerOutputName(): string {
        let maxOutput = 0;
        let cont_node = this.container.container_node;
        if (cont_node.outputs) {
            for (let output of cont_node.outputs) {
                if (output.name.startsWith("output ")) {
                    let substr = output.name.substring(8, output.name.length - 1);
                    let num = parseInt(substr);
                    if (num > maxOutput)
                        maxOutput = num;
                }
            }
        }

        return "output " + ++maxOutput;
    }
}
Nodes.registerNodeType("main/output", ContainerOutputNode);
