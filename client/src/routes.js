import Dashboard from "./dashboard/Dashboard.vue"

import Welcome from "./setup-wizard/Welcome.vue"
import Database from "./setup-wizard/Database"
import Admin from "./setup-wizard/Admin.vue"

export default [
    //editor
    { name: "/", path: "/", component: Dashboard },

    //initial setup wizard
    { name: "setup", path: "/setup", component: Welcome },
    { name: "setup/db", path: "/setup/db", component: Database },
    { name: "setup/admin", path: "/setup/admin", component: Admin },
]