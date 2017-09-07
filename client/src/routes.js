import Welcome from "./components/init/Welcome.vue"
import Database from "./components/init/Database"
import Admin from "./components/init/Admin.vue"

export default [
    { path: "/", component: Welcome },
    { path: "/db", component: Database },
    { path: "/admin", component: Admin },
]