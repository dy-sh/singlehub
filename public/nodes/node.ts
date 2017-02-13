/**
 * Created by derwish on 11.02.17.
 */


import {Container, rootContainer} from "./container";
import Utils from "./utils";
import {Nodes} from "./nodes";


export interface IInputInfo {
    input: NodeInput;
    slot: number;
    link_pos: [number, number];
    locked: boolean;
}

export interface IOutputInfo {
    output: NodeOutput;
    slot: number;
    link_pos: [number, number];
    locked: boolean;
}


export class NodeOutput {
    name: string;
    type: string;
    links: Array<number>;
    label?: string;
    locked?: boolean;
    pos?: boolean;
    round?: number;
    data?: any;
}

export class NodeInput {
    name: string;
    type: string;
    link: number;
    label?: string;
    locked?: boolean;
    pos?: boolean;
    round?: number;
    isOptional?: boolean;
    data?: any;
}

export class Link {
    id: number;
    slot?: number;
    origin_id?: number;
    origin_slot?: number;
    target_id?: number;
    target_slot?: number;
}


export class Node {


    title: string;
    desc: string;
    pos: [number, number] = [10, 10];
    size: [number, number];
    container: Container;
    id: number = -1;
    type: string;
    inputs: Array<NodeInput>;
    outputs: Array<NodeOutput>;
    //   connections: Array<any>;
    properties: any;


    data: any;
    ignore_remove: boolean;
    flags: {
        skip_title_render?: true,
        unsafe_execution?: false,
        collapsed?: boolean,
        pinned?: boolean,
        clip_area?: boolean
    };
    editable: {
        property: string;
        type: string
    };

    mouseOver: boolean;
    selected: boolean;
    getMenuOptions: Function;
    getExtraMenuOptions: Function;

    color: string;
    bgcolor: string;
    boxcolor: string;
    shape: string;
    onSerialize: Function;
    setValue: Function;
    bgImage: HTMLImageElement;
    bgImageUrl: string;
    clonable: boolean;
    removable: boolean;
    optional_inputs: {};
    optional_outputs: {};
    order: string;

//events
    /**
     * Invoked every time when node added to container
     */
    onAdded: Function;

    /**
     * Invoked one time when node removed from container
     */
    onRemoved: Function;

    /**
     * Invoked one time when node created and added to container (after onAdded)
     */
    onCreated: Function;

    onDrawBackground: Function;
    onDrawForeground: Function;

    //if returns false the incoming connection will be canceled
    onConnectInput: Function;
    onInputAdded: Function;
    onOutputAdded: Function;
    onGetInputs: Function;
    onGetOutputs: Function;
    onInputRemoved: Function;
    onOutputRemoved: Function;

    onMouseDown: Function;
    onMouseUp: Function;
    onMouseEnter: Function;
    onMouseMove: Function;
    onMouseLeave: Function;
    onDblClick: Function;
    onDropFile: Function;
    onDropItem: Function;
    onKeyDown: Function;
    onKeyUp: Function;

    onSelected: Function;
    onDeselected: Function;

    onGetMessageFromFrontSide: Function;
    onGetMessageFromBackSide: Function;

    onRunContainer: Function;
    onStopContainer: Function;
    onExecute: Function;
    onInputUpdated: Function;

    isActive: boolean;


    constructor() {
    }


    /**
     * Configure a node from an object containing the serialized info
     * @param info object with properties for configure
     */
    configure(info: any): void {
        for (let j in info) {
            if (j == "console") continue;

            if (j == "properties") {
                //i dont want to clone properties, I want to reuse the old container
                for (let k in info.properties)
                    this.properties[k] = info.properties[k];
                continue;
            }

            if (info[j] == null)
                continue;
            else if (typeof(info[j]) == 'object') //object
            {
                if (this[j] && this[j].configure)
                    this[j].configure(info[j]);
                else
                    this[j] = Utils.cloneObject(info[j], this[j]);
            }
            else //value
                this[j] = info[j];
        }

        //FOR LEGACY, PLEASE REMOVE ON NEXT VERSION
        for (let i in this.inputs) {
            let input = this.inputs[i];
            if (!input.link)//todo ES6:!input.link || !input.link.length
                continue;
            let link = input.link;
            if (typeof(link) != "object")
                continue;
            input.link = link[0];
            this.container.links[link[0]] = {
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
                if (typeof(link) != "object")
                    continue;
                output.links[j] = link[0];
            }
        }

    }

