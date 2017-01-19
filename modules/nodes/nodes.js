/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */


var debug = require('debug')('nodes-engine:     ');
var debugLog = require('debug')('nodes-engine:log  ');
var debugMes = require('debug')('modes-engine:mes  ');
var debugErr = require('debug')('nodes-engine:error');

var nodeDebug = require('debug')('nodes:     ');
var nodeDebugErr = require('debug')('nodes:error');

var config = require('../../config');
// *************************************************************
//   Nodes CLASS                                     *******
// *************************************************************

/**
 * The Global Scope. It contains all the registered node classes.
 *
 * @class Nodes
 * @constructor
 */

var Nodes = {

	NODE_TITLE_HEIGHT: 16,
	NODE_SLOT_HEIGHT: 15,
	NODE_WIDTH: 140,
	NODE_MIN_WIDTH: 50,
	NODE_COLLAPSED_RADIUS: 10,
	NODE_COLLAPSED_WIDTH: 80,
	CANVAS_GRID_SIZE: 10,
	NODE_TITLE_COLOR: "#222",
	NODE_DEFAULT_COLOR: "#999",
	NODE_DEFAULT_BGCOLOR: "#444",
	NODE_DEFAULT_BOXCOLOR: "#AEF",
	NODE_DEFAULT_SHAPE: "box",
	MAX_NUMBER_OF_NODES: 1000, //avoid infinite loops
	DEFAULT_POSITION: [100, 100],//default node position
	node_images_path: "",

	proxy: null, //used to redirect calls

	debug: config.nodesEngine.debugEngine,
	throw_errors: true,
	registered_node_types: {}, //nodetypes by string
	Nodes: {}, //node types by classname

	/**
	 * Register a node class so it can be listed when the user wants to create a new one
	 * @method registerNodeType
	 * @param {String} type name of the node and path
	 * @param {Class} base_class class containing the structure of a node
	 */

	registerNodeType: function (type, base_class) {
		if (!base_class.prototype)
			throw("Cannot register a simple object, it must be a class with a prototype");
		base_class.type = type;

		if (Nodes.debug)
			debug("Node registered: " + type);

		var categories = type.split("/");

		var pos = type.lastIndexOf("/");
		base_class.category = type.substr(0, pos);
		//info.name = name.substr(pos+1,name.length - pos);

		//extend class
		if (base_class.prototype) //is a class
			for (var i in Node.prototype)
				if (!base_class.prototype[i])
					base_class.prototype[i] = Node.prototype[i];

		this.registered_node_types[type] = base_class;
		if (base_class.constructor.name)
			this.Nodes[base_class.constructor.name] = base_class;
	},

	/**
	 * Adds this method to all nodetypes, existing and to be created
	 * (You can add it to LGraphNode.prototype but then existing node types wont have it)
	 * @method addNodeMethod
	 * @param {Function} func
	 */
	addNodeMethod: function (name, func) {
		Node.prototype[name] = func;
		for (var i in this.registered_node_types)
			this.registered_node_types[i].prototype[name] = func;
	},

	/**
	 * Create a node of a given type with a name. The node is not attached to any graph yet.
	 * @method createNode
	 * @param {String} type full name of the node class. p.e. "math/sin"
	 * @param {String} name a name to distinguish from other nodes
	 * @param {Object} options to set options
	 */

	createNode: function (type, title, options) {
		var base_class = this.registered_node_types[type];
		if (!base_class) {
			debugLog("Can`t create node. Node type \"" + type + "\" not registered.");
			return null;
		}

		var prototype = base_class.prototype || base_class;

		title = title || base_class.title || type;

		var node = new base_class(title);

		node.type = type;
		if (!node.title) node.title = title;
		if (!node.properties) node.properties = {};
		if (!node.flags) node.flags = {};
		if (!node.size) node.size = node.computeSize();
		if (!node.pos) node.pos = Nodes.DEFAULT_POSITION.concat();

		//extra options
		if (options) {
			for (var i in options)
				node[i] = options[i];
		}

		return node;
	},

	/**
	 * Returns a registered node type with a given name
	 * @method getNodeType
	 * @param {String} type full name of the node class. p.e. "math/sin"
	 * @return {Class} the node class
	 */

	getNodeType: function (type) {
		return this.registered_node_types[type];
	},


	/**
	 * Returns a list of node types matching one category
	 * @method getNodeType
	 * @param {String} category category name
	 * @return {Array} array with all the node classes
	 */

	getNodeTypesInCategory: function (category) {
		var r = [];
		for (var i in this.registered_node_types)
			if (category == "") {
				if (this.registered_node_types[i].category == null)
					r.push(this.registered_node_types[i]);
			}
			else if (this.registered_node_types[i].category == category)
				r.push(this.registered_node_types[i]);

		return r;
	},

	/**
	 * Returns a list with all the node type categories
	 * @method getNodeTypesCategories
	 * @return {Array} array with all the names of the categories
	 */

	getNodeTypesCategories: function () {
		var categories = {"": 1};
		for (var i in this.registered_node_types)
			if (this.registered_node_types[i].category && !this.registered_node_types[i].skip_list)
				categories[this.registered_node_types[i].category] = 1;
		var result = [];
		for (var i in categories)
			result.push(i);
		return result;
	},

	//debug purposes: reloads all the js scripts that matches a wilcard
	reloadNodes: function (folder_wildcard) {
		var tmp = document.getElementsByTagName("script");
		//weird, this array changes by its own, so we use a copy
		var script_files = [];
		for (var i in tmp)
			script_files.push(tmp[i]);


		var docHeadObj = document.getElementsByTagName("head")[0];
		folder_wildcard = document.location.href + folder_wildcard;

		for (var i in script_files) {
			var src = script_files[i].src;
			if (!src || src.substr(0, folder_wildcard.length) != folder_wildcard)
				continue;

			try {
				if (Nodes.debug)
					debug("Reloading: " + src);
				var dynamicScript = document.createElement("script");
				dynamicScript.type = "text/javascript";
				dynamicScript.src = src;
				docHeadObj.appendChild(dynamicScript);
				docHeadObj.removeChild(script_files[i]);
			}
			catch (err) {
				if (Nodes.throw_errors)
					throw err;
				debugErr("Error while reloading " + src);
			}
		}

		if (Nodes.debug)
			debug("Nodes reloaded");
	},

	//separated just to improve if it doesnt work
	cloneObject: function (obj, target) {
		if (obj == null) return null;
		var r = JSON.parse(JSON.stringify(obj));
		if (!target) return r;

		for (var i in r)
			target[i] = r[i];
		return target;
	},

	getTime: function () {
		return (typeof(performance) != "undefined") ? performance.now() : Date.now();
	}
};


