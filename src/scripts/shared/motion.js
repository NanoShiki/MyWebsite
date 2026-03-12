let cleanupRevealAnimations = null;

function getRevealDelay(target) {
  const siblings = [...(target.parentElement?.children || [])].filter((item) => item.hasAttribute('data-reveal'));
  const index = siblings.indexOf(target);

  if (index < 0) {
    return 0;
  }

  return Math.min(index * 42, 168);
}

function shouldRevealTarget(target) {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const rect = target.getBoundingClientRect();
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

  return rect.top <= viewportHeight * 0.75 || visibleHeight >= viewportHeight * 0.25;
}

export function setupRevealAnimations() {
  if (typeof cleanupRevealAnimations === 'function') {
    cleanupRevealAnimations();
    cleanupRevealAnimations = null;
  }

  const revealTargets = [...document.querySelectorAll('[data-reveal]')];
  if (!revealTargets.length) {
    return;
  }

  revealTargets.forEach((item) => {
    item.style.setProperty('--reveal-delay', `${getRevealDelay(item)}ms`);
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    revealTargets.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const revealNow = () => {
    revealTargets.forEach((target) => {
      if (!target.classList.contains('is-visible') && shouldRevealTarget(target)) {
        target.classList.add('is-visible');
      }
    });
  };

  revealNow();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || shouldRevealTarget(entry.target)) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: '0px 0px 25% 0px' }
  );

  revealTargets.forEach((item) => {
    if (!item.classList.contains('is-visible')) {
      observer.observe(item);
    }
  });

  const onViewportChange = () => revealNow();
  window.addEventListener('resize', onViewportChange, { passive: true });
  window.addEventListener('orientationchange', onViewportChange);
  window.addEventListener('load', onViewportChange, { once: true });

  cleanupRevealAnimations = () => {
    observer.disconnect();
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('orientationchange', onViewportChange);
    window.removeEventListener('load', onViewportChange);
  };
}

export function setupParallax(containerSelector, layerSelector) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    return;
  }

  const container = document.querySelector(containerSelector);
  const layers = [...document.querySelectorAll(layerSelector)];
  if (!container || !layers.length) {
    return;
  }

  let frameId = null;
  const state = { x: 0, y: 0 };

  const update = () => {
    layers.forEach((layer, index) => {
      const depth = Number(layer.dataset.depth || index + 1);
      const translateX = state.x * depth * 0.4;
      const translateY = state.y * depth * 0.4;
      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
    frameId = null;
  };

  container.addEventListener('pointermove', (event) => {
    const rect = container.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    state.x = offsetX * 18;
    state.y = offsetY * 12;

    if (!frameId) {
      frameId = window.requestAnimationFrame(update);
    }
  });

  container.addEventListener('pointerleave', () => {
    state.x = 0;
    state.y = 0;
    if (!frameId) {
      frameId = window.requestAnimationFrame(update);
    }
  });
}
