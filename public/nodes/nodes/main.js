/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../node", "../container", "../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const node_1 = require("../node");
    const container_1 = require("../container");
    const utils_1 = require("../utils");
    //Constant
    class ConstantNode extends node_1.Node {
        constructor() {
            super();
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
        // setValue  (v) {
        //     // if (typeof(v) == "string") v = parseFloat(v);
        //     this.settings["value"] = v;
        // }
        onExecute() {
            let val = this.settings["value"].value;
            let out_type = this.settings["output-type"].value;
            this.setOutputData(0, utils_1.default.formatValue(val, out_type));
        }
        onSettingsChanged() {
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
                if (!window.editor.showNodesIOValues) {
                    this.outputs[0].label = this.outputs[0].name;
                    this.setDirtyCanvas(true, true);
                }
            }
        }
    }
    exports.ConstantNode = ConstantNode;
    container_1.Container.registerNodeType("main/constant", ConstantNode);
    class CounterNode extends node_1.Node {
        constructor() {
            super();
            this.value = 0;
            this.title = "Counter";
            this.descriprion = "";
            this.settings["speed"] = { description: "Limit speed (values/sec)", value: 10, type: "number" };
            this.addOutput("value", "number");
        }
        onExecute() {
            let now = Date.now();
            if (!this.lastTime)
                this.lastTime = now;
            let interval = 1000 / this.settings["speed"].value;
            if (now - this.lastTime >= interval) {
                this.lastTime = now;
                this.value++;
                this.setOutputData(0, this.value);
            }
        }
    }
    exports.CounterNode = CounterNode;
    container_1.Container.registerNodeType("main/counter", CounterNode);
    //Container: a node that contains a container of other nodes
    class ContainerNode extends node_1.Node {
        constructor(container) {
            super(container);
            this.title = "Container";
            this.descriprion = "Contain other nodes";
        }
        onCreated() {
            this.sub_container = new container_1.Container(this.side);
            this.sub_container_id = this.sub_container.id;
            this.title = "Container " + this.sub_container.id;
            this.sub_container.container_node = this;
            this.sub_container.parent_container_id = this.container.id;
            if (this.container.db)
                this.container.db.updateLastContainerId(this.sub_container_id);
        }
        onRemoved() {
            for (let id in this.sub_container._nodes) {
                let node = this.sub_container._nodes[id];
                node.container.remove(node);
            }
            delete container_1.Container.containers[this.sub_container.id];
        }
        ;
        configure(data, from_db = false) {
            super.configure(data);
            this.sub_container = container_1.Container.containers[data.sub_container.id];
            if (!this.sub_container)
                this.sub_container = new container_1.Container(this.side, data.sub_container.id);
            this.sub_container.container_node = this;
            this.sub_container.parent_container_id = this.container.id;
            this.sub_container.configure(data.sub_container, true);
        }
        serialize(for_db = false) {
            let data = super.serialize(for_db);
            data.sub_container = this.sub_container.serialize(!for_db);
            return data;
        }
        getExtraMenuOptions(renderer) {
            let that = this;
            return [{
                    content: "Open", callback: function () {
                        renderer.openContainer(that.sub_container, true);
                    }
                }];
        }
        onExecute() {
            this.sub_container.runStep();
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
    container_1.Container.registerNodeType("main/container", ContainerNode);
    //Input for a container
    class ContainerInputNode extends node_1.Node {
        constructor(container) {
            super(container);
            this.title = "Input";
            this.descriprion = "Input of the container";
            this.addOutput("input", null);
            this.properties = { type: null };
        }
        onCreated() {
            //add output on container node
            let cont_node = this.container.container_node;
            let id = cont_node.addInput(null, this.properties['type']);
            cont_node.setDirtyCanvas(true, true);
            this.properties['slot'] = id;
            //update name
            // this.outputs[0].name = cont_node.inputs[id].name;
            this.title = "Input " + (id + 1);
            if (this.container.db) {
                let s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { inputs: s_cont_node.inputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        }
        onRemoved() {
            //remove  output on container node
            let cont_node = this.container.container_node;
            cont_node.disconnectInput(this.properties['slot']);
            cont_node.removeInput(this.properties['slot']);
            cont_node.setDirtyCanvas(true, true);
            this.properties['slot'] = -1;
            if (this.container.db) {
                let s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { inputs: s_cont_node.inputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        }
        onExecute() {
            let cont_node = this.container.container_node;
            let val = cont_node.inputs[this.properties['slot']].data;
            this.setOutputData(0, val);
        }
    }
    exports.ContainerInputNode = ContainerInputNode;
    container_1.Container.registerNodeType("main/input", ContainerInputNode);
    //Output for a container
    class ContainerOutputNode extends node_1.Node {
        constructor(container) {
            super(container);
            this.title = "Ouput";
            this.descriprion = "Output of the container";
            this.addInput("output", null);
            this.properties = { type: null };
        }
        onCreated() {
            //add output on container node
            let cont_node = this.container.container_node;
            let id = cont_node.addOutput(null, this.properties['type']);
            cont_node.setDirtyCanvas(true, true);
            this.properties['slot'] = id;
            //update name
            // this.inputs[0].name = cont_node.outputs[id].name;
            this.title = "Output " + (id + 1);
            if (this.container.db) {
                let s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { outputs: s_cont_node.outputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        }
        onRemoved() {
            //remove  output on container node
            let cont_node = this.container.container_node;
            cont_node.disconnectOutput(this.properties['slot']);
            cont_node.removeOutput(this.properties['slot']);
            cont_node.setDirtyCanvas(true, true);
            this.properties['slot'] = -1;
            if (this.container.db) {
                let s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { outputs: s_cont_node.outputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        }
        onExecute() {
            let cont_node = this.container.container_node;
            let val = this.getInputData(0);
            cont_node.outputs[this.properties['slot']].data = val;
        }
    }
    exports.ContainerOutputNode = ContainerOutputNode;
    container_1.Container.registerNodeType("main/output", ContainerOutputNode);
});
//# sourceMappingURL=main.js.map