/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// namespace MyNodes {
// let debug = require('debug')('nodes:            ');
// let debugLog = require('debug')('nodes:log         ');
// let debugMes = require('debug')('modes:mes         ');
// let debugErr = require('debug')('nodes:error       ');
var nodes_1 = require("../nodes");
var node_1 = require("../node");
var container_1 = require("../container");
var utils_1 = require("../utils");
//Constant
var ConstantNode = (function (_super) {
    __extends(ConstantNode, _super);
    function ConstantNode() {
        _super.call(this);
        // setValue = function (v) {
        //     // if (typeof(v) == "string") v = parseFloat(v);
        //     this.settings["value"] = v;
        // }
        this.onExecute = function () {
            var val = this.settings["value"].value;
            var out_type = this.settings["output-type"].value;
            this.setOutputData(0, utils_1.default.formatValue(val, out_type));
        };
        this.onSettingsChanged = function () {
            //change output type
            var out_type = this.settings["output-type"].value;
            if (out_type == "any")
                out_type = null;
            if (out_type != this.outputs[0].type)
                this.outputs[0].type = out_type;
            //change output name
            var val = this.settings["value"].value;
            val = utils_1.default.formatValue(val, out_type);
            this.outputs[0].name = utils_1.default.formatAndTrimValue(val);
            if (this.container.db) {
                var s_node = this.serialize(true);
                this.container.db.updateNode(this.id, this.container.id, { outputs: s_node.outputs });
            }
            if (!this.isBackside()) {
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
    return ConstantNode;
}(node_1.Node));
exports.ConstantNode = ConstantNode;
nodes_1.Nodes.registerNodeType("main/constant", ConstantNode);
//Container: a node that contains a container of other nodes
var ContainerNode = (function (_super) {
    __extends(ContainerNode, _super);
    function ContainerNode() {
        _super.call(this);
        this.onAdded = function () {
            this.sub_container.container_node = this;
            this.sub_container.parent_container_id = this.container.id;
        };
        this.onBeforeCreated = function () {
            this.sub_container = new container_1.Container();
            this.sub_container_id = this.sub_container.id;
            this.title = "Container " + this.sub_container.id;
            var rootContainer = container_1.Container.containers[0];
            if (rootContainer.db)
                rootContainer.db.updateLastContainerId(this.sub_container_id);
        };
        this.onRemoved = function () {
            for (var id in this.sub_container._nodes) {
                var node = this.sub_container._nodes[id];
                node.container.remove(node);
            }
            delete container_1.Container.containers[this.sub_container.id];
        };
        this.getExtraMenuOptions = function (renderer) {
            var that = this;
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
    ContainerNode.prototype.configure = function (data, from_db) {
        if (from_db === void 0) { from_db = false; }
        _super.prototype.configure.call(this, data);
        this.sub_container = container_1.Container.containers[data.sub_container.id];
        if (!this.sub_container)
            this.sub_container = new container_1.Container(data.sub_container.id);
        if (data.sub_container)
            this.sub_container.configure(data.sub_container, true);
    };
    ContainerNode.prototype.serialize = function (for_db) {
        if (for_db === void 0) { for_db = false; }
        var data = _super.prototype.serialize.call(this, for_db);
        data.sub_container = this.sub_container.serialize(!for_db);
        return data;
    };
    ContainerNode.prototype.clone = function () {
        var node = nodes_1.Nodes.createNode(this.type);
        var data = this.serialize();
        delete data["id"];
        delete data["inputs"];
        delete data["outputs"];
        node.configure(data);
        return node;
    };
    return ContainerNode;
}(node_1.Node));
exports.ContainerNode = ContainerNode;
nodes_1.Nodes.registerNodeType("main/container", ContainerNode);
//Input for a container
var ContainerInputNode = (function (_super) {
    __extends(ContainerInputNode, _super);
    function ContainerInputNode() {
        _super.call(this);
        this.onAdded = function () {
        };
        this.onAfterCreated = function () {
            //add output on container node
            var cont_node = this.container.container_node;
            var id = cont_node.addInput(null, this.properties.type);
            cont_node.setDirtyCanvas(true, true);
            this.properties.slot = id;
            //update name
            // this.outputs[0].name = cont_node.inputs[id].name;
            this.title = "Input " + (id + 1);
            if (this.container.db) {
                var s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { inputs: s_cont_node.inputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        };
        this.onRemoved = function () {
            //remove  output on container node
            var cont_node = this.container.container_node;
            cont_node.disconnectInput(this.properties.slot);
            cont_node.removeInput(this.properties.slot);
            cont_node.setDirtyCanvas(true, true);
            this.properties.slot = -1;
            if (this.container.db) {
                var s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { inputs: s_cont_node.inputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        };
        this.onExecute = function () {
            var cont_node = this.container.container_node;
            var val = cont_node.inputs[this.properties.slot].data;
            this.setOutputData(0, val);
        };
        this.title = "Input";
        this.descriprion = "Input of the container";
        this.addOutput("input", null);
        this.properties = { type: null };
    }
    return ContainerInputNode;
}(node_1.Node));
exports.ContainerInputNode = ContainerInputNode;
nodes_1.Nodes.registerNodeType("main/input", ContainerInputNode);
//Output for a container
var ContainerOutputNode = (function (_super) {
    __extends(ContainerOutputNode, _super);
    function ContainerOutputNode() {
        _super.call(this);
        this.onAdded = function () {
        };
        this.onAfterCreated = function () {
            //add output on container node
            var cont_node = this.container.container_node;
            var id = cont_node.addOutput(null, this.properties.type);
            cont_node.setDirtyCanvas(true, true);
            this.properties.slot = id;
            //update name
            // this.inputs[0].name = cont_node.outputs[id].name;
            this.title = "Output " + (id + 1);
            if (this.container.db) {
                var s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { outputs: s_cont_node.outputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        };
        this.onRemoved = function () {
            //remove  output on container node
            var cont_node = this.container.container_node;
            cont_node.disconnectOutput(this.properties.slot);
            cont_node.removeOutput(this.properties.slot);
            cont_node.setDirtyCanvas(true, true);
            this.properties.slot = -1;
            if (this.container.db) {
                var s_cont_node = cont_node.serialize(true);
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { outputs: s_cont_node.outputs });
                this.container.db.updateNode(cont_node.id, cont_node.container.id, { size: cont_node.size });
            }
        };
        this.onExecute = function () {
            var cont_node = this.container.container_node;
            var val = this.getInputData(0);
            cont_node.outputs[this.properties.slot].data = val;
        };
        this.title = "Ouput";
        this.descriprion = "Output of the container";
        this.addInput("output", null);
        this.properties = { type: null };
    }
    return ContainerOutputNode;
}(node_1.Node));
exports.ContainerOutputNode = ContainerOutputNode;
nodes_1.Nodes.registerNodeType("main/output", ContainerOutputNode);
