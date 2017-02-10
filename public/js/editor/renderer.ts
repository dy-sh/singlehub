///<reference path='../../../types/my_types.d.ts'/>

/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */

import {Node, Nodes, NodeOutput, IInputInfo, IOutputInfo} from "../../nodes/nodes"
import {NodesEngine, engine} from "../../nodes/nodes-engine"
import {NodeEditor, editor} from "./node-editor";
import {EditorSocket} from "./editor-socket";
import Utils from "../../nodes/utils";
import {Container} from "../../nodes/nodes/base";

interface IgetMenuOptions {
    (): Array<any>;
}

interface IenableWebGLCanvas {
    (any): any;
}

interface IgetExtraMenuOptions {
    (any): any;
}


export class Renderer {
    editor: NodeEditor;
    socket: EditorSocket;
    max_zoom: number;
    min_zoom: number;
    frame: number;
    last_draw_time: number;
    render_time: number;
    fps: number;
    scale: number;
    offset: [number, number];
    selected_nodes: {[id: number]: Node};
    node_dragged: Node;
    node_over: Node;
    node_capturing_input: Node;
    connecting_node: Node;
    highquality_render: boolean;
    editor_alpha: number;
    pause_rendering: boolean;
    render_shadows: boolean;
    shadows_width: number;
    clear_background: boolean;
    render_only_selected: boolean;
    live_mode: boolean;
    show_info: boolean;
    allow_dragcanvas: boolean;
    allow_dragnodes: boolean;
    dirty_canvas: boolean;
    dirty_bgcanvas: boolean;
    dirty_area: [number, number, number, number];
    node_in_container: Node;
    last_mouse: [number, number];
    last_mouseclick: number;
    title_text_font: string;
    inner_text_font: string;
    render_connections_shadows: boolean;
    render_connections_border: boolean;
    render_curved_connections: boolean;
    render_connection_arrows: boolean;
    connections_width: number;
    connections_shadow: number;
    onClear: Function;
    engine: NodesEngine;
    _engine_stack: Array<NodesEngine>;
    canvas: HTMLCanvasElement;
    bgcanvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D |null;
    _mousemove_callback: EventListenerOrEventListenerObject;
    _mouseup_callback: EventListenerOrEventListenerObject;
    _events_binded: boolean;
    _mousedown_callback: EventListenerOrEventListenerObject;
    _mousewheel_callback: EventListenerOrEventListenerObject;
    _key_callback: EventListenerOrEventListenerObject;
    _ondrop_callback: EventListenerOrEventListenerObject;
    GL: CanvasRenderingContext2D;
    gl: CanvasRenderingContext2D;
    is_rendering: boolean;
    visible_nodes: Array<Node>;
    connecting_output: NodeOutput;
    connecting_pos: [number, number];
    connecting_slot: number;
    resizing_node: Node;
    dragging_canvas: boolean;
    canvas_mouse: [number, number];
    _highlight_input: [number, number];
    onDropItem: Function;
    onNodeSelected: Function;
    onNodeDeselected: Function;
    onShowNodePanel: Function;
    onNodeDblClicked: Function;
    visible_area: [number, number, number, number];
    last__time: number;
    onRender: Function;
    bgctx: CanvasRenderingContext2D;
    _bg_img: HTMLImageElement;
    _pattern: CanvasPattern;
    _pattern_img: HTMLImageElement;
    onBackgroundRender: Function;
    getMenuOptions: IgetMenuOptions;
    enableWebGLCanvas: IenableWebGLCanvas;
    getExtraMenuOptions: IgetExtraMenuOptions;


    options: any;
    root: HTMLDivElement;


    constructor(canvas: HTMLCanvasElement, socket: EditorSocket, editor: NodeEditor, engine?: NodesEngine, skip_render?) {
        this.socket = socket;
        this.editor = editor;

        //derwish edit
        this.max_zoom = 2;
        this.min_zoom = 0.1;

        //link renderer and engine
        if (engine)
            engine.attachRenderer(this);

        this.setCanvas(canvas);
        this.clear();

        if (!skip_render)
            this.startRendering();

    }

    /**
     * Clears all the data inside
     */
    clear(): void {
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
        this.shadows_width = Nodes.options.SHADOWS_WIDTH;
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

        this.title_text_font = Nodes.options.TITLE_TEXT_FONT;
        this.inner_text_font = Nodes.options.INNER_TEXT_FONT;

        this.render_connections_shadows = false; //too much cpu
        this.render_connections_border = true;
        this.render_curved_connections = true;
        this.render_connection_arrows = Nodes.options.RENDER_CONNECTION_ARROWS;

        this.connections_width = Nodes.options.CONNECTIONS_WIDTH;
        this.connections_shadow = Nodes.options.CONNECTIONS_SHADOW;

        if (this.onClear) this.onClear();
        //this.UIinit();

        if (this.onClear) this.onClear();

    }

    /**
     * Assigns a engine, you can reasign engines to the same renderer
     * @param engine
     * @param skip_clear
     */
    setEngine(engine?: NodesEngine, skip_clear = false): void {
        if (this.engine == engine)
            return;

        if (!skip_clear)
            this.clear();

        if (!engine && this.engine) {
            this.engine.detachRenderer(this);
            return;
        }

        /*
         if(this.engine)
         this.engine.renderer = null; //remove old engine link to the renderer
         this.engine = engine;
         if(this.engine)
         this.engine.renderer = this;
         */
        engine.attachRenderer(this);
        this.setDirty(true, true);
    }

    /**
     * Open container
     * @param container node
     */
    openContainer(container: Container): void {
        let engine = container.container_engine;
        if (!engine)
            throw ("engine cannot be null");

        if (this.engine == engine)
            throw ("engine cannot be the same");

        this.clear();

        if (this.engine) {
            if (!this._engine_stack)
                this._engine_stack = [];
            this._engine_stack.push(this.engine);
        }

        engine.attachRenderer(this);
        this.setDirty(true, true);
    }

    /**
     * Close container
     */
    closeContainer(): void {
        if (!this._engine_stack || this._engine_stack.length == 0)
            return;
        let engine = this._engine_stack.pop();
        engine.attachRenderer(this);
        this.setDirty(true, true);
    }

    /**
     * Assigns a canvas
     * @param canvas
     * @param skip_events
     */
    setCanvas(canvas: HTMLCanvasElement, skip_events = false): void {
        let that = this;

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
        (<any>canvas).data = this;

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

        let ctx = this.ctx = canvas.getContext("2d");
        if (ctx == null) {
            console.warn("This canvas seems to be WebGL, enabling WebGL renderer");
            this.enableWebGL();
        }

        //input:  (move and up could be unbinded)
        this._mousemove_callback = this.processMouseMove.bind(this);
        this._mouseup_callback = this.processMouseUp.bind(this);

        if (!skip_events)
            this.bindEvents();
    }

    /**
     * Used in some events to capture them
     * @param e
     * @returns {boolean}
     * @private
     */
    _doNothing(e): boolean {
        e.preventDefault();
        return false;
    }

    /**
     *
     * @param e
     * @returns {boolean}
     * @private
     */
    _doReturnTrue(e): boolean {
        e.preventDefault();
        return true;
    }

    /**
     *
     */
    bindEvents(): void {
        if (this._events_binded) {
            console.warn("Renderer: events already binded");
            return;
        }

        let canvas = this.canvas;

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
    }

    /**
     *
     */
    unbindEvents(): void {
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
    }


    /**
     * Allows to render the renderer using WebGL instead of Canvas2D
     * This is useful if you plant to render 3D objects inside your nodes
     */
    enableWebGL(): void {
        if (typeof (this.GL) === undefined)
            throw ("litegl.js must be included to use a WebGL canvas");
        if (typeof (this.enableWebGLCanvas) === undefined)
            throw ("webglCanvas.js must be included to use this feature");

        this.gl = this.ctx = this.enableWebGLCanvas(this.canvas);
        (<any>this.ctx).webgl = true;//check ES6
        this.bgcanvas = this.canvas;
        this.bgctx = this.gl;

        /*
         GL.create({ renderer: this.bgcanvas });
         this.bgctx = enableWebGLCanvas( this.bgcanvas );
         window.gl = this.gl;
         */
    }

