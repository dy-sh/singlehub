/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var ChartLogPage;
    (function (ChartLogPage) {
        // --------------------- socket --------------
        let socket = io('/dashboard');
        let reconnecting = false;
        socket.on('connect', function () {
            //join to room
            socket.emit('room', container_id);
            if (reconnecting) {
                noty({ text: 'Connection is restored.', type: 'alert' });
                this.reconnecting = false;
            }
        });
        socket.on('disconnect', function () {
            noty({ text: 'Connection is lost!', type: 'error' });
            reconnecting = true;
        });
        socket.on('node-message-to-dashboard-side', function (n) {
            if (n.cid != container_id || n.id != node_id)
                return;
            let data = n.value;
            if (data.clear)
                dataset.clear();
            if (data.value)
                addChartData(data.value);
            if (data.style) {
                console.log(data.style);
                $("#chartstyle").dropdown('set selected', data.style);
            }
        });
        socket.on('node-settings', function (n) {
            if (n.cid != container_id || n.id != node_id)
                return;
            if (n.settings['maxRecords'])
                max_records = n.settings['maxRecords'].value;
        });
        function updateLog(node) {
            var now = moment().format("DD.MM.YYYY H:mm:ss");
            $('#history-table').append("<tr><td>" + now + "</td><td>" + node.State + "</td></tr>");
        }
        $('#clear-button').click(function () {
            $.ajax({
                url: "/api/editor/c/" + container_id + "/n/" + node_id + "/clear",
                type: "POST"
            });
        });
    })(ChartLogPage = exports.ChartLogPage || (exports.ChartLogPage = {}));
});
//# sourceMappingURL=chart-log-page.js.map