/*  MyNodes.NET 
 Copyright (C) 2016 Derwish <derwish.pro@gmail.com>
 License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


var socketConnected;

var elementsFadeTime = 300;

var lastSeens;

$(function () {

	//configure socket.io
	var socket = io.connect('/mysensors');

	socket.on('disconnect', function (nodeId) {
		noty({text: 'Web server is not responding!', type: 'error', timeout: false});
		socketConnected = false;
	});

	socket.on('connect', function (nodeId) {
		if (socketConnected == false) {
			noty({text: 'Connected to web server.', type: 'alert', timeout: false});
			getNodes();
			getGatewayInfo();
		}
		socketConnected = true;
	});


	socket.on('OnConnected', function () {
		noty({text: 'Gateway is connected.', type: 'alert', timeout: false});
	});

	socket.on('OnDisconnected', function () {
		noty({text: 'Gateway is disconnected!', type: 'error', timeout: false});
	});


	socket.on('OnNewNode', function (node) {
		createOrUpdateNode(node);
	});

	socket.on('OnNodeUpdated', function (node) {
		createOrUpdateNode(node);
	});

	socket.on('OnNodeLastSeenUpdated', function (node) {
		lastSeens[node.id] = node.lastSeen;
		updateLastSeen(node.id, node.lastSeen);
	});

	socket.on('OnNodeBatteryUpdated', function (node) {
		updateBattery(node);
	});

	socket.on('OnSensorUpdated', function (sensor) {
		createOrUpdateSensor(sensor);
	});

	socket.on('OnNewSensor', function (sensor) {
		createOrUpdateSensor(sensor);
	});

	socket.on('OnRemoveAllNodes', function () {
		removeAllNodes();
	});

	socket.on('OnRemoveNode', function (nodeId) {
		removeNode(nodeId);
	});


	setInterval(updateAllLastSeens, 1000);

	getNodes();
	getGatewayInfo();
});


function getGatewayInfo() {
	$.ajax({
		url: "/MySensorsAPI/GetGatewayInfo/",
		success: function (gatewayInfo) {
			if (gatewayInfo.state == 1 || gatewayInfo.state == 2) {
				noty({text: 'Gateway is not connected!', type: 'error', timeout: false});
			}
		}
	});
}


function getNodes() {
	$.ajax({
		url: "/MySensorsAPI/GetAllNodes/",
		success: function (nodes) {
			onReturnNodes(nodes);
		},
		error: function (error) {
			console.log(error);
		}
	});
}


function onReturnNodes(nodes) {
	$('#nodesContainer').empty();

	for (var i = 0; i < nodes.length; i++) {
		createOrUpdateNode(nodes[i]);
	}

	lastSeens = {};

	for (var i = 0; i < nodes.length; i++) {
		lastSeens[nodes[i].id] = nodes[i].lastSeen;
	}
	updateAllLastSeens();
}


var nodeTemplate = Handlebars.compile($('#nodeTemplate').html());
var sensorTemplate = Handlebars.compile($('#sensorTemplate').html());

Handlebars.registerHelper("fullDate", function (datetime) {
	return moment(datetime).format("DD/MM/YYYY HH:mm:ss");
});

Handlebars.registerHelper("yes-no", function (boolean) {
	if (boolean == null)
		return "Unknown";
	else if (boolean)
		return "Yes";
	else
		return "No";
});

Handlebars.registerHelper("sensor-id", function (sensor) {
	return sensor.nodeId + "-" + sensor.id;
});


Handlebars.registerHelper("sensor-type", function (sensor) {
	return getSensorType(sensor);
});

function getSensorType(sensor) {
	var type = Object.keys(mySensors.sensorType)[sensor.type];
	if (type == null)
		type = "Unknown";
	return type;
}

function getDataType(sensor) {
	var type = Object.keys(mySensors.sensorDataType)[sensor.dataType];
	if (type == null)
		type = "Unknown";
	return type;
}

function createOrUpdateNode(node) {
	var nodePanel = $('#nodePanel' + node.id);

	if (nodePanel.length == 0) {
		//create new
		$(nodeTemplate(node)).hide().appendTo("#nodesContainer").fadeIn(elementsFadeTime);
	} else {
		//update
		nodePanel.html(nodeTemplate(node));
	}

	for (var i = 0; i < node.sensors.length; i++) {
		createOrUpdateSensor(node.sensors[i]);
	}
}


function updateBattery(node) {
	var nodeBattery = $('#nodeBattery' + node.id);

	if (nodeBattery.length == 0)
		createOrUpdateNode(node);
	else nodeBattery.html(node.batteryLevel);
}


function createOrUpdateSensor(sensor) {
	var id = sensor.nodeId + "-" + sensor.id;

	if ($('#sensorPanel' + id).length == 0) {
		//create new
		$(sensorTemplate(sensor)).hide().appendTo("#sensorsContainer" + sensor.nodeId).fadeIn(elementsFadeTime);
	}


	var state = sensor.state;
	if (state == "" || state == null)
		state = "null";

	$('#sensorType' + id).html(getSensorType(sensor));
	$('#dataType' + id).html(getDataType(sensor));
	$('#state' + id).html(state);
}


function updateLastSeen(nodeId, lastSeen) {

	var date1 = new Date(lastSeen);
	var date2 = new Date();
	var diff = Math.abs(date2.getTime() - date1.getTime());
	var days = Math.floor(diff / (1000 * 60 * 60 * 24));

	diff -= days * (1000 * 60 * 60 * 24);

	var hours = Math.floor(diff / (1000 * 60 * 60));
	diff -= hours * (1000 * 60 * 60);

	var mins = Math.floor(diff / (1000 * 60));
	diff -= mins * (1000 * 60);

	var seconds = Math.floor(diff / (1000));
	diff -= seconds * (1000);

	var elspsed;
	if (days != 0)
		elapsed = days + "d " + hours + "h " + mins + "m " + seconds + "s";
	else if (hours != 0)
		elapsed = hours + "h " + mins + "m " + seconds + "s";
	else if (mins != 0)
		elapsed = mins + "m " + seconds + "s";
	else
		elapsed = seconds + "s";

	$('#nodeLastSeen' + nodeId)
		.html(elapsed);

}

function updateAllLastSeens(sensor) {
	for (var key in lastSeens) {
		updateLastSeen(key, lastSeens[key]);
	}
}

function removeNode(nodeId) {
	$('#nodePanel' + nodeId).fadeOut(elementsFadeTime, function () {
		$(this).remove();
	});
}


function removeAllNodes() {
	$('#nodesContainer').fadeOut(elementsFadeTime, function () {
		$(this).html();
	});
}