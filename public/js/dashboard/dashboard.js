/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var container_1 = require("../../nodes/container");
var dashboard_client_socket_1 = require("./dashboard-client-socket");
require("../../nodes/nodes/index");
var panelTemplate = Handlebars.compile($('#panelTemplate').html());
//todo get id
var container_id = 0;
var Dashboard = (function () {
    function Dashboard() {
        //get vars from view
        var container_id = window.container_id;
        //create panel
        this.createPanel(container_id);
        //create container
        this.container = new container_1.Container(container_1.Side.dashboard, container_id);
        //create socket
        this.socket = new dashboard_client_socket_1.DashboardClientSocket(container_id);
        this.container.clinet_socket = this.socket.socket;
        this.socket.getContainer();
        //globals for easy debug in dev-console
        window.dashboard = this;
        window.container = this.container;
        window.Container = container_1.Container;
    }
    Dashboard.prototype.checkPanelForRemove = function (panelId) {
        var panelBody = $('#uiContainer-' + panelId);
        if (panelBody.children().length == 0)
            this.removePanel(panelId);
    };
    Dashboard.prototype.createPanel = function (panel_id, title) {
        $('#empty-message').hide();
        //create new
        $(panelTemplate({
            panel_id: panel_id,
            title: title
        })).hide().appendTo("#panelsContainer").fadeIn(300);
    };
    Dashboard.prototype.removePanel = function (panelId) {
        $('#panel-' + panelId).fadeOut(300, function () {
            $(this).remove();
        });
    };
    Dashboard.prototype.updatePanel = function (node) {
        var settings = JSON.parse(node.properties["Settings"]);
        $('#panelTitle-' + node.id).html(settings.Name.Value);
    };
    return Dashboard;
}());
exports.Dashboard = Dashboard;
exports.dashboard = new Dashboard();