// *************************************************************
//   Node CLASS                                          *******
// *************************************************************

/*
 title: string
 pos: [x,y]
 size: [x,y]

 input|output: every connection
 +  { name:string, type:string, pos: [x,y]=Optional, direction: "input"|"output", links: Array });

 flags:
 + skip_title_render
 + clip_area
 + unsafe_execution: not allowed for safe execution

 supported callbacks:
 + onAdded: when added to graph
 + onRemoved: when removed from graph
 + onStart:	when starts playing
 + onStop:	when stops playing
 + onDrawForeground: render the inside widgets inside the node
 + onDrawBackground: render the background area inside the node (only in edit mode)
 + onMouseDown
 + onMouseMove
 + onMouseUp
 + onMouseEnter
 + onMouseLeave
 + onExecute: execute the node
 + onPropertyChange: when a property is changed in the panel (return true to skip default behaviour)
 + onGetInputs: returns an array of possible inputs
 + onGetOutputs: returns an array of possible outputs
 + onDblClick
 + onSerialize
 + onSelected
 + onDeselected
 + onDropItem : DOM item dropped over the node
 + onDropFile : file dropped over the node
 + onConnectInput : if returns false the incoming connection will be canceled
 */


/**
 * Base Class for all the node type classes
 * @class Node
 * @param {String} name a name for the node
 */

