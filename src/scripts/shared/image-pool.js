const IMAGE_MODULES = import.meta.glob('../../assets/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default'
});

export const IMAGE_SLOTS = Object.freeze({
  homeHeroBackground: 'home.hero.background',
  homeCampBackground: 'home.camp.background',
  homeTrailBackground: 'home.trail.background',

  blogHeroBackground: 'blog.hero.background',
  blogMapBackground: 'blog.map.background',
  blogJournalBackground: 'blog.journal.background',

  postPageBackground: 'post.page.background',
  blogHeroQuill: 'blog.hero.quill'
});

const SLOT_DIRECTORIES = Object.freeze({
  [IMAGE_SLOTS.homeHeroBackground]: 'home-hero-bg',
  [IMAGE_SLOTS.homeCampBackground]: 'home-camp-bg',
  [IMAGE_SLOTS.homeTrailBackground]: 'home-trail-bg',

  [IMAGE_SLOTS.blogHeroBackground]: 'blog-hero-bg',
  [IMAGE_SLOTS.blogMapBackground]: 'blog-map-bg',
  [IMAGE_SLOTS.blogJournalBackground]: 'blog-journal-bg',

  [IMAGE_SLOTS.postPageBackground]: 'post-page-bg',
  [IMAGE_SLOTS.blogHeroQuill]: 'blog-hero-quill'
});

const imageRecords = Object.entries(IMAGE_MODULES)
  .map(([fullPath, url]) => {
    const normalizedPath = fullPath.split('/assets/')[1] || '';
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
