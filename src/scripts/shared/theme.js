import { icons } from './icons.js';

export const THEME_STORAGE_KEY = 'site-theme';

function normalizeTheme(theme) {
  return theme === 'night' ? 'night' : 'day';
}

export function getStoredTheme() {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'day';
  }
}

export function applyTheme(theme, { persist = true } = {}) {
  const nextTheme = normalizeTheme(theme);
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme === 'night' ? 'dark' : 'light';

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // noop
    }
  }

  window.dispatchEvent(new CustomEvent('site-theme-change', { detail: { theme: nextTheme } }));
  return nextTheme;
}

export function toggleTheme() {
  return applyTheme(getStoredTheme() === 'night' ? 'day' : 'night');
}

function renderToggle(button, theme) {
  const nextTheme = theme === 'night' ? 'day' : 'night';
  const icon = nextTheme === 'night' ? icons.moon : icons.sun;
  const text = nextTheme === 'night' ? '切换夜色' : '切换白昼';

  button.innerHTML = `${icon}<span>${text}</span>`;
  button.setAttribute('aria-label', text);
  button.dataset.nextTheme = nextTheme;
}

export function initThemeToggles(selector = '[data-theme-toggle]') {
  const buttons = [...document.querySelectorAll(selector)];
  const sync = () => {
    const theme = getStoredTheme();
    buttons.forEach((button) => renderToggle(button, theme));
  };

  buttons.forEach((button) => {
    if (button.dataset.themeBound === 'true') {
      return;
    }

    button.dataset.themeBound = 'true';
    button.addEventListener('click', () => {
      toggleTheme();
      sync();
    });
  });

  window.addEventListener('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyTheme(event.newValue || 'day', { persist: false });
      sync();
    }
  });

  window.addEventListener('site-theme-change', sync);
  sync();
}
