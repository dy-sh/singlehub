/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {Nodes} from "../../nodes/nodes"
import {Container, Side} from "../../nodes/container"
import {DashboardClientSocket} from "./dashboard-client-socket";


import "../../nodes/nodes/index";


(<any>window).Nodes = Nodes;
(<any>window).Container = Container;

//todo get id
let container_id = 0;

export class Dashboard {

    container: Container;
    socket: DashboardClientSocket;

    constructor() {

        //create container
        this.container = new Container(Side.dashboard, container_id);

        //create socket
        this.socket = new DashboardClientSocket(container_id);
        this.container.socket = this.socket.socket;

        //globals for easy debug in dev-console
        (<any>window).dashboard = this;
        (<any>window).container = this.container;
    }


}

export let dashboard = new Dashboard();