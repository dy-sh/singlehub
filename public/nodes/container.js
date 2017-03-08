/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_1 = require("./node");
var utils_1 = require("./utils");
var emitter_1 = require('../js/emitter/emitter');
//console logger back and front
var log;
if (typeof (window) === 'undefined')
    log = require('logplease').create('container', { color: 5 });
else
    log = Logger.create('container', { color: 5 });
(function (Side) {
    Side[Side["server"] = 0] = "server";
    Side[Side["editor"] = 1] = "editor";
    Side[Side["dashboard"] = 2] = "dashboard";
})(exports.Side || (exports.Side = {}));
var Side = exports.Side;
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(side, id) {
        _super.call(this);
        this._nodes = {};
        this.supported_types = ["number", "string", "boolean"];
        if (typeof side != "number")
            throw "Container side is not defined";
        this.renderers = null;
        this.id = id || ++Container.last_container_id;
        if (this.id == 0)
            this.name = "Main";
        this.side = side;
        Container.containers[this.id] = this;
        this.clear();
        log.debug("Container created [" + this.id + "]");
        var rootContainer = Container.containers[0];
        if (rootContainer) {
            if (rootContainer.server_dashboard_socket)
                this.server_dashboard_socket = rootContainer.server_dashboard_socket;
            if (rootContainer.server_editor_socket)
                this.server_editor_socket = rootContainer.server_editor_socket;
            if (rootContainer.clinet_socket)
                this.clinet_socket = rootContainer.clinet_socket;
            if (rootContainer.db)
                this.db = rootContainer.db;
            if (rootContainer._events)
                this._events = rootContainer._events;
        }
    }
    /**
     * Register a node class so it can be listed when the user wants to create a new one
     * @param type name of the node and path
     * @param node_class class containing the structure of a node
     */
    Container.registerNodeType = function (type, node_class) {
        if (!(node_class.prototype instanceof node_1.Node))
            throw ("Can't register node of type [" + type + "]. Class must inherit Node base class!");
        node_class.type = type;
        node_class.category = type.substr(0, type.lastIndexOf("/"));
        node_class.node_name = type.substr(type.lastIndexOf("/") + 1, type.length);
        this.nodes_types[type] = node_class;
        log.debug("Node registered: " + type);
    };
    ;
    /**
     * Returns a registered node type with a given name
     * @param type full name of the node class. p.e. "math/sin"
     * @returns {Node} the node class
     */
    Container.getNodeType = function (type) {
        return this.nodes_types[type];
    };
    ;
    /**
     * Returns a list of node types matching one category
     * @param category category name
     * @returns {Array} array with all the node classes
     */
    Container.getNodeTypesInCategory = function (category) {
        var r = [];
        for (var i in this.nodes_types)
            if (category == "") {
                if (this.nodes_types[i].category == null)
                    r.push(this.nodes_types[i]);
            }
            else if (this.nodes_types[i].category == category)
                r.push(this.nodes_types[i]);
        return r;
    };
    ;
    /**
     * Returns a list with all the node type categories
     * @returns {Array} array with all the names of the categories
     */
    Container.getNodeTypesCategories = function () {
        var categories = { "": 1 };
        for (var i in this.nodes_types)
            if (this.nodes_types[i].category)
                categories[this.nodes_types[i].category] = 1;
        var result = [];
        for (var i in categories)
            result.push(i);
        return result;
    };
    ;
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
            if (node['onStopContainer'])
                node['onStopContainer']();
        }
    };
    /**
     * Attach renderer to this container
     * @param renderer
     */
    Container.prototype.attachRenderer = function (renderer) {
        if (renderer.container && renderer.container != this)
            renderer.container.detachRenderer(renderer);
        renderer.container = this;
        if (!this.renderers)
            this.renderers = [];
        this.renderers.push(renderer);
    };
    /**
     * Detach renderer from this container
     * @param renderer
     */
    Container.prototype.detachRenderer = function (renderer) {
        if (!this.renderers)
            return;
        var pos = this.renderers.indexOf(renderer);
        if (pos == -1)
            return;
        renderer.container = null;
        this.renderers.splice(pos, 1);
        if (this.renderers.length == 0)
            delete this.renderers;
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
            if (node['onRunContainer'])
                node['onRunContainer']();
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
                if (node['onExecute'])
                    node['onExecute']();
                if (node.isUpdated) {
                    if (node['onInputUpdated'])
                        node['onInputUpdated']();
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
        //all nodes
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (!node.outputs)
                continue;
            //all outputs
            for (var o in node.outputs) {
                var output = node.outputs[o];
                if (!output.updated)
                    continue;
                output.updated = false;
                if (output.links == null)
                    continue;
                //all output links
                for (var _i = 0, _a = output.links; _i < _a.length; _i++) {
                    var link = _a[_i];
                    var target_node = this._nodes[link.target_node_id];
                    if (!target_node) {
                        log.error("Can't transfer data from node " + node.getReadableId() + ". Target node not found");
                        continue;
                    }
                    var target_input = target_node.inputs[link.target_slot];
                    target_input.data = utils_1.default.formatValue(output.data, target_input.type);
                    target_node.isUpdated = true;
                    target_input.updated = true;
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
        if (!this.renderers)
            return;
        for (var i = 0; i < this.renderers.length; ++i) {
            var c = this.renderers[i];
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
    /**
     * Create node and add to container
     * You can define any additional node properties or/and serialized node info.
     * If properties.id && serialized_node.id is not defined, container will create a new instance of node,
     * generate new id, call node.onCreated? store it node in db, and call node.onAdded.
     * If properties.id || serialized_node.id is defined, it will create node, add and call node.onAdded
     * (will not store node in db).
     * @param type type of node
     * @param properties set any additional node properties (pos, size, etc...)
     * @param serialized_node configure node from serialized info
     * @returns {Node}
     */
    Container.prototype.createNode = function (type, properties, serialized_node) {
        //check class exist
        var node_class = Container.nodes_types[type];
        if (!node_class) {
            log.error("Can't create node. Node class of type [" + type + "] not registered.");
            return null;
        }
        //get node id
        var id;
        var is_new = false;
        if (properties && properties.id != null)
            id = properties.id;
        else if (serialized_node && serialized_node.id != null)
            id = serialized_node.id;
        else {
            id = this.last_node_id++;
            is_new = true;
        }
        //check node id not exist
        if (this._nodes[id]) {
            log.error("Can't create node. Node id [" + id + "] already exist.");
            return null;
        }
        //create
        var node = new node_class(this, id);
        //add node
        this._nodes[id] = node;
        //set node properties
        node.id = id;
        node.container = this;
        node.side = this.side;
        node.type = type;
        node.category = node_class.category;
        //deserialize
        if (serialized_node)
            node.configure(serialized_node);
        //set additional properties
        if (properties) {
            for (var i in properties)
                node[i] = properties[i];
        }
        if (!node.title)
            node.title = node.type;
        if ((!properties || !properties.properties)
            && (!serialized_node || !serialized_node.size))
            node.size = node.computeSize();
        //overwrite id
        node.id = id;
        if (is_new) {
            log.debug("New node created: " + node.getReadableId());
            if (node.onCreated)
                node.onCreated();
            //add to database
            if (this.db) {
                this.db.addNode(node);
                if (this.id == 0)
                    this.db.updateLastRootNodeId(this.last_node_id);
                else
                    this.db.updateNode(this.container_node.id, this.container_node.container.id, { $set: { "sub_container.last_node_id": this.container_node.sub_container.last_node_id } });
            }
        }
        if (node.onAdded)
            node.onAdded();
        this.setDirtyCanvas(true, true);
        return node;
    };
    ;
    /**
     * Removes a node from the container
     * @param node the instance of the node or node id
     */
    Container.prototype.remove = function (node) {
        //if id provided, get node
        if (typeof node == "number") {
            node = this._nodes[node];
            if (!node)
                log.error("Can't remove node. Node id [" + node + " not exist.");
            return null;
        }
        if (node.ignore_remove)
            return;
        //event
        this.emit('remove', node);
        //node event
        if (node['onRemoved'])
            node['onRemoved']();
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
        //remove from renderer
        if (this.renderers) {
            for (var i = 0; i < this.renderers.length; ++i) {
                var renderer = this.renderers[i];
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
     * Returns a list of nodes that matches a category
     * @param category the name of the node category
     * @returns a list with all the nodes of this type
     */
    Container.prototype.getNodesByCategory = function (category) {
        category = category.toLowerCase();
        var r = [];
        for (var id in this._nodes) {
            var node = this._nodes[id];
            if (node.category.toLowerCase() == category)
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
    Container.prototype.serialize = function (include_nodes, only_dashboard_nodes) {
        if (include_nodes === void 0) { include_nodes = true; }
        if (only_dashboard_nodes === void 0) { only_dashboard_nodes = false; }
        var data = {
            id: this.id,
            last_node_id: this.last_node_id,
            name: this.name,
            config: this.config
        };
        if (include_nodes) {
            var ser_nodes = [];
            for (var id in this._nodes) {
                var node = this._nodes[id];
                if (only_dashboard_nodes && !node.isDashboardNode)
                    continue;
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
            //skip nodes
            if (i == "serialized_nodes")
                continue;
            this[i] = data[i];
        }
        var error = false;
        if (data.serialized_nodes) {
            for (var _i = 0, _a = data.serialized_nodes; _i < _a.length; _i++) {
                var n = _a[_i];
                var node = this.createNode(n.type, null, n);
                if (!node)
                    error = true;
            }
        }
        if (data.last_container_id)
            Container.last_container_id = data.last_container_id;
        this.setDirtyCanvas(true, true);
        return error;
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
        var new_cont_node = this.createNode("main/container", { pos: pos });
        var new_cont = new_cont_node.sub_container;
        new_cont.last_node_id = this.last_node_id;
        if (this.db)
            this.db.updateNode(new_cont_node.id, this.id, { $set: { "sub_container.last_node_id": new_cont_node.sub_container.last_node_id } });
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
                            var input_node = new_cont.createNode("main/input");
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
                            //connect new cont input to old target
                            new_cont_node.inputs[input_node.properties["slot"]].link =
                                { target_node_id: input.link.target_node_id, target_slot: input.link.target_slot };
                            var t_out_links = old_target.outputs[input.link.target_slot].links;
                            for (var _b = 0, t_out_links_1 = t_out_links; _b < t_out_links_1.length; _b++) {
                                var out_link = t_out_links_1[_b];
                                if (out_link.target_node_id == node.id && out_link.target_slot == +i) {
                                    out_link.target_node_id = new_cont_node.id;
                                    out_link.target_slot = input_node.properties["slot"];
                                }
                            }
                            //reconnect node to new input node
                            input.link.target_node_id = input_node.id;
                            input.link.target_slot = 0;
                            if (this.db) {
                                var s_old_target = old_target.serialize(true);
                                var s_node = node.serialize(true);
                                var s_input_node = input_node.serialize(true);
                                this.db.updateNode(input_node.id, new_cont.id, { $set: { pos: s_input_node.pos } });
                                this.db.updateNode(input_node.id, new_cont.id, { $set: { outputs: s_input_node.outputs } });
                                this.db.updateNode(old_target.id, this.id, { $set: { outputs: s_old_target.outputs } });
                                this.db.updateNode(node.id, new_cont.id, { $set: { inputs: s_node.inputs } });
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
                                var output_node = new_cont.createNode("main/output");
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
                                //connect new cont output to old target
                                new_cont_node.outputs[output_node.properties["slot"]].links = [{
                                        target_node_id: link.target_node_id,
                                        target_slot: link.target_slot
                                    }];
                                //reconnect old target node to cont output
                                var in_link = old_target.inputs[link.target_slot].link;
                                in_link.target_node_id = new_cont_node.id;
                                in_link.target_slot = output_node.properties["slot"];
                                //reconnect node to new output node
                                link.target_node_id = output_node.id;
                                link.target_slot = 0;
                                if (this.db) {
                                    var s_old_target = old_target.serialize(true);
                                    var s_node = node.serialize(true);
                                    var s_output_node = output_node.serialize(true);
                                    this.db.updateNode(output_node.id, new_cont.id, { $set: { pos: s_output_node.pos } });
                                    this.db.updateNode(output_node.id, new_cont.id, { $set: { inputs: s_output_node.inputs } });
                                    this.db.updateNode(old_target.id, this.id, { $set: { inputs: s_old_target.inputs } });
                                    this.db.updateNode(node.id, new_cont.id, { $set: { outputs: s_node.outputs } });
                                }
                            }
                        }
                    }
                }
                if (this.db) {
                    var s_new_cont_node = new_cont_node.serialize(true);
                    this.db.updateNode(new_cont_node.id, this.id, { $set: { inputs: s_new_cont_node.inputs } });
                    this.db.updateNode(new_cont_node.id, this.id, { $set: { outputs: s_new_cont_node.outputs } });
                }
            }
        }
    };
    Container.nodes_types = {};
    Container.containers = {};
    Container.last_container_id = -1;
    return Container;
}(emitter_1.Emitter));
exports.Container = Container;
