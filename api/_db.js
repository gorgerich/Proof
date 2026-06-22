import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { seed, sampleCandidateProfile, sampleHiringBrief } from "./_seed.js";
import {
  buildAppDataFromMatch,
  buildCandidateMatch,
  buildEmployerCandidate,
  normalizeCandidateProfile,
  normalizeHiringBrief,
  pluralRu,
  scoreMatch
} from "./_matcher.js";

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
let schemaReady = false;
let seedReady = false;

export function backendMeta() {
  return {
    database: Boolean(sql),
    source: sql ? "postgres" : "seed"
  };
}

export function hasDatabase() {
  return Boolean(sql);
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function safeRole(role) {
  return ["candidate", "employer"].includes(role) ? role : "candidate";
}

function adminEmailSet() {
  return new Set(
    String(process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean)
  );
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
    create table if not exists proof_users (
      id text primary key,
      email text not null unique,
      password_hash text not null,
      role text not null default 'candidate',
      display_name text not null default '',
      created_at timestamptz not null default now(),
      last_seen_at timestamptz
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
  await sql`alter table proof_profiles add column if not exists user_id text`;
  await sql`alter table proof_profiles add column if not exists status text not null default 'active'`;
  await sql`
    create unique index if not exists proof_profiles_user_kind_idx
    on proof_profiles (user_id, kind)
    where user_id is not null
  `;

  await sql`
    create table if not exists proof_hiring_briefs (
      id text primary key,
      data jsonb not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`alter table proof_hiring_briefs add column if not exists user_id text`;
  await sql`alter table proof_hiring_briefs add column if not exists status text not null default 'active'`;

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
  await sql`alter table proof_decisions add column if not exists user_id text`;

  await sql`
    create table if not exists proof_match_threads (
      id text primary key,
      match_id text not null unique,
      created_by_user_id text,
      status text not null default 'started',
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
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
    )
  `;
  await sql`
    create unique index if not exists proof_matches_pair_idx
    on proof_matches (candidate_profile_id, hiring_brief_id)
  `;
  await sql`
    create table if not exists proof_admin_events (
      id text primary key,
      actor_user_id text,
      event text not null,
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

async function ensureSeedRecords() {
  if (!sql || seedReady) return;
  await ensureSchema();

  await sql`
    insert into proof_profiles (id, kind, user_id, status, data)
    values (
      'seed-candidate-growth',
      'candidate',
      null,
      'active',
      ${JSON.stringify(normalizeCandidateProfile(sampleCandidateProfile))}::jsonb
    )
    on conflict (id) do update set
      data = excluded.data,
      status = 'active'
  `;
  await sql`
    insert into proof_hiring_briefs (id, user_id, status, data)
    values (
      'seed-brief-fintech-growth',
      null,
      'active',
      ${JSON.stringify(normalizeHiringBrief(sampleHiringBrief))}::jsonb
    )
    on conflict (id) do update set
      data = excluded.data,
      status = 'active'
  `;

  seedReady = true;
}

async function countAdmins() {
  await ensureSchema();
  const rows = await sql`select count(*)::int as count from proof_users where role = 'admin'`;
  return rows[0]?.count ?? 0;
}

export async function createUser({ email, passwordHash, displayName = "", role = "candidate" }) {
  if (!sql) {
    throw Object.assign(new Error("database_required"), { statusCode: 503 });
  }

  await ensureSchema();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    throw Object.assign(new Error("email_invalid"), { statusCode: 400 });
  }

  const admins = await countAdmins();
  const configuredAdmins = adminEmailSet();
  const resolvedRole =
    admins === 0 || configuredAdmins.has(normalizedEmail) ? "admin" : safeRole(role);
  const id = randomUUID();

  const rows = await sql`
    insert into proof_users (id, email, password_hash, role, display_name, last_seen_at)
    values (${id}, ${normalizedEmail}, ${passwordHash}, ${resolvedRole}, ${displayName}, now())
    returning id, email, role, display_name, created_at, last_seen_at
  `;

  return rows[0];
}

export async function findUserByEmail(email) {
  if (!sql) return null;
  await ensureSchema();
  const rows = await sql`
    select id, email, password_hash, role, display_name, created_at, last_seen_at
    from proof_users
    where email = ${normalizeEmail(email)}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function findUserById(id) {
  if (!sql || !id) return null;
  await ensureSchema();
  const rows = await sql`
    select id, email, role, display_name, created_at, last_seen_at
    from proof_users
    where id = ${id}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function touchUser(id) {
  if (!sql || !id) return;
  await ensureSchema();
  await sql`update proof_users set last_seen_at = now() where id = ${id}`;
}

export async function logAdminEvent(actorUserId, event, data = {}) {
  if (!sql) return null;
  await ensureSchema();
  const id = randomUUID();
  await sql`
    insert into proof_admin_events (id, actor_user_id, event, data)
    values (${id}, ${actorUserId}, ${event}, ${JSON.stringify(data)}::jsonb)
  `;
  return id;
}

export async function recomputeAllMatches() {
  if (!sql) {
    return { stored: false, computed: 0, backend: backendMeta() };
  }

  await ensureSeedRecords();
  const candidates = await sql`
    select id, data
    from proof_profiles
    where kind = 'candidate' and status = 'active'
  `;
  const briefs = await sql`
    select id, data
    from proof_hiring_briefs
    where status = 'active'
  `;

  let computed = 0;
  for (const candidate of candidates) {
    for (const brief of briefs) {
      const normalizedCandidate = normalizeCandidateProfile(candidate.data);
      const normalizedBrief = normalizeHiringBrief(brief.data);
      const result = scoreMatch(normalizedCandidate, normalizedBrief);
      if (result.score < 50) continue;

      const id = `${candidate.id}__${brief.id}`;
      const snapshot = {
        candidate: normalizedCandidate,
        brief: normalizedBrief,
        detailBlocks: result.detailBlocks
      };

      await sql`
        insert into proof_matches (
          id,
          candidate_profile_id,
          hiring_brief_id,
          score,
          category,
          reasons,
          risks,
          proof_points,
          salary_overlap,
          format_overlap,
          snapshot
        )
        values (
          ${id},
          ${candidate.id},
          ${brief.id},
          ${result.score},
          ${result.category},
          ${JSON.stringify(result.reasons)}::jsonb,
          ${JSON.stringify(result.risks)}::jsonb,
          ${JSON.stringify(result.proof)}::jsonb,
          ${result.salaryOverlap},
          ${result.formatOverlap},
          ${JSON.stringify(snapshot)}::jsonb
        )
        on conflict (candidate_profile_id, hiring_brief_id) do update set
          score = excluded.score,
          category = excluded.category,
          reasons = excluded.reasons,
          risks = excluded.risks,
          proof_points = excluded.proof_points,
          salary_overlap = excluded.salary_overlap,
          format_overlap = excluded.format_overlap,
          snapshot = excluded.snapshot,
          updated_at = now()
      `;
      computed += 1;
    }
  }

  return { stored: true, computed, backend: backendMeta() };
}

async function topMatch() {
  await recomputeAllMatches();
  const rows = await sql`
    select *
    from proof_matches
    order by score desc, updated_at desc
    limit 1
  `;
  if (!rows.length) return null;

  const match = rows[0];
  const candidateRows = await sql`
    select id, data
    from proof_profiles
    where id = ${match.candidate_profile_id}
    limit 1
  `;
  const briefRows = await sql`
    select id, data
    from proof_hiring_briefs
    where id = ${match.hiring_brief_id}
    limit 1
  `;

  return {
    match,
    candidate: candidateRows[0],
    brief: briefRows[0]
  };
}

export async function getBootstrap() {
  if (!sql) {
    return {
      ...seed,
      backend: backendMeta()
    };
  }

  await ensureSeedRecords();
  const rows = await Promise.all([
    topMatch(),
    sql`select count(*)::int as count from proof_hiring_briefs where status = 'active'`,
    sql`select count(*)::int as count from proof_profiles where kind = 'candidate' and status = 'active'`
  ]);
  const top = rows[0];
  const briefCount = rows[1][0]?.count ?? 0;
  const profileCount = rows[2][0]?.count ?? 0;

  return {
    ...buildAppDataFromMatch(top?.match, top?.candidate, top?.brief, {
      found: Math.max(1, briefCount),
      hidden: Math.max(38, briefCount * 9 + 2),
      briefCount: Math.max(1, briefCount),
      profileCount: Math.max(1, profileCount),
      candidateTitle: `Сегодня нашли ${Math.max(1, briefCount)} ${pluralRu(Math.max(1, briefCount), "вариант", "варианта", "вариантов")}`,
      employerTitle: `${Math.max(1, profileCount)} человек подходят под задачу`,
      employerHidden:
        "Слабые совпадения скрыты: не сошлись зарплата, формат, задача или доказательства."
    }),
    backend: backendMeta()
  };
}

export async function saveProfile(kind, data, userId = null) {
  const id = randomUUID();
  const payload =
    kind === "candidate" ? normalizeCandidateProfile(data) : { id, kind, ...data };

  if (!sql) {
    return { id, stored: false, backend: backendMeta() };
  }

  await ensureSchema();
  let rows;
  if (userId) {
    rows = await sql`
      insert into proof_profiles (id, kind, user_id, status, data)
      values (${id}, ${kind}, ${userId}, 'active', ${JSON.stringify(payload)}::jsonb)
      on conflict (user_id, kind) where user_id is not null do update set
        data = excluded.data,
        status = 'active'
      returning id
    `;
  } else {
    rows = await sql`
      insert into proof_profiles (id, kind, user_id, status, data)
      values (${id}, ${kind}, null, 'active', ${JSON.stringify(payload)}::jsonb)
      returning id
    `;
  }

  const result = await recomputeAllMatches();
  return { id: rows[0]?.id ?? id, stored: true, recomputed: result.computed, backend: backendMeta() };
}

export async function saveHiringBrief(data, userId = null) {
  const id = randomUUID();
  const payload = normalizeHiringBrief(data);

  if (!sql) {
    return { id, stored: false, backend: backendMeta() };
  }

  await ensureSchema();
  await sql`
    insert into proof_hiring_briefs (id, user_id, status, data)
    values (${id}, ${userId}, 'active', ${JSON.stringify(payload)}::jsonb)
  `;

  const result = await recomputeAllMatches();
  return { id, stored: true, recomputed: result.computed, backend: backendMeta() };
}

export async function saveDecision({ actor, targetId, action, data = {} }, userId = null) {
  const id = randomUUID();
  const payload = { id, actor, targetId, action, ...data };

  if (!sql) {
    return { id, stored: false, mutual: action !== "pass", backend: backendMeta() };
  }

  await ensureSchema();
  await sql`
    insert into proof_decisions (id, user_id, actor, target_id, action, data)
    values (${id}, ${userId}, ${actor}, ${targetId}, ${action}, ${JSON.stringify(payload)}::jsonb)
  `;

  const opposite =
    actor === "candidate" && action === "interested"
      ? "want_to_talk"
      : actor === "employer" && action === "want_to_talk"
        ? "interested"
        : null;
  const mutualRows = opposite
    ? await sql`
        select id
        from proof_decisions
        where target_id = ${targetId}
          and action = ${opposite}
        limit 1
      `
    : [];

  return {
    id,
    stored: true,
    mutual: Boolean(mutualRows.length) || action !== "pass",
    backend: backendMeta()
  };
}

function defaultThreadData(matchId) {
  return {
    matchId,
    format: "15 минут знакомства",
    question:
      "Как устроены эксперименты и кто принимает решения по росту продукта?",
    selectedSlot: "завтра, 11:30",
    note: "Можно начать с одного вопроса, без длинного интервью.",
    timeline: [
      {
        title: "взаимный интерес",
        text: "обе стороны хотят поговорить",
        at: new Date().toISOString()
      }
    ]
  };
}

function publicThread(row, fallbackMatchId) {
  const data = row?.data ?? defaultThreadData(fallbackMatchId);
  return {
    id: row?.id ?? `local-thread-${fallbackMatchId}`,
    matchId: row?.match_id ?? fallbackMatchId,
    status: row?.status ?? "draft",
    format: data.format,
    question: data.question,
    selectedSlot: data.selectedSlot,
    note: data.note,
    timeline: data.timeline ?? [],
    updatedAt: row?.updated_at ?? null
  };
}

export async function getMatchThread(matchId, userId = null) {
  if (!matchId) {
    const error = new Error("match_id_required");
    error.statusCode = 400;
    throw error;
  }

  if (!sql) {
    return { thread: publicThread(null, matchId), stored: false, backend: backendMeta() };
  }

  await ensureSchema();
  const rows = await sql`
    select *
    from proof_match_threads
    where match_id = ${matchId}
    limit 1
  `;
  if (rows.length) {
    return { thread: publicThread(rows[0], matchId), stored: true, backend: backendMeta() };
  }
  if (!userId) {
    return { thread: publicThread(null, matchId), stored: false, backend: backendMeta() };
  }

  const id = randomUUID();
  const data = defaultThreadData(matchId);
  const inserted = await sql`
    insert into proof_match_threads (id, match_id, created_by_user_id, status, data)
    values (${id}, ${matchId}, ${userId}, 'started', ${JSON.stringify(data)}::jsonb)
    on conflict (match_id) do update set updated_at = now()
    returning *
  `;

  return { thread: publicThread(inserted[0], matchId), stored: true, backend: backendMeta() };
}

export async function saveMatchThread(
  { matchId, format, question, selectedSlot, status = "planned", note },
  userId = null
) {
  if (!matchId) {
    const error = new Error("match_id_required");
    error.statusCode = 400;
    throw error;
  }

  if (!sql) {
    const data = defaultThreadData(matchId);
    return {
      thread: publicThread(
        {
          data: {
            ...data,
            format: format ?? data.format,
            question: question ?? data.question,
            selectedSlot: selectedSlot ?? data.selectedSlot,
            note: note ?? data.note
          },
          status,
          match_id: matchId
        },
        matchId
      ),
      stored: false,
      backend: backendMeta()
    };
  }

  await ensureSchema();
  const current = await getMatchThread(matchId, userId);
  const nextData = {
    ...defaultThreadData(matchId),
    ...current.thread,
    format: format ?? current.thread.format,
    question: question ?? current.thread.question,
    selectedSlot: selectedSlot ?? current.thread.selectedSlot,
    note: note ?? current.thread.note,
    timeline: [
      ...(current.thread.timeline ?? []),
      {
        title: status === "question" ? "вопрос отправлен" : "формат выбран",
        text:
          status === "question"
            ? question ?? current.thread.question
            : `${format ?? current.thread.format} · ${selectedSlot ?? current.thread.selectedSlot}`,
        at: new Date().toISOString()
      }
    ]
  };
  const rows = await sql`
    update proof_match_threads
    set
      status = ${status},
      data = ${JSON.stringify(nextData)}::jsonb,
      updated_at = now()
    where match_id = ${matchId}
    returning *
  `;

  return { thread: publicThread(rows[0], matchId), stored: true, backend: backendMeta() };
}

function seedMatchItem(mode = "candidate") {
  const base = mode === "employer" ? seed.employerCandidate : seed.candidateMatch;
  return {
    ...base,
    id: base.id,
    state: "new",
    stateLabel: "новое",
    viewerAction: null,
    mutual: false,
    candidateMatch: seed.candidateMatch,
    employerCandidate: seed.employerCandidate,
    detailBlocks: seed.detailBlocks,
    matchDossier: seed.matchDossier,
    evidenceVault: seed.evidenceVault,
    mutualPipeline: seed.mutualPipeline
  };
}

function latestDecisionMap(rows = []) {
  const map = new Map();
  for (const row of rows) {
    const key = `${row.target_id}:${row.actor}`;
    if (!map.has(key)) map.set(key, row);
  }
  return map;
}

function stateForDecision({ viewerAction, candidateAction, employerAction }) {
  if (viewerAction === "pass") {
    return { state: "passed", stateLabel: "скрыто" };
  }
  if (candidateAction === "interested" && employerAction === "want_to_talk") {
    return { state: "mutual", stateLabel: "взаимно" };
  }
  if (viewerAction === "interested" || viewerAction === "want_to_talk") {
    return { state: "waiting", stateLabel: "ждём вторую сторону" };
  }
  return { state: "new", stateLabel: "новое" };
}

function countStates(items = []) {
  return items.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.state] = (acc[item.state] ?? 0) + 1;
      if (item.state !== "passed") acc.visible += 1;
      return acc;
    },
    { total: 0, visible: 0, new: 0, waiting: 0, mutual: 0, passed: 0 }
  );
}

export async function getMatches(mode = "candidate", userId = null) {
  const safeMode = mode === "employer" ? "employer" : "candidate";
  if (!sql) {
    const item = seedMatchItem(safeMode);
    return {
      matches: [item],
      counts: countStates([item]),
      mode: safeMode,
      backend: backendMeta()
    };
  }

  await recomputeAllMatches();
  const rows = await sql`
    select
      proof_matches.*,
      proof_profiles.data as candidate_data,
      proof_hiring_briefs.data as brief_data
    from proof_matches
    join proof_profiles on proof_profiles.id = proof_matches.candidate_profile_id
    join proof_hiring_briefs on proof_hiring_briefs.id = proof_matches.hiring_brief_id
    order by score desc, updated_at desc
    limit 20
  `;
  const targetIds = rows.map((row) => row.id);
  const decisionRows = targetIds.length
    ? await sql`
        select distinct on (target_id, actor)
          target_id,
          actor,
          action,
          user_id,
          created_at
        from proof_decisions
        where target_id = any(${targetIds})
        order by target_id, actor, created_at desc
      `
    : [];
  const viewerRows =
    userId && targetIds.length
      ? await sql`
          select distinct on (target_id, actor)
            target_id,
            actor,
            action,
            user_id,
            created_at
          from proof_decisions
          where target_id = any(${targetIds})
            and user_id = ${userId}
          order by target_id, actor, created_at desc
        `
      : [];
  const globalDecisions = latestDecisionMap(decisionRows);
  const viewerDecisions = latestDecisionMap(viewerRows);
  const actor = safeMode === "employer" ? "employer" : "candidate";

  const matches = rows.map((row) => {
    const candidate = normalizeCandidateProfile(row.candidate_data);
    const brief = normalizeHiringBrief(row.brief_data);
    const match = {
      id: row.id,
      score: row.score,
      reasons: row.reasons ?? [],
      proof: row.proof_points ?? [],
      risks: row.risks ?? []
    };
    const appData = buildAppDataFromMatch(
      row,
      { id: row.candidate_profile_id, data: candidate },
      { id: row.hiring_brief_id, data: brief },
      { found: rows.length, hidden: Math.max(12, rows.length * 7) }
    );
    const candidateAction = globalDecisions.get(`${row.id}:candidate`)?.action ?? null;
    const employerAction = globalDecisions.get(`${row.id}:employer`)?.action ?? null;
    const viewerAction = userId ? viewerDecisions.get(`${row.id}:${actor}`)?.action ?? null : null;
    const state = stateForDecision({ viewerAction, candidateAction, employerAction });
    const card =
      safeMode === "employer"
        ? buildEmployerCandidate(match, candidate)
        : buildCandidateMatch(match, candidate, brief);

    return {
      ...card,
      ...state,
      viewerAction,
      candidateAction,
      employerAction,
      mutual: state.state === "mutual",
      updatedAt: row.updated_at,
      candidateProfileId: row.candidate_profile_id,
      hiringBriefId: row.hiring_brief_id,
      candidateMatch: appData.candidateMatch,
      employerCandidate: appData.employerCandidate,
      detailBlocks: appData.detailBlocks,
      matchDossier: appData.matchDossier,
      evidenceVault: appData.evidenceVault,
      mutualPipeline: appData.mutualPipeline
    };
  });

  return {
    matches,
    counts: countStates(matches),
    mode: safeMode,
    backend: backendMeta()
  };
}

export async function getAdminOverview() {
  if (!sql) {
    return { backend: backendMeta(), counts: {}, users: [], matches: [], decisions: [] };
  }

  await ensureSeedRecords();
  const [
    users,
    profiles,
    briefs,
    matches,
    decisions,
    recentUsers,
    recentMatches,
    recentDecisions,
    recentThreads,
    decisionStats,
    threads
  ] =
    await Promise.all([
      sql`select count(*)::int as count from proof_users`,
      sql`select count(*)::int as count from proof_profiles`,
      sql`select count(*)::int as count from proof_hiring_briefs`,
      sql`select count(*)::int as count from proof_matches`,
      sql`select count(*)::int as count from proof_decisions`,
      sql`
        select id, email, role, display_name, created_at, last_seen_at
        from proof_users
        order by created_at desc
        limit 8
      `,
      sql`
        select
          proof_matches.id,
          proof_matches.score,
          proof_matches.category,
          proof_matches.candidate_profile_id,
          proof_matches.hiring_brief_id,
          proof_matches.updated_at,
          proof_profiles.data->>'role' as candidate_role,
          proof_hiring_briefs.data->>'role' as brief_role,
          proof_hiring_briefs.data->>'company' as company
        from proof_matches
        join proof_profiles on proof_profiles.id = proof_matches.candidate_profile_id
        join proof_hiring_briefs on proof_hiring_briefs.id = proof_matches.hiring_brief_id
        order by proof_matches.score desc, proof_matches.updated_at desc
        limit 8
      `,
      sql`
        select id, actor, action, target_id, created_at
        from proof_decisions
        order by created_at desc
        limit 8
      `,
      sql`
        select id, match_id, status, data, updated_at
        from proof_match_threads
        order by updated_at desc
        limit 8
      `,
      sql`
        select action, count(*)::int as count
        from proof_decisions
        group by action
        order by count desc
      `,
      sql`select count(*)::int as count from proof_match_threads`
    ]);

  return {
    backend: backendMeta(),
    counts: {
      users: users[0]?.count ?? 0,
      profiles: profiles[0]?.count ?? 0,
      briefs: briefs[0]?.count ?? 0,
      matches: matches[0]?.count ?? 0,
      decisions: decisions[0]?.count ?? 0,
      threads: threads[0]?.count ?? 0
    },
    users: recentUsers,
    matches: recentMatches,
    decisions: recentDecisions,
    threads: recentThreads.map((item) => publicThread(item, item.match_id)),
    decisionStats
  };
}
