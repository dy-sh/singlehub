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
            let db = {};
            this.users = new NeDBDataStore('users.db');
            this.users.loadDatabase();
        }
    }
    exports.db = new Database();
});
//# sourceMappingURL=index.js.map