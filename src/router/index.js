import Vue from 'vue'
import Router from 'vue-router'

// 导入页面组件
import Home from '@/views/home/Home.vue'
import LevelSelection from '@/views/levels/LevelSelection.vue'
import LevelCourses from '@/views/levels/LevelCourses.vue'

Vue.use(Router)


export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home,
            meta: { title: '首页' }
        },
        {
            path: '/levels',
            name: 'LevelSelection',
            component: LevelSelection,
            meta: { title: '选择级别' }
        },
        {
            path: '/levels/:level',
            name: 'LevelCourses',
            component: LevelCourses,
            meta: { title: '课程学习' },
            props: true
        },
        // 技能训练路由 - 添加参数支持
        {
            path: '/skills/listening/:level',
            name: 'ListeningList',
            component: () => import('@/views/skills/listening/ListeningList.vue'),
            meta: { title: '听力训练' },
            props: true
        },
        {
            path: '/listening/exercise/:exerciseId',
            name: 'ListeningExercise',
            component: () => import('@/views/skills/listening/ListeningExercise.vue'),
            meta: { title: '听力练习' },
            props: true
        },
        {
            path: '/skills/reading/:level',
            name: 'ReadingList',
            component: () => import('@/views/skills/Reading.vue'),
            meta: { title: '阅读训练' },
            props: true
        },
        {
            path: '/skills/writing/:level',
            name: 'WritingList',
            component: () => import('@/views/skills/Writing.vue'),
            meta: { title: '写作训练' },
            props: true
        },
        {
            path: '/skills/speaking/:level',
            name: 'SpeakingList',
            component: () => import('@/views/skills/Speaking.vue'),
            meta: { title: '口语训练' },
            props: true
        },
        // 认证路由
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/auth/Login.vue'),
            meta: { title: '登录', guestOnly: true }
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/auth/Register.vue'),
            meta: { title: '注册', guestOnly: true }
        },
        // 添加重定向规则
        {
            path: '/skills',
            redirect: '/levels'
        },
        // 添加404页面处理
        {
            path: '*',
            name: 'NotFound',
            component: () => import('@/views/NotFound.vue'),
            meta: { title: '页面未找到' }
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/auth/Register.vue'),
            meta: {
                title: '注册',
                guestOnly: true
            }
        }
    ]
})



// 防止重复导航错误
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
            throw err
        }
    })
}