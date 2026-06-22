import { seed } from "./_seed.js";

const strongThreshold = 82;
const talkThreshold = 68;

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function lowerSet(items) {
  return new Set(
    asArray(items).map((item) => item.toLowerCase().replaceAll("ё", "е"))
  );
}

function overlap(left, right) {
  const leftSet = lowerSet(left);
  const rightSet = lowerSet(right);
  return [...leftSet].filter((item) => rightSet.has(item));
}

function salaryOverlap(candidate, brief) {
  const candidateMin = toNumber(candidate.salaryMin, 0);
  const candidateMax = toNumber(candidate.salaryMax, candidateMin || 0);
  const briefMin = toNumber(brief.salaryMin, 0);
  const briefMax = toNumber(brief.salaryMax, briefMin || 0);

  if (!candidateMin || !briefMin) return true;
  return candidateMin <= briefMax && candidateMax >= briefMin;
}

function formatOverlap(candidate, brief) {
  const formats = lowerSet(candidate.formats);
  const briefFormat = String(brief.format ?? "").toLowerCase().replaceAll("ё", "е");
  if (!formats.size || !briefFormat) return true;
  return [...formats].some((format) => briefFormat.includes(format));
}

function categoryFor(score) {
  if (score >= strongThreshold) return "Сильное совпадение";
  if (score >= talkThreshold) return "Есть смысл поговорить";
  return "Нужно проверить";
}

function fitLabel(score, mode = "profile") {
  return `${score}% ${mode === "task" ? "по задаче" : "по профилю"}`;
}

function salaryRange(left, right) {
  return `${left}-${right} тыс. ₽`;
}

function matchResult(match, candidate, brief) {
  const computed = scoreMatch(candidate, brief);
  return {
    ...computed,
    ...match,
    score: match.score ?? computed.score,
    reasons: match.reasons?.length ? match.reasons : computed.reasons,
    proof: match.proof?.length ? match.proof : computed.proof,
    risks: match.risks?.length ? match.risks : computed.risks
  };
}

function buildMarketRadar(candidate, brief, result, stats = {}) {
  const found = stats.found ?? stats.briefCount ?? 4;
  const hidden = stats.hidden ?? Math.max(38, found * 9 + 2);

  return {
    found,
    hidden,
    title: `Сегодня нашли ${found} варианта`,
    text: `Ещё ${hidden} скрыли: не совпали по зарплате, опыту, формату или доказательствам.`,
    savedSearch: [
      candidate.role,
      candidate.formats.slice(0, 2).join(" / "),
      salaryRange(candidate.salaryMin, candidate.salaryMax),
      candidate.tasks[0] ?? "задачи роста"
    ],
    nextCheck: "Следующая тихая проверка — завтра утром",
    hiddenReasons: [
      {
        label: "зарплата",
        count: Math.ceil(hidden * 0.36),
        text: `вилка ниже твоей границы ${candidate.salaryMin} тыс. ₽`
      },
      {
        label: "формат",
        count: Math.ceil(hidden * 0.28),
        text: candidate.formats.includes("Удалёнка")
          ? "компания просила офис чаще, чем тебе подходит"
          : "условия работы надо сверить заранее"
      },
      {
        label: "задача",
        count: Math.ceil(hidden * 0.22),
        text: "не было близкой задачи на первые месяцы"
      },
      {
        label: "доказательства",
        count: Math.max(1, hidden - Math.ceil(hidden * 0.86)),
        text: result.proof.length
          ? "не хватило явных кейсов под запрос"
          : "профиль пока не объяснял силу кандидата"
      }
    ]
  };
}

function buildMatchDossier(result, candidate, brief) {
  return {
    summary:
      "Показали, потому что задача, вилка и формат достаточно близко сошлись с твоими границами.",
    salaryFairness: {
      label: result.salaryOverlap ? "в рынке" : "нужно сверить",
      text: result.salaryOverlap
        ? `вилка ${salaryRange(brief.salaryMin, brief.salaryMax)} пересекается с твоей ${salaryRange(candidate.salaryMin, candidate.salaryMax)}`
        : `компания указала ${salaryRange(brief.salaryMin, brief.salaryMax)}, а твоя граница ${candidate.salaryMin} тыс. ₽`
    },
    opener:
      "Можно начать с вопроса: как устроены эксперименты и кто принимает решения по росту подписки?",
    fitMap: [
      {
        label: "роль",
        state: "совпало",
        text: `${brief.role} близко к твоему направлению: ${candidate.role}`
      },
      {
        label: "зарплата",
        state: result.salaryOverlap ? "совпало" : "проверить",
        text: result.salaryOverlap
          ? "вилки пересекаются без торга в темноте"
          : "лучше обсудить вилку до звонка"
      },
      {
        label: "формат",
        state: result.formatOverlap ? "совпало" : "проверить",
        text: result.formatOverlap
          ? `${brief.format} не конфликтует с твоими границами`
          : `${brief.format} может не подойти`
      },
      {
        label: "задачи",
        state: "совпало",
        text: brief.tasks.slice(0, 3).join(", ")
      },
      {
        label: "риски",
        state: "проверить",
        text: result.risks.slice(0, 2).join(", ")
      }
    ],
    proof: result.proof.slice(0, 4),
    risks: result.risks.slice(0, 4)
  };
}

