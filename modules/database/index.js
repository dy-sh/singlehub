/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "nedb", "../../public/nodes/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const NeDBDataStore = require("nedb");
    const utils_1 = require("../../public/nodes/utils");
    class Database {
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
            this.containers = new NeDBDataStore('containers.db');
            let that = this;
            this.users.loadDatabase(function (err) {
                if (err)
                    callback(err);
                else
                    that.nodes.loadDatabase(function (err) {
                        if (err)
                            callback(err);
                        else
                            that.containers.loadDatabase(callback);
                    });
            });
        }
        addContainer(c, callback) {
            let c_ser = c.serialize(false, false);
            c_ser._id = "" + c.id;
            this.containers.insert(c_ser, function (err, doc) {
                if (err)
                    utils_1.default.debugErr(err.message, "DATABASE");
                if (callback)
                    callback(err, doc);
            });
        }
        addNode(node, callback) {
            let ser_node = node.serialize();
            ser_node._id = "c" + ser_node.cid + "n" + ser_node.id;
            this.nodes.insert(ser_node, function (err, doc) {
                if (err)
                    utils_1.default.debugErr(err.message, "DATABASE");
                if (callback)
                    callback(err, doc);
            });
        }
        getContainers(callback) {
            this.containers.find({}, callback);
        }
        getNodes(callback) {
            this.nodes.find({}, callback);
        }
        getContainer(id, callback) {
            this.containers.findOne({ _id: "" + id }, callback);
        }
        getNode(id, cid, callback) {
            let _id = "c" + id + "n" + cid;
            this.containers.findOne({ _id: _id }, callback);
        }
    }
    exports.db = new Database();
});
//# sourceMappingURL=index.js.map