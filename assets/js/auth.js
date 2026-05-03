// EYM Auth — frontend authentication module
// Requires @supabase/supabase-js loaded via CDN before this script
(function () {
    'use strict';

    const SUPA_URL = 'https://bmbrygfmosleqiqxlmge.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYnJ5Z2Ztb3NsZXFpcXhsbWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDAyNjcsImV4cCI6MjA5MzM3NjI2N30.CuaQygrIXNgT0gSNKvZBFUDmfGMVwL6WJomCnQPtEmY';

    const sb = window.supabase.createClient(SUPA_URL, SUPA_KEY);

    let currentUser = null;

    // ── Session ────────────────────────────────────────────────

    async function getToken() {
        const { data: { session } } = await sb.auth.getSession();
        return session?.access_token || null;
    }

    async function authFetch(url, opts = {}) {
        const token = await getToken();
        return fetch(url, {
            ...opts,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...opts.headers,
            },
        });
    }

    // ── Auth actions ───────────────────────────────────────────

    async function signUp(email, password, meta) {
        return sb.auth.signUp({ email, password, options: { data: meta } });
    }

    async function signIn(email, password) {
        return sb.auth.signInWithPassword({ email, password });
    }

    async function signOut() {
        await sb.auth.signOut();
        window.location.href = '/';
    }

    async function resetPassword(email) {
        return sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/area-utente.html',
        });
    }

    // ── Profile ────────────────────────────────────────────────

    async function getProfile() {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return null;
        const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
        return data;
    }

    async function updateProfile(fields) {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { data, error } = await sb.from('profiles')
            .update(fields)
            .eq('id', user.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // ── Documents ──────────────────────────────────────────────

    async function isWhitelisted() {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return false;
        const { data } = await sb.from('whitelist').select('user_id').eq('user_id', user.id).maybeSingle();
        return !!data;
    }

    async function getDocuments() {
        const { data, error } = await sb.from('documents').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function uploadDocument(file, title, description) {
        // 1. Get signed upload URL from backend (backend verifies whitelist)
        const urlRes = await authFetch('/api/auth/upload-url', {
            method: 'POST',
            body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        if (!urlRes.ok) {
            const err = await urlRes.json().catch(() => ({}));
            throw new Error(err.error || 'Upload not authorized');
        }
        const { signedUrl, storagePath } = await urlRes.json();

        // 2. Upload file directly to Supabase Storage
        const uploadRes = await fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
        });
        if (!uploadRes.ok) throw new Error('File upload failed');

        // 3. Save document metadata via backend
        const metaRes = await authFetch('/api/auth/documents', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description: description || '',
                storage_path: storagePath,
                file_size: file.size,
                mime_type: file.type,
            }),
        });
        if (!metaRes.ok) {
            const err = await metaRes.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to save document metadata');
        }
        return (await metaRes.json()).document;
    }

    async function getDocumentUrl(storagePath) {
        const { data, error } = await sb.storage
            .from('documents')
            .createSignedUrl(storagePath, 3600);
        if (error) throw error;
        return data.signedUrl;
    }

    // ── Header UI ──────────────────────────────────────────────

    function updateHeaderUI(user) {
        const btn = document.getElementById('auth-btn');
        const dropdown = document.getElementById('auth-dropdown');
        if (!btn) return;

        if (user) {
            const name = user.user_metadata?.first_name || user.email.split('@')[0];
            const label = btn.querySelector('.auth-btn-label');
            if (label) label.textContent = name;
            btn.dataset.state = 'in';
            const emailEl = dropdown?.querySelector('[data-auth-email]');
            if (emailEl) emailEl.textContent = user.email;
        } else {
            const label = btn.querySelector('.auth-btn-label');
            if (label) label.textContent = 'Login';
            btn.dataset.state = 'out';
        }
    }

    // ── Modal helpers ──────────────────────────────────────────

    function openAuthModal(tab) {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;
        modal.classList.add('open');
        if (tab) switchAuthTab(tab);
        document.body.style.overflow = 'hidden';
    }

    function closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
        const errEl = document.getElementById('auth-error');
        const sucEl = document.getElementById('auth-success');
        if (errEl) errEl.textContent = '';
        if (sucEl) sucEl.textContent = '';
    }

    function switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t =>
            t.classList.toggle('active', t.dataset.tab === tab));
        document.querySelectorAll('.auth-panel').forEach(p =>
            p.classList.toggle('active', p.dataset.panel === tab));
    }

    // ── Init ───────────────────────────────────────────────────

    async function init() {
        const { data: { session } } = await sb.auth.getSession();
        currentUser = session?.user || null;
        updateHeaderUI(currentUser);

        sb.auth.onAuthStateChange((_event, session) => {
            currentUser = session?.user || null;
            updateHeaderUI(currentUser);
        });

        // Handle ?auth=login redirect
        if (new URLSearchParams(window.location.search).get('auth') === 'login') {
            openAuthModal('login');
        }
    }

    // ── Expose ─────────────────────────────────────────────────

    window.EYMAuth = {
        init,
        signUp, signIn, signOut, resetPassword,
        getProfile, updateProfile,
        isWhitelisted, getDocuments, uploadDocument, getDocumentUrl,
        openAuthModal, closeAuthModal, switchAuthTab,
        getUser: () => currentUser,
        client: sb,
    };

})();
