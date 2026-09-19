require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();

app.use(express.json());

// ── Voices from Europe — per-author social preview ──
// A shared link to /voices/index.html?author=<slug> should show that
// author's own name/bio/photo when previewed on WhatsApp/Telegram/LinkedIn,
// not the generic site preview: it's the same page for every author, and
// social crawlers don't run JavaScript, so voices.js's own client-side
// rendering never runs for them. This rewrites the OG/Twitter <meta> tags
// of the static voices/index.html before sending it, only for that one
// query string shape. Anything else (no ?author=, unknown slug, missing or
// broken voices.json) falls through to express.static below unchanged —
// see docs/ARCHITETTURA.md for the full reasoning.
const VOICES_INDEX_PATH = path.join(__dirname, 'voices', 'index.html');
const VOICES_DATA_PATH = path.join(__dirname, 'assets', 'data', 'voices.json');
const OG_BLOCK_RE = /<!-- OG_START -->[\s\S]*?<!-- OG_END -->/;
// Official site address (no "www.": see docs/NOTE.md). Built from here
// only — everything else below reads SITE_URL instead of writing the
// domain out again.
const SITE_URL = 'https://eym-europe.eu';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function truncate(str, max) {
    if (!str || str.length <= max) return str || '';
    const cut = str.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

app.get('/voices/index.html', async (req, res, next) => {
    const authorSlug = req.query.author;
    if (!authorSlug || typeof authorSlug !== 'string') return next();

    try {
        const [html, rawData] = await Promise.all([
            fs.readFile(VOICES_INDEX_PATH, 'utf8'),
            fs.readFile(VOICES_DATA_PATH, 'utf8'),
        ]);
        const data = JSON.parse(rawData);
        if (!data || !Array.isArray(data.authors)) return next();

        // authorSlug is only ever used as a lookup key against known slugs
        // below — never to build a file path or get written in unescaped.
        const author = data.authors.find(a => a && a.slug === authorSlug);
        if (!author || !author.name) return next();

        if (!OG_BLOCK_RE.test(html)) return next();

        const title = escapeHtml(author.name);
        const description = escapeHtml(truncate(author.bio, 200)) ||
            'Personal reflections and analysis from EYM members, in their own words and on their own responsibility.';
        const image = author.photo
            ? escapeHtml(SITE_URL + '/' + author.photo)
            : SITE_URL + '/assets/logos/og-default.png';
        const url = escapeHtml(SITE_URL + '/voices/index.html?author=' + encodeURIComponent(authorSlug));

        const block = `<!-- OG_START -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="European Youth Movement">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    <!-- OG_END -->`;

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(html.replace(OG_BLOCK_RE, block));
    } catch (e) {
        next();
    }
});

app.use(express.static(path.join(__dirname)));

app.use('/api/subscribe', require('./api/subscribe'));
app.use('/api/signup', require('./api/signup'));
app.use('/api/apply-coordinator', require('./api/apply-coordinator'));
app.use('/api/auth', require('./api/auth'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
