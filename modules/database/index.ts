/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */

import * as NeDBDataStore from "nedb";

class Database {
    users: NeDBDataStore;

    constructor() {
        let db = {};
        this.users = new NeDBDataStore('users.db');
        this.users.loadDatabase();
    }
}

export let db = new Database();