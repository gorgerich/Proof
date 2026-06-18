create table if not exists proof_state (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists proof_profiles (
  id text primary key,
  kind text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists proof_hiring_briefs (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists proof_decisions (
  id text primary key,
  actor text not null,
  target_id text not null,
  action text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
