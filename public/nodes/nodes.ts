/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import {Node} from "./node";


//console logger back and front
let log;
declare let Logger: any; // tell the ts compiler global variable is defined
if (typeof (window) === 'undefined') //for backside only
    log = require('logplease').create('nodes', {color: 5});
else  //for frontside only
    log = Logger.create('nodes', {color: 5});


// interface Boundings{
//     [4]: Float32Array;
// }
//
// interface Position{
//     [2]: Float32Array;
// }
//
// interface Size{
//     [2]: Float32Array;
// }

export class NodesOptions {

    MAX_NUMBER_OF_NODES = 1000; //avoid infinite loops
    START_POS = 50;
    FREE_SPACE_UNDER = 30;

    NODE_TITLE_HEIGHT = 16;
    NODE_SLOT_HEIGHT = 15;
    NODE_WIDTH = 150;
    NODE_MIN_WIDTH = 50;
    NODE_COLLAPSED_RADIUS = 10;
    NODE_COLLAPSED_WIDTH = 150;
    CANVAS_GRID_SIZE = 10;
    NODE_TITLE_COLOR = "#222";
    NODE_DEFAULT_COLOR = "#777";
    NODE_DEFAULT_BGCOLOR = "#373737";
    CONTAINER_NODE_COLOR = "#777";
    CONTAINER_NODE_BGCOLOR = "#373737";
    IO_NODE_COLOR = "#777";
    IO_NODE_BGCOLOR = "#373737";
    NODE_DEFAULT_IO_COLOR = "#999";
    NODE_OPTIONAL_IO_COLOR = "#777";
    NODE_DEFAULT_BOXCOLOR = "#373737";
    NODE_ACTIVE_BOXCOLOR = "#AEF";
    NODE_DEFAULT_SHAPE = "box";
    TITLE_TEXT_FONT = "bold 13px Arial";
    INNER_TEXT_FONT = "normal 12px Arial";
    SHADOWS_WIDTH = 2;
    MENU_TEXT_COLOR = "#BBD";
    MENU_BG_COLOR = "#353535";
    BG_IMAGE = "/images/node-editor/grid.png";
    NODE_IMAGES_PATH = "";

    RENDER_CONNECTION_ARROWS = true;
    CONNECTIONS_WIDTH = 4;
    CONNECTIONS_SHADOW = 4;

    SELECTION_COLOR = "#FFF";
    SELECTION_WIDTH = 2;
    DATATYPE_COLOR = {
        0: "#AAA",
        1: "#AAA",
        2: "#AAA"
    };
    NEW_LINK_COLOR = "#CCC";
    LINK_TYPE_COLORS = {0: "#AAC", 1: "#AAC", 2: "#AAC"};

    LINK_COLORS = ["#AAC", "#ACA", "#CAA"];

    NODE_COLORS = {
        "red": {color: "#FAA", bgcolor: "#A44"},
        "green": {color: "#AFA", bgcolor: "#4A4"},
        "blue": {color: "#AAF", bgcolor: "#44A"},
        "white": {color: "#FFF", bgcolor: "#AAA"}
    };
}

export class Nodes {
    static options = new NodesOptions;
    static nodes_types: {[type: string]: any} = {};


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
     * Adds this method to all nodetypes, existing and to be created
     * (You can add it to Node.prototype but then existing node types wont have it)
     * @param name
     * @param func
     */
    static addNodeMethod(name: string, func: Function): void {
        Node.prototype[name] = func;
        for (let i in this.nodes_types)
            this.nodes_types[i].prototype[name] = func;
    };

    /**
     * Create a node of a given type with a name. The node is not attached to any engine yet.
     * @param type full name of the node class. p.e. "math/sin"
     * @param name a name to distinguish from other nodes
     * @param options to set options
     */
    static createNode(type: string, title?: string, options?: any): Node {
        let base_class = this.nodes_types[type];
        if (!base_class) {
            log.error("Can`t create node. Node type \"" + type + "\" not registered.");
            return null;
        }

        let prototype = base_class.prototype || base_class;

        title = title || base_class.title || type;

        let node = new base_class(title);


        node.type = type;
        node.category = base_class.category;
        if (!node.title) node.title = title;
        if (!node.properties) node.properties = {};
        if (!node.flags) node.flags = {};
        //  if (!node.size) node.size = [this.NODE_WIDTH, 60];
        if (!node.size) node.size = node.computeSize();

        //extra options
        if (options) {
            for (let i in options)
                node[i] = options[i];
        }

        //    node.id = this.guid();

        return node;
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
            if (this.nodes_types[i].category && !this.nodes_types[i].skip_list)
                categories[this.nodes_types[i].category] = 1;
        let result = [];
        for (let i in categories)
            result.push(i);
        return result;
    };


    /**
     * debug purposes: reloads all the js scripts that matches a wilcard
     * @param folder_wildcard
     */
    static reloadNodes(folder_wildcard): void {
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
                log.debug("Reloading: " + src);
                let dynamicScript = document.createElement("script");
                dynamicScript.type = "text/javascript";
                dynamicScript.src = src;
                docHeadObj.appendChild(dynamicScript);
                docHeadObj.removeChild(script_files[i]);
            }
            catch (err) {
                log.error("Error while reloading " + src);
                throw err;
            }
        }

        log.debug("Nodes reloaded");
    };


}
