/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */

import * as NeDBDataStore from "nedb";
import {rootContainer, Container, SerializedContainer} from "../../public/nodes/container";
import {Nodes} from "../../public/nodes/nodes";
import {Node, SerializedNode} from "../../public/nodes/node";
import Utils from "../../public/nodes/utils";
import {Database} from "../../public/interfaces/database";

class NeDbDatabase implements Database{
    users: NeDBDataStore;
    nodes: NeDBDataStore;
    containers: NeDBDataStore;


    constructor() {
        // Using a unique constraint with the index
        // this.users.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
        //    if (err)
        //     console.log(err);
        // });
    }

    loadDatabase(callback?: (err: Error) => void) {
        this.users = new NeDBDataStore('users.db');
        this.nodes = new NeDBDataStore('nodes.db');
        this.containers = new NeDBDataStore('containers.db');

        let that = this;
        this.users.loadDatabase(function (err) {
            if (err) callback(err);
            else that.nodes.loadDatabase(function (err) {
                if (err) callback(err);
                else that.containers.loadDatabase(callback);
            });
        });
    }


    addContainer(c: Container, callback?: (err?: Error, doc?: SerializedContainer) => void) {
        let c_ser = c.serialize(false, false);
        (<any>c_ser)._id = "" + c.id;

        this.containers.insert(c_ser, function (err, doc) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err, doc);
        })
    }

    addNode(node: Node, callback?: (err?: Error, doc?: SerializedNode) => void) {
        let ser_node = node.serialize();
        (<any>ser_node)._id = "c" + ser_node.cid + "n" + ser_node.id;

        this.nodes.insert(ser_node, function (err, doc) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err, doc);
        })
    }

    getContainers(callback?: (err?: Error, docs?: Array<SerializedContainer>) => void) {
        this.containers.find({}, function (err, docs) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err, docs);
        })
    }

    getNodes(callback?: (err?: Error, docs?: Array<SerializedNode>) => void) {
        this.nodes.find({}, function (err, docs) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err, docs);
        })
    }

    getContainer(id: number, callback?: (err?: Error, doc?: SerializedContainer) => void) {
        this.containers.findOne({_id: "" + id}, function (err, doc: any) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err, doc);
        })
    }

    getNode(id: number, cid: number, callback?: (err?: Error, doc?: SerializedNode) => void) {
        let _id = "c" + id + "n" + cid;
        this.nodes.findOne({_id: _id}, function (err, doc: any) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err, doc);
        })
    }

    updateContainer(id: number, update: any, callback?: (err?: Error) => void) {
        this.containers.update({_id: "" + id}, {$set: update}, function (err) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err);
        })
    }

    updateNode(id: number, cid: number, update: any, callback?: (err?: Error) => void) {
        let _id = "c" + id + "n" + cid;
        this.nodes.update({_id: _id}, {$set: update}, function (err) {
            if (err) Utils.debugErr(err.message, "DATABASE");
            if (callback) callback(err);
        })
    }
}

export let db = new NeDbDatabase();