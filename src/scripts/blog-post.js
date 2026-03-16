import '../styles/base.css';
import '../styles/post.css';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import { marked } from 'marked';
import { icons } from './shared/icons.js';
import { IMAGE_SLOTS, pickDailyImageForSlot } from './shared/image-pool.js';
import { initThemeToggles } from './shared/theme.js';
import {
  fetchBlogConfig,
  formatDate,
  getCategoryUrl,
  getMarkdownPathCandidates,
  resolveSiteAssetUrl,
  slugifyHeading
} from './shared/site-data.js';

hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', cpp);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);

marked.setOptions({
  gfm: true,
  breaks: false
});

const state = {
  config: null,
  post: null,
  activeTocId: '',
  tocIndex: new Map(),
  tocCleanup: null,
  layoutBoundsSync: null
};

function applyOptionalPostAsset(root, { className = '', cssVariable = '', assetUrl = '' } = {}) {
  if (!root || !className || !cssVariable) {
    return;
  }

  root.classList.toggle(className, Boolean(assetUrl));
  if (assetUrl) {
    root.style.setProperty(cssVariable, `url("${assetUrl}")`);
  } else {
    root.style.removeProperty(cssVariable);
  }
}

function setupPostBackground() {
  const root = document.documentElement;
  root.classList.add('is-post-page');
  const backgroundAsset = pickDailyImageForSlot(IMAGE_SLOTS.postPageBackground);
  const glassNoiseAsset = pickDailyImageForSlot(IMAGE_SLOTS.postPageGlassNoise);
  const windEmblemAsset = pickDailyImageForSlot(IMAGE_SLOTS.postPageWindEmblem);
  const ruinsOverlayAsset = pickDailyImageForSlot(IMAGE_SLOTS.postPageRuinsOverlay);

  root.classList.toggle('has-post-story-image', Boolean(backgroundAsset));
  if (backgroundAsset) {
    root.style.setProperty('--post-story-image', `url("${backgroundAsset}")`);
  } else {
    root.style.removeProperty('--post-story-image');
  }

  applyOptionalPostAsset(root, {
    className: 'has-post-glass-noise',
    cssVariable: '--post-glass-noise',
    assetUrl: glassNoiseAsset
  });
  applyOptionalPostAsset(root, {
    className: 'has-post-wind-emblem',
    cssVariable: '--post-wind-emblem',
    assetUrl: windEmblemAsset
  });
  applyOptionalPostAsset(root, {
    className: 'has-post-ruins-overlay',
    cssVariable: '--post-ruins-overlay',
    assetUrl: ruinsOverlayAsset
  });
}

function getPostIdFromUrl() {
  const search = new URLSearchParams(window.location.search);
  return search.get('id') || '';
}

function stripLeadingHeading(markdown = '') {
  return markdown.replace(/^#\s+.+\n+/, '');
}

function protectDisplayMathBlocks(markdown = '') {
  const lines = markdown.split('\n');
  const output = [];
  const displayMathBlocks = [];

  let inFence = false;
  let fenceToken = '';
  let collectingDisplayMath = false;
  let displayMathBuffer = [];

  const pushDisplayMathPlaceholder = () => {
    const index = displayMathBlocks.length;
    displayMathBlocks.push(displayMathBuffer.join('\n'));
    output.push('', `<div class="display-math-placeholder" data-display-math-placeholder="${index}"></div>`, '');
    displayMathBuffer = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);

    if (fenceMatch && !collectingDisplayMath) {
      const token = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceToken = token;
      } else if (token === fenceToken) {
        inFence = false;
        fenceToken = '';
      }
      output.push(line);
      return;
    }

    if (!inFence && trimmed === '$$') {
      if (!collectingDisplayMath) {
        collectingDisplayMath = true;
        displayMathBuffer = [];
      } else {
        collectingDisplayMath = false;
        pushDisplayMathPlaceholder();
      }
      return;
    }

    // Support single-line display math: $$ ... $$.
    if (!inFence && !collectingDisplayMath) {
      const singleLineDisplayMatch = trimmed.match(/^\$\$([\s\S]*?)\$\$$/);
      if (singleLineDisplayMatch) {
        const index = displayMathBlocks.length;
        displayMathBlocks.push(singleLineDisplayMatch[1].trim());
        output.push('', `<div class="display-math-placeholder" data-display-math-placeholder="${index}"></div>`, '');
        return;
      }
    }

    if (collectingDisplayMath) {
      displayMathBuffer.push(line);
      return;
    }

    output.push(line);
  });

  if (collectingDisplayMath) {
    output.push('$$', ...displayMathBuffer);
  }

  return {
    markdown: output.join('\n'),
    displayMathBlocks
  };
}

