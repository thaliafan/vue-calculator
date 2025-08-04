<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
// 这个文件作为“总画框”，必须保持干净，没有任何业务逻辑。
</script>

<style>
/* 这里可以放置真正全局的、所有页面都通用的样式 */
#app {
  font-family: 'Roboto', sans-serif;
}
</style>