/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */

import * as NeDBDataStore from "nedb";

class Database {
    users: NeDBDataStore;

    constructor() {
        this.users = new NeDBDataStore('users.db');
        this.users.loadDatabase();

        // Using a unique constraint with the index
        // this.users.ensureIndex({ fieldName: 'name', unique: true }, function (err) {
        //    if (err)
        //     console.log(err);
        // });
    }
}

export let db = new Database();