// src/config/navigation.js
export const mainNavigation = [
    {
        path: '/',
        name: '首页',
        icon: 'el-icon-house',
        meta: { requiresAuth: false }
    },
    {
        path: '/levels',
        name: '课程级别',
        icon: 'el-icon-notebook-2',
        meta: { requiresAuth: true },
        children: [
            { value: 'A1', name: '入门级' },
            { value: 'A2', name: '基础级' }
        ]
    }
]