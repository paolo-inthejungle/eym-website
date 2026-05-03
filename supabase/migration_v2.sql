-- ══════════════════════════════════════════════════════════════════
-- EYM — Migration v2: per-working-group document access
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════

-- ── FIX profiles RLS: allow users to update their own row ────────
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ── DROP OLD WHITELIST ────────────────────────────────────────────
DROP TABLE IF EXISTS public.whitelist CASCADE;

-- ── ADD working_group COLUMN TO documents ─────────────────────────
-- Default 'general' keeps existing rows valid (you can update them later)
ALTER TABLE public.documents
    ADD COLUMN IF NOT EXISTS working_group TEXT NOT NULL DEFAULT 'general';

-- ── WG_ACCESS TABLE ───────────────────────────────────────────────
-- Valid working_group slugs:
--   foreign-policy | defence-security | energy-environment
--   justice | education | healthcare | immigration-human-rights
CREATE TABLE IF NOT EXISTS public.wg_access (
    user_id       UUID    REFERENCES auth.users(id) ON DELETE CASCADE,
    working_group TEXT    NOT NULL,
    can_upload    BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, working_group)
);

ALTER TABLE public.wg_access ENABLE ROW LEVEL SECURITY;

-- Users can only read their own access rows (admins manage via service_role)
CREATE POLICY "wg_access_select_own" ON public.wg_access
    FOR SELECT USING (auth.uid() = user_id);


-- ── UPDATE RLS ON documents ───────────────────────────────────────
DROP POLICY IF EXISTS "documents_select_auth"       ON public.documents;
DROP POLICY IF EXISTS "documents_insert_whitelisted" ON public.documents;

-- Read: user must have a wg_access row for this document's working_group
CREATE POLICY "documents_select_wg" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.wg_access
            WHERE user_id      = auth.uid()
            AND   working_group = documents.working_group
        )
    );

-- Upload: user must have can_upload = true for this document's working_group
CREATE POLICY "documents_insert_wg" ON public.documents
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by
        AND EXISTS (
            SELECT 1 FROM public.wg_access
            WHERE user_id      = auth.uid()
            AND   working_group = documents.working_group
            AND   can_upload   = TRUE
        )
    );
