import Dashboard from "./components/dashboard/Dashboard.vue"

import Welcome from "./components/init/Welcome.vue"
import Database from "./components/init/Database"
import Admin from "./components/init/Admin.vue"

export default [
    //editor
    { name: "/", path: "/", component: Dashboard },

    //initial setup wizard
    { name: "init", path: "/init", component: Welcome },
    { name: "init/db", path: "/init/db", component: Database },
    { name: "init/admin", path: "/init/admin", component: Admin },
]