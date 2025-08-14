import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        plan: resolve(__dirname, "src/create_plan/index.html"),
        view: resolve(__dirname, "src/view_plans/index.html"),
        random: resolve(__dirname, "src/random_activity/index.html"),
        // products: resolve(__dirname, "src/product_listing/index.html"),
        // login: resolve(__dirname, "src/login/index.html"),
        // register: resolve(__dirname, "src/register/index.html"),
        

      },
    },
  },
});
