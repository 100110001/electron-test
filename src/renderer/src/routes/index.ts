import { createRouter, createWebHashHistory } from 'vue-router'
import { IconHome, IconSettings } from '@arco-design/web-vue/es/icon'
import { h } from 'vue'

const basicRoutes = [
  {
    path: '/',
    component: () => import('@renderer/layouts/index.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@renderer/views/home/index.vue'),
        name: 'home',
        meta: {
          title: '首页',
          icon: () => h(IconHome)
        }
      },
      {
        path: '/dxcb',
        component: () => import('@renderer/views/dxcb/index.vue'),
        name: 'dxcb',
        meta: {
          title: '地下城堡',
          icon: new URL(`@renderer/assets/images/dxcb.png`, import.meta.url).href
        }
      },
      {
        path: '/nsh',
        component: () => import('@renderer/views/nsh/index.vue'),
        name: 'nsh',
        meta: {
          title: '逆水寒',
          icon: new URL(`@renderer/assets/images/nsh.png`, import.meta.url).href
        }
      },
      {
        path: '/setting',
        component: () => import('@renderer/views/setting/index.vue'),
        name: 'setting',
        meta: {
          title: '设置',
          icon: () => h(IconSettings)
        }
      }
    ]
  }
]

export const router = createRouter({
  // 创建一个 hash 历史记录。
  history: createWebHashHistory(),
  // 应该添加到路由的初始路由列表。
  routes: basicRoutes,
  // 是否应该禁止尾部斜杠。默认为假
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 })
})
