/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../nodes", "../node", "../container", "../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../nodes");
    const node_1 = require("../node");
    const container_1 = require("../container");
    const utils_1 = require("../utils");
    //Constant
    class ConstantNode extends node_1.Node {
        constructor() {
            super();
            // setValue = function (v) {
            //     // if (typeof(v) == "string") v = parseFloat(v);
            //     this.settings["value"] = v;
            // }
            this.onExecute = function () {
                let val = this.settings["value"].value;
                let out_type = this.settings["output-type"].value;
                this.setOutputData(0, utils_1.default.formatValue(val, out_type));
            };
            this.onSettingsChanged = function () {
                //change output type
                let out_type = this.settings["output-type"].value;
                if (out_type == "any")
                    out_type = null;
                if (out_type != this.outputs[0].type)
                    this.outputs[0].type = out_type;
                //change output name
                let val = this.settings["value"].value;
                val = utils_1.default.formatValue(val, out_type);
                this.outputs[0].name = utils_1.default.formatAndTrimValue(val);
                if (this.container.db) {
                    let s_node = this.serialize(true);
                    this.container.db.updateNode(this.id, this.container.id, { outputs: s_node.outputs });
                }
                if (this.side == container_1.Side.editor) {
                    if (!window.editor.showSlotsValues) {
                        this.outputs[0].label = this.outputs[0].name;
                        this.setDirtyCanvas(true, true);
                    }
                }
            };
            this.title = "Constant";
            this.descriprion = "Constant value";
            this.settings["value"] = { description: "Value", value: 1 };
            this.settings["output-type"] = {
                description: "Output type",
                type: "dropdown",
                config: {
                    elements: [
                        // {key: "any", text: "any"},
                        { key: "string", text: "string" },
                        { key: "number", text: "number" },
                        { key: "boolean", text: "boolean" }
                    ]
                },
                value: "number"
            };
            this.addOutput("1", "number");
        }
    }
    exports.ConstantNode = ConstantNode;
    nodes_1.Nodes.registerNodeType("main/constant", ConstantNode);
    //Container: a node that contains a container of other nodes
    class ContainerNode extends node_1.Node {
        constructor(container) {
            super(container);
            this.onAdded = function () {
                this.sub_container.container_node = this;
                this.sub_container.parent_container_id = this.container.id;
            };
            this.onBeforeCreated = function () {
                this.sub_container = new container_1.Container(this.side);
                this.sub_container_id = this.sub_container.id;
                this.title = "Container " + this.sub_container.id;
                let rootContainer = container_1.Container.containers[0];
                if (rootContainer.db)
                    rootContainer.db.updateLastContainerId(this.sub_container_id);
            };
            this.onRemoved = function () {
                for (let id in this.sub_container._nodes) {
                    let node = this.sub_container._nodes[id];
                    node.container.remove(node);
                }
                delete container_1.Container.containers[this.sub_container.id];
            };
            this.getExtraMenuOptions = function (renderer) {
                let that = this;
                return [{
                        content: "Open", callback: function () {
                            renderer.openContainer(that.sub_container, true);
                        }
                    }];
            };
            this.onExecute = function () {
                this.sub_container.runStep();
            };
            this.title = "Container";
            this.descriprion = "Contain other nodes";
            this.size = [120, 20];
        }
        configure(data, from_db = false) {
            super.configure(data);
            this.sub_container = container_1.Container.containers[data.sub_container.id];
            if (!this.sub_container)
                this.sub_container = new container_1.Container(this.side, data.sub_container.id);
            if (data.sub_container)
                this.sub_container.configure(data.sub_container, true);
        }
        serialize(for_db = false) {
            let data = super.serialize(for_db);
            data.sub_container = this.sub_container.serialize(!for_db);
            return data;
        }
        clone() {
            let node = this.container.createNode(this.type);
            let data = this.serialize();
            delete data["id"];
            delete data["inputs"];
            delete data["outputs"];
            node.configure(data);
            return node;
        }
    }
    exports.ContainerNode = ContainerNode;
    nodes_1.Nodes.registerNodeType("main/container", ContainerNode);
    //Input for a container
    class ContainerInputNode extends node_1.Node {
        constructor(container) {
            super(container);
            this.onAdded = function () {
            };
            this.onAfterCreated = function () {
                //add output on container node
                let cont_node = this.container.container_node;
                let id = cont_node.addInput(null, this.properties.type);
                cont_node.setDirtyCanvas(true, true);
                this.properties.slot = id;
                //update name
                // this.outputs[0].name = cont_node.inputs[id].name;
                this.title = "Input " + (id + 1);
                if (this.container.db) {
                    let s_cont_node = cont_node.serialize(true);
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { inputs: s_cont_node.inputs });
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
                }
            };
            this.onRemoved = function () {
                //remove  output on container node
                let cont_node = this.container.container_node;
                cont_node.disconnectInput(this.properties.slot);
                cont_node.removeInput(this.properties.slot);
                cont_node.setDirtyCanvas(true, true);
                this.properties.slot = -1;
                if (this.container.db) {
                    let s_cont_node = cont_node.serialize(true);
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { inputs: s_cont_node.inputs });
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
                }
            };
            this.onExecute = function () {
                let cont_node = this.container.container_node;
                let val = cont_node.inputs[this.properties.slot].data;
                this.setOutputData(0, val);
            };
            this.title = "Input";
            this.descriprion = "Input of the container";
            this.addOutput("input", null);
            this.properties = { type: null };
        }
    }
    exports.ContainerInputNode = ContainerInputNode;
    nodes_1.Nodes.registerNodeType("main/input", ContainerInputNode);
    //Output for a container
    class ContainerOutputNode extends node_1.Node {
        constructor(container) {
            super(container);
            this.onAdded = function () {
            };
            this.onAfterCreated = function () {
                //add output on container node
                let cont_node = this.container.container_node;
                let id = cont_node.addOutput(null, this.properties.type);
                cont_node.setDirtyCanvas(true, true);
                this.properties.slot = id;
                //update name
                // this.inputs[0].name = cont_node.outputs[id].name;
                this.title = "Output " + (id + 1);
                if (this.container.db) {
                    let s_cont_node = cont_node.serialize(true);
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { outputs: s_cont_node.outputs });
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
                }
            };
            this.onRemoved = function () {
                //remove  output on container node
                let cont_node = this.container.container_node;
                cont_node.disconnectOutput(this.properties.slot);
                cont_node.removeOutput(this.properties.slot);
                cont_node.setDirtyCanvas(true, true);
                this.properties.slot = -1;
                if (this.container.db) {
                    let s_cont_node = cont_node.serialize(true);
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { outputs: s_cont_node.outputs });
                    this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
                }
            };
            this.onExecute = function () {
                let cont_node = this.container.container_node;
                let val = this.getInputData(0);
                cont_node.outputs[this.properties.slot].data = val;
            };
            this.title = "Ouput";
            this.descriprion = "Output of the container";
            this.addInput("output", null);
            this.properties = { type: null };
        }
    }
    exports.ContainerOutputNode = ContainerOutputNode;
    nodes_1.Nodes.registerNodeType("main/output", ContainerOutputNode);
});
//# sourceMappingURL=main.js.map