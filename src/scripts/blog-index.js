import '../styles/base.css';
import '../styles/blog.css';
import { marked } from 'marked';
import { icons } from './shared/icons.js';
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
  resolveSiteAssetUrl,
  withBase
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
  postsTransitionTimers: [],
  postsHover: {
    mediaQuery: null,
    shell: null,
    grid: null,
    slots: [],
    focusSlot: null,
    lastPointer: null,
    rafId: 0,
    lastFrameTime: 0,
    dirty: false,
    needsMeasure: false,
    isBound: false
  }
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

const BLOG_BACKGROUND_CANDIDATES = [
  '/site-assets/blog/backgrounds/blog-cover.webp',
  '/site-assets/blog/backgrounds/blog-cover.png',
  '/site-assets/blog/backgrounds/blog-cover.jpg',
  '/site-assets/blog/backgrounds/blog-cover.jpeg',
  '/site-assets/shared/backgrounds/site-cover.webp',
  '/site-assets/shared/backgrounds/site-cover.png',
  '/site-assets/shared/backgrounds/site-cover.jpg',
  '/site-assets/shared/backgrounds/site-cover.jpeg'
];

const BLOG_GLASS_NOISE_CANDIDATES = [
  '/site-assets/blog/textures/glass-noise.webp',
  '/site-assets/blog/textures/glass-noise.png',
  '/site-assets/blog/textures/glass-noise.jpg',
  '/site-assets/blog/textures/glass-noise.jpeg'
];

const BLOG_WIND_EMBLEM_CANDIDATES = [
  '/site-assets/blog/ornaments/wind-emblem.webp',
  '/site-assets/blog/ornaments/wind-emblem.png',
  '/site-assets/blog/ornaments/wind-emblem.jpg',
  '/site-assets/blog/ornaments/wind-emblem.jpeg'
];

const BLOG_PARCHMENT_TEXTURE_CANDIDATES = [
  '/site-assets/blog/textures/parchment-texture.webp',
  '/site-assets/blog/textures/parchment-texture.png',
  '/site-assets/blog/textures/parchment-texture.jpg',
  '/site-assets/blog/textures/parchment-texture.jpeg'
];

const BLOG_WOOD_GRAIN_CANDIDATES = [
  '/site-assets/blog/textures/wood-grain.webp',
  '/site-assets/blog/textures/wood-grain.png',
  '/site-assets/blog/textures/wood-grain.jpg',
  '/site-assets/blog/textures/wood-grain.jpeg'
];

const BLOG_RUINS_OVERLAY_CANDIDATES = [
  '/site-assets/blog/ornaments/ruins-overlay.webp',
  '/site-assets/blog/ornaments/ruins-overlay.png',
  '/site-assets/blog/ornaments/ruins-overlay.jpg',
  '/site-assets/blog/ornaments/ruins-overlay.jpeg'
];

const BLOG_CORNER_ORNAMENT_CANDIDATES = [
  '/site-assets/blog/ornaments/corner-ornament.webp',
  '/site-assets/blog/ornaments/corner-ornament.png',
  '/site-assets/blog/ornaments/corner-ornament.jpg',
  '/site-assets/blog/ornaments/corner-ornament.jpeg'
];

const BLOG_DIVIDER_SEAL_CANDIDATES = [
  '/site-assets/blog/ornaments/divider-seal.webp',
  '/site-assets/blog/ornaments/divider-seal.png',
  '/site-assets/blog/ornaments/divider-seal.jpg',
  '/site-assets/blog/ornaments/divider-seal.jpeg'
];

let cleanupBlogReplayAnimations = null;
let triggerBlogReplayRefresh = () => {};
let blogReplayRefreshTimers = [];
let profileAvatarLoadToken = 0;

const BLOG_PROFILE_AVATAR_CACHE_KEY = 'blog-profile-avatar-cache/v1';
const BLOG_PROFILE_AVATAR_TIMEOUT_MS = 8000;
const BLOG_PROFILE_AVATAR_SEED_URL = 'https://i2.hdslb.com/bfs/face/69257695fad31de469c230d559e0fb2dc0f79876.jpg';

let blogHeroTypingRunId = 0;
let hasPrimedBlogHeroTyping = false;

const BLOG_TYPING_PUNCTUATION = new Set(['，', '。', '！', '？', '：', '；', '、']);
const POSTS_HOVER_MEDIA_QUERY = '(min-width: 1040px) and (hover: hover) and (pointer: fine)';

function segmentTypingText(text = '') {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }).segment(text)].map((part) => part.segment);
  }

  return Array.from(text);
}

function delay(ms = 0) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForDomReady() {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
}

async function waitForFontsSoft(timeoutMs = 160) {
  if (!('fonts' in document) || !document.fonts?.ready) {
    return;
  }

  try {
    await Promise.race([document.fonts.ready, delay(timeoutMs)]);
  } catch (error) {
    console.error('blog-fonts-soft-wait-failed', error);
  }
}

