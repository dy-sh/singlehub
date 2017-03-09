/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */


import {Node, SerializedNode} from "./node";
import {Renderer} from "../js/editor/renderer";
import {ContainerNode} from "./nodes/main"
import {Database} from "../interfaces/database";
import Utils from "./utils";
import Namespace = SocketIO.Namespace;
import {Emitter} from '../js/emitter/emitter'


//console logger back and front
let log;
declare let Logger: any; // tell the ts compiler global variable is defined
if (typeof (window) === 'undefined') //for backside only
    log = require('logplease').create('container', {color: 5});
else  //for frontside only
    log = Logger.create('container', {color: 5});


export interface SerializedContainer {
    id: number;
    last_node_id: number;
    config?: any;
    name: string;
    serialized_nodes?: Array<SerializedNode>;
}

export enum Side{
    server,
    editor,
    dashboard
}


export class Container extends Emitter {
    static nodes_types: {[type: string]: any} = {};
    static containers: {[id: number]: Container} = {};
    static last_container_id: number = -1;

    parent_container_id?: number;
    container_node: ContainerNode;

    clinet_socket: SocketIOClient.Socket;//SocketIOClient.Socket|SocketIO.Server;
    server_dashboard_socket: Namespace;
    server_editor_socket: Namespace;

    db: Database;

    _nodes: {[id: number]: Node} = {};

    id: number;
    name: string;
    side: Side;
    supported_types = ["number", "string", "boolean"];
    renderers: Array<Renderer>;
    isRunning: boolean;
    last_node_id: number;
    iteration: number;
    config: {
        links_ontop?: boolean;
    };

    globaltime: number;
    runningtime: number;
    fixedtime: number;
    fixedtime_lapse: number;
    elapsed_time: number;
    starttime: number;
    execution_timer_id: number|any;
    errors_in_execution: boolean;

    onStopEvent: Function;
    on_change: Function;
    onExecuteStep: Function;
    onAfterExecute: Function;
    onConnectionChange: Function;
    onPlayEvent: Function;
    frame: number;


    constructor(side: Side, id?: number) {
        super();


        if (typeof side != "number") throw "Container side is not defined";

        this.renderers = null;

        this.id = id || ++Container.last_container_id;

        if (this.id == 0)
            this.name = "Main";

        this.side = side;

        Container.containers[this.id] = this;
        this.clear();

        this.debug("Container created");

        let rootContainer = Container.containers[0];
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
    static registerNodeType(type: string, node_class: any): void {

        if (!(node_class.prototype instanceof Node))
            throw(`Can't register node of type [${type}]. Class must inherit Node base class!`);

        node_class.type = type;
        node_class.category = type.substr(0, type.lastIndexOf("/"));
        node_class.node_name = type.substr(type.lastIndexOf("/") + 1, type.length);

        this.nodes_types[type] = node_class;

        log.debug("Node registered: " + type);
    };


    /**
     * Returns a registered node type with a given name
     * @param type full name of the node class. p.e. "math/sin"
     * @returns {Node} the node class
     */
    static getNodeType(type: string): Node {
        return this.nodes_types[type];
    };


    /**
     * Returns a list of node types matching one category
     * @param category category name
     * @returns {Array} array with all the node classes
     */
    static getNodeTypesInCategory(category: string): Array<any> {
        let r = [];
        for (let i in this.nodes_types)
            if (category == "") {
                if (this.nodes_types[i].category == null)
                    r.push(this.nodes_types[i]);
            }
            else if (this.nodes_types[i].category == category)
                r.push(this.nodes_types[i]);

        return r;
    };

    /**
     * Returns a list with all the node type categories
     * @returns {Array} array with all the names of the categories
     */
    static getNodeTypesCategories(): Array<any> {
        let categories = {"": 1};
        for (let i in this.nodes_types)
            if (this.nodes_types[i].category)
                categories[this.nodes_types[i].category] = 1;
        let result = [];
        for (let i in categories)
            result.push(i);
        return result;
    };

//used to know which types of connections support this container (some containers do not allow certain types)
    getSupportedTypes(): Array<string> {
        return this.supported_types;
    }


    /**
     * Removes all nodes from this container
     */
    clear(): void {
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
    }

    /**
     * Stops the execution loop of the container
     */
    stop(): void {
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
            if (node['onStopContainer'])
                node['onStopContainer']();
        }
    }


