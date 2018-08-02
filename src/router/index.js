import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '首页',
      component: resolve => require(['@/pages/index'], resolve)
    },
    {
      path: '/login',
      name: '登录',
      component: resolve => require(['@/pages/login'], resolve)
    }
  ]
})
