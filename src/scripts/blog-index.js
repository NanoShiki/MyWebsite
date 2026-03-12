import '../styles/base.css';
import '../styles/blog.css';
import { marked } from 'marked';
import { icons } from './shared/icons.js';
import { setupRevealAnimations } from './shared/motion.js';
import { PROFILE_LINKS, SITE_COPY } from './shared/site-meta.js';
import { initThemeToggles } from './shared/theme.js';
import {
  collectPostsFromNode,
  fetchBlogConfig,
  findNodeByPath,
  flattenCategoryNodes,
  formatDate,
  getMarkdownPathCandidates,
  getPostUrl,
  resolveSiteAssetUrl
} from './shared/site-data.js';

const state = {
  config: null,
  initialExpandedPath: [],
  expandedCategoryPaths: new Set(),
  activeTagPath: [],
  flatCategoryNodes: [],
  coverCache: new Map(),
  postsRenderToken: 0,
  postsTransitionId: 0,
  postsTransitionTimers: []
};

const LINK_ICONS = {
  github: icons.github,
  bilibili: icons.bilibili,
  zhihu: icons.zhihu
};

const TAG_PALETTES = [
  { day: '#5d89cd', night: '#a7cbff' },
  { day: '#4d8b63', night: '#98dbb0' },
  { day: '#b9842f', night: '#f4cf87' },
  { day: '#a65c6b', night: '#f4aebe' },
  { day: '#6e69cd', night: '#c0b9ff' },
  { day: '#438c9d', night: '#95dceb' }
];

