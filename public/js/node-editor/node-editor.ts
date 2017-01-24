import {Nodes,Node} from "../../nodes/nodes"
import {NodesEngine,engine} from "../../nodes/nodes-engine"
import {NodeEditorCanvas} from "./node-editor-canvas"
import {NodeEditorSocket,socket} from "./node-editor-socket";
import {themes} from "./node-editor-themes"


export class NodeEditor {
	private root: HTMLDivElement;
	graph: NodesEngine;
	graphcanvas: NodeEditorCanvas;
	socket: NodeEditorSocket;
	//nodes: Nodes;


	constructor() {
		//fill container
		let html = "<div class='content'><div class='editor-area'><canvas class='graphcanvas' width='1000' height='500' tabindex=10></canvas></div></div>";

		let root = document.createElement("div");
		this.root = root;
		root.className = "node-editor";
		root.innerHTML = html;

		let canvas = root.querySelector(".graphcanvas");

		//nodes options theme
		if ((<any>window).theme)
			Nodes.options=themes[(<any>window).theme];



		//create graph
		let graph = this.graph = engine;

		//create socket
		this.socket = socket;

		//create canvas
		let graphcanvas = this.graphcanvas = new NodeEditorCanvas(
			canvas,
			this.socket,
			this,
			graph);
	   // graphcanvas.background_image = "/images/litegraph/grid.png";
		graph.onAfterExecute = function () { graphcanvas.draw(true) };





		//add stuff

		this.addMiniWindow(200, 200);

		//append to DOM
		let parent = document.getElementById("main");
		if (parent)
			parent.appendChild(root);

		graphcanvas.resize();
		//graphcanvas.draw(true,true);
	}

	addMiniWindow(w, h) {

		if (minimap_opened)
			return;

		minimap_opened = true;

		let miniwindow = document.createElement("div");
		miniwindow.className = "litegraph miniwindow";
		miniwindow.innerHTML = "<canvas class='graphcanvas' width='" + w + "' height='" + h + "' tabindex=10></canvas>";
		let canvas = miniwindow.querySelector("canvas");

		let graphcanvas = new NodeEditorCanvas(canvas, this.socket,this,this.graph);
		//  graphcanvas.background_image = "images/litegraph/grid.png";
		//derwish edit
		graphcanvas.scale = 0.1;
		//graphcanvas.allow_dragnodes = false;

		graphcanvas.offset = [0, 0];
		graphcanvas.scale = 0.1;
		graphcanvas.setZoom(0.1, [1, 1]);

		miniwindow.style.position = "absolute";
		miniwindow.style.top = "4px";
		miniwindow.style.right = "4px";

		let close_button = document.createElement("div");
		close_button.className = "corner-button";
		close_button.innerHTML = "X";
		close_button.addEventListener("click", function (e) {
			minimap_opened = false;
			graphcanvas.setGraph(null);
			miniwindow.parentNode.removeChild(miniwindow);
		});
		miniwindow.appendChild(close_button);

		//derwiah added
		let reset_button = document.createElement("div");
		reset_button.className = "corner-button2";
		reset_button.innerHTML = "R";
		reset_button.addEventListener("click", function (e) {
			graphcanvas.offset = [0, 0];
			graphcanvas.scale = 0.1;
			graphcanvas.setZoom(0.1, [1, 1]);
		});
		miniwindow.appendChild(reset_button);

		this.root.querySelector(".content").appendChild(miniwindow);

	}

	importPanelFromFile(position) {

		$('#import-panel-title').html("Import Panel");

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
			};

			let reader = new FileReader();

