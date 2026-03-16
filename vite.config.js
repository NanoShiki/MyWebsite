import { defineConfig } from 'vite';
import { cpSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyBlogContentPlugin() {
  const shouldIncludeArchiveEntry = (sourcePath) => {
    const fileName = basename(sourcePath);
    return fileName !== '.DS_Store' && fileName !== 'Thumbs.db';
  };

  return {
    name: 'copy-blog-content',
    writeBundle() {
      const distBlogDir = resolve(__dirname, 'dist/Blog');
      mkdirSync(distBlogDir, { recursive: true });
      copyFileSync(resolve(__dirname, 'Blog/config.json'), resolve(distBlogDir, 'config.json'));

      const archiveSource = resolve(__dirname, 'Blog/archive');
      const archiveTarget = resolve(distBlogDir, 'archive');
      if (existsSync(archiveTarget)) {
        cpSync(archiveSource, archiveTarget, {
          recursive: true,
          force: true,
          filter: shouldIncludeArchiveEntry
        });
      } else {
        cpSync(archiveSource, archiveTarget, {
          recursive: true,
          filter: shouldIncludeArchiveEntry
        });
      }
    }
  };
}

export default defineConfig({
  appType: 'mpa',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'Blog/index.html'),
        post: resolve(__dirname, 'Blog/post.html')
      }
    }
  },
  plugins: [copyBlogContentPlugin()]
});
