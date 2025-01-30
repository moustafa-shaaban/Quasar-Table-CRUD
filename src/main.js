//import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { Quasar, Notify, Dialog, Dark } from "quasar";

// Import Quasar css
import "quasar/src/css/index.sass";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-icons-outlined/material-icons-outlined.css";
import "@quasar/extras/material-icons-round/material-icons-round.css";
import "@quasar/extras/material-icons-sharp/material-icons-sharp.css";
import "@quasar/extras/mdi-v7/mdi-v7.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
import "@quasar/extras/ionicons-v4/ionicons-v4.css";
import "@quasar/extras/themify/themify.css";
import "@quasar/extras/line-awesome/line-awesome.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  config: {
    dark: "auto",
  },
  plugins: {
    Notify,
    Dialog,
    Dark,
  }, // import Quasar plugins and add here
});

app.mount("#app");