async function waitForBlogTypingReady() {
  await waitForDomReady();
  await delay(90);
  await waitForFontsSoft(160);
}

async function typeBlogHeroLine(target, text, options = {}) {
  const {
    charDelay = 110,
    endDelay = 0,
    isCancelled = null,
    punctuationPauseBefore = 90,
    punctuationPauseAfter = 260,
    newlineDelay = 22
  } = options;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!target) {
    return true;
  }

  target.textContent = '';

  if (reduceMotion) {
    target.textContent = text;
    target.classList.remove('is-typing');
    return true;
  }

  target.classList.add('is-typing');

  for (const character of segmentTypingText(text)) {
    if (typeof isCancelled === 'function' && isCancelled()) {
      target.classList.remove('is-typing');
      return false;
    }

    if (character === '\n') {
      target.textContent += character;
      if (newlineDelay > 0) {
        await delay(newlineDelay);
      }
      continue;
    }

    const isPunctuation = BLOG_TYPING_PUNCTUATION.has(character);

    if (isPunctuation && punctuationPauseBefore > 0) {
      await delay(punctuationPauseBefore);
      if (typeof isCancelled === 'function' && isCancelled()) {
        target.classList.remove('is-typing');
        return false;
      }
    }

    target.textContent += character;
    await delay(isPunctuation ? punctuationPauseAfter : charDelay);
  }

  if (typeof isCancelled === 'function' && isCancelled()) {
    target.classList.remove('is-typing');
    return false;
  }

  if (endDelay > 0) {
    await delay(endDelay);
  }

  if (typeof isCancelled === 'function' && isCancelled()) {
    target.classList.remove('is-typing');
    return false;
  }

  return true;
}

function getBlogHeroTypingNodes() {
  const title = document.getElementById('blogHeroTitle');
  const titleTop = document.getElementById('blogHeroTitleTop');
  const titleBottom = document.getElementById('blogHeroTitleBottom');
  const lead = document.getElementById('blogHeroLead');

  return { title, titleTop, titleBottom, lead };
}

function cancelBlogHeroTyping() {
  blogHeroTypingRunId += 1;
  const { titleTop, titleBottom, lead } = getBlogHeroTypingNodes();

  titleTop?.classList.remove('is-typing');
  titleBottom?.classList.remove('is-typing');
  lead?.classList.remove('is-typing');
}

function renderBlogHeroTitleInstant() {
  const { title, titleTop, titleBottom, lead } = getBlogHeroTypingNodes();
  const topText = SITE_COPY.blogHeroTitleTop || '如珩の';
  const bottomText = SITE_COPY.blogHeroTitleBottom || '冒险笔记';
  const leadText = SITE_COPY.blogHeroLead || '风穿过石墙与晨光，旅者在这里整理一路所得的见闻。';

  if (!title || !titleTop || !titleBottom || !lead) {
    return;
  }

  title.setAttribute('aria-label', `${topText} ${bottomText}`);
  titleTop.textContent = topText;
  titleBottom.textContent = bottomText;
  lead.textContent = leadText;
  titleTop.classList.remove('is-typing');
  titleBottom.classList.remove('is-typing');
  lead.classList.remove('is-typing');
}

async function playBlogHeroTyping(options = {}) {
  const { waitForReady = false } = options;
  const { title, titleTop, titleBottom, lead } = getBlogHeroTypingNodes();
  const topText = SITE_COPY.blogHeroTitleTop || '如珩の';
  const bottomText = SITE_COPY.blogHeroTitleBottom || '冒险笔记';
  const leadText = SITE_COPY.blogHeroLead || '风穿过石墙与晨光，旅者在这里整理一路所得的见闻。';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const runId = ++blogHeroTypingRunId;

  if (!title || !titleTop || !titleBottom || !lead) {
    return;
  }

  title.setAttribute('aria-label', `${topText} ${bottomText}`);
  titleTop.textContent = '';
  titleBottom.textContent = '';
  lead.textContent = '';

  if (waitForReady) {
    await waitForBlogTypingReady();
    hasPrimedBlogHeroTyping = true;
  } else {
    await delay(120);
  }

  if (runId !== blogHeroTypingRunId) {
    return;
  }

  if (reduceMotion) {
    renderBlogHeroTitleInstant();
    return;
  }

  const isCancelled = () => runId !== blogHeroTypingRunId;

  const didTypeTop = await typeBlogHeroLine(titleTop, topText, {
    charDelay: 102,
    endDelay: 240,
    isCancelled
  });

  if (!didTypeTop || isCancelled()) {
    titleTop.classList.remove('is-typing');
    return;
  }

  titleTop.classList.remove('is-typing');

  const didTypeBottom = await typeBlogHeroLine(titleBottom, bottomText, {
    charDelay: 90,
    endDelay: 220,
    isCancelled
  });

  if (!didTypeBottom || isCancelled()) {
    titleBottom.classList.remove('is-typing');
    return;
  }

  titleBottom.classList.remove('is-typing');

  const didTypeLead = await typeBlogHeroLine(lead, leadText, {
    charDelay: 42,
    punctuationPauseBefore: 120,
    punctuationPauseAfter: 300,
    newlineDelay: 70,
    endDelay: 0,
    isCancelled
  });

  if (!didTypeLead || isCancelled()) {
    lead.classList.remove('is-typing');
    return;
  }

  lead.classList.remove('is-typing');
}

