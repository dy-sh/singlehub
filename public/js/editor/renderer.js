///<reference path='../../../types/my_types.d.ts'/>
"use strict";
var container_1 = require("../../nodes/container");
var editor_1 = require("./editor");
var utils_1 = require("../../nodes/utils");
var renderer_themes_1 = require("./renderer-themes");
var Renderer = (function () {
    function Renderer(canvas, container, theme, skip_render) {
        this.max_zoom = 2;
        this.min_zoom = 0.1;
        this.theme = theme || new renderer_themes_1.RendererTheme();
        //link renderer and container
        if (container)
            container.attachRenderer(this);
        this.setCanvas(canvas);
        this.clear();
        if (!skip_render)
            this.startRendering();
    }
    /**
     * Clears all the data inside
     */
    Renderer.prototype.clear = function () {
        this.frame = 0;
        this.last_draw_time = 0;
        this.render_time = 0;
        this.fps = 0;
        this.scale = 1;
        this.offset = [0, 0];
        this.selected_nodes = {};
        this.node_dragged = null;
        this.node_over = null;
        this.node_capturing_input = null;
        this.connecting_node = null;
        this.highquality_render = true;
        this.editor_alpha = 1; //used for transition
        this.pause_rendering = false;
        this.render_shadows = true;
        this.shadows_width = this.theme.SHADOWS_WIDTH;
        this.clear_background = true;
        this.render_only_selected = true;
        this.live_mode = false;
        this.show_info = false;
        this.allow_dragcanvas = true;
        this.allow_dragnodes = true;
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
        this.dirty_area = null;
        this.node_in_container = null;
        this.last_mouse = [0, 0];
        this.last_mouseclick = 0;
        this.title_text_font = this.theme.TITLE_TEXT_FONT;
        this.inner_text_font = this.theme.INNER_TEXT_FONT;
        this.render_connections_shadows = false; //too much cpu
        this.render_connections_border = true;
        this.render_curved_connections = true;
        this.render_connection_arrows = this.theme.RENDER_CONNECTION_ARROWS;
        this.connections_width = this.theme.CONNECTIONS_WIDTH;
        this.connections_shadow = this.theme.CONNECTIONS_SHADOW;
        if (this.onClear)
            this.onClear();
        //this.UIinit();
        if (this.onClear)
            this.onClear();
    };
    /**
     * Assigns a container, you can reasign containers to the same renderer
     * @param container
     * @param skip_clear
     */
    Renderer.prototype.setContainer = function (container, skip_clear, joinRoom) {
        if (skip_clear === void 0) { skip_clear = false; }
        if (joinRoom === void 0) { joinRoom = true; }
        if (this.container == container)
            return;
        if (!skip_clear)
            this.clear();
        if (!container && this.container) {
            this.container.detachRenderer(this);
            return;
        }
        /*
         if(this.container)
         this.container.renderer = null; //remove old container link to the renderer
         this.container = container;
         if(this.container)
         this.container.renderer = this;
         */
        container.attachRenderer(this);
        this.setDirty(true, true);
        editor_1.editor.updateContainersNavigation();
        editor_1.editor.updateBrowserUrl();
        if (joinRoom) {
            editor_1.editor.socket.sendJoinContainerRoom(container.id);
            editor_1.editor.updateNodesLabels();
        }
    };
    /**
     * Open container
     * @param container node
     */
    Renderer.prototype.openContainer = function (container, joinRoom) {
        if (joinRoom === void 0) { joinRoom = true; }
        if (!container)
            throw ("container cannot be null");
        if (this.container == container)
            throw ("container cannot be the same");
        this.clear();
        if (this.container) {
            if (!this._containers_stack)
                this._containers_stack = [];
            this._containers_stack.push(this.container);
        }
        container.attachRenderer(this);
        this.setDirty(true, true);
        editor_1.editor.updateContainersNavigation();
        editor_1.editor.updateBrowserUrl();
        if (joinRoom) {
            editor_1.editor.socket.sendJoinContainerRoom(container.id);
            editor_1.editor.updateNodesLabels();
        }
    };
    /**
     * Close container
     */
    Renderer.prototype.closeContainer = function (joinRoom) {
        if (joinRoom === void 0) { joinRoom = true; }
        if (!this._containers_stack || this._containers_stack.length == 0)
            return;
        var container = this._containers_stack.pop();
        container.attachRenderer(this);
        this.setDirty(true, true);
        editor_1.editor.updateContainersNavigation();
        editor_1.editor.updateBrowserUrl();
        if (joinRoom) {
            editor_1.editor.socket.sendJoinContainerRoom(container.id);
            editor_1.editor.updateNodesLabels();
        }
    };
    /**
     * Assigns a canvas
     * @param canvas
     * @param skip_events
     */
    Renderer.prototype.setCanvas = function (canvas, skip_events) {
        if (skip_events === void 0) { skip_events = false; }
        var that = this;
        // if (renderer) {
        //     if (renderer.constructor === String) {
        //         renderer = document.getElementById(renderer);
        //         if (!renderer)
        //             throw ("Error creating renderer: Canvas not found");
        //     }
        // }
        if (canvas === this.canvas)
            return;
        if (!canvas && this.canvas) {
            //maybe detach events from old_canvas
            if (!skip_events)
                this.unbindEvents();
        }
        this.canvas = canvas;
        if (!canvas)
            return;
        //this.renderer.tabindex = "1000";
        canvas.className += " editorcanvas";
        canvas.data = this;
        //bg renderer: used for non changing stuff
        this.bgcanvas = null;
        if (!this.bgcanvas) {
            this.bgcanvas = document.createElement("canvas");
            this.bgcanvas.width = this.canvas.width;
            this.bgcanvas.height = this.canvas.height;
        }
        if (canvas.getContext == null) {
            throw ("This browser doesnt support Canvas");
        }
        var ctx = this.ctx = canvas.getContext("2d");
        if (ctx == null) {
            console.warn("This canvas seems to be WebGL, enabling WebGL renderer");
            this.enableWebGL();
        }
        //input:  (move and up could be unbinded)
        this._mousemove_callback = this.processMouseMove.bind(this);
        this._mouseup_callback = this.processMouseUp.bind(this);
        if (!skip_events)
            this.bindEvents();
    };
    /**
     * Used in some events to capture them
     * @param e
     * @returns {boolean}
     * @private
     */
    Renderer.prototype._doNothing = function (e) {
        e.preventDefault();
        return false;
    };
    /**
     *
     * @param e
     * @returns {boolean}
     * @private
     */
    Renderer.prototype._doReturnTrue = function (e) {
        e.preventDefault();
        return true;
    };
    /**
     *
     */
    Renderer.prototype.bindEvents = function () {
        if (this._events_binded) {
            console.warn("Renderer: events already binded");
            return;
        }
        var canvas = this.canvas;
        this._mousedown_callback = this.processMouseDown.bind(this);
        this._mousewheel_callback = this.processMouseWheel.bind(this);
        canvas.addEventListener("mousedown", this._mousedown_callback, true); //down do not need to store the binded
        canvas.addEventListener("mousemove", this._mousemove_callback);
        canvas.addEventListener("mousewheel", this._mousewheel_callback, false);
        canvas.addEventListener("contextmenu", this._doNothing);
        canvas.addEventListener("DOMMouseScroll", this._mousewheel_callback, false);
        //touch events
        //if( 'touchstart' in document.documentElement )
        {
            canvas.addEventListener("touchstart", this.touchHandler, true);
            canvas.addEventListener("touchmove", this.touchHandler, true);
            canvas.addEventListener("touchend", this.touchHandler, true);
            canvas.addEventListener("touchcancel", this.touchHandler, true);
        }
        //Keyboard ******************
        this._key_callback = this.processKey.bind(this);
        canvas.addEventListener("keydown", this._key_callback);
        canvas.addEventListener("keyup", this._key_callback);
        //Droping Stuff over nodes ************************************
        this._ondrop_callback = this.processDrop.bind(this);
        canvas.addEventListener("dragover", this._doNothing, false);
        canvas.addEventListener("dragend", this._doNothing, false);
        canvas.addEventListener("drop", this._ondrop_callback, false);
        canvas.addEventListener("dragenter", this._doReturnTrue, false);
        this._events_binded = true;
    };
    /**
     *
     */
    Renderer.prototype.unbindEvents = function () {
        if (!this._events_binded) {
            console.warn("NodeEditorCanvas: no events binded");
            return;
        }
        this.canvas.removeEventListener("mousedown", this._mousedown_callback);
        this.canvas.removeEventListener("mousewheel", this._mousewheel_callback);
        this.canvas.removeEventListener("DOMMouseScroll", this._mousewheel_callback);
        this.canvas.removeEventListener("keydown", this._key_callback);
        this.canvas.removeEventListener("keyup", this._key_callback);
        this.canvas.removeEventListener("contextmenu", this._doNothing);
        this.canvas.removeEventListener("drop", this._ondrop_callback);
        this.canvas.removeEventListener("dragenter", this._doReturnTrue);
        this.canvas.removeEventListener("touchstart", this.touchHandler);
        this.canvas.removeEventListener("touchmove", this.touchHandler);
        this.canvas.removeEventListener("touchend", this.touchHandler);
        this.canvas.removeEventListener("touchcancel", this.touchHandler);
        this._mousedown_callback = null;
        this._mousewheel_callback = null;
        this._key_callback = null;
        this._ondrop_callback = null;
        this._events_binded = false;
    };
    /**
     * Allows to render the renderer using WebGL instead of Canvas2D
     * This is useful if you plant to render 3D objects inside your nodes
     */
    Renderer.prototype.enableWebGL = function () {
        if (typeof (this.GL) === undefined)
            throw ("litegl.js must be included to use a WebGL canvas");
        if (typeof (this.enableWebGLCanvas) === undefined)
            throw ("webglCanvas.js must be included to use this feature");
        this.gl = this.ctx = this.enableWebGLCanvas(this.canvas);
        this.ctx.webgl = true; //check ES6
        this.bgcanvas = this.canvas;
        this.bgctx = this.gl;
        /*
         GL.create({ renderer: this.bgcanvas });
         this.bgctx = enableWebGLCanvas( this.bgcanvas );
         window.gl = this.gl;
         */
    };
    /**
     * Marks as dirty the renderer, this way it will be rendered again
     * @param foregraund if the foreground renderer is dirty (the one containing the nodes)
     * @param background if the background renderer is dirty (the one containing the wires)
     */
    Renderer.prototype.setDirty = function (foregraund, background) {
        if (background === void 0) { background = false; }
        if (foregraund)
            this.dirty_canvas = true;
        if (background)
            this.dirty_bgcanvas = true;
    };
    /**
     * Used to attach the renderer in a popup
     * @returns {window} returns the window where the renderer is attached (the DOM root node)
     */
    Renderer.prototype.getCanvasWindow = function () {
        var doc = this.canvas.ownerDocument;
        return doc.defaultView || doc.parentWindow; //check ES6
    };
    /**
     * starts rendering the content of the renderer when needed
     */
    Renderer.prototype.startRendering = function () {
        if (this.is_rendering)
            return; //already rendering
        this.is_rendering = true;
        renderFrame.call(this);
        function renderFrame() {
            if (!this.pause_rendering)
                this.draw();
            var window = this.getCanvasWindow();
            if (this.is_rendering)
                window.requestAnimationFrame(renderFrame.bind(this));
        }
    };
    /**
     * Stops rendering the content of the renderer (to save resources)
     */
    Renderer.prototype.stopRendering = function () {
        this.is_rendering = false;
        /*
         if(this.rendering_timer_id)
         {
         clearInterval(this.rendering_timer_id);
         this.rendering_timer_id = null;
         }
         */
    };
    /*
     Renderer.prototype.UIinit = function()
     {
     let that = this;
     $("#node-console input").change(function(e)
     {
     if(e.target.value == "")
     return;

     let node = that.node_in_container;
     if(!node)
     return;

     node.trace("] " + e.target.value, "#333");
     if(node.onConsoleCommand)
     {
     if(!node.onConsoleCommand(e.target.value))
     node.trace("command not found", "#A33");
     }
     else if (e.target.value == "info")
     {
     node.trace("Special methods:");
     for(let i in node)
     {
     if(typeof(node[i]) == "function" && Node.prototype[i] == null && i.substr(0,2) != "on" && i[0] != "_")
     node.trace(" + " + i);
     }
     }
     else
     {
     try
     {
     eval("let _foo = function() { return ("+e.target.value+"); }");
     let result = _foo.call(node);
     if(result)
     node.trace(result.toString());
     delete window._foo;
     }
     catch(err)
     {
     node.trace("error: " + err, "#A33");
     }
     }

     this.value = "";
     });
     }
     */
    /**
     * Canvas mouse input
     * @param e
     * @returns {boolean}
     */
    Renderer.prototype.processMouseDown = function (e) {
        if (!this.container)
            return;
        this.adjustMouseEvent(e);
        var ref_window = this.getCanvasWindow();
        var document = ref_window.document;
        //move mouse move event to the window in case it drags outside of the renderer
        this.canvas.removeEventListener("mousemove", this._mousemove_callback);
        ref_window.document.addEventListener("mousemove", this._mousemove_callback, true); //catch for the entire window
        ref_window.document.addEventListener("mouseup", this._mouseup_callback, true);
        var n = this.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);
        var skip_dragging = false;
        //derwish added
        this.closeAllContextualMenus();
        if (e.which == 1) {
            if (!e.shiftKey) {
                //derwish edit
                //no node or another node selected
                if (!n || !this.selected_nodes[n.id]) {
                    var todeselect = [];
                    for (var i in this.selected_nodes)
                        if (this.selected_nodes[i] != n)
                            todeselect.push(this.selected_nodes[i]);
                    //two passes to avoid problems modifying the container
                    for (var i in todeselect)
                        this.processNodeDeselected(todeselect[i]);
                }
            }
            var clicking_canvas_bg = false;
            //when clicked on top of a node
            //and it is not interactive
            if (n) {
                var skip_action = false;
                //not dragging mouse to connect two slots
                if (!this.connecting_node && !n.flags.collapsed && !this.live_mode) {
                    //search for outputs
                    if (n.outputs)
                        for (var o in n.outputs) {
                            var output = n.outputs[o];
                            var link_pos = this.getConnectionPos(n, false, +o);
                            if (utils_1.default.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                                this.connecting_node = n;
                                this.connecting_output = output;
                                this.connecting_pos = this.getConnectionPos(n, false, +o);
                                this.connecting_slot = +o;
                                skip_action = true;
                                break;
                            }
                        }
                    //search for inputs
                    if (n.inputs)
                        for (var i in n.inputs) {
                            var input = n.inputs[i];
                            var link_pos = this.getConnectionPos(n, true, +i);
                            if (utils_1.default.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                                if (input.link != null) {
                                    editor_1.editor.socket.sendRemoveLink(input.link.target_node_id, input.link.target_slot, n.id, i);
                                    //n.disconnectInput(i);
                                    //this.dirty_bgcanvas = true;
                                    skip_action = true;
                                }
                            }
                        }
                    //Search for corner
                    //derwish edit 5 to 10
                    if (!skip_action && utils_1.default.isInsideRectangle(e.canvasX, e.canvasY, n.pos[0] + n.size[0] - 10, n.pos[1] + n.size[1] - 10, 10, 10)) {
                        this.resizing_node = n;
                        this.canvas.style.cursor = "se-resize";
                        skip_action = true;
                    }
                }
                //Search for corner
                if (!skip_action && utils_1.default.isInsideRectangle(e.canvasX, e.canvasY, n.pos[0], n.pos[1] - this.theme.NODE_TITLE_HEIGHT, this.theme.NODE_TITLE_HEIGHT, this.theme.NODE_TITLE_HEIGHT)) {
                    n.collapse();
                    skip_action = true;
                }
                //it wasnt clicked on the links boxes
                if (!skip_action) {
                    var block_drag_node = false;
                    //double clicking
                    var now = utils_1.default.getTime();
                    if ((now - this.last_mouseclick) < 300 && this.selected_nodes[n.id]) {
                        //double click node
                        if (n['onDblClick'])
                            n['onDblClick'](e);
                        this.processNodeDblClicked(n);
                        block_drag_node = true;
                    }
                    //if do not capture mouse
                    if (n['onMouseDown'] && n['onMouseDown'](e))
                        block_drag_node = true;
                    else if (this.live_mode) {
                        clicking_canvas_bg = true;
                        block_drag_node = true;
                    }
                    if (!block_drag_node) {
                        if (this.allow_dragnodes)
                            this.node_dragged = n;
                        if (!this.selected_nodes[n.id])
                            this.processNodeSelected(n, e);
                    }
                    this.dirty_canvas = true;
                }
            }
            else
                clicking_canvas_bg = true;
            if (clicking_canvas_bg && this.allow_dragcanvas) {
                this.dragging_canvas = true;
            }
        }
        else if (e.which == 2) {
        }
        else if (e.which == 3) {
            this.processContextualMenu(n, e);
        }
        //TODO
        //if(this.node_selected != prev_selected)
        //	this.onNodeSelectionChange(this.node_selected);
        this.last_mouse[0] = e.localX;
        this.last_mouse[1] = e.localY;
        this.last_mouseclick = utils_1.default.getTime();
        this.canvas_mouse = [e.canvasX, e.canvasY];
        /*
         if( (this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
         this.draw();
         */
        this.container.setDirtyCanvas(true, true);
        //this is to ensure to defocus(blur) if a text input element is on focus
        if (!ref_window.document.activeElement || (ref_window.document.activeElement.nodeName.toLowerCase() != "input" && ref_window.document.activeElement.nodeName.toLowerCase() != "textarea"))
            e.preventDefault();
        e.stopPropagation();
        return false;
    };
    /**
     * Process mouse move
     * @param e
     * @returns {boolean}
     */
    Renderer.prototype.processMouseMove = function (e) {
        if (!this.container)
            return;
        this.adjustMouseEvent(e);
        var mouse = [e.localX, e.localY];
        var delta = [mouse[0] - this.last_mouse[0], mouse[1] - this.last_mouse[1]];
        this.last_mouse = mouse;
        this.canvas_mouse = [e.canvasX, e.canvasY];
        if (this.dragging_canvas) {
            this.offset[0] += delta[0] / this.scale;
            this.offset[1] += delta[1] / this.scale;
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
        }
        else {
            if (this.connecting_node)
                this.dirty_canvas = true;
            //get node over
            var n = this.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);
            //remove mouseover flag
            for (var id in this.container._nodes) {
                var node = this.container._nodes[id];
                if (node.mouseOver && n != node) {
                    //mouse leave
                    node.mouseOver = false;
                    if (this.node_over && this.node_over['onMouseLeave'])
                        this.node_over['onMouseLeave'](e);
                    this.node_over = null;
                    this.dirty_canvas = true;
                }
            }
            this.canvas.style.cursor = "default";
            //mouse over a node
            if (n) {
                var i = this.isOverNodeInput(n, e.canvasX, e.canvasY, [0, 0]);
                var o = this.isOverNodeOutput(n, e.canvasX, e.canvasY, [0, 0]);
                if (i != -1 || o != -1)
                    this.canvas.style.cursor = "crosshair";
                if (!n.mouseOver) {
                    //mouse enter
                    n.mouseOver = true;
                    this.node_over = n;
                    this.dirty_canvas = true;
                    if (n['onMouseEnter'])
                        n['onMouseEnter'](e);
                }
                if (n['onMouseMove'])
                    n['onMouseMove'](e);
                //ontop of input
                if (this.connecting_node) {
                    var pos = this._highlight_input || [0, 0];
                    var slot = this.isOverNodeInput(n, e.canvasX, e.canvasY, pos);
                    if (slot != -1 && n.inputs[slot]) {
                        //prevent connection different types
                        //let slot_type = n.inputs[slot].type;
                        //if (!this.connecting_output.type || !slot_type || slot_type == this.connecting_output.type)
                        this._highlight_input = pos;
                    }
                    else
                        this._highlight_input = null;
                }
                //over corner
                if (utils_1.default.isInsideRectangle(e.canvasX, e.canvasY, n.pos[0] + n.size[0] - 10, n.pos[1] + n.size[1] - 10, 10, 10))
                    this.canvas.style.cursor = "se-resize";
            }
            if (this.node_capturing_input && this.node_capturing_input != n && this.node_capturing_input['onMouseMove']) {
                this.node_capturing_input['onMouseMove'](e);
            }
            if (this.node_dragged && !this.live_mode) {
                /*
                 this.node_dragged.pos[0] += delta[0] / this.scale;
                 this.node_dragged.pos[1] += delta[1] / this.scale;
                 this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
                 this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
                 */
                for (var i in this.selected_nodes) {
                    var n_1 = this.selected_nodes[i];
                    n_1.pos[0] += delta[0] / this.scale;
                    n_1.pos[1] += delta[1] / this.scale;
                    //derwish added
                    n_1.pos[0] = Math.round(n_1.pos[0]);
                    n_1.pos[1] = Math.round(n_1.pos[1]);
                }
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
            }
            if (this.resizing_node && !this.live_mode) {
                this.resizing_node.size[0] += delta[0] / this.scale;
                //this.resizing_node.size[1] += delta[1] / this.scale;
                // let max_slots = Math.max(this.resizing_node.inputs ? this.resizing_node.inputs.length : 0, this.resizing_node.outputs ? this.resizing_node.outputs.length : 0);
                //	if(this.resizing_node.size[1] < max_slots * this.theme.NODE_SLOT_HEIGHT + 4)
                //		this.resizing_node.size[1] = max_slots * this.theme.NODE_SLOT_HEIGHT + 4;
                if (this.resizing_node.size[0] < this.theme.NODE_MIN_WIDTH)
                    this.resizing_node.size[0] = this.theme.NODE_MIN_WIDTH;
                this.canvas.style.cursor = "se-resize";
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
            }
        }
        /*
         if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
         this.draw();
         */
        e.preventDefault();
        //e.stopPropagation();
        return false;
        //this is not really optimal
        //this.container.change();
    };
    /**
     * Process mouse up
     * @param e
     * @returns {boolean}
     */
    Renderer.prototype.processMouseUp = function (e) {
        if (!this.container)
            return;
        var window = this.getCanvasWindow();
        var document = window.document;
        //restore the mousemove event back to the renderer
        document.removeEventListener("mousemove", this._mousemove_callback, true);
        this.canvas.addEventListener("mousemove", this._mousemove_callback, true);
        document.removeEventListener("mouseup", this._mouseup_callback, true);
        this.adjustMouseEvent(e);
        if (e.which == 1) {
            //dragging a connection
            if (this.connecting_node) {
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
                var node = this.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);
                //node below mouse
                if (node) {
                    if (this.connecting_output.type == 'node') {
                        this.connecting_node.connect(this.connecting_slot, node.id, -1);
                    }
                    else {
                        //slot below mouse? connect
                        var slot = this.isOverNodeInput(node, e.canvasX, e.canvasY);
                        editor_1.editor.socket.sendCreateLink(this.connecting_node.id, this.connecting_slot, node.id, slot);
                    }
                }
                this.connecting_output = null;
                this.connecting_pos = null;
                this.connecting_node = null;
                this.connecting_slot = -1;
                this._highlight_input = null;
            } //not dragging connection
            else if (this.resizing_node) {
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
                editor_1.editor.socket.sendUpdateNodeSize(this.resizing_node);
                this.resizing_node = null;
            }
            else if (this.node_dragged) {
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
                this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
                this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
                for (var i in this.selected_nodes) {
                    this.selected_nodes[i].size[0] = Math.round(this.selected_nodes[i].size[0]);
                    this.selected_nodes[i].size[1] = Math.round(this.selected_nodes[i].size[1]);
                    editor_1.editor.socket.sendUpdateNodePosition(this.selected_nodes[i]);
                }
                this.node_dragged = null;
            }
            else {
                this.dirty_canvas = true;
                this.dragging_canvas = false;
                if (this.node_over && this.node_over['onMouseUp'])
                    this.node_over['onMouseUp'](e);
                if (this.node_capturing_input && this.node_capturing_input['onMouseUp'])
                    this.node_capturing_input['onMouseUp'](e);
            }
        }
        else if (e.which == 2) {
            //trace("middle");
            this.dirty_canvas = true;
            this.dragging_canvas = false;
        }
        else if (e.which == 3) {
            //trace("right");
            this.dirty_canvas = true;
            this.dragging_canvas = false;
        }
        /*
         if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
         this.draw();
         */
        this.container.setDirtyCanvas(true, true);
        e.stopPropagation();
        e.preventDefault();
        return false;
    };
    /**
     * Process mouse wheel, change zoom
     * @param e
     * @returns {boolean}
     */
    Renderer.prototype.processMouseWheel = function (e) {
        if (!this.container || !this.allow_dragcanvas)
            return;
        var delta = (e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60);
        this.adjustMouseEvent(e);
        var zoom = this.scale;
        if (delta > 0)
            zoom *= 1.02;
        else if (delta < 0)
            zoom *= 1 / (1.02);
        this.setZoom(zoom, [e.localX, e.localY]);
        /*
         if(this.rendering_timer_id == null)
         this.draw();
         */
        this.container.setDirtyCanvas(true, true);
        e.preventDefault();
        return false; // prevent default
    };
    /**
     * Returns slot number at canvas position or -1 if no slots
     * @param node
     * @param canvasx
     * @param canvasy
     * @param slot_pos
     * @returns {number}
     */
    Renderer.prototype.isOverNodeInput = function (node, canvasx, canvasy, slot_pos) {
        if (node.inputs)
            for (var i in node.inputs) {
                var input = node.inputs[i];
                var link_pos = this.getConnectionPos(node, true, +i);
                if (utils_1.default.isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                    if (slot_pos) {
                        slot_pos[0] = link_pos[0];
                        slot_pos[1] = link_pos[1];
                    }
                    return +i;
                }
            }
        return -1;
    };
    Renderer.prototype.isOverNodeOutput = function (node, canvasx, canvasy, slot_pos) {
        if (node.outputs)
            for (var o in node.outputs) {
                var output = node.outputs[o];
                var link_pos = this.getConnectionPos(node, false, +o);
                if (utils_1.default.isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                    if (slot_pos) {
                        slot_pos[0] = link_pos[0];
                        slot_pos[1] = link_pos[1];
                    }
                    return +o;
                }
            }
        return -1;
    };
    /**
     * Process key
     * @param e
     * @returns {boolean}
     */
    Renderer.prototype.processKey = function (e) {
        if (!this.container)
            return;
        var block_default = false;
        if (e.type == "keydown") {
            //select all Control A
            if (e.keyCode == 65 && e.ctrlKey) {
                this.selectAllNodes();
                block_default = true;
            }
            //delete or backspace
            if (e.keyCode == 46 || e.keyCode == 8) {
                this.deleteSelectedNodes();
                block_default = true;
            }
            //collapse
            //...
            //TODO
            if (this.selected_nodes)
                for (var i in this.selected_nodes)
                    if (this.selected_nodes[i]['onKeyDown'])
                        this.selected_nodes[i]['onKeyDown'](e);
        }
        else if (e.type == "keyup") {
            if (this.selected_nodes)
                for (var i in this.selected_nodes)
                    if (this.selected_nodes[i]['onKeyUp'])
                        this.selected_nodes[i]['onKeyUp'](e);
        }
        this.container.setDirtyCanvas(true, true);
        if (block_default) {
            e.preventDefault();
            return false;
        }
    };
    /**
     * Process drop
     * @param e
     * @returns {boolean}
     */
    Renderer.prototype.processDrop = function (e) {
        e.preventDefault();
        this.adjustMouseEvent(e);
        var pos = [e.canvasX, e.canvasY];
        var node = this.getNodeOnPos(pos[0], pos[1]);
        if (!node) {
            if (this.onDropItem)
                this.onDropItem(event);
            return;
        }
        if (node['onDropFile']) {
            var files = e.dataTransfer.files;
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = e.dataTransfer.files[0];
                    var filename = file.name;
                    var ext = this.getFileExtension(filename);
                    //console.log(file);
                    //prepare reader
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        //console.log(event.target);
                        //todo ES6
                        //let data = event.target.result;
                        //node.onDropFile(data, filename, file);
                    };
                    //read data
                    var type = file.type.split("/")[0];
                    if (type == "text" || type == "")
                        reader.readAsText(file);
                    else if (type == "image")
                        reader.readAsDataURL(file);
                    else
                        reader.readAsArrayBuffer(file);
                }
            }
        }
        if (node['onDropItem']) {
            if (node['onDropItem'](event))
                return true;
        }
        if (this.onDropItem)
            return this.onDropItem(event);
        return false;
    };
    /**
     * Process node selected
     * @param n node
     * @param e
     */
    Renderer.prototype.processNodeSelected = function (n, e) {
        n.selected = true;
        if (n['onSelected'])
            n['onSelected']();
        if (e && e.shiftKey)
            this.selected_nodes[n.id] = n;
        else {
            this.selected_nodes = {};
            this.selected_nodes[n.id] = n;
        }
        this.dirty_canvas = true;
        if (this.onNodeSelected)
            this.onNodeSelected(n);
        //if(this.node_in_container) this.showNodePanel(n);
    };
    /**
     * Process node deselected
     * @param n node
     */
    Renderer.prototype.processNodeDeselected = function (n) {
        n.selected = false;
        if (n['onDeselected'])
            n['onDeselected']();
        delete this.selected_nodes[n.id];
        if (this.onNodeDeselected)
            this.onNodeDeselected();
        this.dirty_canvas = true;
        //this.showNodePanel(null);
    };
    /**
     * Process node double clicked
     * @param n node
     */
    Renderer.prototype.processNodeDblClicked = function (n) {
        if (this.onShowNodePanel)
            this.onShowNodePanel(n);
        if (this.onNodeDblClicked)
            this.onNodeDblClicked(n);
        this.setDirty(true);
    };
    /**
     * Select node
     * @param node node
     */
    Renderer.prototype.selectNode = function (node) {
        this.deselectAllNodes();
        if (!node)
            return;
        if (!node.selected && node['onSelected'])
            node['onSelected']();
        node.selected = true;
        this.selected_nodes[node.id] = node;
        this.setDirty(true);
    };
    /**
     * Select all nodes
     */
    Renderer.prototype.selectAllNodes = function () {
        for (var id in this.container._nodes) {
            var node = this.container._nodes[id];
            if (!node.selected && node['onSelected'])
                node['onSelected']();
            node.selected = true;
            this.selected_nodes[node.id] = node;
        }
        this.setDirty(true);
    };
    /**
     * Deselect all nodes
     */
    Renderer.prototype.deselectAllNodes = function () {
        for (var i in this.selected_nodes) {
            var n = this.selected_nodes[i];
            if (n['onDeselected'])
                n['onDeselected']();
            n.selected = false;
        }
        this.selected_nodes = {};
        this.setDirty(true);
    };
    /**
     * Deselect selected nodes
     */
    Renderer.prototype.deleteSelectedNodes = function () {
        for (var i in this.selected_nodes) {
            var m = this.selected_nodes[i];
            //if(m == this.node_in_container) this.showNodePanel(null);
            this.container.remove(m);
        }
        this.selected_nodes = {};
        this.setDirty(true);
    };
    /**
     * Center on node
     * @param node
     */
    Renderer.prototype.centerOnNode = function (node) {
        this.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (this.canvas.width * 0.5 / this.scale);
        this.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (this.canvas.height * 0.5 / this.scale);
        this.setDirty(true, true);
    };
    /**
     *
     * @param e
     */
    Renderer.prototype.adjustMouseEvent = function (e) {
        var b = this.canvas.getBoundingClientRect();
        e.localX = e.pageX - b.left;
        e.localY = e.pageY - b.top;
        e.canvasX = e.localX / this.scale - this.offset[0];
        e.canvasY = e.localY / this.scale - this.offset[1];
    };
    /**
     * Set canvas zoom
     * @param value
     * @param zooming_center
     */
    Renderer.prototype.setZoom = function (value, zooming_center) {
        if (!zooming_center)
            zooming_center = [this.canvas.width * 0.5, this.canvas.height * 0.5];
        var center = this.convertOffsetToCanvas(zooming_center);
        this.scale = value;
        if (this.scale > this.max_zoom)
            this.scale = this.max_zoom;
        else if (this.scale < this.min_zoom)
            this.scale = this.min_zoom;
        var new_center = this.convertOffsetToCanvas(zooming_center);
        var delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];
        this.offset[0] += delta_offset[0];
        this.offset[1] += delta_offset[1];
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
    };
    /**
     *
     * @param pos
     * @returns {[number,number]}
     */
    Renderer.prototype.convertOffsetToCanvas = function (pos) {
        return [pos[0] / this.scale - this.offset[0], pos[1] / this.scale - this.offset[1]];
    };
    /**
     *
     * @param pos
     * @returns {[number,number]}
     */
    Renderer.prototype.convertCanvasToOffset = function (pos) {
        return [(pos[0] + this.offset[0]) * this.scale,
            (pos[1] + this.offset[1]) * this.scale];
    };
    /**
     *
     * @param e
     * @returns {[number,number]}
     */
    Renderer.prototype.convertEventToCanvas = function (e) {
        var rect = this.canvas.getClientRects()[0];
        return this.convertOffsetToCanvas([e.pageX - rect.left, e.pageY - rect.top]);
    };
    /**
     * Compute visible ndes
     * @returns {Array}
     */
    Renderer.prototype.computeVisibleNodes = function () {
        var visible_nodes = [];
        for (var id in this.container._nodes) {
            var node = this.container._nodes[id];
            //skip rendering nodes in live mode
            if (this.live_mode && !node['onDrawBackground'] && !node['onDrawForeground'])
                continue;
            if (!utils_1.default.overlapBounding(this.visible_area, this.getBounding(node)))
                continue; //out of the visible area
            visible_nodes.push(node);
        }
        return visible_nodes;
    };
    /**
     * Draw canvas
     * @param force_foreground
     * @param force_background
     */
    Renderer.prototype.draw = function (force_foreground, force_background) {
        //fps counting
        var now = utils_1.default.getTime();
        this.render_time = (now - this.last__time) * 0.001;
        this.last_draw_time = now;
        if (this.container) {
            var start = [-this.offset[0], -this.offset[1]];
            var end = [start[0] + this.canvas.width / this.scale, start[1] + this.canvas.height / this.scale];
            this.visible_area = [start[0], start[1], end[0], end[1]];
        }
        if (this.dirty_bgcanvas || force_background)
            this.drawBackCanvas();
        if (this.dirty_canvas || force_foreground)
            this.drawFrontCanvas();
        this.fps = this.render_time ? (1.0 / this.render_time) : 0;
        this.frame += 1;
    };
    /**
     * Draw front canvas
     */
    Renderer.prototype.drawFrontCanvas = function () {
        if (!this.ctx)
            this.ctx = this.bgcanvas.getContext("2d");
        var ctx = this.ctx;
        if (!ctx)
            return;
        if (this.ctx.start2D)
            this.ctx.start2D(); //check ES6
        var canvas = this.canvas;
        //reset in case of error
        ctx.restore();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        //clip dirty area if there is one, otherwise work in full renderer
        if (this.dirty_area) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.dirty_area[0], this.dirty_area[1], this.dirty_area[2], this.dirty_area[3]);
            ctx.clip();
        }
        //clear
        //renderer.width = renderer.width;
        if (this.clear_background)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        //draw bg renderer
        if (this.bgcanvas == this.canvas)
            this.drawBackCanvas();
        else
            ctx.drawImage(this.bgcanvas, 0, 0);
        //rendering
        if (this.onRender)
            this.onRender(canvas, ctx);
        //info widget
        if (this.show_info)
            this.renderInfo(ctx);
        if (this.container) {
            //apply transformations
            ctx.save();
            ctx.scale(this.scale, this.scale);
            ctx.translate(this.offset[0], this.offset[1]);
            //draw nodes
            var drawn_nodes = 0;
            var visible_nodes = this.computeVisibleNodes();
            this.visible_nodes = visible_nodes;
            for (var i in visible_nodes) {
                var node = visible_nodes[i];
                //transform coords system
                ctx.save();
                ctx.translate(node.pos[0], node.pos[1]);
                //Draw
                this.drawNode(node, ctx);
                drawn_nodes += 1;
                //Restore
                ctx.restore();
            }
            //connections ontop?
            if (this.container.config.links_ontop)
                if (!this.live_mode)
                    this.drawConnections(ctx);
            //current connection
            if (this.connecting_pos != null) {
                ctx.lineWidth = this.connections_width;
                var link_color = this.theme.NEW_LINK_COLOR;
                //this.connecting_output.type == 'node' ? "#F85" : "#AFA";
                this.renderLink(ctx, this.connecting_pos, [this.canvas_mouse[0], this.canvas_mouse[1]], link_color);
                ctx.beginPath();
                ctx.arc(this.connecting_pos[0], this.connecting_pos[1], 4, 0, Math.PI * 2);
                /*
                 if( this.connecting_output.round)
                 ctx.arc( this.connecting_pos[0], this.connecting_pos[1],4,0,Math.PI*2);
                 else
                 ctx.rect( this.connecting_pos[0], this.connecting_pos[1],12,6);
                 */
                ctx.fill();
                ctx.fillStyle = "#ffcc00";
                if (this._highlight_input) {
                    ctx.beginPath();
                    ctx.arc(this._highlight_input[0], this._highlight_input[1], 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }
        if (this.dirty_area) {
            ctx.restore();
        }
        if (this.ctx.finish2D)
            this.ctx.finish2D(); //check ES6
        this.dirty_canvas = false;
    };
    /**
     * Render info
     * @param ctx
     * @param x
     * @param y
     */
    Renderer.prototype.renderInfo = function (ctx, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        ctx.save();
        ctx.translate(x, y);
        ctx.font = "10px Arial";
        ctx.fillStyle = "#888";
        if (this.container) {
            ctx.fillText("T: " + this.container.globaltime.toFixed(2) + "s", 5, 13 * 1);
            ctx.fillText("I: " + this.container.iteration, 5, 13 * 2);
            ctx.fillText("F: " + this.frame, 5, 13 * 3);
            ctx.fillText("FPS:" + this.fps.toFixed(2), 5, 13 * 4);
        }
        else
            ctx.fillText("No container selected", 5, 13 * 1);
        ctx.restore();
    };
    /**
     * Draw back canvas
     */
    Renderer.prototype.drawBackCanvas = function () {
        var canvas = this.bgcanvas;
        if (!this.bgctx)
            this.bgctx = this.bgcanvas.getContext("2d");
        var ctx = this.bgctx;
        if (ctx.start)
            ctx.start();
        //clear
        if (this.clear_background)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        //reset in case of error
        ctx.restore();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (this.container) {
            //apply transformations
            ctx.save();
            ctx.scale(this.scale, this.scale);
            ctx.translate(this.offset[0], this.offset[1]);
            //render BG
            if (this.theme.BG_IMAGE && this.scale > 0.5) {
                ctx.globalAlpha = (1.0 - 0.5 / this.scale) * this.editor_alpha;
                ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = false;
                if (!this._bg_img || this._bg_img.name != this.theme.BG_IMAGE) {
                    this._bg_img = new Image();
                    this._bg_img.name = this.theme.BG_IMAGE;
                    this._bg_img.src = this.theme.BG_IMAGE;
                    var that_1 = this;
                    this._bg_img.onload = function () {
                        that_1.draw(true, true);
                    };
                }
                var pattern = null;
                if (this._pattern == null && this._bg_img.width > 0) {
                    pattern = ctx.createPattern(this._bg_img, 'repeat');
                    this._pattern_img = this._bg_img;
                    this._pattern = pattern;
                }
                else
                    pattern = this._pattern;
                if (pattern) {
                    ctx.fillStyle = pattern;
                    ctx.fillRect(this.visible_area[0], this.visible_area[1], this.visible_area[2] - this.visible_area[0], this.visible_area[3] - this.visible_area[1]);
                    ctx.fillStyle = "transparent";
                }
                ctx.globalAlpha = 1.0;
                ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = true;
            }
            if (this.onBackgroundRender)
                this.onBackgroundRender(canvas, ctx);
            //DEBUG: show clipping area
            //ctx.fillStyle = "red";
            //ctx.fillRect( this.visible_area[0] + 10, this.visible_area[1] + 10, this.visible_area[2] - this.visible_area[0] - 20, this.visible_area[3] - this.visible_area[1] - 20);
            //bg
            //   ctx.strokeStyle = "#235";
            //   ctx.strokeRect(0, 0, renderer.width, renderer.height);
            if (this.render_connections_shadows) {
                ctx.shadowColor = "#000";
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 6;
            }
            else
                ctx.shadowColor = "rgba(0,0,0,0)";
            //draw connections
            if (!this.live_mode)
                this.drawConnections(ctx);
            ctx.shadowColor = "rgba(0,0,0,0)";
            //restore state
            ctx.restore();
        }
        if (ctx.finish)
            ctx.finish();
        this.dirty_bgcanvas = false;
        this.dirty_canvas = true; //to force to repaint the front renderer with the bgcanvas
    };
    /**
     * Draw node
     * @param node
     * @param ctx
     */
    Renderer.prototype.drawNode = function (node, ctx) {
        var glow = false;
        var color = node.color || this.theme.NODE_DEFAULT_COLOR;
        if (node.type == "main/container")
            color = this.theme.CONTAINER_NODE_COLOR;
        else if (node.type == "main/input" || node.type == "main/output")
            color = this.theme.IO_NODE_COLOR;
        //if (this.selected) color = "#88F";
        var render_title = true;
        if (node.flags.skip_title_render)
            render_title = false;
        if (node.mouseOver)
            render_title = true;
        //shadow and glow
        if (node.mouseOver)
            glow = true;
        if (node.selected) {
            ctx.shadowColor = this.theme.SELECTION_COLOR;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = this.theme.SELECTION_WIDTH;
        }
        else if (this.render_shadows) {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowOffsetX = this.shadows_width;
            ctx.shadowOffsetY = this.shadows_width;
            ctx.shadowBlur = 3;
        }
        else
            ctx.shadowColor = "transparent";
        //only render if it forces it to do it
        if (this.live_mode) {
            if (!node.flags.collapsed) {
                ctx.shadowColor = "transparent";
                //if(node.onDrawBackground)
                //	node.onDrawBackground(ctx);
                if (node['onDrawForeground'])
                    node['onDrawForeground'](ctx);
            }
            return;
        }
        //draw in collapsed form
        /*
         if(node.flags.collapsed)
         {
         if(!node.onDrawCollapsed || uiNode.onDrawCollapsed(ctx) == false)
         this.drawNodeCollapsed(node, ctx, color, uiNode.bgcolor);
         return;
         }
         */
        var editor_alpha = this.editor_alpha;
        ctx.globalAlpha = editor_alpha;
        //clip if required (mask)
        var shape = node.shape || this.theme.NODE_DEFAULT_SHAPE;
        var size = [node.size[0], node.size[1]];
        if (node.flags.collapsed) {
            size[0] = this.theme.NODE_COLLAPSED_WIDTH;
            size[1] = 0;
        }
        //Start clipping
        if (node.flags.clip_area) {
            ctx.save();
            if (shape == "box") {
                ctx.beginPath();
                ctx.rect(0, 0, size[0], size[1]);
            }
            else if (shape == "round") {
                ctx.roundRect(0, 0, size[0], size[1], 10);
            }
            else if (shape == "circle") {
                ctx.roundRect(0, 0, size[0], size[1], 10);
            }
            ctx.clip();
        }
        //draw shape
        this.drawNodeShape(node, ctx, size, color, node.bgcolor, !render_title, node.selected);
        ctx.shadowColor = "transparent";
        //connection slots
        ctx.textAlign = "left";
        ctx.font = this.inner_text_font;
        var render_text = this.scale > 0.6;
        //render inputs and outputs
        if (!node.flags.collapsed) {
            //input connection slots
            if (node.inputs)
                for (var i in node.inputs) {
                    var slot = node.inputs[i];
                    ctx.globalAlpha = editor_alpha;
                    //prevent connection of different types
                    //hide not compatible inputs
                    //if (this.connecting_node != null && this.connecting_output.type && node.inputs[i].type && this.connecting_output.type != node.inputs[i].type)
                    //    ctx.globalAlpha = 0.4 * editor_alpha;
                    //hide self inputs
                    if (this.connecting_node == node)
                        ctx.globalAlpha = 0.4 * editor_alpha;
                    ctx.fillStyle = slot.link != null ? "#7F7" : this.theme.DATATYPE_COLOR[slot.type];
                    var pos = this.getConnectionPos(node, true, +i);
                    pos[0] -= node.pos[0];
                    pos[1] -= node.pos[1];
                    ctx.beginPath();
                    if (1 || slot.round)
                        ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
                    //else
                    //	ctx.rect((pos[0] - 6) + 0.5, (pos[1] - 5) + 0.5,14,10);
                    ctx.fill();
                    //render name
                    if (render_text) {
                        var text = slot.label != null ? slot.label : slot.name;
                        if (text) {
                            ctx.fillStyle = slot.isOptional ? this.theme.NODE_OPTIONAL_IO_COLOR : this.theme.NODE_DEFAULT_IO_COLOR;
                            ctx.fillText(text, pos[0] + 10, pos[1] + 5);
                        }
                    }
                }
            //output connection slots
            if (this.connecting_node)
                ctx.globalAlpha = 0.4 * editor_alpha;
            ctx.lineWidth = 1;
            ctx.textAlign = "right";
            ctx.strokeStyle = "black";
            if (node.outputs)
                for (var o in node.outputs) {
                    var slot = node.outputs[o];
                    var pos = this.getConnectionPos(node, false, +o);
                    pos[0] -= node.pos[0];
                    pos[1] -= node.pos[1];
                    ctx.fillStyle = slot.links && slot.links.length ? "#7F7" : this.theme.DATATYPE_COLOR[slot.type];
                    ctx.beginPath();
                    //ctx.rect( node.size[0] - 14,i*14,10,10);
                    if (1 || slot.round)
                        ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
                    //else
                    //	ctx.rect((pos[0] - 6) + 0.5,(pos[1] - 5) + 0.5,14,10);
                    //trigger
                    //if(slot.node_id != null && slot.slot == -1)
                    //	ctx.fillStyle = "#F85";
                    //if(slot.links != null && slot.links.length)
                    ctx.fill();
                    ctx.stroke();
                    //render output name
                    if (render_text) {
                        var text = slot.label != null ? slot.label : slot.name;
                        if (text) {
                            ctx.fillStyle = this.theme.NODE_DEFAULT_IO_COLOR;
                            ctx.fillText(text, pos[0] - 10, pos[1] + 5);
                        }
                    }
                }
            ctx.textAlign = "left";
            ctx.globalAlpha = 1;
            if (node['onDrawForeground'])
                node['onDrawForeground'](ctx);
        } //!collapsed
        if (node.flags.clip_area)
            ctx.restore();
        ctx.globalAlpha = 1.0;
    };
    /**
     * Draw node shape
     * @param node
     * @param ctx
     * @param size
     * @param fgcolor
     * @param bgcolor
     * @param no_title
     * @param selected
     */
    Renderer.prototype.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, no_title, selected) {
        //bg rect
        ctx.strokeStyle = fgcolor || this.theme.NODE_DEFAULT_COLOR;
        ctx.fillStyle = bgcolor || this.theme.NODE_DEFAULT_BGCOLOR;
        if (node.type == "main/container") {
            ctx.strokeStyle = fgcolor || this.theme.CONTAINER_NODE_COLOR;
            ctx.fillStyle = bgcolor || this.theme.CONTAINER_NODE_BGCOLOR;
        }
        else if (node.type == "main/input" || node.type == "main/output") {
            ctx.strokeStyle = fgcolor || this.theme.IO_NODE_COLOR;
            ctx.fillStyle = bgcolor || this.theme.IO_NODE_BGCOLOR;
        }
        /* gradient test
         let grad = ctx.createLinearGradient(0,0,0,node.size[1]);
         grad.addColorStop(0, "#AAA");
         grad.addColorStop(0.5, fgcolor || this.theme.NODE_DEFAULT_COLOR);
         grad.addColorStop(1, bgcolor || this.theme.NODE_DEFAULT_BGCOLOR);
         ctx.fillStyle = grad;
         //*/
        var title_height = this.theme.NODE_TITLE_HEIGHT;
        //render depending on shape
        var shape = node.shape || this.theme.NODE_DEFAULT_SHAPE;
        if (shape == "box") {
            ctx.beginPath();
            ctx.rect(0, no_title ? 0 : -title_height, size[0] + 1, no_title ? size[1] : size[1] + title_height);
            ctx.fill();
        }
        else if (shape == "round") {
            ctx.roundRect(0, no_title ? 0 : -title_height, size[0], no_title ? size[1] : size[1] + title_height, 4);
            ctx.fill();
        }
        else if (shape == "circle") {
            ctx.roundRect(0, no_title ? 0 : -title_height, size[0], no_title ? size[1] : size[1] + title_height, 8);
            ctx.fill();
        }
        ctx.shadowColor = "transparent";
        //ctx.stroke();
        //image
        if (node.bgImage && node.bgImage.width)
            ctx.drawImage(node.bgImage, (size[0] - node.bgImage.width) * 0.5, (size[1] - node.bgImage.height) * 0.5);
        if (node.bgImageUrl && !node.bgImage)
            node.bgImage = this.loadImage(node.bgImageUrl);
        if (node['onDrawBackground'])
            node['onDrawBackground'](ctx);
        //title bg
        if (!no_title) {
            ctx.fillStyle = fgcolor || this.theme.NODE_DEFAULT_COLOR;
            var old_alpha = ctx.globalAlpha;
            //ctx.globalAlpha = 0.5 * old_alpha;
            if (shape == "box") {
                ctx.beginPath();
                ctx.rect(0, -title_height, size[0] + 1, title_height);
                ctx.fill();
            }
            else if (shape == "round") {
                ctx.roundRect(0, -title_height, size[0], title_height, 4, 0);
                //ctx.fillRect(0,8,size[0],NODE_TITLE_HEIGHT - 12);
                ctx.fill();
            }
            else if (shape == "circle") {
                ctx.roundRect(0, -title_height, size[0], title_height, 8, 0);
                //ctx.fillRect(0,8,size[0],NODE_TITLE_HEIGHT - 12);
                ctx.fill();
            }
            //box
            ctx.fillStyle = node.boxcolor || this.theme.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            if (shape == "round" || shape == "circle")
                ctx.arc(title_height * 0.5, title_height * -0.5, (title_height - 6) * 0.5, 0, Math.PI * 2);
            else
                ctx.rect(3, -title_height + 3, title_height - 6, title_height - 6);
            ctx.fill();
            ctx.globalAlpha = old_alpha;
            //title text
            ctx.font = this.title_text_font;
            var title = node.getTitle();
            if (title && this.scale > 0.5) {
                ctx.fillStyle = this.theme.NODE_TITLE_COLOR;
                ctx.fillText(title, 16, 13 - title_height);
            }
        }
    };
    /**
     * Draw node when collapsed
     * @param node
     * @param ctx
     * @param fgcolor
     * @param bgcolor
     */
    Renderer.prototype.drawNodeCollapsed = function (node, ctx, fgcolor, bgcolor) {
        //draw default collapsed shape
        ctx.strokeStyle = fgcolor || this.theme.NODE_DEFAULT_COLOR;
        ctx.fillStyle = bgcolor || this.theme.NODE_DEFAULT_BGCOLOR;
        var collapsed_radius = this.theme.NODE_COLLAPSED_RADIUS;
        //circle shape
        var shape = node.shape || this.theme.NODE_DEFAULT_SHAPE;
        if (shape == "circle") {
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius, node.size[1] * 0.5 - collapsed_radius, 2 * collapsed_radius, 2 * collapsed_radius, 5);
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0)";
            ctx.stroke();
            ctx.fillStyle = node.boxcolor || this.theme.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius * 0.5, node.size[1] * 0.5 - collapsed_radius * 0.5, collapsed_radius, collapsed_radius, 2);
            ctx.fill();
        }
        else if (shape == "round") {
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius, node.size[1] * 0.5 - collapsed_radius, 2 * collapsed_radius, 2 * collapsed_radius, 5);
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0)";
            ctx.stroke();
            ctx.fillStyle = node.boxcolor || this.theme.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius * 0.5, node.size[1] * 0.5 - collapsed_radius * 0.5, collapsed_radius, collapsed_radius, 2);
            ctx.fill();
        }
        else {
            ctx.beginPath();
            //ctx.rect(node.size[0] * 0.5 - collapsed_radius, uiNode.size[1] * 0.5 - collapsed_radius, 2*collapsed_radius, 2*collapsed_radius);
            ctx.rect(0, 0, node.size[0], collapsed_radius * 2);
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0)";
            ctx.stroke();
            ctx.fillStyle = node.boxcolor || this.theme.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            //ctx.rect(node.size[0] * 0.5 - collapsed_radius*0.5, uiNode.size[1] * 0.5 - collapsed_radius*0.5, collapsed_radius,collapsed_radius);
            ctx.rect(collapsed_radius * 0.5, collapsed_radius * 0.5, collapsed_radius, collapsed_radius);
            ctx.fill();
        }
    };
    /**
     * Draw connections
     * @param ctx
     */
    Renderer.prototype.drawConnections = function (ctx) {
        //draw connections
        ctx.lineWidth = this.connections_width;
        ctx.fillStyle = "#AAA";
        ctx.strokeStyle = "#AAA";
        ctx.globalAlpha = this.editor_alpha;
        //for every node
        for (var id in this.container._nodes) {
            var node = this.container._nodes[id];
            //for every input (we render just inputs because it is easier as every slot can only have one input)
            if (node.inputs)
                for (var i in node.inputs) {
                    var input = node.inputs[i];
                    if (!input || !input.link)
                        continue;
                    var start_node = this.container.getNodeById(input.link.target_node_id);
                    if (!start_node)
                        continue;
                    var start_node_slotpos = null;
                    if (input.link.target_slot == -1)
                        start_node_slotpos = [start_node.pos[0] + 10, start_node.pos[1] + 10];
                    else
                        start_node_slotpos = this.getConnectionPos(start_node, false, input.link.target_slot);
                    var color = this.theme.LINK_TYPE_COLORS[node.inputs[i].type];
                    if (color == null && typeof (node.id) == "number")
                        color = this.theme.LINK_COLORS[node.id % this.theme.LINK_COLORS.length];
                    this.renderLink(ctx, start_node_slotpos, this.getConnectionPos(node, true, +i), color);
                }
        }
        ctx.globalAlpha = 1;
    };
    /**
     * Draw link
     * @param ctx
     * @param a
     * @param b
     * @param color
     */
    Renderer.prototype.renderLink = function (ctx, a, b, color) {
        if (!this.highquality_render) {
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
            return;
        }
        var dist = utils_1.default.distance(a, b);
        if (this.render_connections_border && this.scale > 0.6)
            ctx.lineWidth = this.connections_width + this.connections_shadow;
        ctx.beginPath();
        if (this.render_curved_connections) {
            ctx.moveTo(a[0], a[1]);
            ctx.bezierCurveTo(a[0] + dist * 0.25, a[1], b[0] - dist * 0.25, b[1], b[0], b[1]);
        }
        else {
            ctx.moveTo(a[0] + 10, a[1]);
            ctx.lineTo(((a[0] + 10) + (b[0] - 10)) * 0.5, a[1]);
            ctx.lineTo(((a[0] + 10) + (b[0] - 10)) * 0.5, b[1]);
            ctx.lineTo(b[0] - 10, b[1]);
        }
        if (this.render_connections_border && this.scale > 0.6) {
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.stroke();
        }
        ctx.lineWidth = this.connections_width;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.stroke();
        //render arrow
        if (this.render_connection_arrows && this.scale > 0.6) {
            //get two points in the bezier curve
            var pos = this.computeConnectionPoint(a, b, 0.5);
            var pos2 = this.computeConnectionPoint(a, b, 0.51);
            var angle = 0;
            if (this.render_curved_connections)
                angle = -Math.atan2(pos2[0] - pos[0], pos2[1] - pos[1]);
            else
                angle = b[1] > a[1] ? 0 : Math.PI;
            ctx.save();
            ctx.translate(pos[0], pos[1]);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(-5, -5);
            ctx.lineTo(0, +5);
            ctx.lineTo(+5, -5);
            ctx.fill();
            ctx.restore();
        }
    };
    /**
     * Compute connection point
     * @param a
     * @param b
     * @param t
     * @returns {[number,number]}
     */
    Renderer.prototype.computeConnectionPoint = function (a, b, t) {
        var dist = utils_1.default.distance(a, b);
        var p0 = a;
        var p1 = [a[0] + dist * 0.25, a[1]];
        var p2 = [b[0] - dist * 0.25, b[1]];
        var p3 = b;
        var c1 = (1 - t) * (1 - t) * (1 - t);
        var c2 = 3 * ((1 - t) * (1 - t)) * t;
        var c3 = 3 * (1 - t) * (t * t);
        var c4 = t * t * t;
        var x = c1 * p0[0] + c2 * p1[0] + c3 * p2[0] + c4 * p3[0];
        var y = c1 * p0[1] + c2 * p1[1] + c3 * p2[1] + c4 * p3[1];
        return [x, y];
    };
    /*
     NodeEditorCanvas.prototype.resizeCanvas = function(width,height)
     {
     this.renderer.width = width;
     if(height)
     this.renderer.height = height;

     this.bgcanvas.width = this.renderer.width;
     this.bgcanvas.height = this.renderer.height;
     this.draw(true,true);
     }
     */
    /**
     * Resize canvas
     * @param width
     * @param height
     */
    Renderer.prototype.resize = function (width, height) {
        if (!width && !height) {
            var parent_1 = this.canvas.parentNode;
            width = parent_1.offsetWidth; //check ES6
            height = parent_1.offsetHeight;
        }
        if (this.canvas.width == width && this.canvas.height == height)
            return;
        this.canvas.width = width;
        this.canvas.height = height;
        this.bgcanvas.width = this.canvas.width;
        this.bgcanvas.height = this.canvas.height;
        this.setDirty(true, true);
    };
    /**
     * switch live mode
     * @param transition
     */
    Renderer.prototype.switchLiveMode = function (transition) {
        if (!transition) {
            this.live_mode = !this.live_mode;
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
            return;
        }
        var self = this;
        var delta = this.live_mode ? 1.1 : 0.9;
        if (this.live_mode) {
            this.live_mode = false;
            this.editor_alpha = 0.1;
        }
        var t = setInterval(function () {
            self.editor_alpha *= delta;
            self.dirty_canvas = true;
            self.dirty_bgcanvas = true;
            if (delta < 1 && self.editor_alpha < 0.01) {
                clearInterval(t);
                if (delta < 1)
                    self.live_mode = true;
            }
            if (delta > 1 && self.editor_alpha > 0.99) {
                clearInterval(t);
                self.editor_alpha = 1;
            }
        }, 1);
    };
    /**
     *
     * @param node
     */
    Renderer.prototype.onNodeSelectionChange = function (node) {
        return; //disabled
        //if(this.node_in_container) this.showNodePanel(node);
    };
    /**
     *
     * @param event
     */
    Renderer.prototype.touchHandler = function (event) {
        //alert("foo");
        var touches = event.changedTouches, first = touches[0], type = "";
        switch (event.type) {
            case "touchstart":
                type = "mousedown";
                break;
            case "touchmove":
                type = "mousemove";
                break;
            case "touchend":
                type = "mouseup";
                break;
            default:
                return;
        }
        //initMouseEvent(type, canBubble, cancelable, view, clickCount,
        //           screenX, screenY, clientX, clientY, ctrlKey,
        //           altKey, shiftKey, metaKey, button, relatedTarget);
        var window = this.getCanvasWindow();
        var document = window.document;
        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    };
    /**
     * Get canvas menu options
     * @returns {Array}
     */
    Renderer.prototype.getCanvasMenuOptions = function () {
        var options = [];
        if (this.getMenuOptions)
            options = this.getMenuOptions();
        else {
            options.push({ content: "Add", is_menu: true, callback: this.onMenuAdd });
            options.push(null);
            //{content:"Collapse All", callback: NodeEditorCanvas.onMenuCollapseAll }
            options.push({ content: "Import", is_menu: true, callback: this.onMenuImport });
            options.push(null);
            options.push({
                content: "Reset View",
                callback: function () {
                    editor_1.editor.renderer.offset = [0, 0];
                    editor_1.editor.renderer.scale = 1;
                    editor_1.editor.renderer.setZoom(1, [1, 1]);
                }
            });
            options.push({
                content: "Show Map",
                callback: function () {
                    editor_1.editor.addMiniWindow(200, 200);
                }
            });
            var that_2 = this;
            if (this._containers_stack && this._containers_stack.length > 0)
                options.push({
                    content: "Close Container", callback: function () {
                        that_2.closeContainer(true);
                    }
                });
        }
        if (this.getExtraMenuOptions) {
            var extra = this.getExtraMenuOptions(this);
            if (extra) {
                extra.push(null);
                options = extra.concat(options);
            }
        }
        return options;
    };
    /**
     * Get node menu options
     * @param node
     * @returns {Array}
     */
    Renderer.prototype.getNodeMenuOptions = function (node) {
        var options = [];
        if (node.settings && Object.keys(node.settings).length > 0) {
            options.push({
                content: "Settings", callback: function () {
                    editor_1.editor.showNodeSettings(node);
                }
            });
            options.push(null);
        }
        if (node['getMenuOptions'])
            options = node['getMenuOptions'](this);
        if (node['getExtraMenuOptions']) {
            var extra = node['getExtraMenuOptions'](this);
            if (extra) {
                //extra.push(null);
                options = extra.concat(options);
            }
        }
        if (node.clonable !== false)
            options.push({ content: "Clone", callback: this.onMenuNodeClone });
        options.push({
            content: "Description", callback: function () {
                editor_1.editor.showNodeDescription(node);
            }
        });
        options.push({ content: "Collapse", callback: this.onMenuNodeCollapse });
        // if (Object.keys(this.selected_nodes).length>1) {
        if (node.removable !== false)
            options.push({ content: "Move to container", callback: this.onMenuNodeMoveToContainer });
        // }
        if (node.removable !== false)
            options.push({ content: "Remove", callback: this.onMenuNodeRemove });
        if (node['onGetInputs']) {
            var inputs = node['onGetInputs']();
            if (inputs && inputs.length)
                options[0].disabled = false;
        }
        if (node['onGetOutputs']) {
            var outputs = node['onGetOutputs']();
            if (outputs && outputs.length)
                options[1].disabled = false;
        }
        return options;
    };
    /**
     * Process contextual menu
     * @param node
     * @param event
     */
    Renderer.prototype.processContextualMenu = function (node, event) {
        var that = this;
        var win = this.getCanvasWindow();
        var menu_info = null;
        var options = { event: event, callback: inner_option_clicked };
        //check if mouse is in input
        var slot = null;
        if (node)
            slot = this.getSlotInPosition(node, event.canvasX, event.canvasY);
        if (slot) {
        }
        else
            menu_info = node ? this.getNodeMenuOptions(node) : this.getCanvasMenuOptions();
        //show menu
        if (!menu_info)
            return;
        var menu = this.createContextualMenu(menu_info, options, win);
        function inner_option_clicked(v, e) {
            if (!v)
                return;
            if (v == slot) {
                if (v.input)
                    node.removeInput(slot.slot);
                else if (v.output)
                    node.removeOutput(slot.slot);
                return;
            }
            if (v.callback)
                return v.callback(node, e, menu, that, event);
        }
    };
    /**
     * Get file extension
     * @param url
     * @returns {any}
     */
    Renderer.prototype.getFileExtension = function (url) {
        var question = url.indexOf("?");
        if (question != -1)
            url = url.substr(0, question);
        var point = url.lastIndexOf(".");
        if (point == -1)
            return "";
        return url.substr(point + 1).toLowerCase();
    };
    /**
     * On menu add
     * @param node
     * @param e
     * @param prev_menu
     * @param canvas
     * @param first_event
     * @returns {boolean}
     */
    Renderer.prototype.onMenuAdd = function (node, e, prev_menu, canvas, first_event) {
        var window = canvas.getCanvasWindow();
        var values = container_1.Container.getNodeTypesCategories();
        var entries = {};
        for (var i in values)
            if (values[i])
                entries[i] = { value: values[i], content: values[i], is_menu: true };
        var menu = canvas.createContextualMenu(entries, { event: e, callback: inner_clicked, from: prev_menu }, window);
        function inner_clicked(v, e) {
            var category = v.value;
            var node_types = container_1.Container.getNodeTypesInCategory(category);
            var values = [];
            for (var i in node_types) {
                //do ton show container input/output in root container
                if (editor_1.editor.renderer.container.id == 0) {
                    if (node_types[i].type == "main/input"
                        || node_types[i].type == "main/output")
                        continue;
                }
                values.push({ content: node_types[i].node_name, value: node_types[i].type });
            }
            canvas.createContextualMenu(values, { event: e, callback: inner_create, from: menu }, window);
            return false;
        }
        function inner_create(v, e) {
            var type = v.value;
            var pos = canvas.convertEventToCanvas(first_event);
            pos[0] = Math.round(pos[0]);
            pos[1] = Math.round(pos[1]);
            editor_1.editor.socket.sendCreateNode(type, pos);
        }
        return false;
    };
    /**
     * On menu import
     * @param node
     * @param e
     * @param prev_menu
     * @param canvas
     * @param first_event
     * @returns {boolean}
     */
    Renderer.prototype.onMenuImport = function (node, e, prev_menu, canvas, first_event) {
        var window = canvas.getCanvasWindow();
        var entries = {};
        entries[0] = { value: "Container from file", content: "Container from file", is_menu: false };
        entries[1] = { value: "Container from script", content: "Container from script", is_menu: false };
        entries[2] = { value: "Container from URL", content: "Container from URL", is_menu: false };
        var menu = canvas.createContextualMenu(entries, { event: e, callback: inner_clicked, from: prev_menu }, window);
        function inner_clicked(v, e) {
            if (v.value == "Container from file") {
                var pos = canvas.convertEventToCanvas(first_event);
                pos[0] = Math.round(pos[0]);
                pos[1] = Math.round(pos[1]);
                editor_1.editor.importContainerFromFile(pos);
            }
            if (v.value == "Container from script") {
                var pos = canvas.convertEventToCanvas(first_event);
                pos[0] = Math.round(pos[0]);
                pos[1] = Math.round(pos[1]);
                editor_1.editor.importContainerFromScript(pos);
            }
            if (v.value == "Container from URL") {
                var pos = canvas.convertEventToCanvas(first_event);
                pos[0] = Math.round(pos[0]);
                pos[1] = Math.round(pos[1]);
                editor_1.editor.importContainerFromURL(pos);
            }
            canvas.closeAllContextualMenus();
            return false;
        }
        return false;
    };
    /**
     *
     */
    Renderer.prototype.onMenuCollapseAll = function () {
    };
    /**
     *
     */
    Renderer.prototype.onMenuNodeEdit = function () {
    };
    /**
     * On menu node inputs
     * @param node
     * @param e
     * @param prev_menu
     * @returns {boolean}
     */
    Renderer.prototype.onMenuNodeInputs = function (node, e, prev_menu) {
        if (!node)
            return;
        var options = node.optional_inputs;
        if (node['onGetInputs'])
            options = node['onGetInputs']();
        if (options) {
            var entries = [];
            for (var i in options) {
                var entry = options[i];
                var label = entry[0];
                if (entry[2] && entry[2].label)
                    label = entry[2].label;
                entries.push({ content: label, value: entry });
            }
            var menu = this.createContextualMenu(entries, { event: e, callback: inner_clicked, from: prev_menu });
        }
        function inner_clicked(v) {
            if (!node)
                return;
            node.addInput(v.value[0], v.value[1], v.value[2]);
        }
        return false;
    };
    /**
     * On menu node outputs
     * @param node
     * @param e
     * @param prev_menu
     * @returns {boolean}
     */
    Renderer.prototype.onMenuNodeOutputs = function (node, e, prev_menu) {
        if (!node)
            return;
        var options = node.optional_outputs;
        if (node['onGetOutputs'])
            options = node['onGetOutputs']();
        if (options) {
            var entries = [];
            for (var i in options) {
                var entry = options[i];
                if (node.findOutputSlot(entry[0]) != -1)
                    continue; //skip the ones already on
                var label = entry[0];
                if (entry[2] && entry[2].label)
                    label = entry[2].label;
                entries.push({ content: label, value: entry });
            }
            if (entries.length) {
                var menu = this.createContextualMenu(entries, { event: e, callback: inner_clicked, from: prev_menu });
            }
        }
        function inner_clicked(v) {
            if (!node)
                return;
            var value = v.value[1];
            if (value && (value.constructor === Object || value.constructor === Array)) {
                var entries = [];
                for (var i in value)
                    entries.push({ content: i, value: value[i] });
                this.createContextualMenu(entries, { event: e, callback: inner_clicked, from: prev_menu });
                return false;
            }
            else
                node.addOutput(v.value[0], v.value[1], v.value[2]);
        }
        return false;
    };
    /**
     * On menu collapse
     * @param node
     */
    Renderer.prototype.onMenuNodeCollapse = function (node) {
        node.flags.collapsed = !node.flags.collapsed;
        node.setDirtyCanvas(true, true);
    };
    /**
     * On menu node colors
     * @param node
     * @param e
     * @param prev_menu
     * @returns {boolean}
     */
    Renderer.prototype.onMenuNodeColors = function (node, e, prev_menu) {
        var values = [];
        for (var i in this.theme.NODE_COLORS) {
            var color = this.theme.NODE_COLORS[i];
            var value = {
                value: i,
                content: "<span style='display: block; color:" + color.color + "; background-color:" + color.bgcolor + "'>" + i + "</span>"
            };
            values.push(value);
        }
        this.createContextualMenu(values, { event: e, callback: inner_clicked, from: prev_menu });
        function inner_clicked(v) {
            if (!node)
                return;
            var color = this.node_colors[v.value];
            if (color) {
                node.color = color.color;
                node.bgcolor = color.bgcolor;
                node.setDirtyCanvas(true);
            }
        }
        return false;
    };
    /**
     * On menu node shapes
     * @param node
     * @param e
     * @returns {boolean}
     */
    Renderer.prototype.onMenuNodeShapes = function (node, e) {
        this.createContextualMenu(["box", "round"], { event: e, callback: inner_clicked });
        function inner_clicked(v) {
            if (!node)
                return;
            node.shape = v;
            node.setDirtyCanvas(true);
        }
        return false;
    };
    /**
     * On menu node remove
     * @param node
     * @param e
     * @param prev_menu
     * @param renderer
     * @param first_event
     */
    Renderer.prototype.onMenuNodeRemove = function (node, e, prev_menu, renderer, first_event) {
        if (node.id in renderer.selected_nodes) {
            var ids = [];
            for (var n in renderer.selected_nodes)
                ids.push(n);
            editor_1.editor.socket.sendRemoveNodes(ids);
        }
        else
            editor_1.editor.socket.sendRemoveNodes([node.id]);
    };
    Renderer.prototype.onMenuNodeMoveToContainer = function (node, e, prev_menu, renderer, first_event) {
        if (node.id in renderer.selected_nodes) {
            var ids = [];
            for (var n in renderer.selected_nodes)
                ids.push(n);
            editor_1.editor.socket.sendMoveToNewContainer(ids, node.pos);
        }
        else
            editor_1.editor.socket.sendMoveToNewContainer([node.id], node.pos);
    };
    /**
     * On menu node clone
     * @param node
     */
    Renderer.prototype.onMenuNodeClone = function (node, e, prev_menu, renderer, first_event) {
        if (node.id in renderer.selected_nodes) {
            var ids = [];
            for (var n in renderer.selected_nodes)
                ids.push(n);
            editor_1.editor.socket.sendCloneNode(ids);
        }
        else
            editor_1.editor.socket.sendCloneNode([node.id]);
    };
    /**
     * Create contextual menu
     * @param values
     * @param options
     * @param ref_window
     * @returns {HTMLDivElement}
     */
    Renderer.prototype.createContextualMenu = function (values, options, ref_window) {
        options = options || {};
        this.options = options;
        //allows to create container renderer in separate window
        ref_window = ref_window || window;
        if (!options.from)
            this.closeAllContextualMenus();
        else {
            //closing submenus
            //derwish edit
            var menus = document.querySelectorAll(".contextualmenu");
            for (var key in menus) {
                // todo ES6
                if (menus[key].previousSibling == options.from)
                    menus[key].closeMenu();
            }
        }
        var root = ref_window.document.createElement("div");
        root.className = "contextualmenu menubar-panel";
        this.root = root;
        var style = root.style;
        style.minWidth = "100px";
        style.minHeight = "20px";
        style.position = "fixed";
        style.top = "100px";
        style.left = "100px";
        style.color = this.theme.MENU_TEXT_COLOR;
        style.padding = "2px";
        style.borderBottom = "1px solid " + this.theme.MENU_TEXT_COLOR;
        style.backgroundColor = this.theme.MENU_BG_COLOR;
        //title
        if (options.title) {
            var element = document.createElement("div");
            element.className = "contextualmenu-title";
            element.innerHTML = options.title;
            root.appendChild(element);
        }
        //avoid a context menu in a context menu
        root.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            return false;
        });
        for (var i in values) {
            var item = values[i];
            var element = ref_window.document.createElement("div");
            element.className = "menu-entry";
            if (item == null) {
                element.className = "menu-entry separator";
                root.appendChild(element);
                continue;
            }
            if (item.is_menu)
                element.className += " submenu";
            if (item.disabled)
                element.className += " disabled";
            element.style.cursor = "pointer";
            element.dataset["value"] = typeof (item) == "string" ? item : item.value;
            element.data = item;
            if (typeof (item) == "string")
                element.innerHTML = values.constructor == Array ? values[i] : i;
            else
                element.innerHTML = item.content ? item.content : i;
            element.addEventListener("click", on_click);
            root.appendChild(element);
        }
        root.addEventListener("mouseover", function (e) {
            this.mouse_inside = true;
        });
        root.addEventListener("mouseout", function (e) {
            //check if mouse leave a inner element
            var aux = e.relatedTarget || e.toElement;
            // while (aux != this && aux != ref_window.document)
            //     aux = (<any>aux).parentNode;
            if (aux == this)
                return;
            this.mouse_inside = false;
        });
        //insert before checking position
        ref_window.document.body.appendChild(root);
        var root_rect = root.getClientRects()[0];
        //link menus
        if (options.from) {
            options.from.block_close = true;
        }
        var left = options.left || 0;
        var top = options.top || 0;
        if (options.event) {
            left = (options.event.pageX - 10);
            top = (options.event.pageY - 10);
            if (options.left)
                left = options.left;
            var rect = ref_window.document.body.getClientRects()[0];
            if (options.from) {
                var parent_rect = options.from.getClientRects()[0];
                left = parent_rect.left + parent_rect.width;
            }
            if (left > (rect.width - root_rect.width - 10))
                left = (rect.width - root_rect.width - 10);
            if (top > (rect.height - root_rect.height - 10))
                top = (rect.height - root_rect.height - 10);
        }
        root.style.left = left + "px";
        root.style.top = top + "px";
        var that = this;
        function on_click(e) {
            var value = this.dataset["value"];
            var close = true;
            if (options.callback) {
                var ret = options.callback.call(root, this.data, e);
                if (ret !== undefined)
                    close = ret;
            }
            if (close) {
                that.closeAllContextualMenus();
            }
            //root.closeMenu();
        }
        root.closeMenu = function () {
            if (options.from) {
                options.from.block_close = false;
                if (!options.from.mouse_inside)
                    options.from.closeMenu();
            }
            if (this.parentNode)
                ref_window.document.body.removeChild(this);
        };
        return root;
    };
    /**
     * Clone all contextual menus
     */
    Renderer.prototype.closeAllContextualMenus = function () {
        var elements = document.querySelectorAll(".contextualmenu");
        if (!elements.length)
            return;
        var result = [];
        for (var i = 0; i < elements.length; i++)
            result.push(elements[i]);
        for (var i in result)
            if (result[i].parentNode)
                result[i].parentNode.removeChild(result[i]);
    };
    /**
     * Returns the center of a connection point in renderer coords
     * @param is_input true if if a input slot, false if it is an output
     * @param slot (could be the number of the slot or the string with the name of the slot)
     * @returns {[x,y]} the position
     **/
    Renderer.prototype.getConnectionPos = function (node, is_input, slot_number) {
        if (node.flags.collapsed) {
            if (is_input)
                return [node.pos[0], node.pos[1] - this.theme.NODE_TITLE_HEIGHT * 0.5];
            else
                return [node.pos[0] + this.theme.NODE_COLLAPSED_WIDTH, node.pos[1] - this.theme.NODE_TITLE_HEIGHT * 0.5];
        }
        if (is_input && slot_number == -1) {
            return [node.pos[0] + 10, node.pos[1] + 10];
        }
        if (is_input && node.inputs[slot_number] && node.inputs[slot_number].pos)
            return [node.pos[0] + node.inputs[slot_number].pos[0], node.pos[1] + node.inputs[slot_number].pos[1]];
        else if (!is_input && node.outputs[slot_number] && node.outputs[slot_number].pos)
            return [node.pos[0] + node.outputs[slot_number].pos[0], node.pos[1] + node.outputs[slot_number].pos[1]];
        if (!is_input)
            return [node.pos[0] + node.size[0] + 1, node.pos[1] + 10 + slot_number * this.theme.NODE_SLOT_HEIGHT];
        return [node.pos[0], node.pos[1] + 10 + slot_number * this.theme.NODE_SLOT_HEIGHT];
    };
    Renderer.prototype.loadImage = function (url) {
        var img = new Image();
        img.src = this.theme.NODE_IMAGES_PATH + url;
        img.ready = false;
        img.onload = function () {
            this.ready = true;
        };
        return img;
    };
    /**
     * Returns the bounding of the object, used for rendering purposes
     * @returns {[number, number, number, number]} the total size
     */
    Renderer.prototype.getBounding = function (node) {
        return [node.pos[0] - 4, node.pos[1] - this.theme.NODE_TITLE_HEIGHT, node.pos[0] + node.size[0] + 4, node.pos[1] + node.size[1] + this.theme.NODE_TITLE_HEIGHT];
    };
    /**
     * Checks if a point is inside the shape of a node
     * @param x
     * @param y
     * @param margin
     * @returns {boolean}
     */
    Renderer.prototype.isPointInsideNode = function (node, x, y, margin) {
        margin = margin || 0;
        // let margin_top = node.container ? 0 : 20;
        var margin_top = 20;
        if (node.flags.collapsed) {
            //if ( distance([x,y], [node.pos[0] + node.size[0]*0.5, node.pos[1] + node.size[1]*0.5]) < Nodes.NODE_COLLAPSED_RADIUS)
            if (utils_1.default.isInsideRectangle(x, y, node.pos[0] - margin, node.pos[1] - this.theme.NODE_TITLE_HEIGHT - margin, this.theme.NODE_COLLAPSED_WIDTH + 2 * margin, this.theme.NODE_TITLE_HEIGHT + 2 * margin))
                return true;
        }
        else if ((node.pos[0] - 4 - margin) < x && (node.pos[0] + node.size[0] + 4 + margin) > x
            && (node.pos[1] - margin_top - margin) < y && (node.pos[1] + node.size[1] + margin) > y)
            return true;
        return false;
    };
    /**
     * Checks if a point is inside a node slot, and returns info about which slot
     * @param x
     * @param y
     * @returns {IInputInfo|IOutputInfo} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
     */
    Renderer.prototype.getSlotInPosition = function (node, x, y) {
        //search for inputs
        if (node.inputs)
            for (var i in node.inputs) {
                var input = node.inputs[i];
                var link_pos = this.getConnectionPos(node, true, +i);
                if (utils_1.default.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                    return { input: input, slot: +i, link_pos: link_pos, locked: input.locked };
            }
        if (node.outputs)
            for (var o in node.outputs) {
                var output = node.outputs[o];
                var link_pos = this.getConnectionPos(node, false, +o);
                if (utils_1.default.isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10))
                    return { output: output, slot: +o, link_pos: link_pos, locked: output.locked };
            }
        return null;
    };
    /**
     * Returns the top-most node in this position of the renderer
     * @param x the x coordinate in renderer space
     * @param y the y coordinate in renderer space
     * @param nodes_list a list with all the nodes to search from, by default is all the nodes in the container
     * @returns a list with all the nodes that intersect this coordinate
     */
    Renderer.prototype.getNodeOnPos = function (x, y, nodes_list) {
        if (nodes_list) {
            for (var i = nodes_list.length - 1; i >= 0; i--) {
                var n = nodes_list[i];
                if (this.isPointInsideNode(n, x, y, 2))
                    return n;
            }
        }
        else {
            for (var id in this.container._nodes) {
                var node = this.container._nodes[id];
                if (this.isPointInsideNode(node, x, y, 2))
                    return node;
            }
        }
        return null;
    };
    Renderer.prototype.localToScreen = function (node, x, y, canvas) {
        return [(x + node.pos[0]) * canvas.scale + canvas.offset[0],
            (y + node.pos[1]) * canvas.scale + canvas.offset[1]];
    };
    Renderer.prototype.showNodeActivity = function (node) {
        node.boxcolor = this.theme.NODE_ACTIVE_BOXCOLOR;
        node.setDirtyCanvas(true, true);
        setTimeout(function () {
            node.boxcolor = this.theme.NODE_DEFAULT_BOXCOLOR;
            node.setDirtyCanvas(true, true);
        }, 100);
    };
    return Renderer;
}());
exports.Renderer = Renderer;
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, radius_low) {
    if (radius === void 0) { radius = 5; }
    if (radius_low === undefined)
        radius_low = radius;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius_low);
    this.quadraticCurveTo(x + width, y + height, x + width - radius_low, y + height);
    this.lineTo(x + radius_low, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius_low);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
};
if (!window["requestAnimationFrame"]) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        (function (callback) {
            window.setTimeout(callback, 1000 / 60);
        });
}