function setArticleStatus(message = '') {
  const status = document.getElementById('articleStatus');
  if (!status) {
    return;
  }
  status.textContent = message;
  status.hidden = !message;
}

function renderInlineError(message) {
  const container = document.getElementById('articleContent');
  if (!container) {
    return;
  }
  container.innerHTML = `<div class="inline-error">${message}</div>`;
}

async function renderMath(container) {
  if (!container || container.dataset.mathEnhanced === 'true') {
    return;
  }

  const renderDisplayMathPlaceholders = (displayMathBlocks = []) => {
    if (!displayMathBlocks.length) {
      return true;
    }

    const placeholders = [...container.querySelectorAll('[data-display-math-placeholder]')];
    if (!placeholders.length) {
      return true;
    }

    if (typeof window.katex?.render !== 'function') {
      placeholders.forEach((node) => {
        const index = Number(node.dataset.displayMathPlaceholder);
        const tex = Number.isFinite(index) ? displayMathBlocks[index] || '' : '';
        node.textContent = `$$\n${tex}\n$$`;
      });
      return false;
    }

    placeholders.forEach((node) => {
      const index = Number(node.dataset.displayMathPlaceholder);
      const tex = Number.isFinite(index) ? displayMathBlocks[index] || '' : '';
      window.katex.render(tex, node, {
        displayMode: true,
        throwOnError: false
      });
      node.classList.remove('display-math-placeholder');
      node.removeAttribute('data-display-math-placeholder');
    });

    return true;
  };

  const displayMathBlocks = container.__displayMathBlocks || [];
  let hasRenderedDisplayMath = displayMathBlocks.length === 0;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (!hasRenderedDisplayMath) {
      hasRenderedDisplayMath = renderDisplayMathPlaceholders(displayMathBlocks);
    }

    if (typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(container, {
        throwOnError: false,
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
          { left: '$', right: '$', display: false }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoredClasses: ['display-math-placeholder']
      });
      container.dataset.mathEnhanced = 'true';
      delete container.__displayMathBlocks;
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 120));
  }

  if (!hasRenderedDisplayMath) {
    hasRenderedDisplayMath = renderDisplayMathPlaceholders(displayMathBlocks);
  }

  if (hasRenderedDisplayMath && displayMathBlocks.length) {
    container.dataset.mathEnhanced = 'true';
  }

  delete container.__displayMathBlocks;
}

function normalizeRelativeAssets(container, basePath) {
  container.querySelectorAll('img').forEach((image) => {
    const raw = image.getAttribute('src');
    if (!raw || raw.startsWith('/')) {
      return;
    }

    const resolved = resolveSiteAssetUrl(basePath, raw, { preserveAmpersand: true });
    if (resolved) {
      image.src = resolved;
    }
  });

  container.querySelectorAll('a').forEach((anchor) => {
    const raw = anchor.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('/')) {
      return;
    }

    const resolved = resolveSiteAssetUrl(basePath, raw, { preserveAmpersand: true });
    if (!resolved) {
      return;
    }

    anchor.href = resolved;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer noopener';
  });
}

function assignHeadingIds(container) {
  const headings = [...container.querySelectorAll('h1, h2, h3, h4')];
  const seen = new Map();

  headings.forEach((heading, index) => {
    const baseSlug = slugifyHeading(heading.textContent || '', index + 1);
    const count = seen.get(baseSlug) || 0;
    seen.set(baseSlug, count + 1);
    heading.id = count ? `${baseSlug}-${count + 1}` : baseSlug;
  });

  return headings;
}

