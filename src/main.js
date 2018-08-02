import Vue from 'vue'


import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueElectron from 'vue-electron'
import store from './store/index'
Vue.use(VueElectron)

Vue.config.productionTip = false

Vue.use(ElementUI);

import ajax from '@/assets/ajax'
import utils from '@/assets/utils'
import socket from '@/assets/socket'
if(sessionStorage.token){
	socket.connect(sessionStorage.token)
}
Vue.prototype.$ajax = ajax
Vue.use(utils);

/* eslint-disable no-new */
new Vue({
	el: '#app',
  components: { App },
  router,
  store,
  template: '<App/>'
})
