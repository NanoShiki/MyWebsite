import { getCanonicalSiteOrigin } from './site-data.js';

function setBusuanziFallbackText(text = '暂不可用', { force = false } = {}) {
  document.querySelectorAll('[data-busuanzi-fallback]').forEach((element) => {
    if (force || !element.textContent?.trim() || element.textContent.trim() === '加载中') {
      element.textContent = text;
    }
  });
}

function isPrivateIpv4Hostname(hostname = '') {
  return /^127\./.test(hostname)
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

function resolveBusuanziMode() {
  const canonicalOrigin = getCanonicalSiteOrigin();
  let canonicalUrl;

  try {
    canonicalUrl = new URL(`${canonicalOrigin}/`);
  } catch (error) {
    console.error('invalid-canonical-site-origin', error);
    return { action: 'enabled' };
  }

  const currentUrl = new URL(window.location.href);
  const hostname = currentUrl.hostname;
  const isLocalPreview = hostname === 'localhost'
    || hostname === '::1'
    || hostname === '[::1]'
    || hostname.endsWith('.local')
    || isPrivateIpv4Hostname(hostname);

  if (isLocalPreview) {
    return {
      action: 'skip',
      fallbackText: '预览不统计'
    };
  }

  const isCanonicalOrigin = currentUrl.origin === canonicalUrl.origin;
  const isCanonicalHost = currentUrl.hostname === canonicalUrl.hostname;
  const isWwwAlias = currentUrl.hostname === `www.${canonicalUrl.hostname}`;

  if (!isCanonicalOrigin && (isCanonicalHost || isWwwAlias)) {
    const targetUrl = new URL(
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
      canonicalUrl
    );
    return {
      action: 'redirect',
      targetUrl: targetUrl.toString()
    };
  }

  if (!isCanonicalOrigin) {
    return {
      action: 'skip',
      fallbackText: '仅主站统计'
    };
  }

  return { action: 'enabled' };
}

export function initBusuanzi({ timeout = 2800 } = {}) {
  const scriptId = 'busuanzi-script';
  const mode = resolveBusuanziMode();

  return new Promise((resolve) => {
    const finalize = (fallbackText = '暂不可用', options = {}) => {
      setBusuanziFallbackText(fallbackText, options);
      resolve();
    };

    if (mode.action === 'redirect') {
      setBusuanziFallbackText('跳转中…', { force: true });
      window.location.replace(mode.targetUrl);
      resolve();
      return;
    }

    if (mode.action === 'skip') {
      finalize(mode.fallbackText, { force: true });
      return;
    }

    if (document.getElementById(scriptId)) {
      window.setTimeout(() => finalize(), 600);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    script.async = true;
    script.onload = () => window.setTimeout(() => finalize(), 600);
    script.onerror = finalize;

    document.body.appendChild(script);
    window.setTimeout(() => finalize(), timeout);
  });
}
