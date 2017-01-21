/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

// namespace MyNodes {

    let debug = require('debug')('nodes:            ');
    let debugLog = require('debug')('nodes:log         ');
    let debugMes = require('debug')('modes:mes         ');
    let debugErr = require('debug')('nodes:error       ');
    // let nodes = require('./../nodes').MyNodes.Nodes;
    //let Node = require('./../nodes').MyNodes.Node;

import {Nodes as nodes, Node} from "./../nodes";


//Show value inside the debug console
    export class Console extends Node {
        constructor() {
            super();
            this.title = "Console";
            this.desc = "Show value inside the console";
            this.size = [60, 20];
            this.addInput("data");
        }

        onExecute() {
            console.log("CONSOLE NODE: " + this.getInputData(0));
        }
    }

    nodes.registerNodeType("basic/console", Console);




//Constant
        class Constant extends Node {
            constructor() {
                super();
                this.title = "Const";
                this.desc = "Constant value";
                this.addOutput("value", "number");
                this.properties = {value: 1.0};
                this.editable = {property: "value", type: "number"};
            }

            setValue(v) {
                if (typeof(v) == "string") v = parseFloat(v);
                this.properties["value"] = v;
            }

            onExecute() {
                this.setOutputData(0, parseFloat(this.properties["value"]));
            }

            onDrawBackground(ctx) {
                //show the current value
                this.outputs[0].label = this.properties["value"].toFixed(3);
            }

            onWidget(e, widget) {
                if (widget.name == "value")
                    this.setValue(widget.value);
            }
        }




        nodes.registerNodeType("basic/const", Constant);
//