function getBlogMapTypingNodes() {
  const title = document.getElementById('blogOverviewTitle');
  const lead = document.getElementById('blogOverviewLead');

  return { title, lead };
}

function renderBlogMapHeadingInstant() {
  const { title, lead } = getBlogMapTypingNodes();
  const titleText = SITE_COPY.blogMapTitle || '文章地图';
  const leadText = SITE_COPY.blogMapLead || '风会穿过目录枝叶，把每一篇旅途记录带回你的手边。';

  if (!title || !lead) {
    return;
  }

  title.setAttribute('aria-label', titleText);
  title.innerHTML = `
    <span class="blog-overview-title-label">${titleText}</span>
    <span class="blog-overview-title-mark" aria-hidden="true">📜</span>
  `;
  lead.innerHTML = leadText.split('\n').map((line) => line.trim()).join('<br>');
  title.classList.remove('is-typing');
  lead.classList.remove('is-typing');
}

function findProfileLink(key = '') {
  return PROFILE_LINKS.find((link) => link.key === key) || null;
}

function getBilibiliMidFromUrl(url = '') {
  const match = url.match(/space\.bilibili\.com\/(\d+)/i);
  return match?.[1] || '';
}

function readCachedProfileAvatar() {
  try {
    const raw = window.localStorage.getItem(BLOG_PROFILE_AVATAR_CACHE_KEY);
    if (!raw) {
      return '';
    }

    const parsed = JSON.parse(raw);
    return typeof parsed?.url === 'string' ? parsed.url : '';
  } catch {
    return '';
  }
}

function writeCachedProfileAvatar(url = '') {
  if (!url) {
    return;
  }

  try {
    window.localStorage.setItem(BLOG_PROFILE_AVATAR_CACHE_KEY, JSON.stringify({
      url,
      updatedAt: Date.now()
    }));
  } catch {
    // Ignore storage failures and keep runtime-only avatar state.
  }
}

function applyProfileAvatar(url = '') {
  const avatar = document.querySelector('.profile-avatar');
  if (!(avatar instanceof HTMLElement)) {
    return;
  }

  avatar.classList.toggle('has-profile-avatar', Boolean(url));
  if (url) {
    const safeUrl = String(url).replace(/(["\\])/g, '\\$1');
    avatar.style.setProperty('--profile-avatar-image', `url("${safeUrl}")`);
  } else {
    avatar.style.removeProperty('--profile-avatar-image');
  }
}

function preloadProfileAvatar(url = '') {
  return new Promise((resolve) => {
    if (!url) {
      resolve('');
      return;
    }

    const image = new Image();
    let settled = false;

    const finalize = (value = '') => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    };

    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.onload = () => finalize(url);
    image.onerror = () => finalize('');
    image.src = url;

    if (image.complete && image.naturalWidth > 0) {
      finalize(url);
    }
  });
}

function requestJsonp(url = '', { callbackParam = 'callback', callbackPrefix = '__blogAvatarJsonp', timeout = BLOG_PROFILE_AVATAR_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }

    const callbackName = `${callbackPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const script = document.createElement('script');
    let settled = false;
    let timerId = 0;

    const cleanup = () => {
      window.clearTimeout(timerId);
      delete window[callbackName];
      script.remove();
    };

    const finalizeResolve = (value) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(value);
    };

    const finalizeReject = (error) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(error);
    };

    window[callbackName] = (payload) => {
      finalizeResolve(payload);
    };

    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}${callbackParam}=${encodeURIComponent(callbackName)}`;
    script.async = true;
    script.onerror = () => finalizeReject(new Error('jsonp-load-failed'));

    timerId = window.setTimeout(() => {
      finalizeReject(new Error('jsonp-timeout'));
    }, timeout);

    document.head.append(script);
  });
}

async function fetchBilibiliProfileAvatar(mid = '') {
  if (!mid) {
    return '';
  }

  try {
    const payload = await requestJsonp(`https://api.bilibili.com/x/web-interface/card?mid=${encodeURIComponent(mid)}&jsonp=jsonp`, {
      callbackPrefix: '__blogBilibiliAvatarCb'
    });

    if (payload?.code !== 0) {
      return '';
    }

    return payload?.data?.card?.face || '';
  } catch {
    return '';
  }
}

