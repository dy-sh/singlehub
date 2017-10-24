/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../nodes/node"
import { Container, Side } from "../../nodes/container"
import { Renderer } from "./renderer"
import { EditorClientSocket } from "./editor-client-socket";
import { themes, RendererTheme } from "./renderer-themes"
import Utils from "../../nodes/utils";

import "../../nodes/nodes/index";
const log = require('logplease').create('editor', { color: 6 });

import { EventEmitter } from 'events';


export class Editor extends EventEmitter {

    themeId = 0;
    private root: HTMLDivElement;
    rootContainer: Container;
    renderer: Renderer;
    socket: EditorClientSocket;


    isRunning = false;
    showNodesIOValues = false;


    constructor(themeId = 0) {
        super();

        log.warn("!!! NEW EDITOR CREATED");
        (<any>window).editor = this;

        //check #main element exist
        let parent = document.getElementById("main");
        if (!parent) return log.error("Cant find #main element. Please, create it on the html page.")

        this.themeId = themeId;

        //create canvas and append to DOM
        this.root = document.createElement("div");
        this.root.className = "node-editor";
        this.root.innerHTML = "<div class='content'><div class='editor-area'><canvas class='canvas' width='50' height='50' tabindex=10></canvas></div></div>";
        let canvas = <HTMLCanvasElement>this.root.querySelector(".canvas");
        parent.appendChild(this.root);

        //create root container
        this.rootContainer = new Container(Side.editor);

        //create renderer
        this.renderer = new Renderer(this, canvas, this.rootContainer, themes[this.themeId]);

        this.renderer.on("changeContainer", (cont) => {
            this.updateContainersNavigation();
            this.updateBrowserUrl();
            this.emit("changeContainer", cont);
        })

        //todo later
        //  this.addMiniWindow(200, 200);


        this.updateContainersNavigation();
    }

    connect() {
        //create socket
        this.socket = new EditorClientSocket(this);
        this.rootContainer.clinet_socket = this.socket.socket;

        this.getNodes();
    }

    disconnect() {
        (<any>window).editor = null;
        this.socket.socket.close();
        Container.clear();
    }


    openContainer(id: number) {
        if (this.renderer.container.id == id)
            return;

        //todo search back in renderer._containers_stack

        let cont = Container.containers[id];
        if (!cont)
            return log.error("Cant open. Container id [" + id + "] not found");

        this.renderer.openContainer(cont);

        this.socket.sendJoinContainerRoom(this.renderer.container.id);
        this.updateNodesLabels();
    }

    closeContainer() {
        if (this.renderer.container.id != 0) {
            this.renderer.closeContainer(false);
            this.socket.sendJoinContainerRoom(this.renderer.container.id);
            this.updateNodesLabels();
        }
    }


    showNodeSettings(node: Node): void {
        (<any>window).vueEditor.$refs.nodeSettings.show(node);
    }

    run() {
        this.socket.sendRunContainer();
    }

    stop() {
        this.socket.sendStopContainer();
    }

    step() {
        this.socket.sendStepContainer();
    }

    onContainerRun() {
        this.isRunning = true;
        this.emit("run");
    }

    onContainerRunStep() {
        if (this.showNodesIOValues)
            this.socket.sendGetSlotsValues();

        this.emit("step");
    }

    onContainerStop() {
        this.isRunning = false;
        this.emit("stop");
    }

    displayNodesIOValues() {
        this.showNodesIOValues = true;
        this.updateNodesLabels();
    }

    hideNodesIOValues() {
        this.showNodesIOValues = false;
        this.updateNodesLabels();
    }

    updateNodesLabels() {
        if (this.showNodesIOValues)
            this.socket.sendGetSlotsValues();
        else {
            let container = this.renderer.container;
            for (let id in container._nodes) {
                let node = container._nodes[id];
                node.updateInputsLabels();
                node.updateOutputsLabels();
            }
        }
    }


    onNodeCreated(node: Node) {
        if (node.type == "main/container")
            this.emit("changeContainer", this.renderer.container);
    }

    onNodeRemoved(node: Node) {
        if (node.type == "main/container")
            this.emit("changeContainer", this.renderer.container);
    }

    onNodeCloned(node: Node) {
        if (node.type == "main/container")
            this.emit("changeContainer", this.renderer.container);
    }

    onNodeSettingsChanged(node: Node) {
        if (node.type == "main/container")
            this.emit("changeContainer", this.renderer.container);
    }

    onNodesMovedToNewContainer(data) {
        this.emit("changeContainer", this.renderer.container);
    }

