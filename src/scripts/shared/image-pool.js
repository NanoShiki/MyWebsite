const IMAGE_MODULES = import.meta.glob('../../assets/image-pools/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default'
});

export const IMAGE_SLOTS = Object.freeze({
  homePageBackground: 'home.page.background',
  homePageCampDay: 'home.page.camp-day',
  homePageCampNight: 'home.page.camp-night',
  homePageTrail: 'home.page.trail',

  blogPanelHeroBackground: 'blog.panel-hero.background',
  blogPanelHeroGlassNoise: 'blog.panel-hero.glass-noise',
  blogPanelHeroWindEmblem: 'blog.panel-hero.wind-emblem',
  blogPanelHeroPaperTexture: 'blog.panel-hero.paper-texture',
  blogPanelHeroWoodGrain: 'blog.panel-hero.wood-grain',
  blogPanelHeroRuinsOverlay: 'blog.panel-hero.ruins-overlay',
  blogPanelHeroCornerOrnament: 'blog.panel-hero.corner-ornament',
  blogPanelHeroDividerSeal: 'blog.panel-hero.divider-seal',
  blogPanelHeroQuill: 'blog.panel-hero.quill',

  blogPanelMapBackground: 'blog.panel-map.background',
  blogPanelMapGlassNoise: 'blog.panel-map.glass-noise',
  blogPanelMapWindEmblem: 'blog.panel-map.wind-emblem',
  blogPanelMapPaperTexture: 'blog.panel-map.paper-texture',
  blogPanelMapWoodGrain: 'blog.panel-map.wood-grain',
  blogPanelMapRuinsOverlay: 'blog.panel-map.ruins-overlay',
  blogPanelMapCornerOrnament: 'blog.panel-map.corner-ornament',
  blogPanelMapDividerSeal: 'blog.panel-map.divider-seal',

  blogPanelJournalBackground: 'blog.panel-journal.background',
  blogPanelJournalGlassNoise: 'blog.panel-journal.glass-noise',
  blogPanelJournalWindEmblem: 'blog.panel-journal.wind-emblem',
  blogPanelJournalPaperTexture: 'blog.panel-journal.paper-texture',
  blogPanelJournalWoodGrain: 'blog.panel-journal.wood-grain',
  blogPanelJournalRuinsOverlay: 'blog.panel-journal.ruins-overlay',
  blogPanelJournalCornerOrnament: 'blog.panel-journal.corner-ornament',
  blogPanelJournalDividerSeal: 'blog.panel-journal.divider-seal',

  blogSidebarProfileAvatar: 'blog.sidebar.profile-avatar',

  postPageBackground: 'post.page.background',
  postPageGlassNoise: 'post.page.glass-noise',
  postPageWindEmblem: 'post.page.wind-emblem',
  postPageRuinsOverlay: 'post.page.ruins-overlay'
});

