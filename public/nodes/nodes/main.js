/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_1 = require("../node");
var container_1 = require("../container");
var utils_1 = require("../utils");
//Constant
var ConstantNode = (function (_super) {
    __extends(ConstantNode, _super);
    function ConstantNode() {
        _super.call(this);
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
    ConstantNode.prototype.onAdded = function () {
        if (this.side == container_1.Side.server) {
            var val = this.settings["value"].value;
            var out_type = this.settings["output-type"].value;
            this.setOutputData(0, utils_1.default.formatValue(val, out_type));
        }
    };
    ConstantNode.prototype.onSettingsChanged = function () {
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
            this.container.db.updateNode(this.id, this.container.id, { $set: { outputs: s_node.outputs } });
        }
        if (this.side == container_1.Side.editor) {
            if (!window.editor.showNodesIOValues) {
                this.outputs[0].label = this.outputs[0].name;
                this.setDirtyCanvas(true, true);
            }
        }
        this.setOutputData(0, val);
    };
    return ConstantNode;
}(node_1.Node));
exports.ConstantNode = ConstantNode;
container_1.Container.registerNodeType("main/constant", ConstantNode);
//Container: a node that contains a container of other nodes
var ContainerNode = (function (_super) {
    __extends(ContainerNode, _super);
    function ContainerNode(container) {
        _super.call(this, container);
        this.title = "Container";
        this.descriprion = "Contain other nodes";
        this.settings["name"] = { description: "Container name", type: "string", value: this.title };
    }
    ContainerNode.prototype.onCreated = function () {
        this.sub_container = new container_1.Container(this.side);
        this.sub_container_id = this.sub_container.id;
        this.settings["name"].value = "Container " + this.sub_container.id;
        ;
        this.sub_container.container_node = this;
        this.sub_container.parent_container_id = this.container.id;
        if (this.container.db)
            this.container.db.updateLastContainerId(this.sub_container_id);
    };
    ContainerNode.prototype.onAdded = function () {
        this.changeTitle();
    };
    ContainerNode.prototype.onRemoved = function () {
        for (var id in this.sub_container._nodes) {
            var node = this.sub_container._nodes[id];
            node.container.remove(node);
        }
        delete container_1.Container.containers[this.sub_container.id];
    };
    ;
    ContainerNode.prototype.configure = function (data, from_db) {
        if (from_db === void 0) { from_db = false; }
        _super.prototype.configure.call(this, data);
        this.sub_container = container_1.Container.containers[data.sub_container.id];
        if (!this.sub_container)
            this.sub_container = new container_1.Container(this.side, data.sub_container.id);
        this.sub_container.container_node = this;
        this.sub_container.parent_container_id = this.container.id;
        this.sub_container.configure(data.sub_container, true);
    };
    ContainerNode.prototype.serialize = function (for_db) {
        if (for_db === void 0) { for_db = false; }
        var data = _super.prototype.serialize.call(this, for_db);
        data.sub_container = this.sub_container.serialize(!for_db);
        return data;
    };
    ContainerNode.prototype.getExtraMenuOptions = function (renderer) {
        var that = this;
        return [{
                content: "Open", callback: function () {
                    renderer.openContainer(that.sub_container, true);
                }
            }];
    };
    ContainerNode.prototype.onExecute = function () {
        this.sub_container.runStep();
    };
    ContainerNode.prototype.onSettingsChanged = function () {
        this.changeTitle();
    };
    ContainerNode.prototype.changeTitle = function () {
        this.title = this.settings["name"].value;
        this.size = this.computeSize();
        this.sub_container.name = this.title;
        // if (this.container.db)
        //     this.container.db.updateNode(this.id,this.container.id,{$set:{}})
        // if (this.side==Side.server)
    };
    ContainerNode.prototype.clone = function () {
        var node = this.container.createNode(this.type);
        var data = this.serialize(true);
        delete data["id"];
        data['sub_container'].id = node.sub_container.id;
        node.configure(data);
        node.pos[1] = this.pos[1] + this.size[1] + 25;
        node.restoreLinks();
        if (this.container.db) {
            var s_node = node.serialize(true);
            this.container.db.updateNode(node.id, node.container.id, s_node);
        }
        var new_cont = node.sub_container;
        var nodes = this.sub_container._nodes;
        for (var id in nodes) {
            if (nodes[id].type == "main/container") {
            }
            else {
                var s_node = nodes[id].serialize(true);
                var new_node = new_cont.createNode(s_node.type, null, s_node);
                if (this.container.db) {
                    this.container.db.addNode(new_node);
                }
            }
        }
        return node;
    };
    return ContainerNode;
}(node_1.Node));
exports.ContainerNode = ContainerNode;
container_1.Container.registerNodeType("main/container", ContainerNode);
//Input for a container
var ContainerInputNode = (function (_super) {
    __extends(ContainerInputNode, _super);
    function ContainerInputNode(container) {
        _super.call(this, container);
        this.title = "Input";
        this.descriprion = "Input of the container";
        this.addOutput("input", null);
        this.properties = { type: null };
    }
    ContainerInputNode.prototype.onCreated = function () {
        //add output on container node
        var cont_node = this.container.container_node;
        var id = cont_node.addInput(null, this.properties['type']);
        cont_node.setDirtyCanvas(true, true);
        this.properties['slot'] = id;
        //update name
        // this.outputs[0].name = cont_node.inputs[id].name;
        this.title = "Input " + (id + 1);
        if (this.container.db) {
            var s_cont_node = cont_node.serialize(true);
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { inputs: s_cont_node.inputs } });
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { size: cont_node.size } });
        }
    };
    ContainerInputNode.prototype.onRemoved = function () {
        //remove  output on container node
        var cont_node = this.container.container_node;
        cont_node.disconnectInput(this.properties['slot']);
        cont_node.removeInput(this.properties['slot']);
        cont_node.setDirtyCanvas(true, true);
        this.properties['slot'] = -1;
        if (this.container.db) {
            var s_cont_node = cont_node.serialize(true);
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { inputs: s_cont_node.inputs } });
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { size: cont_node.size } });
        }
    };
    ContainerInputNode.prototype.onExecute = function () {
        var cont_node = this.container.container_node;
        var input = cont_node.inputs[this.properties['slot']];
        if (input.updated)
            this.setOutputData(0, input.data);
    };
    return ContainerInputNode;
}(node_1.Node));
exports.ContainerInputNode = ContainerInputNode;
container_1.Container.registerNodeType("main/input", ContainerInputNode);
//Output for a container
var ContainerOutputNode = (function (_super) {
    __extends(ContainerOutputNode, _super);
    function ContainerOutputNode(container) {
        _super.call(this, container);
        this.title = "Ouput";
        this.descriprion = "Output of the container";
        this.addInput("output", null);
        this.properties = { type: null };
    }
    ContainerOutputNode.prototype.onCreated = function () {
        //add output on container node
        var cont_node = this.container.container_node;
        var id = cont_node.addOutput(null, this.properties['type']);
        cont_node.setDirtyCanvas(true, true);
        this.properties['slot'] = id;
        //update name
        // this.inputs[0].name = cont_node.outputs[id].name;
        this.title = "Output " + (id + 1);
        if (this.container.db) {
            var s_cont_node = cont_node.serialize(true);
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { outputs: s_cont_node.outputs } });
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { size: cont_node.size } });
        }
    };
    ContainerOutputNode.prototype.onRemoved = function () {
        //remove  output on container node
        var cont_node = this.container.container_node;
        cont_node.disconnectOutput(this.properties['slot']);
        cont_node.removeOutput(this.properties['slot']);
        cont_node.setDirtyCanvas(true, true);
        this.properties['slot'] = -1;
        if (this.container.db) {
            var s_cont_node = cont_node.serialize(true);
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { outputs: s_cont_node.outputs } });
            this.container.db.updateNode(cont_node.id, cont_node.container.id, { $set: { size: cont_node.size } });
        }
    };
    ContainerOutputNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        var cont_node = this.container.container_node;
        var slot = this.properties['slot'];
        cont_node.setOutputData(slot, val);
    };
    return ContainerOutputNode;
}(node_1.Node));
exports.ContainerOutputNode = ContainerOutputNode;
container_1.Container.registerNodeType("main/output", ContainerOutputNode);