    onConteinerImported(data) {
        this.emit("changeContainer", this.renderer.container);
    }

    addMiniWindow(w: number, h: number): void {

        if (minimap_opened)
            return;

        minimap_opened = true;

        let miniwindow = document.createElement("div");
        miniwindow.className = "miniwindow";
        miniwindow.innerHTML = "<canvas class='canvas' width='" + w + "' height='" + h + "' tabindex=10></canvas>";
        let canvas = miniwindow.querySelector("canvas");

        let renderer = new Renderer(this, canvas, this.rootContainer);
        //  renderer.background_image = "images/node-editor/grid.png";
        //derwish edit
        renderer.scale = 0.1;
        //renderer.allow_dragnodes = false;

        renderer.offset = [0, 0];
        renderer.scale = 0.1;
        renderer.setZoom(0.1, [1, 1]);

        miniwindow.style.position = "absolute";
        miniwindow.style.top = "4px";
        miniwindow.style.right = "4px";

        let close_button = document.createElement("div");
        close_button.className = "corner-button";
        close_button.innerHTML = "X";
        close_button.addEventListener("click", function (e) {
            minimap_opened = false;
            renderer.setContainer(null, false, false);
            miniwindow.parentNode.removeChild(miniwindow);
        });
        miniwindow.appendChild(close_button);

        let reset_button = document.createElement("div");
        reset_button.className = "corner-button2";
        reset_button.innerHTML = "R";
        reset_button.addEventListener("click", function (e) {
            renderer.offset = [0, 0];
            renderer.scale = 0.1;
            renderer.setZoom(0.1, [1, 1]);
        });
        miniwindow.appendChild(reset_button);

        this.root.querySelector(".content").appendChild(miniwindow);

    }



    importContainerFromFile(position: [number, number]): void {
        let that = this;
        $('#import-panel-title').html("Import Container");

        $('#import-panel-body').show();
        $('#import-panel-message').hide();

        //clear upload file
        let uploadFile = $("#uploadFile");
        uploadFile.replaceWith(uploadFile = uploadFile.clone(true));

        (<any>$('#import-panel')).modal({
            dimmerSettings: { opacity: 0.3 }
        }).modal('setting', 'transition', 'fade up').modal('show');

        document.forms['uploadForm'].elements['uploadFile'].onchange = function (evt) {
            $('#import-panel-message').html("Uploading...");
            $('#import-panel-message').show();
            $('#import-panel-body').hide();


            if (!(<any>window).FileReader) {
                $('#import-panel-message').html("Browser is not compatible");
                $('#import-panel-message').show();
                $('#import-panel-body').hide();
            }


            let reader = new FileReader();

            reader.onload = function (evt) {
                if ((<any>evt).target.readyState != 2) return;
                if ((<any>evt).target.error) {
                    $('#import-panel-message').html("Error while reading file.");
                    $('#import-panel-message').show();
                    $('#import-panel-body').hide();
                    return;
                }

                let ser_node = (<any>evt).target.result;

                $.ajax({
                    url: "/api/editor/c/" + that.renderer.container.id + "/import",
                    type: "POST",
                    data: {
                        ser_node: ser_node,
                        pos: JSON.stringify(position)
                    },
                    success: function (result) {
                        if (result) {
                            (<any>$('#import-panel')).modal('hide');
                        } else {
                            $('#import-panel-message').html("Error. File format is not correct.");
                            $('#import-panel-message').show();
                            $('#import-panel-body').hide();
                        }
                    }
                });
            };

            reader.readAsText(evt.target.files[0]);
        };

    }

    importContainerFromScript(position: [number, number]): void {
        let that = this;
        $('#modal-panel-submit').show();

        $('#modal-panel-title').html("Import Container");
        $('#modal-panel-form').html(
            '<div class="field">' +
            'Script: <textarea id="modal-panel-text"></textarea>' +
            '</div>');


        (<any>$('#modal-panel')).modal({
            dimmerSettings: { opacity: 0.3 },
            onHidden: function () {
                $('#modal-panel-submit').hide();
                $('#modal-panel-message').hide();
                $('#modal-panel-message').removeClass("negative");
                $('#modal-panel-form').removeClass("loading");
                $('#modal-panel-submit').unbind();
            }
        }).modal('setting', 'transition', 'fade up').modal('show');

        $('#modal-panel-submit').click(function () {
            $('#modal-panel-form').addClass("loading");
            $('#modal-panel-message').html("Uploading...");
            $('#modal-panel-message').removeClass("negative");
            $('#modal-panel-message').fadeIn(300);
            // $('#import-script-body').hide();

            $.ajax({
                url: "/api/editor/c/" + that.renderer.container.id + "/import",
                type: "POST",
                data: {
                    ser_node: $('#modal-panel-text').val(),
                    pos: JSON.stringify(position)
                },
                success: function (result) {
                    if (result) {
                        (<any>$('#modal-panel')).modal('hide');
                    } else {
                        $('#modal-panel-message').html("Failed to import. Script is not correct.");
                        $('#modal-panel-message').addClass("negative");
                        $('#modal-panel-form').removeClass("loading");
                        $('#modal-panel-message').show();
                        $('#modal-panel-body').fadeIn(300);
                    }
                }
            });
        });
    }