function hashText(value = '') {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function getTagVisual(node, maxCount) {
  const hash = hashText(node.path.join('/'));
  const palette = TAG_PALETTES[hash % TAG_PALETTES.length];
  const intensity = maxCount ? node.postCount / maxCount : 0;
  const weight = Number((1 + intensity * 4).toFixed(2));
  const order = Math.round((1 - intensity) * 12) + (hash % 9);
  const topSpace = `${(hash % 5) * 5}px`;
  const bottomSpace = `${(hash % 3) * 3}px`;
  const opacity = Number((0.68 + intensity * 0.32).toFixed(2));

  return {
    order,
    weight,
    topSpace,
    bottomSpace,
    opacity,
    day: palette.day,
    night: palette.night,
    dayGlow: `${palette.day}33`,
    nightGlow: `${palette.night}2f`
  };
}

function pathKey(pathSegments = []) {
  return pathSegments.join('/');
}

function parsePathParam(name) {
  const search = new URLSearchParams(window.location.search);
  const rawPath = search.get(name);
  if (!rawPath) {
    return [];
  }

  return rawPath.split('/').map((segment) => segment.trim()).filter(Boolean);
}

function buildExpandedPathSet(pathSegments = []) {
  const expanded = new Set();
  const segments = [];

  pathSegments.forEach((segment) => {
    segments.push(segment);
    expanded.add(pathKey(segments));
  });

  return expanded;
}

function hasExpandedDescendant(pathSegments = []) {
  const prefix = pathKey(pathSegments);
  if (!prefix) {
    return false;
  }

  for (const expandedPath of state.expandedCategoryPaths) {
    if (expandedPath.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  return false;
}

function syncUrl() {
  const url = new URL(window.location.href);

  if (state.initialExpandedPath.length) {
    url.searchParams.set('path', state.initialExpandedPath.join('/'));
  } else {
    url.searchParams.delete('path');
  }

  if (state.activeTagPath.length) {
    url.searchParams.set('tag', state.activeTagPath.join('/'));
  } else {
    url.searchParams.delete('tag');
  }

  window.history.replaceState({}, '', url);
}

function clearPostsTransitionTimers() {
  state.postsTransitionTimers.forEach((timerId) => window.clearTimeout(timerId));
  state.postsTransitionTimers = [];
}

function resetPostsPanelTransition() {
  const panel = document.getElementById('postsPanel');
  clearPostsTransitionTimers();
  state.postsTransitionId += 1;

  if (!panel) {
    return;
  }

  panel.classList.remove('is-switching', 'is-switching-out', 'is-switching-in');
  panel.style.removeProperty('min-height');
}

function getFilteredPosts() {
  if (!state.activeTagPath.length) {
    return collectPostsFromNode(state.config.categoryTree);
  }

  const node = findNodeByPath(state.config.categoryTree, state.activeTagPath);
  return node ? collectPostsFromNode(node) : [];
}

function toggleExpandedCategory(pathSegments = []) {
  const nextKey = pathKey(pathSegments);
  if (!nextKey) {
    return;
  }

  if (state.expandedCategoryPaths.has(nextKey)) {
    [...state.expandedCategoryPaths].forEach((expandedPath) => {
      if (expandedPath === nextKey || expandedPath.startsWith(`${nextKey}/`)) {
        state.expandedCategoryPaths.delete(expandedPath);
      }
    });
  } else {
    const segments = [];
    pathSegments.forEach((segment) => {
      segments.push(segment);
      state.expandedCategoryPaths.add(pathKey(segments));
    });
  }

  updateArchiveTreeState();
}

function setActiveTag(pathSegments = []) {
  const nextTagPath = [...pathSegments];
  if (pathKey(nextTagPath) === pathKey(state.activeTagPath)) {
    return;
  }

  state.activeTagPath = nextTagPath;
  syncUrl();
  renderHeatmap(state.flatCategoryNodes);
  renderPostsPanel({ animate: true });
}

function renderSidebarLinks() {
  const container = document.getElementById('sidebarLinks');
  const copy = document.getElementById('profileCopy');
  if (copy) {
    copy.textContent = SITE_COPY.siteSubtitle;
  }

  container.innerHTML = PROFILE_LINKS.map((link) => `
    <a class="profile-link-icon" href="${link.href}" target="_blank" rel="noreferrer noopener" aria-label="${link.label}" title="${link.label}">
      ${LINK_ICONS[link.key] || icons.compass}
    </a>
  `).join('');
}

function renderHero(config) {
  document.getElementById('blogTitle').textContent = config.site.title;
}

function renderArchivePost(post) {
  return `
    <li class="archive-node archive-node--post" data-node-type="post" data-archive-post-id="${post.id}">
      <a class="archive-post-link" href="${getPostUrl(post.id)}">
        <span class="archive-node-main">
          <span class="archive-node-caret is-empty"></span>
          <span class="archive-node-icon">${icons.fileText}</span>
          <span class="archive-node-text">${post.title}</span>
        </span>
      </a>
    </li>
  `;
}

function renderArchiveBranch(node, path = []) {
  const nextPath = node.name === 'root' ? path : [...path, node.name];
  const isRoot = node.name === 'root';
  const nextKey = pathKey(nextPath);
  const isExpanded = !isRoot && state.expandedCategoryPaths.has(nextKey);
  const isPathActive = !isRoot && (isExpanded || hasExpandedDescendant(nextPath));
  const shouldExpand = isRoot || isExpanded;
  const categoryChildren = Array.isArray(node.children) ? node.children : [];
  const postChildren = Array.isArray(node.posts) ? node.posts : [];
  const hasChildren = categoryChildren.length > 0 || postChildren.length > 0;

  if (isRoot) {
    return `
      <ul class="archive-tree-list archive-tree-list--root">
        ${categoryChildren.map((child) => renderArchiveBranch(child, [])).join('')}
      </ul>
    `;
  }

  return `
    <li class="archive-node${hasChildren ? ' has-children' : ''}${isExpanded ? ' is-current' : ''}${isPathActive ? ' is-path-active' : ''}${shouldExpand ? ' is-expanded' : ''}" data-node-path="${nextKey}" data-node-type="category">
      <button class="archive-node-button" type="button" data-category-path="${nextKey}" aria-expanded="${hasChildren ? String(shouldExpand) : 'false'}">
        <span class="archive-node-main">
          <span class="archive-node-caret${hasChildren ? '' : ' is-empty'}">${hasChildren ? icons.chevronRight : ''}</span>
          <span class="archive-node-icon">${shouldExpand || isPathActive ? icons.folderOpen : icons.folder}</span>
          <span class="archive-node-text">${node.name}</span>
        </span>
      </button>
      ${hasChildren ? `
        <div class="archive-branch">
          <ul class="archive-tree-list archive-tree-list--nested">
            ${categoryChildren.map((child) => renderArchiveBranch(child, nextPath)).join('')}
            ${postChildren.map((post) => renderArchivePost(post)).join('')}
          </ul>
        </div>
      ` : ''}
    </li>
  `;
}

function updateArchiveTreeState() {
  const container = document.getElementById('archiveTree');
  if (!container) {
    return;
  }

  container.querySelectorAll('[data-node-type="category"]').forEach((nodeElement) => {
    const rawPath = nodeElement.dataset.nodePath || '';
    const nodePath = rawPath.split('/').filter(Boolean);
    const nodeKey = pathKey(nodePath);
    const isExpanded = state.expandedCategoryPaths.has(nodeKey);
    const isPathActive = isExpanded || hasExpandedDescendant(nodePath);
    const button = nodeElement.querySelector('[data-category-path]');
    const icon = nodeElement.querySelector('.archive-node-icon');

    nodeElement.classList.toggle('is-current', isExpanded);
    nodeElement.classList.toggle('is-path-active', isPathActive);
    nodeElement.classList.toggle('is-expanded', isExpanded);

    if (button && nodeElement.classList.contains('has-children')) {
      button.setAttribute('aria-expanded', String(isExpanded));
    }

    if (icon) {
      icon.innerHTML = isExpanded || isPathActive ? icons.folderOpen : icons.folder;
    }
  });
}

function renderArchiveTree(tree) {
  const container = document.getElementById('archiveTree');
  container.innerHTML = renderArchiveBranch(tree);

  container.querySelectorAll('[data-category-path]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleExpandedCategory(button.dataset.categoryPath.split('/').filter(Boolean));
    });
  });

  updateArchiveTreeState();
}

