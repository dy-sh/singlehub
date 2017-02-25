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

let id = 0;

export class Dashboard {

    container: Container;
    socket: DashboardClientSocket;

    constructor() {
        (<any>window).dashboard = this;


        //create container
        this.container = new Container(Side.dashboard, id);

        //create socket
        this.socket = new DashboardClientSocket();
        this.container.socket = this.socket.socket;

        console.log("ok")
    }


}

export let dashboard = new Dashboard();