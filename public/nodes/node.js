/**
 * Created by derwish on 11.02.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./utils", "./nodes"], factory);
    }
})(function (require, exports) {
    "use strict";
    const utils_1 = require("./utils");
    const nodes_1 = require("./nodes");
    //console logger back and front
    let log;
    if (typeof (window) === 'undefined')
        log = require('logplease').create('node', { color: 5 });
    else
        log = Logger.create('node', { color: 5 });
    class NodeOutput {
    }
    exports.NodeOutput = NodeOutput;
    class NodeInput {
    }
    exports.NodeInput = NodeInput;
    class Link {
    }
    exports.Link = Link;
    class Node {
        constructor() {
            this.pos = [10, 10];
            this.id = -1;
            this.settings = {};
        }
        /**
         * Configure a node from an object containing the serialized ser_node
         * @param ser_node object with properties for configure
         */
        configure(ser_node, from_db = false) {
            for (let j in ser_node) {
                if (j == "console")
                    continue;
                if (j == "properties") {
                    //i dont want to clone properties, I want to reuse the old container
                    for (let k in ser_node.properties)
                        this.properties[k] = ser_node.properties[k];
                    continue;
                }
                if (ser_node[j] == null)
                    continue;
                else if (typeof (ser_node[j]) == 'object') {
                    if (this[j] && this[j].configure)
                        this[j].configure(ser_node[j]);
                    else
                        this[j] = utils_1.default.cloneObject(ser_node[j], this[j]);
                }
                else
                    this[j] = ser_node[j];
            }
        }
        /**
         * Serialize node
         */
        serialize(for_db = false) {
            let n = {
                cid: this.container.id,
                id: this.id,
                type: this.type,
                title: this.title,
                pos: this.pos,
                size: this.size,
            };
            if (this.settings)
                n.settings = utils_1.default.cloneObject(this.settings);
            if (this.properties)
                n.properties = utils_1.default.cloneObject(this.properties);
            if (this.color)
                n.color = this.color;
            if (this.bgcolor)
                n.bgcolor = this.bgcolor;
            if (this.boxcolor)
                n.boxcolor = this.boxcolor;
            if (this.flags)
                n.flags = utils_1.default.cloneObject(this.flags);
            //remove data from liks
            if (this.inputs) {
                n.inputs = {};
                for (let id in this.inputs) {
                    let i = this.inputs[id];
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
                for (let id in this.outputs) {
                    let o = this.outputs[id];
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
        }
        /**
         * Creates a clone of this node
         * @returns {Node}
         */
        clone() {
            let node = nodes_1.Nodes.createNode(this.type);
            let data = this.serialize();
            delete data["id"];
            node.configure(data);
            return node;
        }
        /**
         * Serialize and stringify
         * @returns {string} json
         */
        toString() {
            return JSON.stringify(this.serialize());
        }
        /**
         * Get the title string
         */
        getTitle() {
            return this.title;
        }
        /**
         * Sets the output data
         * @param output_id slotId id
         * @param data slotId data
         */
        setOutputData(output_id, data) {
            if (!this.outputs[output_id])
                return;
            if (this.outputs[output_id].data !== data) {
                this.outputs[output_id].data = data;
                if (!this.isRecentlyActive)
                    this.isRecentlyActive = true;
            }
        }
        /**
         * Retrieves the input data (data traveling through the connection) from one slotId
         * @param input_id slotId id
         * @returns data or if it is not connected returns undefined
         */
        getInputData(input_id) {
            if (this.inputs[input_id])
                return this.inputs[input_id].data;
        }
        /**
         * If there is a connection in one input slot
         * @param slot slot id
         * @returns {boolean}
         */
        isInputConnected(slot) {
            if (!this.inputs)
                return false;
            return (this.inputs[slot].link != null);
        }
        /**
         * Returns info about an input connection (which node, type, etc)
         * @param slot slot id
         * @returns {Object} object or null
         */
        getInputInfo(slot) {
            if (!this.inputs)
                return null;
            return this.inputs[slot];
        }
        /**
         * Returns info about an output connection (which node, type, etc)
         * @param slot slot id
         * @returns {Object}  object or null
         */
        getOutputInfo(slot) {
            if (!this.outputs)
                return null;
            return this.outputs[slot];
        }
        /**
         * if there is a connection in one output slot
         * @param slot slot id
         * @returns {boolean}
         */
        isOutputConnected(slot) {
            if (!this.outputs)
                return null;
            return (this.outputs[slot].links && this.outputs[slot].links.length > 0);
        }
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
        addOutput(name, type, extra_info) {
            let id = this.getFreeOutputId();
            name = name || "output " + (id + 1);
            let output = { name: name, type: type, links: null };
            if (extra_info)
                for (let i in extra_info)
                    output[i] = extra_info[i];
            if (!this.outputs)
                this.outputs = {};
            this.outputs[id] = output;
            if (this.onOutputAdded)
                this.onOutputAdded(output);
            this.size = this.computeSize();
            return id;
        }
        getFreeOutputId() {
            if (!this.outputs)
                return 0;
            for (let i = 0; i < 1000; i++) {
                if (!this.outputs[i])
                    return i;
            }
        }
        /**
         * Add a new output slot to use in this node
         * @param  array of triplets like [[name,type,extra_info],[...]]
         */
        addOutputs(array) {
            for (let i = 0; i < array.length; ++i) {
                let info = array[i];
                let id = this.getFreeOutputId();
                let name = info[0] || "output " + (id + 1);
                let output = { name: name, type: info[1], links: null };
                if (array[2])
                    for (let j in info[2])
                        output[j] = info[2][j];
                if (!this.outputs)
                    this.outputs = {};
                this.outputs[id] = output;
                if (this.onOutputAdded)
                    this.onOutputAdded(output);
            }
            this.size = this.computeSize();
        }
        /**
         * Remove an existing output slot
         * @param id slot id
         */
        removeOutput(id) {
            this.disconnectOutput(id);
            delete this.outputs[id];
            this.size = this.computeSize();
            if (this.onOutputRemoved)
                this.onOutputRemoved(id);
        }
        /**
         * Add a new input slot to use in this node
         * @param name
         * @param type string defining the input type ("vec3","number",...), it its a generic one use 0
         * @param extra_info this can be used to have special properties of an input (label, color, position, etc)
         */
        addInput(name, type, extra_info) {
            let id = this.getFreeInputId();
            name = name || "input " + (id + 1);
            let input = { name: name, type: type };
            if (extra_info)
                for (let i in extra_info)
                    input[i] = extra_info[i];
            if (!this.inputs)
                this.inputs = {};
            this.inputs[id] = input;
            this.size = this.computeSize();
            if (this.onInputAdded)
                this.onInputAdded(input);
            return id;
        }
        getFreeInputId() {
            if (!this.inputs)
                return 0;
            for (let i = 0; i < 1000; i++) {
                if (!this.inputs[i])
                    return i;
            }
        }
        /**
         * add several new input slots in this node
         * @param {Array} array of triplets like [[name,type,extra_info],[...]]
         */
        addInputs(array) {
            for (let i = 0; i < array.length; ++i) {
                let info = array[i];
                let id = this.getFreeInputId();
                let name = info[0] || "input " + (id + 1);
                let input = { name: name, type: info[1] };
                if (array[2])
                    for (let j in info[2])
                        input[j] = info[2][j];
                if (!this.inputs)
                    this.inputs = {};
                this.inputs[id] = input;
                if (this.onInputAdded)
                    this.onInputAdded(input);
            }
            this.size = this.computeSize();
        }
        /**
         * Remove an existing input slot
         * @method removeInput
         * @param id
         */
        removeInput(id) {
            this.disconnectInput(id);
            delete this.inputs[id];
            this.size = this.computeSize();
            if (this.onInputRemoved)
                this.onInputRemoved(id);
        }
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
        getInputsCount() {
            return this.inputs ? Object.keys(this.inputs).length : 0;
        }
        getOutputsCount() {
            return this.outputs ? Object.keys(this.outputs).length : 0;
        }
        getLastInputIndes() {
            if (!this.inputs)
                return -1;
            let last = -1;
            for (let i in this.inputs)
                if (+i > last)
                    last = +i;
            return last;
        }
        getLastOutputIndex() {
            if (!this.outputs)
                return -1;
            let last = -1;
            for (let i in this.outputs)
                if (+i > last)
                    last = +i;
            return last;
        }
        /**
         * Computes the size of a node according to its inputs and output slots
         * @param minHeight
         * @returns {[number, number]} the total size
         */
        computeSize(minHeight) {
            // let i_slots = this.getInputsCount();
            // let o_slots = this.getOutputsCount();
            let i_slots = this.getLastInputIndes() + 1;
            let o_slots = this.getLastOutputIndex() + 1;
            let rows = Math.max(this.inputs ? i_slots : 1, this.outputs ? o_slots : 1);
            let size = [0, 0];
            rows = Math.max(rows, 1);
            size[1] = rows * 14 + 6;
            let font_size = 14;
            let title_width = compute_text_size(this.title);
            let input_width = 0;
            let output_width = 0;
            if (this.inputs)
                for (let i in this.inputs) {
                    let input = this.inputs[i];
                    let text = input.label || input.name || "";
                    let text_width = compute_text_size(text);
                    if (input_width < text_width)
                        input_width = text_width;
                }
            if (this.outputs)
                for (let o in this.outputs) {
                    let output = this.outputs[o];
                    let text = output.label || output.name || "";
                    let text_width = compute_text_size(text);
                    if (output_width < text_width)
                        output_width = text_width;
                }
            size[0] = Math.max(input_width + output_width + 10, title_width);
            size[0] = Math.max(size[0], nodes_1.Nodes.options.NODE_WIDTH);
            function compute_text_size(text) {
                if (!text)
                    return 0;
                return font_size * text.length * 0.6;
            }
            return size;
        }
        /**
         * Returns the bounding of the object, used for rendering purposes
         * @returns {[number, number, number, number]} the total size
         */
        getBounding() {
            return [this.pos[0] - 4, this.pos[1] - nodes_1.Nodes.options.NODE_TITLE_HEIGHT, this.pos[0] + this.size[0] + 4, this.pos[1] + this.size[1] + nodes_1.Nodes.options.NODE_TITLE_HEIGHT];
        }
        /**
         * Is inside rectangle
         * @param x
         * @param y
         * @param left
         * @param top
         * @param width
         * @param height
         * @returns {boolean}
         */
        isInsideRectangle(x, y, left, top, width, height) {
            if (left < x && (left + width) > x &&
                top < y && (top + height) > y)
                return true;
            return false;
        }
        /**
         * Checks if a point is inside the shape of a node
         * @param x
         * @param y
         * @param margin
         * @returns {boolean}
         */
        isPointInsideNode(x, y, margin) {
            margin = margin || 0;
            // let margin_top = this.container ? 0 : 20;
            let margin_top = 20;
            if (this.flags.collapsed) {
                //if ( distance([x,y], [this.pos[0] + this.size[0]*0.5, this.pos[1] + this.size[1]*0.5]) < Nodes.NODE_COLLAPSED_RADIUS)
                if (this.isInsideRectangle(x, y, this.pos[0] - margin, this.pos[1] - nodes_1.Nodes.options.NODE_TITLE_HEIGHT - margin, nodes_1.Nodes.options.NODE_COLLAPSED_WIDTH + 2 * margin, nodes_1.Nodes.options.NODE_TITLE_HEIGHT + 2 * margin))
                    return true;
            }
            else if ((this.pos[0] - 4 - margin) < x && (this.pos[0] + this.size[0] + 4 + margin) > x
                && (this.pos[1] - margin_top - margin) < y && (this.pos[1] + this.size[1] + margin) > y)
                return true;
            return false;
        }
        /**
         * Checks if a point is inside a node slot, and returns info about which slot
         * @param x
         * @param y
         * @returns {IInputInfo|IOutputInfo} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
         */
        getSlotInPosition(x, y) {
            //search for inputs
            if (this.inputs)
                for (let i in this.inputs) {
                    let input = this.inputs[i];
                    let link_pos = this.getConnectionPos(true, +i);
                    if (this.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                        return { input: input, slot: +i, link_pos: link_pos, locked: input.locked };
                }
            if (this.outputs)
                for (let o in this.outputs) {
                    let output = this.outputs[o];
                    let link_pos = this.getConnectionPos(false, +o);
                    if (this.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                        return { output: output, slot: +o, link_pos: link_pos, locked: output.locked };
                }
            return null;
        }
        /**
         * Returns the input slot with a given name (used for dynamic slots), -1 if not found
         * @param name the name of the slot
         * @returns {number} the slot (-1 if not found)
         */
        findInputSlot(name) {
            if (!this.inputs)
                return -1;
            for (let i in this.inputs) {
                if (name == this.inputs[i].name)
                    return +i;
            }
            return -1;
        }
        /**
         * Returns the output slot with a given name (used for dynamic slots), -1 if not found
         * @param name the name of the slot
         * @returns {number} the slot (-1 if not found)
         */
        findOutputSlot(name) {
            if (!this.outputs)
                return -1;
            for (let o in this.outputs) {
                if (name == this.outputs[o].name)
                    return +o;
            }
            return -1;
        }
        /**
         * Connect output to the input of another node
         * @param {number} output_id output id
         * @param {number} target_node_id target node id
         * @param {number} input_id input id of target node
         * @returns {boolean} true if connected successfully
         */
        connect(output_id, target_node_id, input_id) {
            //get target node
            let target_node = this.container.getNodeById(target_node_id);
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
            let output = this.outputs[output_id];
            let input = target_node.inputs[input_id];
            //check data types compatible
            if (input.type && output.type && input.type != output.type)
                return false;
            //check target node allows connection
            if (target_node.onConnectInput)
                if (target_node.onConnectInput(input_id, output) == false)
                    return false;
            //if target node input already connected
            if (input.link)
                target_node.disconnectInput(input_id);
            if (!output.links)
                output.links = [];
            output.links.push({ target_node_id: target_node_id, target_slot: input_id });
            input.link = { target_node_id: this.id, target_slot: output_id };
            if (this.container.db) {
                let s_node = this.serialize(true);
                let s_t_node = target_node.serialize(true);
                this.container.db.updateNode(this.id, this.container.id, { outputs: s_node.outputs });
                this.container.db.updateNode(target_node.id, target_node.container.id, { inputs: s_t_node.inputs });
            }
            this.setDirtyCanvas(false, true);
            if (this.container)
                this.container.connectionChange(this);
            this.debug("connected to " + target_node.getReadableId());
            return true;
        }
        /**
         * Disconnect node output
         * @param {number} output_id output id
         * @param target_node_id if defined, one links to this node will be disconnected, otherwise all links will be disconnected
         * @param input_id if defined, only one link will be disconnected, otherwise all links will be disconnected
         * @returns {boolean} true if disconnected successfully
         */
        disconnectOutput(output_id, target_node_id, input_id) {
            //get target node
            let target_node;
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
            let output = this.outputs[output_id];
            //check input exist
            let input;
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
            let i = output.links.length;
            while (i--) {
                let link = output.links[i];
                if (target_node_id) {
                    if (target_node_id != link.target_node_id)
                        continue;
                    if (input_id) {
                        if (input_id != link.target_slot)
                            continue;
                    }
                }
                //remove link
                let t_node = this.container.getNodeById(link.target_node_id);
                delete t_node.inputs[link.target_slot].link;
                output.links.splice(i, 1);
                if (this.container.db) {
                    let s_t_node = t_node.serialize(true);
                    this.container.db.updateNode(t_node.id, t_node.container.id, { inputs: s_t_node.inputs });
                }
                this.debug("disconnected from " + t_node.getReadableId());
            }
            if (output.links.length == 0)
                delete output.links;
            if (this.container.db) {
                let s_node = this.serialize(true);
                this.container.db.updateNode(this.id, this.container.id, { outputs: s_node.outputs });
            }
            this.setDirtyCanvas(false, true);
            if (this.container)
                this.container.connectionChange(this);
            return true;
        }
        /**
         * Disconnect input
         * @param {number} input_id input id
         * @returns {boolean} true if disconnected successfully
         */
        disconnectInput(input_id) {
            //check input exist
            if (!this.inputs || !this.inputs[input_id]) {
                this.debugErr("Can't disconnect, input not found");
                return false;
            }
            let input = this.inputs[input_id];
            let link = input.link;
            if (!link)
                return false;
            //disconnect output
            let target_node = this.container.getNodeById(link.target_node_id);
            if (!target_node)
                return false;
            let output = target_node.outputs[link.target_slot];
            if (!output || !output.links)
                return false;
            let i = output.links.length;
            while (i--) {
                let output_link = output.links[i];
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
            if (this.container.db) {
                let s_node = this.serialize(true);
                let s_target_node = target_node.serialize(true);
                this.container.db.updateNode(this.id, this.container.id, { inputs: s_node.inputs });
                this.container.db.updateNode(target_node.id, target_node.container.id, { outputs: s_target_node.outputs });
            }
            this.setDirtyCanvas(false, true);
            if (this.container)
                this.container.connectionChange(this);
            this.debug("disconnected from " + target_node.getReadableId());
            return true;
        }
        /**
         * Returns the center of a connection point in renderer coords
         * @param is_input true if if a input slot, false if it is an output
         * @param slot (could be the number of the slot or the string with the name of the slot)
         * @returns {[x,y]} the position
         **/
        getConnectionPos(is_input, slot_number) {
            if (this.flags.collapsed) {
                if (is_input)
                    return [this.pos[0], this.pos[1] - nodes_1.Nodes.options.NODE_TITLE_HEIGHT * 0.5];
                else
                    return [this.pos[0] + nodes_1.Nodes.options.NODE_COLLAPSED_WIDTH, this.pos[1] - nodes_1.Nodes.options.NODE_TITLE_HEIGHT * 0.5];
            }
            if (is_input && slot_number == -1) {
                return [this.pos[0] + 10, this.pos[1] + 10];
            }
            if (is_input && this.inputs[slot_number] && this.inputs[slot_number].pos)
                return [this.pos[0] + this.inputs[slot_number].pos[0], this.pos[1] + this.inputs[slot_number].pos[1]];
            else if (!is_input && this.outputs[slot_number] && this.outputs[slot_number].pos)
                return [this.pos[0] + this.outputs[slot_number].pos[0], this.pos[1] + this.outputs[slot_number].pos[1]];
            if (!is_input)
                return [this.pos[0] + this.size[0] + 1, this.pos[1] + 10 + slot_number * nodes_1.Nodes.options.NODE_SLOT_HEIGHT];
            return [this.pos[0], this.pos[1] + 10 + slot_number * nodes_1.Nodes.options.NODE_SLOT_HEIGHT];
        }
        /**
         * Force align to grid
         */
        alignToGrid() {
            this.pos[0] = nodes_1.Nodes.options.CANVAS_GRID_SIZE * Math.round(this.pos[0] / nodes_1.Nodes.options.CANVAS_GRID_SIZE);
            this.pos[1] = nodes_1.Nodes.options.CANVAS_GRID_SIZE * Math.round(this.pos[1] / nodes_1.Nodes.options.CANVAS_GRID_SIZE);
        }
        //
        // /* Console output */
        // trace(msg) {
        //     if (!this.console)
        //         this.console = [];
        //     this.console.push(msg);
        //     if (this.console.length > Node.MAX_CONSOLE)
        //         this.console.shift();
        //
        //     nodeDebug(this.title + ": " + msg);
        // }
        //
        // traceError(msg) {
        //     if (!this.console)
        //         this.console = [];
        //     this.console.push(msg);
        //     if (this.console.length > Node.MAX_CONSOLE)
        //         this.console.shift();
        //
        //     nodeDebugErr(this.title + ": " + msg);
        // }
        //
        /* Forces to redraw or the main renderer (Node) or the bg renderer (links) */
        setDirtyCanvas(dirty_foreground, dirty_background) {
            if (!this.container)
                return;
            this.container.sendActionToRenderer("setDirty", [dirty_foreground, dirty_background]);
        }
        loadImage(url) {
            let img = new Image();
            img.src = nodes_1.Nodes.options.NODE_IMAGES_PATH + url;
            img.ready = false;
            let that = this;
            img.onload = function () {
                this.ready = true;
                that.setDirtyCanvas(true);
            };
            return img;
        }
        /**
         * safe Node action execution (not sure if safe)
         * @param action
         * @returns {boolean}
         */
        executeAction(action) {
            if (action == "")
                return false;
            if (action.indexOf(";") != -1 || action.indexOf("}") != -1) {
                this.debugErr("Action contains unsafe characters");
                return false;
            }
            let tokens = action.split("(");
            let func_name = tokens[0];
            if (typeof (this[func_name]) != "function") {
                this.debugErr("Action not found on node: " + func_name);
                return false;
            }
            let code = action;
            try {
            }
            catch (err) {
                this.debugErr("Error executing action {" + action + "} :" + err);
                return false;
            }
            return true;
        }
        /**
         * Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus
         * @param v
         */
        captureInput(v) {
            if (!this.container || !this.container.list_of_renderers)
                return;
            let list = this.container.list_of_renderers;
            for (let i = 0; i < list.length; ++i) {
                let c = list[i];
                //releasing somebody elses capture?!
                if (!v && c.node_capturing_input != this)
                    continue;
                //change
                c.node_capturing_input = v ? this : null;
            }
        }
        /**
         * Collapse the node to make it smaller on the renderer
         **/
        collapse() {
            if (!this.flags.collapsed)
                this.flags.collapsed = true;
            else
                this.flags.collapsed = false;
            this.setDirtyCanvas(true, true);
        }
        localToScreen(x, y, canvas) {
            return [(x + this.pos[0]) * canvas.scale + canvas.offset[0],
                (y + this.pos[1]) * canvas.scale + canvas.offset[1]];
        }
        /**
         * Print debug message to console
         * @param message
         * @param module
         */
        debug(message) {
            log.debug(this.getReadableId() + " " + message);
        }
        /**
         * Print error message to console
         * @param message
         * @param module
         */
        debugErr(message, module) {
            log.error(this.getReadableId() + " " + message);
        }
        getReadableId() {
            return `[${this.type}][${this.container.id}/${this.id}]`;
        }
        /**
         * is node running on back-side
         * @returns {boolean}
         */
        isBackside() {
            return (typeof (window) === 'undefined');
        }
        sendMessageToFrontSide(mess) {
            if (this.isBackside() && this.id != -1) {
                this.container.socket.emit('node-message-to-front-side', { id: this.id, cid: this.container.id, value: mess });
            }
        }
        sendMessageToDashboardSide(mess) {
            if (this.isBackside() && this.id != -1) {
                this.container.socket.emit('node-message-to-dashboard-side', { id: this.id, cid: this.container.id, value: mess });
            }
        }
        sendMessageToBackSide(mess) {
            if (!this.isBackside() && this.id != -1) {
                this.container.socket.emit('node-message-to-back-side', { id: this.id, cid: this.container.id, value: mess });
            }
        }
        updateInputsLabels() {
            if (this.inputs) {
                for (let i in this.inputs) {
                    let input = this.inputs[i];
                    input.label = input.name;
                }
                this.setDirtyCanvas(true, true);
            }
        }
        updateOutputsLabels() {
            if (this.outputs) {
                for (let o in this.outputs) {
                    let output = this.outputs[o];
                    output.label = output.name;
                }
                this.setDirtyCanvas(true, true);
            }
        }
    }
    exports.Node = Node;
});
//# sourceMappingURL=node.js.map