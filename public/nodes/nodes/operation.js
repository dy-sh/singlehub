/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_1 = require("../node");
var container_1 = require("../container");
var AnyToTrueNode = (function (_super) {
    __extends(AnyToTrueNode, _super);
    function AnyToTrueNode() {
        _super.call(this);
        this.title = "Any to true";
        this.descriprion = "This node sends \"true\" to the output, when anything comes to the input except null.<br/><br/>" +
            "In the settings of the node you can enable the option to send \"false\" immediately after \"true\".";
        this.addInput("value");
        this.addOutput("true", "boolean");
        this.settings["false"] = { description: "Generate False", value: true, type: "boolean" };
    }
    AnyToTrueNode.prototype.onInputUpdated = function () {
        if (this.getInputData(0) == null)
            return;
        this.setOutputData(0, true);
    };
    AnyToTrueNode.prototype.onExecute = function () {
        if (this.settings["false"].value
            && this.outputs[0].data == true)
            this.setOutputData(0, false);
    };
    return AnyToTrueNode;
}(node_1.Node));
container_1.Container.registerNodeType("operation/any-to-true", AnyToTrueNode);
var CounterNode = (function (_super) {
    __extends(CounterNode, _super);
    function CounterNode() {
        _super.call(this);
        this.val = 0;
        this.title = "Counter";
        this.descriprion = "This node increases by 1 an internal counter " +
            "when a logical \"true\" comes  to the input \"Count Up\". <br/>" +
            "The counter decreases by 1 " +
            "when a logical \"true\" comes  to the input \"Count Down\". <br/>" +
            "You can override internal value to the specified value (Set Value). <br/>" +
            "Logical \"true\" on Reset input will set internal value to 0.";
        this.addInput("set value", "number");
        this.addInput("count up", "boolean");
        this.addInput("count down", "boolean");
        this.addInput("reset", "boolean");
        this.addOutput("count", "number");
    }
    CounterNode.prototype.onInputUpdated = function () {
        var old = this.outputs[0].data;
        if (this.inputs[1].updated && this.inputs[1].data == true)
            this.val++;
        if (this.inputs[2].updated && this.inputs[2].data == true)
            this.val--;
        if (this.inputs[0].updated)
            this.val = this.inputs[0].data;
        if (this.inputs[3].updated && this.inputs[3].data == true)
            this.val = 0;
        if (this.val !== old)
            this.setOutputData(0, this.val);
    };
    return CounterNode;
}(node_1.Node));
container_1.Container.registerNodeType("operation/counter", CounterNode);
var StackNode = (function (_super) {
    __extends(StackNode, _super);
    function StackNode() {
        _super.call(this);
        this.data = [];
        this.title = "Stack";
        this.descriprion = "This node stores all the incoming values, and puts them in a stack. <br/>" +
            "You can read the values from the stack at any time. <br/>" +
            "Node can be used as a buffer. <br/>" +
            // "Values are stored in the database and available after restart of the server.";
            this.addInput("add value");
        this.addInput("get value", "boolean");
        this.addInput("clear", "boolean");
        this.addOutput("value");
        this.addOutput("count", "number");
    }
    StackNode.prototype.onInputUpdated = function () {
        if (this.inputs[0].updated && this.inputs[0].data != null) {
            this.data.push(this.inputs[0].data);
            this.setOutputData(1, this.data.length);
        }
        if (this.inputs[1].updated && this.inputs[1].data == true) {
            var val = this.data.length > 0 ? this.data.pop() : null;
            this.setOutputData(0, val);
            this.setOutputData(1, this.data.length);
        }
        if (this.inputs[2].updated && this.inputs[2].data != null) {
            this.data = [];
            this.setOutputData(0, null);
            this.setOutputData(1, 0);
        }
    };
    return StackNode;
}(node_1.Node));
container_1.Container.registerNodeType("operation/stack", StackNode);
var QueueNode = (function (_super) {
    __extends(QueueNode, _super);
    function QueueNode() {
        _super.call(this);
        this.data = [];
        this.title = "Queue";
        this.descriprion = "This node stores all the incoming values, and puts them in a queue. <br/>" +
            "You can read the values from the queue at any time. <br/>" +
            "Node can be used as a buffer. <br/>" +
            "Values are stored in the database and available after restart of the server.";
        this.addInput("add value");
        this.addInput("get value", "boolean");
        this.addInput("clear", "boolean");
        this.addOutput("value");
        this.addOutput("count", "number");
    }
    QueueNode.prototype.onInputUpdated = function () {
        if (this.inputs[0].updated && this.inputs[0].data != null) {
            this.data.unshift(this.inputs[0].data);
            this.setOutputData(1, this.data.length);
        }
        if (this.inputs[1].updated && this.inputs[1].data == true) {
            var val = this.data.length > 0 ? this.data.pop() : null;
            this.setOutputData(0, val);
            this.setOutputData(1, this.data.length);
        }
        if (this.inputs[2].updated && this.inputs[2].data != null) {
            this.data = [];
            this.setOutputData(0, null);
            this.setOutputData(1, 0);
        }
    };
    return QueueNode;
}(node_1.Node));
container_1.Container.registerNodeType("operation/queue", QueueNode);
var CrossfadeNode = (function (_super) {
    __extends(CrossfadeNode, _super);
    function CrossfadeNode() {
        _super.call(this);
        this.title = "Crossfade";
        this.descriprion = "This node makes the crossfade between two values. <br/>" +
            "\"Crossfade\" input takes a value from 0 to 100. <br/>" +
            "If Crossfade is 0, the output will be equal to A. <br/>" +
            "If Crossfade is 100, then the output is equal to B. <br/>" +
            "The intermediate value between 0 and 100 will give " +
            "intermediate number between A and B. ";
        this.addInput("0-100", "number");
        this.addInput("a", "number");
        this.addInput("b", "number");
        this.addOutput("a--b");
    }
    CrossfadeNode.prototype.onInputUpdated = function () {
        var x = this.getInputData(0);
        var a = this.getInputData(1);
        var b = this.getInputData(2);
        var val = a * (1 - x / 100) + b * x / 100;
        this.setOutputData(0, val);
    };
    return CrossfadeNode;
}(node_1.Node));
container_1.Container.registerNodeType("operation/crossfade", CrossfadeNode);
