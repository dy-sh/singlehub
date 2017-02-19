/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const node_1 = require("./node");
    //console logger back and front
    let log;
    if (typeof (window) === 'undefined')
        log = require('logplease').create('nodes', { color: 5 });
    else
        log = Logger.create('nodes', { color: 5 });
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
            this.CONTAINER_NODE_COLOR = "#777";
            this.CONTAINER_NODE_BGCOLOR = "#373737";
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
            this.BG_IMAGE = "/images/node-editor/grid.png";
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
    class Nodes {
        /**
         * Register a node class so it can be listed when the user wants to create a new one
         * @param type name of the node and path
         * @param node_class class containing the structure of a node
         */
        static registerNodeType(type, node_class) {
            if (!(node_class.prototype instanceof node_1.Node))
                throw (`Can't register node of type [${type}]. Class must inherit Node base class!`);
            node_class.type = type;
            node_class.category = type.substr(0, type.lastIndexOf("/"));
            node_class.node_name = type.substr(type.lastIndexOf("/") + 1, type.length);
            this.nodes_types[type] = node_class;
            log.debug("Node registered: " + type);
        }
        ;
        /**
         * Adds this method to all nodetypes, existing and to be created
         * (You can add it to Node.prototype but then existing node types wont have it)
         * @param name
         * @param func
         */
        static addNodeMethod(name, func) {
            node_1.Node.prototype[name] = func;
            for (let i in this.nodes_types)
                this.nodes_types[i].prototype[name] = func;
        }
        ;
        /**
         * Create a node of a given type with a name. The node is not attached to any engine yet.
         * @param type full name of the node class. p.e. "math/sin"
         * @param name a name to distinguish from other nodes
         * @param options to set options
         */
        static createNode(type, title, options) {
            let base_class = this.nodes_types[type];
            if (!base_class) {
                log.error("Can`t create node. Node type \"" + type + "\" not registered.");
                return null;
            }
            let prototype = base_class.prototype || base_class;
            title = title || base_class.title || type;
            let node = new base_class(title);
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
            return this.nodes_types[type];
        }
        ;
        /**
         * Returns a list of node types matching one category
         * @param category category name
         * @returns {Array} array with all the node classes
         */
        static getNodeTypesInCategory(category) {
            let r = [];
            for (let i in this.nodes_types)
                if (category == "") {
                    if (this.nodes_types[i].category == null)
                        r.push(this.nodes_types[i]);
                }
                else if (this.nodes_types[i].category == category)
                    r.push(this.nodes_types[i]);
            return r;
        }
        ;
        /**
         * Returns a list with all the node type categories
         * @returns {Array} array with all the names of the categories
         */
        static getNodeTypesCategories() {
            let categories = { "": 1 };
            for (let i in this.nodes_types)
                if (this.nodes_types[i].category && !this.nodes_types[i].skip_list)
                    categories[this.nodes_types[i].category] = 1;
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
        }
        ;
    }
    Nodes.options = new NodesOptions;
    Nodes.nodes_types = {};
    exports.Nodes = Nodes;
});
//# sourceMappingURL=nodes.js.map