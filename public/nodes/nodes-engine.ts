/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */


import {Nodes, Node, Link} from "./nodes";
import {Renderer} from "../js/editor/renderer";
import Timer = NodeJS.Timer;
import Utils from  "./utils"
import {Subgraph} from "./nodes/base"


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


export class NodesEngine {
    socket: SocketIOClient.Socket|SocketIO.Server;

    supported_types = ["number", "string", "boolean"];


    list_of_renderers: Array<Renderer>;
    isRunning: boolean;
    last_node_id: number;
    static last_container_id: number = 0;
    static containers: {[id: number]: NodesEngine} = {};
    _nodes: Array<Node> = [];
    _nodes_by_id = {};
    last_link_id: number;
    links: {[id: number]: Link} = {};
    iteration: number;
    config: {
        align_to_grid?: boolean;
        links_ontop?: boolean;
    };
    globaltime: number;
    runningtime: number;
    fixedtime: number;
    fixedtime_lapse: number;
    elapsed_time: number;
    starttime: number;
    global_inputs = {};
    global_outputs = {};
    execution_timer_id: Timer;
    _nodes_in_order: Array<Node>;
    errors_in_execution: boolean;

    M: any;

    onStopEvent: Function;
    on_change: Function;
    onNodeAdded: Function;
    onExecuteStep: Function;
    onAfterExecute: Function;
    onConnectionChange: Function;
    onNodeRemoved: Function;
    onPlayEvent: Function;
    frame: number;
    private MODULE_NAME = "NODES_ENGINE";
    container_id: number;
    parent_container_id?: number;


    _subgraph_node: Subgraph;
    _is_subgraph: boolean;
    onGlobalInputAdded: Function;
    onGlobalInputRenamed: Function;
    onGlobalInputTypeChanged: Function;
    onGlobalOutputAdded: Function;
    onGlobalOutputRenamed: Function;
    onGlobalOutputTypeChanged: Function;
    onGlobalsChange: Function;
    private onGlobalInputRemoved: Function;
    private onGlobalOutputRemoved: Function;


    constructor() {
        Utils.debug("Engine created", this.MODULE_NAME);
        //todo
        // this.debug = config.engine.debugEngine;
        // if (this.debug)
        //     debug("Nodes engine created");

        this.list_of_renderers = null;
        this.container_id = NodesEngine.last_container_id++;
        NodesEngine.containers[this.container_id] = this;
        this.clear();
    }


//used to know which types of connections support this engine (some graphs do not allow certain types)
    getSupportedTypes(): Array<string> {
        return this.supported_types;
    }


