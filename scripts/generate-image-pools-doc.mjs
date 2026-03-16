import { promises as fs } from 'node:fs';
import path from 'node:path';

const IMAGE_POOL_FILE = path.resolve(process.cwd(), 'src/scripts/shared/image-pool.js');
const IMAGE_POOL_ROOT = path.resolve(process.cwd(), 'src/assets/image-pools');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/assets/image-pools/README.md');
const USAGE_FILES = [
  path.resolve(process.cwd(), 'src/scripts/home.js'),
  path.resolve(process.cwd(), 'src/scripts/blog-index.js'),
  path.resolve(process.cwd(), 'src/scripts/blog-post.js')
];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function parseObjectBlock(source, startPattern) {
  const startIndex = source.indexOf(startPattern);
  if (startIndex === -1) {
    throw new Error(`Cannot find block: ${startPattern}`);
  }

  const braceStart = source.indexOf('{', startIndex);
  if (braceStart === -1) {
    throw new Error(`Cannot find opening brace for block: ${startPattern}`);
  }

  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart + 1, index);
      }
    }
  }

  throw new Error(`Cannot find closing brace for block: ${startPattern}`);
}

function parseImageSlots(blockText) {
  const slotMap = new Map();
  const regex = /^\s*([A-Za-z0-9_]+):\s*'([^']+)'\s*,?\s*$/gm;
  let match = regex.exec(blockText);

  while (match) {
    slotMap.set(match[1], match[2]);
    match = regex.exec(blockText);
  }

  return slotMap;
}

function parseSlotDirectories(blockText) {
  const directoryMap = new Map();
  const regex = /\[IMAGE_SLOTS\.([A-Za-z0-9_]+)\]:\s*'([^']+)'\s*,?/g;
  let match = regex.exec(blockText);

  while (match) {
    directoryMap.set(match[1], match[2]);
    match = regex.exec(blockText);
  }

  return directoryMap;
}

function classifySlotGroup(directory) {
  if (directory.startsWith('home/')) {
    return 'Home';
  }
  if (directory.startsWith('blog/panel-hero/')) {
    return 'Blog Hero';
  }
  if (directory.startsWith('blog/panel-map/')) {
    return 'Blog Map';
  }
  if (directory.startsWith('blog/panel-journal/')) {
    return 'Blog Journal';
  }
  if (directory.startsWith('blog/sidebar/')) {
    return 'Blog Sidebar';
  }
  if (directory.startsWith('post/')) {
    return 'Post';
  }
  return 'Other';
}