function buildTocData(headings) {
  if (!headings.length) {
    return { rootItems: [], allItems: [] };
  }

  const rootItems = [];
  const allItems = [];
  const baseLevel = Math.min(...headings.map((heading) => Number(heading.tagName.slice(1))));
  const stack = [{ id: null, level: 0, children: rootItems }];

  headings.forEach((heading) => {
    const rawLevel = Number(heading.tagName.slice(1));
    const level = rawLevel - baseLevel + 1;
    const item = {
      id: heading.id,
      text: heading.textContent || '',
      level,
      parentId: null,
      children: []
    };

    while (stack.length > 1 && stack.at(-1).level >= level) {
      stack.pop();
    }

    const parent = stack.at(-1);
    item.parentId = parent.id;
    parent.children.push(item);
    stack.push(item);
    allItems.push(item);
  });

  return { rootItems, allItems };
}

function renderTocNodes(items) {
  return `
    <ul class="toc-tree">
      ${items.map((item) => {
        const hasChildren = item.children.length > 0;
        return `
          <li class="toc-item toc-item--level-${item.level}${hasChildren ? ' has-children' : ''}" data-toc-item="${item.id}">
            <button class="toc-link-button" type="button" data-target="${item.id}" aria-expanded="false">
              <span class="toc-link-main">
                <span class="toc-link-caret${hasChildren ? '' : ' is-empty'}">${icons.chevronRight}</span>
                <span class="toc-link-text">${item.text}</span>
              </span>
            </button>
            ${hasChildren ? `<div class="toc-children">${renderTocNodes(item.children)}</div>` : ''}
          </li>
        `;
      }).join('')}
    </ul>
  `;
}

function getBranchIds(targetId) {
  const branch = [];
  let current = state.tocIndex.get(targetId);

  while (current) {
    branch.unshift(current.id);
    current = current.parentId ? state.tocIndex.get(current.parentId) : null;
  }

  return branch;
}

function updateTocState(activeId) {
  state.activeTocId = activeId;
  const branchIds = getBranchIds(activeId);
  const branchSet = new Set(branchIds);
  const expandSet = new Set(branchIds.slice(0, -1));
  const activeItem = state.tocIndex.get(activeId);

  if (activeItem?.children.length) {
    expandSet.add(activeItem.id);
  }

  document.querySelectorAll('[data-toc-item]').forEach((itemElement) => {
    const itemId = itemElement.dataset.tocItem;
    const button = itemElement.querySelector('[data-target]');
    const isActive = itemId === activeId;
    const isExpanded = expandSet.has(itemId);
    const isBranch = branchSet.has(itemId);

    itemElement.classList.toggle('is-active', isActive);
    itemElement.classList.toggle('is-branch', isBranch);
    itemElement.classList.toggle('is-expanded', isExpanded);

    if (button) {
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'location' : 'false');
      if (itemElement.classList.contains('has-children')) {
        button.setAttribute('aria-expanded', String(isExpanded));
      }
    }
  });
}

function setupTocTracking(items) {
  state.tocCleanup?.();

  const observed = items
    .map((item) => document.getElementById(item.id))
    .filter(Boolean);

  if (!observed.length) {
    return;
  }

  let frameId = null;

  const sync = () => {
    const offset = 120;
    let current = observed[0];

    for (const element of observed) {
      if (element.getBoundingClientRect().top - offset <= 0) {
        current = element;
      } else {
        break;
      }
    }

    if (current?.id) {
      updateTocState(current.id);
    }

    frameId = null;
  };

  const requestSync = () => {
    if (frameId !== null) {
      return;
    }
    frameId = window.requestAnimationFrame(sync);
  };

  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync, { passive: true });
  requestSync();

  state.tocCleanup = () => {
    window.removeEventListener('scroll', requestSync);
    window.removeEventListener('resize', requestSync);
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}

function renderToc(headings) {
  const container = document.getElementById('tocList');
  const emptyHint = document.getElementById('tocEmpty');
  const { rootItems, allItems } = buildTocData(headings);

  state.tocIndex = new Map(allItems.map((item) => [item.id, item]));

  if (!allItems.length) {
    emptyHint.hidden = false;
    container.innerHTML = '';
    return;
  }

  emptyHint.hidden = true;
  container.innerHTML = renderTocNodes(rootItems);

  container.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) {
        return;
      }

      updateTocState(button.dataset.target);
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  updateTocState(allItems[0].id);
  setupTocTracking(allItems);
}

