/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as NeDBDataStore from "nedb";
import { Container, SerializedContainer } from "../../public/nodes/container";
import { Node, SerializedNode } from "../../public/nodes/node";
import { UiPanel } from "../../public/dashboard/ui-panel";
import { Database } from "../../public/interfaces/database";
import { User } from "../../public/interfaces/user";

const log = require('logplease').create('database', { color: 4 });


class NeDbDatabase implements Database {


    users: NeDBDataStore;
    nodes: NeDBDataStore;
    dashboard: NeDBDataStore;
    app: NeDBDataStore;


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
        this.dashboard = new NeDBDataStore('dashboard.db');
        this.app = new NeDBDataStore('app.db');

        let that = this;
        this.users.loadDatabase(function (err) {

            if (err) {
                log.error(err);
                callback(err);
            }
            else that.nodes.loadDatabase(function (err) {
                if (err) {
                    log.error(err);
                    callback(err);
                }
                else that.dashboard.loadDatabase(function (err) {
                    if (err) {
                        log.error(err);
                        callback(err);
                    }
                    else that.app.loadDatabase((function (err) {
                        if (err)
                            log.error(err);
                        else
                            log.debug("Database loaded");

                        callback(err)
                    }));
                });
            });
        });
    }


    addNode(node: Node, callback?: (err?: Error, doc?: SerializedNode) => void) {
        let ser_node = node.serialize(true);
        (<any>ser_node)._id = "c" + ser_node.cid + "n" + ser_node.id;

        this.nodes.insert(ser_node, function (err, doc) {
            if (err) log.error(err);
            if (callback) callback(err, doc);
        })
    }

    addUiPanel(panel: UiPanel, callback?: (err?: Error, doc?: UiPanel) => void) {
        this.users.insert(panel, function (err, doc) {
            if (err) log.error(err);
            if (callback) callback(err, doc);
        })
    }


    addUser(user: User, callback?: (err?: Error, doc?: User) => void) {
        this.users.insert(user, function (err, doc) {
            if (err) log.error(err);
            if (callback) callback(err, doc);
        })
    }

    getNodes(callback?: (err?: Error, docs?: Array<SerializedNode>) => void) {
        this.nodes.find({}, function (err, docs) {
            if (err) log.error(err);
            if (callback) callback(err, docs);
        })
    }

    getUiPanels(callback?: (err?: Error, docs?: UiPanel[]) => void) {
        this.dashboard.find({}, function (err, docs) {
            if (err) log.error(err);
            if (callback) callback(err, docs);
        })
    }


    getUsers(callback?: (err?: Error, docs?: Array<User>) => void) {
        this.users.find({}, function (err, docs) {
            if (err) log.error(err);
            if (callback) callback(err, docs);
        })
    }

    getNode(id: number, cid: number, callback?: (err?: Error, doc?: SerializedNode) => void) {
        let _id = "c" + cid + "n" + id;
        this.nodes.findOne({ _id: _id }, function (err, doc: any) {
            if (err) log.error(err);
            if (callback) callback(err, doc);
        })
    }

    getUiPanel(name: string, callback?: (err?: Error, doc?: UiPanel) => void) {
        this.dashboard.findOne({ name: name }, function (err, doc: any) {
            if (err) log.error(err);
            if (callback) callback(err, doc);
        })
    }


    getUser(name: string, callback?: (err?: Error, doc?: User) => void) {
        this.users.findOne({ name: name }, function (err, doc: any) {
            if (err) log.error(err);
            if (callback) callback(err, doc);
        })
    }


    updateNode(id: number, cid: number, update: any, callback?: (err?: Error) => void) {
        let _id = "c" + cid + "n" + id;
        this.nodes.update({ _id: _id }, update, {}, function (err, updated) {
            if (err) log.error(err);
            if (updated == 0) log.error(`Cat't update node [${cid}/${id}]. Document not found.`);
            if (callback) callback(err);
        })
    }

    updateUiPanel(name: string, update: any, callback?: (err?: Error) => void) {
        this.dashboard.update({ name: name }, update, {}, function (err, updated) {
            if (err) log.error(err);
            if (updated == 0) log.error(`Cat't update dashboard panel [${name}]. Document not found.`);
            if (callback) callback(err);
        })
    }


    getUsersCount(callback?: (err?: Error, num?: number) => void) {
        this.users.count({}, function (err, num) {
            if (err) log.error(err);
            if (callback) callback(err, num);
        })
    }

    dropUsers(callback?: (err?: Error) => void) {
        this.users.remove({}, { multi: true }, function (err) {
            if (err) log.error(err);
            if (callback) callback(err);
        })
    }

    dropNodes(callback?: (err?: Error) => void) {
        this.nodes.remove({}, { multi: true }, function (err) {
            if (err) log.error(err);
            if (callback) callback(err);
        })
    }


    dropUiPanels(callback?: (err?: Error) => void) {
        this.dashboard.remove({}, { multi: true }, function (err) {
            if (err) log.error(err);
            if (callback) callback(err);
        })
    }

    dropApp(callback?: (err?: Error) => void) {
        this.app.remove({}, { multi: true }, function (err) {
            if (err) log.error(err);
            if (callback) callback(err);
        })
    }


    removeNode(id: number, cid: number, callback?: (err?: Error) => void) {
        let _id = "c" + cid + "n" + id;
        this.nodes.remove({ _id: _id }, {}, function (err, removed) {
            if (err) log.error(err);
            if (removed == 0) log.error("Cat't remove. Document not found.");
            if (callback) callback(err);
        })
    }

    removeUiPanel(name: string, callback?: (err?: Error) => void) {
        this.dashboard.remove({ name: name }, {}, function (err, removed) {
            if (err) log.error(err);
            if (removed == 0) log.error("Cat't remove. Document not found.");
            if (callback) callback(err);
        })
    }

    getLastContainerId(callback?: (err?: Error, id?: number) => void) {
        this.app.findOne({ _id: "lastContainerId" }, function (err, doc: any) {
            if (err) log.error(err);
            if (callback) {
                if (doc)
                    callback(err, doc.last);
                else
                    callback(err, null);
            }
        })
    }

    updateLastContainerId(id: number, callback?: (err?: Error) => void) {
        this.app.update({ _id: "lastContainerId" }, { $set: { last: id } }, { upsert: true }, function (err, updated) {
            if (err) log.error(err);
            if (updated == 0) log.error("Cat't update. Document not found.");
            if (callback) callback(err);
        })
    }

    getLastRootNodeId(callback?: (err?: Error, id?: number) => void) {
        this.app.findOne({ _id: "lastRootNodeId" }, function (err, doc: any) {
            if (err) log.error(err);
            if (callback) {
                if (doc)
                    callback(err, doc.last);
                else
                    callback(err, null);
            }
        })
    }

    updateLastRootNodeId(id: number, callback?: (err?: Error) => void) {
        this.app.update({ _id: "lastRootNodeId" }, { $set: { last: id } }, { upsert: true }, function (err, updated) {
            if (err) log.error(err);
            if (updated == 0) log.error("Cat't update. Document not found.");
            if (callback) callback(err);
        })
    }
}

export let db = new NeDbDatabase();