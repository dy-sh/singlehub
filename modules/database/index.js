/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */
"use strict";
var NeDBDataStore = require("nedb");
var Database = (function () {
    function Database() {
        var db = {};
        this.users = new NeDBDataStore('users.db');
        this.users.loadDatabase();
    }
    return Database;
}());
exports.db = new Database();
