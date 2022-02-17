import Main from '@/components/main'
// import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      // hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          // hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  // {
  //   path: '',
  //   name: 'doc',
  //   meta: {
  //     title: '文档',
  //     href: 'https://lison16.github.io/iview-admin-doc/#/',
  //     icon: 'ios-book'
  //   }
  // },
  {
    path: '/join',
    name: 'join',
    component: Main,
    meta: {
      hideInBread: true
    },
    children: [
      {
        path: 'join_page',
        name: 'join_page',
        meta: {
          icon: '_qq',
          title: 'QQ'
        },
        component: () => import('@/view/join-page.vue')
      }
    ]
  },
  {
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message_page',
        name: 'message_page',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/single-page/message/index.vue')
      }
    ]
  },
  {
    path: '/error_logger',
    name: 'error_logger',
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'error_logger_page',
        name: 'error_logger_page',
        meta: {
          icon: 'ios-bug',
          title: '错误收集'
        },
        component: () => import('@/view/single-page/error-logger.vue')
      }
    ]
  },
  {
    path: '/argu',
    name: 'argu',
    meta: {
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'params/:id',
        name: 'params',
        meta: {
          icon: 'md-flower',
          title: route => `{{ params }}-${route.params.id}`,
          notCache: true,
          beforeCloseName: 'before_close_normal'
        },
        component: () => import('@/view/argu-page/params.vue')
      },
      {
        path: 'query',
        name: 'query',
        meta: {
          icon: 'md-flower',
          title: route => `{{ query }}-${route.query.id}`,
          notCache: true
        },
        component: () => import('@/view/argu-page/query.vue')
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  },
  // ------------------------------------------------开始---------------------------------------------------------
  {
    path: '/socket',
    name: 'socket',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/websocket/socket.vue')
  },
  {
    path: '/system',
    name: 'system',
    meta: {
      icon: 'md-cloud-upload',
      title: '系统管理'
    },
    component: Main,
    children: [
      {
        path: 'user_table_page',
        name: 'user_table_page',
        meta: {
          icon: 'ios-document',
          title: '用户管理'
        },
        component: () => import('@/view/system/user.vue')
      },
      {
        path: 'role_table_page',
        name: 'role_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '角色管理'
        },
        component: () => import('@/view/system/role.vue')
      },
      {
        path: 'menu_table_page',
        name: 'menu_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '菜单管理'
        },
        component: () => import('@/view/system/menu.vue')
      },
      {
        path: 'schedule_table_page',
        name: 'schedule_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '定时任务'
        },
        component: () => import('@/view/system/schedule.vue')
      },
      {
        path: 'druid_page',
        name: 'druid_page',
        meta: {
          icon: '_qq',
          title: 'SQL监控'
        },
        component: () => import('@/view/system/druid.vue')
      },
      {
        path: 'api_doc_page',
        name: 'api_doc_page',
        meta: {
          icon: '_qq',
          title: '接口文档'
        },
        component: () => import('@/view/system/apiDoc.vue')
      },
      {
        path: 'syslog_table_page',
        name: 'syslog_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '系统日志'
        },
        component: () => import('@/view/system/syslog.vue')
      },
      {
        path: 'oss_table_page',
        name: 'oss_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '文件上传'
        },
        component: () => import('@/view/system/oss.vue')
      }
    ]
  },
  {
    path: '/activiti',
    name: 'activiti',
    meta: {
      icon: 'md-cloud-upload',
      title: '工作流管理'
    },
    component: Main,
    children: [
      {
        path: 'model_table_page',
        name: 'model_table_page',
        meta: {
          icon: 'ios-document',
          title: '模型管理'
        },
        component: () => import('@/view/activiti/model.vue')
      },
      {
        path: 'procdef_table_page',
        name: 'procdef_table_page',
        meta: {
          icon: 'md-git-compare',
          title: '流程管理'
        },
        component: () => import('@/view/activiti/procdef.vue')
      },
      {
        path: 'minetask_table_page',
        name: 'minetask_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '我的申请'
        },
        component: () => import('@/view/activiti/mine.vue')
      },
      {
        path: 'history_approve_page',
        name: 'history_approve_page',
        meta: {
          hideInMenu: true,
          icon: 'md-clipboard',
          title: '流程审批历史'
        },
        component: () => import('@/view/activiti/history_approve.vue')
      },
      {
        path: 'todo_table_page',
        name: 'todo_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '我的待办'
        },
        component: () => import('@/view/activiti/todo.vue')
      },
      {
        path: 'done_table_page',
        name: 'done_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '我的已办'
        },
        component: () => import('@/view/activiti/done.vue')
      },
      {
        path: 'running_table_page',
        name: 'running_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '运行中的流程'
        },
        component: () => import('@/view/activiti/running.vue')
      },
      {
        path: 'finish_table_page',
        name: 'finish_table_page',
        meta: {
          icon: 'md-clipboard',
          title: '结束的流程'
        },
        component: () => import('@/view/activiti/finish.vue')
      }
    ]
  },
  {
    path: '/websocket',
    name: 'websocket',
    meta: {
      icon: 'ios-list-box',
      title: '基础技术'
    },
    component: Main,
    children: [
      {
        path: 'websocket_table_page',
        name: 'websocket_table_page',
        meta: {
          icon: 'ios-document',
          title: 'WebSocket'
        },
        component: () => import('@/view/websocket/socket.vue')
      },
      {
        path: 'other_table_page',
        name: 'other_table_page',
        meta: {
          icon: 'ios-document',
          title: 'WebSocket'
        },
        component: () => import('@/view/websocket/socket.vue')
      }
    ]
  }

]
