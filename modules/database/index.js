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
    class Database {
        constructor() {
            this.users = new NeDBDataStore('users.db');
            this.nodes = new NeDBDataStore('nodes.db');
            this.users.loadDatabase();
            this.nodes.loadDatabase();
            // Using a unique constraint with the index
            // this.users.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
            //    if (err)
            //     console.log(err);
            // });
        }
    }
    exports.db = new Database();
});
//# sourceMappingURL=index.js.map