function setupProfileAvatar() {
  const bilibiliLink = findProfileLink('bilibili');
  const mid = getBilibiliMidFromUrl(bilibiliLink?.href || '');

  if (!mid) {
    return;
  }

  const cachedUrl = readCachedProfileAvatar();
  const initialUrl = cachedUrl || BLOG_PROFILE_AVATAR_SEED_URL;
  const loadToken = ++profileAvatarLoadToken;

  applyProfileAvatar('');

  if (initialUrl) {
    void preloadProfileAvatar(initialUrl).then((resolvedUrl) => {
      if (!resolvedUrl || loadToken !== profileAvatarLoadToken) {
        return;
      }

      applyProfileAvatar(resolvedUrl);
    });
  }

  void fetchBilibiliProfileAvatar(mid).then((avatarUrl) => {
    if (!avatarUrl) {
      return;
    }

    void preloadProfileAvatar(avatarUrl).then((resolvedUrl) => {
      if (!resolvedUrl || loadToken !== profileAvatarLoadToken) {
        return;
      }

      applyProfileAvatar(resolvedUrl);
      writeCachedProfileAvatar(resolvedUrl);
    });
  });
}

async function probeAsset(url = '') {
  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
    if (response.ok) {
      return true;
    }

    if (response.status === 405) {
      const fallback = await fetch(url, { method: 'GET', cache: 'no-cache' });
      return fallback.ok;
    }
  } catch {
    return false;
  }

  return false;
}

async function findAvailableAsset(paths = []) {
  for (const rawPath of paths) {
    const assetUrl = withBase(rawPath);
    if (await probeAsset(assetUrl)) {
      return assetUrl;
    }
  }

  return '';
}

function applyOptionalBlogAsset(root, { className = '', cssVariable = '', assetUrl = '' } = {}) {
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

async function setupBlogBackground() {
  const root = document.documentElement;
  root.classList.add('is-blog-page');
  root.style.removeProperty('--blog-story-image');

  const [
    backgroundAsset,
    glassNoiseAsset,
    windEmblemAsset,
    parchmentTextureAsset,
    woodGrainAsset,
    ruinsOverlayAsset,
    cornerOrnamentAsset,
    dividerSealAsset
  ] = await Promise.all([
    findAvailableAsset(BLOG_BACKGROUND_CANDIDATES),
    findAvailableAsset(BLOG_GLASS_NOISE_CANDIDATES),
    findAvailableAsset(BLOG_WIND_EMBLEM_CANDIDATES),
    findAvailableAsset(BLOG_PARCHMENT_TEXTURE_CANDIDATES),
    findAvailableAsset(BLOG_WOOD_GRAIN_CANDIDATES),
    findAvailableAsset(BLOG_RUINS_OVERLAY_CANDIDATES),
    findAvailableAsset(BLOG_CORNER_ORNAMENT_CANDIDATES),
    findAvailableAsset(BLOG_DIVIDER_SEAL_CANDIDATES)
  ]);

  root.classList.toggle('has-blog-story-image', Boolean(backgroundAsset));
  if (backgroundAsset) {
    root.style.setProperty('--blog-story-image', `url("${backgroundAsset}")`);
  } else {
    root.style.removeProperty('--blog-story-image');
  }

  applyOptionalBlogAsset(root, {
    className: 'has-blog-glass-noise',
    cssVariable: '--blog-glass-noise',
    assetUrl: glassNoiseAsset
  });
  applyOptionalBlogAsset(root, {
    className: 'has-blog-wind-emblem',
    cssVariable: '--blog-wind-emblem',
    assetUrl: windEmblemAsset
  });
  applyOptionalBlogAsset(root, {
    className: 'has-blog-paper-texture',
    cssVariable: '--blog-paper-texture',
    assetUrl: parchmentTextureAsset
  });
  applyOptionalBlogAsset(root, {
    className: 'has-blog-wood-grain',
    cssVariable: '--blog-wood-grain',
    assetUrl: woodGrainAsset
  });
  applyOptionalBlogAsset(root, {
    className: 'has-blog-ruins-overlay',
    cssVariable: '--blog-ruins-overlay',
    assetUrl: ruinsOverlayAsset
  });
  applyOptionalBlogAsset(root, {
    className: 'has-blog-corner-ornament',
    cssVariable: '--blog-corner-ornament',
    assetUrl: cornerOrnamentAsset
  });
  applyOptionalBlogAsset(root, {
    className: 'has-blog-divider-seal',
    cssVariable: '--blog-divider-seal',
    assetUrl: dividerSealAsset
  });
}

function clearBlogReplayRefreshTimers() {
  blogReplayRefreshTimers.forEach((timerId) => window.clearTimeout(timerId));
  blogReplayRefreshTimers = [];
}

function setBlogReplayDelays() {
  document.querySelectorAll('[data-blog-replay="panel"]').forEach((target, index) => {
    target.style.setProperty('--reveal-delay', `${Math.min(index * 68, 204)}ms`);
  });

  document.querySelectorAll('[data-blog-replay="post-card"]').forEach((target, index) => {
    target.style.setProperty('--reveal-delay', `${Math.min(index * 52, 312)}ms`);
  });
}

function shouldActivateReplayTarget(target) {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const rect = target.getBoundingClientRect();
  const replayType = target.dataset.blogReplay || 'panel';
  const focusTop = replayType === 'post-card' ? viewportHeight * 0.08 : viewportHeight * 0.12;
  const focusBottom = replayType === 'post-card' ? viewportHeight * 0.94 : viewportHeight * 0.88;
  const visibleHeight = Math.min(rect.bottom, focusBottom) - Math.max(rect.top, focusTop);

  if (visibleHeight <= 0) {
    return false;
  }

  const minimumVisible = replayType === 'post-card'
    ? Math.max(26, Math.min(rect.height * 0.34, viewportHeight * 0.16))
    : Math.max(36, Math.min(rect.height * 0.22, viewportHeight * 0.22));

  return visibleHeight >= minimumVisible;
}

function refreshBlogReplayAnimations(options = {}) {
  triggerBlogReplayRefresh(options);
}

function scheduleBlogReplayRefresh() {
  clearBlogReplayRefreshTimers();
  refreshBlogReplayAnimations({ immediate: true });

  window.requestAnimationFrame(() => {
    refreshBlogReplayAnimations({ immediate: true });
  });

  [180, 360, 560].forEach((delay) => {
    const timerId = window.setTimeout(() => {
      refreshBlogReplayAnimations({ immediate: true });
    }, delay);
    blogReplayRefreshTimers.push(timerId);
  });
}

function getBlogPanelVisibilityScore(section) {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const rect = section.getBoundingClientRect();
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));

  if (visibleHeight <= 0) {
    return -1;
  }

  const visibleRatio = visibleHeight / Math.min(Math.max(rect.height, 1), viewportHeight);
  const centerOffset = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;

  return visibleRatio - centerOffset * 0.14;
}

