export function initBusuanzi({ timeout = 2800 } = {}) {
  const scriptId = 'busuanzi-script';

  return new Promise((resolve) => {
    const finalize = () => {
      document.querySelectorAll('[data-busuanzi-fallback]').forEach((element) => {
        if (!element.textContent?.trim()) {
          element.textContent = '暂不可用';
        }
      });
      resolve();
    };

    if (document.getElementById(scriptId)) {
      window.setTimeout(finalize, 600);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    script.async = true;
    script.onload = () => window.setTimeout(finalize, 600);
    script.onerror = finalize;

    document.body.appendChild(script);
    window.setTimeout(finalize, timeout);
  });
}
