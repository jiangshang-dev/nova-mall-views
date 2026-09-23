import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import { registerGlobComp } from './plugins/registerGlobComp'

const app = createApp(App)
app.use(router)
app.use(Antd)
registerGlobComp(app)
app.mount('#app')
