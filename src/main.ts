import { createApp } from 'vue'
import App from './App.vue'
import { unmountGlobalLoading } from './utils'
import './style.css'

import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

function bootstrap() {
  const Vue = createApp(App)
  Vue.mount('#app')
    .$nextTick(() => {
      postMessage({ payload: 'removeLoading' }, '*')
    })
    .then(() => {
      unmountGlobalLoading()
    })
}

bootstrap()
