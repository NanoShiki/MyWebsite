const rootBase = (() => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
})();

const canonicalSiteOrigin = (() => {
  const configured = String(import.meta.env.VITE_SITE_ORIGIN || '').trim();
  const origin = configured || 'https://nanoshiki.top';
  return origin.replace(/\/+$/, '');
})();

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function encodePathSegment(segment, { preserveAmpersand = true, preserveParentheses = true } = {}) {
  let encoded = encodeURIComponent(safeDecode(segment));
  if (preserveAmpersand) {
    encoded = encoded.replace(/%26/g, '&');
  }
  if (preserveParentheses) {
    encoded = encoded.replace(/%28/g, '(').replace(/%29/g, ')');
  }
  return encoded;
}

export function encodeSitePath(path = '', options = {}) {
  const [pathname, search = ''] = path.split('?');
  const encodedPath = pathname
    .split('/')
    .map((segment, index) => {
      if (!segment) {
        return index === 0 ? '' : '';
      }
      return encodePathSegment(segment, options);
    })
    .join('/');

  return search ? `${encodedPath}?${search}` : encodedPath;
}

export function withBase(path = '') {
  if (!path) {
    return `${rootBase || ''}/`;
  }

  if (/^(https?:)?\/\//.test(path)) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${rootBase}${normalized}` || normalized;
}

export function getCanonicalSiteOrigin() {
  return canonicalSiteOrigin;
}

export async function fetchBlogConfig() {
  const response = await fetch(withBase('/Blog/config.json'), { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`config-load-failed:${response.status}`);
  }
  return response.json();
}

function buildMarkdownRelativePath(post) {
  const trimmed = post.path.replace(/\/+$/, '');
  const folderName = safeDecode(trimmed.split('/').filter(Boolean).at(-1) || post.id);
  return `${trimmed}/${folderName}.md`;
}

export function getMarkdownPath(post, options = {}) {
  return withBase(encodeSitePath(buildMarkdownRelativePath(post), options));
}

export function getMarkdownPathCandidates(post) {
  const candidates = [
    getMarkdownPath(post, { preserveAmpersand: true, preserveParentheses: true }),
    getMarkdownPath(post, { preserveAmpersand: false, preserveParentheses: true }),
    getMarkdownPath(post, { preserveAmpersand: true, preserveParentheses: false }),
    getMarkdownPath(post, { preserveAmpersand: false, preserveParentheses: false })
  ];

  return [...new Set(candidates)];
}

export function resolveSiteAssetUrl(basePath = '', rawPath = '', options = {}) {
  if (!rawPath) {
    return '';
  }

  if (rawPath.startsWith('#') || /^(https?:)?\/\//.test(rawPath) || rawPath.startsWith('data:')) {
    return rawPath;
  }

  if (rawPath.startsWith('/')) {
    const resolvedPath = withBase(encodeSitePath(rawPath, options));
    if (options.absolute) {
      return new URL(resolvedPath, options.origin || window.location.origin).toString();
    }
    return resolvedPath;
  }

  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const baseUrl = new URL(
    withBase(encodeSitePath(normalizedBase, options)),
    options.origin || window.location.origin
  );
  return new URL(rawPath, baseUrl).toString();
}

export function getPostUrl(postId) {
  return `${withBase('/Blog/post.html')}?id=${encodeURIComponent(postId)}`;
}

export function getCategoryUrl(pathSegments = []) {
  if (!pathSegments.length) {
    return withBase('/Blog/');
  }

  return `${withBase('/Blog/')}?path=${encodeURIComponent(pathSegments.join('/'))}`;
}

function getPostCreatedTs(post = {}) {
  const createdTs = Number(post.createdTs);
  if (Number.isFinite(createdTs)) {
    return createdTs;
  }

  const fallback = Date.parse(post.date || '');
  if (Number.isFinite(fallback)) {
    return fallback / 1000;
  }

  return 0;
}

function getPostFolderName(post = {}) {
  const trimmed = (post.path || '').replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }

  const segments = trimmed.split('/').filter(Boolean);
  return safeDecode(segments.at(-1) || '');
}

function comparePostsByCreatedAt(left = {}, right = {}) {
  const createdDiff = getPostCreatedTs(right) - getPostCreatedTs(left);
  if (createdDiff !== 0) {
    return createdDiff;
  }

  const nameDiff = getPostFolderName(right).localeCompare(getPostFolderName(left), 'zh-Hans-CN-u-kn-true');
  if (nameDiff !== 0) {
    return nameDiff;
  }

  return (right.path || '').localeCompare((left.path || ''), 'zh-Hans-CN-u-kn-true');
}

export function sortPostsByCreatedAt(posts = []) {
  return [...posts].sort(comparePostsByCreatedAt);
}

// 保留旧导出名，避免潜在调用方破坏。
export function sortPostsByDate(posts = []) {
  return sortPostsByCreatedAt(posts);
}

export function flattenCategoryNodes(tree) {
  const items = [];

  function visit(node, path = []) {
    if (!node || node.name === 'root') {
      node?.children?.forEach((child) => visit(child, []));
      return;
    }

    const nextPath = [...path, node.name];
    const postCount = countPostsInNode(node);

    items.push({
      name: node.name,
      path: nextPath,
      postCount,
      depth: nextPath.length,
      node
    });

    node.children?.forEach((child) => visit(child, nextPath));
  }

  visit(tree);
  return items;
}

export function countPostsInNode(node) {
  if (!node) {
    return 0;
  }

  const direct = Array.isArray(node.posts) ? node.posts.length : 0;
  const descendants = Array.isArray(node.children)
    ? node.children.reduce((sum, child) => sum + countPostsInNode(child), 0)
    : 0;

  return direct + descendants;
}

export function collectPostsFromNode(node) {
  if (!node) {
    return [];
  }

  const posts = Array.isArray(node.posts) ? [...node.posts] : [];
  const descendants = Array.isArray(node.children)
    ? node.children.flatMap((child) => collectPostsFromNode(child))
    : [];

  const uniquePosts = new Map();
  [...posts, ...descendants].forEach((post) => uniquePosts.set(post.id, post));
  return sortPostsByCreatedAt([...uniquePosts.values()]);
}

export function findNodeByPath(tree, pathSegments = []) {
  let currentNode = tree;

  for (const segment of pathSegments) {
    currentNode = currentNode?.children?.find((child) => child.name === segment);
    if (!currentNode) {
      return null;
    }
  }

  return currentNode;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatRuntime(startDate) {
  const diff = Date.now() - new Date(startDate).getTime();
  const totalMinutes = Math.max(0, Math.floor(diff / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} 天 ${hours} 小时`;
  }
  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  }
  return `${minutes} 分钟`;
}

export function slugifyHeading(text, fallbackIndex) {
  const normalized = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || `section-${fallbackIndex}`;
}
