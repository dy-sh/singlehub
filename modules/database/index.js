/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "nedb", "../../public/nodes/container", "../../public/nodes/nodes", "../../public/nodes/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const NeDBDataStore = require("nedb");
    const container_1 = require("../../public/nodes/container");
    const nodes_1 = require("../../public/nodes/nodes");
    const utils_1 = require("../../public/nodes/utils");
    class Database {
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
            this.nodes.find({}, function (err, nodes) {
                if (!nodes)
                    return;
                for (let n of nodes) {
                    let cont = container_1.Container.containers[n.cid];
                    let node = nodes_1.Nodes.createNode(n.type, n.title);
                    if (!node) {
                        utils_1.default.debugErr("Node not found: " + n.type, this);
                        continue;
                    }
                    node.id = n.id; //id it or it will create a new id
                    cont.add(node); //add before configure, otherwise configure cannot create links
                    node.configure(n);
                }
            });
        }
    }
    exports.db = new Database();
});
//# sourceMappingURL=index.js.map