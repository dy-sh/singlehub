import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Vuetify from 'vuetify'
import './stylus/main.styl'
import Routes from "./routes"

Vue.use(Vuetify);
Vue.use(VueRouter);

const router = new VueRouter({ routes: Routes });

new Vue({
  el: '#app',
  render: h => h(App),
  router: router
});
