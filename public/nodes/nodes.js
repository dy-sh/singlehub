/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const utils_1 = require("./utils");
    class NodesOptions {
        constructor() {
            this.MAX_NUMBER_OF_NODES = 1000; //avoid infinite loops
            this.DEFAULT_POSITION = [100, 100]; //default node position
            this.START_POS = 50;
            this.FREE_SPACE_UNDER = 30;
            this.NODE_TITLE_HEIGHT = 16;
            this.NODE_SLOT_HEIGHT = 15;
            this.NODE_WIDTH = 150;
            this.NODE_MIN_WIDTH = 50;
            this.NODE_COLLAPSED_RADIUS = 10;
            this.NODE_COLLAPSED_WIDTH = 150;
            this.CANVAS_GRID_SIZE = 10;
            this.NODE_TITLE_COLOR = "#222";
            this.NODE_DEFAULT_COLOR = "#777";
            this.NODE_DEFAULT_BGCOLOR = "#373737";
            this.PANEL_NODE_COLOR = "#777";
            this.PANEL_NODE_BGCOLOR = "#373737";
            this.IO_NODE_COLOR = "#777";
            this.IO_NODE_BGCOLOR = "#373737";
            this.NODE_DEFAULT_IO_COLOR = "#999";
            this.NODE_OPTIONAL_IO_COLOR = "#777";
            this.NODE_DEFAULT_BOXCOLOR = "#373737";
            this.NODE_ACTIVE_BOXCOLOR = "#AEF";
            this.NODE_DEFAULT_SHAPE = "box";
            this.TITLE_TEXT_FONT = "bold 13px Arial";
            this.INNER_TEXT_FONT = "normal 12px Arial";
            this.SHADOWS_WIDTH = 2;
            this.MENU_TEXT_COLOR = "#BBD";
            this.MENU_BG_COLOR = "#353535";
            this.BG_IMAGE = "/images/grid.png";
            this.NODE_IMAGES_PATH = "";
            this.RENDER_CONNECTION_ARROWS = true;
            this.CONNECTIONS_WIDTH = 4;
            this.CONNECTIONS_SHADOW = 4;
            this.SELECTION_COLOR = "#FFF";
            this.SELECTION_WIDTH = 2;
            this.DATATYPE_COLOR = {
                0: "#AAA",
                1: "#AAA",
                2: "#AAA"
            };
            this.NEW_LINK_COLOR = "#CCC";
            this.LINK_TYPE_COLORS = { 0: "#AAC", 1: "#AAC", 2: "#AAC" };
            this.LINK_COLORS = ["#AAC", "#ACA", "#CAA"];
            this.NODE_COLORS = {
                "red": { color: "#FAA", bgcolor: "#A44" },
                "green": { color: "#AFA", bgcolor: "#4A4" },
                "blue": { color: "#AAF", bgcolor: "#44A" },
                "white": { color: "#FFF", bgcolor: "#AAA" }
            };
        }
    }
    exports.NodesOptions = NodesOptions;
    class Output {
    }
    exports.Output = Output;
    class Input {
    }
    exports.Input = Input;
    class Link {
    }
    exports.Link = Link;
    class Nodes {
        /**
         * Register a node class so it can be listed when the user wants to create a new one
         * @param type name of the node and path
         * @param base_class class containing the structure of a node
         */
        static registerNodeType(type, base_class) {
            if (!base_class.prototype)
                throw ("Cannot register a simple object, it must be a class with a prototype");
            base_class.type = type;
            utils_1.default.debug("Node registered: " + type, this.MODULE_NAME);
            let categories = type.split("/");
            let pos = type.lastIndexOf("/");
            base_class.category = type.substr(0, pos);
            //info.name = name.substr(pos+1,name.length - pos);
            //extend class
            if (base_class.prototype)
                for (let i in Node.prototype)
                    if (!base_class.prototype[i])
                        base_class.prototype[i] = Node.prototype[i];
            this.registered_node_types[type] = base_class;
            if (base_class.constructor.name)
                this.Nodes[base_class.constructor.name] = base_class;
        }
        ;
        /**
         * Adds this method to all nodetypes, existing and to be created
         * (You can add it to Node.prototype but then existing node types wont have it)
         * @param name
         * @param func
         */
        static addNodeMethod(name, func) {
            Node.prototype[name] = func;
            for (let i in this.registered_node_types)
                this.registered_node_types[i].prototype[name] = func;
        }
        ;
        /**
         * Create a node of a given type with a name. The node is not attached to any engine yet.
         * @param type full name of the node class. p.e. "math/sin"
         * @param name a name to distinguish from other nodes
         * @param options to set options
         */
        static createNode(type, title, options) {
            let base_class = this.registered_node_types[type];
            if (!base_class) {
                utils_1.default.debug("Can`t create node. Node type \"" + type + "\" not registered.", this.MODULE_NAME);
                return null;
            }
            let prototype = base_class.prototype || base_class;
            title = title || base_class.title || type;
            let node = new base_class(title);
            node.nodes = this;
            node.type = type;
            if (!node.title)
                node.title = title;
            if (!node.properties)
                node.properties = {};
            if (!node.flags)
                node.flags = {};
            //  if (!node.size) node.size = [this.NODE_WIDTH, 60];
            if (!node.size)
                node.size = node.computeSize();
            if (!node.pos)
                node.pos = this.options.DEFAULT_POSITION.concat();
            //extra options
            if (options) {
                for (let i in options)
                    node[i] = options[i];
            }
            //    node.id = this.guid();
            return node;
        }
        ;
        /**
         * Returns a registered node type with a given name
         * @param type full name of the node class. p.e. "math/sin"
         * @returns {Node} the node class
         */
        static getNodeType(type) {
            return this.registered_node_types[type];
        }
        ;
        /**
         * Returns a list of node types matching one category
         * @param category category name
         * @returns {Array} array with all the node classes
         */
        static getNodeTypesInCategory(category) {
            let r = [];
            for (let i in this.registered_node_types)
                if (category == "") {
                    if (this.registered_node_types[i].category == null)
                        r.push(this.registered_node_types[i]);
                }
                else if (this.registered_node_types[i].category == category)
                    r.push(this.registered_node_types[i]);
            return r;
        }
        ;
        /**
         * Returns a list with all the node type categories
         * @returns {Array} array with all the names of the categories
         */
        static getNodeTypesCategories() {
            let categories = { "": 1 };
            for (let i in this.registered_node_types)
                if (this.registered_node_types[i].category && !this.registered_node_types[i].skip_list)
                    categories[this.registered_node_types[i].category] = 1;
            let result = [];
            for (let i in categories)
                result.push(i);
            return result;
        }
        ;
        /**
         * debug purposes: reloads all the js scripts that matches a wilcard
         * @param folder_wildcard
         */
        static reloadNodes(folder_wildcard) {
            let tmp = document.getElementsByTagName("script");
            //weird, this array changes by its own, so we use a copy
            let script_files = [];
            for (let i in tmp)
                script_files.push(tmp[i]);
            let docHeadObj = document.getElementsByTagName("head")[0];
            folder_wildcard = document.location.href + folder_wildcard;
            for (let i in script_files) {
                let src = script_files[i].src;
                if (!src || src.substr(0, folder_wildcard.length) != folder_wildcard)
                    continue;
                try {
                    utils_1.default.debug("Reloading: " + src, this.MODULE_NAME);
                    let dynamicScript = document.createElement("script");
                    dynamicScript.type = "text/javascript";
                    dynamicScript.src = src;
                    docHeadObj.appendChild(dynamicScript);
                    docHeadObj.removeChild(script_files[i]);
                }
                catch (err) {
                    if (this.throw_errors)
                        throw err;
                    utils_1.default.debugErr("Error while reloading " + src, this.MODULE_NAME);
                }
            }
            utils_1.default.debug("Nodes reloaded", this.MODULE_NAME);
        }
        ;
        /**
         * Get current time
         * @returns {number}
         */
        static getTime() {
            return (typeof (performance) != "undefined") ? performance.now() : Date.now();
        }
        ;
    }
    Nodes.options = new NodesOptions;
    Nodes.MAIN_PANEL_ID = "Main";
    Nodes.DataType = {
        Text: 0,
        Number: 1,
        Logical: 2
    };
    Nodes.proxy = null; //used to redirect calls
    Nodes.throw_errors = true;
    Nodes.registered_node_types = {};
    Nodes.Nodes = {};
    //   debug: config.engine.debugEngine,
    Nodes.MODULE_NAME = "Nodes";
    exports.Nodes = Nodes;
    // *************************************************************
    //   Node CLASS                                          *******
    // *************************************************************
    class Node {
        constructor(title = "Unnamed") {
            this.pos = [10, 10];
            this.title = title;
            this.id = -1; //not know till not added
        }
        /**
         * Configure a node from an object containing the serialized info
         * @param info object with properties for configure
         */
        configure(info) {
            for (let j in info) {
                if (j == "console")
                    continue;
                if (j == "properties") {
                    //i dont want to clone properties, I want to reuse the old container
                    for (let k in info.properties)
                        this.properties[k] = info.properties[k];
                    continue;
                }
                if (info[j] == null)
                    continue;
                else if (typeof (info[j]) == 'object') {
                    if (this[j] && this[j].configure)
                        this[j].configure(info[j]);
                    else
                        this[j] = utils_1.default.cloneObject(info[j], this[j]);
                }
                else
                    this[j] = info[j];
            }
            //FOR LEGACY, PLEASE REMOVE ON NEXT VERSION
            for (let i in this.inputs) {
                let input = this.inputs[i];
                if (!input.link)
                    continue;
                let link = input.link;
                if (typeof (link) != "object")
                    continue;
                input.link = link[0];
                this.engine.links[link[0]] = {
                    id: link[0],
                    origin_id: link[1],
                    origin_slot: link[2],
                    target_id: link[3],
                    target_slot: link[4]
                };
            }
            for (let i in this.outputs) {
                let output = this.outputs[i];
                if (!output.links || output.links.length == 0)
                    continue;
                for (let j in output.links) {
                    let link = output.links[j];
                    if (typeof (link) != "object")
                        continue;
                    output.links[j] = link[0];
                }
            }
        }
        /**
         * Serialize node
         */
        serialize() {
            let o = {
                id: this.id,
                title: this.title,
                type: this.type,
                pos: this.pos,
                size: this.size,
                data: this.data,
                lags: utils_1.default.cloneObject(this.flags),
                inputs: this.inputs,
                outputs: this.outputs,
                properties: null,
                color: null,
                bgcolor: null,
                boxcolor: null,
                shape: null
            };
            if (this.properties)
                o.properties = utils_1.default.cloneObject(this.properties);
            //todo ES6
            // if (!o.type)
            //     o.type = this.constructor.type;
            if (this.color)
                o.color = this.color;
            if (this.bgcolor)
                o.bgcolor = this.bgcolor;
            if (this.boxcolor)
                o.boxcolor = this.boxcolor;
            if (this.shape)
                o.shape = this.shape;
            if (this.onSerialize)
                this.onSerialize(o);
            return o;
        }
        /**
         * Creates a clone of this node
         * @returns {Node}
         */
        clone() {
            let node = Nodes.createNode(this.type);
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
         * @param slot slot id
         * @param data slot data
         */
        setOutputData(slot, data) {
            if (!this.outputs)
                return;
            if (slot > -1 && slot < this.outputs.length && this.outputs[slot] && this.outputs[slot].links != null) {
                for (let i = 0; i < this.outputs[slot].links.length; i++) {
                    let link_id = this.outputs[slot].links[i];
                    this.engine.links[link_id].data = data;
                }
            }
        }
        /**
         * Retrieves the input data (data traveling through the connection) from one slot
         * @param slot slot id
         * @returns {any} data or if it is not connected returns undefined
         */
        getInputData(slot) {
            if (!this.inputs)
                return; //undefined;
            if (slot < this.inputs.length && this.inputs[slot].link != null)
                return this.engine.links[this.inputs[slot].link].data;
            return; //undefined;
        }
        /**
         * If there is a connection in one input slot
         * @param slot slot id
         * @returns {boolean}
         */
        isInputConnected(slot) {
            if (!this.inputs)
                return false;
            return (slot < this.inputs.length && this.inputs[slot].link != null);
        }
        /**
         * Returns info about an input connection (which node, type, etc)
         * @param slot slot id
         * @returns {Object} object or null
         */
        getInputInfo(slot) {
            if (!this.inputs)
                return null;
            if (slot < this.inputs.length)
                return this.inputs[slot];
            return null;
        }
        /**
         * Returns info about an output connection (which node, type, etc)
         * @param slot slot id
         * @returns {Object}  object or null
         */
        getOutputInfo(slot) {
            if (!this.outputs)
                return null;
            if (slot < this.outputs.length)
                return this.outputs[slot];
            return null;
        }
        /**
         * if there is a connection in one output slot
         * @param slot slot id
         * @returns {boolean}
         */
        isOutputConnected(slot) {
            if (!this.outputs)
                return null;
            return (slot < this.outputs.length && this.outputs[slot].links && this.outputs[slot].links.length > 0);
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
        //             r.push(this.engine.getNodeById(output.links[i].target_id));
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
            let o = { name: name, type: type, links: null };
            if (extra_info)
                for (let i in extra_info)
                    o[i] = extra_info[i];
            if (!this.outputs)
                this.outputs = [];
            this.outputs.push(o);
            if (this.onOutputAdded)
                this.onOutputAdded(o);
            this.size = this.computeSize();
        }
        /**
         * Add a new output slot to use in this node
         * @param  array of triplets like [[name,type,extra_info],[...]]
         */
        addOutputs(array) {
            for (let i = 0; i < array.length; ++i) {
                let info = array[i];
                let o = { name: info[0], type: info[1], links: null };
                if (array[2])
                    for (let j in info[2])
                        o[j] = info[2][j];
                if (!this.outputs)
                    this.outputs = [];
                this.outputs.push(o);
                if (this.onOutputAdded)
                    this.onOutputAdded(o);
            }
            this.size = this.computeSize();
        }
        /**
         * Remove an existing output slot
         * @param slot slot id
         */
        removeOutput(slot) {
            this.disconnectOutput(slot);
            this.outputs.splice(slot, 1);
            this.size = this.computeSize();
            if (this.onOutputRemoved)
                this.onOutputRemoved(slot);
        }
        /**
         * Add a new input slot to use in this node
         * @param name
         * @param type string defining the input type ("vec3","number",...), it its a generic one use 0
         * @param extra_info this can be used to have special properties of an input (label, color, position, etc)
         */
        addInput(name, type, extra_info) {
            let o = { name: name, type: type, link: null };
            if (extra_info)
                for (let i in extra_info)
                    o[i] = extra_info[i];
            if (!this.inputs)
                this.inputs = [];
            this.inputs.push(o);
            this.size = this.computeSize();
            if (this.onInputAdded)
                this.onInputAdded(o);
        }
        /**
         * add several new input slots in this node
         * @param {Array} array of triplets like [[name,type,extra_info],[...]]
         */
        addInputs(array) {
            for (let i = 0; i < array.length; ++i) {
                let info = array[i];
                let o = { name: info[0], type: info[1], link: null };
                if (array[2])
                    for (let j in info[2])
                        o[j] = info[2][j];
                if (!this.inputs)
                    this.inputs = [];
                this.inputs.push(o);
                if (this.onInputAdded)
                    this.onInputAdded(o);
            }
            this.size = this.computeSize();
        }
        /**
         * Remove an existing input slot
         * @method removeInput
         * @param slot
         */
        removeInput(slot) {
            this.disconnectInput(slot);
            this.inputs.splice(slot, 1);
            this.size = this.computeSize();
            if (this.onInputRemoved)
                this.onInputRemoved(slot);
        }
        // /**
        //  * add an special connection to this node (used for special kinds of graphs)
        //  * @method addConnection
        //  * @param name
        //  * @param type string defining the input type ("vec3","number",...)
        //  * @param {[x,y]} pos position of the connection inside the node
        //  * @param direction if is input or output
        //  */
        // addConnection(name, type, pos, direction) {
        //     this.connections.push({name: name, type: type, pos: pos, direction: direction, links: null});
        // }
        /**
         * Computes the size of a node according to its inputs and output slots
         * @param minHeight
         * @returns {[number, number]} the total size
         */
        computeSize(minHeight) {
            let rows = Math.max(this.inputs ? this.inputs.length : 1, this.outputs ? this.outputs.length : 1);
            let size = [0, 0];
            rows = Math.max(rows, 1);
            size[1] = rows * 14 + 6;
            let font_size = 14;
            let title_width = compute_text_size(this.title);
            let input_width = 0;
            let output_width = 0;
            if (this.inputs)
                for (let i = 0, l = this.inputs.length; i < l; ++i) {
                    let input = this.inputs[i];
                    let text = input.label || input.name || "";
                    let text_width = compute_text_size(text);
                    if (input_width < text_width)
                        input_width = text_width;
                }
            if (this.outputs)
                for (let i = 0, l = this.outputs.length; i < l; ++i) {
                    let output = this.outputs[i];
                    let text = output.label || output.name || "";
                    let text_width = compute_text_size(text);
                    if (output_width < text_width)
                        output_width = text_width;
                }
            size[0] = Math.max(input_width + output_width + 10, title_width);
            size[0] = Math.max(size[0], Nodes.options.NODE_WIDTH);
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
            return [this.pos[0] - 4, this.pos[1] - Nodes.options.NODE_TITLE_HEIGHT, this.pos[0] + this.size[0] + 4, this.pos[1] + this.size[1] + Nodes.options.NODE_TITLE_HEIGHT];
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
            let margin_top = this.engine && this.engine.isLive() ? 0 : 20;
            if (this.flags.collapsed) {
                //if ( distance([x,y], [this.pos[0] + this.size[0]*0.5, this.pos[1] + this.size[1]*0.5]) < Nodes.NODE_COLLAPSED_RADIUS)
                if (this.isInsideRectangle(x, y, this.pos[0] - margin, this.pos[1] - Nodes.options.NODE_TITLE_HEIGHT - margin, Nodes.options.NODE_COLLAPSED_WIDTH + 2 * margin, Nodes.options.NODE_TITLE_HEIGHT + 2 * margin))
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
                for (let i = 0, l = this.inputs.length; i < l; ++i) {
                    let input = this.inputs[i];
                    let link_pos = this.getConnectionPos(true, i);
                    if (this.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                        return { input: input, slot: i, link_pos: link_pos, locked: input.locked };
                }
            if (this.outputs)
                for (let i = 0, l = this.outputs.length; i < l; ++i) {
                    let output = this.outputs[i];
                    let link_pos = this.getConnectionPos(false, i);
                    if (this.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                        return { output: output, slot: i, link_pos: link_pos, locked: output.locked };
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
            for (let i = 0, l = this.inputs.length; i < l; ++i)
                if (name == this.inputs[i].name)
                    return i;
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
            for (let i = 0, l = this.outputs.length; i < l; ++i)
                if (name == this.outputs[i].name)
                    return i;
            return -1;
        }
        /**
         * Connect this node output to the input of another node
         * @param {number|string} slot (could be the number of the slot or the string with the name of the slot)
         * @param {Node} node the target node
         * @param {number|string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot)
         * @returns {boolean} if it was connected succesfully
         */
        connect(slot, node, target_slot) {
            target_slot = target_slot || 0;
            //seek for the output slot
            if (typeof slot == "string") {
                slot = this.findOutputSlot(slot);
                if (slot == -1) {
                    this.debugErr("Connect error, no slot of name " + slot);
                    return false;
                }
            }
            else if (!this.outputs || slot >= this.outputs.length) {
                this.debugErr("Connect error, slot number not found");
                return false;
            }
            if (node && node.constructor === Number)
                node = this.engine.getNodeById(node.id);
            if (!node)
                throw ("Node not found");
            //avoid loopback
            if (node == this)
                return false;
            //if( node.constructor != Node ) throw ("Node.connect: node is not of type Node");
            if (typeof target_slot == "string") {
                target_slot = node.findInputSlot(target_slot);
                if (target_slot == -1) {
                    this.debugErr("Connect: Error, no slot of name " + target_slot);
                    return false;
                }
            }
            else if (!node.inputs || target_slot >= node.inputs.length) {
                this.debugErr("Connect: Error, slot number not found");
                return false;
            }
            //if there is something already plugged there, disconnect
            if (target_slot != -1 && node.inputs[target_slot].link != null)
                node.disconnectInput(target_slot);
            //why here??
            this.setDirtyCanvas(false, true);
            if (this.engine)
                this.engine.connectionChange(this);
            //special case: -1 means node-connection, used for triggers
            let output = this.outputs[slot];
            //allows nodes to block connection even if all test passes
            if (node.onConnectInput)
                if (node.onConnectInput(target_slot, output.type, output) === false)
                    return false;
            if (target_slot == -1) {
                if (output.links == null)
                    output.links = [];
                output.links.push(node.id); //todo ES6 push({id: node.id, slot: -1})
            }
            else if (!output.type ||
                !node.inputs[target_slot].type ||
                output.type.toLowerCase() == node.inputs[target_slot].type.toLowerCase()) {
                //info: link structure => [ 0:link_id, 1:start_node_id, 2:start_slot, 3:end_node_id, 4:end_slot ]
                //let link = [ this.engine.last_link_id++, this.id, slot, node.id, target_slot ];
                let link = {
                    id: this.engine.last_link_id++,
                    origin_id: this.id,
                    origin_slot: slot,
                    target_id: node.id,
                    target_slot: target_slot
                };
                this.engine.links[link.id] = link;
                //connect
                if (output.links == null)
                    output.links = [];
                output.links.push(link.id);
                node.inputs[target_slot].link = link.id;
            }
            this.setDirtyCanvas(false, true);
            if (this.engine)
                this.engine.connectionChange(this);
            return true;
        }
        /**
         * Disconnect one output to an specific node
         * @param {number|string} slot (could be the number of the slot or the string with the name of the slot)
         * @param target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
         * @returns {boolean} if it was disconnected succesfully
         */
        disconnectOutput(slot, target_node) {
            if (typeof slot == "string") {
                slot = this.findOutputSlot(slot);
                if (slot == -1) {
                    this.debugErr("Connect: Error, no slot of name " + slot);
                    return false;
                }
            }
            else if (!this.outputs || slot >= this.outputs.length) {
                this.debugErr("Connect: Error, slot number not found");
                return false;
            }
            //get output slot
            let output = this.outputs[slot];
            if (!output.links || output.links.length == 0)
                return false;
            //one of the links
            if (target_node) {
                if (target_node.constructor === Number)
                    target_node = this.engine.getNodeById(target_node.id);
                if (!target_node)
                    throw ("Target Node not found");
                for (let i = 0, l = output.links.length; i < l; i++) {
                    let link_id = output.links[i];
                    let link_info = this.engine.links[link_id];
                    //is the link we are searching for...
                    if (link_info.target_id == target_node.id) {
                        output.links.splice(i, 1); //remove here
                        target_node.inputs[link_info.target_slot].link = null; //remove there
                        delete this.engine.links[link_id]; //remove the link from the links pool
                        break;
                    }
                }
            }
            else {
                for (let i = 0, l = output.links.length; i < l; i++) {
                    let link_id = output.links[i];
                    let link_info = this.engine.links[link_id];
                    let target_node = this.engine.getNodeById(link_info.target_id);
                    if (target_node)
                        target_node.inputs[link_info.target_slot].link = null; //remove other side link
                    delete this.engine.links[link_id]; //remove the link from the links pool
                }
                output.links = null;
            }
            this.setDirtyCanvas(false, true);
            if (this.engine)
                this.engine.connectionChange(this);
            return true;
        }
        /**
         * Disconnect one input
         * @param {number|string} slot (could be the number of the slot or the string with the name of the slot)
         * @returns {boolean} if it was disconnected succesfully
         */
        disconnectInput(slot) {
            //seek for the output slot
            if (typeof slot == "string") {
                slot = this.findInputSlot(slot);
                if (slot == -1) {
                    this.debugErr("Connect: Error, no slot of name " + slot);
                    return false;
                }
            }
            else if (!this.inputs || slot >= this.inputs.length) {
                this.debugErr("Connect: Error, slot number not found");
                return false;
            }
            let input = this.inputs[slot];
            if (!input)
                return false;
            let link_id = this.inputs[slot].link;
            this.inputs[slot].link = null;
            //remove other side
            let link_info = this.engine.links[link_id];
            if (link_info) {
                let node = this.engine.getNodeById(link_info.origin_id);
                if (!node)
                    return false;
                let output = node.outputs[link_info.origin_slot];
                if (!output || !output.links || output.links.length == 0)
                    return false;
                //check outputs
                for (let i = 0, l = output.links.length; i < l; i++) {
                    let link_id = output.links[i];
                    let link_info = this.engine.links[link_id];
                    if (link_info.target_id == this.id) {
                        output.links.splice(i, 1);
                        break;
                    }
                }
            }
            this.setDirtyCanvas(false, true);
            if (this.engine)
                this.engine.connectionChange(this);
            return true;
        }
        //
        /**
         * Returns the center of a connection point in renderer coords
         * @param is_input true if if a input slot, false if it is an output
         * @param slot (could be the number of the slot or the string with the name of the slot)
         * @returns {[x,y]} the position
         **/
        getConnectionPos(is_input, slot_number) {
            if (this.flags.collapsed) {
                if (is_input)
                    return [this.pos[0], this.pos[1] - Nodes.options.NODE_TITLE_HEIGHT * 0.5];
                else
                    return [this.pos[0] + Nodes.options.NODE_COLLAPSED_WIDTH, this.pos[1] - Nodes.options.NODE_TITLE_HEIGHT * 0.5];
            }
            if (is_input && slot_number == -1) {
                return [this.pos[0] + 10, this.pos[1] + 10];
            }
            if (is_input && this.inputs.length > slot_number && this.inputs[slot_number].pos)
                return [this.pos[0] + this.inputs[slot_number].pos[0], this.pos[1] + this.inputs[slot_number].pos[1]];
            else if (!is_input && this.outputs.length > slot_number && this.outputs[slot_number].pos)
                return [this.pos[0] + this.outputs[slot_number].pos[0], this.pos[1] + this.outputs[slot_number].pos[1]];
            if (!is_input)
                return [this.pos[0] + this.size[0] + 1, this.pos[1] + 10 + slot_number * Nodes.options.NODE_SLOT_HEIGHT];
            return [this.pos[0], this.pos[1] + 10 + slot_number * Nodes.options.NODE_SLOT_HEIGHT];
        }
        /**
         * Force align to grid
         */
        alignToGrid() {
            this.pos[0] = Nodes.options.CANVAS_GRID_SIZE * Math.round(this.pos[0] / Nodes.options.CANVAS_GRID_SIZE);
            this.pos[1] = Nodes.options.CANVAS_GRID_SIZE * Math.round(this.pos[1] / Nodes.options.CANVAS_GRID_SIZE);
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
            if (!this.engine)
                return;
            this.engine.sendActionToRenderer("setDirty", [dirty_foreground, dirty_background]);
        }
        loadImage(url) {
            let img = new Image();
            img.src = Nodes.options.NODE_IMAGES_PATH + url;
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
                console.log("Error: Action contains unsafe characters");
                return false;
            }
            let tokens = action.split("(");
            let func_name = tokens[0];
            if (typeof (this[func_name]) != "function") {
                console.log("Error: Action not found on node: " + func_name);
                return false;
            }
            let code = action;
            try {
            }
            catch (err) {
                console.log("Error executing action {" + action + "} :" + err);
                return false;
            }
            return true;
        }
        /**
         * Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus
         * @param v
         */
        captureInput(v) {
            if (!this.engine || !this.engine.list_of_renderers)
                return;
            let list = this.engine.list_of_renderers;
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
        /**
         * Forces the node to do not move or realign on Z
         **/
        pin(v) {
            if (v === undefined)
                this.flags.pinned = !this.flags.pinned;
            else
                this.flags.pinned = v;
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
            utils_1.default.debug(message, "Node: " + this.type + "(id:" + this.id + ")");
        }
        /**
         * Print error message to console
         * @param message
         * @param module
         */
        debugErr(message, module) {
            utils_1.default.debugErr(message, "Node: " + this.type + "(id:" + this.id + ")");
        }
    }
    exports.Node = Node;
});
//# sourceMappingURL=nodes.js.map