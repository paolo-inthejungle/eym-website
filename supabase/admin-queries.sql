-- ══════════════════════════════════════════════════════════════════
-- EYM — Admin queries (Opzione A)
-- Uso: Supabase Dashboard → SQL Editor → incolla la query che ti serve
-- ══════════════════════════════════════════════════════════════════


-- ── 1. TROVA UUID UTENTE PER EMAIL ───────────────────────────────
-- Copia l'UUID risultante per usarlo nelle query successive.

SELECT id, email, created_at
FROM auth.users
WHERE email = 'utente@example.com';


-- ── 2. DAI ACCESSO LETTURA A UN WORKING GROUP ─────────────────────
-- L'utente può vedere i documenti del WG ma non caricarli.

INSERT INTO public.wg_access (user_id, working_group, can_upload)
VALUES ('<uuid>', 'foreign-policy', false);


-- ── 3. DAI ACCESSO UPLOAD A UN WORKING GROUP ─────────────────────
-- Se la riga esiste già, aggiorna can_upload a true.

INSERT INTO public.wg_access (user_id, working_group, can_upload)
VALUES ('<uuid>', 'foreign-policy', true)
ON CONFLICT (user_id, working_group)
DO UPDATE SET can_upload = true;


-- ── 4. DEGRADA DA UPLOAD A SOLA LETTURA ──────────────────────────

UPDATE public.wg_access
SET can_upload = false
WHERE user_id = '<uuid>'
  AND working_group = 'foreign-policy';


-- ── 5. REVOCA ACCESSO COMPLETO A UN WG ───────────────────────────

DELETE FROM public.wg_access
WHERE user_id = '<uuid>'
  AND working_group = 'foreign-policy';


-- ── 6. VEDI TUTTI GLI ACCESSI DI UN UTENTE ───────────────────────

SELECT working_group, can_upload, granted_at
FROM public.wg_access
WHERE user_id = '<uuid>'
ORDER BY working_group;


-- ── 7. VEDI CHI HA ACCESSO A UN DATO WG ──────────────────────────

SELECT u.email, w.can_upload, w.granted_at
FROM public.wg_access w
JOIN auth.users u ON u.id = w.user_id
WHERE w.working_group = 'foreign-policy'
ORDER BY u.email;


-- ── 8. DAI ACCESSO A TUTTI I WG (lettura) ────────────────────────
-- Sostituisci <uuid> con l'ID dell'utente.

INSERT INTO public.wg_access (user_id, working_group, can_upload)
VALUES
  ('<uuid>', 'foreign-policy',          false),
  ('<uuid>', 'defence-security',         false),
  ('<uuid>', 'energy-environment',       false),
  ('<uuid>', 'justice',                  false),
  ('<uuid>', 'education',                false),
  ('<uuid>', 'healthcare',               false),
  ('<uuid>', 'immigration-human-rights', false)
ON CONFLICT (user_id, working_group) DO NOTHING;


-- ── 9. LISTA COMPLETA UTENTI + ACCESSI ───────────────────────────

SELECT
    u.email,
    u.created_at AS registered_at,
    w.working_group,
    w.can_upload
FROM auth.users u
LEFT JOIN public.wg_access w ON w.user_id = u.id
ORDER BY u.email, w.working_group;


-- ── SLUG VALIDI PER working_group ────────────────────────────────
-- foreign-policy
-- defence-security
-- energy-environment
-- justice
-- education
-- healthcare
-- immigration-human-rights