    /**
     * Attach renderer to this container
     * @param renderer
     */
    attachRenderer(renderer: Renderer): void {
        if (renderer.container && renderer.container != this)
            renderer.container.detachRenderer(renderer);

        renderer.container = this;
        if (!this.renderers)
            this.renderers = [];
        this.renderers.push(renderer);
    }

    /**
     * Detach renderer from this container
     * @param renderer
     */
    detachRenderer(renderer: Renderer): void {
        if (!this.renderers)
            return;

        let pos = this.renderers.indexOf(renderer);
        if (pos == -1)
            return;

        renderer.container = null;

        this.renderers.splice(pos, 1);
        if (this.renderers.length == 0)
            delete this.renderers;
    }

    /**
     * Starts running this container every interval milliseconds.
     * @param interval amount of milliseconds between executions
     */
    run(interval: number = 1): void {
        if (this.isRunning)
            return;

        this.isRunning = true;

        if (this.onPlayEvent)
            this.onPlayEvent();

        for (let id in this._nodes) {
            let node = this._nodes[id];
            if (node['onRunContainer'])
                node['onRunContainer']();
        }


        //launch
        this.starttime = Utils.getTime();
        let that = this;

        this.execution_timer_id = setInterval(function () {
            //execute
            that.runStep(1);
        }, interval);
    }


