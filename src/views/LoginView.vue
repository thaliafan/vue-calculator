<template>
  <v-container fluid class="fill-height d-flex align-center justify-center bg-grey-lighten-4">
    <v-card class="pa-6" width="400" elevation="4">
      <v-card-title class="text-h5 text-center font-weight-bold mb-6">
        Welcome Back
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            label="Username"
            variant="outlined"
            prepend-inner-icon="mdi-account"
            class="mb-4"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            class="mb-4"
            required
          ></v-text-field>
          <v-alert v-if="errorMsg" type="error" density="compact" class="mb-4">
            {{ errorMsg }}
          </v-alert>
          <v-btn type="submit" color="primary" block size="large">
            Login
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

const username = ref('');
const password = ref('');
const errorMsg = ref('');

const auth = useAuthStore();
const router = useRouter();

async function handleLogin() {
  errorMsg.value = ''; // Clear previous error messages
  const loginSuccess = await auth.login(username.value, password.value);

  if (loginSuccess) {
    // Login successful, redirect to the main page
    router.push('/');
  } else {
    // Login failed, show an error message
    errorMsg.value = 'Incorrect username or password. Please try again.';
  }
}
</script>