    /**
     * Removes all nodes from this engine
     */
    clear(): void {
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
    stop(): void {
        if (!this.isRunning)
            return;

        this.isRunning = true;

        if (this.onStopEvent)
            this.onStopEvent();

        if (this.execution_timer_id != null)
            clearInterval(this.execution_timer_id);
        this.execution_timer_id = null;

        this.sendEventToAllNodes("onStop");
    }


    /**
     * Attach Renderer to this engine
     * @param renderer
     */
    attachRenderer(renderer: Renderer): void {
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
    detachRenderer(renderer: Renderer): void {
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
    start(interval: number = 1): void {
        if (this.isRunning)
            return;

        this.isRunning = true;

        if (this.onPlayEvent)
            this.onPlayEvent();

        this.sendEventToAllNodes("onStart");

        //launch
        this.starttime = Nodes.getTime();
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
    runStep(num: number = 1): void {

        let start = Nodes.getTime();
        this.globaltime = 0.001 * (start - this.starttime);

        try {
            for (let i = 0; i < num; i++) {
                this.sendEventToAllNodes("onExecute");
                this.fixedtime += this.fixedtime_lapse;
                if (this.onExecuteStep)
                    this.onExecuteStep();
            }

            if (this.onAfterExecute)
                this.onAfterExecute();
            this.errors_in_execution = false;
        }
        catch (err) {
            this.errors_in_execution = true;
            if (Nodes.throw_errors)
                throw err;
            Utils.debugErr("Error during execution: " + err, this.MODULE_NAME);
            this.stop();
        }

        let elapsed = Nodes.getTime() - start;
        if (elapsed == 0) elapsed = 1;
        this.elapsed_time = 0.001 * elapsed;
        this.globaltime += 0.001 * elapsed;
        this.iteration += 1;
    }

    /**
     * Updates the engine execution order according to relevance of the nodes (nodes with only outputs have more relevance than
     * nodes with only inputs.
     * @method updateExecutionOrder
     */
    updateExecutionOrder(): void {
        this._nodes_in_order = this.computeExecutionOrder();
    }

//This is more internal, it computes the order and returns it
    computeExecutionOrder(): Array<Node> {
        let L: Array<Node> = [];
        let S = [];
        let M = {};
        let visited_links = {}; //to avoid repeating links
        let remaining_links = {}; //to a

        //search for the nodes without inputs (starting nodes)
        for (let i = 0, l = this._nodes.length; i < l; ++i) {
            let n = this._nodes[i];
            M[n.id] = n; //add to pending nodes

            let num = 0; //num of input connections
            if (n.inputs)
                for (let j = 0, l2 = n.inputs.length; j < l2; j++)
                    if (n.inputs[j] && n.inputs[j].link != null)
                        num += 1;

            if (num == 0) //is a starting node
                S.push(n);
            else //num of input links
                remaining_links[n.id] = num;
        }

        while (true) {
            if (S.length == 0)
                break;

            //get an starting node
            let n = S.shift();
            L.push(n); //add to ordered list
            delete M[n.id]; //remove from the pending nodes

            //for every output
            if (n.outputs)
                for (let i = 0; i < n.outputs.length; i++) {
                    let output = n.outputs[i];
                    //not connected
                    if (output == null || output.links == null || output.links.length == 0)
                        continue;

                    //for every connection
                    for (let j = 0; j < output.links.length; j++) {
                        let link_id = output.links[j];
                        let link = this.links[link_id];
                        if (!link) continue;

                        //already visited link (ignore it)
                        if (visited_links[link.id])
                            continue;

                        let target_node = this.getNodeById(link.target_id);
                        if (target_node == null) {
                            visited_links[link.id] = true;
                            continue;
                        }

                        visited_links[link.id] = true; //mark as visited
                        remaining_links[target_node.id] -= 1; //reduce the number of links remaining
                        if (remaining_links[target_node.id] == 0)
                            S.push(target_node); //if no more links, then add to Starters array
                    }
                }
        }

        //the remaining ones (loops)
        for (let i in M)
            L.push(M[i]);

        if (L.length != this._nodes.length)
            Utils.debug("Something went wrong, nodes missing", this.MODULE_NAME);

        //save order number in the node
        for (let i in L)
            L[i].order = i;

        return L;
    }

    /**
     * Returns the amount of time the engine has been running in milliseconds
     * @method getTime
     * @returns number of milliseconds the engine has been running
     */
    getTime(): number {
        return this.globaltime;
    }

    /**
     * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
     * @method getFixedTime
     * @returns number of milliseconds the engine has been running
     */
    getFixedTime(): number {
        return this.fixedtime;
    }

    /**
     * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
     * if the nodes are using graphical actions
     * @method getElapsedTime
     * @returns number of milliseconds it took the last cycle
     */
    getElapsedTime(): number {
        return this.elapsed_time;
    }

//
    /**
     * Sends an event to all the nodes, useful to trigger stuff
     * @param eventname the name of the event (function to be called)
     * @param params parameters in array format
     */
    sendEventToAllNodes(eventname: string, params?: Array<any>): void {
        let nodes = this._nodes_in_order ? this._nodes_in_order : this._nodes;
        if (!nodes)
            return;

        for (let i = 0; i < nodes.length; ++i) {
            let node = nodes[i];
            if (node[eventname]) {
                if (params === undefined)
                    node[eventname]();
                else if (params && params.constructor === Array)
                    node[eventname].apply(this.M[i], params);
                else
                    node[eventname](params);
            }
        }
    }

    /**
     * Sends action to renderer
     * @param action
     * @param params
     */
    sendActionToRenderer(action: string, params?: Array<any>): void {
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
     * @param node skip_compute_order
     */
    add(node: Node, skip_compute_order?: boolean): Node {
        if (!node || (node.id != -1 && this._nodes_by_id[node.id] != null))
            return; //already added

        if (this._nodes.length >= Nodes.options.MAX_NUMBER_OF_NODES)
            throw("Nodes: max number of nodes in a engine reached");

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

        if (!skip_compute_order)
            this.updateExecutionOrder();

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
    remove(node: Node): void {
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

        this.updateExecutionOrder();
    }

    /**
     * Returns a node by its id.
     * @param id
     */
    getNodeById(id: string|number): Node {
        if (id == null) return null;
        return this._nodes_by_id[id];
    }


    /**
     * Returns a list of nodes that matches a class
     * @param classObject the class itself (not an string)
     * @returns a list with all the nodes of this type
     */


    findNodesByClass(classObject: any): Array<Node> {
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
    findNodesByType(type: string): Array<Node> {
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
    findNodesByTitle(title: string): Array<Node> {
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
    getNodeOnPos(x: number, y: number, nodes_list?: Array<Node>): Node {
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
        this.global_inputs[name] = {name: name, type: type, value: value};

        if (this.onGlobalInputAdded)
            this.onGlobalInputAdded(name, type);

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

        if (this.onGlobalInputRenamed)
            this.onGlobalInputRenamed(old_name, name);

        if (this.onGlobalsChange)
            this.onGlobalsChange();
    }

    changeGlobalInputType(name, type) {
        if (!this.global_inputs[name])
            return false;

        if (this.global_inputs[name].type.toLowerCase() == type.toLowerCase())
            return;

        this.global_inputs[name].type = type;
        if (this.onGlobalInputTypeChanged)
            this.onGlobalInputTypeChanged(name, type);
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
        this.global_outputs[name] = {name: name, type: type, value: value};

        if (this.onGlobalOutputAdded)
            this.onGlobalOutputAdded(name, type);

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

        if (this.onGlobalOutputRenamed)
            this.onGlobalOutputRenamed(old_name, name);

        if (this.onGlobalsChange)
            this.onGlobalsChange();
    }

    changeGlobalOutputType(name, type) {
        if (!this.global_outputs[name])
            return false;

        if (this.global_outputs[name].type.toLowerCase() == type.toLowerCase())
            return;

        this.global_outputs[name].type = type;
        if (this.onGlobalOutputTypeChanged)
            this.onGlobalOutputTypeChanged(name, type);
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
// //This feature is not finished yet, is to create graphs where nodes are not executed unless a trigger message is received
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
    connectionChange(node: Node): void {
        this.updateExecutionOrder();
        if (this.onConnectionChange)
            this.onConnectionChange(node);
        this.sendActionToRenderer("onConnectionChange");
    }


    /**
     * returns if the engine is in live mode
     * @method isLive
     */
    isLive(): boolean {
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
    change(): void {
        this.sendActionToRenderer("setDirty", [true, true]);

        if (this.on_change)
            this.on_change(this);
    }


    /**
     * Set canvas to dirty for update
     * @param foreground
     * @param backgroud
     */
    setDirtyCanvas(foreground?: boolean, backgroud?: boolean): void {
        this.sendActionToRenderer("setDirty", [foreground, backgroud]);
    }


    /**
     * Creates a Object containing all the info about this engine, it can be serialized
     * @returns value of the node
     */
    serialize(): any {
        let nodes_info = [];
        for (let i = 0, l = this._nodes.length; i < l; ++i)
            nodes_info.push(this._nodes[i].serialize());

        //remove data from links, we dont want to store it
        for (let i in this.links) //links is an OBJECT
            this.links[i].data = null;


        let data = {
            //		engine: this.engine,

            iteration: this.iteration,
            frame: this.frame,
            last_node_id: this.last_node_id,
            last_link_id: this.last_link_id,
            last_container_id: NodesEngine.last_container_id,
            links: Utils.cloneObject(this.links),

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
    configure(data: any, keep_old = false): boolean {
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
            let node = Nodes.createNode(n_info.type, n_info.title);
            if (!node) {
                Utils.debugErr("Node not found: " + n_info.type, this.MODULE_NAME);
                error = true;
                continue;
            }

            node.id = n_info.id; //id it or it will create a new id
            this.add(node, true); //add before configure, otherwise configure cannot create links
            node.configure(n_info);
        }

        this.updateExecutionOrder();
        this.setDirtyCanvas(true, true);
        return error;
    }


}


export let engine = new NodesEngine();