    /**
     * Run N steps (cycles) of the container
     * @param steps number of steps to run, default is 1
     */
    runStep(steps: number = 1): void {
        let start = Utils.getTime();
        this.globaltime = 0.001 * (start - this.starttime);

        // try {
        for (let i = 0; i < steps; i++) {

            this.transferDataBetweenNodes();

            for (let id in this._nodes) {
                let node = this._nodes[id];
                if (node['onExecute'])
                    node['onExecute']();

                if (node.isUpdated) {
                    if (node['onInputUpdated'])
                        node['onInputUpdated']();

                    node.isUpdated = false;

                    for (let i in node.inputs)
                        if (node.inputs[i].updated)
                            node.inputs[i].updated = false;
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
        //     this.error("Error during execution: " + err, this);
        //     this.stop();
        //     throw err;
        // }

        let elapsed = Utils.getTime() - start;
        if (elapsed == 0) elapsed = 1;
        this.elapsed_time = 0.001 * elapsed;
        this.globaltime += 0.001 * elapsed;
        this.iteration += 1;
    }


    transferDataBetweenNodes() {
        //all nodes
        for (let id in this._nodes) {
            let node = this._nodes[id];
            if (!node.outputs)
                continue;

            //all outputs
            for (let o in node.outputs) {
                let output = node.outputs[o];
                if (!output.updated)
                    continue;

                output.updated = false;

                if (output.links == null)
                    continue;

                //all output links
                for (let link of output.links) {

                    let target_node = this._nodes[link.target_node_id];
                    if (!target_node) {
                        this.debugErr("Can't transfer data from node " + node.getReadableId() + ". Target node not found");
                        continue;
                    }

                    let target_input = target_node.inputs[link.target_slot];

                    target_input.data = Utils.formatValue(output.data, target_input.type);

                    target_node.isUpdated = true;
                    target_input.updated = true;

                }
            }
        }


    }


    /**
     * Returns the amount of time the container has been running in milliseconds
     * @method getTime
     * @returns number of milliseconds the container has been running
     */
    getTime(): number {
        return this.globaltime;
    }

    /**
     * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
     * @method getFixedTime
     * @returns number of milliseconds the container has been running
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


    /**
     * Sends action to renderer
     * @param action
     * @param params
     */
    sendActionToRenderer(action: string, params?: Array<any>): void {
        if (!this.renderers)
            return;

        for (let i = 0; i < this.renderers.length; ++i) {
            let c = this.renderers[i];
            if (c[action])
                c[action].apply(c, params);
        }
    }

    /**
     * Get nodes
     * @returns {number}
     */
    getNodes(includeSubcontainers = false): Array<Node> {
        let nodes = [];

        addNodes(this._nodes);

        function addNodes(_nodes) {
            for (let n in _nodes) {
                nodes.push(_nodes[n]);

                if (includeSubcontainers && _nodes[n].sub_container) {
                    addNodes(_nodes[n].sub_container._nodes)
                }
            }
        }

        return nodes;
    }

    /**
     * Get nodes count
     * @returns {number}
     */
    getNodesCount(): number {
        return Object.keys(this._nodes).length;
    }


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
    createNode(type: string, properties?: any, serialized_node?: SerializedNode): Node {
        //check class exist
        let node_class = Container.nodes_types[type];
        if (!node_class) {
            this.debugErr("Can't create node. Node class of type [" + type + "] not registered.");
            return null;
        }

        //get node id
        let id;
        let is_new = false;
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
            this.debugErr("Can't create node. Node id [" + id + "] already exist.");
            return null;
        }


        //create
        let node = new node_class(this, id);

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
            for (let i in properties)
                node[i] = properties[i];
        }

        if (!node.title) node.title = node.type;
        if ((!properties || !properties.properties)
            && (!serialized_node || !serialized_node.size))
            node.size = node.computeSize();

        //overwrite id
        node.id = id;


        if (is_new) {
            this.debug("New node created: " + node.getReadableId());

            if (node.onCreated)
                node.onCreated();

            //add to database
            if (this.db) {
                this.db.addNode(node);

                if (this.id == 0)
                    this.db.updateLastRootNodeId(this.last_node_id);
                else
                    this.db.updateNode(this.container_node.id, this.container_node.container.id, {$set: {"sub_container.last_node_id": this.container_node.sub_container.last_node_id}});
            }
        }

        if (node.onAdded)
            node.onAdded();

        this.setDirtyCanvas(true, true);

        return node;
    };


    /**
     * Removes a node from the container
     * @param node the instance of the node or node id
     */
    remove(node: Node|number): void {

        //if id provided, get node
        if (typeof node == "number") {
            node = this._nodes[node];
            if (!node)
                this.debugErr("Can't remove node. Node id [" + node + " not exist.");
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
            for (let i in node.inputs) {
                let input = node.inputs[i];
                if (input.link != null)
                    node.disconnectInput(+i);
            }

        //disconnect outputs
        if (node.outputs)
            for (let o in node.outputs) {
                let output = node.outputs[o];
                if (output.links != null && output.links.length > 0)
                    node.disconnectOutput(+o);
            }


        //remove from renderer
        if (this.renderers) {
            for (let i = 0; i < this.renderers.length; ++i) {
                let renderer = this.renderers[i];
                if (renderer.selected_nodes[node.id])
                    delete renderer.selected_nodes[node.id];
                if (renderer.node_dragged == node)
                    renderer.node_dragged = null;
            }
        }

        //remove from container
        delete this._nodes[node.id];

        this.debug("Node deleted: " + node.getReadableId());
        node.container = null;


        if (this.db)
            this.db.removeNode(node.id, this.id);

        this.setDirtyCanvas(true, true);

    }

    /**
     * Returns a node by its id.
     * @param id
     */
    getNodeById(id: number): Node {
        if (id == null) return null;
        return this._nodes[id];
    }


    /**
     * Returns a list of nodes that matches a type
     * @param type the name of the node type
     * @returns a list with all the nodes of this type
     */
    getNodesByType(type: string): Array<Node> {
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
     * Returns a list of nodes that matches a category
     * @param category the name of the node category
     * @returns a list with all the nodes of this type
     */
    getNodesByCategory(category: string): Array<Node> {
        category = category.toLowerCase();
        let r = [];

        for (let id in this._nodes) {
            let node = this._nodes[id];
            if (node.category.toLowerCase() == category)
                r.push(node);
        }

        return r;
    }

    /**
     * Returns a list of nodes that matches a name
     * @param name the name of the node to search
     * @returns a list with all the nodes with this name
     */
    getNodesByTitle(title: string): Array<Node> {
        let r = [];

        for (let id in this._nodes) {
            let node = this._nodes[id];
            if (node.title == title)
                r.push(node);
        }

        return r;
    }


    connectionChange(node: Node): void {
        if (this.onConnectionChange)
            this.onConnectionChange(node);
        this.sendActionToRenderer("onConnectionChange");
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
     * Creates a Object containing all the info about this container, it can be serialized
     * @returns value of the node
     */
    serialize(include_nodes = true, only_dashboard_nodes = false): SerializedContainer {

        let data: SerializedContainer = {
            id: this.id,
            last_node_id: this.last_node_id,
            name: this.name,
            config: this.config
        };

        if (include_nodes) {
            let ser_nodes: Array<SerializedNode> = [];

            for (let id in this._nodes) {
                let node = this._nodes[id];

                if (only_dashboard_nodes && !node.isDashboardNode)
                    continue;

                ser_nodes.push(node.serialize())
            }

            data.serialized_nodes = ser_nodes;
        }

        if (this.id == 0)
            (<any>data).last_container_id = Container.last_container_id;

        return data;
    }


    /**
     * Add nodes_list to container from a JSON string
     * @param data JSON string
     * @param keep_old
     */
    configure(data: SerializedContainer, keep_old = false): boolean {
        if (!keep_old)
            this.clear();

        //copy all fields to this container
        for (let i in data) {
            //skip nodes
            if (i == "serialized_nodes")
                continue;

            this[i] = data[i];
        }

        let error = false;

        if (data.serialized_nodes) {
            for (let n of data.serialized_nodes) {
                let node = this.createNode(n.type, null, n);
                if (!node) error = true;
            }
        }

        if ((<any>data).last_container_id)
            Container.last_container_id = (<any>data).last_container_id;


        this.setDirtyCanvas(true, true);
        return error;
    }


    getParentsStack(): Array<number> {
        let stack = [];

        if (this.parent_container_id) {
            let parentCont = Container.containers[this.parent_container_id];
            for (let i = 0; i < 1000; i++) {
                stack.push(parentCont.id);
                if (!parentCont.parent_container_id)
                    break;

                parentCont = Container.containers[parentCont.parent_container_id];
            }
        }

        stack.push(0);
        return stack;
    }

    moveNodesToNewContainer(ids: Array<number>, pos: [number, number]) {

        //prevent move input/output nodes
        let l = ids.length;
        while (l--) {
            let node = this.getNodeById(ids[l]);
            if (node.type == "main/input" || node.type == "main/output")
                ids.splice(l, 1);
        }

        if (ids.length == 0)
            return;

        //create new container
        let new_cont_node: ContainerNode = <any>this.createNode("main/container", {pos: pos});

        let new_cont = new_cont_node.sub_container;
        new_cont.last_node_id = this.last_node_id;
        if (this.db)
            this.db.updateNode(new_cont_node.id, this.id, {$set: {"sub_container.last_node_id": new_cont_node.sub_container.last_node_id}})


        // move nodes
        for (let id of ids) {
            let node = this.getNodeById(id);

            node.container = new_cont;
            delete this._nodes[node.id];
            new_cont._nodes[node.id] = node;

            if (this.db) {
                this.db.removeNode(node.id, this.id);
                this.db.addNode(node);
            }
        }


        //create container inputs
        for (let id of ids) {
            let node = new_cont.getNodeById(id);
            if (node.inputs) {
                for (let i in node.inputs) {
                    let input = node.inputs[i];
                    if (input.link) {
                        let old_target = this._nodes[input.link.target_node_id];
                        if (old_target) {

                            //create input node
                            let input_node = new_cont.createNode("main/input");
                            input_node.pos = Utils.cloneObject(old_target.pos);
                            input_node.outputs[0].links = [{target_node_id: node.id, target_slot: +i}];

                            //find input new pos (for prevent overlapping with the same input)
                            for (let n in new_cont._nodes) {
                                if (new_cont._nodes[n] != input_node) {
                                    if (input_node.pos[0] == new_cont._nodes[n].pos[0]
                                        && input_node.pos[1] == new_cont._nodes[n].pos[1])
                                        input_node.pos[1] += 15;
                                }
                            }

                            //connect new cont input to old target
                            new_cont_node.inputs[input_node.properties["slot"]].link =
                                {target_node_id: input.link.target_node_id, target_slot: input.link.target_slot}

                            let t_out_links = old_target.outputs[input.link.target_slot].links;
                            for (let out_link of t_out_links) {
                                if (out_link.target_node_id == node.id && out_link.target_slot == +i) {
                                    out_link.target_node_id = new_cont_node.id;
                                    out_link.target_slot = input_node.properties["slot"];
                                }
                            }

                            //reconnect node to new input node
                            input.link.target_node_id = input_node.id;
                            input.link.target_slot = 0;

                            if (this.db) {
                                let s_old_target = old_target.serialize(true);
                                let s_node = node.serialize(true);
                                let s_input_node = input_node.serialize(true);
                                this.db.updateNode(input_node.id, new_cont.id, {$set: {pos: s_input_node.pos}});
                                this.db.updateNode(input_node.id, new_cont.id, {$set: {outputs: s_input_node.outputs}});
                                this.db.updateNode(old_target.id, this.id, {$set: {outputs: s_old_target.outputs}});
                                this.db.updateNode(node.id, new_cont.id, {$set: {inputs: s_node.inputs}});
                            }
                        }
                    }
                }


            }
        }


        //create container outputs
        for (let id of ids) {
            let node = new_cont.getNodeById(id);
            if (node.outputs) {
                for (let o in node.outputs) {
                    let output = node.outputs[o];
                    if (output.links) {
                        for (let link of output.links) {
                            let old_target = this._nodes[link.target_node_id];
                            if (old_target) {

                                //create output node
                                let output_node = new_cont.createNode("main/output");
                                output_node.pos = Utils.cloneObject(old_target.pos);
                                output_node.inputs[0].link = {target_node_id: node.id, target_slot: +o};


                                //find input new pos (for prevent overlapping with the same input)
                                for (let n in new_cont._nodes) {
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
                                let in_link = old_target.inputs[link.target_slot].link;
                                in_link.target_node_id = new_cont_node.id;
                                in_link.target_slot = output_node.properties["slot"];


                                //reconnect node to new output node
                                link.target_node_id = output_node.id;
                                link.target_slot = 0;

                                if (this.db) {
                                    let s_old_target = old_target.serialize(true);
                                    let s_node = node.serialize(true);
                                    let s_output_node = output_node.serialize(true);
                                    this.db.updateNode(output_node.id, new_cont.id, {$set: {pos: s_output_node.pos}});
                                    this.db.updateNode(output_node.id, new_cont.id, {$set: {inputs: s_output_node.inputs}});
                                    this.db.updateNode(old_target.id, this.id, {$set: {inputs: s_old_target.inputs}});
                                    this.db.updateNode(node.id, new_cont.id, {$set: {outputs: s_node.outputs}});
                                }
                            }
                        }
                    }
                }

                if (this.db) {
                    let s_new_cont_node = new_cont_node.serialize(true);
                    this.db.updateNode(new_cont_node.id, this.id, {$set: {inputs: s_new_cont_node.inputs}});
                    this.db.updateNode(new_cont_node.id, this.id, {$set: {outputs: s_new_cont_node.outputs}});
                }
            }
        }
    }

    /**
     * Print debug message to console
     * @param message
     * @param module
     */
    debug(message: string): void {
        log.debug("[" + this.id + "] " + message);
    }

    /**
     * Print error message to console
     * @param message
     * @param module
     */
    debugWarn(message: string, module?: string): void {
        log.warn("[" + this.id + "] " + message);
    }

    /**
     * Print error message to console
     * @param message
     * @param module
     */
    debugErr(message: string, module?: string): void {
        log.error("[" + this.id + "] " + message);
    }
}


