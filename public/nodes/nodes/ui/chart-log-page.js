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
    let log = Logger.create('client', { color: 3 });
    class ChartLogPage {
        constructor() {
            this.reconnecting = false;
            this.container_id = window.container_id;
            this.node_id = window.node_id;
            this.max_records = window.max_records;
            this.createControles();
            this.createSocket();
        }
        createSocket() {
            let socket = io('/dashboard');
            this.socket = socket;
            let that = this;
            socket.on('connect', function () {
                log.debug("Connected to socket");
                //join to room
                log.debug("Join to dashboard room [" + that.container_id + "]");
                socket.emit('room', that.container_id);
                if (that.reconnecting) {
                    noty({ text: 'Connection is restored.', type: 'alert' });
                    that.reconnecting = false;
                }
            });
            socket.on('disconnect', function () {
                noty({ text: 'Connection is lost!', type: 'error' });
                that.reconnecting = true;
            });
            socket.on('node-message-to-dashboard-side', function (n) {
                if (n.cid != that.container_id || n.id != that.node_id)
                    return;
                let data = n.value;
                if (data.clear)
                    $('#history-table').html("");
                if (data.value)
                    that.addRecord(data.value);
            });
            socket.on('node-settings', function (n) {
                if (n.cid != that.container_id || n.id != that.node_id)
                    return;
                if (n.settings['maxRecords'])
                    that.max_records = n.settings['maxRecords'].value;
            });
        }
        addRecord(record) {
            let date = moment(record.y).format("DD.MM.YYYY - H:mm:ss.SSS");
            $('#history-table').append("<tr><td>" + date + "</td><td>" + record.y + "</td></tr>");
        }
        createControles() {
            $('#clear-button').click(function () {
                $.ajax({
                    url: "/api/editor/c/" + this.container_id + "/n/" + this.node_id + "/clear",
                    type: "POST"
                });
            });
        }
    }
    exports.ChartLogPage = ChartLogPage;
    exports.page = new ChartLogPage();
});
//# sourceMappingURL=chart-log-page.js.map