function setupBlogPanelTransitions() {
  const sections = [...document.querySelectorAll('.blog-panel-section')];
  if (!sections.length) {
    return;
  }

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeSection = null;
  let rafId = null;

  const applySectionState = (nextSection) => {
    if (!nextSection || activeSection === nextSection) {
      return;
    }

    if (activeSection?.dataset.blogPanel === 'hero' && activeSection !== nextSection) {
      cancelBlogHeroTyping();
    }

    sections.forEach((section) => {
      const isActive = section === nextSection;
      section.classList.toggle('is-active', isActive);
      if (!isActive) {
        section.classList.remove('is-panel-visible');
      }
    });

    activeSection = nextSection;
    root.dataset.blogActivePanel = nextSection.dataset.blogPanel || 'hero';

    const finalizeActivation = () => {
      if (activeSection !== nextSection) {
        return;
      }

      nextSection.classList.add('is-panel-visible');
      refreshBlogReplayAnimations({ immediate: true });

      if (nextSection.dataset.blogPanel === 'hero') {
        playBlogHeroTyping({ waitForReady: !hasPrimedBlogHeroTyping });
      }

      if (nextSection.dataset.blogPanel === 'map') {
        renderBlogMapHeadingInstant();
      }
    };

    if (reduceMotion) {
      finalizeActivation();
      return;
    }

    window.requestAnimationFrame(finalizeActivation);
  };

  const updateActiveSection = () => {
    rafId = null;

    const nextSection = sections.reduce((bestSection, section) => {
      if (!bestSection) {
        return section;
      }

      return getBlogPanelVisibilityScore(section) > getBlogPanelVisibilityScore(bestSection) ? section : bestSection;
    }, null);

    applySectionState(nextSection);
  };

  const requestUpdate = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(updateActiveSection);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('orientationchange', requestUpdate);
  requestUpdate();
}

function scrollToInitialBlogPanel() {
  const panelName = state.activeTagPath.length ? 'journal' : state.initialExpandedPath.length ? 'map' : '';
  if (!panelName) {
    return;
  }

  const section = document.querySelector(`.blog-panel-section[data-blog-panel="${panelName}"]`);
  if (!section) {
    return;
  }

  section.scrollIntoView({
    behavior: 'auto',
    block: 'start'
  });
}

