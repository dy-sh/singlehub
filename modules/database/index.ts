/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */

import * as NeDBDataStore from "nedb";
import {rootContainer, Container} from "../../public/nodes/container";
import {Nodes} from "../../public/nodes/nodes";
import Utils from "../../public/nodes/utils";

class Database {
    users: NeDBDataStore;
    nodes: NeDBDataStore;
    containers: NeDBDataStore;

    constructor() {
        this.users = new NeDBDataStore('users.db');
        this.nodes = new NeDBDataStore('nodes.db');
        this.containers = new NeDBDataStore('containers.db');
        this.users.loadDatabase();
        this.nodes.loadDatabase();
        this.containers.loadDatabase();

        // Using a unique constraint with the index
        // this.users.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
        //    if (err)
        //     console.log(err);
        // });
    }

    importNodes() {

        // this.containers.find({},function (err, containers) {
        //     if (!containers)
        //         return;
        //
        //     for(let c of containers){
        //
        //     }
        // });

        this.nodes.find({},function (err, nodes) {
            if (!nodes)
                return;

            for(let n of nodes){
                let cont=Container.containers[n.cid];

                let node = Nodes.createNode(n.type, n.title);
                if (!node) {
                    Utils.debugErr("Node not found: " + n.type, this);
                    continue;
                }

                node.id = n.id; //id it or it will create a new id
                cont.add(node); //add before configure, otherwise configure cannot create links
                node.configure(n);
            }
        });

    }
}

export let db = new Database();