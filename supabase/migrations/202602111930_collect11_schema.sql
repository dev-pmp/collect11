create table if not exists public.shirts (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  club text,
  league text,
  season text,
  brand text,
  size text,
  condition text,
  player_name text,
  player_number integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.shirt_photos (
  id uuid primary key,
  shirt_id uuid not null references public.shirts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.collections (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.collection_items (
  collection_id uuid not null references public.collections(id) on delete cascade,
  shirt_id uuid not null references public.shirts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (collection_id, shirt_id)
);

alter table public.shirts enable row level security;
alter table public.shirt_photos enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

create policy "shirts owner access" on public.shirts for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "photos owner access" on public.shirt_photos for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "collections owner access" on public.collections for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "collection_items owner access" on public.collection_items for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('shirt-photos', 'shirt-photos', false)
on conflict (id) do nothing;

create policy "shirt photos bucket owner read" on storage.objects for select using (
  bucket_id = 'shirt-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "shirt photos bucket owner write" on storage.objects for insert with check (
  bucket_id = 'shirt-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "shirt photos bucket owner update" on storage.objects for update using (
  bucket_id = 'shirt-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "shirt photos bucket owner delete" on storage.objects for delete using (
  bucket_id = 'shirt-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
