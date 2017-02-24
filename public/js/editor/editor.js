/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */
"use strict";
var nodes_1 = require("../../nodes/nodes");
var container_1 = require("../../nodes/container");
var renderer_1 = require("./renderer");
var editor_client_socket_1 = require("./editor-client-socket");
var editor_themes_1 = require("./editor-themes");
var utils_1 = require("../../nodes/utils");
var Editor = (function () {
    function Editor() {
        //nodes: Nodes;
        this.isRunning = false;
        this.showSlotsValues = false;
        window.editor = this;
        //fill container
        var html = "<div class='content'><div class='editor-area'><canvas class='canvas' width='1000' height='500' tabindex=10></canvas></div></div>";
        var root = document.createElement("div");
        this.root = root;
        root.className = "node-editor";
        root.innerHTML = html;
        var canvas = root.querySelector(".canvas");
        //nodes options theme
        if (window.theme)
            nodes_1.Nodes.options = editor_themes_1.themes[window.theme];
        //create root container
        this.rootContainer = new container_1.Container();
        //create socket
        this.socket = editor_client_socket_1.socket;
        this.rootContainer.socket = editor_client_socket_1.socket.socket;
        //create canvas
        var renderer = this.renderer = new renderer_1.Renderer(canvas, this.rootContainer);
        // renderer.background_image = "/images/node-editor/grid.png";
        this.rootContainer.onAfterExecute = function () {
            renderer.draw(true);
        };
        //todo later
        //  this.addMiniWindow(200, 200);
        //append to DOM
        var parent = document.getElementById("main");
        if (parent)
            parent.appendChild(root);
        renderer.resize();
        //renderer.draw(true,true);
        this.addFullscreenButton();
        this.addPlayButton();
        this.addStepButton();
        this.addSlotsValuesButton();
        this.updateContainersNavigation();
    }
    Editor.prototype.addMiniWindow = function (w, h) {
        if (minimap_opened)
            return;
        minimap_opened = true;
        var miniwindow = document.createElement("div");
        miniwindow.className = "miniwindow";
        miniwindow.innerHTML = "<canvas class='canvas' width='" + w + "' height='" + h + "' tabindex=10></canvas>";
        var canvas = miniwindow.querySelector("canvas");
        var renderer = new renderer_1.Renderer(canvas, this.rootContainer);
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
        var close_button = document.createElement("div");
        close_button.className = "corner-button";
        close_button.innerHTML = "X";
        close_button.addEventListener("click", function (e) {
            minimap_opened = false;
            renderer.setContainer(null, false, false);
            miniwindow.parentNode.removeChild(miniwindow);
        });
        miniwindow.appendChild(close_button);
        //derwiah added
        var reset_button = document.createElement("div");
        reset_button.className = "corner-button2";
        reset_button.innerHTML = "R";
        reset_button.addEventListener("click", function (e) {
            renderer.offset = [0, 0];
            renderer.scale = 0.1;
            renderer.setZoom(0.1, [1, 1]);
        });
        miniwindow.appendChild(reset_button);
        this.root.querySelector(".content").appendChild(miniwindow);
    };
    Editor.prototype.addFullscreenButton = function () {
        $("#fullscreen-button").click(function () {
            // editor.goFullscreen();
            var elem = document.documentElement;
            var fullscreenElement = document.fullscreenElement ||
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
    };
    Editor.prototype.importContainerFromFile = function (position) {
        $('#import-panel-title').html("Import Container");
        $('#import-panel-body').show();
        $('#import-panel-message').hide();
        //clear upload file
        var uploadFile = $("#uploadFile");
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
            var reader = new FileReader();
            reader.onload = function (evt) {
                if (evt.target.readyState != 2)
                    return;
                if (evt.target.error) {
                    $('#import-panel-message').html("Error while reading file.");
                    $('#import-panel-message').show();
                    $('#import-panel-body').hide();
                    return;
                }
                var filebody = evt.target.result;
                $.ajax({
                    url: "/api/editor/ImportContainerJson/",
                    type: "POST",
                    data: {
                        json: filebody,
                        x: position[0],
                        y: position[1],
                        ownerContainerId: 0
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
    };
    Editor.prototype.importContainerFromScript = function (position) {
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
                    ownerContainerId: 0
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
    };
    Editor.prototype.importContainerFromURL = function (position) {
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
            var script;
            var url = $('#modal-panel-text').val();
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
                        ownerContainerId: 0
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
    };
    Editor.prototype.exportContainerToScript = function (id) {
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
    };
    Editor.prototype.exportContainerURL = function (id) {
        $('#modal-panel-title').html("Export Container");
        $('#modal-panel-form').html('<div class="field">' +
            'URL:  <input type="text" id="modal-panel-text">' +
            '</div>');
        var url = $(location).attr('host') + "/api/editor/serialize-container/" + id;
        var prefix = 'http://';
        if (url.substr(0, prefix.length) !== prefix) {
            url = prefix + url;
        }
        $('#modal-panel-text').val(url);
        $('#modal-panel').modal({
            dimmerSettings: { opacity: 0.3 },
            onHidden: function () {
            }
        }).modal('setting', 'transition', 'fade up').modal('show');
    };
    Editor.prototype.showNodeDescription = function (node) {
        $('#modal-panel-title').html(node.type);
        $('#modal-panel-form').html('<div class="field">' + node.descriprion + '</div>');
        $('#modal-panel-buttons').html('<a href="/editor/nodes-description" class="ui button">Show all nodes</a>' +
            '<div class="ui cancel button">Cancel</div>');
        $('#modal-panel').modal({
            dimmerSettings: { opacity: 0.3 },
            onHidden: function () {
            }
        }).modal('setting', 'transition', 'fade up').modal('show');
    };
    Editor.prototype.showNodeSettings = function (node) {
        $('#node-settings-title').html(node.type);
        //clear old body
        var body = $('#node-settings-body');
        body.empty();
        //add setting-elements from templates
        for (var s in node.settings) {
            if (!node.settings[s].type || node.settings[s].type == "string") {
                body.append(textSettingTemplate({ settings: node.settings[s], key: s }));
                continue;
            }
            switch (node.settings[s].type) {
                case "number":
                    body.append(numberSettingTemplate({ settings: node.settings[s], key: s }));
                    break;
                case "boolean":
                    body.append(checkboxSettingTemplate({ settings: node.settings[s], key: s }));
                    if (node.settings[s].value)
                        $('#node-setting-' + s).prop('checked', true);
                    break;
                case "dropdown":
                    var settings = utils_1.default.cloneObject(node.settings[s]);
                    //set selected element
                    for (var _i = 0, _a = settings.config.elements; _i < _a.length; _i++) {
                        var el = _a[_i];
                        if (el.key == settings.value)
                            el.selected = true;
                    }
                    body.append(dropdownSettingTemplate({ settings: settings, key: s }));
                    $('.ui.dropdown').dropdown();
                    break;
            }
        }
        //modal panel
        $('#node-settings-panel').modal({
            dimmerSettings: { opacity: 0.3 },
            onApprove: function () {
                //get settings from form
                var data = [];
                for (var s in node.settings) {
                    if (!node.settings[s].type || node.settings[s].type == "string") {
                        data.push({ key: s, value: $('#node-setting-' + s).val() });
                        continue;
                    }
                    switch (node.settings[s].type) {
                        case "number":
                            data.push({ key: s, value: $('#node-setting-' + s).val() });
                            break;
                        case "boolean":
                            data.push({ key: s, value: $('#node-setting-' + s).prop('checked') ? "true" : "false" });
                            break;
                        case "dropdown":
                            data.push({ key: s, value: $('#node-setting-' + s).val() });
                            break;
                    }
                }
                //send settings
                $.ajax({
                    url: "/api/editor/c/" + node.container.id + "/n/" + node.id + "/settings",
                    type: "PUT",
                    contentType: 'application/json',
                    data: JSON.stringify(data)
                });
            }
        }).modal('setting', 'transition', 'fade up').modal('show');
    };
    Editor.prototype.addPlayButton = function () {
        var that = this;
        $("#play-button").click(function () {
            if (that.isRunning)
                editor_client_socket_1.socket.sendStopContainer();
            else
                editor_client_socket_1.socket.sendRunContainer();
        });
    };
    Editor.prototype.addStepButton = function () {
        $("#step-button").click(function () {
            editor_client_socket_1.socket.sendStepContainer();
            // container.runStep();
        });
    };
    Editor.prototype.onContainerRun = function () {
        this.isRunning = true;
        $("#step-button").fadeTo(200, 0.3);
        $("#play-icon").addClass("stop");
        $("#play-icon").removeClass("play");
    };
    Editor.prototype.onContainerRunStep = function () {
        if (this.showSlotsValues)
            editor_client_socket_1.socket.sendGetSlotsValues();
    };
    Editor.prototype.onContainerStop = function () {
        this.isRunning = false;
        $("#step-button").fadeTo(200, 1);
        $("#play-icon").removeClass("stop");
        $("#play-icon").addClass("play");
    };
    Editor.prototype.addSlotsValuesButton = function () {
        var that = this;
        $("#slots-values-button").click(function () {
            that.showSlotsValues = !that.showSlotsValues;
            if (that.showSlotsValues) {
                $("#slots-values-icon").addClass("hide");
                $("#slots-values-icon").removeClass("unhide");
                that.socket.sendGetSlotsValues();
            }
            else {
                $("#slots-values-icon").removeClass("hide");
                $("#slots-values-icon").addClass("unhide");
                var container = that.renderer.container;
                for (var id in container._nodes) {
                    var node = container._nodes[id];
                    node.updateInputsLabels();
                    node.updateOutputsLabels();
                }
            }
        });
    };
    Editor.prototype.updateNodesLabels = function () {
        if (this.showSlotsValues)
            this.socket.sendGetSlotsValues();
        else {
            var container = this.renderer.container;
            for (var id in container._nodes) {
                var node = container._nodes[id];
                node.updateInputsLabels();
                node.updateOutputsLabels();
            }
        }
    };
    Editor.prototype.updateContainersNavigation = function () {
        var that = this;
        $("#containers-navigation").html("");
        addendButton(0, "Main");
        //if this is a sub-container
        if (this.renderer._containers_stack
            && this.renderer._containers_stack.length > 0) {
            //add containers
            var cont_count = this.renderer._containers_stack.length;
            for (var cont = 1; cont < cont_count; cont++) {
                var cont_name_1 = this.renderer._containers_stack[cont].container_node.title;
                var cont_id_1 = this.renderer._containers_stack[cont].id;
                addendButton(cont_id_1, cont_name_1);
            }
            //add this container
            var cont_name = this.renderer.container.container_node.title;
            var cont_id = this.renderer.container.id;
            addendButton(cont_id, cont_name);
        }
        function addendButton(cont_id, cont_name) {
            $("#containers-navigation")
                .append("<div id=\"container" + cont_id + "\" class=\"ui black tiny compact button\">" + cont_name + "</div>");
            $("#container" + cont_id).click(function () {
                for (var i = 0; i < 1000; i++) {
                    if (that.renderer.container.id == cont_id)
                        break;
                    that.renderer.closeContainer(false);
                }
                that.socket.sendJoinContainerRoom(that.renderer.container.id);
                exports.editor.updateNodesLabels();
            });
        }
    };
    Editor.prototype.updateBrowserUrl = function () {
        //change browser url
        var cid = exports.editor.renderer.container.id;
        if (cid == 0)
            window.history.pushState('Container ' + cid, 'MyNodes', '/editor/');
        else
            window.history.pushState('Container ' + cid, 'MyNodes', '/editor/c/' + cid);
    };
    Editor.prototype.getNodes = function () {
        this.socket.getContainerState();
        var that = this;
        this.socket.getNodes(function (nodes) {
            //open container from url
            var cont_id = window.container_id;
            if (cont_id && cont_id != 0) {
                //get containers stack
                var cont = container_1.Container.containers[cont_id];
                var parentStack = cont.getParentsStack();
                while (parentStack.length > 0) {
                    var cid = parentStack.pop();
                    if (cid != 0) {
                        var parent_cont = container_1.Container.containers[cid];
                        that.renderer.openContainer(parent_cont, false);
                    }
                }
                that.renderer.openContainer(cont, false);
            }
        });
    };
    return Editor;
}());
exports.Editor = Editor;
var minimap_opened = false;
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
var textSettingTemplate = Handlebars.compile($('#textSettingTemplate').html());
var numberSettingTemplate = Handlebars.compile($('#numberSettingTemplate').html());
var checkboxSettingTemplate = Handlebars.compile($('#checkboxSettingTemplate').html());
var dropdownSettingTemplate = Handlebars.compile($('#dropdownSettingTemplate').html());
exports.editor = new Editor();