function setupBlogReplayAnimations() {
  if (typeof cleanupBlogReplayAnimations === 'function') {
    cleanupBlogReplayAnimations();
    cleanupBlogReplayAnimations = null;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId = null;
  let targets = [];
  const archiveTree = document.getElementById('archiveTree');
  const blogLayout = document.querySelector('.blog-layout');
  const postsPanel = document.getElementById('postsPanel');
  const postsScrollShell = document.getElementById('postsScrollShell');
  const postsGrid = document.getElementById('postsGrid');
  const observedElements = [archiveTree, blogLayout, postsPanel, postsScrollShell, postsGrid].filter(Boolean);
  const scrollContainers = [archiveTree, postsScrollShell].filter(Boolean);
  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => refreshBlogReplayAnimations())
    : null;

  const collectTargets = () => {
    targets = [...document.querySelectorAll('[data-blog-replay]')];
    setBlogReplayDelays();
  };

  const evaluateTargets = () => {
    rafId = null;
    collectTargets();

    if (reduceMotion) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    targets.forEach((target) => {
      target.classList.toggle('is-visible', shouldActivateReplayTarget(target));
    });
  };

  triggerBlogReplayRefresh = ({ immediate = false } = {}) => {
    if (reduceMotion) {
      evaluateTargets();
      return;
    }

    if (immediate) {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      evaluateTargets();
      return;
    }

    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(evaluateTargets);
  };

  const onLayoutTransitionEnd = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('.archive-branch, .blog-layout, #postsPanel')) {
      refreshBlogReplayAnimations({ immediate: true });
    }
  };

  observedElements.forEach((element) => {
    resizeObserver?.observe(element);
    element.addEventListener('transitionend', onLayoutTransitionEnd);
  });

  refreshBlogReplayAnimations({ immediate: true });
  window.addEventListener('scroll', refreshBlogReplayAnimations, { passive: true });
  window.addEventListener('resize', refreshBlogReplayAnimations);
  window.addEventListener('orientationchange', refreshBlogReplayAnimations);
  window.addEventListener('load', refreshBlogReplayAnimations, { once: true });
  scrollContainers.forEach((element) => {
    element.addEventListener('scroll', refreshBlogReplayAnimations, { passive: true });
  });

  cleanupBlogReplayAnimations = () => {
    clearBlogReplayRefreshTimers();
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }

    triggerBlogReplayRefresh = () => {};
    resizeObserver?.disconnect();
    observedElements.forEach((element) => {
      element.removeEventListener('transitionend', onLayoutTransitionEnd);
    });

    window.removeEventListener('scroll', refreshBlogReplayAnimations);
    window.removeEventListener('resize', refreshBlogReplayAnimations);
    window.removeEventListener('orientationchange', refreshBlogReplayAnimations);
    window.removeEventListener('load', refreshBlogReplayAnimations);
    scrollContainers.forEach((element) => {
      element.removeEventListener('scroll', refreshBlogReplayAnimations);
    });
  };
}

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
  scheduleBlogReplayRefresh();
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
    copy.textContent = SITE_COPY.blogProfileCopy || SITE_COPY.siteSubtitle;
  }

  container.innerHTML = PROFILE_LINKS.map((link) => `
    <a class="profile-link-icon" href="${link.href}" target="_blank" rel="noreferrer noopener" aria-label="${link.label}" title="${link.label}">
      ${LINK_ICONS[link.key] || icons.compass}
    </a>
  `).join('');
}

function renderHero() {
  const heroQuillImage = document.getElementById('blogHeroQuillImage');

  renderBlogHeroTitleInstant();

  if (heroQuillImage instanceof HTMLImageElement) {
    const assetUrl = withBase('/羽毛笔.png');
    heroQuillImage.onload = () => {
      heroQuillImage.closest('.blog-hero-quill-media')?.classList.remove('is-missing');
    };
    heroQuillImage.onerror = () => {
      heroQuillImage.closest('.blog-hero-quill-media')?.classList.add('is-missing');
    };
    if (heroQuillImage.src !== assetUrl) {
      heroQuillImage.src = assetUrl;
    }
    heroQuillImage.closest('.blog-hero-quill-media')?.classList.toggle('is-missing', !heroQuillImage.complete || heroQuillImage.naturalWidth === 0);
  }
}

function renderMapHeading() {
  renderBlogMapHeadingInstant();
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
  scheduleBlogReplayRefresh();
}


function getPostsHoverController() {
  return state.postsHover;
}

function getPostsHoverSettings() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    reduceMotion,
    scaleMax: reduceMotion ? 1.05 : 1.1,
    liftY: 0,
    timeConstantMs: reduceMotion ? 240 : 320
  };
}

function getPostsHoverSlotFromTarget(target) {
  return target instanceof Element ? target.closest('.post-card-slot') : null;
}

function applyPostsHoverProgressStyles(slot, progress) {
  const card = slot.querySelector('.post-card');
  if (!card) {
    return;
  }

  const settings = getPostsHoverSettings();
  const controller = getPostsHoverController();

  const hoverScale = 1 + progress * (settings.scaleMax - 1);
  const coverScale = 1 + progress * 0.035;

  slot.style.setProperty('--post-hover-progress', progress.toFixed(4));
  slot.style.setProperty('--post-hover-scale', hoverScale.toFixed(4));
  slot.style.setProperty('--post-cover-scale', coverScale.toFixed(4));
  slot.style.setProperty('--post-slot-pad-top', '0px');
  slot.style.setProperty('--post-slot-pad-bottom', '0px');
  slot.classList.toggle('is-hover-active', progress > 0.001);
  slot.style.zIndex = progress > 0.001 ? '4' : '1';

  if (controller.shell) {
    controller.shell.style.setProperty('--post-hover-scale-delta', `${(settings.scaleMax - 1).toFixed(4)}`);
    controller.shell.style.setProperty('--post-hover-lift-max', `${settings.liftY}px`);
  }
}

