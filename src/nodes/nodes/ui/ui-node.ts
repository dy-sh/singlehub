/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../../node";
import { Container, Side } from "../../container";
const log = require('logplease').create('node', { color: 5 });


export class UiNode extends Node {

    titlePrefix: string;
    template: string;
    uiElementType: string;

    // onGetMessageToDashboardSide
    // onDashboardElementGetNodeState - this will override default logic in dashboard-server-socket
    // onDashboardElementSetNodeState - this will override default logic in dashboard-server-socket

    constructor(titlePrefix: string, uiElementType: string) {
        super();

        this.titlePrefix = titlePrefix;
        this.uiElementType = uiElementType;

        this.isDashboardNode = true;

        this.settings["title"] = { description: "Title", value: this.titlePrefix, type: "string" };
        this.settings["ui-panel"] = { description: "Ui Panel Name", type: "string" };
    }

    onCreated() {
        this.settings["ui-panel"].value = "Container" + this.container.id;

        if (this.side == Side.server) {
            this.container.dashboard.onNodeChangePanelOrTitle(
                this, this.settings["ui-panel"].value, this.settings["title"].value);
        }
    }

    onAdded() {
        this.changeTitle(this.settings["title"].value);
    }

    onBeforeSettingsChange(newSettings) {

        //change ui panel
        if (this.side == Side.server) {
            if (newSettings["ui-panel"].value != this.settings["ui-panel"].value
                || newSettings["title"].value != this.settings["title"].value) {
                this.container.dashboard.onNodeChangePanelOrTitle(
                    this, newSettings["ui-panel"].value, newSettings["title"].value);
            }
        }

        //change title
        this.changeTitle(newSettings['title'].value);
    }



    changeTitle(title: string) {
        let t = title;
        if (t.length > 10)
            t = t.substr(0, 10) + "...";

        if (t == this.titlePrefix || t == "")
            this.title = this.titlePrefix;
        else
            this.title = this.titlePrefix + ": " + t;

        this.size = this.computeSize();
    }

    onRemoved() {
        if (this.side == Side.server)
            this.container.dashboard.onNodeRemoved(this);
    }

    setState(state: any, sendToDashboard = true) {
        this.properties["state"] = state;

        //if called from constructor
        if (this.container == null)
            return;

        if (sendToDashboard) {
            let m = { id: this.id, cid: this.container.id, state: state };
            if (this.side == Side.server) {
                //send state to all clients in the room
                let socket = this.container.server_dashboard_socket;
                let panelName = this.settings["ui-panel"].value;
                socket.in("" + panelName).emit('dashboardElementGetNodeState', m);
            }
            else {
                //todo send from editor side
                // this.container.clinet_socket.emit('dashboardElementGetNodeState', m);
            }
        }
    }

    sendMessageToDashboardSide(mess: any) {
        let m = { id: this.id, cid: this.container.id, message: mess };
        if (this.side == Side.server) {
            let socket = this.container.server_dashboard_socket;
            let panelName = this.settings["ui-panel"].value;
            socket.in("" + panelName).emit('nodeMessageToDashboardSide', m);
        }
        else {
            this.container.clinet_socket.emit('nodeMessageToDashboardSide', m);
        }
    }

    getState() {
        return this.properties["state"];
    }
}