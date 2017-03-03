/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../nodes/container", "./dashboard-client-socket", "../../nodes/nodes/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../nodes/container");
    const dashboard_client_socket_1 = require("./dashboard-client-socket");
    require("../../nodes/nodes/index");
    let panelTemplate = Handlebars.compile($('#panelTemplate').html());
    //todo get id
    let container_id = 0;
    let elementsFadeTime = 300;
    class Dashboard {
        constructor() {
            //create panel
            this.createPanel(0, "Main");
            //create container
            this.container = new container_1.Container(container_1.Side.dashboard, container_id);
            //create socket
            this.socket = new dashboard_client_socket_1.DashboardClientSocket(container_id);
            this.container.clinet_socket = this.socket.socket;
            this.socket.getNodes();
            //globals for easy debug in dev-console
            window.dashboard = this;
            window.container = this.container;
            window.Container = container_1.Container;
        }
        checkPanelForRemove(panelId) {
            var panelBody = $('#uiContainer-' + panelId);
            if (panelBody.children().length == 0)
                this.removePanel(panelId);
        }
        createPanel(panel_id, title) {
            $('#empty-message').hide();
            //create new
            $(panelTemplate({ panel_id: panel_id, title: title })).hide().appendTo("#panelsContainer").fadeIn(elementsFadeTime);
            $('#panelTitle-' + panel_id).html(title);
        }
        removePanel(panelId) {
            $('#panel-' + panelId).fadeOut(elementsFadeTime, function () {
                $(this).remove();
            });
        }
        updatePanel(node) {
            var settings = JSON.parse(node.properties["Settings"]);
            $('#panelTitle-' + node.id).html(settings.Name.Value);
        }
    }
    exports.Dashboard = Dashboard;
    exports.dashboard = new Dashboard();
});
//# sourceMappingURL=dashboard.js.map