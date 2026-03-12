import { siBilibili, siGithub, siZhihu } from 'simple-icons';

function svg(content, { viewBox = '0 0 24 24', filled = false, className = 'icon' } = {}) {
  return `
    <svg class="${className}" viewBox="${viewBox}" ${filled ? 'fill="currentColor"' : 'fill="none"'} aria-hidden="true">
      ${content}
    </svg>
  `;
}

function strokeIcon(paths, className = 'icon') {
  return svg(paths, { className });
}

function brandIcon(icon, className = 'icon brand-icon') {
  return svg(`<path d="${icon.path}"></path>`, { filled: true, className });
}

export const icons = {
  github: brandIcon(siGithub),
  bilibili: brandIcon(siBilibili),
  zhihu: brandIcon(siZhihu),
  blog: strokeIcon('<path d="M6 4.5h8l4 4v11a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  arrowRight: strokeIcon('<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  chevronRight: strokeIcon('<path d="M10 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  chevronDown: strokeIcon('<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  sun: strokeIcon('<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v3M12 18.5v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2.5 12h3M18.5 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  moon: strokeIcon('<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a8.5 8.5 0 1 0 9.5 9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  scroll: strokeIcon('<path d="M8 4.5h8a3 3 0 1 1 0 6H8a2.5 2.5 0 1 0 0 5h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 4.5v15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  compass: strokeIcon('<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="m14.8 9.2-2 5.6-5.6 2 2-5.6 5.6-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
  clock: strokeIcon('<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.8v4.7l3 1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  users: strokeIcon('<path d="M7.5 18a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm9 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 21a5.5 5.5 0 0 1 10.9 0M13.5 21a4.5 4.5 0 0 1 8 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  files: strokeIcon('<path d="M6 4.5h8l4 4v10.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.5 4.5v4h4M8.5 12h7M8.5 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  tag: strokeIcon('<path d="M20.5 12.2 11.8 20.9a2.5 2.5 0 0 1-3.5 0l-5.2-5.2a2.5 2.5 0 0 1 0-3.5L11.8 3.5H18a2.5 2.5 0 0 1 2.5 2.5v6.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="15.7" cy="8.3" r="1.2" fill="currentColor"/>'),
  home: strokeIcon('<path d="M3.5 10.5 12 3l8.5 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 9.8V20h11V9.8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
  sparkles: strokeIcon('<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m19 3 .7 2.3L22 6l-2.3.7L19 9l-.7-2.3L16 6l2.3-.7L19 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'),
  scrollDown: strokeIcon('<path d="M12 4.5v12M7 12l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  theme: strokeIcon('<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5 7 7 0 0 1-8.5-8.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  folder: strokeIcon('<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
  folderOpen: strokeIcon('<path d="M3.5 9.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 1.9 2.6l-1.3 4.2a2 2 0 0 1-1.9 1.4H5.2a2 2 0 0 1-1.9-2.6l1.3-4.2A2 2 0 0 1 6.5 9.5h-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
  fileText: strokeIcon('<path d="M7 4.5h7l4 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 11h5M10 14.5h5M10 18h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>')
};
