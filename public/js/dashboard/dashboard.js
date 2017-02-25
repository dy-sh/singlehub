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
        define(["require", "exports", "../../nodes/nodes", "../../nodes/container", "./dashboard-client-socket", "../../nodes/nodes/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes/nodes");
    const container_1 = require("../../nodes/container");
    const dashboard_client_socket_1 = require("./dashboard-client-socket");
    require("../../nodes/nodes/index");
    window.Nodes = nodes_1.Nodes;
    window.Container = container_1.Container;
    let id = 0;
    class Dashboard {
        constructor() {
            window.dashboard = this;
            //create container
            this.container = new container_1.Container(container_1.Side.dashboard, id);
            //create socket
            this.socket = new dashboard_client_socket_1.DashboardClientSocket();
            this.container.socket = this.socket.socket;
            console.log("ok");
        }
    }
    exports.Dashboard = Dashboard;
    exports.dashboard = new Dashboard();
});
//# sourceMappingURL=dashboard.js.map