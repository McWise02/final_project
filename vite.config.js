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
        // checkout: resolve(__dirname, "src/checkout/index.html"),
        // product: resolve(__dirname, "src/product_pages/index.html"
        // ),
        // products: resolve(__dirname, "src/product_listing/index.html"),
        // login: resolve(__dirname, "src/login/index.html"),
        // register: resolve(__dirname, "src/register/index.html"),
        

      },
    },
  },
});
