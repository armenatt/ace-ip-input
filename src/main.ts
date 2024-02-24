import type { App } from "vue";
import AceIpInput from "./AceIpInput.vue";

export default {
  install: (app: App) => {
    app.component("AceIpInput", AceIpInput);
  },
};

export { AceIpInput };
export * from "./types";
