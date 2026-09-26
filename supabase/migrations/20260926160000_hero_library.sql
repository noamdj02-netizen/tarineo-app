-- Bibliothèque de heros : métadonnées + URLs d'aperçu. Prompts et code vivent aussi dans le repo.

create table if not exists public.hero_library (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  nom                text not null,
  categorie          text not null,
  tags               text[] not null default '{}',
  niveau             text not null,
  stack              text[] not null default '{}',
  apercu_video_url   text,
  apercu_poster_url  text,
  prompt_template    text not null default '',
  variables          jsonb not null default '[]',
  code_reference     text not null default '',
  acces              text not null default 'gratuit' check (acces in ('gratuit', 'pro')),
  created_at         timestamptz not null default now()
);

create index if not exists hero_library_cat_idx on public.hero_library (categorie, niveau);

alter table public.hero_library enable row level security;

drop policy if exists "hero_library_read" on public.hero_library;
create policy "hero_library_read"
  on public.hero_library for select
  to authenticated
  using (true);

insert into public.hero_library (slug, nom, categorie, tags, niveau, stack, acces)
values
  ('anneau-de-verre', 'Anneau de verre', '3d', '{verre,tore,souris,luxe}', 'moyen', '{three,@react-three/fiber,@react-three/drei,framer-motion}', 'gratuit'),
  ('produit-scroll', 'Produit qui tourne au scroll', '3d', '{scroll,produit,pin,story}', 'avance', '{three,@react-three/fiber,@react-three/drei,gsap}', 'pro'),
  ('globe-points', 'Globe en points', '3d', '{globe,réseau,arcs,international}', 'avance', '{three,@react-three/fiber,@react-three/drei}', 'pro'),
  ('ruban-soie', 'Ruban de soie', 'shaders', '{shader,tissu,bruit,grain}', 'moyen', '{three,@react-three/fiber}', 'gratuit'),
  ('lignes-topographiques', 'Lignes topographiques', 'shaders', '{data,carte,isolignes,sobre}', 'moyen', '{three,@react-three/fiber}', 'pro'),
  ('goutte-liquide', 'Goutte liquide', 'shaders', '{metaball,liquide,sdf,curseur}', 'avance', '{three,@react-three/fiber}', 'pro'),
  ('poussiere-logo', 'Poussière qui forme le logo', 'particules', '{particules,logo,texte,survol}', 'avance', '{three,@react-three/fiber}', 'pro'),
  ('constellation-connectee', 'Constellation connectée', 'particules', '{réseau,IA,communauté,lignes}', 'facile', '{framer-motion}', 'gratuit'),
  ('video-dans-le-titre', 'Vidéo dans le titre', 'video', '{masque,vidéo,scroll,typo}', 'moyen', '{gsap,framer-motion}', 'pro'),
  ('video-titre-decoupe', 'Vidéo plein écran, titre découpé', 'video', '{split,overlay,scroll-hint}', 'facile', '{framer-motion}', 'gratuit'),
  ('captures-empilees', 'Captures empilées en profondeur', 'ui', '{saas,dashboard,parallaxe,css-3d}', 'moyen', '{framer-motion}', 'gratuit'),
  ('terminal-qui-construit', 'Terminal qui construit la page', 'ui', '{cli,devtool,api,typewriter}', 'facile', '{framer-motion}', 'pro')
on conflict (slug) do nothing;