    /**
     * Marks as dirty the renderer, this way it will be rendered again
     * @param foregraund if the foreground renderer is dirty (the one containing the nodes)
     * @param background if the background renderer is dirty (the one containing the wires)
     */
    setDirty(foregraund: boolean, background: boolean = false): void {
        if (foregraund)
            this.dirty_canvas = true;
        if (background)
            this.dirty_bgcanvas = true;
    }

    /**
     * Used to attach the renderer in a popup
     * @returns {window} returns the window where the renderer is attached (the DOM root node)
     */
    getCanvasWindow(): Window {
        let doc = this.canvas.ownerDocument;
        return doc.defaultView || (<any>doc).parentWindow;//check ES6
    }

    /**
     * starts rendering the content of the renderer when needed
     */
    startRendering(): void {
        if (this.is_rendering) return; //already rendering

        this.is_rendering = true;
        renderFrame.call(this);

        function renderFrame() {

            if (!this.pause_rendering)
                this.draw();

            let window = this.getCanvasWindow();
            if (this.is_rendering)
                window.requestAnimationFrame(renderFrame.bind(this));
        }
    }

    /**
     * Stops rendering the content of the renderer (to save resources)
     */
    stopRendering(): void {
        this.is_rendering = false;
        /*
         if(this.rendering_timer_id)
         {
         clearInterval(this.rendering_timer_id);
         this.rendering_timer_id = null;
         }
         */
    }

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
    processMouseDown(e): boolean {
        if (!this.engine)
            return;

        this.adjustMouseEvent(e);

        let ref_window = this.getCanvasWindow();
        let document = ref_window.document;

        //move mouse move event to the window in case it drags outside of the renderer
        this.canvas.removeEventListener("mousemove", this._mousemove_callback);
        ref_window.document.addEventListener("mousemove", this._mousemove_callback, true); //catch for the entire window
        ref_window.document.addEventListener("mouseup", this._mouseup_callback, true);

        let n = this.engine.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);
        let skip_dragging = false;

        //derwish added
        this.closeAllContextualMenus();

