(() => {
  const languageKey = 'cookpath-language';
  let preferred;
  try { preferred = localStorage.getItem(languageKey); } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  const language = requested === 'el' || requested === 'en' ? requested : preferred === 'el' ? 'el' : 'en';
  const greek = language === 'el';
  const translate = text => greek ? window.COOKPATH_GREEK?.[text] ?? text : text;
  const choose = (english, hellenic) => greek ? hellenic : english;

  function localizeStaticPage() {
    document.documentElement.lang = language;
    const selector = document.querySelector('#language-select');
    if (selector) selector.value = language;
    if (!greek) return;
    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) manifest.href = './manifest-el.json';
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement.closest('script, style, [data-language-picker]')) continue;
      const original = node.nodeValue.trim();
      if (original) node.nodeValue = node.nodeValue.replace(original, translate(original));
    }
    for (const el of document.querySelectorAll('[aria-label], [alt], [title]')) {
      for (const attr of ['aria-label', 'alt', 'title']) {
        if (el.hasAttribute(attr)) el.setAttribute(attr, translate(el.getAttribute(attr)));
      }
    }
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = translate(description.content);
  }

  function changeLanguage(next) {
    if (next !== 'el' && next !== 'en') return;
    try { localStorage.setItem(languageKey, next); } catch {}
    const url = new URL(location.href);
    url.searchParams.set('lang', next);
    location.assign(url);
  }

  window.COOKPATH_I18N = { language, greek, translate, choose, changeLanguage };
  localizeStaticPage();
})();
