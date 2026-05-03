-- ══════════════════════════════════════════════════════════════════
-- EYM — Supabase Migration v1
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════

-- ── PROFILES ──────────────────────────────────────────────────────
create table if not exists public.profiles (
    id            uuid references auth.users(id) on delete cascade primary key,
    first_name    text    not null default '',
    last_name     text    not null default '',
    email         text    not null default '',
    country       text             default '',
    working_group text             default '',
    bio           text             default '',
    phone         text             default '',
    created_at    timestamptz      default now(),
    updated_at    timestamptz      default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
    for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
    for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
    for update using (auth.uid() = id);


-- ── WHITELIST ─────────────────────────────────────────────────────
-- Only admins (service_role) can add/remove entries.
-- Users can read their own row to know if they're whitelisted.
create table if not exists public.whitelist (
    user_id    uuid references auth.users(id) on delete cascade primary key,
    added_at   timestamptz default now()
);

alter table public.whitelist enable row level security;

create policy "whitelist_select_own" on public.whitelist
    for select using (auth.uid() = user_id);


-- ── DOCUMENTS ─────────────────────────────────────────────────────
create table if not exists public.documents (
    id            uuid        default gen_random_uuid() primary key,
    uploaded_by   uuid        references auth.users(id) on delete set null,
    title         text        not null,
    description   text        default '',
    storage_path  text        not null,
    file_size     bigint,
    mime_type     text,
    created_at    timestamptz default now()
);

alter table public.documents enable row level security;

-- All authenticated users can read documents
create policy "documents_select_auth" on public.documents
    for select using (auth.role() = 'authenticated');

-- Only whitelisted users can upload (insert) documents
create policy "documents_insert_whitelisted" on public.documents
    for insert with check (
        auth.uid() = uploaded_by
        and exists (
            select 1 from public.whitelist where user_id = auth.uid()
        )
    );


-- ── TRIGGER: auto-create profile on signup ────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, first_name, last_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'first_name', ''),
        coalesce(new.raw_user_meta_data->>'last_name', '')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();


-- ── TRIGGER: auto-update updated_at ──────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
    before update on public.profiles
    for each row execute function public.handle_updated_at();


-- ── STORAGE BUCKET ────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Authenticated users can read any file (download via signed URL)
create policy "storage_select_auth" on storage.objects
    for select to authenticated
    using (bucket_id = 'documents');

-- Authenticated users can upload (whitelist check is enforced at API level)
create policy "storage_insert_auth" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'documents');