function Node(title) {
	this._ctor(title);
}

Node.prototype._ctor = function (title) {
	this.title = title || "Unnamed";
	this.size = [Nodes.NODE_WIDTH, 60];
	this.graph = null;

	this._pos = new Float32Array(10, 10);

	Object.defineProperty(this, "pos", {
		set: function (v) {
			if (!v || !v.length < 2)
				return;
			this._pos[0] = v[0];
			this._pos[1] = v[1];
		},
		get: function () {
			return this._pos;
		},
		enumerable: true
	});

	this.id = -1; //not know till not added
	this.type = null;

	//inputs available: array of inputs
	this.inputs = [];
	this.outputs = [];
	this.connections = [];

	//local data
	this.properties = {};
	this.data = null; //persistent local data
	this.flags = {
		//skip_title_render: true,
		//unsafe_execution: false,
	};
}

/**
 * configure a node from an object containing the serialized info
 * @method configure
 */
Node.prototype.configure = function (info) {
	for (var j in info) {
		if (j == "console") continue;

		if (j == "properties") {
			//i dont want to clone properties, I want to reuse the old container
			for (var k in info.properties)
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
				this[j] = Nodes.cloneObject(info[j], this[j]);
		}
		else //value
			this[j] = info[j];
	}

	//FOR LEGACY, PLEASE REMOVE ON NEXT VERSION
	for (var i in this.inputs) {
		var input = this.inputs[i];
		if (!input.link || !input.link.length)
			continue;
		var link = input.link;
		if (typeof(link) != "object")
			continue;
		input.link = link[0];
		this.graph.links[link[0]] = {
			id: link[0],
			origin_id: link[1],
			origin_slot: link[2],
			target_id: link[3],
			target_slot: link[4]
		};
	}
	for (var i in this.outputs) {
		var output = this.outputs[i];
		if (!output.links || output.links.length == 0)
			continue;
		for (var j in output.links) {
			var link = output.links[j];
			if (typeof(link) != "object")
				continue;
			output.links[j] = link[0];
		}
	}

}

/**
 * serialize the content
 * @method serialize
 */