    importContainerFromURL(position: [number, number]): void {
        let that = this;
        $('#modal-panel-submit').show();

        $('#modal-panel-title').html("Import Container");
        $('#modal-panel-form').html(
            '<div class="field">' +
            'URL:  <input type="text" id="modal-panel-text">' +
            '</div>');


        (<any>$('#modal-panel')).modal({
            dimmerSettings: { opacity: 0.3 },
            onHidden: function () {
                $('#modal-panel-submit').hide();
                $('#modal-panel-message').hide();
                $('#modal-panel-message').removeClass("negative");
                $('#modal-panel-form').removeClass("loading");
                $('#modal-panel-submit').unbind();
            }
        }).modal('setting', 'transition', 'fade up').modal('show');

        $('#modal-panel-submit').click(function () {
            $('#modal-panel-form').addClass("loading");
            $('#modal-panel-message').html("Importing...");
            $('#modal-panel-message').removeClass("negative");
            $('#modal-panel-message').fadeIn(300);
            // $('#import-script-body').hide();

            let script;
            let url = "" + $('#modal-panel-text').val();

            $.ajax({
                url: url,
                type: "GET",
                success: function (result) {
                    script = result;
                    importContainer(script);
                },
                error: function (result) {
                    $('#modal-panel-form').removeClass("loading");
                    $('#modal-panel-message').addClass("negative");
                    $('#modal-panel-message').html("Error loading data. URL is incorrect.");
                    $('#modal-panel-message').show();

                }
            });

            function importContainer(ser_node) {

                $.ajax({
                    url: "/api/editor/c/" + that.renderer.container.id + "/import",
                    type: "POST",
                    data: {
                        ser_node: JSON.stringify(ser_node),
                        pos: JSON.stringify(position)
                    },
                    success: function (result) {
                        if (result) {
                            (<any>$('#modal-panel')).modal('hide');
                        } else {
                            $('#modal-panel-message').html("Failed to import.  Downloaded data is not correct.");
                            $('#modal-panel-message').addClass("negative");
                            $('#modal-panel-form').removeClass("loading");
                            $('#modal-panel-message').show();
                            $('#modal-panel-body').fadeIn(300);
                        }
                    }
                });
            }

        });
    }

    exportContainerToScript(id: string): void {

        $('#modal-panel-message').html("Generating script...");
        $('#modal-panel-message').fadeIn(300);

        $('#modal-panel-title').html("Export Container");
        $('#modal-panel-form').html(
            '<div class="field">' +
            'Script: <textarea id="modal-panel-text"></textarea>' +
            '</div>');
        $('#modal-panel-text').hide();


        (<any>$('#modal-panel')).modal({
            dimmerSettings: { opacity: 0.3 },
            onHidden: function () {
                $('#modal-panel-message').hide();
            }
        }).modal('setting', 'transition', 'fade up').modal('show');

        $.ajax({
            url: "/api/editor/c/" + id + "/export",
            type: "GET",
            success: function (result) {
                $('#modal-panel-text').html(JSON.stringify(result));
                $('#modal-panel-text').fadeIn(300);
                $('#modal-panel-message').hide();
            }
        });
    }

    exportContainerURL(id: string): void {

        $('#modal-panel-title').html("Export Container");
        $('#modal-panel-form').html(
            '<div class="field">' +
            'URL:  <input type="text" id="modal-panel-text">' +
            '</div>');
        let url = $(location).attr('host') + "/api/editor/c/" + id + "/export";

        let prefix = 'http://';
        if (url.substr(0, prefix.length) !== prefix) {
            url = prefix + url;
        }

        $('#modal-panel-text').val(url);


        (<any>$('#modal-panel')).modal({
            dimmerSettings: { opacity: 0.3 },
            onHidden: function () {
            }
        }).modal('setting', 'transition', 'fade up').modal('show');

    }

