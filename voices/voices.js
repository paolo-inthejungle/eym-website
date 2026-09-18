// Voices from Europe — single page that reconfigures via ?author= / ?theme=
(function () {
    const THEME_I18N_KEYS = {
        'foreign-policy': 'policies_section.wg.fp_title',
        'defence-security': 'policies_section.wg.ds_title',
        'energy-environment': 'policies_section.wg.ee_title',
        'justice': 'policies_section.wg.jus_title',
        'education': 'policies_section.wg.edu_title',
        'healthcare': 'policies_section.wg.hc_title',
        'immigration-human-rights': 'policies_section.wg.ihr_title',
        'general': 'voices.theme_general',
    };
    const KNOWN_THEMES = new Set(Object.keys(THEME_I18N_KEYS));

    const params = new URLSearchParams(window.location.search);
    const filterAuthor = params.get('author');
    const filterTheme = !filterAuthor ? params.get('theme') : null;

    function t(key) {
        return (window.EYM && window.EYM.t(key)) || key;
    }

    function themeName(slug) {
        const key = THEME_I18N_KEYS[slug];
        return key ? t(key) : slug;
    }

    function waitForI18n() {
        return new Promise(resolve => {
            if (document.documentElement.classList.contains('i18n-ready')) return resolve();
            const obs = new MutationObserver(() => {
                if (document.documentElement.classList.contains('i18n-ready')) {
                    obs.disconnect();
                    resolve();
                }
            });
            obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
            // Safety net in case i18n.js fails to load at all
            setTimeout(resolve, 2500);
        });
    }

    function el(tag, className, text) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text !== undefined) e.textContent = text;
        return e;
    }

    function show(id) {
        const node = document.getElementById(id);
        if (node) node.hidden = false;
        return node;
    }

    function buildAuthorAvatar(author, sizeClass, avatarClass) {
        if (author && author.photo) {
            const img = document.createElement('img');
            img.className = sizeClass;
            img.src = '../' + author.photo;
            img.alt = author.name;
            img.onerror = function () {
                const fallback = el('div', avatarClass, '👤');
                img.replaceWith(fallback);
            };
            return img;
        }
        return el('div', avatarClass, '👤');
    }

    function renderAuthorCard(author) {
        const box = show('author-card');
        if (!box) return;
        box.innerHTML = '';
        box.appendChild(buildAuthorAvatar(author, 'author-photo-lg', 'author-avatar-lg'));
        const info = el('div');
        const h2 = el('h2', null, author.name + (author.flag ? ' ' + author.flag : ''));
        info.appendChild(h2);
        if (Array.isArray(author.bioLong) && author.bioLong.length) {
            author.bioLong.forEach(paragraph => info.appendChild(el('p', null, paragraph)));
        } else if (author.bio) {
            info.appendChild(el('p', null, author.bio));
        }
        box.appendChild(info);
    }

    function renderFilterBanner(kind, value) {
        const banner = show('filter-banner');
        if (!banner) return;
        const labelKey = kind === 'author' ? 'voices.filter_author_label' : 'voices.filter_theme_label';
        banner.querySelector('#filter-banner-label').textContent = t(labelKey);
        banner.querySelector('#filter-banner-value').textContent = value;
    }

    function buildCard(article, author) {
        const card = el('article', 'voice-card');

        const meta = el('div', 'voice-card-meta');
        const themeLink = document.createElement('a');
        themeLink.className = 'voice-theme-tag';
        themeLink.href = '?theme=' + encodeURIComponent(article.themeSlug);
        themeLink.textContent = themeName(article.themeSlug);
        meta.appendChild(themeLink);
        meta.appendChild(el('span', 'voice-lang-tag', (article.lang || '').toUpperCase()));
        meta.appendChild(el('span', 'voice-date', article.date));
        card.appendChild(meta);

        const h3 = el('h3', 'voice-title');
        const titleLink = document.createElement('a');
        titleLink.href = article.file;
        titleLink.textContent = article.title;
        h3.appendChild(titleLink);
        card.appendChild(h3);

        if (article.excerpt) card.appendChild(el('p', 'voice-excerpt', article.excerpt));

        const authorRow = el('div', 'voice-author');
        const avatar = buildAuthorAvatar(author, 'voice-author-photo', 'voice-author-avatar');
        const nameLink = document.createElement('a');
        nameLink.className = 'voice-author-name';
        nameLink.href = '?author=' + encodeURIComponent(article.authorSlug);
        nameLink.textContent = author ? author.name + (author.flag ? ' ' + author.flag : '') : article.authorSlug;
        authorRow.appendChild(avatar);
        authorRow.appendChild(nameLink);
        card.appendChild(authorRow);

        return card;
    }

    function showEmptyAll() { show('empty-all'); }
    function showEmptyFiltered() { show('empty-filtered'); }
    function showError() { show('load-error'); }

    function render(data) {
        const authorsBySlug = {};
        data.authors.forEach(a => { authorsBySlug[a.slug] = a; });

        let articles = data.articles.slice();
        let isFiltered = false;

        if (filterAuthor) {
            const author = authorsBySlug[filterAuthor];
            if (author) {
                isFiltered = true;
                articles = articles.filter(a => a.authorSlug === filterAuthor);
                renderAuthorCard(author);
                renderFilterBanner('author', author.name + (author.flag ? ' ' + author.flag : ''));
            } else {
                articles = [];
                isFiltered = true;
            }
        } else if (filterTheme) {
            if (KNOWN_THEMES.has(filterTheme)) {
                isFiltered = true;
                articles = articles.filter(a => a.themeSlug === filterTheme);
                renderFilterBanner('theme', themeName(filterTheme));
            } else {
                articles = [];
                isFiltered = true;
            }
        }

        articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        if (articles.length === 0) {
            if (isFiltered) showEmptyFiltered(); else showEmptyAll();
            return;
        }

        const list = document.getElementById('articles-list');
        articles.forEach(article => {
            list.appendChild(buildCard(article, authorsBySlug[article.authorSlug]));
        });
    }

    async function init() {
        let data;
        try {
            const res = await fetch('../assets/data/voices.json');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            data = await res.json();
        } catch (e) {
            showError();
            return;
        }
        if (!data || !Array.isArray(data.authors) || !Array.isArray(data.articles)) {
            showError();
            return;
        }
        render(data);
    }

    waitForI18n().then(init);
})();
