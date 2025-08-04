// stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token')); // Get token from browser storage
  const user = ref(JSON.parse(localStorage.getItem('user'))); // Get user info

  // Getter to check if user is admin
  const isAdmin = computed(() => user.value && user.value.role === 'admin');
  
  // Getter that directly controls visibility of sensitive data
  const canViewMargin = computed(() => user.value && user.value.role === 'admin');

  // Action to handle login
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
      // If the server returns an error status (like 401), login fails
      return false;
    }

    const data = await response.json();

    if (data.token && data.user) {
      // Login successful!
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
  // Action to handle logout
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    user.value = null;
    // You'd typically redirect to the login page here
    window.location.href = '/login';
  }

  return { token, user, login, logout, isAdmin, canViewMargin };
});