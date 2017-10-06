/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

const log = require('logplease').create('client', { color: 3 });
declare let moment;

export class ChartLogPage {

    container_id: number;
    node_id: number;
    max_records: number;
    socket: SocketIOClient.Socket;
    reconnecting = false;

    constructor() {
        this.container_id = (<any>window).container_id;
        this.node_id = (<any>window).node_id;
        this.max_records = (<any>window).max_records;

        this.createControles();
        this.createSocket();
    }


    private createSocket() {
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

        socket.on('nodeMessageToDashboard', function (n) {
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

            if (n.settings['maxRecords']) {
                that.max_records = n.settings['maxRecords'].value;
                that.removeOldRecords();
            }
        });
    }


    addRecord(record) {

        let date = moment(record.y).format("DD.MM.YYYY - H:mm:ss.SSS");
        $('#history-table').append("<tr><td>" + date + "</td><td>" + record.y + "</td></tr>");

        this.removeOldRecords();
    }

    removeOldRecords() {
        let rows = $('#history-table tr');
        let unwanted = rows.length - this.max_records;
        if (unwanted > 0) {
            for (let i = 0; i < unwanted; i++) {
                rows[i].remove();
            }
        }
    }

    createControles() {
        let that = this;
        $('#clear-button').click(function () {
            $.ajax({
                url: "/api/editor/c/" + that.container_id + "/n/" + that.node_id + "/clear",
                type: "POST"
            });
        });
    }

}

export let page = new ChartLogPage();