const SLOT_DIRECTORIES = Object.freeze({
  [IMAGE_SLOTS.homePageBackground]: 'home/page/background',
  [IMAGE_SLOTS.homePageCampDay]: 'home/page/camp-day',
  [IMAGE_SLOTS.homePageCampNight]: 'home/page/camp-night',
  [IMAGE_SLOTS.homePageTrail]: 'home/page/trail',

  [IMAGE_SLOTS.blogPanelHeroBackground]: 'blog/panel-hero/background',
  [IMAGE_SLOTS.blogPanelHeroGlassNoise]: 'blog/panel-hero/glass-noise',
  [IMAGE_SLOTS.blogPanelHeroWindEmblem]: 'blog/panel-hero/wind-emblem',
  [IMAGE_SLOTS.blogPanelHeroPaperTexture]: 'blog/panel-hero/paper-texture',
  [IMAGE_SLOTS.blogPanelHeroWoodGrain]: 'blog/panel-hero/wood-grain',
  [IMAGE_SLOTS.blogPanelHeroRuinsOverlay]: 'blog/panel-hero/ruins-overlay',
  [IMAGE_SLOTS.blogPanelHeroCornerOrnament]: 'blog/panel-hero/corner-ornament',
  [IMAGE_SLOTS.blogPanelHeroDividerSeal]: 'blog/panel-hero/divider-seal',
  [IMAGE_SLOTS.blogPanelHeroQuill]: 'blog/panel-hero/quill',

  [IMAGE_SLOTS.blogPanelMapBackground]: 'blog/panel-map/background',
  [IMAGE_SLOTS.blogPanelMapGlassNoise]: 'blog/panel-map/glass-noise',
  [IMAGE_SLOTS.blogPanelMapWindEmblem]: 'blog/panel-map/wind-emblem',
  [IMAGE_SLOTS.blogPanelMapPaperTexture]: 'blog/panel-map/paper-texture',
  [IMAGE_SLOTS.blogPanelMapWoodGrain]: 'blog/panel-map/wood-grain',
  [IMAGE_SLOTS.blogPanelMapRuinsOverlay]: 'blog/panel-map/ruins-overlay',
  [IMAGE_SLOTS.blogPanelMapCornerOrnament]: 'blog/panel-map/corner-ornament',
  [IMAGE_SLOTS.blogPanelMapDividerSeal]: 'blog/panel-map/divider-seal',

  [IMAGE_SLOTS.blogPanelJournalBackground]: 'blog/panel-journal/background',
  [IMAGE_SLOTS.blogPanelJournalGlassNoise]: 'blog/panel-journal/glass-noise',
  [IMAGE_SLOTS.blogPanelJournalWindEmblem]: 'blog/panel-journal/wind-emblem',
  [IMAGE_SLOTS.blogPanelJournalPaperTexture]: 'blog/panel-journal/paper-texture',
  [IMAGE_SLOTS.blogPanelJournalWoodGrain]: 'blog/panel-journal/wood-grain',
  [IMAGE_SLOTS.blogPanelJournalRuinsOverlay]: 'blog/panel-journal/ruins-overlay',
  [IMAGE_SLOTS.blogPanelJournalCornerOrnament]: 'blog/panel-journal/corner-ornament',
  [IMAGE_SLOTS.blogPanelJournalDividerSeal]: 'blog/panel-journal/divider-seal',

  [IMAGE_SLOTS.blogSidebarProfileAvatar]: 'blog/sidebar/profile-avatar',

  [IMAGE_SLOTS.postPageBackground]: 'post/page/background',
  [IMAGE_SLOTS.postPageGlassNoise]: 'post/page/glass-noise',
  [IMAGE_SLOTS.postPageWindEmblem]: 'post/page/wind-emblem',
  [IMAGE_SLOTS.postPageRuinsOverlay]: 'post/page/ruins-overlay'
});

const imageRecords = Object.entries(IMAGE_MODULES)
  .map(([fullPath, url]) => {
    const normalizedPath = fullPath.split('/image-pools/')[1] || '';
    if (!normalizedPath) {
      return null;
    }

    return {
      path: normalizedPath,
      url: String(url || '')
    };
  })
  .filter(Boolean);

const slotAssetsCache = new Map();

function compareAssetPath(left = '', right = '') {
  return left.localeCompare(right, 'zh-Hans-CN-u-kn-true');
}

function getSlotAssets(slotKey = '') {
  if (slotAssetsCache.has(slotKey)) {
    return slotAssetsCache.get(slotKey) || [];
  }

  const directory = SLOT_DIRECTORIES[slotKey];
  if (!directory) {
    slotAssetsCache.set(slotKey, []);
    return [];
  }

  const prefix = `${directory}/`;
  const urls = imageRecords
    .filter((record) => record.path.startsWith(prefix))
    .sort((left, right) => compareAssetPath(left.path, right.path))
    .map((record) => record.url)
    .filter(Boolean);

  slotAssetsCache.set(slotKey, urls);
  return urls;
}

function getLocalDateSeed(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultPageContext() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return window.location?.pathname || '/';
}

function hashSeed(input = '') {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

export function pickDailyImageForSlot(slotKey = '', options = {}) {
  const assets = getSlotAssets(slotKey);
  if (!assets.length) {
    return '';
  }

  const dateSeed = options.dateSeed || getLocalDateSeed();
  const pageContext = options.pageContext || getDefaultPageContext();
  const seed = `${slotKey}|${dateSeed}|${pageContext}`;
  const index = hashSeed(seed) % assets.length;

  return assets[index] || '';
}
