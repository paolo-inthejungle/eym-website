(function () {
  const SUPPORTED = ['en', 'it', 'fr', 'es', 'de'];
  const DEFAULT = 'en';
  let current = DEFAULT;
  const cache = {};

  function detectLang() {
    const stored = localStorage.getItem('eym-lang');
    if (stored && SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.language || '').slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(browser)) return browser;
    return DEFAULT;
  }

  function get(t, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), t);
  }

  function apply(t) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = get(t, el.dataset.i18n);
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = get(t, el.dataset.i18nHtml);
      if (val !== null) el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = get(t, el.dataset.i18nPlaceholder);
      if (val !== null) el.placeholder = val;
    });
    document.documentElement.lang = current;
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('lang-active', btn.dataset.lang === current);
    });
    document.documentElement.classList.add('i18n-ready');
  }

  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT;
    current = lang;
    localStorage.setItem('eym-lang', lang);
    if (cache[lang]) { apply(cache[lang]); return; }
    try {
      const res = await fetch('/assets/i18n/' + lang + '.json');
      const t = await res.json();
      cache[lang] = t;
      apply(t);
    } catch (e) {
      console.warn('i18n: failed to load', lang);
      if (lang !== DEFAULT) setLang(DEFAULT);
    }
  }

  window.EYM = window.EYM || {};
  window.EYM.setLang = setLang;
  window.EYM.getLang = () => current;
  window.EYM.t = (key) => cache[current] ? (get(cache[current], key) ?? key) : key;

  document.addEventListener('DOMContentLoaded', () => setLang(detectLang()));
})();