function applyPostsHoverSlotOffsets(controller) {
  if (!controller.slots.length) {
    return;
  }

  const settings = getPostsHoverSettings();
  const halfShifts = controller.slots.map((slot) => {
    const progress = slot.__hoverProgress || 0;
    if (progress <= 0.0005) {
      return 0;
    }

    const baseHeight = slot.__baseHeight || Math.max(slot.querySelector('.post-card')?.offsetHeight || 0, 1);
    const scaledExtra = baseHeight * (settings.scaleMax - 1) * progress;
    return scaledExtra / 2;
  });
  const totalShift = halfShifts.reduce((sum, shift) => sum + shift, 0);
  let prefixShift = 0;

  controller.slots.forEach((slot, index) => {
    const currentShift = halfShifts[index];
    const shiftY = prefixShift - (totalShift - prefixShift - currentShift);
    slot.style.setProperty('--post-slot-shift-y', `${shiftY.toFixed(2)}px`);
    prefixShift += currentShift;
  });
}

function refreshPostsHoverSlots() {
  const controller = getPostsHoverController();
  controller.shell = document.getElementById('postsScrollShell');
  controller.grid = document.getElementById('postsGrid');
  controller.slots = Array.from(controller.grid?.querySelectorAll('.post-card-slot') || []);

  const currentSlots = new Set(controller.slots);
  if (controller.focusSlot && !currentSlots.has(controller.focusSlot)) {
    controller.focusSlot = null;
  }

  controller.slots.forEach((slot, index) => {
    const card = slot.querySelector('.post-card');
    slot.dataset.postIndex = String(index);
    slot.__hoverProgress = typeof slot.__hoverProgress === 'number' ? slot.__hoverProgress : 0;
    slot.__hoverTarget = typeof slot.__hoverTarget === 'number' ? slot.__hoverTarget : 0;
    slot.__baseHeight = Math.max(card?.offsetHeight || 0, 1);
    applyPostsHoverProgressStyles(slot, slot.__hoverProgress);
  });
  applyPostsHoverSlotOffsets(controller);

  if (!controller.slots.length) {
    controller.lastPointer = null;
    controller.focusSlot = null;
  }
}

function resolvePostsHoverTargetSlot(controller) {
  if (controller.focusSlot && controller.grid?.contains(controller.focusSlot)) {
    return controller.focusSlot;
  }

  if (!controller.lastPointer || !controller.grid) {
    return null;
  }

  const element = document.elementFromPoint(controller.lastPointer.x, controller.lastPointer.y);
  const slot = getPostsHoverSlotFromTarget(element);
  return slot && controller.grid.contains(slot) ? slot : null;
}

function updatePostsHoverFrame(timestamp = 0) {
  const controller = getPostsHoverController();
  controller.rafId = 0;

  if (controller.needsMeasure) {
    refreshPostsHoverSlots();
    controller.needsMeasure = false;
  }

  const settings = getPostsHoverSettings();
  if (controller.shell) {
    controller.shell.style.setProperty('--post-hover-scale-delta', `${(settings.scaleMax - 1).toFixed(4)}`);
    controller.shell.style.setProperty('--post-hover-lift-max', `${settings.liftY}px`);
  }

  const mouseEnabled = Boolean(controller.mediaQuery?.matches && controller.shell && controller.grid && controller.slots.length);
  const targetSlot = mouseEnabled ? resolvePostsHoverTargetSlot(controller) : (controller.focusSlot && controller.grid?.contains(controller.focusSlot) ? controller.focusSlot : null);
  const deltaMs = controller.lastFrameTime ? Math.min(48, Math.max(10, timestamp - controller.lastFrameTime)) : 16.67;
  const lerpFactor = 1 - Math.exp(-deltaMs / settings.timeConstantMs);
  let hasActiveMotion = false;

  controller.slots.forEach((slot) => {
    const target = slot === targetSlot ? 1 : 0;
    const current = slot.__hoverProgress || 0;
    let next = current + (target - current) * lerpFactor;

    if (Math.abs(target - next) < 0.002) {
      next = target;
    }

    slot.__hoverTarget = target;
    slot.__hoverProgress = next;
    applyPostsHoverProgressStyles(slot, next);

    if (next !== target) {
      hasActiveMotion = true;
    }
  });
  applyPostsHoverSlotOffsets(controller);

  controller.lastFrameTime = controller.slots.length && (hasActiveMotion || targetSlot) ? timestamp : 0;
  controller.dirty = false;

  if (controller.needsMeasure || controller.dirty || hasActiveMotion) {
    schedulePostsHoverUpdate();
  }
}

function schedulePostsHoverUpdate(options = {}) {
  const controller = getPostsHoverController();
  if (options.measure) {
    controller.needsMeasure = true;
  }

  controller.dirty = true;

  if (!controller.rafId) {
    controller.rafId = window.requestAnimationFrame(updatePostsHoverFrame);
  }
}