async function renderPosts(posts = [], renderToken = 0) {
  const container = document.getElementById('postsGrid');
  const description = document.getElementById('postSectionDesc');
  description.textContent = '按时间倒序展示文章。';

  if (!posts.length) {
    container.innerHTML = '<div class="empty-card">这个筛选结果下暂时还没有文章。</div>';
    return;
  }

  container.innerHTML = posts.map((post) => `
    <a class="post-card post-card--text-only" data-reveal href="${getPostUrl(post.id)}" data-post-id="${post.id}" aria-label="打开文章：${post.title}">
      <div class="post-card-body">
        <h3>${post.title}</h3>
        <div class="post-meta">
          <span>${icons.clock}</span>
          <span>${formatDate(post.date)}</span>
        </div>
        <div class="post-tags">
          ${post.categories.map((category) => `<span class="post-tag">${icons.tag}<span>${category}</span></span>`).join('')}
        </div>
      </div>
    </a>
  `).join('');

  await hydratePostCovers(posts, renderToken);
}

function renderHeatmap(nodes) {
  const container = document.getElementById('tagHeatmap');
  const items = nodes.filter((node) => node.postCount > 0);

  if (!items.length) {
    container.innerHTML = '<p class="tag-heatmap-empty">暂时还没有可展示的 Tag。</p>';
    return;
  }

  const maxCount = Math.max(...items.map((node) => node.postCount), 1);
  const activeTagKey = pathKey(state.activeTagPath);
  const cloud = items
    .map((node) => ({
      node,
      visual: getTagVisual(node, maxCount)
    }))
    .sort((left, right) => left.visual.order - right.visual.order || right.node.postCount - left.node.postCount || left.node.name.localeCompare(right.node.name, 'zh-Hans-CN'));

  container.innerHTML = cloud
    .map(({ node, visual }) => `
      <button
        class="heat-tag${pathKey(node.path) === activeTagKey ? ' is-active' : ''}"
        type="button"
        data-tag-path="${node.path.join('/')}"
        style="--weight:${visual.weight};--tag-order:${visual.order};--tag-top-space:${visual.topSpace};--tag-bottom-space:${visual.bottomSpace};--tag-opacity:${visual.opacity};--tag-color-day:${visual.day};--tag-color-night:${visual.night};--tag-glow-day:${visual.dayGlow};--tag-glow-night:${visual.nightGlow};"
        title="${node.path.join(' / ')}"
      >
        <span class="heat-tag-label">${node.name}</span>
      </button>
    `)
    .join('');

  container.querySelectorAll('[data-tag-path]').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveTag(button.dataset.tagPath.split('/').filter(Boolean));
    });
  });
}

function renderPostsControls() {
  const toolbar = document.getElementById('postsToolbar');
  const clearButton = document.getElementById('clearTagFilter');
  const isActive = state.activeTagPath.length > 0;

  if (toolbar) {
    toolbar.classList.toggle('is-active', isActive);
  }

  if (clearButton) {
    clearButton.hidden = !isActive;
  }
}