    showNodeDescription(node: Node): void {

        $('#modal-panel-title').html(node.type);
        $('#modal-panel-form').html(
            '<div class="field">' + node.descriprion + '</div>'
        );

        $('#modal-panel-buttons').html(
            '<a href="/editor/nodes-description" class="ui button">Show all nodes</a>' +
            '<div class="ui cancel button">Cancel</div>'
        );

        (<any>$('#modal-panel')).modal({
            dimmerSettings: { opacity: 0.3 },
            onHidden: function () {
            }
        }).modal('setting', 'transition', 'fade up').modal('show');

    }

    updateContainersNavigation() {

        //todo 


        // let that = this;

        // //update dashboard button
        // $("#dashboard-button").attr("href", '/dashboard/c/' + that.renderer.container.id);

        // //update split button
        // let split = $("#split-button").attr("href").startsWith("/editor/split/");
        // if (split)
        //     $("#split-button").attr("href", '/editor/split/c/' + that.renderer.container.id);
        // else
        //     $("#split-button").attr("href", '/editor/c/' + that.renderer.container.id);

        // //update navigation buttons
        // $("#containers-navigation").html("");
        // addendButton(0, "Main");

        // //if this is a sub-container
        // if (this.renderer._containers_stack
        //     && this.renderer._containers_stack.length > 0) {

        //     //add containers
        //     let cont_count = this.renderer._containers_stack.length;
        //     for (let cont = 1; cont < cont_count; cont++) {
        //         let cont_name = this.renderer._containers_stack[cont].name;
        //         let cont_id = this.renderer._containers_stack[cont].id;
        //         addendButton(cont_id, cont_name);
        //     }

        //     //add this container
        //     // console.log(this.renderer.container)
        //     // let cont_name = this.renderer.container.container_node.title;
        //     let cont_name = this.renderer.container.name;
        //     let cont_id = this.renderer.container.id;
        //     addendButton(cont_id, cont_name);

        // }

        // function addendButton(cont_id, cont_name) {
        //     $("#containers-navigation")
        //         .append(`<div id="container${cont_id}" class="ui black tiny compact button">${cont_name}</div>`);
        //     $("#container" + cont_id).click(function () {
        //         for (let i = 0; i < 1000; i++) {
        //             if (that.renderer.container.id == cont_id)
        //                 break;
        //             that.renderer.closeContainer(false);
        //         }
        //         that.socket.sendJoinContainerRoom(that.renderer.container.id);
        //         editor.updateNodesLabels();
        //     });
        // }
    }



    updateBrowserUrl() {
        //change browser url
        //todo
        // let cid = editor.renderer.container.id;
        // if (cid == 0)
        //     window.history.pushState('Container ' + cid, 'SingeHub', '/editor/');
        // else
        //     window.history.pushState('Container ' + cid, 'SingeHub', '/editor/c/' + cid);

    }

    getNodes() {
        this.socket.getContainerState();

        this.socket.getNodes((nodes) => {
            this.emit("changeContainer", this.renderer.container);

            //open container from url
            // let cont_id = (<any>window).container_id;
            // if (cont_id && cont_id != 0) {
            //     //get containers stack
            //     let cont = Container.containers[cont_id];

            //     let parentStack = cont.getParentsStack();
            //     while (parentStack.length > 0) {
            //         let cid = parentStack.pop();
            //         if (cid != 0) {
            //             let parent_cont = Container.containers[cid];
            //             that.renderer.openContainer(parent_cont, false);
            //         }
            //     }

            //     this.renderer.openContainer(cont, false);
            // }
            // else
            //     this.renderer.openContainer(Container.containers[0]);
        });

    }
}

let minimap_opened = false;

// noty settings
// $.noty.defaults.layout = 'bottomRight';
// $.noty.defaults.theme = 'relax';
// $.noty.defaults.timeout = 3000;
// $.noty.defaults.animation = {
//     open: 'animated bounceInRight', // Animate.css class names
//     close: 'animated flipOutX', // Animate.css class names
//     easing: 'swing', // unavailable - no need
//     speed: 500 // unavailable - no need
// };


//setting-elements templates
// let textSettingTemplate = Handlebars.compile($('#textSettingTemplate').html());
// let numberSettingTemplate = Handlebars.compile($('#numberSettingTemplate').html());
// let checkboxSettingTemplate = Handlebars.compile($('#checkboxSettingTemplate').html());
// let dropdownSettingTemplate = Handlebars.compile($('#dropdownSettingTemplate').html());

// export let editor = new Editor();


