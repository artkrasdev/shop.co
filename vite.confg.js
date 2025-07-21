import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                    @use "scss/abstracts/variables" as *;
                    @use "scss/abstracts/mixins" as *;
                    @use "scss/abstracts/functions" as *;
                `,
            },
        },
    },
});