        if (e.which == 1) //left button mouse
        {
            if (!e.shiftKey) //REFACTOR: integrate with function
            {
                //derwish edit
                //no node or another node selected
                if (!n || !this.selected_nodes[n.id]) {

                    let todeselect = [];
                    for (let i in this.selected_nodes)
                        if (this.selected_nodes[i] != n)
                            todeselect.push(this.selected_nodes[i]);
                    //two passes to avoid problems modifying the container
                    for (let i in todeselect)
                        this.processNodeDeselected(todeselect[i]);
                }
            }
            let clicking_canvas_bg = false;

            //when clicked on top of a node
            //and it is not interactive
            if (n) {
                if (!this.live_mode && !n.flags.pinned)
                    this.bringToFront(n); //if it wasnt selected?
                let skip_action = false;

                //not dragging mouse to connect two slots
                if (!this.connecting_node && !n.flags.collapsed && !this.live_mode) {
                    //search for outputs
                    if (n.outputs)
                        for (let i = 0, l = n.outputs.length; i < l; ++i) {
                            let output = n.outputs[i];
                            let link_pos = n.getConnectionPos(false, i);
                            if (Utils.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                                this.connecting_node = n;
                                this.connecting_output = output;
                                this.connecting_pos = n.getConnectionPos(false, i);
                                this.connecting_slot = i;

                                skip_action = true;
                                break;
                            }
                        }

                    //search for inputs
                    if (n.inputs)
                        for (let i = 0, l = n.inputs.length; i < l; ++i) {
                            let input = n.inputs[i];
                            let link_pos = n.getConnectionPos(true, i);
                            if (Utils.isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                                if (input.link !== null) {
                                    this.socket.sendRemoveLink(engine.links[input.link]);

                                    //n.disconnectInput(i);
                                    //this.dirty_bgcanvas = true;

                                    skip_action = true;
                                }
                            }
                        }

                    //Search for corner
                    //derwish edit 5 to 10
                    if (!skip_action && Utils.isInsideRectangle(e.canvasX, e.canvasY, n.pos[0] + n.size[0] - 10, n.pos[1] + n.size[1] - 10, 10, 10)) {
                        this.resizing_node = n;
                        this.canvas.style.cursor = "se-resize";
                        skip_action = true;
                    }
                }

                //Search for corner
                if (!skip_action && Utils.isInsideRectangle(e.canvasX, e.canvasY, n.pos[0], n.pos[1] - Nodes.options.NODE_TITLE_HEIGHT, Nodes.options.NODE_TITLE_HEIGHT, Nodes.options.NODE_TITLE_HEIGHT)) {
                    n.collapse();
                    skip_action = true;
                }

                //it wasnt clicked on the links boxes
                if (!skip_action) {
                    let block_drag_node = false;

                    //double clicking
                    let now = Nodes.getTime();
                    if ((now - this.last_mouseclick) < 300 && this.selected_nodes[n.id]) {
                        //double click node
                        if (n.onDblClick)
                            n.onDblClick(e);
                        this.processNodeDblClicked(n);
                        block_drag_node = true;
                    }

                    //if do not capture mouse

                    if (n.onMouseDown && n.onMouseDown(e))
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
        else if (e.which == 2) //middle button
        {

        }
        else if (e.which == 3) //right button
        {
            this.processContextualMenu(n, e);
        }

        //TODO
        //if(this.node_selected != prev_selected)
        //	this.onNodeSelectionChange(this.node_selected);

        this.last_mouse[0] = e.localX;
        this.last_mouse[1] = e.localY;
        this.last_mouseclick = Nodes.getTime();
        this.canvas_mouse = [e.canvasX, e.canvasY];

        /*
         if( (this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
         this.draw();
         */

        this.engine.change();

        //this is to ensure to defocus(blur) if a text input element is on focus
        if (!ref_window.document.activeElement || (ref_window.document.activeElement.nodeName.toLowerCase() != "input" && ref_window.document.activeElement.nodeName.toLowerCase() != "textarea"))
            e.preventDefault();
        e.stopPropagation();
        return false;
    }


    /**
     * Process mouse move
     * @param e
     * @returns {boolean}
     */
    processMouseMove(e): boolean {
        if (!this.engine) return;

        this.adjustMouseEvent(e);
        let mouse: [number, number] = [e.localX, e.localY];
        let delta = [mouse[0] - this.last_mouse[0], mouse[1] - this.last_mouse[1]];
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
            let n = this.engine.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

            //remove mouseover flag
            for (let i in this.engine._nodes) {
                if (this.engine._nodes[i].mouseOver && n != this.engine._nodes[i]) {
                    //mouse leave
                    this.engine._nodes[i].mouseOver = false;
                    if (this.node_over && this.node_over.onMouseLeave)
                        this.node_over.onMouseLeave(e);
                    this.node_over = null;
                    this.dirty_canvas = true;
                }
            }

            //mouse over a node
            if (n) {
                //this.renderer.style.cursor = "move";
                if (!n.mouseOver) {
                    //mouse enter
                    n.mouseOver = true;
                    this.node_over = n;
                    this.dirty_canvas = true;

                    if (n.onMouseEnter) n.onMouseEnter(e);
                }

                if (n.onMouseMove) n.onMouseMove(e);

                //ontop of input
                if (this.connecting_node) {
                    let pos = this._highlight_input || [0, 0];
                    let slot = this.isOverNodeInput(n, e.canvasX, e.canvasY, pos);
                    if (slot != -1 && n.inputs[slot]) {

                        //prevent connection different types
                        //let slot_type = n.inputs[slot].type;
                        //if (!this.connecting_output.type || !slot_type || slot_type == this.connecting_output.type)
                        this._highlight_input = pos;
                    }
                    else
                        this._highlight_input = null;
                }

                //Search for corner
                //derwish edit 5 to 10
                if (Utils.isInsideRectangle(e.canvasX, e.canvasY, n.pos[0] + n.size[0] - 10, n.pos[1] + n.size[1] - 10, 10, 10))
                    this.canvas.style.cursor = "se-resize";
                else
                    this.canvas.style.cursor = null;
            }
            else
                this.canvas.style.cursor = null;

            if (this.node_capturing_input && this.node_capturing_input != n && this.node_capturing_input.onMouseMove) {
                this.node_capturing_input.onMouseMove(e);
            }


            if (this.node_dragged && !this.live_mode) {
                /*
                 this.node_dragged.pos[0] += delta[0] / this.scale;
                 this.node_dragged.pos[1] += delta[1] / this.scale;
                 this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
                 this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
                 */

                for (let i in this.selected_nodes) {
                    let n = this.selected_nodes[i];

                    n.pos[0] += delta[0] / this.scale;
                    n.pos[1] += delta[1] / this.scale;

                    //derwish added
                    n.pos[0] = Math.round(n.pos[0]);
                    n.pos[1] = Math.round(n.pos[1]);
                }

                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
            }

            if (this.resizing_node && !this.live_mode) {
                this.resizing_node.size[0] += delta[0] / this.scale;
                //this.resizing_node.size[1] += delta[1] / this.scale;
                let max_slots = Math.max(this.resizing_node.inputs ? this.resizing_node.inputs.length : 0, this.resizing_node.outputs ? this.resizing_node.outputs.length : 0);
                //	if(this.resizing_node.size[1] < max_slots * Nodes.options.NODE_SLOT_HEIGHT + 4)
                //		this.resizing_node.size[1] = max_slots * Nodes.options.NODE_SLOT_HEIGHT + 4;
                if (this.resizing_node.size[0] < Nodes.options.NODE_MIN_WIDTH)
                    this.resizing_node.size[0] = Nodes.options.NODE_MIN_WIDTH;

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
        //this.engine.change();
    }

    /**
     * Process mouse up
     * @param e
     * @returns {boolean}
     */
    processMouseUp(e): boolean {
        if (!this.engine)
            return;

        let window = this.getCanvasWindow();
        let document = window.document;

        //restore the mousemove event back to the renderer
        document.removeEventListener("mousemove", this._mousemove_callback, true);
        this.canvas.addEventListener("mousemove", this._mousemove_callback, true);
        document.removeEventListener("mouseup", this._mouseup_callback, true);

        this.adjustMouseEvent(e);

        if (e.which == 1) //left button
        {
            //dragging a connection
            if (this.connecting_node) {
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;

                let node = this.engine.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

                //node below mouse
                if (node) {

                    if (this.connecting_output.type == 'node') {
                        this.connecting_node.connect(this.connecting_slot, node, -1);
                    }
                    else {
                        //slot below mouse? connect
                        let slot = this.isOverNodeInput(node, e.canvasX, e.canvasY);

                        this.socket.sendCreateLink(
                            this.connecting_node.id, this.connecting_slot,
                            node.id, slot
                        );

                        // if (slot != -1) {
                        //     this.connecting_node.connect(this.connecting_slot, node, slot);
                        // }
                    }
                }

                this.connecting_output = null;
                this.connecting_pos = null;
                this.connecting_node = null;
                this.connecting_slot = -1;
                this._highlight_input = null;

            }//not dragging connection
            else if (this.resizing_node) {
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;

                this.socket.sendUpdateNodeSize(this.resizing_node);

                this.resizing_node = null;
            }
            else if (this.node_dragged) //node being dragged?
            {
                this.dirty_canvas = true;
                this.dirty_bgcanvas = true;
                this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
                this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
                if (this.engine.config.align_to_grid)
                    this.node_dragged.alignToGrid();

                for (let i in this.selected_nodes) {
                    this.selected_nodes[i].size[0] = Math.round(this.selected_nodes[i].size[0]);
                    this.selected_nodes[i].size[1] = Math.round(this.selected_nodes[i].size[1]);
                    this.socket.sendUpdateNodePosition(this.selected_nodes[i]);
                }

                this.node_dragged = null;
            }
            else //no node being dragged
            {
                this.dirty_canvas = true;
                this.dragging_canvas = false;

                if (this.node_over && this.node_over.onMouseUp)
                    this.node_over.onMouseUp(e);
                if (this.node_capturing_input && this.node_capturing_input.onMouseUp)
                    this.node_capturing_input.onMouseUp(e);
            }
        }
        else if (e.which == 2) //middle button
        {
            //trace("middle");
            this.dirty_canvas = true;
            this.dragging_canvas = false;
        }
        else if (e.which == 3) //right button
        {
            //trace("right");
            this.dirty_canvas = true;
            this.dragging_canvas = false;
        }

        /*
         if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
         this.draw();
         */

        this.engine.change();

        e.stopPropagation();
        e.preventDefault();
        return false;
    }


    /**
     * Process mouse wheel
     * @param e
     * @returns {boolean}
     */
    processMouseWheel(e): boolean {
        if (!this.engine || !this.allow_dragcanvas)
            return;


        let delta = (e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60);

        this.adjustMouseEvent(e);

        let zoom = this.scale;

        if (delta > 0)
            zoom *= 1.1;
        else if (delta < 0)
            zoom *= 1 / (1.1);

        this.setZoom(zoom, [e.localX, e.localY]);


        /*
         if(this.rendering_timer_id == null)
         this.draw();
         */

        this.engine.change();

        e.preventDefault();
        return false; // prevent default
    }

    /**
     * Returns slot number at canvas position or -1 if no slots
     * @param node
     * @param canvasx
     * @param canvasy
     * @param slot_pos
     * @returns {number}
     */
    isOverNodeInput(node: Node, canvasx: number, canvasy: number, slot_pos?: [number, number]): number {
        if (node.inputs)
            for (let i = 0, l = node.inputs.length; i < l; ++i) {
                let input = node.inputs[i];
                let link_pos = node.getConnectionPos(true, i);
                if (Utils.isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                    if (slot_pos) {
                        slot_pos[0] = link_pos[0];
                        slot_pos[1] = link_pos[1]
                    }
                    ;
                    return i;
                }
            }
        return -1;
    }

    /**
     * Process key
     * @param e
     * @returns {boolean}
     */
    processKey(e): boolean {
        if (!this.engine)
            return;

        let block_default = false;

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
                for (let i in this.selected_nodes)
                    if (this.selected_nodes[i].onKeyDown)
                        this.selected_nodes[i].onKeyDown(e);
        }
        else if (e.type == "keyup") {
            if (this.selected_nodes)
                for (let i in this.selected_nodes)
                    if (this.selected_nodes[i].onKeyUp)
                        this.selected_nodes[i].onKeyUp(e);
        }

        this.engine.change();

        if (block_default) {
            e.preventDefault();
            return false;
        }
    }

    /**
     * Process drop
     * @param e
     * @returns {boolean}
     */
    processDrop(e): boolean {
        e.preventDefault();
        this.adjustMouseEvent(e);


        let pos = [e.canvasX, e.canvasY];
        let node = this.engine.getNodeOnPos(pos[0], pos[1]);

        if (!node) {
            if (this.onDropItem)
                this.onDropItem(event);
            return;
        }

        if (node.onDropFile) {
            let files = e.dataTransfer.files;
            if (files && files.length) {
                for (let i = 0; i < files.length; i++) {
                    let file = e.dataTransfer.files[0];
                    let filename = file.name;
                    let ext = this.getFileExtension(filename);
                    //console.log(file);

                    //prepare reader
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        //console.log(event.target);
                        //todo ES6
                        //let data = event.target.result;
                        //node.onDropFile(data, filename, file);
                    };

                    //read data
                    let type = file.type.split("/")[0];
                    if (type == "text" || type == "")
                        reader.readAsText(file);
                    else if (type == "image")
                        reader.readAsDataURL(file);
                    else
                        reader.readAsArrayBuffer(file);
                }
            }
        }

        if (node.onDropItem) {
            if (node.onDropItem(event))
                return true;
        }

        if (this.onDropItem)
            return this.onDropItem(event);

        return false;
    }

    /**
     * Process node selected
     * @param n node
     * @param e
     */
    processNodeSelected(n: Node, e): void {
        n.selected = true;
        if (n.onSelected)
            n.onSelected();

        if (e && e.shiftKey) //add to selection
            this.selected_nodes[n.id] = n;
        else {
            this.selected_nodes = {};
            this.selected_nodes[n.id] = n;
        }

        this.dirty_canvas = true;

        if (this.onNodeSelected)
            this.onNodeSelected(n);

        //if(this.node_in_container) this.showNodePanel(n);
    }

    /**
     * Process node deselected
     * @param n node
     */
    processNodeDeselected(n: Node): void {
        n.selected = false;
        if (n.onDeselected)
            n.onDeselected();

        delete this.selected_nodes[n.id];

        if (this.onNodeDeselected)
            this.onNodeDeselected();

        this.dirty_canvas = true;

        //this.showNodePanel(null);
    }

    /**
     * Process node double clicked
     * @param n node
     */
    processNodeDblClicked(n: Node): void {
        if (this.onShowNodePanel)
            this.onShowNodePanel(n);

        if (this.onNodeDblClicked)
            this.onNodeDblClicked(n);

        this.setDirty(true);
    }

    /**
     * Select node
     * @param node node
     */
    selectNode(node: Node): void {
        this.deselectAllNodes();

        if (!node)
            return;

        if (!node.selected && node.onSelected)
            node.onSelected();
        node.selected = true;
        this.selected_nodes[node.id] = node;
        this.setDirty(true);
    }

    /**
     * Select all nodes
     */
    selectAllNodes(): void {
        for (let i in this.engine._nodes) {
            let n = this.engine._nodes[i];
            if (!n.selected && n.onSelected)
                n.onSelected();
            n.selected = true;
            this.selected_nodes[this.engine._nodes[i].id] = n;
        }

        this.setDirty(true);
    }

    /**
     * Deselect all nodes
     */
    deselectAllNodes(): void {
        for (let i in this.selected_nodes) {
            let n = this.selected_nodes[i];
            if (n.onDeselected)
                n.onDeselected();
            n.selected = false;
        }
        this.selected_nodes = {};
        this.setDirty(true);
    }

    /**
     * Deselect selected nodes
     */
    deleteSelectedNodes(): void {
        for (let i in this.selected_nodes) {
            let m = this.selected_nodes[i];
            //if(m == this.node_in_container) this.showNodePanel(null);
            this.engine.remove(m);
        }
        this.selected_nodes = {};
        this.setDirty(true);
    }

    /**
     * Center on node
     * @param node
     */
    centerOnNode(node: Node): void {
        this.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (this.canvas.width * 0.5 / this.scale);
        this.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (this.canvas.height * 0.5 / this.scale);
        this.setDirty(true, true);
    }

    /**
     *
     * @param e
     */
    adjustMouseEvent(e: any): void {
        let b = this.canvas.getBoundingClientRect();
        e.localX = e.pageX - b.left;
        e.localY = e.pageY - b.top;

        e.canvasX = e.localX / this.scale - this.offset[0];
        e.canvasY = e.localY / this.scale - this.offset[1];
    }

    /**
     * Set canvas zoom
     * @param value
     * @param zooming_center
     */
    setZoom(value: number, zooming_center: [number, number]): void {
        if (!zooming_center)
            zooming_center = [this.canvas.width * 0.5, this.canvas.height * 0.5];

        let center = this.convertOffsetToCanvas(zooming_center);

        this.scale = value;

        if (this.scale > this.max_zoom)
            this.scale = this.max_zoom;
        else if (this.scale < this.min_zoom)
            this.scale = this.min_zoom;

        let new_center = this.convertOffsetToCanvas(zooming_center);
        let delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];

        this.offset[0] += delta_offset[0];
        this.offset[1] += delta_offset[1];

        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
    }

