import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Vuetify from 'vuetify'
import './stylus/main.styl'
import Routes from "./routes"
import VueSocketIO from 'vue-socket.io';

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VueSocketIO, 'http://localhost:1312/dashboard');

const router = new VueRouter({ routes: Routes });

new Vue({
  el: '#app',
  render: h => h(App),
  router: router,
  sockets: {
    connect() {
      console.log('socket connected')
    },
    customEmit(val) {
      console.log('customEmit')
    }
  }

});