			reader.onload = function (evt) {
				if ((<any>evt).target.readyState != 2) return;
				if ((<any>evt).target.error) {
					$('#import-panel-message').html("Error while reading file.");
					$('#import-panel-message').show();
					$('#import-panel-body').hide();
					return;
				}

				let filebody = (<any>evt).target.result;

				$.ajax({
					url: "/NodeEditorAPI/ImportPanelJson/",
					type: "POST",
					data: {
						json: filebody,
						x: position[0],
						y: position[1],
						ownerPanelId: (<any>window).this_panel_id
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

	importPanelFromScript(position) {
		$('#modal-panel-submit').show();

		$('#modal-panel-title').html("Import Panel");
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
				url: "/NodeEditorAPI/ImportPanelJson/",
				type: "POST",
				data: {
					json: $('#modal-panel-text').val(),
					x: position[0],
					y: position[1],
					ownerPanelId: (<any>window).this_panel_id
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

	importPanelFromURL(position) {
		$('#modal-panel-submit').show();

		$('#modal-panel-title').html("Import Panel");
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
			let url = $('#modal-panel-text').val();

			$.ajax({
				url: url,
				type: "POST",
				success: function (result) {
					script = result;
					importPanel(script);
				},
				error: function (result) {
					$('#modal-panel-form').removeClass("loading");
					$('#modal-panel-message').addClass("negative");
					$('#modal-panel-message').html("Error loading data. URL is incorrect.");
					$('#modal-panel-message').show();

				}
			});

			function importPanel(script) {
				$.ajax({
					url: "/NodeEditorAPI/ImportPanelJson/",
					type: "POST",
					data: {
						json: script,
						x: position[0],
						y: position[1],
						ownerPanelId:(<any>window).this_panel_id
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

	exportPanelToScript(id) {

		$('#modal-panel-message').html("Generating script...");
		$('#modal-panel-message').fadeIn(300);

		$('#modal-panel-title').html("Export Panel");
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
			url: "/NodeEditorAPI/SerializePanel/",
			type: "POST",
			data: { id: id },
			success: function (result) {
				$('#modal-panel-text').html(result);
				$('#modal-panel-text').fadeIn(300);
				$('#modal-panel-message').hide();
			}
		});
	}

	exportPanelURL(id) {

		$('#modal-panel-title').html("Export Panel");
		$('#modal-panel-form').html(
				   '<div class="field">' +
				   'URL:  <input type="text" id="modal-panel-text">' +
				   '</div>');
		let url = $(location).attr('host') + "/NodeEditorAPI/SerializePanel/" + id;

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

	showNodeDescrition(node) {

		$('#modal-panel-title').html(node.type);
		$('#modal-panel-form').html(
			'<div class="field">' +
			'<div id="modal-panel-text"></div>' +
			'</div>' +
			'<div class="field">' +
			'<a href="/NodeEditor/NodesDescription">Show description of all nodes</a>' +
			'</div>'
		);

		$.ajax({
			url: "/NodeEditorAPI/GetNodeDescription/",
			type: "POST",
			data: { id: node.id },
			success: function (result) {
				$('#modal-panel-text').html(result);
				$('#modal-panel-text').fadeIn(300);
				$('#modal-panel-message').hide();

				(<any>$('#modal-panel')).modal({
					dimmerSettings: { opacity: 0.3 },
					onHidden: function () {
					}
				}).modal('setting', 'transition', 'fade up').modal('show');
			}
		});
	}
}

let minimap_opened = false;

// noty settings
$.noty.defaults.layout = 'bottomRight';
$.noty.defaults.theme = 'relax';
$.noty.defaults.timeout = 3000;
$.noty.defaults.animation = {
    open: 'animated bounceInRight', // Animate.css class names
    close: 'animated flipOutX', // Animate.css class names
    easing: 'swing', // unavailable - no need
    speed: 500 // unavailable - no need
};


//setting-elements templates
let textSettingTemplate = Handlebars.compile($('#textSettingTemplate').html());
let numberSettingTemplate = Handlebars.compile($('#numberSettingTemplate').html());
let checkboxSettingTemplate = Handlebars.compile($('#checkboxSettingTemplate').html());


function NodeSettings(node) {
    $('#node-settings-title').html(node.type);

    //parse settings from json
    let settings = JSON.parse(node.properties['Settings']);

    //clear old body
    let body = $('#node-settings-body');
    body.empty();

    //add setting-elements from templates
    for (let i = 0; i < Object.keys(settings).length ; i++) {
        let key = Object.keys(settings)[i];

        settings[key].Key = key;

        switch(settings[key].Type) {
            case 0:
                body.append(textSettingTemplate(settings[key]));
                break;
            case 1:
                body.append(numberSettingTemplate(settings[key]));
                break;
            case 2:
                body.append( checkboxSettingTemplate(settings[key]));
                if (settings[key].Value == "true")
                    $('#node-setting-' + key).prop('checked', true);
                break;
        }
    }

    
    //modal panel
	(<any>$('#node-settings-panel')).modal({
        dimmerSettings: { opacity: 0.3 },
        onApprove: function () {

            //get settings from form
            let data = [];
            for (let i = 0; i < Object.keys(settings).length ; i++) {
                let key = Object.keys(settings)[i];

                switch (settings[key].Type) {
                    case 0:
                        data.push({key: key, value: $('#node-setting-' + key).val()});
                        break;
                    case 1:
                        data.push({key: key, value: $('#node-setting-' + key).val()});
                        break;
                    case 2:
                        data.push({key: key, value: $('#node-setting-' + key).prop('checked')?"true":"false"});
                        break;
                }
            }

            //send settings
            $.ajax({
                url: "/NodeEditorAPI/SetNodeSettings/",
                type: "POST",
                data: {id: node.id, data: data}
            });
        }
    }).modal('setting', 'transition', 'fade up').modal('show');
}


export var editor= new NodeEditor();