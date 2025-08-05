// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const token = ref(localStorage.getItem('token'));
  // 更安全地解析 user 对象，防止 localStorage 中没有 user 时出错
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  // --- GETTERS ---
  // (新增) 用于路由守卫，清晰地判断用户是否已登录
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value && user.value.role === 'admin');
  const canViewMargin = computed(() => user.value && user.value.role === 'admin');

  // --- ACTIONS ---
  // Action to handle login
  async function login(username, password) {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        token.value = data.token;
        user.value = data.user;
        return true;
      }
    } catch (error) {
      console.error('Login request error:', error);
      return false;
    }
    return false;
  }

  // Action to handle logout (修改)
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    user.value = null;
    // (已移除) 页面跳转的逻辑移到组件中处理
  }

  // (修改) 在返回的对象中加入 isAuthenticated
  return { token, user, login, logout, isAdmin, canViewMargin, isAuthenticated };
});