function enhanceCodeBlocks(container) {
  container.querySelectorAll('pre code').forEach((codeBlock) => {
    try {
      hljs.highlightElement(codeBlock);
    } catch (error) {
      console.error('code-highlight-failed', error);
    }

    const pre = codeBlock.parentElement;
    if (!pre || pre.querySelector('.copy-button')) {
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = '复制';

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent || '');
        button.textContent = '已复制';
        window.setTimeout(() => {
          button.textContent = '复制';
        }, 1200);
      } catch (error) {
        console.error(error);
        button.textContent = '复制失败';
      }
    });

    pre.appendChild(button);
  });
}

function setupPostLayoutBoundsSync() {
  const root = document.getElementById('postRoot');
  if (!root) {
    return;
  }

  let frameId = null;

  const sync = () => {
    const viewportWidth = document.documentElement?.clientWidth || window.innerWidth;
    if (!viewportWidth) {
      frameId = null;
      return;
    }

    const leftBoundary = viewportWidth * 0.05;
    const rightBoundary = viewportWidth * 0.05;
    const contentWidth = Math.max(0, viewportWidth - leftBoundary - rightBoundary);

    root.style.setProperty('--post-left-boundary', `${leftBoundary}px`);
    root.style.setProperty('--post-right-boundary', `${rightBoundary}px`);
    root.style.setProperty('--post-content-width', `${contentWidth}px`);
    frameId = null;
  };

  const requestSync = () => {
    if (frameId !== null) {
      return;
    }
    frameId = window.requestAnimationFrame(sync);
  };

  state.layoutBoundsSync = requestSync;
  sync();
  window.addEventListener('resize', requestSync, { passive: true });
  window.addEventListener('orientationchange', requestSync);
  window.setTimeout(requestSync, 60);
}

function setupDesktopSidebarRail() {
  const sidebar = document.querySelector('.post-sidebar');
  const rail = document.querySelector('.post-sidebar-sticky');
  const hero = document.querySelector('.article-hero--full');
  if (!sidebar || !rail) {
    return;
  }

  let frameId = null;

  const sync = () => {
    if (window.innerWidth < 1040) {
      rail.style.removeProperty('--post-sidebar-left');
      rail.style.removeProperty('--post-sidebar-width');
      rail.style.removeProperty('--post-sidebar-top');
      rail.style.removeProperty('--post-sidebar-max-height');
      frameId = null;
      return;
    }

    const rect = sidebar.getBoundingClientRect();
    const heroRect = hero?.getBoundingClientRect();
    const topOffset = heroRect ? Math.max(24, heroRect.bottom + 12) : 24;
    const maxHeight = Math.max(220, window.innerHeight - topOffset - 24);

    rail.style.setProperty('--post-sidebar-left', `${rect.left}px`);
    rail.style.setProperty('--post-sidebar-width', `${rect.width}px`);
    rail.style.setProperty('--post-sidebar-top', `${topOffset}px`);
    rail.style.setProperty('--post-sidebar-max-height', `${maxHeight}px`);
    frameId = null;
  };

  const requestSync = () => {
    if (frameId !== null) {
      return;
    }
    frameId = window.requestAnimationFrame(sync);
  };

  window.addEventListener('resize', requestSync, { passive: true });
  window.addEventListener('orientationchange', requestSync);
  window.addEventListener('scroll', requestSync, { passive: true });
  requestSync();
  window.setTimeout(requestSync, 60);
}