Node.prototype.serialize = function () {
	var o = {
		id: this.id,
		title: this.title,
		type: this.type,
		pos: this.pos,
		size: this.size,
		data: this.data,
		flags: Nodes.cloneObject(this.flags),
		inputs: this.inputs,
		outputs: this.outputs
	};

	if (this.properties)
		o.properties = Nodes.cloneObject(this.properties);

	if (!o.type)
		o.type = this.constructor.type;

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


/* Creates a clone of this node */
Node.prototype.clone = function () {
	var node = Nodes.createNode(this.type);

	var data = this.serialize();
	delete data["id"];
	node.configure(data);

	return node;
}


/**
 * serialize and stringify
 * @method toString
 */

Node.prototype.toString = function () {
	return JSON.stringify(this.serialize());
}
//Node.prototype.unserialize = function(info) {} //this cannot be done from within, must be done in Nodes


/**
 * get the title string
 * @method getTitle
 */

Node.prototype.getTitle = function () {
	return this.title || this.constructor.title;
}


// Execution *************************
/**
 * sets the output data
 * @method setOutputData
 * @param {number} slot
 * @param {*} data
 */
Node.prototype.setOutputData = function (slot, data) {
	if (!this.outputs)
		return;

	if (slot > -1 && slot < this.outputs.length && this.outputs[slot] && this.outputs[slot].links != null) {
		for (var i = 0; i < this.outputs[slot].links.length; i++) {
			var link_id = this.outputs[slot].links[i];
			this.graph.links[link_id].data = data;
		}
	}
}

/**
 * retrieves the input data (data traveling through the connection) from one slot
 * @method getInputData
 * @param {number} slot
 * @return {*} data or if it is not connected returns undefined
 */
Node.prototype.getInputData = function (slot) {
	if (!this.inputs)
		return; //undefined;
	if (slot < this.inputs.length && this.inputs[slot].link != null)
		return this.graph.links[this.inputs[slot].link].data;
	return; //undefined;
}

/**
 * tells you if there is a connection in one input slot
 * @method isInputConnected
 * @param {number} slot
 * @return {boolean}
 */
Node.prototype.isInputConnected = function (slot) {
	if (!this.inputs)
		return false;
	return (slot < this.inputs.length && this.inputs[slot].link != null);
}

/**
 * tells you info about an input connection (which node, type, etc)
 * @method getInputInfo
 * @param {number} slot
 * @return {Object} object or null
 */
Node.prototype.getInputInfo = function (slot) {
	if (!this.inputs)
		return null;
	if (slot < this.inputs.length)
		return this.inputs[slot];
	return null;
}


/**
 * tells you info about an output connection (which node, type, etc)
 * @method getOutputInfo
 * @param {number} slot
 * @return {Object}  object or null
 */
Node.prototype.getOutputInfo = function (slot) {
	if (!this.outputs)
		return null;
	if (slot < this.outputs.length)
		return this.outputs[slot];
	return null;
}


/**
 * tells you if there is a connection in one output slot
 * @method isOutputConnected
 * @param {number} slot
 * @return {boolean}
 */
Node.prototype.isOutputConnected = function (slot) {
	if (!this.outputs)
		return null;
	return (slot < this.outputs.length && this.outputs[slot].links && this.outputs[slot].links.length);
}

/**
 * retrieves all the nodes connected to this output slot
 * @method getOutputNodes
 * @param {number} slot
 * @return {array}
 */
Node.prototype.getOutputNodes = function (slot) {
	if (!this.outputs || this.outputs.length == 0) return null;
	if (slot < this.outputs.length) {
		var output = this.outputs[slot];
		var r = [];
		for (var i = 0; i < output.length; i++)
			r.push(this.graph.getNodeById(output.links[i].target_id));
		return r;
	}
	return null;
}

Node.prototype.triggerOutput = function (slot, param) {
	var n = this.getOutputNode(slot);
	if (n && n.onTrigger)
		n.onTrigger(param);
}

//connections

/**
 * add a new output slot to use in this node
 * @method addOutput
 * @param {string} name
 * @param {string} type string defining the output type ("vec3","number",...)
 * @param {Object} extra_info this can be used to have special properties of an output (label, special color, position, etc)
 */
Node.prototype.addOutput = function (name, type, extra_info) {
	var o = {name: name, type: type, links: null};
	if (extra_info)
		for (var i in extra_info)
			o[i] = extra_info[i];

	if (!this.outputs) this.outputs = [];
	this.outputs.push(o);
	if (this.onOutputAdded)
		this.onOutputAdded(o);
	this.size = this.computeSize();
}

/**
 * add a new output slot to use in this node
 * @method addOutputs
 * @param {Array} array of triplets like [[name,type,extra_info],[...]]
 */
Node.prototype.addOutputs = function (array) {
	for (var i = 0; i < array.length; ++i) {
		var info = array[i];
		var o = {name: info[0], type: info[1], link: null};
		if (array[2])
			for (var j in info[2])
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
 * remove an existing output slot
 * @method removeOutput
 * @param {number} slot
 */
Node.prototype.removeOutput = function (slot) {
	this.disconnectOutput(slot);
	this.outputs.splice(slot, 1);
	this.size = this.computeSize();
	if (this.onOutputRemoved)
		this.onOutputRemoved(slot);
}

/**
 * add a new input slot to use in this node
 * @method addInput
 * @param {string} name
 * @param {string} type string defining the input type ("vec3","number",...), it its a generic one use 0
 * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
 */
Node.prototype.addInput = function (name, type, extra_info) {
	type = type || 0;
	var o = {name: name, type: type, link: null};
	if (extra_info)
		for (var i in extra_info)
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
 * @method addInputs
 * @param {Array} array of triplets like [[name,type,extra_info],[...]]
 */
Node.prototype.addInputs = function (array) {
	for (var i = 0; i < array.length; ++i) {
		var info = array[i];
		var o = {name: info[0], type: info[1], link: null};
		if (array[2])
			for (var j in info[2])
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
 * remove an existing input slot
 * @method removeInput
 * @param {number} slot
 */
Node.prototype.removeInput = function (slot) {
	this.disconnectInput(slot);
	this.inputs.splice(slot, 1);
	this.size = this.computeSize();
	if (this.onInputRemoved)
		this.onInputRemoved(slot);
}

/**
 * add an special connection to this node (used for special kinds of graphs)
 * @method addConnection
 * @param {string} name
 * @param {string} type string defining the input type ("vec3","number",...)
 * @param {[x,y]} pos position of the connection inside the node
 * @param {string} direction if is input or output
 */
Node.prototype.addConnection = function (name, type, pos, direction) {
	this.connections.push({name: name, type: type, pos: pos, direction: direction, links: null});
}

/**
 * computes the size of a node according to its inputs and output slots
 * @method computeSize
 * @param {number} minHeight
 * @return {number} the total size
 */
Node.prototype.computeSize = function (minHeight) {
	var rows = Math.max(this.inputs ? this.inputs.length : 1, this.outputs ? this.outputs.length : 1);
	var size = new Float32Array([0, 0]);
	rows = Math.max(rows, 1);
	size[1] = rows * 14 + 6;

	var font_size = 14;
	var title_width = compute_text_size(this.title);
	var input_width = 0;
	var output_width = 0;

	if (this.inputs)
		for (var i = 0, l = this.inputs.length; i < l; ++i) {
			var input = this.inputs[i];
			var text = input.label || input.name || "";
			var text_width = compute_text_size(text);
			if (input_width < text_width)
				input_width = text_width;
		}

	if (this.outputs)
		for (var i = 0, l = this.outputs.length; i < l; ++i) {
			var output = this.outputs[i];
			var text = output.label || output.name || "";
			var text_width = compute_text_size(text);
			if (output_width < text_width)
				output_width = text_width;
		}

	size[0] = Math.max(input_width + output_width + 10, title_width);
	size[0] = Math.max(size[0], Nodes.NODE_WIDTH);

	function compute_text_size(text) {
		if (!text)
			return 0;
		return font_size * text.length * 0.6;
	}

	return size;
}

/**
 * returns the bounding of the object, used for rendering purposes
 * @method getBounding
 * @return {Float32Array[4]} the total size
 */
Node.prototype.getBounding = function () {
	return new Float32Array([this.pos[0] - 4, this.pos[1] - Nodes.NODE_TITLE_HEIGHT, this.pos[0] + this.size[0] + 4, this.pos[1] + this.size[1] + NodesEngine.NODE_TITLE_HEIGHT]);
}

/**
 * checks if a point is inside the shape of a node
 * @method isPointInsideNode
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
Node.prototype.isPointInsideNode = function (x, y, margin) {
	margin = margin || 0;

	var margin_top = this.graph && this.graph.isLive() ? 0 : 20;
	if (this.flags.collapsed) {
		//if ( distance([x,y], [this.pos[0] + this.size[0]*0.5, this.pos[1] + this.size[1]*0.5]) < Nodes.NODE_COLLAPSED_RADIUS)
		if (isInsideRectangle(x, y, this.pos[0] - margin, this.pos[1] - Nodes.NODE_TITLE_HEIGHT - margin, Nodes.NODE_COLLAPSED_WIDTH + 2 * margin, Nodes.NODE_TITLE_HEIGHT + 2 * margin))
			return true;
	}
	else if ((this.pos[0] - 4 - margin) < x && (this.pos[0] + this.size[0] + 4 + margin) > x
		&& (this.pos[1] - margin_top - margin) < y && (this.pos[1] + this.size[1] + margin) > y)
		return true;
	return false;
}

/**
 * checks if a point is inside a node slot, and returns info about which slot
 * @method getSlotInPosition
 * @param {number} x
 * @param {number} y
 * @return {Object} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
 */
Node.prototype.getSlotInPosition = function (x, y) {
	//search for inputs
	if (this.inputs)
		for (var i = 0, l = this.inputs.length; i < l; ++i) {
			var input = this.inputs[i];
			var link_pos = this.getConnectionPos(true, i);
			if (isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
				return {input: input, slot: i, link_pos: link_pos, locked: input.locked};
		}

	if (this.outputs)
		for (var i = 0, l = this.outputs.length; i < l; ++i) {
			var output = this.outputs[i];
			var link_pos = this.getConnectionPos(false, i);
			if (isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
				return {output: output, slot: i, link_pos: link_pos, locked: output.locked};
		}

	return null;
}

/**
 * returns the input slot with a given name (used for dynamic slots), -1 if not found
 * @method findInputSlot
 * @param {string} name the name of the slot
 * @return {number} the slot (-1 if not found)
 */
Node.prototype.findInputSlot = function (name) {
	if (!this.inputs) return -1;
	for (var i = 0, l = this.inputs.length; i < l; ++i)
		if (name == this.inputs[i].name)
			return i;
	return -1;
}

/**
 * returns the output slot with a given name (used for dynamic slots), -1 if not found
 * @method findOutputSlot
 * @param {string} name the name of the slot
 * @return {number} the slot (-1 if not found)
 */
Node.prototype.findOutputSlot = function (name) {
	if (!this.outputs) return -1;
	for (var i = 0, l = this.outputs.length; i < l; ++i)
		if (name == this.outputs[i].name)
			return i;
	return -1;
}

/**
 * connect this node output to the input of another node
 * @method connect
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @param {Node} node the target node
 * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot)
 * @return {boolean} if it was connected succesfully
 */
Node.prototype.connect = function (slot, node, target_slot) {
	target_slot = target_slot || 0;

	//seek for the output slot
	if (slot.constructor === String) {
		slot = this.findOutputSlot(slot);
		if (slot == -1) {
			debugErr("Connect: Error, no slot of name " + slot);
			return false;
		}
	}
	else if (!this.outputs || slot >= this.outputs.length) {
		debugErr("Connect: Error, slot number not found");
		return false;
	}

	if (node && node.constructor === Number)
		node = this.graph.getNodeById(node);
	if (!node)
		throw("Node not found");

	//avoid loopback
	if (node == this)
		return false;
	//if( node.constructor != Node ) throw ("Node.connect: node is not of type Node");

	if (target_slot.constructor === String) {
		target_slot = node.findInputSlot(target_slot);
		if (target_slot == -1) {
			debugErr("Connect: Error, no slot of name " + target_slot);
			return false;
		}
	}
	else if (!node.inputs || target_slot >= node.inputs.length) {
		debugErr("Connect: Error, slot number not found");
		return false;
	}

	//if there is something already plugged there, disconnect
	if (target_slot != -1 && node.inputs[target_slot].link != null)
		node.disconnectInput(target_slot);

	//why here??
	this.setDirtyCanvas(false, true);
	this.graph.connectionChange(this);

	//special case: -1 means node-connection, used for triggers
	var output = this.outputs[slot];

	//allows nodes to block connection even if all test passes
	if (node.onConnectInput)
		if (node.onConnectInput(target_slot, output.type, output) === false)
			return false;

	if (target_slot == -1) {
		if (output.links == null)
			output.links = [];
		output.links.push({id: node.id, slot: -1});
	}
	else if (!output.type ||  //generic output
		!node.inputs[target_slot].type || //generic input
		output.type.toLowerCase() == node.inputs[target_slot].type.toLowerCase()) //same type
	{
		//info: link structure => [ 0:link_id, 1:start_node_id, 2:start_slot, 3:end_node_id, 4:end_slot ]
		//var link = [ this.graph.last_link_id++, this.id, slot, node.id, target_slot ];
		var link = {
			id: this.graph.last_link_id++,
			origin_id: this.id,
			origin_slot: slot,
			target_id: node.id,
			target_slot: target_slot
		};
		this.graph.links[link.id] = link;

		//connect
		if (output.links == null)    output.links = [];
		output.links.push(link.id);
		node.inputs[target_slot].link = link.id;

	}

	this.setDirtyCanvas(false, true);
	this.graph.connectionChange(this);

	return true;
}

/**
 * disconnect one output to an specific node
 * @method disconnectOutput
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @param {Node} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
 * @return {boolean} if it was disconnected succesfully
 */
Node.prototype.disconnectOutput = function (slot, target_node) {
	if (slot.constructor === String) {
		slot = this.findOutputSlot(slot);
		if (slot == -1) {
			debugErr("Connect: Error, no slot of name " + slot);
			return false;
		}
	}
	else if (!this.outputs || slot >= this.outputs.length) {
		debugErr("Connect: Error, slot number not found");
		return false;
	}

	//get output slot
	var output = this.outputs[slot];
	if (!output.links || output.links.length == 0)
		return false;

	//one of the links
	if (target_node) {
		if (target_node.constructor === Number)
			target_node = this.graph.getNodeById(target_node);
		if (!target_node)
			throw("Target Node not found");

		for (var i = 0, l = output.links.length; i < l; i++) {
			var link_id = output.links[i];
			var link_info = this.graph.links[link_id];

			//is the link we are searching for...
			if (link_info.target_id == target_node.id) {
				output.links.splice(i, 1); //remove here
				target_node.inputs[link_info.target_slot].link = null; //remove there
				delete this.graph.links[link_id]; //remove the link from the links pool
				break;
			}
		}
	}
	else //all the links
	{
		for (var i = 0, l = output.links.length; i < l; i++) {
			var link_id = output.links[i];
			var link_info = this.graph.links[link_id];

			var target_node = this.graph.getNodeById(link_info.target_id);
			if (target_node)
				target_node.inputs[link_info.target_slot].link = null; //remove other side link
			delete this.graph.links[link_id]; //remove the link from the links pool
		}
		output.links = null;
	}

	this.setDirtyCanvas(false, true);
	this.graph.connectionChange(this);
	return true;
}

/**
 * disconnect one input
 * @method disconnectInput
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @return {boolean} if it was disconnected succesfully
 */
Node.prototype.disconnectInput = function (slot) {
	//seek for the output slot
	if (slot.constructor === String) {
		slot = this.findInputSlot(slot);
		if (slot == -1) {
			debugErr("Connect: Error, no slot of name " + slot);
			return false;
		}
	}
	else if (!this.inputs || slot >= this.inputs.length) {
		debugErr("Connect: Error, slot number not found");
		return false;
	}

	var input = this.inputs[slot];
	if (!input)
		return false;
	var link_id = this.inputs[slot].link;
	this.inputs[slot].link = null;

	//remove other side
	var link_info = this.graph.links[link_id];
	if (link_info) {
		var node = this.graph.getNodeById(link_info.origin_id);
		if (!node)
			return false;

		var output = node.outputs[link_info.origin_slot];
		if (!output || !output.links || output.links.length == 0)
			return false;

		//check outputs
		for (var i = 0, l = output.links.length; i < l; i++) {
			var link_id = output.links[i];
			var link_info = this.graph.links[link_id];
			if (link_info.target_id == this.id) {
				output.links.splice(i, 1);
				break;
			}
		}
	}

	this.setDirtyCanvas(false, true);
	this.graph.connectionChange(this);
	return true;
}

/**
 * returns the center of a connection point in canvas coords
 * @method getConnectionPos
 * @param {boolean} is_input true if if a input slot, false if it is an output
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @return {[x,y]} the position
 **/
Node.prototype.getConnectionPos = function (is_input, slot_number) {
	if (this.flags.collapsed) {
		if (is_input)
			return [this.pos[0], this.pos[1] - Nodes.NODE_TITLE_HEIGHT * 0.5];
		else
			return [this.pos[0] + Nodes.NODE_COLLAPSED_WIDTH, this.pos[1] - Nodes.NODE_TITLE_HEIGHT * 0.5];
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
		return [this.pos[0] + this.size[0] + 1, this.pos[1] + 10 + slot_number * Nodes.NODE_SLOT_HEIGHT];
	return [this.pos[0], this.pos[1] + 10 + slot_number * Nodes.NODE_SLOT_HEIGHT];
}

/* Force align to grid */
Node.prototype.alignToGrid = function () {
	this.pos[0] = Nodes.CANVAS_GRID_SIZE * Math.round(this.pos[0] / Nodes.CANVAS_GRID_SIZE);
	this.pos[1] = Nodes.CANVAS_GRID_SIZE * Math.round(this.pos[1] / Nodes.CANVAS_GRID_SIZE);
}


/* Console output */
Node.prototype.trace = function (msg) {
	if (!this.console)
		this.console = [];
	this.console.push(msg);
	if (this.console.length > Node.MAX_CONSOLE)
		this.console.shift();

	nodeDebug(this.title + ": " + msg);
}

Node.prototype.traceError = function (msg) {
	if (!this.console)
		this.console = [];
	this.console.push(msg);
	if (this.console.length > Node.MAX_CONSOLE)
		this.console.shift();

	nodeDebugErr(this.title + ": " + msg);
}

/* Forces to redraw or the main canvas (Node) or the bg canvas (links) */
Node.prototype.setDirtyCanvas = function (dirty_foreground, dirty_background) {
	if (!this.graph)
		return;
	this.graph.sendActionToCanvas("setDirty", [dirty_foreground, dirty_background]);
}

Node.prototype.loadImage = function (url) {
	var img = new Image();
	img.src = Nodes.node_images_path + url;
	img.ready = false;

	var that = this;
	img.onload = function () {
		this.ready = true;
		that.setDirtyCanvas(true);
	}
	return img;
}

//safe Node action execution (not sure if safe)
Node.prototype.executeAction = function (action) {
	if (action == "") return false;

	if (action.indexOf(";") != -1 || action.indexOf("}") != -1) {
		this.traceError("Error: Action contains unsafe characters");
		return false;
	}

	var tokens = action.split("(");
	var func_name = tokens[0];
	if (typeof(this[func_name]) != "function") {
		this.traceError("Error: Action not found on node: " + func_name);
		return false;
	}

	var code = action;

	try {
		var _foo = eval;
		eval = null;
		(new Function("with(this) { " + code + "}")).call(this);
		eval = _foo;
	}
	catch (err) {
		this.traceError("Error executing action {" + action + "} :" + err);
		return false;
	}

	return true;
}

/* Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus */
Node.prototype.captureInput = function (v) {
	if (!this.graph || !this.graph.list_of_graphcanvas)
		return;

	var list = this.graph.list_of_graphcanvas;

	for (var i = 0; i < list.length; ++i) {
		var c = list[i];
		//releasing somebody elses capture?!
		if (!v && c.node_capturing_input != this)
			continue;

		//change
		c.node_capturing_input = v ? this : null;
	}
}

/**
 * Collapse the node to make it smaller on the canvas
 * @method collapse
 **/
Node.prototype.collapse = function () {
	if (!this.flags.collapsed)
		this.flags.collapsed = true;
	else
		this.flags.collapsed = false;
	this.setDirtyCanvas(true, true);
}

/**
 * Forces the node to do not move or realign on Z
 * @method pin
 **/

Node.prototype.pin = function (v) {
	if (v === undefined)
		this.flags.pinned = !this.flags.pinned;
	else
		this.flags.pinned = v;
}

Node.prototype.localToScreen = function (x, y, graphcanvas) {
	return [(x + this.pos[0]) * graphcanvas.scale + graphcanvas.offset[0],
		(y + this.pos[1]) * graphcanvas.scale + graphcanvas.offset[1]];
}


module.exports = Nodes;