/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes", "../../nodes/nodes-engine", "./renderer", "./editor-socket", "./node-editor-themes"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes/nodes");
    const nodes_engine_1 = require("../../nodes/nodes-engine");
    const renderer_1 = require("./renderer");
    const editor_socket_1 = require("./editor-socket");
    const node_editor_themes_1 = require("./node-editor-themes");
    class NodeEditor {
        constructor() {
            //nodes: Nodes;
            this.isRunning = false;
            //fill container
            let html = "<div class='content'><div class='editor-area'><canvas class='canvas' width='1000' height='500' tabindex=10></canvas></div></div>";
            let root = document.createElement("div");
            this.root = root;
            root.className = "node-editor";
            root.innerHTML = html;
            let canvas = root.querySelector(".canvas");
            //nodes options theme
            if (window.theme)
                nodes_1.Nodes.options = node_editor_themes_1.themes[window.theme];
            //create engine
            this.engine = nodes_engine_1.engine;
            //create socket
            this.socket = editor_socket_1.socket;
            this.engine.socket = editor_socket_1.socket.socket;
            //create canvas
            let renderer = this.renderer = new renderer_1.Renderer(canvas, this.socket, this, this.engine);
            // renderer.background_image = "/images/node-editor/grid.png";
            this.engine.onAfterExecute = function () {
                renderer.draw(true);
            };
            //add stuff
            //todo later
            //  this.addMiniWindow(200, 200);
            //append to DOM
            let parent = document.getElementById("main");
            if (parent)
                parent.appendChild(root);
            renderer.resize();
            //renderer.draw(true,true);
            this.addFullscreenButton();
            this.addPlayButton();
            this.addStepButton();
        }
        addMiniWindow(w, h) {
            if (minimap_opened)
                return;
            minimap_opened = true;
            let miniwindow = document.createElement("div");
            miniwindow.className = "miniwindow";
            miniwindow.innerHTML = "<canvas class='canvas' width='" + w + "' height='" + h + "' tabindex=10></canvas>";
            let canvas = miniwindow.querySelector("canvas");
            let renderer = new renderer_1.Renderer(canvas, this.socket, this, this.engine);
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
                renderer.setEngine(null);
                miniwindow.parentNode.removeChild(miniwindow);
            });
            miniwindow.appendChild(close_button);
            //derwiah added
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
        addFullscreenButton() {
            $("#fullscreen-button").click(function () {
                // editor.goFullscreen();
                let elem = document.documentElement;
                let fullscreenElement = document.fullscreenElement ||
                    document.mozFullscreenElement ||
                    document.webkitFullscreenElement;
                if (fullscreenElement == null) {
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    }
                    else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen();
                    }
                    else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen();
                    }
                }
                else {
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();
                    }
                    else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                    else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    }
                }
            });
        }
        importContainerFromFile(position) {
            $('#import-panel-title').html("Import Container");
            $('#import-panel-body').show();
            $('#import-panel-message').hide();
            //clear upload file
            let uploadFile = $("#uploadFile");
            uploadFile.replaceWith(uploadFile = uploadFile.clone(true));
            $('#import-panel').modal({
                dimmerSettings: { opacity: 0.3 }
            }).modal('setting', 'transition', 'fade up').modal('show');
            document.forms['uploadForm'].elements['uploadFile'].onchange = function (evt) {
                $('#import-panel-message').html("Uploading...");
                $('#import-panel-message').show();
                $('#import-panel-body').hide();
                if (!window.FileReader) {
                    $('#import-panel-message').html("Browser is not compatible");
                    $('#import-panel-message').show();
                    $('#import-panel-body').hide();
                }
                let reader = new FileReader();
                reader.onload = function (evt) {
                    if (evt.target.readyState != 2)
                        return;
                    if (evt.target.error) {
                        $('#import-panel-message').html("Error while reading file.");
                        $('#import-panel-message').show();
                        $('#import-panel-body').hide();
                        return;
                    }
                    let filebody = evt.target.result;
                    $.ajax({
                        url: "/api/editor/ImportContainerJson/",
                        type: "POST",
                        data: {
                            json: filebody,
                            x: position[0],
                            y: position[1],
                            ownerContainerId: nodes_engine_1.engine.container_id
                        },
                        success: function (result) {
                            if (result) {
                                $('#import-panel').modal('hide');
                            }
                            else {
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
        importContainerFromScript(position) {
            $('#modal-panel-submit').show();
            $('#modal-panel-title').html("Import Container");
            $('#modal-panel-form').html('<div class="field">' +
                'Script: <textarea id="modal-panel-text"></textarea>' +
                '</div>');
            $('#modal-panel').modal({
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
                    url: "/api/editor/ImportContainerJson/",
                    type: "POST",
                    data: {
                        json: $('#modal-panel-text').val(),
                        x: position[0],
                        y: position[1],
                        ownerContainerId: nodes_engine_1.engine.container_id
                    },
                    success: function (result) {
                        if (result) {
                            $('#modal-panel').modal('hide');
                        }
                        else {
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
        importContainerFromURL(position) {
            $('#modal-panel-submit').show();
            $('#modal-panel-title').html("Import Container");
            $('#modal-panel-form').html('<div class="field">' +
                'URL:  <input type="text" id="modal-panel-text">' +
                '</div>');
            $('#modal-panel').modal({
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
                let url = $('#modal-panel-text').val();
                $.ajax({
                    url: url,
                    type: "POST",
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
                function importContainer(script) {
                    $.ajax({
                        url: "/api/editor/ImportContainerJson/",
                        type: "POST",
                        data: {
                            json: script,
                            x: position[0],
                            y: position[1],
                            ownerContainerId: nodes_engine_1.engine.container_id
                        },
                        success: function (result) {
                            if (result) {
                                $('#modal-panel').modal('hide');
                            }
                            else {
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
        exportContainerToScript(id) {
            $('#modal-panel-message').html("Generating script...");
            $('#modal-panel-message').fadeIn(300);
            $('#modal-panel-title').html("Export Container");
            $('#modal-panel-form').html('<div class="field">' +
                'Script: <textarea id="modal-panel-text"></textarea>' +
                '</div>');
            $('#modal-panel-text').hide();
            $('#modal-panel').modal({
                dimmerSettings: { opacity: 0.3 },
                onHidden: function () {
                    $('#modal-panel-message').hide();
                }
            }).modal('setting', 'transition', 'fade up').modal('show');
            $.ajax({
                url: "/api/editor/serialize-container/",
                type: "POST",
                data: { id: id },
                success: function (result) {
                    $('#modal-panel-text').html(result);
                    $('#modal-panel-text').fadeIn(300);
                    $('#modal-panel-message').hide();
                }
            });
        }
        exportContainerURL(id) {
            $('#modal-panel-title').html("Export Container");
            $('#modal-panel-form').html('<div class="field">' +
                'URL:  <input type="text" id="modal-panel-text">' +
                '</div>');
            let url = $(location).attr('host') + "/api/editor/serialize-container/" + id;
            let prefix = 'http://';
            if (url.substr(0, prefix.length) !== prefix) {
                url = prefix + url;
            }
            $('#modal-panel-text').val(url);
            $('#modal-panel').modal({
                dimmerSettings: { opacity: 0.3 },
                onHidden: function () {
                }
            }).modal('setting', 'transition', 'fade up').modal('show');
        }
        showNodeDescrition(node) {
            $('#modal-panel-title').html(node.type);
            $('#modal-panel-form').html('<div class="field">' +
                '<div id="modal-panel-text"></div>' +
                '</div>' +
                '<div class="field">' +
                '<a href="/editor/NodesDescription">Show description of all nodes</a>' +
                '</div>');
            $.ajax({
                url: "/api/editor/GetNodeDescription/",
                type: "POST",
                data: { id: node.id },
                success: function (result) {
                    $('#modal-panel-text').html(result);
                    $('#modal-panel-text').fadeIn(300);
                    $('#modal-panel-message').hide();
                    $('#modal-panel').modal({
                        dimmerSettings: { opacity: 0.3 },
                        onHidden: function () {
                        }
                    }).modal('setting', 'transition', 'fade up').modal('show');
                }
            });
        }
        addPlayButton() {
            var that = this;
            $("#play-button").click(function () {
                if (that.isRunning)
                    editor_socket_1.socket.sendStopEngine();
                else
                    editor_socket_1.socket.sendRunEngine();
            });
        }
        addStepButton() {
            $("#step-button").click(function () {
                editor_socket_1.socket.sendStepEngine();
                // engine.runStep();
            });
        }
        onEngineRun() {
            this.isRunning = true;
            $("#step-button").fadeOut(200);
            $("#play-icon").addClass("stop");
            $("#play-icon").removeClass("play");
        }
        onEngineRunStep() {
        }
        onEngineStop() {
            this.isRunning = false;
            $("#step-button").fadeIn(200);
            $("#play-icon").removeClass("stop");
            $("#play-icon").addClass("play");
        }
    }
    exports.NodeEditor = NodeEditor;
    let minimap_opened = false;
    // noty settings
    $.noty.defaults.layout = 'bottomRight';
    $.noty.defaults.theme = 'relax';
    $.noty.defaults.timeout = 3000;
    $.noty.defaults.animation = {
        open: 'animated bounceInRight',
        close: 'animated flipOutX',
        easing: 'swing',
        speed: 500 // unavailable - no need
    };
    //setting-elements templates
    let textSettingTemplate = Handlebars.compile($('#textSettingTemplate').html());
    let numberSettingTemplate = Handlebars.compile($('#numberSettingTemplate').html());
    let checkboxSettingTemplate = Handlebars.compile($('#checkboxSettingTemplate').html());
    function nodeSettings(node) {
        $('#node-settings-title').html(node.type);
        //parse settings from json
        let settings = JSON.parse(node.properties['Settings']);
        //clear old body
        let body = $('#node-settings-body');
        body.empty();
        //add setting-elements from templates
        for (let i = 0; i < Object.keys(settings).length; i++) {
            let key = Object.keys(settings)[i];
            settings[key].Key = key;
            switch (settings[key].Type) {
                case 0:
                    body.append(textSettingTemplate(settings[key]));
                    break;
                case 1:
                    body.append(numberSettingTemplate(settings[key]));
                    break;
                case 2:
                    body.append(checkboxSettingTemplate(settings[key]));
                    if (settings[key].Value == "true")
                        $('#node-setting-' + key).prop('checked', true);
                    break;
            }
        }
        //modal panel
        $('#node-settings-panel').modal({
            dimmerSettings: { opacity: 0.3 },
            onApprove: function () {
                //get settings from form
                let data = [];
                for (let i = 0; i < Object.keys(settings).length; i++) {
                    let key = Object.keys(settings)[i];
                    switch (settings[key].Type) {
                        case 0:
                            data.push({ key: key, value: $('#node-setting-' + key).val() });
                            break;
                        case 1:
                            data.push({ key: key, value: $('#node-setting-' + key).val() });
                            break;
                        case 2:
                            data.push({ key: key, value: $('#node-setting-' + key).prop('checked') ? "true" : "false" });
                            break;
                    }
                }
                //send settings
                $.ajax({
                    url: "/api/editor/SetNodeSettings/",
                    type: "POST",
                    data: { id: node.id, data: data }
                });
            }
        }).modal('setting', 'transition', 'fade up').modal('show');
    }
    exports.editor = new NodeEditor();
});
//# sourceMappingURL=node-editor.js.map