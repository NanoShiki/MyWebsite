import '../styles/base.css';
import '../styles/home.css';
import heroImage from '../../6F5DB79D-3B66-42A3-A95A-7E7E18630933_1_105_c.jpeg';
import { initBusuanzi } from './shared/busuanzi.js';
import { icons } from './shared/icons.js';
import { setupRevealAnimations } from './shared/motion.js';
import { HOME_DESTINATIONS, SITE_COPY, SITE_START_DATE } from './shared/site-meta.js';
import { initThemeToggles } from './shared/theme.js';
import { fetchBlogConfig, formatRuntime, flattenCategoryNodes, withBase } from './shared/site-data.js';

const DESTINATION_ICONS = {
  blog: icons.blog,
  github: icons.github,
  bilibili: icons.bilibili,
  zhihu: icons.zhihu
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

  layer.style.backgroundImage = `url("${heroImage}")`;
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
      <a class="nav-card" href="${href}" ${target ? `target="${target}"` : ''} ${rel ? `rel="${rel}"` : ''} data-reveal aria-label="前往 ${item.label}">
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

function getSectionVisibilityScore(section) {
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

function setupHomePanelTransitions() {
  const sections = [...document.querySelectorAll('.home-panel-section')];
  if (!sections.length) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeSection = null;
  let rafId = null;

  const applySectionState = (nextSection) => {
    if (!nextSection || activeSection === nextSection) {
      return;
    }

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

    const nextSection = sections.reduce((bestSection, section) => {
      if (!bestSection) {
        return section;
      }

      return getSectionVisibilityScore(section) > getSectionVisibilityScore(bestSection) ? section : bestSection;
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

async function hydrateHome() {
  document.documentElement.classList.add('is-home-page');

  setupBackground();
  setupOverlayProgress();
  initThemeToggles();
  initBusuanzi();

  renderDestinations();
  setupRevealAnimations();
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
