// src/main.js

// 导入 Vue 的 createApp 函数和根组件 App
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // 👈 导入我们创建的 router
import 'vuetify/styles';
import './global.css'; // 或者 './global.css'
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// 2. (强烈推荐) 导入 Material Design Icons 字体
import '@mdi/font/css/materialdesignicons.css';


// 3. 创建 Vuetify 实例
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    // 确保默认主题是 'light'
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          // 根据你的第二张图细致调整这些颜色
          // 背景色：第二张图的背景是浅灰色，比纯白深一点
          background: '#FAFAFA', // 看起来像这种灰度
          // 表面色：卡片、面板等背景色，应该是纯白色
          surface: '#FFFFFF',
          // 主色：用于主要交互元素，如按钮、高亮文本（例如 Recalculate 按钮）
          primary: '#1A73E8', // 你的第二张图中按钮是蓝色，这个蓝色是常见的Material Design蓝色
          // 次要色：用于次要交互元素（例如 Save Project 按钮，看起来是绿色）
          secondary: '#4CAF50', // 常见的Material Design绿色
          // 文本颜色：Vuetify会自动调整，但如果你有自定义的暗色文字，可以定义
          'on-surface': '#3A4150', // 确保在白色背景上的文本是深色
          'on-background': '#3A4150', // 确保在浅灰背景上的文本是深色
          // 提示文本或弱化文本的颜色 (Vuetify通常用 text-medium-emphasis)
          'medium-emphasis-text': '#616161', // 对应 text-medium-emphasis 类
          'high-emphasis-text': '#212121', // 对应 text-high-emphasis 类 (默认的黑)
          // 其他状态色
          error: '#D32F2F',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800',

          // 为表格表头添加一个自定义的浅灰色，方便后续使用
          'table-header-bg': '#E2E8F0', // 浅灰色，用于表格的头部背景
          'table-border': '#E0E0E0', // 表格边框颜色
                    'dropdown-list-bg': '#F1F5F9', // 下拉菜单列表的背景色
          'on-dropdown-list-bg': '#334155', // 下拉菜单列表的文字颜色
        },
      },
      dark: { // 保留旧的暗色主题，以防需要切换
        colors: {
          background: '#1a1a2e',
          surface: '#21213E',
          primary: '#007bff',
          secondary: '#28a745',
          error: '#CF6679',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFA500',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
});

// 4. 创建 Vue 应用实例
const app = createApp(App);
const pinia = createPinia(); // 我们在这里创建 Pinia 实例

// 5. 将所有插件添加到 Vue 应用中 (顺序很重要)
app.use(pinia);   // 注册 Pinia
app.use(router);  // 注册 Router
app.use(vuetify); // 注册 Vuetify

// 6. 挂载应用到 DOM
app.mount('#app');