/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */
let Datastore = require('nedb');
class Database {
    constructor() {
        let db = {};
        db.ph_pages = new Datastore('ph-pages.db');
        db.ph_files = new Datastore('ph-files.db');
        db.ph_pages.loadDatabase();
        db.ph_files.loadDatabase();
    }
}
//# sourceMappingURL=database.js.map