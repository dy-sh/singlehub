/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../nodes", "../node", "../nodes-engine"], factory);
    }
})(function (require, exports) {
    "use strict";
    // namespace MyNodes {
    // let debug = require('debug')('nodes:            ');
    // let debugLog = require('debug')('nodes:log         ');
    // let debugMes = require('debug')('modes:mes         ');
    // let debugErr = require('debug')('nodes:error       ');
    const nodes_1 = require("../nodes");
    const node_1 = require("../node");
    const nodes_engine_1 = require("../nodes-engine");
    //Constant
    class Constant extends node_1.Node {
        constructor() {
            super();
            this.setValue = function (v) {
                if (typeof (v) == "string")
                    v = parseFloat(v);
                this.properties["value"] = v;
            };
            this.onExecute = function () {
                this.setOutputData(0, parseFloat(this.properties["value"]));
            };
            this.onDrawBackground = function (ctx) {
                //show the current value
                this.outputs[0].label = this.properties["value"].toFixed(3);
            };
            this.onWidget = function (e, widget) {
                if (widget.name == "value")
                    this.setValue(widget.value);
            };
            this.title = "Const";
            this.desc = "Constant value";
            this.addOutput("value", "number");
            this.properties = { value: 1.0 };
            this.editable = { property: "value", type: "number" };
        }
    }
    exports.Constant = Constant;
    nodes_1.Nodes.registerNodeType("main/constant", Constant);
    //Container: a node that contains a engine
    class Container extends node_1.Node {
        constructor() {
            super();
            this.onAdded = function () {
                this.container_engine.parent_container_id = this.container_id;
            };
            this.onRemoved = function () {
                delete nodes_engine_1.NodesEngine.containers[this.container_engine.container_id];
            };
            this.getExtraMenuOptions = function (renderer) {
                let that = this;
                return [{
                        content: "Open", callback: function () {
                            renderer.openContainer(that);
                        }
                    }];
            };
            this.onExecute = function () {
                //send inputs to container_engine global inputs
                if (this.inputs)
                    for (let i = 0; i < this.inputs.length; i++) {
                        let input = this.inputs[i];
                        let value = this.getInputData(i);
                        this.container_engine.setGlobalInputData(input.name, value);
                    }
                //execute
                this.container_engine.runStep();
                //send container_engine global outputs to outputs
                if (this.outputs)
                    for (let i = 0; i < this.outputs.length; i++) {
                        let output = this.outputs[i];
                        let value = this.container_engine.getGlobalOutputData(output.name);
                        this.setOutputData(i, value);
                    }
            };
            this.title = "Container";
            this.desc = "Contain other nodes";
            this.size = [120, 20];
            //create inner engine
            this.container_engine = new nodes_engine_1.NodesEngine();
            this.container_engine._container_node = this;
            this.container_engine._is_container = true;
            this.container_engine.onContainerInputAdded = this.onContainerInputAdded.bind(this);
            this.container_engine.onContainerInputRenamed = this.onContainerInputRenamed.bind(this);
            this.container_engine.onContainerInputTypeChanged = this.onContainerInputTypeChanged.bind(this);
            this.container_engine.onContainerOutputAdded = this.onContainerOutputAdded.bind(this);
            this.container_engine.onContainerOutputRenamed = this.onContainerOutputRenamed.bind(this);
            this.container_engine.onContainerOutputTypeChanged = this.onContainerOutputTypeChanged.bind(this);
        }
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
        configure(o) {
            node_1.Node.prototype.configure.call(this, o);
            //this.container_engine.configure(o.engine);
        }
        serialize() {
            let data = node_1.Node.prototype.serialize.call(this);
            data.container_engine = this.container_engine.serialize();
            return data;
        }
        clone() {
            let node = nodes_1.Nodes.createNode(this.type);
            let data = this.serialize();
            delete data["id"];
            delete data["inputs"];
            delete data["outputs"];
            node.configure(data);
            return node;
        }
    }
    exports.Container = Container;
    nodes_1.Nodes.registerNodeType("main/container", Container);
    //Input for a container
    class Input extends node_1.Node {
        constructor() {
            super();
            //When added to engine tell the engine this is a new global input
            this.onAdded = function () {
                this.engine.addGlobalInput(this.properties.name, this.properties.type);
            };
            this.onExecute = function () {
                let name = this.properties.name;
                //read from global input
                let data = this.engine.global_inputs[name];
                if (!data)
                    return;
                //put through output
                this.setOutputData(0, data.value);
            };
            this.title = "Input";
            this.desc = "Input of the container";
            //random name to avoid problems with other outputs when added
            let input_name = "input_" + (Math.random() * 1000).toFixed();
            this.addOutput(input_name, null);
            this.properties = { name: input_name, type: null };
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
                    if (that.engine)
                        that.engine.renameGlobalInput(input_name, v);
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
                    if (that.engine)
                        that.engine.changeGlobalInputType(input_name, that.outputs[0].type);
                },
                enumerable: true
            });
        }
    }
    exports.Input = Input;
    nodes_1.Nodes.registerNodeType("main/input", Input);
    //Output for a container
    class Output extends node_1.Node {
        constructor() {
            super();
            this.onAdded = function () {
                let name = this.engine.addGlobalOutput(this.properties.name, this.properties.type);
            };
            this.onExecute = function () {
                this.engine.setGlobalOutputData(this.properties.name, this.getInputData(0));
            };
            this.title = "Ouput";
            this.desc = "Output of the container";
            //random name to avoid problems with other outputs when added
            let output_name = "output_" + (Math.random() * 1000).toFixed();
            this.addInput(output_name, null);
            this.properties = { name: output_name, type: null };
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
                    if (that.engine)
                        that.engine.renameGlobalOutput(output_name, v);
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
                    if (that.engine)
                        that.engine.changeGlobalInputType(output_name, that.inputs[0].type);
                },
                enumerable: true
            });
        }
    }
    exports.Output = Output;
    nodes_1.Nodes.registerNodeType("main/output", Output);
});
//# sourceMappingURL=main.js.map