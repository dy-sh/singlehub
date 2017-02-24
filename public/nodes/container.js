/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
"use strict";
var nodes_1 = require("./nodes");
var utils_1 = require("./utils");
//console logger back and front
var log;
if (typeof (window) === 'undefined')
    log = require('logplease').create('container', { color: 5 });
else
    log = Logger.create('container', { color: 5 });
var Container = (function () {
    function Container(id) {
        this._nodes = {};
        this.supported_types = ["number", "string", "boolean"];
        this.list_of_renderers = null;
        this.id = id || ++Container.last_container_id;
        Container.containers[this.id] = this;
        this.clear();
        log.debug("Container created [" + this.id + "]");
        var rootContainer = Container.containers[0];
        if (rootContainer) {
            if (rootContainer.socket)
                this.socket = rootContainer.socket;
            if (rootContainer.db)
                this.db = rootContainer.db;
        }
    }
    //used to know which types of connections support this container (some containers do not allow certain types)
    Container.prototype.getSupportedTypes = function () {
        return this.supported_types;
    };
    /**
     * Removes all nodes from this container
     */
    Container.prototype.clear = function () {
        this.stop();
        this.isRunning = false;
        this.last_node_id = 0;
        //nodes
        this._nodes = {};
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
    };
    /**
     * Stops the execution loop of the container
     */
    Container.prototype.stop = function () {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        if (this.onStopEvent)
            this.onStopEvent();
        if (this.execution_timer_id != null)
            clearInterval(this.execution_timer_id);
        this.execution_timer_id = null;
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (node.onStopContainer)
                node.onStopContainer();
        }
    };
    /**
     * Attach Renderer to this container
     * @param renderer
     */
    Container.prototype.attachRenderer = function (renderer) {
        if (renderer.container && renderer.container != this)
            renderer.container.detachRenderer(renderer);
        renderer.container = this;
        if (!this.list_of_renderers)
            this.list_of_renderers = [];
        this.list_of_renderers.push(renderer);
    };
    /**
     * Detach Renderer from this container
     * @param renderer
     */
    Container.prototype.detachRenderer = function (renderer) {
        if (!this.list_of_renderers)
            return;
        var pos = this.list_of_renderers.indexOf(renderer);
        if (pos == -1)
            return;
        renderer.container = null;
        this.list_of_renderers.splice(pos, 1);
    };
    /**
     * Starts running this container every interval milliseconds.
     * @param interval amount of milliseconds between executions
     */
    Container.prototype.run = function (interval) {
        if (interval === void 0) { interval = 1; }
        if (this.isRunning)
            return;
        this.isRunning = true;
        if (this.onPlayEvent)
            this.onPlayEvent();
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (node.onRunContainer)
                node.onRunContainer();
        }
        //launch
        this.starttime = utils_1.default.getTime();
        var that = this;
        this.execution_timer_id = setInterval(function () {
            //execute
            that.runStep(1);
        }, interval);
    };
    /**
     * Run N steps (cycles) of the container
     * @param steps number of steps to run, default is 1
     */
    Container.prototype.runStep = function (steps) {
        if (steps === void 0) { steps = 1; }
        var start = utils_1.default.getTime();
        this.globaltime = 0.001 * (start - this.starttime);
        // try {
        for (var i = 0; i < steps; i++) {
            this.transferDataBetweenNodes();
            for (var id in this._nodes) {
                var node = this._nodes[id];
                if (node.onExecute)
                    node.onExecute();
                if (node.isUpdated) {
                    if (node.onInputUpdated)
                        node.onInputUpdated();
                    node.isUpdated = false;
                    for (var i_1 in node.inputs)
                        if (node.inputs[i_1].updated)
                            node.inputs[i_1].updated = false;
                }
            }
            this.fixedtime += this.fixedtime_lapse;
            if (this.onExecuteStep)
                this.onExecuteStep();
        }
        if (this.onAfterExecute)
            this.onAfterExecute();
        // this.errors_in_execution = false;
        // }
        // catch (err) {
        //     this.errors_in_execution = true;
        //     log.error("Error during execution: " + err, this);
        //     this.stop();
        //     throw err;
        // }
        var elapsed = utils_1.default.getTime() - start;
        if (elapsed == 0)
            elapsed = 1;
        this.elapsed_time = 0.001 * elapsed;
        this.globaltime += 0.001 * elapsed;
        this.iteration += 1;
    };
    Container.prototype.transferDataBetweenNodes = function () {
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (!node.outputs)
                continue;
            for (var o in node.outputs) {
                var output = node.outputs[o];
                if (output.links == null)
                    continue;
                for (var _i = 0, _a = output.links; _i < _a.length; _i++) {
                    var link = _a[_i];
                    var target_node = this._nodes[link.target_node_id];
                    if (!target_node) {
                        log.error("Can't transfer data from node " + node.getReadableId() + ". Target node not found");
                        continue;
                    }
                    var target_input = target_node.inputs[link.target_slot];
                    if (target_input.data !== output.data) {
                        target_input.data = output.data;
                        target_node.isUpdated = true;
                        target_input.updated = true;
                    }
                }
            }
        }
    };
    /**
     * Returns the amount of time the container has been running in milliseconds
     * @method getTime
     * @returns number of milliseconds the container has been running
     */
    Container.prototype.getTime = function () {
        return this.globaltime;
    };
    /**
     * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
     * @method getFixedTime
     * @returns number of milliseconds the container has been running
     */
    Container.prototype.getFixedTime = function () {
        return this.fixedtime;
    };
    /**
     * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
     * if the nodes are using graphical actions
     * @method getElapsedTime
     * @returns number of milliseconds it took the last cycle
     */
    Container.prototype.getElapsedTime = function () {
        return this.elapsed_time;
    };
    /**
     * Sends action to renderer
     * @param action
     * @param params
     */
    Container.prototype.sendActionToRenderer = function (action, params) {
        if (!this.list_of_renderers)
            return;
        for (var i = 0; i < this.list_of_renderers.length; ++i) {
            var c = this.list_of_renderers[i];
            if (c[action])
                c[action].apply(c, params);
        }
    };
    /**
     * Get nodes count
     * @returns {number}
     */
    Container.prototype.getNodesCount = function () {
        return Object.keys(this._nodes).length;
    };
    Container.prototype.create = function (node) {
        if (node.onBeforeCreated)
            node.onBeforeCreated();
        this.add(node);
        if (node.onAfterCreated)
            node.onAfterCreated();
        if (this.db) {
            this.db.addNode(node);
            if (this.id == 0)
                this.db.updateLastRootNodeId(this.last_node_id);
            else
                this.db.updateNode(this.container_node.id, this.container_node.container.id, { "sub_container.last_node_id": this.container_node.sub_container.last_node_id });
        }
        log.debug("New node created: " + node.getReadableId());
    };
    /**
     * Adds a new node instasnce to this container
     * @param node the instance of the node
     */
    Container.prototype.add = function (node) {
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
    };
    /**
     * Removes a node from the container
     * @param node the instance of the node
     */
    Container.prototype.remove = function (node) {
        if (this._nodes[node.id] == null)
            return;
        if (node.ignore_remove)
            return;
        //disconnect inputs
        if (node.inputs)
            for (var i in node.inputs) {
                var input = node.inputs[i];
                if (input.link != null)
                    node.disconnectInput(+i);
            }
        //disconnect outputs
        if (node.outputs)
            for (var o in node.outputs) {
                var output = node.outputs[o];
                if (output.links != null && output.links.length > 0)
                    node.disconnectOutput(+o);
            }
        //event
        if (node.onRemoved)
            node.onRemoved();
        //remove from renderer
        if (this.list_of_renderers) {
            for (var i = 0; i < this.list_of_renderers.length; ++i) {
                var renderer = this.list_of_renderers[i];
                if (renderer.selected_nodes[node.id])
                    delete renderer.selected_nodes[node.id];
                if (renderer.node_dragged == node)
                    renderer.node_dragged = null;
            }
        }
        //remove from container
        delete this._nodes[node.id];
        log.debug("Node deleted: " + node.getReadableId());
        node.container = null;
        if (this.onNodeRemoved)
            this.onNodeRemoved(node);
        if (this.db)
            this.db.removeNode(node.id, this.id);
        this.setDirtyCanvas(true, true);
    };
    /**
     * Returns a node by its id.
     * @param id
     */
    Container.prototype.getNodeById = function (id) {
        if (id == null)
            return null;
        return this._nodes[id];
    };
    /**
     * Returns a list of nodes that matches a class
     * @param classObject the class itself (not an string)
     * @returns a list with all the nodes of this type
     */
    Container.prototype.getNodesByClass = function (classObject) {
        var r = [];
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (node.constructor === classObject)
                r.push(node);
        }
        return r;
    };
    /**
     * Returns a list of nodes that matches a type
     * @param type the name of the node type
     * @returns a list with all the nodes of this type
     */
    Container.prototype.getNodesByType = function (type) {
        type = type.toLowerCase();
        var r = [];
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (node.type.toLowerCase() == type)
                r.push(node);
        }
        return r;
    };
    /**
     * Returns a list of nodes that matches a name
     * @param name the name of the node to search
     * @returns a list with all the nodes with this name
     */
    Container.prototype.getNodesByTitle = function (title) {
        var r = [];
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (node.title == title)
                r.push(node);
        }
        return r;
    };
    /**
     * Returns the top-most node in this position of the renderer
     * @param x the x coordinate in renderer space
     * @param y the y coordinate in renderer space
     * @param nodes_list a list with all the nodes to search from, by default is all the nodes in the container
     * @returns a list with all the nodes that intersect this coordinate
     */
    Container.prototype.getNodeOnPos = function (x, y, nodes_list) {
        if (nodes_list) {
            for (var i = nodes_list.length - 1; i >= 0; i--) {
                var n = nodes_list[i];
                if (n.isPointInsideNode(x, y, 2))
                    return n;
            }
        }
        else {
            for (var id in this._nodes) {
                var node = this._nodes[id];
                if (node.isPointInsideNode(x, y, 2))
                    return node;
            }
        }
        return null;
    };
    Container.prototype.connectionChange = function (node) {
        if (this.onConnectionChange)
            this.onConnectionChange(node);
        this.sendActionToRenderer("onConnectionChange");
    };
    /**
     * Set canvas to dirty for update
     * @param foreground
     * @param backgroud
     */
    Container.prototype.setDirtyCanvas = function (foreground, backgroud) {
        this.sendActionToRenderer("setDirty", [foreground, backgroud]);
    };
    /**
     * Creates a Object containing all the info about this container, it can be serialized
     * @returns value of the node
     */
    Container.prototype.serialize = function (include_nodes) {
        if (include_nodes === void 0) { include_nodes = true; }
        var data = {
            id: this.id,
            last_node_id: this.last_node_id,
            config: this.config
        };
        if (include_nodes) {
            var ser_nodes = [];
            for (var id in this._nodes) {
                var node = this._nodes[id];
                ser_nodes.push(node.serialize());
            }
            data.serialized_nodes = ser_nodes;
        }
        if (this.id == 0)
            data.last_container_id = Container.last_container_id;
        return data;
    };
    /**
     * Add nodes_list to container from a JSON string
     * @param data JSON string
     * @param keep_old
     */
    Container.prototype.configure = function (data, keep_old) {
        if (keep_old === void 0) { keep_old = false; }
        if (!keep_old)
            this.clear();
        //copy all fields to this container
        for (var i in data) {
            if (i == "serialized_nodes")
                continue;
            this[i] = data[i];
        }
        var error = false;
        if (data.serialized_nodes) {
            for (var _i = 0, _a = data.serialized_nodes; _i < _a.length; _i++) {
                var n = _a[_i];
                var node = this.add_serialized_node(n);
                if (!node)
                    error = true;
            }
        }
        if (data.last_container_id)
            Container.last_container_id = data.last_container_id;
        this.setDirtyCanvas(true, true);
        return error;
    };
    /**
     * Deserealize node and add
     * @param serialized_node
     * @returns {Node} result node (for check success)
     */
    Container.prototype.add_serialized_node = function (serialized_node, from_db) {
        if (from_db === void 0) { from_db = false; }
        var node = nodes_1.Nodes.createNode(serialized_node.type, serialized_node.title);
        if (node) {
            node.id = serialized_node.id;
            node.configure(serialized_node, from_db);
            this.add(node);
            this.setDirtyCanvas(true, true);
            return node;
        }
    };
    Container.prototype.getParentsStack = function () {
        var stack = [];
        if (this.parent_container_id) {
            var parentCont = Container.containers[this.parent_container_id];
            for (var i = 0; i < 1000; i++) {
                stack.push(parentCont.id);
                if (!parentCont.parent_container_id)
                    break;
                parentCont = Container.containers[parentCont.parent_container_id];
            }
        }
        stack.push(0);
        return stack;
    };
    Container.prototype.mooveNodesToNewContainer = function (ids, pos) {
        //prevent move input/output nodes
        var l = ids.length;
        while (l--) {
            var node = this.getNodeById(ids[l]);
            if (node.type == "main/input" || node.type == "main/output")
                ids.splice(l, 1);
        }
        if (ids.length == 0)
            return;
        //create new container
        var new_cont_node = nodes_1.Nodes.createNode("main/container");
        new_cont_node.pos = pos;
        this.create(new_cont_node);
        var new_cont = new_cont_node.sub_container;
        new_cont.last_node_id = this.last_node_id;
        if (this.db)
            this.db.updateNode(new_cont_node.id, this.id, { "sub_container.last_node_id": new_cont_node.sub_container.last_node_id });
        // move nodes
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var node = this.getNodeById(id);
            node.container = new_cont;
            delete this._nodes[node.id];
            new_cont._nodes[node.id] = node;
            if (this.db) {
                this.db.removeNode(node.id, this.id);
                this.db.addNode(node);
            }
        }
        //create container inputs
        for (var _a = 0, ids_2 = ids; _a < ids_2.length; _a++) {
            var id = ids_2[_a];
            var node = new_cont.getNodeById(id);
            if (node.inputs) {
                for (var i in node.inputs) {
                    var input = node.inputs[i];
                    if (input.link) {
                        var old_target = this._nodes[input.link.target_node_id];
                        if (old_target) {
                            //create input node
                            var input_node = nodes_1.Nodes.createNode("main/input");
                            input_node.pos = utils_1.default.cloneObject(old_target.pos);
                            input_node.outputs[0].links = [{ target_node_id: node.id, target_slot: +i }];
                            //find input new pos (for prevent overlapping with the same input)
                            for (var n in new_cont._nodes) {
                                if (new_cont._nodes[n] != input_node) {
                                    if (input_node.pos[0] == new_cont._nodes[n].pos[0]
                                        && input_node.pos[1] == new_cont._nodes[n].pos[1])
                                        input_node.pos[1] += 15;
                                }
                            }
                            new_cont.create(input_node);
                            //connect new cont input to old target
                            new_cont_node.inputs[input_node.properties.slot].link =
                                { target_node_id: input.link.target_node_id, target_slot: input.link.target_slot };
                            //reconnect old target node to cont input
                            var t_out_links = old_target.outputs[input.link.target_slot].links;
                            for (var _b = 0, t_out_links_1 = t_out_links; _b < t_out_links_1.length; _b++) {
                                var out_link = t_out_links_1[_b];
                                if (out_link.target_node_id == node.id && out_link.target_slot == +i) {
                                    out_link.target_node_id = new_cont_node.id;
                                    out_link.target_slot = input_node.properties.slot;
                                }
                            }
                            //reconnect node to new input node
                            input.link.target_node_id = input_node.id;
                            input.link.target_slot = 0;
                            if (this.db) {
                                var s_old_target = old_target.serialize(true);
                                var s_node = node.serialize(true);
                                this.db.updateNode(old_target.id, this.id, { outputs: s_old_target.outputs });
                                this.db.updateNode(node.id, new_cont.id, { inputs: s_node.inputs });
                            }
                        }
                    }
                }
            }
        }
        //create container outputs
        for (var _c = 0, ids_3 = ids; _c < ids_3.length; _c++) {
            var id = ids_3[_c];
            var node = new_cont.getNodeById(id);
            if (node.outputs) {
                for (var o in node.outputs) {
                    var output = node.outputs[o];
                    if (output.links) {
                        for (var _d = 0, _e = output.links; _d < _e.length; _d++) {
                            var link = _e[_d];
                            var old_target = this._nodes[link.target_node_id];
                            if (old_target) {
                                //create output node
                                var output_node = nodes_1.Nodes.createNode("main/output");
                                output_node.pos = utils_1.default.cloneObject(old_target.pos);
                                output_node.inputs[0].link = { target_node_id: node.id, target_slot: +o };
                                //find input new pos (for prevent overlapping with the same input)
                                for (var n in new_cont._nodes) {
                                    if (new_cont._nodes[n] != output_node) {
                                        if (output_node.pos[0] == new_cont._nodes[n].pos[0]
                                            && output_node.pos[1] == new_cont._nodes[n].pos[1])
                                            output_node.pos[1] += 15;
                                    }
                                }
                                new_cont.create(output_node);
                                //connect new cont output to old target
                                new_cont_node.outputs[output_node.properties.slot].links = [{
                                        target_node_id: link.target_node_id,
                                        target_slot: link.target_slot
                                    }];
                                //reconnect old target node to cont output
                                var in_link = old_target.inputs[link.target_slot].link;
                                in_link.target_node_id = new_cont_node.id;
                                in_link.target_slot = output_node.properties.slot;
                                //reconnect node to new output node
                                link.target_node_id = output_node.id;
                                link.target_slot = 0;
                                if (this.db) {
                                    var s_old_target = old_target.serialize(true);
                                    var s_node = node.serialize(true);
                                    this.db.updateNode(old_target.id, this.id, { inputs: s_old_target.inputs });
                                    this.db.updateNode(node.id, new_cont.id, { outputs: s_node.outputs });
                                }
                            }
                        }
                    }
                }
                if (this.db) {
                    var s_new_cont_node = new_cont_node.serialize(true);
                    this.db.updateNode(new_cont_node.id, this.id, { inputs: s_new_cont_node.inputs });
                    this.db.updateNode(new_cont_node.id, this.id, { outputs: s_new_cont_node.outputs });
                }
            }
        }
    };
    Container.containers = {};
    Container.last_container_id = -1;
    return Container;
}());
exports.Container = Container;
// export let rootContainer = new Container();