    /**
     * Serialize node
     */
    serialize(): any {
        let o = {
            id: this.id,
            title: this.title,
            type: this.type,
            pos: this.pos,
            size: this.size,
            data: this.data,
            lags: Utils.cloneObject(this.flags),
            inputs: this.inputs,
            outputs: this.outputs,
            properties: null,
            color: null,
            bgcolor: null,
            boxcolor: null,
            shape: null
        };

        if (this.properties)
            o.properties = Utils.cloneObject(this.properties);

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
    clone(): Node {
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
    toString(): string {
        return JSON.stringify(this.serialize());
    }

    /**
     * Get the title string
     */
    getTitle(): string {
        return this.title;
    }

    /**
     * Sets the output data
     * @param slotId slotId id
     * @param data slotId data
     */
    setOutputData(slotId: number, data: any): void {
        if (this.outputs && slotId < this.outputs.length && this.outputs[slotId])
            this.outputs[slotId].data = data;
        this.isActive = true;
    }

    /**
     * Retrieves the input data (data traveling through the connection) from one slotId
     * @param slotId slotId id
     * @returns data or if it is not connected returns undefined
     */
    getInputData(slotId: number): any {
        if (this.inputs && slotId < this.inputs.length && this.inputs[slotId])
            return this.inputs[slotId].data;
    }

    /**
     * If there is a connection in one input slot
     * @param slot slot id
     * @returns {boolean}
     */
    isInputConnected(slot: number): boolean {
        if (!this.inputs)
            return false;
        return (slot < this.inputs.length && this.inputs[slot].link != null);
    }

    /**
     * Returns info about an input connection (which node, type, etc)
     * @param slot slot id
     * @returns {Object} object or null
     */
    getInputInfo(slot: number): any {
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
    getOutputInfo(slot: number): any {
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
    isOutputConnected(slot: number): boolean {
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

    addOutput(name: string, type?: string, extra_info?: any): void {
        let output: NodeOutput = {name: name, type: type, links: null};
        if (extra_info)
            for (let i in extra_info)
                output[i] = extra_info[i];

        if (!this.outputs) this.outputs = [];
        this.outputs.push(output);
        if (this.onOutputAdded)
            this.onOutputAdded(output);
        this.size = this.computeSize();
    }


    /**
     * Add a new output slot to use in this node
     * @param  array of triplets like [[name,type,extra_info],[...]]
     */
    addOutputs(array: Array<NodeOutput>): void {
        for (let i = 0; i < array.length; ++i) {
            let info = array[i];
            let o = {name: info[0], type: info[1], links: null};
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
    removeOutput(slot: number): void {
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
    addInput(name: string, type?: string, extra_info?: any): void {

        let input: NodeInput = {name: name, type: type, link: null};
        if (extra_info)
            for (let i in extra_info)
                input[i] = extra_info[i];

        if (!this.inputs)
            this.inputs = [];
        this.inputs.push(input);
        this.size = this.computeSize();
        if (this.onInputAdded)
            this.onInputAdded(input);
    }

    /**
     * add several new input slots in this node
     * @param {Array} array of triplets like [[name,type,extra_info],[...]]
     */
    addInputs(array: Array<NodeInput>): void {
        for (let i = 0; i < array.length; ++i) {
            let info = array[i];
            let o = {name: info[0], type: info[1], link: null};
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
    removeInput(slot: number): void {
        this.disconnectInput(slot);
        this.inputs.splice(slot, 1);
        this.size = this.computeSize();
        if (this.onInputRemoved)
            this.onInputRemoved(slot);
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

    /**
     * Computes the size of a node according to its inputs and output slots
     * @param minHeight
     * @returns {[number, number]} the total size
     */
    computeSize(minHeight?: number): [number, number] {
        let rows = Math.max(this.inputs ? this.inputs.length : 1, this.outputs ? this.outputs.length : 1);
        let size: [number, number] = [0, 0];
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

    getBounding(): [number, number, number, number] {
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
    isInsideRectangle(x: number, y: number, left: number, top: number, width: number, height: number): boolean {
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
    isPointInsideNode(x: number, y: number, margin: number): boolean {
        margin = margin || 0;

        let margin_top = this.container ? 0 : 20;
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
    getSlotInPosition(x: number, y: number): IInputInfo|IOutputInfo {
        //search for inputs
        if (this.inputs)
            for (let i = 0, l = this.inputs.length; i < l; ++i) {
                let input = this.inputs[i];
                let link_pos = this.getConnectionPos(true, i);
                if (this.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                    return {input: input, slot: i, link_pos: link_pos, locked: input.locked};
            }

        if (this.outputs)
            for (let i = 0, l = this.outputs.length; i < l; ++i) {
                let output = this.outputs[i];
                let link_pos = this.getConnectionPos(false, i);
                if (this.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                    return {output: output, slot: i, link_pos: link_pos, locked: output.locked};
            }

        return null;
    }

    /**
     * Returns the input slot with a given name (used for dynamic slots), -1 if not found
     * @param name the name of the slot
     * @returns {number} the slot (-1 if not found)
     */
    findInputSlot(name: string): number {
        if (!this.inputs) return -1;
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
    findOutputSlot(name: string): number {
        if (!this.outputs) return -1;
        for (let i = 0, l = this.outputs.length; i < l; ++i)
            if (name == this.outputs[i].name)
                return i;
        return -1;
    }

    /**
     * Connect this target_node output to the input of another target_node
     * @param {number|string} slot (could be the number of the slot or the string with the name of the slot)
     * @param {Node} target_node the target target_node
     * @param {number|string} target_slot the input slot of the target target_node (could be the number of the slot or the string with the name of the slot)
     * @returns {boolean} if it was connected succesfully
     */
    connect(slot: number|string, target_node: Node, target_slot: number|string): boolean {
        target_slot = target_slot || 0;

        //seek for the output slot
        if (typeof (slot) == "string") {
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

        if (target_node && target_node.constructor === Number)
            target_node = this.container.getNodeById(target_node.id);
        if (!target_node)
            throw("Node not found");

        //avoid loopback
        if (target_node == this)
            return false;
        //if( target_node.constructor != Node ) throw ("Node.connect: target_node is not of type Node");

        if (typeof (target_slot) == "string") {
            target_slot = target_node.findInputSlot(target_slot);
            if (target_slot == -1) {
                this.debugErr("Connect: Error, no slot of name " + target_slot);
                return false;
            }
        }
        else if (!target_node.inputs || target_slot >= target_node.inputs.length) {
            this.debugErr("Connect: Error, slot number not found");
            return false;
        }

        //if there is something already plugged there, disconnect
        if (target_slot != -1 && target_node.inputs[target_slot].link != null)
            target_node.disconnectInput(target_slot);

        //why here??
        this.setDirtyCanvas(false, true);

        if (this.container)
            this.container.connectionChange(this);

        //special case: -1 means target_node-connection, used for triggers
        let output = this.outputs[slot];

        //allows nodes to block connection even if all test passes
        if (target_node.onConnectInput)
            if (target_node.onConnectInput(target_slot, output.type, output) === false)
                return false;

        if (target_slot == -1) {
            if (output.links == null)
                output.links = [];
            output.links.push(target_node.id);//todo ES6 push({id: target_node.id, slot: -1})
        }
        else if (!output.type ||  //generic output
            !target_node.inputs[target_slot].type || //generic input
            output.type.toLowerCase() == target_node.inputs[target_slot].type.toLowerCase()) //same type
        {
            //info: link structure => [ 0:link_id, 1:start_node_id, 2:start_slot, 3:end_node_id, 4:end_slot ]
            //let link = [ this.container.last_link_id++, this.id, slot, target_node.id, target_slot ];
            let link = {
                id: this.container.last_link_id++,
                origin_id: this.id,
                origin_slot: slot,
                target_id: target_node.id,
                target_slot: target_slot
            };

            this.container.links[link.id] = link;

            //connect
            if (output.links == null) output.links = [];
            output.links.push(link.id);
            target_node.inputs[target_slot].link = link.id;

        }

        this.setDirtyCanvas(false, true);
        if (this.container)
            this.container.connectionChange(this);

        return true;
    }


    /**
     * Disconnect one output to an specific node
     * @param {number|string} slot (could be the number of the slot or the string with the name of the slot)
     * @param target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
     * @returns {boolean} if it was disconnected succesfully
     */
    disconnectOutput(slot: number|string, target_node?: Node): boolean {
        if (typeof (slot) == "string") {
            slot = this.findOutputSlot(slot);
            if (slot == -1) {
                this.debugErr("Disconnect error, no slot of name " + slot);
                return false;
            }
        }
        else if (!this.outputs || slot >= this.outputs.length) {
            this.debugErr("Disconnect error, slot number not found");
            return false;
        }

        //get output slot
        let output = this.outputs[slot];
        if (!output.links || output.links.length == 0)
            return false;

        //one of the links
        if (target_node) {
            if (target_node.constructor === Number)
                target_node = this.container.getNodeById(target_node.id);
            if (!target_node)
                throw("Target Node not found");

            for (let i = 0, l = output.links.length; i < l; i++) {
                let link_id = output.links[i];
                let link_info = this.container.links[link_id];

                //is the link we are searching for...
                if (link_info.target_id == target_node.id) {
                    output.links.splice(i, 1); //remove here
                    target_node.inputs[link_info.target_slot].link = null; //remove there
                    delete this.container.links[link_id]; //remove the link from the links pool
                    break;
                }
            }
        }
        else //all the links
        {
            for (let i = 0, l = output.links.length; i < l; i++) {
                let link_id = output.links[i];
                let link_info = this.container.links[link_id];

                let target_node = this.container.getNodeById(link_info.target_id);
                if (target_node)
                    target_node.inputs[link_info.target_slot].link = null; //remove other side link
                delete this.container.links[link_id]; //remove the link from the links pool
            }
            output.links = null;
        }

        this.setDirtyCanvas(false, true);
        if (this.container)
            this.container.connectionChange(this);
        return true;
    }

    /**
     * Disconnect one input
     * @param {number|string} slot (could be the number of the slot or the string with the name of the slot)
     * @returns {boolean} if it was disconnected succesfully
     */
    disconnectInput(slot: number|string): boolean {
        //find input by name
        if (typeof (slot) == "string") {
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
        let link_info = this.container.links[link_id];
        if (link_info) {
            let node = this.container.getNodeById(link_info.origin_id);
            if (!node)
                return false;

            let output = node.outputs[link_info.origin_slot];
            if (!output || !output.links || output.links.length == 0)
                return false;

            //check outputs
            for (let i = 0, l = output.links.length; i < l; i++) {
                let link_id = output.links[i];
                let link_info = this.container.links[link_id];
                if (link_info.target_id == this.id) {
                    output.links.splice(i, 1);
                    break;
                }
            }
        }

        this.setDirtyCanvas(false, true);

        delete this.container.links[link_id];

        this.container.connectionChange(this);

        return true;
    }

//
    /**
     * Returns the center of a connection point in renderer coords
     * @param is_input true if if a input slot, false if it is an output
     * @param slot (could be the number of the slot or the string with the name of the slot)
     * @returns {[x,y]} the position
     **/
    getConnectionPos(is_input: boolean, slot_number: number): [number, number] {
        if (this.flags.collapsed) {
            if (is_input)
                return [this.pos[0], this.pos[1] - Nodes.options.NODE_TITLE_HEIGHT * 0.5];
            else
                return [this.pos[0] + Nodes.options.NODE_COLLAPSED_WIDTH, this.pos[1] - Nodes.options.NODE_TITLE_HEIGHT * 0.5];
            //return [this.pos[0] + this.size[0] * 0.5, this.pos[1] + this.size[1] * 0.5];
        }

        if (is_input && slot_number == -1) {
            return [this.pos[0] + 10, this.pos[1] + 10];
        }

        if (is_input && this.inputs.length > slot_number && this.inputs[slot_number].pos)
            return [this.pos[0] + this.inputs[slot_number].pos[0], this.pos[1] + this.inputs[slot_number].pos[1]];
        else if (!is_input && this.outputs.length > slot_number && this.outputs[slot_number].pos)
            return [this.pos[0] + this.outputs[slot_number].pos[0], this.pos[1] + this.outputs[slot_number].pos[1]];

        if (!is_input) //output
            return [this.pos[0] + this.size[0] + 1, this.pos[1] + 10 + slot_number * Nodes.options.NODE_SLOT_HEIGHT];
        return [this.pos[0], this.pos[1] + 10 + slot_number * Nodes.options.NODE_SLOT_HEIGHT];
    }


    /**
     * Force align to grid
     */
    alignToGrid(): void {
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
    setDirtyCanvas(dirty_foreground: boolean, dirty_background?: boolean): void {
        if (!this.container)
            return;
        this.container.sendActionToRenderer("setDirty", [dirty_foreground, dirty_background]);
    }

    loadImage(url: string): HTMLImageElement {
        let img = new Image();
        img.src = Nodes.options.NODE_IMAGES_PATH + url;
        (<any>img).ready = false;

        let that = this;
        img.onload = function () {
            (<any>this).ready = true;
            that.setDirtyCanvas(true);
        }
        return img;
    }


    /**
     * safe Node action execution (not sure if safe)
     * @param action
     * @returns {boolean}
     */
    executeAction(action: string): boolean {
        if (action == "") return false;

        if (action.indexOf(";") != -1 || action.indexOf("}") != -1) {
            this.debugErr("Action contains unsafe characters");
            return false;
        }

        let tokens = action.split("(");
        let func_name = tokens[0];
        if (typeof(this[func_name]) != "function") {
            this.debugErr("Action not found on node: " + func_name);
            return false;
        }

        let code = action;

        try {
            //todo ES6
            // let _foo = eval;
            // eval = null;
            // (new Function("with(this) { " + code + "}")).call(this);
            // eval = _foo;
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
    captureInput(v: any): void {
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
    collapse(): void {
        if (!this.flags.collapsed)
            this.flags.collapsed = true;
        else
            this.flags.collapsed = false;
        this.setDirtyCanvas(true, true);
    }

    /**
     * Forces the node to do not move or realign on Z
     **/
    pin(v?: any): void {
        if (v === undefined)
            this.flags.pinned = !this.flags.pinned;
        else
            this.flags.pinned = v;
    }

    localToScreen(x, y, canvas): [number, number] {
        return [(x + this.pos[0]) * canvas.scale + canvas.offset[0],
            (y + this.pos[1]) * canvas.scale + canvas.offset[1]];
    }

    /**
     * Print debug message to console
     * @param message
     * @param module
     */
    debug(message: string): void {
        Utils.debug(message, "Node: " + this.type + "(id:" + this.id + ")");
    }

    /**
     * Print error message to console
     * @param message
     * @param module
     */
    debugErr(message: string, module?: string): void {
        Utils.debugErr(message, "Node: " + this.type + "(id:" + this.id + ")");
    }


    /**
     * is node running on back-side
     * @returns {boolean}
     */
    isBackside(): boolean {
        return (typeof (window) === 'undefined')
    }

    sendMessageToFrontSide(mess: any) {
        if (this.isBackside() && this.id != -1) {
            this.container.socket.emit('node-message-to-front-side',
                {id: this.id, cid: this.container.id, value: mess});
        }
    }

    sendMessageToBackSide(mess: any) {
        if (!this.isBackside() && this.id != -1) {
            this.container.socket.emit('node-message-to-back-side',
                {id: this.id, cid: this.container.id, value: mess});
        }
    }

    updateInputsLabels() {
        if (this.inputs) {
            for (let input of this.inputs) {
                input.label = input.name;
            }
            this.setDirtyCanvas(true, true);
        }
    }

    updateOutputsLabels() {
        if (this.outputs) {
            for (let output of this.outputs) {
                output.label = output.name;
            }
            this.setDirtyCanvas(true, true);
        }
    }
}


