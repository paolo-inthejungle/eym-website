const { Router } = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function requireAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
}

async function isWhitelisted(userId) {
    const { data } = await supabase
        .from('whitelist')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
    return !!data;
}

// POST /api/auth/upload-url
// Verifies JWT, checks whitelist, returns a signed upload URL for Supabase Storage
router.post('/upload-url', requireAuth, async (req, res) => {
    if (!(await isWhitelisted(req.user.id))) {
        return res.status(403).json({ error: 'Not authorized to upload documents' });
    }

    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
        return res.status(400).json({ error: 'filename and contentType are required' });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${req.user.id}/${Date.now()}_${safeName}`;

    const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUploadUrl(storagePath);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ signedUrl: data.signedUrl, storagePath });
});

// POST /api/auth/documents
// Saves document metadata after a successful upload
router.post('/documents', requireAuth, async (req, res) => {
    if (!(await isWhitelisted(req.user.id))) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, storage_path, file_size, mime_type } = req.body;
    if (!title || !storage_path) {
        return res.status(400).json({ error: 'title and storage_path are required' });
    }

    const { data, error } = await supabase
        .from('documents')
        .insert({
            uploaded_by: req.user.id,
            title,
            description: description || '',
            storage_path,
            file_size: file_size || null,
            mime_type: mime_type || null,
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ document: data });
});

module.exports = router;
