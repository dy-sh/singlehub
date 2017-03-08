/**
 * Created by derwish on 11.02.17.
 */
"use strict";
var container_1 = require("./container");
var utils_1 = require("./utils");
//console logger back and front
var log;
if (typeof (window) === 'undefined')
    log = require('logplease').create('node', { color: 5 });
else
    log = Logger.create('node', { color: 5 });
var NodeOutput = (function () {
    function NodeOutput() {
    }
    return NodeOutput;
}());
exports.NodeOutput = NodeOutput;
var NodeInput = (function () {
    function NodeInput() {
    }
    return NodeInput;
}());
exports.NodeInput = NodeInput;
var Link = (function () {
    function Link() {
    }
    return Link;
}());
exports.Link = Link;
var Node = (function () {
    //events
    // /**
    //  * Invoked when new node created
    //  */
    // onCreated
    //
    // /**
    //  * Invoked every time when node added to container (created or restored from the database)
    //  */
    // onAdded
    //
    // /**
    //  * Invoked when node removed from container
    //  */
    // onRemoved
    //
    //
    // onDrawBackground
    // onDrawForeground
    //
    // //if returns false the incoming connection will be canceled
    // onConnectInput
    // onInputAdded
    // onOutputAdded
    // onGetInputs
    // onGetOutputs
    // onInputRemoved
    // onOutputRemoved
    //
    // onMouseDown
    // onMouseUp
    // onMouseEnter
    // onMouseMove
    // onMouseLeave
    // onDblClick
    // onDropFile
    // onDropItem
    // onKeyDown
    // onKeyUp
    //
    // onSelected
    // onDeselected
    //
    // onGetMessageToServerSide
    // onGetMessageToEditorSide
    // onGetMessageToDashboardSide
    //
    // onRunContainer
    // onStopContainer
    // onExecute
    // onInputUpdated
    //
    // onSettingsChanged
    // getMenuOptions
    // getExtraMenuOptions
    //onDashboardGetRequest
    //onDashboardPostRequest
    //onEditorApiGetRequest
    //onEditorApiPostRequest
    function Node(container, id) {
        this.pos = [100, 100];
        //   connections: Array<any>;
        this.properties = {};
        this.settings = {};
        this.flags = {};
        this.propertiesForUpdateInDbP = {};
        this.UPDATE_IN_DB_INTERVAL = 5000;
    }
    /**
     * Configure a node from an object containing the serialized ser_node
     * @param ser_node object with properties for configure
     */
    Node.prototype.configure = function (ser_node, from_db) {
        if (from_db === void 0) { from_db = false; }
        for (var key in ser_node) {
            if (key == "console")
                continue;
            // if (key == "properties") {
            //     for (let k in ser_node.properties)
            //         this.properties[k] = ser_node.properties[k];
            //     continue;
            // }
            if (ser_node[key] == null)
                continue;
            else if (typeof (ser_node[key]) == 'object') {
                if (this[key] && this[key].configure)
                    this[key].configure(ser_node[key]);
                else
                    this[key] = utils_1.default.cloneObject(ser_node[key], this[key]);
            }
            else
                this[key] = ser_node[key];
        }
    };
    /**
     * Serialize node
     */
    Node.prototype.serialize = function (for_db) {
        if (for_db === void 0) { for_db = false; }
        var n = {
            cid: this.container.id,
            id: this.id,
            type: this.type,
            pos: this.pos
        };
        if (this.settings)
            n.settings = utils_1.default.cloneObject(this.settings);
        if (this.properties)
            n.properties = utils_1.default.cloneObject(this.properties);
        if (this.flags)
            n.flags = utils_1.default.cloneObject(this.flags);
        //remove data from liks
        if (this.inputs) {
            n.inputs = {};
            for (var id in this.inputs) {
                var i = this.inputs[id];
                n.inputs[id] = {
                    name: i.name,
                    type: i.type,
                    link: i.link,
                    label: i.label,
                    locked: i.locked,
                    pos: i.pos,
                    round: i.round,
                    isOptional: i.isOptional
                };
            }
        }
        if (this.outputs) {
            n.outputs = {};
            for (var id in this.outputs) {
                var o = this.outputs[id];
                n.outputs[id] = {
                    name: o.name,
                    type: o.type,
                    links: o.links,
                    label: o.label,
                    locked: o.locked,
                    pos: o.pos,
                    round: o.round
                };
            }
        }
        if (this.onSerialize)
            this.onSerialize(n);
        return n;
    };
    /**
     * Creates a clone of this node
     * @returns {Node}
     */
    Node.prototype.clone = function () {
        if (this.clonable == false)
            return;
        var node = this.container.createNode(this.type);
        var data = this.serialize();
        delete data["id"];
        node.configure(data);
        node.pos[1] = this.pos[1] + this.size[1] + 25;
        node.restoreLinks();
        if (this.container.db) {
            var s_node = node.serialize(true);
            this.container.db.updateNode(node.id, node.container.id, s_node);
        }
        return node;
    };
    Node.prototype.restoreLinks = function () {
        var updated = false;
        //restore input links
        if (this.getInputsCount() > 0) {
            for (var i in this.inputs) {
                var input = this.inputs[i];
                if (input.link) {
                    var target_node = this.container._nodes[input.link.target_node_id];
                    if (!target_node) {
                        //delete link if target node not exist
                        delete input.link;
                        this.debug("restore link: delete input [" + i + "] link");
                        updated = true;
                    }
                    else {
                        //connect target node if not connected
                        var t_link = void 0;
                        var t_out = target_node.outputs[input.link.target_slot];
                        if (t_out.links)
                            for (var _i = 0, _a = t_out.links; _i < _a.length; _i++) {
                                var out_link = _a[_i];
                                if (out_link.target_node_id == this.id && out_link.target_slot == +i)
                                    t_link = out_link;
                            }
                        if (!t_link) {
                            t_out.links.push({ target_node_id: this.id, target_slot: +i });
                            //update input value
                            input.data = utils_1.default.formatValue(t_out.data, input.type);
                            input.updated = true;
                            this.isUpdated = true;
                            this.debug("restore link: create input [" + i + "] link with node [" + target_node.id + "] output [" + input.link.target_slot + "}]");
                            if (this.container.db) {
                                var s_t_node = target_node.serialize(true);
                                this.container.db.updateNode(target_node.id, target_node.container.id, { $set: { outputs: s_t_node.outputs } });
                            }
                        }
                    }
                }
            }
        }
        //restore output links
        if (this.getOutputsCount() > 0) {
            for (var i in this.outputs) {
                var output = this.outputs[i];
                if (output.links) {
                    var l = output.links.length;
                    while (l--) {
                        var link = output.links[l];
                        var target_node = this.container._nodes[link.target_node_id];
                        //delete link if target node not exist
                        if (!target_node) {
                            this.debug("restore link: delete output [" + i + "] link");
                            output.links.splice(l, 1);
                            updated = true;
                            continue;
                        }
                        var t_input = target_node.inputs[link.target_slot];
                        //delete link if target node input not exist
                        if (!t_input) {
                            this.debug("restore link: delete output [" + i + "] link");
                            output.links.splice(l, 1);
                            updated = true;
                            continue;
                        }
                        //delete link if target node connected to another node
                        if (t_input.link && t_input.link.target_node_id != this.id || t_input.link.target_slot != +i) {
                            this.debug("restore link: delete output [" + i + "] link");
                            output.links.splice(l, 1);
                            updated = true;
                            continue;
                        }
                        //connect target node if not connected
                        if (!t_input.link) {
                            t_input.link = { target_node_id: this.id, target_slot: +i };
                            //update input value
                            t_input.data = utils_1.default.formatValue(output.data, t_input.type);
                            t_input.updated = true;
                            target_node.isUpdated = true;
                            this.debug("restore link: create output [" + i + "] link with node [" + target_node.id + "] input [" + link.target_slot + "}]");
                            //update db
                            if (this.container.db) {
                                var s_t_node = target_node.serialize(true);
                                this.container.db.updateNode(target_node.id, target_node.container.id, { $set: { inputs: s_t_node.inputs } });
                            }
                        }
                    }
                }
            }
        }
        if (updated && this.container.db) {
            var s_node = this.serialize(true);
            this.container.db.updateNode(this.id, this.container.id, {
                $set: {
                    inputs: s_node.inputs,
                    outputs: s_node.outputs
                }
            });
        }
    };
    /**
     * Serialize and stringify
     * @returns {string} json
     */
    Node.prototype.toString = function () {
        return JSON.stringify(this.serialize());
    };
    /**
     * Get the title string
     */
    Node.prototype.getTitle = function () {
        return this.title;
    };
    /**
     * Sets the output data
     * @param output_id slotId id
     * @param data slotId data
     */
    Node.prototype.setOutputData = function (output_id, data) {
        if (!this.outputs[output_id])
            return;
        if (data === undefined)
            data = null;
        if (data == null && this.outputs[output_id].data == null)
            return;
        this.outputs[output_id].updated = true;
        if (!this.isRecentlyActive)
            this.isRecentlyActive = true;
        this.outputs[output_id].data = data;
    };
    /**
     * Retrieves the input data (data traveling through the connection) from one slotId
     * @param input_id slotId id
     * @returns data or if it is not connected returns undefined
     */
    Node.prototype.getInputData = function (input_id) {
        if (this.inputs[input_id])
            return this.inputs[input_id].data;
    };
    /**
     * If there is a connection in one input slot
     * @param slot slot id
     * @returns {boolean}
     */
    Node.prototype.isInputConnected = function (slot) {
        if (!this.inputs)
            return false;
        return (this.inputs[slot].link != null);
    };
    /**
     * Returns info about an input connection (which node, type, etc)
     * @param slot slot id
     * @returns {Object} object or null
     */
    Node.prototype.getInputInfo = function (slot) {
        if (!this.inputs)
            return null;
        return this.inputs[slot];
    };
    /**
     * Returns info about an output connection (which node, type, etc)
     * @param slot slot id
     * @returns {Object}  object or null
     */
    Node.prototype.getOutputInfo = function (slot) {
        if (!this.outputs)
            return null;
        return this.outputs[slot];
    };
    /**
     * if there is a connection in one output slot
     * @param slot slot id
     * @returns {boolean}
     */
    Node.prototype.isOutputConnected = function (slot) {
        if (!this.outputs)
            return null;
        return (this.outputs[slot].links && this.outputs[slot].links.length > 0);
    };
    //todo ES6
    // /**
    //  * retrieves all the nodes connected to this output slot
    //  * @param slot slot id
    //  * @returns {array}
    //  */
    // getOutputNodes(slot:number):Array<Node> {
    //     if (!this.outputs || this.outputs.length == 0) return null;
    //     if (slot < this.outputs.length) {
    //         let output = this.outputs[slot];
    //         let r = [];
    //         for (let i = 0; i < output.length; i++)
    //             r.push(this.container.getNodeById(output.links[i].target_id));
    //         return r;
    //     }
    //     return null;
    // }
    //todo ES6
    //     triggerOutput(slot, param) {
    //         let n = this.getOutputNode(slot);
    //         if (n && n.onTrigger)
    //             n.onTrigger(param);
    //     }
    /**
     * Add a new output slot to use in this node
     * @param name
     * @param type string defining the output type ("vec3","number",...)
     * @param extra_info this can be used to have special properties of an output (label, special color, position, etc)
     */
    Node.prototype.addOutput = function (name, type, extra_info) {
        var id = this.getFreeOutputId();
        name = name || "output " + (id + 1);
        var output = { name: name, type: type, links: null };
        if (extra_info)
            for (var i in extra_info)
                output[i] = extra_info[i];
        if (!this.outputs)
            this.outputs = {};
        this.outputs[id] = output;
        if (this['onOutputAdded'])
            this['onOutputAdded'](output);
        this.size = this.computeSize();
        return id;
    };
    Node.prototype.getFreeOutputId = function () {
        if (!this.outputs)
            return 0;
        for (var i = 0; i < 1000; i++) {
            if (!this.outputs[i])
                return i;
        }
    };
    // /**
    //  * Add a new output slot to use in this node
    //  * @param  array of triplets like [[name,type,extra_info],[...]]
    //  */
    // addOutputs(array: Array<NodeOutput>): void {
    //     for (let i = 0; i < array.length; ++i) {
    //         let info = array[i];
    //
    //         let id = this.getFreeOutputId();
    //         let name = info[0] || "output " + (id + 1);
    //
    //         let output = {name: name, type: info[1], links: null};
    //         if (array[2])
    //             for (let j in info[2])
    //                 output[j] = info[2][j];
    //
    //         if (!this.outputs)
    //             this.outputs = {};
    //
    //         this.outputs[id] = output;
    //         if (this['onOutputAdded'])
    //             this['onOutputAdded'](output);
    //     }
    //
    //     this.size = this.computeSize();
    // }
    /**
     * Remove an existing output slot
     * @param id slot id
     */
    Node.prototype.removeOutput = function (id) {
        this.disconnectOutput(id);
        delete this.outputs[id];
        this.size = this.computeSize();
        if (this['onOutputRemoved'])
            this['onOutputRemoved'](id);
    };
    /**
     * Add a new input slot to use in this node
     * @param name
     * @param type string defining the input type ("vec3","number",...), it its a generic one use 0
     * @param extra_info this can be used to have special properties of an input (label, color, position, etc)
     */
    Node.prototype.addInput = function (name, type, extra_info) {
        var id = this.getFreeInputId();
        name = name || "input " + (id + 1);
        var input = { name: name, type: type };
        if (extra_info)
            for (var i in extra_info)
                input[i] = extra_info[i];
        if (!this.inputs)
            this.inputs = {};
        this.inputs[id] = input;
        this.size = this.computeSize();
        if (this['onInputAdded'])
            this['onInputAdded'](input);
        return id;
    };
    Node.prototype.getFreeInputId = function () {
        if (!this.inputs)
            return 0;
        for (var i = 0; i < 1000; i++) {
            if (!this.inputs[i])
                return i;
        }
    };
    // /**
    //  * add several new input slots in this node
    //  * @param {Array} array of triplets like [[name,type,extra_info],[...]]
    //  */
    // addInputs(array: Array<NodeInput>): void {
    //     for (let i = 0; i < array.length; ++i) {
    //         let info = array[i];
    //
    //         let id = this.getFreeInputId();
    //         let name = info[0] || "input " + (id + 1);
    //
    //         let input = {name: name, type: info[1]};
    //         if (array[2])
    //             for (let j in info[2])
    //                 input[j] = info[2][j];
    //
    //         if (!this.inputs)
    //             this.inputs = {};
    //
    //         this.inputs[id] = input;
    //         if (this['onInputAdded'])
    //             this['onInputAdded'](input);
    //     }
    //
    //     this.size = this.computeSize();
    // }
    /**
     * Remove an existing input slot
     * @method removeInput
     * @param id
     */
    Node.prototype.removeInput = function (id) {
        this.disconnectInput(id);
        delete this.inputs[id];
        this.size = this.computeSize();
        if (this['onInputRemoved'])
            this['onInputRemoved'](id);
    };
    // /**
    //  * add an special connection to this node (used for special kinds of containers)
    //  * @method addConnection
    //  * @param name
    //  * @param type string defining the input type ("vec3","number",...)
    //  * @param {[x,y]} pos position of the connection inside the node
    //  * @param direction if is input or output
    //  */
    // addConnection(name, type, pos, direction) {
    //     this.connections.push({name: name, type: type, pos: pos, direction: direction, links: null});
    // }
    Node.prototype.getInputsCount = function () {
        return this.inputs ? Object.keys(this.inputs).length : 0;
    };
    Node.prototype.getOutputsCount = function () {
        return this.outputs ? Object.keys(this.outputs).length : 0;
    };
    Node.prototype.changeInputsCount = function (target_count, type) {
        var current_count = this.getInputsCount();
        var diff = target_count - current_count;
        //add
        if (diff > 0)
            for (var i = 0; i < diff; i++)
                this.addInput(null, type);
        //remove
        if (diff < 0) {
            var ids = Object.keys(this.inputs);
            for (var i = 0; i > diff; i--) {
                var id = ids[ids.length + i - 1];
                this.removeInput(+id);
            }
        }
    };
    Node.prototype.changeOutputsCount = function (target_count, type) {
        var current_count = this.getOutputsCount();
        var diff = target_count - current_count;
        //add
        if (diff > 0)
            for (var i = 0; i < diff; i++)
                this.addOutput(null, type);
        //remove
        if (diff < 0) {
            var ids = Object.keys(this.outputs);
            for (var i = 0; i > diff; i--) {
                var id = ids[ids.length + i - 1];
                this.removeOutput(+id);
            }
        }
    };
    Node.prototype.getLastInputIndes = function () {
        if (!this.inputs)
            return -1;
        var last = -1;
        for (var i in this.inputs)
            if (+i > last)
                last = +i;
        return last;
    };
    Node.prototype.getLastOutputIndex = function () {
        if (!this.outputs)
            return -1;
        var last = -1;
        for (var i in this.outputs)
            if (+i > last)
                last = +i;
        return last;
    };
    /**
     * Computes the size of a node according to its inputs and output slots
     * @param minHeight
     * @returns {[number, number]} the total size
     */
    Node.prototype.computeSize = function (minHeight) {
        // let i_slots = this.getInputsCount();
        // let o_slots = this.getOutputsCount();
        var i_slots = this.getLastInputIndes() + 1;
        var o_slots = this.getLastOutputIndex() + 1;
        var rows = Math.max(this.inputs ? i_slots : 1, this.outputs ? o_slots : 1);
        var size = [0, 0];
        rows = Math.max(rows, 1);
        size[1] = rows * 15 + 6;
        var font_size = 14;
        var title_width = compute_text_size(this.title);
        var input_width = 0;
        var output_width = 0;
        if (this.inputs)
            for (var i in this.inputs) {
                var input = this.inputs[i];
                var text = input.label || input.name || "";
                var text_width = compute_text_size(text);
                if (input_width < text_width)
                    input_width = text_width;
            }
        if (this.outputs)
            for (var o in this.outputs) {
                var output = this.outputs[o];
                var text = output.label || output.name || "";
                var text_width = compute_text_size(text);
                if (output_width < text_width)
                    output_width = text_width;
            }
        size[0] = Math.max(input_width + output_width + 10, title_width);
        //todo node NODE_MIN_WIDTH options
        size[0] = Math.max(size[0], 100);
        function compute_text_size(text) {
            if (!text)
                return 0;
            return font_size * text.length * 0.6;
        }
        return size;
    };
    /**
     * Returns the input slot with a given name (used for dynamic slots), -1 if not found
     * @param name the name of the slot
     * @returns {number} the slot (-1 if not found)
     */
    Node.prototype.findInputSlot = function (name) {
        if (!this.inputs)
            return -1;
        for (var i in this.inputs) {
            if (name == this.inputs[i].name)
                return +i;
        }
        return -1;
    };
    /**
     * Returns the output slot with a given name (used for dynamic slots), -1 if not found
     * @param name the name of the slot
     * @returns {number} the slot (-1 if not found)
     */
    Node.prototype.findOutputSlot = function (name) {
        if (!this.outputs)
            return -1;
        for (var o in this.outputs) {
            if (name == this.outputs[o].name)
                return +o;
        }
        return -1;
    };
    /**
     * Connect output to the input of another node
     * @param {number} output_id output id
     * @param {number} target_node_id target node id
     * @param {number} input_id input id of target node
     * @returns {boolean} true if connected successfully
     */
    Node.prototype.connect = function (output_id, target_node_id, input_id, update_db) {
        if (update_db === void 0) { update_db = true; }
        //get target node
        var target_node = this.container.getNodeById(target_node_id);
        if (!target_node) {
            this.debugErr("Can't connect, target node not found");
            return false;
        }
        //prevent self node connection (loop)
        if (target_node == this) {
            this.debugErr("Can't connect, prevent loop connection");
            return false;
        }
        //check output exist
        if (!this.outputs || !this.outputs[output_id]) {
            this.debugErr("Can't connect, output not found");
            return false;
        }
        //check input exist
        if (!target_node.inputs || !target_node.inputs[input_id]) {
            this.debugErr("Can't connect, input not found");
            return false;
        }
        var output = this.outputs[output_id];
        var input = target_node.inputs[input_id];
        // //check data types compatible
        // if (input.type && output.type && input.type != output.type)
        //     return false;
        //check target node allows connection
        if (target_node['onConnectInput'])
            if (target_node['onConnectInput'](input_id, output) == false)
                return false;
        //if target node input already connected
        if (input.link)
            target_node.disconnectInput(input_id);
        //create link
        if (!output.links)
            output.links = [];
        output.links.push({ target_node_id: target_node_id, target_slot: input_id });
        input.link = { target_node_id: this.id, target_slot: output_id };
        //update input value
        input.updated = true;
        input.data = utils_1.default.formatValue(output.data, input.type);
        target_node.isUpdated = true;
        //update db
        if (update_db && this.container.db) {
            var s_node = this.serialize(true);
            var s_t_node = target_node.serialize(true);
            this.container.db.updateNode(this.id, this.container.id, { $set: { outputs: s_node.outputs } });
            this.container.db.updateNode(target_node.id, target_node.container.id, { $set: { inputs: s_t_node.inputs } });
        }
        this.setDirtyCanvas(false, true);
        if (this.container)
            this.container.connectionChange(this);
        this.debug("connected to " + target_node.getReadableId());
        return true;
    };
    /**
     * Disconnect node output
     * @param {number} output_id output id
     * @param target_node_id if defined, one links to this node will be disconnected, otherwise all links will be disconnected
     * @param input_id if defined, only one link will be disconnected, otherwise all links will be disconnected
     * @returns {boolean} true if disconnected successfully
     */
    Node.prototype.disconnectOutput = function (output_id, target_node_id, input_id) {
        //get target node
        var target_node;
        if (target_node_id) {
            target_node = this.container.getNodeById(target_node_id);
            if (!target_node) {
                this.debugErr("Can't disconnect, target node not found");
                return false;
            }
        }
        //check output exist
        if (!this.outputs || !this.outputs[output_id]) {
            this.debugErr("Can't disconnect, output not found");
            return false;
        }
        var output = this.outputs[output_id];
        //check input exist
        var input;
        if (target_node && input_id) {
            if (!target_node.inputs || input_id > target_node.inputs.length - 1) {
                this.debugErr("Can't disconnect, input not found");
                return false;
            }
            input = target_node.inputs[input_id];
        }
        //check links
        if (!output.links)
            return false;
        var i = output.links.length;
        while (i--) {
            var link = output.links[i];
            if (target_node_id) {
                if (target_node_id != link.target_node_id)
                    continue;
                if (input_id) {
                    if (input_id != link.target_slot)
                        continue;
                }
            }
            //remove link
            var t_node = this.container.getNodeById(link.target_node_id);
            delete t_node.inputs[link.target_slot].link;
            output.links.splice(i, 1);
            //send null to target node input
            t_node.inputs[link.target_slot].data = null;
            t_node.inputs[link.target_slot].updated = true;
            t_node.isUpdated = true;
            if (this.container.db) {
                var s_t_node = t_node.serialize(true);
                this.container.db.updateNode(t_node.id, t_node.container.id, { $set: { inputs: s_t_node.inputs } });
            }
            this.debug("disconnected from " + t_node.getReadableId());
        }
        if (output.links.length == 0)
            delete output.links;
        if (this.container.db) {
            var s_node = this.serialize(true);
            this.container.db.updateNode(this.id, this.container.id, { $set: { outputs: s_node.outputs } });
        }
        this.setDirtyCanvas(false, true);
        if (this.container)
            this.container.connectionChange(this);
        return true;
    };
    /**
     * Disconnect input
     * @param {number} input_id input id
     * @returns {boolean} true if disconnected successfully
     */
    Node.prototype.disconnectInput = function (input_id) {
        //check input exist
        if (!this.inputs || !this.inputs[input_id]) {
            this.debugErr("Can't disconnect, input not found");
            return false;
        }
        var input = this.inputs[input_id];
        var link = input.link;
        if (!link)
            return false;
        //disconnect output
        var target_node = this.container.getNodeById(link.target_node_id);
        if (!target_node)
            return false;
        var output = target_node.outputs[link.target_slot];
        if (!output || !output.links)
            return false;
        var i = output.links.length;
        while (i--) {
            var output_link = output.links[i];
            if (output_link.target_node_id == this.id
                && output_link.target_slot == input_id) {
                output.links.splice(i, 1);
                break;
            }
        }
        if (output.links.length == 0)
            delete output.links;
        //disconnect input
        delete input.link;
        //send null to target node input
        input.data = null;
        input.updated = true;
        this.isUpdated = true;
        if (this.container.db) {
            var s_node = this.serialize(true);
            var s_target_node = target_node.serialize(true);
            this.container.db.updateNode(this.id, this.container.id, { $set: { inputs: s_node.inputs } });
            this.container.db.updateNode(target_node.id, target_node.container.id, { $set: { outputs: s_target_node.outputs } });
        }
        this.setDirtyCanvas(false, true);
        if (this.container)
            this.container.connectionChange(this);
        this.debug("disconnected from " + target_node.getReadableId());
        return true;
    };
    /* Forces to redraw or the main renderer (Node) or the bg renderer (links) */
    Node.prototype.setDirtyCanvas = function (dirty_foreground, dirty_background) {
        if (!this.container)
            return;
        this.container.sendActionToRenderer("setDirty", [dirty_foreground, dirty_background]);
    };
    /**
     * safe Node action execution (not sure if safe)
     * @param action
     * @returns {boolean}
     */
    Node.prototype.executeAction = function (action) {
        if (action == "")
            return false;
        if (action.indexOf(";") != -1 || action.indexOf("}") != -1) {
            this.debugErr("Action contains unsafe characters");
            return false;
        }
        var tokens = action.split("(");
        var func_name = tokens[0];
        if (typeof (this[func_name]) != "function") {
            this.debugErr("Action not found on node: " + func_name);
            return false;
        }
        var code = action;
        try {
        }
        catch (err) {
            this.debugErr("Error executing action {" + action + "} :" + err);
            return false;
        }
        return true;
    };
    /**
     * Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus
     * @param v
     */
    Node.prototype.captureInput = function (v) {
        if (!this.container || !this.container.renderers)
            return;
        var list = this.container.renderers;
        for (var i = 0; i < list.length; ++i) {
            var c = list[i];
            //releasing somebody elses capture?!
            if (!v && c.node_capturing_input != this)
                continue;
            //change
            c.node_capturing_input = v ? this : null;
        }
    };
    /**
     * Collapse the node to make it smaller on the renderer
     **/
    Node.prototype.collapse = function () {
        if (!this.flags.collapsed)
            this.flags.collapsed = true;
        else
            this.flags.collapsed = false;
        this.setDirtyCanvas(true, true);
    };
    /**
     * Print debug message to console
     * @param message
     * @param module
     */
    Node.prototype.debug = function (message) {
        log.debug(this.getReadableId() + " " + message);
    };
    /**
     * Print error message to console
     * @param message
     * @param module
     */
    Node.prototype.debugErr = function (message, module) {
        log.error(this.getReadableId() + " " + message);
    };
    Node.prototype.getReadableId = function () {
        return "[" + this.type + "][" + this.container.id + "/" + this.id + "]";
    };
    Node.prototype.sendMessageToServerSide = function (mess) {
        if (this.side == container_1.Side.server)
            log.warn("Node " + this.getReadableId() + " is trying to send message from server side to server side");
        else
            this.container.clinet_socket.emit('node-message-to-server-side', { id: this.id, cid: this.container.id, value: mess });
    };
    Node.prototype.sendMessageToEditorSide = function (mess) {
        var m = { id: this.id, cid: this.container.id, value: mess };
        if (this.side == container_1.Side.editor) {
            log.warn("Node " + this.getReadableId() + " is trying to send message from editor side to editor side");
        }
        else if (this.side == container_1.Side.server) {
            var socket = this.container.server_editor_socket;
            socket.in("" + this.container.id).emit('node-message-to-editor-side', m);
        }
        else {
            this.container.clinet_socket.emit('node-message-to-editor-side', m);
        }
    };
    Node.prototype.sendMessageToDashboardSide = function (mess) {
        var m = { id: this.id, cid: this.container.id, value: mess };
        if (this.side == container_1.Side.dashboard) {
            log.warn("Node " + this.getReadableId() + " is trying to send message from dashboard side to dashboard side");
        }
        else if (this.side == container_1.Side.server) {
            var socket = this.container.server_dashboard_socket;
            socket.in("" + this.container.id).emit('node-message-to-dashboard-side', m);
        }
        else {
            this.container.clinet_socket.emit('node-message-to-dashboard-side', m);
        }
    };
    Node.prototype.sendIOValuesToEditor = function () {
        var inputs_values = [];
        var outputs_values = [];
        if (this.inputs) {
            for (var i in this.inputs) {
                var data = this.inputs[i].data;
                data = utils_1.default.formatAndTrimValue(data);
                inputs_values.push({
                    nodeId: this.id,
                    inputId: i,
                    data: data
                });
            }
        }
        if (this.outputs) {
            for (var o in this.outputs) {
                var data = this.outputs[o].data;
                data = utils_1.default.formatAndTrimValue(data);
                outputs_values.push({
                    nodeId: this.id,
                    outputId: o,
                    data: data
                });
            }
        }
        var slots_values = {
            cid: this.container.id,
            inputs: inputs_values,
            outputs: outputs_values
        };
        this.container.server_editor_socket.in("" + this.container.id).emit('nodes-io-values', slots_values);
    };
    Node.prototype.updateInputsLabels = function () {
        if (this.inputs) {
            for (var i in this.inputs) {
                var input = this.inputs[i];
                input.label = input.name;
            }
            this.setDirtyCanvas(true, true);
        }
    };
    Node.prototype.updateOutputsLabels = function () {
        if (this.outputs) {
            for (var o in this.outputs) {
                var output = this.outputs[o];
                output.label = output.name;
            }
            this.setDirtyCanvas(true, true);
        }
    };
    Node.prototype.updateInDb = function (prop_name, value, immediately) {
        if (immediately === void 0) { immediately = false; }
        if (immediately) {
            if (this.container.db) {
                var saveObj = {};
                saveObj[prop_name] = value;
                console.log("saving immediately:" + JSON.stringify(saveObj));
                this.container.db.updateNode(this.id, this.container.id, { $set: saveObj });
            }
        }
        else {
            this.propertiesForUpdateInDbP[prop_name] = value;
            if (!this.updateInDbTimer)
                this.startUpdateInDbTimer();
        }
    };
    Node.prototype.startUpdateInDbTimer = function () {
        if (!this.container.db)
            return;
        var that = this;
        console.log("starting timer");
        this.updateInDbTimer = setInterval(function () {
            //stop timer if nothing to save
            if (Object.keys(this.propertiesForUpdateInDbP).length == 0) {
                clearInterval(that.updateInDbTimer);
                that.updateInDbTimer = null;
                console.log("stopping timer");
                return;
            }
            for (var key in that.propertiesForUpdateInDbP) {
                //delete key
                var val = that.propertiesForUpdateInDbP[key];
                delete that.propertiesForUpdateInDbP[key];
                //save in db
                var saveObj = {};
                saveObj[key] = val;
                console.log("saving :" + JSON.stringify(saveObj));
                that.container.db.updateNode(that.id, that.container.id, { $set: saveObj });
            }
        }, this.UPDATE_IN_DB_INTERVAL);
    };
    return Node;
}());
exports.Node = Node;