//
//
// //Subgraph: a node that contains a graph
//         class Subgraph extends Node {
//             constructor() {
//                 super();
//                 let that = this;
//                 this.size = [120, 60];
//
//                 //create inner graph
//                 this.subgraph = new nodesEngine();
//                 this.subgraph._subgraph_node = this;
//                 this.subgraph._is_subgraph = true;
//
//                 this.subgraph.onGlobalInputAdded = this.onSubgraphNewGlobalInput.bind(this);
//                 this.subgraph.onGlobalInputRenamed = this.onSubgraphRenamedGlobalInput.bind(this);
//                 this.subgraph.onGlobalInputTypeChanged = this.onSubgraphTypeChangeGlobalInput.bind(this);
//
//                 this.subgraph.onGlobalOutputAdded = this.onSubgraphNewGlobalOutput.bind(this);
//                 this.subgraph.onGlobalOutputRenamed = this.onSubgraphRenamedGlobalOutput.bind(this);
//                 this.subgraph.onGlobalOutputTypeChanged = this.onSubgraphTypeChangeGlobalOutput.bind(this);
//
//
//                 this.bgcolor = "#940";
//             }
//
//             onSubgraphNewGlobalInput(name, type) {
//                 //add input to the node
//                 this.addInput(name, type);
//             }
//
//             onSubgraphRenamedGlobalInput(oldname, name) {
//                 let slot = this.findInputSlot(oldname);
//                 if (slot == -1)
//                     return;
//                 let info = this.getInputInfo(slot);
//                 info.name = name;
//             }
//
//             onSubgraphTypeChangeGlobalInput(name, type) {
//                 let slot = this.findInputSlot(name);
//                 if (slot == -1)
//                     return;
//                 let info = this.getInputInfo(slot);
//                 info.type = type;
//             }
//
//             onSubgraphNewGlobalOutput(name, type) {
//                 //add output to the node
//                 this.addOutput(name, type);
//             }
//
//             onSubgraphRenamedGlobalOutput(oldname, name) {
//                 let slot = this.findOutputSlot(oldname);
//                 if (slot == -1)
//                     return;
//                 let info = this.getOutputInfo(slot);
//                 info.name = name;
//             }
//
//             onSubgraphTypeChangeGlobalOutput(name, type) {
//                 let slot = this.findOutputSlot(name);
//                 if (slot == -1)
//                     return;
//                 let info = this.getOutputInfo(slot);
//                 info.type = type;
//             }
//
//             getExtraMenuOptions(graphcanvas) {
//                 let that = this;
//                 return [{
//                     content: "Open", callback: function () {
//                         graphcanvas.openSubgraph(that.subgraph);
//                     }
//                 }];
//             }
//
//             onExecute() {
//                 //send inputs to subgraph global inputs
//                 if (this.inputs)
//                     for (let i = 0; i < this.inputs.length; i++) {
//                         let input = this.inputs[i];
//                         let value = this.getInputData(i);
//                         this.subgraph.setGlobalInputData(input.name, value);
//                     }
//
//                 //execute
//                 this.subgraph.runStep();
//
//                 //send subgraph global outputs to outputs
//                 if (this.outputs)
//                     for (let i = 0; i < this.outputs.length; i++) {
//                         let output = this.outputs[i];
//                         let value = this.subgraph.getGlobalOutputData(output.name);
//                         this.setOutputData(i, value);
//                     }
//             }
//
//             configure(o) {
//                 Node.prototype.configure.call(this, o);
//                 //this.subgraph.configure(o.graph);
//             }
//
//             serialize() {
//                 let data = Node.prototype.serialize.call(this);
//                 data.subgraph = this.subgraph.serialize();
//                 return data;
//             }
//
//             clone() {
//                 let node = nodes.createNode(this.type);
//                 let data = this.serialize();
//                 delete data["id"];
//                 delete data["inputs"];
//                 delete data["outputs"];
//                 node.configure(data);
//                 return node;
//             }
//         }
//
//         Subgraph.title = "Subgraph";
//         Subgraph.desc = "Graph inside a node";
//
//
//         nodes.registerNodeType("graph/subgraph", Subgraph);
//
//
// //Input for a subgraph
//         class GlobalInput extends Node {
//             constructor() {
//                 super();
//
//                 //random name to avoid problems with other outputs when added
//                 let input_name = "input_" + (Math.random() * 1000).toFixed();
//
//                 this.addOutput(input_name, null);
//
//                 this.properties = {name: input_name, type: null};
//
//                 let that = this;
//
//                 Object.defineProperty(this.properties, "name", {
//                     get: function () {
//                         return input_name;
//                     },
//                     set: function (v) {
//                         if (v == "")
//                             return;
//
//                         let info = that.getOutputInfo(0);
//                         if (info.name == v)
//                             return;
//                         info.name = v;
//                         if (that.graph)
//                             that.graph.renameGlobalInput(input_name, v);
//                         input_name = v;
//                     },
//                     enumerable: true
//                 });
//
//                 Object.defineProperty(this.properties, "type", {
//                     get: function () {
//                         return that.outputs[0].type;
//                     },
//                     set: function (v) {
//                         that.outputs[0].type = v;
//                         if (that.graph)
//                             that.graph.changeGlobalInputType(input_name, that.outputs[0].type);
//                     },
//                     enumerable: true
//                 });
//             }
//
// //When added to graph tell the graph this is a new global input
//             onAdded() {
//                 this.graph.addGlobalInput(this.properties.name, this.properties.type);
//             }
//
//             onExecute() {
//                 let name = this.properties.name;
//
//                 //read from global input
//                 let data = this.graph.global_inputs[name];
//                 if (!data) return;
//
//                 //put through output
//                 this.setOutputData(0, data.value);
//             }
//         }
//
//         GlobalInput.title = "Input";
//         GlobalInput.desc = "Input of the graph";
//
//         nodes.registerNodeType("graph/input", GlobalInput);
//
//
// //Output for a subgraph
//         class GlobalOutput extends Node {
//             constructor() {
//                 super();
//                 //random name to avoid problems with other outputs when added
//                 let output_name = "output_" + (Math.random() * 1000).toFixed();
//
//                 this.addInput(output_name, null);
//
//                 this.properties = {name: output_name, type: null};
//
//                 let that = this;
//
//                 Object.defineProperty(this.properties, "name", {
//                     get: function () {
//                         return output_name;
//                     },
//                     set: function (v) {
//                         if (v == "")
//                             return;
//
//                         let info = that.getInputInfo(0);
//                         if (info.name == v)
//                             return;
//                         info.name = v;
//                         if (that.graph)
//                             that.graph.renameGlobalOutput(output_name, v);
//                         output_name = v;
//                     },
//                     enumerable: true
//                 });
//
//                 Object.defineProperty(this.properties, "type", {
//                     get: function () {
//                         return that.inputs[0].type;
//                     },
//                     set: function (v) {
//                         that.inputs[0].type = v;
//                         if (that.graph)
//                             that.graph.changeGlobalInputType(output_name, that.inputs[0].type);
//                     },
//                     enumerable: true
//                 });
//             }
//
//             onAdded() {
//                 let name = this.graph.addGlobalOutput(this.properties.name, this.properties.type);
//             }
//
//             onExecute() {
//                 this.graph.setGlobalOutputData(this.properties.name, this.getInputData(0));
//             }
//         }
//
//         GlobalOutput.title = "Ouput";
//         GlobalOutput.desc = "Output of the graph";
//
//         nodes.registerNodeType("graph/output", GlobalOutput);
//
//
//
// //Watch a value in the editor
//         class Watch extends Node {
//             constructor() {
//                 super();
//                 this.size = [60, 20];
//                 this.addInput("value", 0, {label: ""});
//                 this.addOutput("value", 0, {label: ""});
//                 this.properties = {value: ""};
//             }
//
//             onExecute() {
//                 this.properties.value = this.getInputData(0);
//                 this.setOutputData(0, this.properties.value);
//             }
//
//             onDrawBackground(ctx) {
//                 //show the current value
//                 if (this.inputs[0] && this.properties["value"] != null) {
//                     if (this.properties["value"].constructor === Number)
//                         this.inputs[0].label = this.properties["value"].toFixed(3);
//                     else {
//                         let str = this.properties["value"];
//                         if (str && str.length) //convert typed to array
//                             str = Array.prototype.slice.call(str).join(",");
//                         this.inputs[0].label = str;
//                     }
//                 }
//             }
//         }
//
//         Watch.title = "Watch";
//         Watch.desc = "Show value of input";
//
//         nodes.registerNodeType("basic/watch", Watch);




// }