function enhanceImages(container) {
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeButton = document.getElementById('lightboxClose');

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    lightboxCaption.textContent = '';
  };

  closeButton.addEventListener('click', close);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      close();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
    }
  });

  container.querySelectorAll('img').forEach((image) => {
    image.addEventListener('click', () => {
      lightboxImage.src = image.currentSrc || image.src;
      lightboxCaption.textContent = image.alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });
}

function renderMeta(post) {
  document.title = `${post.title} | 如珩的博客`;
  document.getElementById('postTitle').textContent = post.title;
  document.getElementById('postHeroMeta').innerHTML = `
    <span class="meta-pill">${icons.clock}<span>${formatDate(post.date)}</span></span>
  `;

  document.getElementById('postCategories').innerHTML = post.categories
    .map((category, index) => `<a class="category-chip" href="${getCategoryUrl(post.categories.slice(0, index + 1))}">${icons.tag}<span>${category}</span></a>`)
    .join('');
}

async function fetchMarkdown(post) {
  let lastHttp = '';
  let lastFetch = '';

  for (const markdownUrl of getMarkdownPathCandidates(post)) {
    try {
      const response = await fetch(markdownUrl, { cache: 'no-cache' });
      if (response.ok) {
        return response.text();
      }
      lastHttp = `${response.status}`;
    } catch (error) {
      lastFetch = markdownUrl;
    }
  }

  if (lastHttp) {
    throw new Error(`markdown-http-failed:${lastHttp}`);
  }

  throw new Error(`markdown-fetch-failed:${lastFetch || 'unknown'}`);
}

async function renderPostContent(post) {
  const container = document.getElementById('articleContent');
  setArticleStatus('正在读取 Markdown...');

  const rawMarkdown = await fetchMarkdown(post);
  const strippedMarkdown = stripLeadingHeading(rawMarkdown);
  const { markdown, displayMathBlocks } = protectDisplayMathBlocks(strippedMarkdown);
  let html;
  try {
    html = marked.parse(markdown);
  } catch (error) {
    throw new Error('markdown-render-failed');
  }

  container.innerHTML = html;
  container.__displayMathBlocks = displayMathBlocks;
  delete container.dataset.mathEnhanced;
  setArticleStatus('Markdown 已加载，正在增强公式、代码和目录…');

  try {
    normalizeRelativeAssets(container, post.path);
  } catch (error) {
    console.error('asset-normalize-failed', error);
  }

  try {
    await renderMath(container);
  } catch (error) {
    console.error('math-render-failed', error);
  }

  try {
    enhanceCodeBlocks(container);
  } catch (error) {
    console.error('code-enhance-failed', error);
  }

  try {
    const headings = assignHeadingIds(container);
    renderToc(headings);
  } catch (error) {
    console.error('toc-render-failed', error);
  }

  try {
    enhanceImages(container);
  } catch (error) {
    console.error('image-enhance-failed', error);
  }

  state.layoutBoundsSync?.();
  setArticleStatus('');
}

function showPostError(message) {
  renderInlineError(message);
  setArticleStatus('');
}

async function init() {
  document.documentElement.classList.add('is-post-page');
  initThemeToggles();
  setupPostBackground();
  setupPostLayoutBoundsSync();
  setupDesktopSidebarRail();

  const postId = getPostIdFromUrl();
  if (!postId) {
    showPostError('缺少文章 id，无法定位具体内容。');
    return;
  }

  try {
    state.config = await fetchBlogConfig();
  } catch (error) {
    console.error(error);
    showPostError('博客配置读取失败，请确认 `Blog/config.json` 可访问。');
    return;
  }

  state.post = state.config.posts.find((post) => post.id === postId);
  if (!state.post) {
    showPostError(`没有找到 id 为「${postId}」的文章。`);
    return;
  }

  renderMeta(state.post);

  try {
    await renderPostContent(state.post);
  } catch (error) {
    console.error(error);

    const container = document.getElementById('articleContent');
    const hasRenderedContent = Boolean(container?.textContent?.trim() || container?.querySelector('img, pre, table, blockquote'));

    if (hasRenderedContent) {
      setArticleStatus('正文已加载，但部分增强失败；可先继续阅读。');
      return;
    }

    if (String(error.message).startsWith('markdown-fetch-failed')) {
      showPostError('Markdown 文件请求失败，请检查文章路径、文件名与部署产物。');
    } else if (String(error.message).startsWith('markdown-http-failed')) {
      showPostError(`Markdown 文件读取失败：${error.message.replace('markdown-http-failed:', 'HTTP ')}`);
    } else if (error.message === 'markdown-render-failed') {
      showPostError('Markdown 渲染失败，请检查文章内容格式。');
    } else {
      showPostError('文章加载失败，但页面结构仍可用。请打开控制台查看具体错误。');
    }
  }
}

init();
