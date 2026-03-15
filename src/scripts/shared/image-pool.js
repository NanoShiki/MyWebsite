const IMAGE_MODULES = import.meta.glob('../../assets/image-pools/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default'
});

export const IMAGE_SLOTS = Object.freeze({
  homeHero: 'home.hero',
  homeCampDay: 'home.camp.day',
  homeCampNight: 'home.camp.night',
  homeTrail: 'home.trail',
  blogCover: 'blog.cover',
  blogGlassNoise: 'blog.glass-noise',
  blogWindEmblem: 'blog.wind-emblem',
  blogParchment: 'blog.parchment',
  blogWoodGrain: 'blog.wood-grain',
  blogRuins: 'blog.ruins',
  blogCorner: 'blog.corner',
  blogDivider: 'blog.divider',
  blogQuill: 'blog.quill',
  blogProfileAvatar: 'blog.profile-avatar',
  postCover: 'post.cover',
  postGlassNoise: 'post.glass-noise',
  postWindEmblem: 'post.wind-emblem',
  postRuins: 'post.ruins'
});

const SLOT_DIRECTORIES = Object.freeze({
  [IMAGE_SLOTS.homeHero]: 'home/hero',
  [IMAGE_SLOTS.homeCampDay]: 'home/camp-day',
  [IMAGE_SLOTS.homeCampNight]: 'home/camp-night',
  [IMAGE_SLOTS.homeTrail]: 'home/trail',
  [IMAGE_SLOTS.blogCover]: 'blog/cover',
  [IMAGE_SLOTS.blogGlassNoise]: 'blog/glass-noise',
  [IMAGE_SLOTS.blogWindEmblem]: 'blog/wind-emblem',
  [IMAGE_SLOTS.blogParchment]: 'blog/parchment',
  [IMAGE_SLOTS.blogWoodGrain]: 'blog/wood-grain',
  [IMAGE_SLOTS.blogRuins]: 'blog/ruins',
  [IMAGE_SLOTS.blogCorner]: 'blog/corner',
  [IMAGE_SLOTS.blogDivider]: 'blog/divider',
  [IMAGE_SLOTS.blogQuill]: 'blog/quill',
  [IMAGE_SLOTS.blogProfileAvatar]: 'blog/profile-avatar',
  [IMAGE_SLOTS.postCover]: 'post/cover',
  [IMAGE_SLOTS.postGlassNoise]: 'post/glass-noise',
  [IMAGE_SLOTS.postWindEmblem]: 'post/wind-emblem',
  [IMAGE_SLOTS.postRuins]: 'post/ruins'
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