function setupPostsHoverController() {
  const controller = getPostsHoverController();
  controller.shell = document.getElementById('postsScrollShell');
  controller.grid = document.getElementById('postsGrid');

  if (!controller.shell) {
    return;
  }

  if (!controller.mediaQuery) {
    controller.mediaQuery = window.matchMedia(POSTS_HOVER_MEDIA_QUERY);
  }

  if (!controller.isBound) {
    controller.handlePointerMove = (event) => {
      if (!controller.mediaQuery?.matches) {
        return;
      }

      controller.lastPointer = { x: event.clientX, y: event.clientY };
      schedulePostsHoverUpdate();
    };

    controller.handlePointerLeave = () => {
      controller.lastPointer = null;
      schedulePostsHoverUpdate();
    };

    controller.handleScroll = () => {
      if (!controller.lastPointer && !controller.focusSlot) {
        return;
      }

      schedulePostsHoverUpdate();
    };

    controller.handleFocusIn = (event) => {
      const slot = getPostsHoverSlotFromTarget(event.target);
      controller.focusSlot = slot && controller.grid?.contains(slot) ? slot : null;
      schedulePostsHoverUpdate();
    };

    controller.handleFocusOut = () => {
      const slot = getPostsHoverSlotFromTarget(document.activeElement);
      controller.focusSlot = slot && controller.grid?.contains(slot) ? slot : null;
      schedulePostsHoverUpdate();
    };

    controller.handleResize = () => {
      schedulePostsHoverUpdate({ measure: true });
    };

    controller.handleMediaChange = () => {
      controller.lastPointer = null;
      schedulePostsHoverUpdate({ measure: true });
    };

    controller.shell.addEventListener('pointermove', controller.handlePointerMove, { passive: true });
    controller.shell.addEventListener('pointerleave', controller.handlePointerLeave, { passive: true });
    controller.shell.addEventListener('scroll', controller.handleScroll, { passive: true });
    controller.shell.addEventListener('focusin', controller.handleFocusIn);
    controller.shell.addEventListener('focusout', controller.handleFocusOut);
    window.addEventListener('resize', controller.handleResize, { passive: true });

    if (typeof controller.mediaQuery.addEventListener === 'function') {
      controller.mediaQuery.addEventListener('change', controller.handleMediaChange);
    } else if (typeof controller.mediaQuery.addListener === 'function') {
      controller.mediaQuery.addListener(controller.handleMediaChange);
    }

    controller.isBound = true;
  }

  schedulePostsHoverUpdate({ measure: true });
}

async function renderPosts(posts = [], renderToken = 0) {
  const container = document.getElementById('postsGrid');
  const description = document.getElementById('postSectionDesc');
  description.textContent = '按时间倒序展示文章。';

  if (!posts.length) {
    container.innerHTML = '<div class="empty-card">这个筛选结果下暂时还没有文章。</div>';
    setupPostsHoverController();
    schedulePostsHoverUpdate({ measure: true });
    return;
  }

  container.innerHTML = posts.map((post, index) => `
    <div class="post-card-slot" data-post-slot data-post-id="${post.id}" data-post-index="${index}">
      <a class="post-card post-card--text-only" data-reveal data-blog-replay="post-card" href="${getPostUrl(post.id)}" data-post-id="${post.id}" aria-label="打开文章：${post.title}">
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
    </div>
  `).join('');

  setupPostsHoverController();
  schedulePostsHoverUpdate({ measure: true });
  await hydratePostCovers(posts, renderToken);
  schedulePostsHoverUpdate({ measure: true });
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
  const clearButton = document.getElementById('clearTagFilter');
  const isActive = state.activeTagPath.length > 0;

  if (!clearButton) {
    return;
  }

  clearButton.hidden = false;
  clearButton.classList.toggle('is-visible', isActive);
  clearButton.disabled = !isActive;
  clearButton.setAttribute('aria-hidden', String(!isActive));
  clearButton.setAttribute('aria-disabled', String(!isActive));
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
      refreshBlogReplayAnimations({ immediate: true });
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
        refreshBlogReplayAnimations({ immediate: true });
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

  if (renderToken === state.postsRenderToken) {
    schedulePostsHoverUpdate({ measure: true });
    refreshBlogReplayAnimations({ immediate: true });
  }
}

function renderPage() {
  renderHero();
  renderMapHeading();
  renderArchiveTree(state.config.categoryTree);
  renderHeatmap(state.flatCategoryNodes);
  renderPostsPanel();
}

async function init() {
  document.documentElement.classList.add('is-blog-page');
  document.documentElement.dataset.blogActivePanel = 'hero';
  initThemeToggles();
  void setupBlogBackground();
  renderSidebarLinks();
  setupProfileAvatar();

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
    setupPostsHoverController();
    scrollToInitialBlogPanel();
    setupBlogPanelTransitions();
    setupBlogReplayAnimations();
  } catch (error) {
    console.error(error);
    document.getElementById('blogRoot').innerHTML = '<div class="inline-error">博客配置读取失败，请检查 `Blog/config.json` 是否可访问。</div>';
  }
}

init();
