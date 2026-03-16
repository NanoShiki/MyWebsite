import '../styles/base.css';
import '../styles/home.css';
import { initBusuanzi } from './shared/busuanzi.js';
import { icons } from './shared/icons.js';
import { IMAGE_SLOTS, pickDailyImageForSlot } from './shared/image-pool.js';
import { HOME_DESTINATIONS, SITE_COPY, SITE_START_DATE } from './shared/site-meta.js';
import { initThemeToggles } from './shared/theme.js';
import { fetchBlogConfig, formatRuntime, flattenCategoryNodes, withBase } from './shared/site-data.js';

const DESTINATION_ICONS = {
  blog: icons.blog,
  github: icons.github,
  bilibili: icons.bilibili,
  zhihu: icons.zhihu
};

const homeSceneAssets = {
  camp: {
    day: '',
    night: '',
    fallback: ''
  },
  trail: ''
};

let heroTypingRunId = 0;
let hasPrimedHeroTyping = false;

function delay(ms = 0) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function setupBackground() {
  const layer = document.querySelector('[data-bg-layer="0"]');
  if (!layer) {
    return;
  }

  const heroAsset = pickDailyImageForSlot(IMAGE_SLOTS.homePageBackground);
  if (heroAsset) {
    layer.style.backgroundImage = `url("${heroAsset}")`;
  } else {
    layer.style.removeProperty('background-image');
  }
}

function getCurrentTheme() {
  return document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
}

function applySceneAsset(root, key, assetUrl) {
  if (!root || !key || !assetUrl) {
    return;
  }

  root.classList.add(`has-${key}-scene`);
  root.style.setProperty(`--${key}-scene-image`, `url("${assetUrl}")`);
}

function clearSceneAsset(root, key) {
  if (!root || !key) {
    return;
  }

  root.classList.remove(`has-${key}-scene`);
  root.style.removeProperty(`--${key}-scene-image`);
}

function syncCampSceneAsset(root = document.documentElement) {
  const preferredTheme = getCurrentTheme();
  const preferredScene = preferredTheme === 'night'
    ? homeSceneAssets.camp.night || homeSceneAssets.camp.day || homeSceneAssets.camp.fallback
    : homeSceneAssets.camp.day || homeSceneAssets.camp.night || homeSceneAssets.camp.fallback;

  if (preferredScene) {
    applySceneAsset(root, 'camp', preferredScene);
    return;
  }

  clearSceneAsset(root, 'camp');
}

function setupOptionalSceneAssets() {
  const root = document.documentElement;
  const campDayScene = pickDailyImageForSlot(IMAGE_SLOTS.homePageCampDay);
  const campNightScene = pickDailyImageForSlot(IMAGE_SLOTS.homePageCampNight);
  const trailScene = pickDailyImageForSlot(IMAGE_SLOTS.homePageTrail);
  const campFallbackScene = campDayScene || campNightScene;

  homeSceneAssets.camp.day = campDayScene;
  homeSceneAssets.camp.night = campNightScene;
  homeSceneAssets.camp.fallback = campFallbackScene;
  homeSceneAssets.trail = trailScene;

  syncCampSceneAsset(root);

  if (trailScene) {
    applySceneAsset(root, 'trail', trailScene);
  } else {
    clearSceneAsset(root, 'trail');
  }

  window.addEventListener('site-theme-change', () => {
    syncCampSceneAsset(root);
  });
}

function setupOverlayProgress() {
  const root = document.documentElement;
  const target = document.getElementById('homeNavigation');
  if (!target) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;

  const update = () => {
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const maxDistance = Math.max(1, targetTop - window.innerHeight * 0.8);
    const progress = Math.max(0, Math.min(window.scrollY / maxDistance, 1));
    root.style.setProperty('--home-overlay-progress', progress.toFixed(4));
    ticking = false;
  };

  const requestUpdate = () => {
    if (reduceMotion) {
      update();
      return;
    }
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
}

function renderDestinations() {
  const container = document.getElementById('homeDestinations');
  container.innerHTML = HOME_DESTINATIONS.map((item) => {
    const href = item.href.startsWith('http') ? item.href : withBase(item.href);
    const rel = item.href.startsWith('http') ? 'noreferrer noopener' : '';
    const target = item.href.startsWith('http') ? '_blank' : '';
    return `
      <a class="nav-card nav-card--${item.key}" href="${href}" ${target ? `target="${target}"` : ''} ${rel ? `rel="${rel}"` : ''} aria-label="前往 ${item.label}">
        <div class="nav-card-head">
          <span class="card-icon">${DESTINATION_ICONS[item.key] || icons.compass}</span>
          <span class="nav-card-label">${item.label}</span>
          <span class="nav-card-arrow">${icons.arrowRight}</span>
        </div>
      </a>
    `;
  }).join('');
}

function renderStats(config) {
  document.getElementById('runtimeCount').textContent = formatRuntime(SITE_START_DATE);
  document.getElementById('articleCount').textContent = `${config.posts.length} 篇`;
  document.getElementById('categoryCount').textContent = `${flattenCategoryNodes(config.categoryTree).length} 个`;
}

function waitForDomReady() {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
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
    console.error('home-fonts-soft-wait-failed', error);
  }
}

