const { Router } = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

const VALID_WGS = new Set([
    'foreign-policy', 'defence-security', 'energy-environment',
    'justice', 'education', 'healthcare', 'immigration-human-rights',
]);

async function requireAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
}

async function hasWgAccess(userId, workingGroup, requireUpload = false) {
    const { data } = await supabase
        .from('wg_access')
        .select('can_upload')
        .eq('user_id', userId)
        .eq('working_group', workingGroup)
        .maybeSingle();
    if (!data) return false;
    if (requireUpload) return data.can_upload === true;
    return true;
}

// POST /api/auth/upload-url
// Body: { filename, contentType, working_group }
router.post('/upload-url', requireAuth, async (req, res) => {
    const { filename, contentType, working_group } = req.body;
    if (!filename || !contentType || !working_group) {
        return res.status(400).json({ error: 'filename, contentType and working_group are required' });
    }
    if (!VALID_WGS.has(working_group)) {
        return res.status(400).json({ error: 'Invalid working_group' });
    }
    if (!(await hasWgAccess(req.user.id, working_group, true))) {
        return res.status(403).json({ error: 'Not authorized to upload to this working group' });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${working_group}/${req.user.id}/${Date.now()}_${safeName}`;

    const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUploadUrl(storagePath);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ signedUrl: data.signedUrl, storagePath });
});

// POST /api/auth/documents
// Body: { title, description, storage_path, file_size, mime_type, working_group }
router.post('/documents', requireAuth, async (req, res) => {
    const { title, description, storage_path, file_size, mime_type, working_group } = req.body;
    if (!title || !storage_path || !working_group) {
        return res.status(400).json({ error: 'title, storage_path and working_group are required' });
    }
    if (!VALID_WGS.has(working_group)) {
        return res.status(400).json({ error: 'Invalid working_group' });
    }
    if (!(await hasWgAccess(req.user.id, working_group, true))) {
        return res.status(403).json({ error: 'Not authorized to upload to this working group' });
    }

    const { data, error } = await supabase
        .from('documents')
        .insert({
            uploaded_by:   req.user.id,
            title,
            description:   description || '',
            storage_path,
            file_size:     file_size || null,
            mime_type:     mime_type || null,
            working_group,
        })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ document: data });
});

module.exports = router;