function renderPostsPanel(options = {}) {
  const { animate = false } = options;
  const panel = document.getElementById('postsPanel');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderCurrentPosts = async () => {
    renderPostsControls();
    const renderToken = ++state.postsRenderToken;
    await renderPosts(getFilteredPosts(), renderToken);

    if (renderToken === state.postsRenderToken) {
      setupRevealAnimations();
    }
  };

  if (!animate || reduceMotion || !panel) {
    resetPostsPanelTransition();
    renderCurrentPosts();
    return;
  }

  resetPostsPanelTransition();
  const transitionId = state.postsTransitionId;
  const currentHeight = panel.getBoundingClientRect().height;

  if (currentHeight > 0) {
    panel.style.minHeight = `${currentHeight}px`;
  }

  panel.classList.add('is-switching', 'is-switching-out');

  const fadeOutTimer = window.setTimeout(async () => {
    if (transitionId !== state.postsTransitionId) {
      return;
    }

    await renderCurrentPosts();

    window.requestAnimationFrame(() => {
      if (transitionId !== state.postsTransitionId) {
        return;
      }

      panel.classList.remove('is-switching-out');
      panel.classList.add('is-switching-in');

      const finishTimer = window.setTimeout(() => {
        if (transitionId !== state.postsTransitionId) {
          return;
        }

        panel.classList.remove('is-switching', 'is-switching-in');
        panel.style.removeProperty('min-height');
      }, 220);

      state.postsTransitionTimers.push(finishTimer);
    });
  }, 110);

  state.postsTransitionTimers.push(fadeOutTimer);
}

function findFirstImageToken(tokens = []) {
  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (token.type === 'image' && token.href) {
      return token.href;
    }

    if (Array.isArray(token.tokens)) {
      const nested = findFirstImageToken(token.tokens);
      if (nested) {
        return nested;
      }
    }

    if (Array.isArray(token.items)) {
      const nested = findFirstImageToken(token.items.flatMap((item) => item.tokens || []));
      if (nested) {
        return nested;
      }
    }
  }

  return '';
}

async function getPostCoverUrl(post) {
  if (state.coverCache.has(post.id)) {
    return state.coverCache.get(post.id);
  }

  try {
    for (const markdownUrl of getMarkdownPathCandidates(post)) {
      const response = await fetch(markdownUrl, { cache: 'force-cache' });
      if (!response.ok) {
        continue;
      }

      const markdown = await response.text();
      const tokens = marked.lexer(markdown);
      const imagePath = findFirstImageToken(tokens);
      const coverUrl = imagePath ? resolveSiteAssetUrl(post.path, imagePath, { preserveAmpersand: true }) : '';
      state.coverCache.set(post.id, coverUrl);
      return coverUrl;
    }
  } catch (error) {
    console.error(error);
  }

  state.coverCache.set(post.id, '');
  return '';
}

async function hydratePostCovers(posts, renderToken) {
  await Promise.all(posts.map(async (post) => {
    const coverUrl = await getPostCoverUrl(post);
    if (!coverUrl || renderToken !== state.postsRenderToken) {
      return;
    }

    const card = document.querySelector(`.posts-grid .post-card[data-post-id="${CSS.escape(post.id)}"]`);
    if (!card || card.querySelector('.post-cover')) {
      return;
    }

    const cover = document.createElement('div');
    cover.className = 'post-cover';
    cover.innerHTML = `<img src="${coverUrl}" alt="${post.title} 封面">`;
    card.append(cover);
    card.classList.remove('post-card--text-only');
    card.classList.add('has-cover', 'post-card--cover-right');
  }));
}

function renderPage() {
  renderHero(state.config);
  renderArchiveTree(state.config.categoryTree);
  renderHeatmap(state.flatCategoryNodes);
  renderPostsPanel();
  setupRevealAnimations();
}

async function init() {
  initThemeToggles();
  renderSidebarLinks();

  const clearFilterButton = document.getElementById('clearTagFilter');
  clearFilterButton?.addEventListener('click', () => {
    setActiveTag([]);
  });

  try {
    state.config = await fetchBlogConfig();
    state.initialExpandedPath = parsePathParam('path');
    state.activeTagPath = parsePathParam('tag');

    if (state.initialExpandedPath.length && !findNodeByPath(state.config.categoryTree, state.initialExpandedPath)) {
      state.initialExpandedPath = [];
    }

    if (state.activeTagPath.length && !findNodeByPath(state.config.categoryTree, state.activeTagPath)) {
      state.activeTagPath = [];
    }

    state.expandedCategoryPaths = buildExpandedPathSet(state.initialExpandedPath);
    state.flatCategoryNodes = flattenCategoryNodes(state.config.categoryTree);
    syncUrl();
    renderPage();
  } catch (error) {
    console.error(error);
    document.getElementById('blogRoot').innerHTML = '<div class="inline-error">博客配置读取失败，请检查 `Blog/config.json` 是否可访问。</div>';
  }
}

init();
