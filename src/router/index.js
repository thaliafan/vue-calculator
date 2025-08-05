// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import LoginView from '@/views/LoginView.vue';
import CalculatorView from '@/views/CalculatorView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'Home',
    component: CalculatorView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// (修改) 使用更健壮的路由守卫逻辑
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // 条件一：用户想去的页面需要登录，但用户当前并未登录
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // 拦截并跳转到登录页
    next({ name: 'Login' });
  } 
  // 条件二：用户已经登录了，但又想去登录页面
  else if (to.name === 'Login' && auth.isAuthenticated) {
    // 拦截并直接跳转到主页，避免重复登录
    next({ name: 'Home' });
  }
  // 其他所有情况（例如：未登录访问登录页，已登录访问主页等），一律放行
  else {
    next();
  }
});

export default router;