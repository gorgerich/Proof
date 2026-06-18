create table if not exists proof_state (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists proof_users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  role text not null default 'candidate',
  display_name text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists proof_profiles (
  id text primary key,
  kind text not null,
  user_id text,
  status text not null default 'active',
  data jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists proof_profiles_user_kind_idx
on proof_profiles (user_id, kind)
where user_id is not null;

create table if not exists proof_hiring_briefs (
  id text primary key,
  user_id text,
  status text not null default 'active',
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists proof_decisions (
  id text primary key,
  user_id text,
  actor text not null,
  target_id text not null,
  action text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists proof_matches (
  id text primary key,
  candidate_profile_id text not null,
  hiring_brief_id text not null,
  score integer not null,
  category text not null,
  reasons jsonb not null,
  risks jsonb not null,
  proof_points jsonb not null,
  salary_overlap boolean not null default false,
  format_overlap boolean not null default false,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists proof_matches_pair_idx
on proof_matches (candidate_profile_id, hiring_brief_id);

create table if not exists proof_admin_events (
  id text primary key,
  actor_user_id text,
  event text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