async function waitForTypingReady() {
  await waitForDomReady();
  await delay(90);
  await waitForFontsSoft(160);
}

async function typeLine(target, text, options = {}) {
  const { charDelay = 110, endDelay = 0, isCancelled = null } = options;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!target) {
    return;
  }

  target.textContent = '';

  if (reduceMotion) {
    target.textContent = text;
    target.classList.remove('is-typing');
    return;
  }

  target.classList.add('is-typing');

  for (const character of text) {
    if (typeof isCancelled === 'function' && isCancelled()) {
      target.classList.remove('is-typing');
      return false;
    }

    target.textContent += character;
    await delay(charDelay);
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

function getHeroTypingNodes() {
  const title = document.getElementById('homeHeroTitle');
  const titleTop = document.getElementById('homeHeroTitleTop');
  const titleBottom = document.getElementById('homeHeroTitleBottom');

  return { title, titleTop, titleBottom };
}

function cancelHeroTyping() {
  heroTypingRunId += 1;
  const { titleTop, titleBottom } = getHeroTypingNodes();

  titleTop?.classList.remove('is-typing');
  titleBottom?.classList.remove('is-typing');
}

function renderHeroTitleInstant() {
  const { title, titleTop, titleBottom } = getHeroTypingNodes();

  if (!title || !titleTop || !titleBottom) {
    return;
  }

  title.setAttribute('aria-label', `${SITE_COPY.homeHeroTitleTop} ${SITE_COPY.homeHeroTitleBottom}`);
  titleTop.textContent = SITE_COPY.homeHeroTitleTop;
  titleBottom.textContent = SITE_COPY.homeHeroTitleBottom;
  titleTop.classList.remove('is-typing');
  titleBottom.classList.remove('is-typing');
}

async function playHeroTyping(options = {}) {
  const { waitForReady = false } = options;
  const { title, titleTop, titleBottom } = getHeroTypingNodes();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const runId = ++heroTypingRunId;

  if (!title || !titleTop || !titleBottom) {
    return;
  }

  title.setAttribute('aria-label', `${SITE_COPY.homeHeroTitleTop} ${SITE_COPY.homeHeroTitleBottom}`);
  titleTop.textContent = '';
  titleBottom.textContent = '';

  if (waitForReady) {
    await waitForTypingReady();
    hasPrimedHeroTyping = true;
  } else {
    await delay(120);
  }

  if (runId !== heroTypingRunId) {
    return;
  }

  if (reduceMotion) {
    renderHeroTitleInstant();
    return;
  }

  const isCancelled = () => runId !== heroTypingRunId;

  const didTypeTop = await typeLine(titleTop, SITE_COPY.homeHeroTitleTop, {
    charDelay: 102,
    endDelay: 260,
    isCancelled
  });

  if (!didTypeTop || isCancelled()) {
    titleTop.classList.remove('is-typing');
    return;
  }

  titleTop.classList.remove('is-typing');

  const didTypeBottom = await typeLine(titleBottom, SITE_COPY.homeHeroTitleBottom, {
    charDelay: 90,
    endDelay: 220,
    isCancelled
  });

  if (!didTypeBottom || isCancelled()) {
    titleBottom.classList.remove('is-typing');
    return;
  }

  titleBottom.classList.remove('is-typing');
}

function getSectionMetrics(section, viewportHeight) {
  const rect = section.getBoundingClientRect();
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));

  const visibleRatio = visibleHeight > 0
    ? visibleHeight / Math.min(Math.max(rect.height, 1), viewportHeight)
    : 0;
  const centerOffset = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
  const score = visibleHeight <= 0 ? -1 : visibleRatio - centerOffset * 0.14;

  return {
    section,
    panel: section.dataset.homePanel || 'hero',
    visibleHeight,
    visibleRatio,
    centerOffset,
    score
  };
}

