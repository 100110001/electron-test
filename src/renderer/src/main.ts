import { createApp } from 'vue'
import App from './App.vue'

// import ArcoVue from '@arco-design/web-vue'
// import ArcoVueIcon from '@arco-design/web-vue/es/icon'
// import '@arco-design/web-vue/dist/arco.css'
import '@renderer/design/index.less'
import 'animate.css' // https://animate.style/#migration

import { router } from '@renderer/routes'
import { store } from '@renderer/store'
import component from '@renderer/components'

// createApp(App).use(ArcoVue).use(ArcoVueIcon).use(router).mount('#app')
createApp(App).use(router).use(store).use(component).mount('#app')