function buildEvidenceVault(candidate, result) {
  const caseItems = candidate.cases.slice(0, 2).map((item, index) => ({
    title: item,
    type: "кейс",
    status: index === 0 ? "сильное доказательство" : "полезный контекст",
    text:
      index === 0
        ? "показывает измеримый результат, а не список обязанностей"
        : "помогает понять стиль работы и зону силы"
  }));

  return {
    completeness: Math.min(92, 54 + caseItems.length * 14 + Math.min(candidate.skills.length, 5) * 2),
    title: "Папка доказательств",
    text: "Здесь не резюме целиком. Только факты, которые помогают объяснить совпадение.",
    items: [
      ...caseItems,
      {
        title: `Навыки: ${candidate.skills.slice(0, 4).join(", ")}`,
        type: "навыки",
        status: "можно показать компании",
        text: result.proof[2] ?? "совпадает с частью must-have"
      }
    ],
    nudges: [
      "Добавь один артефакт: метрика, экран, схема или короткий разбор.",
      "Опиши, что было до и что стало после твоего решения."
    ]
  };
}

function buildMutualPipeline() {
  return [
    { label: "интерес", state: "done", text: "обе стороны сказали да" },
    { label: "вопрос", state: "current", text: "можно уточнить один риск" },
    { label: "15 минут", state: "next", text: "короткое знакомство без интервью на час" },
    { label: "интервью", state: "locked", text: "только если после первого шага всё ок" }
  ];
}

export function normalizeCandidateProfile(data = {}) {
  return {
    role: data.role ?? "Продуктовый менеджер",
    desiredRoles: asArray(data.desiredRoles ?? data.roles ?? data.role ?? "Продуктовый менеджер"),
    location: data.location ?? "Москва",
    formats: asArray(data.formats ?? data.format ?? ["Удалёнка", "Гибрид"]),
    salaryMin: toNumber(data.salaryMin, 260),
    salaryMax: toNumber(data.salaryMax, 320),
    skills: asArray(data.skills ?? ["подписка", "growth", "аналитика", "retention", "B2C"]),
    tasks: asArray(data.tasks ?? ["Подписка", "B2C продукт", "Удержание", "Growth"]),
    avoid: asArray(data.avoid ?? ["Офис 5/2", "Микроменеджмент"]),
    cases: asArray(
      data.cases ?? [
        "Поднял активацию подписки на 18%",
        "Собрал процесс growth-экспериментов"
      ]
    ),
    motivation: asArray(data.motivation ?? ["рост продукта", "понятная зона решений"])
  };
}

export function normalizeHiringBrief(data = {}) {
  return {
    role: data.role ?? "Продуктовый менеджер роста",
    company: data.company ?? "Финтех-сервис",
    location: data.location ?? "Москва / гибрид",
    format: data.format ?? "Гибрид",
    salaryMin: toNumber(data.salaryMin, 260),
    salaryMax: toNumber(data.salaryMax, 340),
    mission: data.mission ?? "Поднять удержание платных пользователей",
    tasks: asArray(data.tasks ?? ["подписка", "retention", "платные функции", "growth"]),
    mustHave: asArray(data.mustHave ?? ["подписка", "аналитика", "growth", "B2C"]),
    reject: asArray(data.reject ?? ["офис 5/2 без гибкости", "нет работы с данными"]),
    risks: asArray(data.risks ?? ["высокая скорость команды", "офис 2 дня в неделю"]),
    sellingPoint:
      data.sellingPoint ??
      "Есть зона решений, доступ к данным и задача с понятным бизнес-эффектом."
  };
}