    /**
     *
     * @param pos
     * @returns {[number,number]}
     */
    convertOffsetToCanvas(pos: [number, number]): [number, number] {
        return [pos[0] / this.scale - this.offset[0], pos[1] / this.scale - this.offset[1]];
    }

    /**
     *
     * @param pos
     * @returns {[number,number]}
     */
    convertCanvasToOffset(pos: [number, number]): [number, number] {
        return [(pos[0] + this.offset[0]) * this.scale,
            (pos[1] + this.offset[1]) * this.scale];
    }

    /**
     *
     * @param e
     * @returns {[number,number]}
     */
    convertEventToCanvas(e: any): [number, number] {
        let rect = this.canvas.getClientRects()[0];
        return this.convertOffsetToCanvas([e.pageX - rect.left, e.pageY - rect.top]);
    }

    /**
     *
     * @param n
     */
    bringToFront(n: Node): void {
        let i = this.engine._nodes.indexOf(n);
        if (i == -1) return;

        this.engine._nodes.splice(i, 1);
        this.engine._nodes.push(n);
    }

    /**
     *
     * @param n
     */
    sendToBack(n: Node): void {
        let i = this.engine._nodes.indexOf(n);
        if (i == -1) return;

        this.engine._nodes.splice(i, 1);
        this.engine._nodes.unshift(n);
    }


    /**
     * Compute visible ndes
     * @returns {Array}
     */
    computeVisibleNodes(): Array<Node> {
        let visible_nodes = [];
        for (let i in this.engine._nodes) {
            let n = this.engine._nodes[i];

            //skip rendering nodes in live mode
            if (this.live_mode && !n.onDrawBackground && !n.onDrawForeground)
                continue;

            if (!Utils.overlapBounding(this.visible_area, n.getBounding()))
                continue; //out of the visible area

            visible_nodes.push(n);
        }
        return visible_nodes;
    }

    /**
     * Draw canvas
     * @param force_foreground
     * @param force_background
     */
    draw(force_foreground?: boolean, force_background?: boolean): void {
        //fps counting
        let now = Nodes.getTime();
        this.render_time = (now - this.last__time) * 0.001;
        this.last_draw_time = now;

        if (this.engine) {
            let start = [-this.offset[0], -this.offset[1]];
            let end = [start[0] + this.canvas.width / this.scale, start[1] + this.canvas.height / this.scale];
            this.visible_area = [start[0], start[1], end[0], end[1]];
        }

        if (this.dirty_bgcanvas || force_background)
            this.drawBackCanvas();

        if (this.dirty_canvas || force_foreground)
            this.drawFrontCanvas();

        this.fps = this.render_time ? (1.0 / this.render_time) : 0;
        this.frame += 1;
    }

