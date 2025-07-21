import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
            cart: resolve(__dirname, 'cart.html'),
            blog: resolve(__dirname, 'blog.html'),
            shop: resolve(__dirname, 'shop.html'),
            login: resolve(__dirname, 'login.html'),
            product: resolve(__dirname, 'product.html'),
            projects: resolve(__dirname, 'projects.html'),
            dashboard: resolve(__dirname, 'dashboard.html'),
          }
        }
      }
});
