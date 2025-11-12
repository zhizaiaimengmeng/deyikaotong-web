import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(ElementUI)
// //  确保 store 正确注入到所有组件
// Vue.prototype.$store = store
// 调试：检查 store 是否正确导入
console.log('Store 实例:', store)
console.log('Store 状态:', store.state)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')