/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./nodes", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("./nodes");
    const utils_1 = require("./utils");
    //todo
    // if (!(<any>window)) {
    //     let debug = require('debug')('nodes-engine:     ');
    //     let debugLog = require('debug')('nodes-engine:log  ');
    //     let debugMes = require('debug')('modes-engine:mes  ');
    //     let debugErr = require('debug')('nodes-engine:error');
    //     const nodeDebug = require('debug')('nodes:     ');
    //     const nodeDebugErr = require('debug')('nodes:error');
    //     let config = require('./../../config');
    // }
    class NodesEngine {
        constructor() {
            this.supported_types = ["number", "string", "boolean"];
            this._nodes = [];
            this._nodes_by_id = {};
            this.links = {};
            this.global_inputs = {};
            this.global_outputs = {};
            this.list_of_renderers = null;
            this.container_id = NodesEngine.last_container_id++;
            NodesEngine.containers[this.container_id] = this;
            this.clear();
            utils_1.default.debug("Engine created (id: " + this.container_id + ")", "NODES-ENGINE");
        }
        //used to know which types of connections support this engine (some containers do not allow certain types)
        getSupportedTypes() {
            return this.supported_types;
        }
        /**
         * Removes all nodes from this engine
         */
        clear() {
            this.stop();
            this.isRunning = false;
            this.last_node_id = 0;
            //nodes
            this._nodes = [];
            this._nodes_by_id = {};
            //links
            this.last_link_id = 0;
            this.links = {}; //container with all the links
            //iterations
            this.iteration = 0;
            this.config = {};
            //timing
            this.globaltime = 0;
            this.runningtime = 0;
            this.fixedtime = 0;
            this.fixedtime_lapse = 0.01;
            this.elapsed_time = 0.01;
            this.starttime = 0;
            //globals
            this.global_inputs = {};
            this.global_outputs = {};
            //this.engine = {};
            this.change();
            this.sendActionToRenderer("clear");
        }
        /**
         * Stops the execution loop of the engine
         */
        stop() {
            if (!this.isRunning)
                return;
            this.isRunning = false;
            if (this.onStopEvent)
                this.onStopEvent();
            if (this.execution_timer_id != null)
                clearInterval(this.execution_timer_id);
            this.execution_timer_id = null;
            for (let node of this._nodes) {
                if (node.onStopEngine)
                    node.onStopEngine();
            }
        }
        /**
         * Attach Renderer to this engine
         * @param renderer
         */
        attachRenderer(renderer) {
            if (renderer.engine && renderer.engine != this)
                renderer.engine.detachRenderer(renderer);
            renderer.engine = this;
            if (!this.list_of_renderers)
                this.list_of_renderers = [];
            this.list_of_renderers.push(renderer);
        }
        /**
         * Detach Renderer from this engine
         * @param renderer
         */
        detachRenderer(renderer) {
            if (!this.list_of_renderers)
                return;
            let pos = this.list_of_renderers.indexOf(renderer);
            if (pos == -1)
                return;
            renderer.engine = null;
            this.list_of_renderers.splice(pos, 1);
        }
        /**
         * Starts running this engine every interval milliseconds.
         * @param interval amount of milliseconds between executions
         */
        run(interval = 1) {
            if (this.isRunning)
                return;
            this.isRunning = true;
            if (this.onPlayEvent)
                this.onPlayEvent();
            for (let node of this._nodes) {
                if (node.onRunEngine)
                    node.onRunEngine();
            }
            //launch
            this.starttime = nodes_1.Nodes.getTime();
            let that = this;
            this.execution_timer_id = setInterval(function () {
                //execute
                that.runStep(1);
            }, interval);
        }
        /**
         * Run N steps (cycles) of the engine
         * @param num number of steps to run, default is 1
         */
        runStep(num = 1) {
            let start = nodes_1.Nodes.getTime();
            this.globaltime = 0.001 * (start - this.starttime);
            // try {
            for (let i = 0; i < num; i++) {
                this.updateNodesInputData();
                for (let node of this._nodes) {
                    if (node.onExecute)
                        node.onExecute();
                }
                this.fixedtime += this.fixedtime_lapse;
                if (this.onExecuteStep)
                    this.onExecuteStep();
            }
            if (this.onAfterExecute)
                this.onAfterExecute();
            this.errors_in_execution = false;
            // }
            // catch (err) {
            //     this.errors_in_execution = true;
            //     Utils.debugErr("Error during execution: " + err, this);
            //     this.stop();
            //     throw err;
            // }
            let elapsed = nodes_1.Nodes.getTime() - start;
            if (elapsed == 0)
                elapsed = 1;
            this.elapsed_time = 0.001 * elapsed;
            this.globaltime += 0.001 * elapsed;
            this.iteration += 1;
        }
        updateNodesInputData() {
            let updated_nodes = [];
            for (let node of this._nodes) {
                if (!node.outputs)
                    continue;
                for (let output of node.outputs) {
                    if (output.links == null)
                        continue;
                    for (let linkId of output.links) {
                        let link = this.links[linkId];
                        let target_node = this._nodes[link.target_id];
                        let target_input = target_node.inputs[link.target_slot];
                        if (target_input.data != output.data) {
                            target_input.data = output.data;
                            if (updated_nodes.indexOf(target_node) == -1)
                                updated_nodes.push(target_node);
                        }
                    }
                }
            }
            for (let node of updated_nodes) {
                if (node.onInputUpdated)
                    node.onInputUpdated();
            }
        }
        /**
         * Returns the amount of time the engine has been running in milliseconds
         * @method getTime
         * @returns number of milliseconds the engine has been running
         */
        getTime() {
            return this.globaltime;
        }
        /**
         * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
         * @method getFixedTime
         * @returns number of milliseconds the engine has been running
         */
        getFixedTime() {
            return this.fixedtime;
        }
        /**
         * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
         * if the nodes are using graphical actions
         * @method getElapsedTime
         * @returns number of milliseconds it took the last cycle
         */
        getElapsedTime() {
            return this.elapsed_time;
        }
        /**
         * Sends action to renderer
         * @param action
         * @param params
         */
        sendActionToRenderer(action, params) {
            if (!this.list_of_renderers)
                return;
            for (let i = 0; i < this.list_of_renderers.length; ++i) {
                let c = this.list_of_renderers[i];
                if (c[action])
                    c[action].apply(c, params);
            }
        }
        /**
         * Adds a new node instasnce to this engine
         * @param node the instance of the node
         */
        add(node) {
            if (!node || (node.id != -1 && this._nodes_by_id[node.id] != null))
                return; //already added
            if (this._nodes.length >= nodes_1.Nodes.options.MAX_NUMBER_OF_NODES)
                throw ("Nodes: max number of nodes in a engine reached");
            //give him an id
            if (node.id == null || node.id == -1)
                node.id = this.last_node_id++;
            node.engine = this;
            node.container_id = this.container_id;
            this._nodes.push(node);
            this._nodes_by_id[node.id] = node;
            /*
             // rendering stuf...
             if(node.bgImageUrl)
             node.bgImage = node.loadImage(node.bgImageUrl);
             */
            if (node.onAdded)
                node.onAdded();
            if (this.config.align_to_grid)
                node.alignToGrid();
            if (this.onNodeAdded)
                this.onNodeAdded(node);
            this.setDirtyCanvas(true);
            this.change();
            return node; //to chain actions
        }
        /**
         * Removes a node from the engine
         * @param node the instance of the node
         */
        remove(node) {
            if (this._nodes_by_id[node.id] == null)
                return; //not found
            if (node.ignore_remove)
                return; //cannot be removed
            //disconnect inputs
            if (node.inputs)
                for (let i = 0; i < node.inputs.length; i++) {
                    let slot = node.inputs[i];
                    if (slot.link != null)
                        node.disconnectInput(i);
                }
            //disconnect outputs
            if (node.outputs)
                for (let i = 0; i < node.outputs.length; i++) {
                    let slot = node.outputs[i];
                    if (slot.links != null && slot.links.length)
                        node.disconnectOutput(i);
                }
            //node.id = -1; //why?
            //callback
            if (node.onRemoved)
                node.onRemoved();
            node.engine = null;
            //remove from renderer
            if (this.list_of_renderers) {
                for (let i = 0; i < this.list_of_renderers.length; ++i) {
                    let renderer = this.list_of_renderers[i];
                    if (renderer.selected_nodes[node.id])
                        delete renderer.selected_nodes[node.id];
                    if (renderer.node_dragged == node)
                        renderer.node_dragged = null;
                }
            }
            //remove from containers
            let pos = this._nodes.indexOf(node);
            if (pos != -1)
                this._nodes.splice(pos, 1);
            delete this._nodes_by_id[node.id];
            if (this.onNodeRemoved)
                this.onNodeRemoved(node);
            this.setDirtyCanvas(true, true);
            this.change();
        }
        /**
         * Returns a node by its id.
         * @param id
         */
        getNodeById(id) {
            if (id == null)
                return null;
            return this._nodes_by_id[id];
        }
        /**
         * Returns a list of nodes that matches a class
         * @param classObject the class itself (not an string)
         * @returns a list with all the nodes of this type
         */
        findNodesByClass(classObject) {
            let r = [];
            for (let i = 0, l = this._nodes.length; i < l; ++i)
                if (this._nodes[i].constructor === classObject)
                    r.push(this._nodes[i]);
            return r;
        }
        /**
         * Returns a list of nodes that matches a type
         * @param type the name of the node type
         * @returns a list with all the nodes of this type
         */
        findNodesByType(type) {
            type = type.toLowerCase();
            let r = [];
            for (let i = 0, l = this._nodes.length; i < l; ++i)
                if (this._nodes[i].type.toLowerCase() == type)
                    r.push(this._nodes[i]);
            return r;
        }
        /**
         * Returns a list of nodes that matches a name
         * @param name the name of the node to search
         * @returns a list with all the nodes with this name
         */
        findNodesByTitle(title) {
            let result = [];
            for (let i = 0, l = this._nodes.length; i < l; ++i)
                if (this._nodes[i].title == title)
                    result.push(this._nodes[i]);
            return result;
        }
        /**
         * Returns the top-most node in this position of the renderer
         * @param x the x coordinate in renderer space
         * @param y the y coordinate in renderer space
         * @param nodes_list a list with all the nodes to search from, by default is all the nodes in the engine
         * @returns a list with all the nodes that intersect this coordinate
         */
        getNodeOnPos(x, y, nodes_list) {
            nodes_list = nodes_list || this._nodes;
            for (let i = nodes_list.length - 1; i >= 0; i--) {
                let n = nodes_list[i];
                if (n.isPointInsideNode(x, y, 2))
                    return n;
            }
            return null;
        }
        //
        // // ********** GLOBALS *****************
        //Tell this engine has a global input of this type
        addGlobalInput(name, type, value) {
            this.global_inputs[name] = { name: name, type: type, value: value };
            if (this.onContainerInputAdded)
                this.onContainerInputAdded(name, type);
            if (this.onGlobalsChange)
                this.onGlobalsChange();
        }
        //assign a data to the global input
        setGlobalInputData(name, data) {
            let input = this.global_inputs[name];
            if (!input)
                return;
            input.value = data;
        }
        //assign a data to the global input
        getGlobalInputData(name) {
            let input = this.global_inputs[name];
            if (!input)
                return null;
            return input.value;
        }
        //rename the global input
        renameGlobalInput(old_name, name) {
            if (name == old_name)
                return;
            if (!this.global_inputs[old_name])
                return false;
            if (this.global_inputs[name]) {
                console.error("there is already one input with that name");
                return false;
            }
            this.global_inputs[name] = this.global_inputs[old_name];
            delete this.global_inputs[old_name];
            if (this.onContainerInputRenamed)
                this.onContainerInputRenamed(old_name, name);
            if (this.onGlobalsChange)
                this.onGlobalsChange();
        }
        changeGlobalInputType(name, type) {
            if (!this.global_inputs[name])
                return false;
            if (this.global_inputs[name].type.toLowerCase() == type.toLowerCase())
                return;
            this.global_inputs[name].type = type;
            if (this.onContainerInputTypeChanged)
                this.onContainerInputTypeChanged(name, type);
        }
        removeGlobalInput(name) {
            if (!this.global_inputs[name])
                return false;
            delete this.global_inputs[name];
            if (this.onGlobalInputRemoved)
                this.onGlobalInputRemoved(name);
            if (this.onGlobalsChange)
                this.onGlobalsChange();
            return true;
        }
        addGlobalOutput(name, type, value) {
            this.global_outputs[name] = { name: name, type: type, value: value };
            if (this.onContainerOutputAdded)
                this.onContainerOutputAdded(name, type);
            if (this.onGlobalsChange)
                this.onGlobalsChange();
        }
        //assign a data to the global output
        setGlobalOutputData(name, value) {
            let output = this.global_outputs[name];
            if (!output)
                return;
            output.value = value;
        }
        //assign a data to the global input
        getGlobalOutputData(name) {
            let output = this.global_outputs[name];
            if (!output)
                return null;
            return output.value;
        }
        //rename the global output
        renameGlobalOutput(old_name, name) {
            if (!this.global_outputs[old_name])
                return false;
            if (this.global_outputs[name]) {
                console.error("there is already one output with that name");
                return false;
            }
            this.global_outputs[name] = this.global_outputs[old_name];
            delete this.global_outputs[old_name];
            if (this.onContainerOutputRenamed)
                this.onContainerOutputRenamed(old_name, name);
            if (this.onGlobalsChange)
                this.onGlobalsChange();
        }
        changeGlobalOutputType(name, type) {
            if (!this.global_outputs[name])
                return false;
            if (this.global_outputs[name].type.toLowerCase() == type.toLowerCase())
                return;
            this.global_outputs[name].type = type;
            if (this.onContainerOutputTypeChanged)
                this.onContainerOutputTypeChanged(name, type);
        }
        removeGlobalOutput(name) {
            if (!this.global_outputs[name])
                return false;
            delete this.global_outputs[name];
            if (this.onGlobalOutputRemoved)
                this.onGlobalOutputRemoved(name);
            if (this.onGlobalsChange)
                this.onGlobalsChange();
            return true;
        }
        //
        //     /**
        //      * Assigns a value to all the nodes that matches this name. This is used to create global variables of the node that
        //      * can be easily accesed from the outside of the engine
        //      * @method setInputData
        //      * @param name the name of the node
        //      * @param {*} value value to assign to this node
        //      */
        //     setInputData(name, value) {
        //         let nodes = this.findNodesByName(name);
        //         for (let i = 0, l = nodes.length; i < l; ++i)
        //             nodes[i].setValue(value);
        //     }
        //
        //     /**
        //      * Returns the value of the first node with this name. This is used to access global variables of the engine from the outside
        //      * @method setInputData
        //      * @param name the name of the node
        //      * @returns {*} value of the node
        //      */
        //     getOutputData(name) {
        //         let n = this.findNodesByName(name);
        //         if (n.length)
        //             return m[0].getValue();
        //         return null;
        //     }
        //
        // //This feature is not finished yet, is to create containers where nodes are not executed unless a trigger message is received
        //     triggerInput(name, value) {
        //         let nodes = this.findNodesByName(name);
        //         for (let i = 0; i < nodes.length; ++i)
        //             nodes[i].onTrigger(value);
        //     }
        //
        //     setCallback(name, func) {
        //         let nodes = this.findNodesByName(name);
        //         for (let i = 0; i < nodes.length; ++i)
        //             nodes[i].setTrigger(func);
        //     }
        //
        connectionChange(node) {
            if (this.onConnectionChange)
                this.onConnectionChange(node);
            this.sendActionToRenderer("onConnectionChange");
        }
        /**
         * returns if the engine is in live mode
         * @method isLive
         */
        isLive() {
            if (!this.list_of_renderers)
                return false;
            for (let i = 0; i < this.list_of_renderers.length; ++i) {
                let c = this.list_of_renderers[i];
                if (c.live_mode)
                    return true;
            }
            return false;
        }
        /**
         * Called when something visually changed
         */
        change() {
            this.sendActionToRenderer("setDirty", [true, true]);
            if (this.on_change)
                this.on_change(this);
        }
        /**
         * Set canvas to dirty for update
         * @param foreground
         * @param backgroud
         */
        setDirtyCanvas(foreground, backgroud) {
            this.sendActionToRenderer("setDirty", [foreground, backgroud]);
        }
        /**
         * Creates a Object containing all the info about this engine, it can be serialized
         * @returns value of the node
         */
        serialize() {
            let nodes_info = [];
            for (let i = 0, l = this._nodes.length; i < l; ++i)
                nodes_info.push(this._nodes[i].serialize());
            //remove data from links, we dont want to store it
            // for (let i in this.links) //links is an OBJECT
            //     this.links[i].data = null;
            let data = {
                //		engine: this.engine,
                iteration: this.iteration,
                frame: this.frame,
                last_node_id: this.last_node_id,
                last_link_id: this.last_link_id,
                last_container_id: NodesEngine.last_container_id,
                links: utils_1.default.cloneObject(this.links),
                config: this.config,
                nodes: nodes_info
            };
            return data;
        }
        /**
         * Add nodes to engine from a JSON string
         * @param data JSON string
         * @param keep_old
         */
        configure(data, keep_old = false) {
            if (!keep_old)
                this.clear();
            let nodes = data.nodes;
            //copy all stored fields
            for (let i in data)
                this[i] = data[i];
            let error = false;
            //create nodes
            this._nodes = [];
            for (let i = 0, l = nodes.length; i < l; ++i) {
                let n_info = nodes[i]; //stored info
                let node = nodes_1.Nodes.createNode(n_info.type, n_info.title);
                if (!node) {
                    utils_1.default.debugErr("Node not found: " + n_info.type, this);
                    error = true;
                    continue;
                }
                node.id = n_info.id; //id it or it will create a new id
                this.add(node); //add before configure, otherwise configure cannot create links
                node.configure(n_info);
            }
            this.setDirtyCanvas(true, true);
            return error;
        }
    }
    NodesEngine.last_container_id = 0;
    NodesEngine.containers = {};
    exports.NodesEngine = NodesEngine;
    exports.engine = new NodesEngine();
});
//# sourceMappingURL=nodes-engine.js.map