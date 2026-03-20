import App from './App.vue'
import { createApp } from 'vue'
import { setupStore } from './store'                 // Store
import { setupRouter } from './router'               // Router
import language from './locales'                    // 国际化
import { setupGlobComponents } from './components'  // 全局组件
import '@styles/core/tailwind.css'                  // tailwind
import '@styles/index.scss'                         // 样式
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
setupStore(app)
setupRouter(app)
setupGlobComponents(app)
setupGlobDirectives(app)
setupErrorHandle(app)

app.use(language)
app.mount('#app')
