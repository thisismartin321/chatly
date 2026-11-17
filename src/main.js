import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import de from './locales/de.json';
import './assets/style.css';

const i18n = createI18n({
  locale: localStorage.getItem('chatly-locale') || 'en',
  messages: {
    en,
    de
  },
  globalInjection: true
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount('#app');