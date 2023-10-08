import { createApp } from "vue";
import { createPinia } from "pinia";
import { AVPlugin } from 'vue-audio-visual'

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(AVPlugin);

app.mount("#app");
