import Dashboard from "./dashboard/Dashboard.vue"
import Editor from "./editor/Editor.vue"

import Welcome from "./setup/Welcome.vue"
import Database from "./setup/Database"
import Admin from "./setup/Admin.vue"

export default [
    //editor
    // { name: "/", path: "/", component: Editor },
    { name: "/", path: "/", component: Dashboard },

    //initial setup wizard
    { name: "setup", path: "/setup", component: Welcome },
    { name: "setup/db", path: "/setup/db", component: Database },
    { name: "setup/admin", path: "/setup/admin", component: Admin },
]