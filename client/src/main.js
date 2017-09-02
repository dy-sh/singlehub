import Vue from 'vue'
import App from './App.vue'
import Toolbar from './components/Toolbar.vue'
import Vuetify from 'vuetify'
import './stylus/main.styl'

Vue.use(Vuetify);

Vue.component("toolbar", Toolbar);

new Vue({
  el: '#app',
  render: h => h(App)
})
