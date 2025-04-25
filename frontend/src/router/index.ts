import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Home from '../views/Home.vue'
import Organization from '../views/permission/Organization.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home
        },
        {
          path: 'home',
          redirect: '/'
        },
        {
          path: 'business',
          name: 'business',
          component: () => import('../views/business/BusinessLayout.vue'),
          children: [
            {
              path: 'orders',
              name: 'orders',
              component: () => import('../views/business/Orders.vue')
            },
            {
              path: 'seals',
              name: 'seals',
              component: () => import('../views/business/Seals.vue')
            },
            {
              path: 'units',
              name: 'units',
              component: () => import('../views/business/Units.vue')
            },
            {
              path: 'agents',
              name: 'agents',
              component: () => import('../views/business/Agents.vue')
            },
            {
              path: 'pre-record',
              name: 'pre-record',
              component: () => import('../views/business/PreRecord.vue')
            },
            {
              path: 'undertake',
              name: 'undertake',
              component: () => import('../views/business/Undertake.vue')
            },
            {
              path: 'delivery',
              name: 'delivery',
              component: () => import('../views/business/Delivery.vue')
            },
            {
              path: 'lost',
              name: 'lost',
              component: () => import('../views/business/Lost.vue')
            },
            {
              path: 'destroy',
              name: 'destroy',
              component: () => import('../views/business/Destroy.vue')
            }
            // ... 其他业务管理路由
          ]
        },
        {
          path: 'daily',
          name: 'daily',
          component: () => import('../views/daily/DailyLayout.vue'),
          children: [
            {
              path: 'manufacturers',
              name: 'manufacturers',
              component: () => import('../views/daily/Manufacturers.vue')
            },
            {
              path: 'employees',
              name: 'employees',
              component: () => import('../views/daily/Employees.vue')
            },
            {
              path: 'suspicious',
              name: 'suspicious',
              component: () => import('../views/daily/Suspicious.vue')
            }
          ]
        },
        {
          path: 'permission',
          name: 'permission',
          component: () => import('../views/permission/PermissionLayout.vue'),
          redirect: '/permission/organization',
          children: [
            {
              path: 'organization',
              name: 'organization',
              component: () => import('../views/permission/Organization.vue'),
              meta: {
                title: '区域管理'
              }
            },
            {
              path: 'supervisor',
              name: 'supervisor',
              component: () => import('../views/permission/SupervisorUnit.vue'),
              meta: {
                title: '主管单位管理'
              }
            },
            {
              path: 'role',
              name: 'role',
              component: () => import('../views/permission/Role.vue'),
              meta: {
                title: '角色管理'
              }
            },
            {
              path: 'user',
              name: 'user',
              component: () => import('../views/permission/User.vue'),
              meta: {
                title: '刻章企业管理'
              }
            },
            {
              path: 'menu',
              name: 'menu',
              component: () => import('../views/permission/Menu.vue'),
              meta: {
                title: '菜单管理'
              }
            }
          ]
        },
        {
          path: 'help',
          name: 'help',
          redirect: '/help/drivers',
          component: () => import('../views/help/HelpLayout.vue'),
          children: [
            {
              path: 'drivers',
              name: 'drivers',
              component: () => import('../views/help/Drivers.vue')
            },
            {
              path: 'manual',
              name: 'manual',
              component: () => import('../views/help/Manual.vue')
            },
            {
              path: 'videos',
              name: 'videos',
              component: () => import('../views/help/Videos.vue')
            }
          ]
        },
        {
          path: 'online',
          name: 'online',
          redirect: '/online/service',
          component: () => import('../views/online/OnlineLayout.vue'),
          children: [
            {
              path: 'service',
              name: 'service',
              component: () => import('../views/online/Service.vue')
            },
            {
              path: 'message',
              name: 'message',
              component: () => import('../views/online/Message.vue')
            },
            {
              path: 'phone',
              name: 'phone',
              component: () => import('../views/online/Phone.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    }
  ]
}) 