    /**
     * Draw front canvas
     */
    drawFrontCanvas(): void {
        if (!this.ctx)
            this.ctx = this.bgcanvas.getContext("2d");
        let ctx = this.ctx;
        if (!ctx) //maybe is using webgl...
            return;

        if ((<any>this.ctx).start2D)
            (<any>this.ctx).start2D();//check ES6

        let canvas = this.canvas;

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

        if (this.engine) {
            //apply transformations
            ctx.save();
            ctx.scale(this.scale, this.scale);
            ctx.translate(this.offset[0], this.offset[1]);

            //draw nodes
            let drawn_nodes = 0;
            let visible_nodes = this.computeVisibleNodes();
            this.visible_nodes = visible_nodes;

            for (let i in visible_nodes) {
                let node = visible_nodes[i];

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
            if (this.engine.config.links_ontop)
                if (!this.live_mode)
                    this.drawConnections(ctx);

            //current connection
            if (this.connecting_pos != null) {
                ctx.lineWidth = this.connections_width;
                let link_color = Nodes.options.NEW_LINK_COLOR;
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
            //this.dirty_area = null;
        }

        if ((<any>this.ctx).finish2D) //this is a function I use in webgl renderer
            (<any>this.ctx).finish2D();//check ES6

        this.dirty_canvas = false;
    }

    /**
     * Render info
     * @param ctx
     * @param x
     * @param y
     */
    renderInfo(ctx: CanvasRenderingContext2D, x = 0, y = 0): void {

        ctx.save();
        ctx.translate(x, y);

        ctx.font = "10px Arial";
        ctx.fillStyle = "#888";
        if (this.engine) {
            ctx.fillText("T: " + this.engine.globaltime.toFixed(2) + "s", 5, 13 * 1);
            ctx.fillText("I: " + this.engine.iteration, 5, 13 * 2);
            ctx.fillText("F: " + this.frame, 5, 13 * 3);
            ctx.fillText("FPS:" + this.fps.toFixed(2), 5, 13 * 4);
        }
        else
            ctx.fillText("No engine selected", 5, 13 * 1);
        ctx.restore();
    }

    /**
     * Draw back canvas
     */
    drawBackCanvas(): void {
        let canvas = this.bgcanvas;
        if (!this.bgctx)
            this.bgctx = this.bgcanvas.getContext("2d");
        let ctx = this.bgctx;
        if ((<any>ctx).start)
            (<any>ctx).start();

        //clear
        if (this.clear_background)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

        //reset in case of error
        ctx.restore();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (this.engine) {
            //apply transformations
            ctx.save();
            ctx.scale(this.scale, this.scale);
            ctx.translate(this.offset[0], this.offset[1]);


            //render BG
            if (Nodes.options.BG_IMAGE && this.scale > 0.5) {
                ctx.globalAlpha = (1.0 - 0.5 / this.scale) * this.editor_alpha;
                (<any>ctx).imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = false;
                if (!this._bg_img || this._bg_img.name != Nodes.options.BG_IMAGE) {
                    this._bg_img = new Image();
                    this._bg_img.name = Nodes.options.BG_IMAGE;
                    this._bg_img.src = Nodes.options.BG_IMAGE;
                    let that = this;
                    this._bg_img.onload = function () {
                        that.draw(true, true);
                    }
                }

                let pattern = null;
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
                (<any>ctx).imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = true;
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

        if ((<any>ctx).finish)
            (<any>ctx).finish();

        this.dirty_bgcanvas = false;
        this.dirty_canvas = true; //to force to repaint the front renderer with the bgcanvas
    }

    /**
     * Draw node
     * @param node
     * @param ctx
     */
    drawNode(node: Node, ctx: CanvasRenderingContext2D): void {

        let glow = false;

        let color = node.color || Nodes.options.NODE_DEFAULT_COLOR;

        if (node.type == "main/container")
            color = Nodes.options.CONTAINER_NODE_COLOR;
        else if (node.type == "main/input" || node.type == "main/output")
            color = Nodes.options.IO_NODE_COLOR;

        //if (this.selected) color = "#88F";

        let render_title = true;
        if (node.flags.skip_title_render || node.engine.isLive())
            render_title = false;
        if (node.mouseOver)
            render_title = true;

        //shadow and glow
        if (node.mouseOver) glow = true;

        if (node.selected) {
            ctx.shadowColor = Nodes.options.SELECTION_COLOR;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = Nodes.options.SELECTION_WIDTH;

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
                if (node.onDrawForeground)
                    node.onDrawForeground(ctx);
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

        let editor_alpha = this.editor_alpha;
        ctx.globalAlpha = editor_alpha;

        //clip if required (mask)
        let shape = node.shape || Nodes.options.NODE_DEFAULT_SHAPE;
        let size: [number, number] = [node.size[0], node.size[1]];
        if (node.flags.collapsed) {
            size[0] = Nodes.options.NODE_COLLAPSED_WIDTH;
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

        let render_text = this.scale > 0.6;

        //render inputs and outputs
        if (!node.flags.collapsed) {
            //input connection slots
            if (node.inputs)
                for (let i = 0; i < node.inputs.length; i++) {
                    let slot = node.inputs[i];

                    ctx.globalAlpha = editor_alpha;

                    //prevent connection of different types
                    //hide not compatible inputs
                    //if (this.connecting_node != null && this.connecting_output.type && node.inputs[i].type && this.connecting_output.type != node.inputs[i].type)
                    //    ctx.globalAlpha = 0.4 * editor_alpha;

                    //hide self inputs
                    if (this.connecting_node == node)
                        ctx.globalAlpha = 0.4 * editor_alpha;

                    ctx.fillStyle = slot.link != null ? "#7F7" : Nodes.options.DATATYPE_COLOR[slot.type];

                    let pos = node.getConnectionPos(true, i);
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
                        let text = slot.label != null ? slot.label : slot.name;
                        if (text) {
                            ctx.fillStyle = slot.isOptional ? Nodes.options.NODE_OPTIONAL_IO_COLOR : Nodes.options.NODE_DEFAULT_IO_COLOR;
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
                for (let i = 0; i < node.outputs.length; i++) {
                    let slot = node.outputs[i];

                    let pos = node.getConnectionPos(false, i);
                    pos[0] -= node.pos[0];
                    pos[1] -= node.pos[1];

                    ctx.fillStyle = slot.links && slot.links.length ? "#7F7" : Nodes.options.DATATYPE_COLOR[slot.type];
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
                        let text = slot.label != null ? slot.label : slot.name;
                        if (text) {
                            ctx.fillStyle = Nodes.options.NODE_DEFAULT_IO_COLOR;
                            ctx.fillText(text, pos[0] - 10, pos[1] + 5);
                        }
                    }
                }

            ctx.textAlign = "left";
            ctx.globalAlpha = 1;

            if (node.onDrawForeground)
                node.onDrawForeground(ctx);
        }//!collapsed

        if (node.flags.clip_area)
            ctx.restore();

        ctx.globalAlpha = 1.0;
    }

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
    drawNodeShape(node: Node, ctx: CanvasRenderingContext2D, size: [number, number], fgcolor: string, bgcolor: string, no_title: boolean, selected: boolean): void {
        //bg rect
        ctx.strokeStyle = fgcolor || Nodes.options.NODE_DEFAULT_COLOR;
        ctx.fillStyle = bgcolor || Nodes.options.NODE_DEFAULT_BGCOLOR;

        if (node.type == "main/container") {
            ctx.strokeStyle = fgcolor || Nodes.options.CONTAINER_NODE_COLOR;
            ctx.fillStyle = bgcolor || Nodes.options.CONTAINER_NODE_BGCOLOR;
        } else if (node.type == "main/input" || node.type == "main/output") {
            ctx.strokeStyle = fgcolor || Nodes.options.IO_NODE_COLOR;
            ctx.fillStyle = bgcolor || Nodes.options.IO_NODE_BGCOLOR;
        }

        /* gradient test
         let grad = ctx.createLinearGradient(0,0,0,node.size[1]);
         grad.addColorStop(0, "#AAA");
         grad.addColorStop(0.5, fgcolor || Nodes.options.NODE_DEFAULT_COLOR);
         grad.addColorStop(1, bgcolor || Nodes.options.NODE_DEFAULT_BGCOLOR);
         ctx.fillStyle = grad;
         //*/

        let title_height = Nodes.options.NODE_TITLE_HEIGHT;

        //render depending on shape
        let shape = node.shape || Nodes.options.NODE_DEFAULT_SHAPE;
        if (shape == "box") {
            ctx.beginPath();
            ctx.rect(0, no_title ? 0 : -title_height, size[0] + 1, no_title ? size[1] : size[1] + title_height);
            ctx.fill();
            //ctx.shadowColor = "transparent";

            //if (selected) {
            //    ctx.strokeStyle = "#CCC";
            //    ctx.strokeRect(-0.5, no_title ? -0.5 : -title_height + -0.5, size[0] + 2, no_title ? (size[1] + 2) : (size[1] + title_height + 2) - 1);
            //    ctx.strokeStyle = fgcolor;
            //}
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
            node.bgImage = node.loadImage(node.bgImageUrl);

        if (node.onDrawBackground)
            node.onDrawBackground(ctx);

        //title bg
        if (!no_title) {
            ctx.fillStyle = fgcolor || Nodes.options.NODE_DEFAULT_COLOR;
            let old_alpha = ctx.globalAlpha;
            //ctx.globalAlpha = 0.5 * old_alpha;
            if (shape == "box") {
                ctx.beginPath();
                ctx.rect(0, -title_height, size[0] + 1, title_height);
                ctx.fill()
                //ctx.stroke();
            }
            else if (shape == "round") {
                ctx.roundRect(0, -title_height, size[0], title_height, 4, 0);
                //ctx.fillRect(0,8,size[0],NODE_TITLE_HEIGHT - 12);
                ctx.fill();
                //ctx.stroke();
            }
            else if (shape == "circle") {
                ctx.roundRect(0, -title_height, size[0], title_height, 8, 0);
                //ctx.fillRect(0,8,size[0],NODE_TITLE_HEIGHT - 12);
                ctx.fill();
                //ctx.stroke();
            }

            //box
            ctx.fillStyle = node.boxcolor || Nodes.options.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            if (shape == "round" || shape == "circle")
                ctx.arc(title_height * 0.5, title_height * -0.5, (title_height - 6) * 0.5, 0, Math.PI * 2);
            else
                ctx.rect(3, -title_height + 3, title_height - 6, title_height - 6);
            ctx.fill();
            ctx.globalAlpha = old_alpha;

            //title text
            ctx.font = this.title_text_font;
            let title = node.getTitle();
            if (title && this.scale > 0.5) {
                ctx.fillStyle = Nodes.options.NODE_TITLE_COLOR;
                ctx.fillText(title, 16, 13 - title_height);
            }
        }
    }

    /**
     * Draw node when collapsed
     * @param node
     * @param ctx
     * @param fgcolor
     * @param bgcolor
     */
    drawNodeCollapsed(node: Node, ctx: CanvasRenderingContext2D, fgcolor: string, bgcolor: string): void {
        //draw default collapsed shape
        ctx.strokeStyle = fgcolor || Nodes.options.NODE_DEFAULT_COLOR;
        ctx.fillStyle = bgcolor || Nodes.options.NODE_DEFAULT_BGCOLOR;

        let collapsed_radius = Nodes.options.NODE_COLLAPSED_RADIUS;

        //circle shape
        let shape = node.shape || Nodes.options.NODE_DEFAULT_SHAPE;
        if (shape == "circle") {
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius, node.size[1] * 0.5 - collapsed_radius, 2 * collapsed_radius, 2 * collapsed_radius, 5);
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0)";
            ctx.stroke();

            ctx.fillStyle = node.boxcolor || Nodes.options.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius * 0.5, node.size[1] * 0.5 - collapsed_radius * 0.5, collapsed_radius, collapsed_radius, 2);
            ctx.fill();
        }
        else if (shape == "round") //rounded box
        {
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius, node.size[1] * 0.5 - collapsed_radius, 2 * collapsed_radius, 2 * collapsed_radius, 5);
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0)";
            ctx.stroke();

            ctx.fillStyle = node.boxcolor || Nodes.options.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            ctx.roundRect(node.size[0] * 0.5 - collapsed_radius * 0.5, node.size[1] * 0.5 - collapsed_radius * 0.5, collapsed_radius, collapsed_radius, 2);
            ctx.fill();
        }
        else //flat box
        {
            ctx.beginPath();
            //ctx.rect(node.size[0] * 0.5 - collapsed_radius, uiNode.size[1] * 0.5 - collapsed_radius, 2*collapsed_radius, 2*collapsed_radius);
            ctx.rect(0, 0, node.size[0], collapsed_radius * 2);
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0)";
            ctx.stroke();

            ctx.fillStyle = node.boxcolor || Nodes.options.NODE_DEFAULT_BOXCOLOR || fgcolor;
            ctx.beginPath();
            //ctx.rect(node.size[0] * 0.5 - collapsed_radius*0.5, uiNode.size[1] * 0.5 - collapsed_radius*0.5, collapsed_radius,collapsed_radius);
            ctx.rect(collapsed_radius * 0.5, collapsed_radius * 0.5, collapsed_radius, collapsed_radius);
            ctx.fill();
        }
    }

    /**
     * Draw connections
     * @param ctx
     */
    drawConnections(ctx: CanvasRenderingContext2D): void {
        //draw connections
        ctx.lineWidth = this.connections_width;

        ctx.fillStyle = "#AAA";
        ctx.strokeStyle = "#AAA";
        ctx.globalAlpha = this.editor_alpha;
        //for every node
        for (let n in this.engine._nodes) {
            let node = this.engine._nodes[n];
            //for every input (we render just inputs because it is easier as every slot can only have one input)
            if (node.inputs && node.inputs.length)
                for (let i in node.inputs) {
                    let input = node.inputs[i];
                    if (!input || input.link == null)
                        continue;
                    let link_id = input.link;
                    let link = this.engine.links[link_id];
                    if (!link) continue;

                    let start_node = this.engine.getNodeById(link.origin_id);
                    if (start_node == null) continue;
                    let start_node_slot = link.origin_slot;
                    let start_node_slotpos = null;

                    if (start_node_slot == -1)
                        start_node_slotpos = [start_node.pos[0] + 10, start_node.pos[1] + 10];
                    else
                        start_node_slotpos = start_node.getConnectionPos(false, start_node_slot);

                    let color = Nodes.options.LINK_TYPE_COLORS[node.inputs[i].type];
                    if (color == null && typeof (node.id) == "number")//ES6 check this
                        color = Nodes.options.LINK_COLORS[node.id % Nodes.options.LINK_COLORS.length];

                    this.renderLink(ctx, start_node_slotpos, node.getConnectionPos(true, +i), color);
                }
        }
        ctx.globalAlpha = 1;
    }

    /**
     * Draw link
     * @param ctx
     * @param a
     * @param b
     * @param color
     */
    renderLink(ctx: CanvasRenderingContext2D, a: [number, number], b: [number, number], color: string): void {
        if (!this.highquality_render) {
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
            return;
        }

        let dist = Utils.distance(a, b);

        if (this.render_connections_border && this.scale > 0.6)
            ctx.lineWidth = this.connections_width + this.connections_shadow;

        ctx.beginPath();

        if (this.render_curved_connections) //splines
        {
            ctx.moveTo(a[0], a[1]);
            ctx.bezierCurveTo(a[0] + dist * 0.25, a[1],
                b[0] - dist * 0.25, b[1],
                b[0], b[1]);
        }
        else //lines
        {
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
            let pos = this.computeConnectionPoint(a, b, 0.5);
            let pos2 = this.computeConnectionPoint(a, b, 0.51);
            let angle = 0;
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
    }

    /**
     * Compute connection point
     * @param a
     * @param b
     * @param t
     * @returns {[number,number]}
     */
    computeConnectionPoint(a: [number, number], b: [number, number], t: number): [number, number] {
        let dist = Utils.distance(a, b);
        let p0 = a;
        let p1 = [a[0] + dist * 0.25, a[1]];
        let p2 = [b[0] - dist * 0.25, b[1]];
        let p3 = b;

        let c1 = (1 - t) * (1 - t) * (1 - t);
        let c2 = 3 * ((1 - t) * (1 - t)) * t;
        let c3 = 3 * (1 - t) * (t * t);
        let c4 = t * t * t;

        let x = c1 * p0[0] + c2 * p1[0] + c3 * p2[0] + c4 * p3[0];
        let y = c1 * p0[1] + c2 * p1[1] + c3 * p2[1] + c4 * p3[1];
        return [x, y];
    }

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
    resize(width?: number, height?: number): void {
        if (!width && !height) {
            let parent = this.canvas.parentNode;
            width = (<any>parent).offsetWidth;//check ES6
            height = (<any>parent).offsetHeight;
        }

        if (this.canvas.width == width && this.canvas.height == height)
            return;

        this.canvas.width = width;
        this.canvas.height = height;
        this.bgcanvas.width = this.canvas.width;
        this.bgcanvas.height = this.canvas.height;
        this.setDirty(true, true);
    }

    /**
     * switch live mode
     * @param transition
     */
    switchLiveMode(transition: boolean): void {
        if (!transition) {
            this.live_mode = !this.live_mode;
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
            return;
        }

        let self = this;
        let delta = this.live_mode ? 1.1 : 0.9;
        if (this.live_mode) {
            this.live_mode = false;
            this.editor_alpha = 0.1;
        }

        let t = setInterval(function () {
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
    }

    /**
     *
     * @param node
     */
    onNodeSelectionChange(node: Node): void {
        return; //disabled
        //if(this.node_in_container) this.showNodePanel(node);
    }

    /**
     *
     * @param event
     */
    touchHandler(event: any): void {
        //alert("foo");
        let touches = event.changedTouches,
            first = touches[0],
            type = "";

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

        let window = this.getCanvasWindow();
        let document = window.document;

        let simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);
        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }


    /**
     * Get canvas menu options
     * @returns {Array}
     */
    getCanvasMenuOptions(): Array<any> {
        let options = [];
        if (this.getMenuOptions)
            options = this.getMenuOptions();
        else {
            options.push({content: "Add", is_menu: true, callback: this.onMenuAdd});
            options.push(null);

            //{content:"Collapse All", callback: NodeEditorCanvas.onMenuCollapseAll }

            options.push({content: "Import", is_menu: true, callback: this.onMenuImport});
            options.push(null);

            options.push({
                content: "Reset View",
                callback: () => {
                    this.editor.renderer.offset = [0, 0];
                    this.editor.renderer.scale = 1;
                    this.editor.renderer.setZoom(1, [1, 1]);
                }
            });

            options.push({
                content: "Show Map",
                callback: () => {
                    this.editor.addMiniWindow(200, 200);
                }
            });

            // if (engine.parent_container_id) {
            //
            //     options.push(null);
            //
            //     let back_url = "/editor/";
            //
            //     if (engine.parent_container_id != 0)
            //         back_url += "container/" + engine.parent_container_id;
            //
            //     options.push({
            //         content: "Close Container",
            //         callback: function () {
            //             (<any>window).location = back_url
            //         }
            //     });
            //
            // }


            if (this._engine_stack && this._engine_stack.length > 0)
                options.push({content: "Close Container", callback: this.closeContainer.bind(this)});

        }

        if (this.getExtraMenuOptions) {
            let extra = this.getExtraMenuOptions(this);
            if (extra) {
                extra.push(null);
                options = extra.concat(options);
            }
        }

        return options;
    }

    /**
     * Get node menu options
     * @param node
     * @returns {Array}
     */
    getNodeMenuOptions(node: Node): Array<any> {
        let options = [];

        //derwish added
        if (node.properties["Settings"]) {
            options.push({
                content: "Settings", callback: function () {
                    this.NodeSettings(node)
                }
            });
            options.push(null);
        }


        if (node.getMenuOptions)
            options = node.getMenuOptions(this);


        if (node.getExtraMenuOptions) {
            let extra = node.getExtraMenuOptions(this);
            if (extra) {
                //extra.push(null);
                options = extra.concat(options);
            }
        }

        if (node.clonable !== false)
            options.push({content: "Clone", callback: this.onMenuNodeClone});

        options.push({
            content: "Description", callback: function () {
                this.editor.showNodeDescrition(node)
            }
        });

        options.push({content: "Collapse", callback: this.onMenuNodeCollapse});

        if (node.removable !== false)
            options.push({content: "Remove", callback: this.onMenuNodeRemove});

        if (node.onGetInputs) {
            let inputs = node.onGetInputs();
            if (inputs && inputs.length)
                options[0].disabled = false;
        }

        if (node.onGetOutputs) {
            let outputs = node.onGetOutputs();
            if (outputs && outputs.length)
                options[1].disabled = false;
        }

        return options;
    }

    /**
     * Process contextual menu
     * @param node
     * @param event
     */
    processContextualMenu(node: Node, event: any): void {
        let that = this;
        let win = this.getCanvasWindow();

        let menu_info = null;
        let options = {event: event, callback: inner_option_clicked};

        //check if mouse is in input
        let slot: IInputInfo|IOutputInfo = null;
        if (node)
            slot = node.getSlotInPosition(event.canvasX, event.canvasY);

        if (slot) {
            //derwish remove
            //menu_info = slot.locked ? [ "Cannot remove" ] : { "Remove Slot": slot };
            //options.title = slot.input ? slot.input.type : slot.output.type;
        }
        else
            menu_info = node ? this.getNodeMenuOptions(node) : this.getCanvasMenuOptions();


        //show menu
        if (!menu_info)
            return;

        let menu = this.createContextualMenu(menu_info, options, win);

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
    }

    /**
     * Get file extension
     * @param url
     * @returns {any}
     */
    getFileExtension(url: string): string {
        let question = url.indexOf("?");
        if (question != -1)
            url = url.substr(0, question);
        let point = url.lastIndexOf(".");
        if (point == -1)
            return "";
        return url.substr(point + 1).toLowerCase();
    }


    /**
     * On menu add
     * @param node
     * @param e
     * @param prev_menu
     * @param canvas
     * @param first_event
     * @returns {boolean}
     */
    onMenuAdd(node: Node, e: any, prev_menu: Element, canvas: Renderer, first_event: any): boolean {
        let window = canvas.getCanvasWindow();

        let values = Nodes.getNodeTypesCategories();
        let entries = {};
        for (let i in values)
            if (values[i])
                entries[i] = {value: values[i], content: values[i], is_menu: true};

        let menu = canvas.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu}, window);

        function inner_clicked(v, e) {
            let category = v.value;
            let node_types = Nodes.getNodeTypesInCategory(category);
            let values = [];
            for (let i in node_types)
                values.push({content: node_types[i].name, value: node_types[i].type});

            canvas.createContextualMenu(values, {event: e, callback: inner_create, from: menu}, window);
            return false;
        }

        function inner_create(v, e) {
            let type = v.value;
            let pos = canvas.convertEventToCanvas(first_event);
            pos[0] = Math.round(pos[0]);
            pos[1] = Math.round(pos[1]);

            canvas.editor.socket.sendCreateNode(type, pos);

            // let node = Nodes.createNode(v.value);
            // if (node) {
            //     node.pos = pos;
            //     this.renderer.engine.add(node);
            // }
        }

        return false;
    }

    /**
     * On menu import
     * @param node
     * @param e
     * @param prev_menu
     * @param canvas
     * @param first_event
     * @returns {boolean}
     */
    onMenuImport(node: Node, e: any, prev_menu: Element, canvas: Renderer, first_event: any): boolean {
        let window = canvas.getCanvasWindow();

        let entries = {};

        entries[0] = {value: "Container from file", content: "Container from file", is_menu: false};
        entries[1] = {value: "Container from script", content: "Container from script", is_menu: false};
        entries[2] = {value: "Container from URL", content: "Container from URL", is_menu: false};

        let menu = canvas.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu}, window);

        function inner_clicked(v, e) {
            if (v.value == "Container from file") {
                let pos = canvas.convertEventToCanvas(first_event);
                pos[0] = Math.round(pos[0]);
                pos[1] = Math.round(pos[1]);
                canvas.editor.importContainerFromFile(pos);
            }

            if (v.value == "Container from script") {
                let pos = canvas.convertEventToCanvas(first_event);
                pos[0] = Math.round(pos[0]);
                pos[1] = Math.round(pos[1]);
                canvas.editor.importContainerFromScript(pos);
            }

            if (v.value == "Container from URL") {
                let pos = canvas.convertEventToCanvas(first_event);
                pos[0] = Math.round(pos[0]);
                pos[1] = Math.round(pos[1]);
                canvas.editor.importContainerFromURL(pos);
            }

            canvas.closeAllContextualMenus();

            return false;
        }

        return false;
    }

