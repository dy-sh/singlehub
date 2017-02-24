/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "nedb"], factory);
    }
})(function (require, exports) {
    "use strict";
    const NeDBDataStore = require("nedb");
    const log = require('logplease').create('database', { color: 4 });
    class NeDbDatabase {
        constructor() {
            // Using a unique constraint with the index
            // this.users.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
            //    if (err)
            //     console.log(err);
            // });
        }
        loadDatabase(callback) {
            this.users = new NeDBDataStore('users.db');
            this.nodes = new NeDBDataStore('nodes.db');
            this.app = new NeDBDataStore('app.db');
            let that = this;
            this.users.loadDatabase(function (err) {
                if (err) {
                    log.error(err);
                    callback(err);
                }
                else
                    that.nodes.loadDatabase(function (err) {
                        if (err) {
                            log.error(err);
                            callback(err);
                        }
                        else
                            that.app.loadDatabase((function (err) {
                                if (err)
                                    log.error(err);
                                else
                                    log.debug("Database loaded");
                                callback(err);
                            }));
                    });
            });
        }
        addNode(node, callback) {
            let ser_node = node.serialize(true);
            ser_node._id = "c" + ser_node.cid + "n" + ser_node.id;
            this.nodes.insert(ser_node, function (err, doc) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err, doc);
            });
        }
        addUser(user, callback) {
            this.users.insert(user, function (err, doc) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err, doc);
            });
        }
        getNodes(callback) {
            this.nodes.find({}, function (err, docs) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err, docs);
            });
        }
        getUsers(callback) {
            this.users.find({}, function (err, docs) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err, docs);
            });
        }
        getNode(id, cid, callback) {
            let _id = "c" + cid + "n" + id;
            this.nodes.findOne({ _id: _id }, function (err, doc) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err, doc);
            });
        }
        getUser(name, callback) {
            this.users.findOne({ name: name }, function (err, doc) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err, doc);
            });
        }
        updateNode(id, cid, update, callback) {
            let _id = "c" + cid + "n" + id;
            this.nodes.update({ _id: _id }, { $set: update }, function (err, updated) {
                if (err)
                    log.error(err);
                if (updated == 0)
                    log.error(`Cat't update node [${cid}/${id}]. Document not found.`);
                if (callback)
                    callback(err);
            });
        }
        getUsersCount(callback) {
            this.users.count({}, function (err, num) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err, num);
            });
        }
        dropUsers(callback) {
            this.users.remove({}, { multi: true }, function (err) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err);
            });
        }
        dropNodes(callback) {
            this.nodes.remove({}, { multi: true }, function (err) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err);
            });
        }
        dropApp(callback) {
            this.app.remove({}, { multi: true }, function (err) {
                if (err)
                    log.error(err);
                if (callback)
                    callback(err);
            });
        }
        removeNode(id, cid, callback) {
            let _id = "c" + cid + "n" + id;
            this.nodes.remove({ _id: _id }, {}, function (err, removed) {
                if (err)
                    log.error(err);
                if (removed == 0)
                    log.error("Cat't remove. Document not found.");
                if (callback)
                    callback(err);
            });
        }
        getLastContainerId(callback) {
            this.app.findOne({ _id: "lastContainerId" }, function (err, doc) {
                if (err)
                    log.error(err);
                if (callback) {
                    if (doc)
                        callback(err, doc.last);
                    else
                        callback(err, null);
                }
            });
        }
        updateLastContainerId(id, callback) {
            this.app.update({ _id: "lastContainerId" }, { $set: { last: id } }, { upsert: true }, function (err, updated) {
                if (err)
                    log.error(err);
                if (updated == 0)
                    log.error("Cat't update. Document not found.");
                if (callback)
                    callback(err);
            });
        }
        getLastRootNodeId(callback) {
            this.app.findOne({ _id: "lastRootNodeId" }, function (err, doc) {
                if (err)
                    log.error(err);
                if (callback) {
                    if (doc)
                        callback(err, doc.last);
                    else
                        callback(err, null);
                }
            });
        }
        updateLastRootNodeId(id, callback) {
            this.app.update({ _id: "lastRootNodeId" }, { $set: { last: id } }, { upsert: true }, function (err, updated) {
                if (err)
                    log.error(err);
                if (updated == 0)
                    log.error("Cat't update. Document not found.");
                if (callback)
                    callback(err);
            });
        }
    }
    exports.db = new NeDbDatabase();
});
//# sourceMappingURL=neDbDatabase.js.map