import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = __dirname;
const outDir = resolve(root, '_site');

function copyStaticRootFiles() {
  const files = ['config.public.js', '.nojekyll', 'CNAME'];

  return {
    name: 'copy-static-root-files',
    closeBundle() {
      mkdirSync(outDir, { recursive: true });
      for (const file of files) {
        const source = resolve(root, file);
        if (existsSync(source)) {
          copyFileSync(source, resolve(outDir, file));
        }
      }
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  base: './',
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        ui: resolve(root, 'ui.html'),
      },
    },
  },
  plugins: [copyStaticRootFiles()],
});