async function collectImagesInDirectory(directoryPath) {
  let entries;
  try {
    entries = await fs.readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectImagesInDirectory(absolutePath);
      files.push(...nested);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(extension)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function usageLabel(filePath) {
  if (filePath.endsWith('home.js')) {
    return 'Home';
  }
  if (filePath.endsWith('blog-index.js')) {
    return 'Blog Index';
  }
  if (filePath.endsWith('blog-post.js')) {
    return 'Blog Post';
  }
  return path.basename(filePath);
}

function formatNow() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

async function main() {
  const imagePoolSource = await fs.readFile(IMAGE_POOL_FILE, 'utf8');
  const imageSlotBlock = parseObjectBlock(imagePoolSource, 'export const IMAGE_SLOTS = Object.freeze(');
  const slotDirectoryBlock = parseObjectBlock(imagePoolSource, 'const SLOT_DIRECTORIES = Object.freeze(');

  const slots = parseImageSlots(imageSlotBlock);
  const directories = parseSlotDirectories(slotDirectoryBlock);

  const slotUsage = new Map();
  for (const usageFile of USAGE_FILES) {
    const source = await fs.readFile(usageFile, 'utf8');
    const regex = /IMAGE_SLOTS\.([A-Za-z0-9_]+)/g;
    let match = regex.exec(source);

    while (match) {
      const slotConst = match[1];
      if (!slotUsage.has(slotConst)) {
        slotUsage.set(slotConst, new Set());
      }
      slotUsage.get(slotConst).add(usageLabel(usageFile));
      match = regex.exec(source);
    }
  }

  const rows = [];
  for (const [slotConst, slotKey] of slots.entries()) {
    const directory = directories.get(slotConst) || '';
    const absoluteDirectory = directory ? path.join(IMAGE_POOL_ROOT, directory) : '';
    const imageFiles = absoluteDirectory ? await collectImagesInDirectory(absoluteDirectory) : [];
    const usedBy = slotUsage.has(slotConst) ? [...slotUsage.get(slotConst)].sort() : [];
    const group = classifySlotGroup(directory);

    rows.push({
      group,
      slotConst,
      slotKey,
      directory,
      usedBy,
      imageCount: imageFiles.length
    });
  }

  rows.sort((left, right) => left.directory.localeCompare(right.directory, 'zh-Hans-CN-u-kn-true'));
  const groups = ['Home', 'Blog Hero', 'Blog Map', 'Blog Journal', 'Blog Sidebar', 'Post', 'Other'];
  const emptyRows = rows.filter((row) => row.imageCount === 0);

  const markdownLines = [
    '# src 图片槽位放图指南（自动生成）',
    '',
    `> 生成时间：${formatNow()}`,
    '> 请勿手改本文件；请运行 `npm run docs:image-pools` 重新生成。',
    '',
    '## 总规则',
    '',
    '- 素材根目录：`src/assets/image-pools/`',
    '- 槽位来源：`src/scripts/shared/image-pool.js`（`IMAGE_SLOTS` + `SLOT_DIRECTORIES`）',
    '- 支持格式：`jpg`、`jpeg`、`png`、`webp`',
    '- 随机策略：按天稳定随机（同一天同位置固定，跨天自动变化）',
    '- 维护原则：一个显示位置对应一个目录；仅需向目录加图，不改业务代码',
    '',
    '## 快速维护步骤',
    '',
    '1. 找到目标位置对应的“目录”列。',
    '2. 把新图片放入该目录（建议每个目录至少 2 张）。',
    '3. 运行 `npm run docs:image-pools` 更新文档。',
    '4. 运行 `npm run build` 或 `npm run dev` 验证页面效果。',
    '',
    '## 槽位总表',
    '',
    '| slotConst | slotKey | 目录 | 使用页面 | 当前图片数 | 备注 |',
    '| --- | --- | --- | --- | ---: | --- |'
  ];

  for (const row of rows) {
    const usage = row.usedBy.length ? row.usedBy.join(', ') : '-';
    const note = row.imageCount > 0 ? '正常' : '空目录，需补图';
    markdownLines.push(
      `| \`${row.slotConst}\` | \`${row.slotKey}\` | \`${row.directory}\` | ${usage} | ${row.imageCount} | ${note} |`
    );
  }

  markdownLines.push('', '## 按页面分组清单', '');
  for (const group of groups) {
    const groupRows = rows.filter((row) => row.group === group);
    if (!groupRows.length) {
      continue;
    }

    markdownLines.push(`### ${group}`, '');
    markdownLines.push('| slotConst | 目录 | 当前图片数 |', '| --- | --- | ---: |');
    for (const row of groupRows) {
      markdownLines.push(`| \`${row.slotConst}\` | \`${row.directory}\` | ${row.imageCount} |`);
    }
    markdownLines.push('');
  }

  markdownLines.push('## 空目录告警', '');
  if (!emptyRows.length) {
    markdownLines.push('- 当前无空目录，全部槽位均有图片。');
  } else {
    for (const row of emptyRows) {
      markdownLines.push(`- \`${row.directory}\`（\`${row.slotConst}\`）`);
    }
  }
  markdownLines.push('');

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, markdownLines.join('\n'), 'utf8');
  console.log(`Generated: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log(`Slots: ${rows.length}, empty directories: ${emptyRows.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
