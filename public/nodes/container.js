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
    class Container {
        constructor() {
            this._nodes = {};
            this._links = {};
            this.supported_types = ["number", "string", "boolean"];
            this.list_of_renderers = null;
            this.id = Container.last_container_id++;
            Container.containers[this.id] = this;
            this.clear();
            utils_1.default.debug("Container created (id: " + this.id + ")", "CONTAINER");
            if (this.id != 0)
                this.socket = exports.rootContainer.socket;
        }
        //used to know which types of connections support this container (some containers do not allow certain types)
        getSupportedTypes() {
            return this.supported_types;
        }
        /**
         * Removes all nodes from this container
         */
        clear() {
            this.stop();
            this.isRunning = false;
            this.last_node_id = 0;
            //nodes
            this._nodes = {};
            //links
            this.last_link_id = 0;
            this._links = {}; //container with all the links
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
            // this.setDirtyCanvas(true, true);
            this.sendActionToRenderer("clear");
        }
        /**
         * Stops the execution loop of the container
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
            for (let id in this._nodes) {
                let node = this._nodes[id];
                if (node.onStopContainer)
                    node.onStopContainer();
            }
        }
        /**
         * Attach Renderer to this container
         * @param renderer
         */
        attachRenderer(renderer) {
            if (renderer.container && renderer.container != this)
                renderer.container.detachRenderer(renderer);
            renderer.container = this;
            if (!this.list_of_renderers)
                this.list_of_renderers = [];
            this.list_of_renderers.push(renderer);
        }
        /**
         * Detach Renderer from this container
         * @param renderer
         */
        detachRenderer(renderer) {
            if (!this.list_of_renderers)
                return;
            let pos = this.list_of_renderers.indexOf(renderer);
            if (pos == -1)
                return;
            renderer.container = null;
            this.list_of_renderers.splice(pos, 1);
        }
        /**
         * Starts running this container every interval milliseconds.
         * @param interval amount of milliseconds between executions
         */
        run(interval = 1) {
            if (this.isRunning)
                return;
            this.isRunning = true;
            if (this.onPlayEvent)
                this.onPlayEvent();
            for (let id in this._nodes) {
                let node = this._nodes[id];
                if (node.onRunContainer)
                    node.onRunContainer();
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
         * Run N steps (cycles) of the container
         * @param num number of steps to run, default is 1
         */
        runStep(num = 1) {
            let start = nodes_1.Nodes.getTime();
            this.globaltime = 0.001 * (start - this.starttime);
            // try {
            for (let i = 0; i < num; i++) {
                this.updateNodesInputData();
                for (let id in this._nodes) {
                    let node = this._nodes[id];
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
            for (let id in this._nodes) {
                let node = this._nodes[id];
                if (!node.outputs)
                    continue;
                for (let output of node.outputs) {
                    if (output.links == null)
                        continue;
                    for (let linkId of output.links) {
                        let link = this._links[linkId];
                        let target_node = this._nodes[link.target_id];
                        if (!target_node) {
                            console.log("ddd");
                        }
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
         * Returns the amount of time the container has been running in milliseconds
         * @method getTime
         * @returns number of milliseconds the container has been running
         */
        getTime() {
            return this.globaltime;
        }
        /**
         * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
         * @method getFixedTime
         * @returns number of milliseconds the container has been running
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
         * Get nodes count
         * @returns {number}
         */
        getNodesCount() {
            return Object.keys(this._nodes).length;
        }
        /**
         * Adds a new node instasnce to this container
         * @param node the instance of the node
         */
        add(node) {
            if (!node || (node.id != -1 && this._nodes[node.id] != null))
                return; //already added
            if (this.getNodesCount() >= nodes_1.Nodes.options.MAX_NUMBER_OF_NODES)
                throw ("Nodes: max number of nodes in a container reached");
            //give him an id
            if (node.id == null || node.id == -1)
                node.id = this.last_node_id++;
            node.container = this;
            this._nodes[node.id] = node;
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
            this.setDirtyCanvas(true, true);
            return node; //to chain actions
        }
        /**
         * Removes a node from the container
         * @param node the instance of the node
         */
        remove(node) {
            if (this._nodes[node.id] == null)
                return;
            if (node.ignore_remove)
                return;
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
            //event
            if (node.onRemoved)
                node.onRemoved();
            node.container = null;
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
            //remove from container
            delete this._nodes[node.id];
            if (this.onNodeRemoved)
                this.onNodeRemoved(node);
            this.setDirtyCanvas(true, true);
        }
        /**
         * Returns a node by its id.
         * @param id
         */
        getNodeById(id) {
            if (id == null)
                return null;
            return this._nodes[id];
        }
        /**
         * Returns a list of nodes that matches a class
         * @param classObject the class itself (not an string)
         * @returns a list with all the nodes of this type
         */
        getNodesByClass(classObject) {
            let r = [];
            for (let id in this._nodes) {
                let node = this._nodes[id];
                if (node.constructor === classObject)
                    r.push(node);
            }
            return r;
        }
        /**
         * Returns a list of nodes that matches a type
         * @param type the name of the node type
         * @returns a list with all the nodes of this type
         */
        getNodesByType(type) {
            type = type.toLowerCase();
            let r = [];
            for (let id in this._nodes) {
                let node = this._nodes[id];
                if (node.type.toLowerCase() == type)
                    r.push(node);
            }
            return r;
        }
        /**
         * Returns a list of nodes that matches a name
         * @param name the name of the node to search
         * @returns a list with all the nodes with this name
         */
        getNodesByTitle(title) {
            let r = [];
            for (let id in this._nodes) {
                let node = this._nodes[id];
                if (node.title == title)
                    r.push(node);
            }
            return r;
        }
        /**
         * Returns the top-most node in this position of the renderer
         * @param x the x coordinate in renderer space
         * @param y the y coordinate in renderer space
         * @param nodes_list a list with all the nodes to search from, by default is all the nodes in the container
         * @returns a list with all the nodes that intersect this coordinate
         */
        getNodeOnPos(x, y, nodes_list) {
            if (nodes_list) {
                for (let i = nodes_list.length - 1; i >= 0; i--) {
                    let n = nodes_list[i];
                    if (n.isPointInsideNode(x, y, 2))
                        return n;
                }
            }
            else {
                for (let id in this._nodes) {
                    let node = this._nodes[id];
                    if (node.isPointInsideNode(x, y, 2))
                        return node;
                }
            }
            return null;
        }
        connectionChange(node) {
            if (this.onConnectionChange)
                this.onConnectionChange(node);
            this.sendActionToRenderer("onConnectionChange");
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
         * Creates a Object containing all the info about this container, it can be serialized
         * @returns value of the node
         */
        serialize(include_nodes = true, include_links = true) {
            let ser_cont = {
                iteration: this.iteration,
                frame: this.frame,
                last_node_id: this.last_node_id,
                last_link_id: this.last_link_id,
                last_container_id: Container.last_container_id,
                config: this.config
            };
            if (include_links) {
                ser_cont._links = utils_1.default.cloneObject(this._links);
            }
            console.log(this._nodes);
            if (include_nodes) {
                let ser_nodes = [];
                for (let id in this._nodes) {
                    let node = this._nodes[id];
                    ser_nodes.push(node.serialize());
                }
                ser_cont.serialized_nodes = ser_nodes;
            }
            return ser_cont;
        }
        /**
         * Add nodes_list to container from a JSON string
         * @param data JSON string
         * @param keep_old
         */
        configure(data, keep_old = false) {
            if (!keep_old)
                this.clear();
            //copy all fields to this container
            for (let i in data) {
                if (i == "serialized_nodes")
                    continue;
                this[i] = data[i];
            }
            let error = false;
            if (data.serialized_nodes) {
                for (let n of data.serialized_nodes) {
                    let node = this.add_serialized_node(n);
                    if (!node)
                        error = true;
                }
            }
            this.setDirtyCanvas(true, true);
            return error;
        }
        /**
         * Deserealize node and add
         * @param serialized_node
         * @returns {Node} result node (for check success)
         */
        add_serialized_node(serialized_node) {
            let node = nodes_1.Nodes.createNode(serialized_node.type, serialized_node.title);
            if (node) {
                node.id = serialized_node.id; //id it or it will create a new id
                this.add(node); //add before configure, otherwise configure cannot create links
                node.configure(serialized_node);
                this.setDirtyCanvas(true, true);
                return node;
            }
        }
    }
    Container.containers = {};
    Container.last_container_id = 0;
    exports.Container = Container;
    exports.rootContainer = new Container();
});
//# sourceMappingURL=container.js.map