export function scoreMatch(candidateInput, briefInput) {
  const candidate = normalizeCandidateProfile(candidateInput);
  const brief = normalizeHiringBrief(briefInput);
  const roleHits = overlap(candidate.desiredRoles, [brief.role]);
  const skillHits = overlap(candidate.skills, brief.mustHave);
  const taskHits = overlap(candidate.tasks, brief.tasks);
  const motivationHits = overlap(candidate.motivation, [brief.mission, brief.sellingPoint]);
  const salaryOk = salaryOverlap(candidate, brief);
  const formatOk = formatOverlap(candidate, brief);

  let score = 36;
  if (roleHits.length) score += 16;
  score += Math.min(skillHits.length, 3) * 8;
  score += Math.min(taskHits.length, 3) * 7;
  if (salaryOk) score += 14;
  if (formatOk) score += 12;
  if (candidate.cases.length) score += 7;
  if (motivationHits.length) score += 4;

  const risks = [];
  if (!salaryOk) risks.push("зарплатная вилка расходится с ожиданиями");
  if (!formatOk) risks.push("формат работы нужно отдельно сверить");
  if (overlap(candidate.avoid, brief.reject).length) risks.push("есть пересечение с тем, что кандидат не хочет");
  risks.push(...brief.risks.slice(0, 2));

  score = Math.max(42, Math.min(96, score - Math.max(0, risks.length - 2) * 3));

  const why = [
    roleHits.length ? "роль похожа на желаемое направление" : "роль близка, но уровень нужно уточнить",
    skillHits.length
      ? `совпали навыки: ${skillHits.slice(0, 3).join(", ")}`
      : "по навыкам есть частичное совпадение",
    taskHits.length
      ? `есть опыт с задачами: ${taskHits.slice(0, 3).join(", ")}`
      : "задачи похожи по типу продукта",
    salaryOk ? "зарплатная вилка пересекается" : "зарплату нужно проверить",
    formatOk ? "формат работы подходит" : "формат может не подойти"
  ];

  const proof = [
    ...candidate.cases.slice(0, 2),
    skillHits.length ? `совпали must-have: ${skillHits.slice(0, 3).join(", ")}` : "есть базовые смежные навыки"
  ];

  const checks = risks.length
    ? risks.slice(0, 3)
    : ["темп команды", "ожидания по аналитике", "стиль руководителя"];

  return {
    score,
    category: categoryFor(score),
    salaryOverlap: salaryOk,
    formatOverlap: formatOk,
    reasons: why,
    proof,
    risks: checks,
    detailBlocks: [
      { title: "Совпало", items: why.slice(0, 4) },
      { title: "Доказательства", items: proof.slice(0, 4) },
      { title: "Стоит проверить", items: checks.slice(0, 4) }
    ]
  };
}

export function buildCandidateMatch(match, candidate, brief) {
  const result = matchResult(match, candidate, brief);

  return {
    id: match.id,
    role: brief.role,
    company: brief.company,
    location: brief.location,
    salary: salaryRange(brief.salaryMin, brief.salaryMax),
    fit: fitLabel(result.score),
    badge: categoryFor(result.score),
    why: result.reasons.slice(0, 3),
    checks: result.risks.slice(0, 3),
    salaryNote: result.salaryOverlap ? "вилка пересекается" : "зарплату нужно сверить",
    hidden:
      "Часть вариантов скрыта: не совпали по зарплате, формату, задачам или доказательствам.",
    hiddenReason:
      "Например, вакансия не попадёт в ленту, если вилка ниже ожиданий или нужен офис 5/2."
  };
}

export function buildEmployerCandidate(match, candidate) {
  const score = match.score ?? scoreMatch(candidate, {}).score;
  const result = match.reasons ? match : scoreMatch(candidate, {});

  return {
    id: match.id,
    role: candidate.role,
    location: `${candidate.location} / ${candidate.formats[0] ?? "формат гибкий"}`,
    salary: salaryRange(candidate.salaryMin, candidate.salaryMax),
    fit: fitLabel(score, "task"),
    badge: categoryFor(score),
    why: result.reasons.slice(0, 3),
    proof: result.proof.slice(0, 3),
    risks: result.risks.slice(0, 3)
  };
}

export function buildAppDataFromMatch(matchRow, candidateRow, briefRow, stats = {}) {
  if (!matchRow || !candidateRow || !briefRow) return seed;

  const candidate = normalizeCandidateProfile(candidateRow.data);
  const brief = normalizeHiringBrief(briefRow.data);
  const match = {
    id: matchRow.id,
    score: matchRow.score,
    reasons: matchRow.reasons ?? [],
    proof: matchRow.proof_points ?? [],
    risks: matchRow.risks ?? []
  };
  const result = matchResult(match, candidate, brief);

  return {
    candidateMatch: buildCandidateMatch(match, candidate, brief),
    employerCandidate: buildEmployerCandidate(match, candidate),
    detailBlocks: matchRow.snapshot?.detailBlocks ?? result.detailBlocks,
    marketRadar: buildMarketRadar(candidate, brief, result, stats),
    matchDossier: buildMatchDossier(result, candidate, brief),
    evidenceVault: buildEvidenceVault(candidate, result),
    mutualPipeline: buildMutualPipeline(),
    stats: {
      candidateTitle: stats.candidateTitle ?? `Сегодня нашли ${stats.found ?? 4} варианта`,
      employerTitle: stats.employerTitle ?? "Есть короткий список людей под задачу",
      employerHidden:
        stats.employerHidden ??
        "Часть профилей скрыта: не совпали по опыту, вилке или формату."
    }
  };
}