    /**
     *
     */
    onMenuCollapseAll(): void {

    }

    /**
     *
     */
    onMenuNodeEdit(): void {

    }

    /**
     * On menu node inputs
     * @param node
     * @param e
     * @param prev_menu
     * @returns {boolean}
     */
    onMenuNodeInputs(node: Node, e: any, prev_menu: Element): boolean {
        if (!node) return;

        let options = node.optional_inputs;
        if (node.onGetInputs)
            options = node.onGetInputs();
        if (options) {
            let entries = [];
            for (let i in options) {
                let entry = options[i];
                let label = entry[0];
                if (entry[2] && entry[2].label)
                    label = entry[2].label;
                entries.push({content: label, value: entry});
            }
            let menu = this.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu});
        }

        function inner_clicked(v) {
            if (!node) return;
            node.addInput(v.value[0], v.value[1], v.value[2]);
        }

        return false;
    }

    /**
     * On menu node outputs
     * @param node
     * @param e
     * @param prev_menu
     * @returns {boolean}
     */
    onMenuNodeOutputs(node: Node, e: any, prev_menu: Element): boolean {
        if (!node) return;

        let options = node.optional_outputs;
        if (node.onGetOutputs)
            options = node.onGetOutputs();
        if (options) {
            let entries = [];
            for (let i in options) {
                let entry = options[i];
                if (node.findOutputSlot(entry[0]) != -1)
                    continue; //skip the ones already on
                let label = entry[0];
                if (entry[2] && entry[2].label)
                    label = entry[2].label;
                entries.push({content: label, value: entry});
            }
            if (entries.length) {
                let menu = this.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu});
            }
        }

        function inner_clicked(v) {
            if (!node)
                return;

            let value = v.value[1];

            if (value && (value.constructor === Object || value.constructor === Array)) //submenu
            {
                let entries = [];
                for (let i in value)
                    entries.push({content: i, value: value[i]});
                this.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu});
                return false;
            }
            else
                node.addOutput(v.value[0], v.value[1], v.value[2]);
        }

        return false;
    }

    /**
     * On menu collapse
     * @param node
     */
    onMenuNodeCollapse(node: Node): void {
        node.flags.collapsed = !node.flags.collapsed;
        node.setDirtyCanvas(true, true);
    }

    /**
     * On menu node pin
     * @param node
     */
    onMenuNodePin(node: Node): void {
        node.pin();
    }

    /**
     * On menu node colors
     * @param node
     * @param e
     * @param prev_menu
     * @returns {boolean}
     */
    onMenuNodeColors(node: Node, e: any, prev_menu: Element): boolean {
        let values = [];
        for (let i in Nodes.options.NODE_COLORS) {
            let color = Nodes.options.NODE_COLORS[i];
            let value = {
                value: i,
                content: "<span style='display: block; color:" + color.color + "; background-color:" + color.bgcolor + "'>" + i + "</span>"
            };
            values.push(value);
        }
        this.createContextualMenu(values, {event: e, callback: inner_clicked, from: prev_menu});

        function inner_clicked(v) {
            if (!node) return;
            let color = this.node_colors[v.value];
            if (color) {
                node.color = color.color;
                node.bgcolor = color.bgcolor;
                node.setDirtyCanvas(true);
            }
        }

        return false;
    }

    /**
     * On menu node shapes
     * @param node
     * @param e
     * @returns {boolean}
     */
    onMenuNodeShapes(node: Node, e: any): boolean {
        this.createContextualMenu(["box", "round"], {event: e, callback: inner_clicked});

        function inner_clicked(v) {
            if (!node) return;
            node.shape = v;
            node.setDirtyCanvas(true);
        }

        return false;
    }

    /**
     * On menu node remove
     * @param node
     * @param e
     * @param prev_menu
     * @param canvas
     * @param first_event
     */
    onMenuNodeRemove(node: Node, e: any, prev_menu: Element, canvas: Renderer, first_event: any): void {
        //if (node.removable == false) return;

        if (node.id in canvas.selected_nodes)
            editor.socket.sendRemoveNodes(canvas.selected_nodes);
        else
            editor.socket.sendRemoveNode(node);

        //derwish remove
        //node.engine.remove(uiNode);
        //node.setDirtyCanvas(true, true);
    }

    /**
     * On menu node clone
     * @param node
     */
    onMenuNodeClone(node: Node): void {
        if (node.clonable == false) return;
        //derwish removed
        //let newnode = node.clone();
        //if(!newnode) return;
        //newnode.pos = [node.pos[0]+10,node.pos[1]+10];
        //node.engine.add(newnode);
        //node.setDirtyCanvas(true, true);

        //derwish added
        this.socket.sendCloneNode(node);
    }

    /**
     * Create contextual menu
     * @param values
     * @param options
     * @param ref_window
     * @returns {HTMLDivElement}
     */
    createContextualMenu(values: any, options?: any, ref_window?: Window): HTMLDivElement {
        options = options || {};
        this.options = options;

        //allows to create engine renderer in separate window
        ref_window = ref_window || window;

        if (!options.from)
            this.closeAllContextualMenus();
        else {
            //closing submenus
            //derwish edit
            let menus = document.querySelectorAll(".contextualmenu");
            for (let key in menus) {
                // todo ES6
                if (menus[key].previousSibling == options.from)
                    (<any>menus[key]).closeMenu();
            }
        }

        let root = ref_window.document.createElement("div");
        root.className = "contextualmenu menubar-panel";
        this.root = root;
        let style = root.style;

        style.minWidth = "100px";
        style.minHeight = "20px";

        style.position = "fixed";
        style.top = "100px";
        style.left = "100px";
        style.color = Nodes.options.MENU_TEXT_COLOR;
        style.padding = "2px";
        style.borderBottom = "1px solid " + Nodes.options.MENU_TEXT_COLOR;
        style.backgroundColor = Nodes.options.MENU_BG_COLOR;

        //title
        if (options.title) {
            let element = document.createElement("div");
            element.className = "contextualmenu-title";
            element.innerHTML = options.title;
            root.appendChild(element);
        }

        //avoid a context menu in a context menu
        root.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            return false;
        });

        for (let i in values) {
            let item = values[i];
            let element = ref_window.document.createElement("div");
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
            (<any>element).data = item;
            if (typeof (item) == "string")
                element.innerHTML = values.constructor == Array ? values[i] : i;
            else
                element.innerHTML = item.content ? item.content : i;

            element.addEventListener("click", on_click);
            root.appendChild(element);
        }

        root.addEventListener("mouseover", function (e) {
            (<any>this).mouse_inside = true;
        });

        root.addEventListener("mouseout", function (e) {
            //console.log("OUT!");
            //check if mouse leave a inner element
            let aux = e.relatedTarget || e.toElement;
            while (aux != this && aux != ref_window.document)
                aux = (<any>aux).parentNode;

            if (aux == this) return;
            (<any>this).mouse_inside = false;
        });

        //insert before checking position
        ref_window.document.body.appendChild(root);

        let root_rect = root.getClientRects()[0];

        //link menus
        if (options.from) {
            options.from.block_close = true;
        }

        let left = options.left || 0;
        let top = options.top || 0;
        if (options.event) {
            left = (options.event.pageX - 10);
            top = (options.event.pageY - 10);
            if (options.left)
                left = options.left;

            let rect = ref_window.document.body.getClientRects()[0];

            if (options.from) {
                let parent_rect = options.from.getClientRects()[0];
                left = parent_rect.left + parent_rect.width;
            }


            if (left > (rect.width - root_rect.width - 10))
                left = (rect.width - root_rect.width - 10);
            if (top > (rect.height - root_rect.height - 10))
                top = (rect.height - root_rect.height - 10);
        }

        root.style.left = left + "px";
        root.style.top = top + "px";

        let that = this;

        function on_click(e) {
            let value = this.dataset["value"];
            let close = true;
            if (options.callback) {
                let ret = options.callback.call(root, this.data, e);
                if (ret !== undefined) close = ret;
            }

            if (close) {
                that.closeAllContextualMenus();

            }
            //root.closeMenu();
        }

        (<any>root).closeMenu = function () {
            if (options.from) {
                options.from.block_close = false;
                if (!options.from.mouse_inside)
                    options.from.closeMenu();
            }
            if (this.parentNode)
                ref_window.document.body.removeChild(this);
        };

        return root;
    }

    /**
     * Clone all contextual menus
     */
    closeAllContextualMenus(): void {
        let elements = document.querySelectorAll(".contextualmenu");
        if (!elements.length) return;

        let result = [];
        for (let i = 0; i < elements.length; i++)
            result.push(elements[i]);

        for (let i in result)
            if (result[i].parentNode)
                result[i].parentNode.removeChild(result[i]);
    }

}


declare global {
    /**
     * Extend CanvasRenderingContext2D with roundRect
     * @param x
     * @param y
     * @param width
     * @param height
     * @param radius
     * @param radius_low
     */
    interface CanvasRenderingContext2D extends Object, CanvasPathMethods {
        roundRect(x: number, y: number, width: number, height: number, radius: number, radius_low?: number): void;

    }
}

CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, width: number, height: number, radius: number = 5, radius_low?: number): void {

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
}


if (!window["requestAnimationFrame"]) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
        (<any>window).mozRequestAnimationFrame ||
        (function (callback) {
            window.setTimeout(callback, 1000 / 60);
        });
}


