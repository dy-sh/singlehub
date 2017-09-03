import Admin from "./components/init/Admin.vue"
import Welcome from "./components/init/Welcome.vue"

export default [
    { path: "/", component: Welcome },
    { path: "/admin", component: Admin },
]