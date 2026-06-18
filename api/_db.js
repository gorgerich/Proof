import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { seed } from "./_seed.js";

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
let schemaReady = false;

export function backendMeta() {
  return {
    database: Boolean(sql),
    source: sql ? "postgres" : "seed"
  };
}

async function ensureSchema() {
  if (!sql || schemaReady) return;

  await sql`
    create table if not exists proof_state (
      key text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists proof_profiles (
      id text primary key,
      kind text not null,
      data jsonb not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists proof_hiring_briefs (
      id text primary key,
      data jsonb not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists proof_decisions (
      id text primary key,
      actor text not null,
      target_id text not null,
      action text not null,
      data jsonb not null,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    insert into proof_state (key, data)
    values ('bootstrap', ${JSON.stringify(seed)}::jsonb)
    on conflict (key) do nothing
  `;

  schemaReady = true;
}

export async function getBootstrap() {
  if (!sql) {
    return {
      ...seed,
      backend: backendMeta()
    };
  }

  await ensureSchema();
  const rows = await sql`
    select data
    from proof_state
    where key = 'bootstrap'
    limit 1
  `;

  return {
    ...(rows[0]?.data ?? seed),
    backend: backendMeta()
  };
}

export async function saveProfile(kind, data) {
  const id = randomUUID();
  const payload = { id, kind, ...data };

  if (!sql) {
    return { id, stored: false, backend: backendMeta() };
  }

  await ensureSchema();
  await sql`
    insert into proof_profiles (id, kind, data)
    values (${id}, ${kind}, ${JSON.stringify(payload)}::jsonb)
  `;

  return { id, stored: true, backend: backendMeta() };
}

export async function saveHiringBrief(data) {
  const id = randomUUID();
  const payload = { id, ...data };

  if (!sql) {
    return { id, stored: false, backend: backendMeta() };
  }

  await ensureSchema();
  await sql`
    insert into proof_hiring_briefs (id, data)
    values (${id}, ${JSON.stringify(payload)}::jsonb)
  `;

  return { id, stored: true, backend: backendMeta() };
}

export async function saveDecision({ actor, targetId, action, data = {} }) {
  const id = randomUUID();
  const payload = { id, actor, targetId, action, ...data };

  if (!sql) {
    return { id, stored: false, mutual: action !== "pass", backend: backendMeta() };
  }

  await ensureSchema();
  await sql`
    insert into proof_decisions (id, actor, target_id, action, data)
    values (${id}, ${actor}, ${targetId}, ${action}, ${JSON.stringify(payload)}::jsonb)
  `;

  return { id, stored: true, mutual: action !== "pass", backend: backendMeta() };
}
