/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {Container, Side} from "../../nodes/container"
import {DashboardClientSocket} from "./dashboard-client-socket";

import "../../nodes/nodes/index";

let panelTemplate = Handlebars.compile($('#panelTemplate').html());


//todo get id
let container_id = 0;


export class Dashboard {

    container: Container;
    socket: DashboardClientSocket;

    constructor() {

        //get vars from view
        let container_id=(<any>window).container_id;

        //create panel
        this.createPanel(container_id);

        //create container
        this.container = new Container(Side.dashboard, container_id);

        //create socket
        this.socket = new DashboardClientSocket(container_id);
        this.container.clinet_socket = this.socket.socket;

        this.socket.getContainer();

        //globals for easy debug in dev-console
        (<any>window).dashboard = this;
        (<any>window).container = this.container;
        (<any>window).Container = Container;
    }


    checkPanelForRemove(panelId) {
        var panelBody = $('#uiContainer-' + panelId);
        if (panelBody.children().length == 0)
            this.removePanel(panelId);
    }


    createPanel(panel_id, title?) {
        $('#empty-message').hide();

        //create new
        $(panelTemplate({
            panel_id: panel_id,
            title: title
        })).hide().appendTo("#panelsContainer").fadeIn(300);

    }

    removePanel(panelId) {
        $('#panel-' + panelId).fadeOut(300, function () {
            $(this).remove();
        });
    }

    updatePanel(node) {
        var settings = JSON.parse(node.properties["Settings"]);
        $('#panelTitle-' + node.id).html(settings.Name.Value);
    }

}

export let dashboard = new Dashboard();