function setupHomePanelTransitions() {
  const sections = [...document.querySelectorAll('.home-panel-section')];
  if (!sections.length) {
    return;
  }

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SWITCH_SCORE_DELTA = 0.06;
  const DIRECT_SWITCH_VISIBLE_RATIO = 0.55;
  const HERO_MIN_VISIBLE_RATIO = 0.42;
  const HERO_TOP_GUARD_PX = 80;
  const SCENE_HOLD_MS = reduceMotion ? 0 : 280;
  let activeSection = null;
  let rafId = null;
  let sceneHoldTimerId = 0;

  const isScenePanel = (panel = '') => panel === 'camp' || panel === 'trail';
  const setActiveScene = (scene = '') => {
    if (scene) {
      root.dataset.homeActiveScene = scene;
      return;
    }
    delete root.dataset.homeActiveScene;
  };
  const setSceneHold = (scene = '') => {
    if (scene) {
      root.dataset.homeSceneHold = scene;
      return;
    }
    delete root.dataset.homeSceneHold;
  };
  const clearSceneHoldTimer = () => {
    if (!sceneHoldTimerId) {
      return;
    }

    window.clearTimeout(sceneHoldTimerId);
    sceneHoldTimerId = 0;
  };
  const syncSceneState = (prevPanel, nextPanel) => {
    clearSceneHoldTimer();

    if (!isScenePanel(nextPanel)) {
      setActiveScene('');
      setSceneHold('');
      return;
    }

    if (isScenePanel(prevPanel) && prevPanel !== nextPanel && SCENE_HOLD_MS > 0) {
      setSceneHold(prevPanel);
      setActiveScene(nextPanel);
      sceneHoldTimerId = window.setTimeout(() => {
        sceneHoldTimerId = 0;
        setSceneHold('');
      }, SCENE_HOLD_MS);
      return;
    }

    setSceneHold('');
    setActiveScene(nextPanel);
  };

  const applySectionState = (nextSection) => {
    if (!nextSection || activeSection === nextSection) {
      return;
    }

    const prevPanel = activeSection?.dataset.homePanel || '';
    const nextPanel = nextSection.dataset.homePanel || 'hero';

    if (activeSection?.dataset.homePanel === 'hero' && activeSection !== nextSection) {
      cancelHeroTyping();
    }


    sections.forEach((section) => {
      const isActive = section === nextSection;
      section.classList.toggle('is-active', isActive);
      if (!isActive) {
        section.classList.remove('is-panel-visible');
      }
    });

    activeSection = nextSection;
    root.dataset.homeActivePanel = nextPanel;
    syncSceneState(prevPanel, nextPanel);

    const finalizeActivation = () => {
      if (activeSection !== nextSection) {
        return;
      }

      nextSection.classList.add('is-panel-visible');

      if (nextSection.dataset.homePanel === 'hero') {
        playHeroTyping({ waitForReady: !hasPrimedHeroTyping });
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
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const metrics = sections.map((section) => getSectionMetrics(section, viewportHeight));
    const metricBySection = new Map(metrics.map((metric) => [metric.section, metric]));
    const bestMetric = metrics.reduce((best, metric) => {
      if (!best) {
        return metric;
      }
      return metric.score > best.score ? metric : best;
    }, null);

    if (!bestMetric) {
      return;
    }

    let nextMetric = bestMetric;
    const activeMetric = activeSection ? metricBySection.get(activeSection) || null : null;

    if (activeMetric && nextMetric.section !== activeSection) {
      const scoreDelta = nextMetric.score - activeMetric.score;
      const canDirectSwitch = nextMetric.visibleRatio >= DIRECT_SWITCH_VISIBLE_RATIO;

      if (!canDirectSwitch && scoreDelta < SWITCH_SCORE_DELTA) {
        nextMetric = activeMetric;
      }
    }

    if (
      activeMetric &&
      activeMetric.panel !== 'hero' &&
      nextMetric.panel === 'hero'
    ) {
      const canHeroTakeover = nextMetric.visibleRatio >= HERO_MIN_VISIBLE_RATIO || window.scrollY <= HERO_TOP_GUARD_PX;

      if (!canHeroTakeover) {
        nextMetric = activeMetric;
      }
    }

    applySectionState(nextMetric.section);
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
  window.addEventListener('pagehide', clearSceneHoldTimer, { once: true });
  requestUpdate();
}

async function hydrateHome() {
  document.documentElement.classList.add('is-home-page');
  document.documentElement.dataset.homeActivePanel = 'hero';
  delete document.documentElement.dataset.homeActiveScene;
  delete document.documentElement.dataset.homeSceneHold;

  setupBackground();
  setupOptionalSceneAssets();
  setupOverlayProgress();
  initThemeToggles();
  initBusuanzi();

  renderDestinations();
  setupHomePanelTransitions();

  try {
    const config = await fetchBlogConfig();
    renderStats(config);
  } catch (error) {
    console.error(error);
    document.getElementById('articleCount').textContent = '--';
    document.getElementById('categoryCount').textContent = '--';
  }
}

hydrateHome();
