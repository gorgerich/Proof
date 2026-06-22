import React, { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform
} from "framer-motion";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  HeartHandshake,
  Home,
  KeyRound,
  LogOut,
  Mail,
  MessageCircle,
  Minus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  WalletCards,
  X
} from "lucide-react";

const candidateMatch = {
  id: "job-product-fintech",
  role: "Продуктовый менеджер",
  company: "Финтех-сервис",
  location: "Москва / гибрид",
  salary: "260-320 тыс. ₽",
  fit: "86% по профилю",
  badge: "Сильное совпадение",
  why: [
    "был опыт с подпиской и ростом выручки",
    "совпадает зарплатная вилка",
    "компания ищет мышление роста"
  ],
  checks: ["офис 2 дня в неделю", "высокая скорость команды"],
  hidden:
    "Ещё 38 вариантов скрыли: не совпали по зарплате, опыту или формату.",
  hiddenReason:
    "Например, одну вакансию не показали: вилка ниже твоих ожиданий, а формат 5/2 в офисе."
};

const employerCandidate = {
  id: "candidate-growth-product",
  role: "Продуктовый менеджер роста",
  location: "Москва / удалённо",
  salary: "280-330 тыс. ₽",
  fit: "82% по задаче",
  badge: "Сильное совпадение",
  why: [
    "запускал платные функции",
    "работал с удержанием",
    "есть опыт B2C"
  ],
  proof: ["3 кейса", "2 рекомендации", "1 продуктовый артефакт"],
  risks: [
    "не работал в вашей индустрии",
    "ожидания у верхней границы вилки"
  ]
};

const onboardingSteps = [
  {
    title: "Кем ты хочешь работать?",
    hint: "Можно выбрать 1-2 направления. Мы не будем распылять выдачу.",
    type: "chips",
    options: ["Продукт", "Проект", "Маркетинг", "UX/UI дизайн", "Операции"]
  },
  {
    title: "Какой формат тебе подходит?",
    hint: "Это сразу убирает шум: офис 5/2 не попадёт в ленту, если ты выбрал удалёнку.",
    type: "chips",
    options: ["Удалёнка", "Гибрид", "Офис 2-3 дня", "Релокация", "Не готов к офису 5/2"]
  },
  {
    title: "Какая зарплата комфортна?",
    hint: "Не максимум для красоты, а честная нижняя граница.",
    type: "salary"
  },
  {
    title: "Что у тебя сильнее всего?",
    hint: "Выбери то, за что тебя реально ценят.",
    type: "chips",
    options: ["Рост продукта", "Запуск с нуля", "Исследования", "Аналитика", "Команда", "Контент"]
  },
  {
    title: "Какие задачи интересны?",
    hint: "Так мы поймём мотивацию, а не только набор навыков.",
    type: "chips",
    options: ["Подписка", "B2C продукт", "Маркетплейс", "CRM", "Автоматизация", "Удержание"]
  },
  {
    title: "Что точно не хочешь?",
    hint: "Это не каприз. Это границы, которые экономят время обеим сторонам.",
    type: "chips",
    options: ["Холодные продажи", "Офис 5/2", "Серый доход", "Микроменеджмент", "Тест на 8 часов"]
  },
  {
    title: "Добавь 1-2 кейса",
    hint: "Не резюме целиком. Только то, чем правда гордишься.",
    type: "cases"
  }
];

const detailBlocks = [
  {
    title: "Совпало",
    icon: BadgeCheck,
    items: [
      "роль и уровень похожи на твой опыт",
      "зарплата попадает в комфортную вилку",
      "формат гибридный, без офиса 5/2",
      "есть задачи с подпиской и ростом"
    ]
  },
  {
    title: "Доказательства",
    icon: FileText,
    items: [
      "в профиле есть кейс про рост активации",
      "был опыт в похожем финтех-продукте",
      "навыки по аналитике совпали с задачей"
    ]
  },
  {
    title: "Стоит проверить",
    icon: ShieldAlert,
    items: [
      "темп команды и ожидания по скорости",
      "как устроена аналитика и доступ к данным",
      "стиль руководителя и зона решений"
    ]
  }
];

const marketRadar = {
  found: 4,
  hidden: 38,
  title: "Сегодня нашли 4 варианта",
  text: "Ещё 38 скрыли: не совпали по зарплате, опыту, формату или доказательствам.",
  savedSearch: ["Продуктовый менеджер", "Удалёнка / гибрид", "260-320 тыс.", "Подписка"],
  nextCheck: "Следующая тихая проверка — завтра утром",
  hiddenReasons: [
    {
      label: "зарплата",
      count: 14,
      text: "вилка ниже твоей границы 260 тыс. ₽"
    },
    {
      label: "формат",
      count: 11,
      text: "компания просила офис чаще, чем тебе подходит"
    },
    {
      label: "задача",
      count: 8,
      text: "не было близкой задачи на первые месяцы"
    },
    {
      label: "доказательства",
      count: 5,
      text: "не хватило явных кейсов под запрос"
    }
  ]
};

const matchDossier = {
  summary:
    "Показали, потому что задача, вилка и формат достаточно близко сошлись с твоими границами.",
  salaryFairness: {
    label: "в рынке",
    text: "вилка 260-340 тыс. пересекается с твоей 260-320 тыс."
  },
  opener:
    "Можно начать с вопроса: как устроены эксперименты и кто принимает решения по росту подписки?",
  fitMap: [
    {
      label: "роль",
      state: "совпало",
      text: "роль близка к продуктовому росту"
    },
    {
      label: "зарплата",
      state: "совпало",
      text: "вилки пересекаются без торга в темноте"
    },
    {
      label: "формат",
      state: "проверить",
      text: "офис 2 дня в неделю лучше уточнить"
    },
    {
      label: "задачи",
      state: "совпало",
      text: "подписка, retention, платные функции"
    },
    {
      label: "риски",
      state: "проверить",
      text: "темп команды, ожидания по аналитике"
    }
  ],
  proof: [
    "Поднял активацию подписки на 18%",
    "Собрал процесс growth-экспериментов",
    "совпали must-have: подписка, аналитика, growth"
  ],
  risks: ["офис 2 дня в неделю", "высокая скорость команды", "ожидания по аналитике"]
};

const evidenceVault = {
  completeness: 84,
  title: "Папка доказательств",
  text: "Здесь не резюме целиком. Только факты, которые помогают объяснить совпадение.",
  items: [
    {
      title: "Поднял активацию подписки на 18%",
      type: "кейс",
      status: "сильное доказательство",
      text: "показывает измеримый результат, а не список обязанностей"
    },
    {
      title: "Собрал процесс growth-экспериментов",
      type: "кейс",
      status: "полезный контекст",
      text: "помогает понять стиль работы и зону силы"
    },
    {
      title: "Навыки: подписка, growth, аналитика, retention",
      type: "навыки",
      status: "можно показать компании",
      text: "совпадает с must-have в брифе"
    }
  ],
  nudges: [
    "Добавь один артефакт: метрика, экран, схема или короткий разбор.",
    "Опиши, что было до и что стало после твоего решения."
  ]
};

const mutualPipeline = [
  { label: "интерес", state: "done", text: "обе стороны сказали да" },
  { label: "вопрос", state: "current", text: "можно уточнить один риск" },
  { label: "15 минут", state: "next", text: "короткое знакомство без интервью на час" },
  { label: "интервью", state: "locked", text: "только если после первого шага всё ок" }
];

const fallbackThread = {
  status: "draft",
  format: "15 минут знакомства",
  question: "Как устроены эксперименты и кто принимает решения по росту продукта?",
  selectedSlot: "завтра, 11:30",
  note: "Можно начать с одного вопроса, без длинного интервью.",
  timeline: [
    {
      title: "взаимный интерес",
      text: "обе стороны хотят поговорить"
    }
  ]
};

const employerFields = [
  "роль",
  "задача на первые 3 месяца",
  "зарплатная вилка",
  "формат",
  "обязательные условия",
  "что точно не подходит",
  "почему сильный кандидат выберет вас"
];

const candidateNav = [
  { label: "Главная", icon: Home, screen: "candidate-home" },
  { label: "Матчи", icon: HeartHandshake, screen: "match-detail" },
  { label: "Профиль", icon: UserRound, screen: "evidence-vault" },
  { label: "Чаты", icon: MessageCircle, screen: "mutual-match" }
];

const employerNav = [
  { label: "Заявки", icon: BriefcaseBusiness, screen: "employer-brief" },
  { label: "Кандидаты", icon: UsersRound, screen: "employer-shortlist" },
  { label: "Матчи", icon: HeartHandshake, screen: "mutual-match" },
  { label: "Чаты", icon: MessageCircle, screen: "mutual-match" }
];

const fallbackData = {
  candidateMatch,
  employerCandidate,
  detailBlocks,
  marketRadar,
  matchDossier,
  evidenceVault,
  mutualPipeline,
  stats: {
    candidateTitle: "Нашли 4 варианта",
    employerTitle: "12 человек подходят под задачу",
    employerHidden:
      "143 профиля скрыли: не совпали по опыту, вилке или формату."
  },
  backend: {
    source: "local",
    database: false
  }
};

const screenNames = new Set([
  "welcome",
  "auth",
  "role",
  "candidate-onboarding",
  "candidate-home",
  "match-detail",
  "evidence-vault",
  "employer-brief",
  "employer-shortlist",
  "mutual-match",
  "admin"
]);

function initialScreen() {
  const requested = new URLSearchParams(window.location.search).get("screen");
  return screenNames.has(requested) ? requested : "welcome";
}

function initialMode() {
  const requested = new URLSearchParams(window.location.search).get("mode");
  return requested === "employer" ? "employer" : "candidate";
}

const detailIcons = [BadgeCheck, FileText, ShieldAlert];

function withDetailIcons(blocks = detailBlocks) {
  return blocks.map((block, index) => ({
    ...block,
    icon: block.icon ?? detailIcons[index] ?? BadgeCheck
  }));
}

async function postJson(path, payload) {
  try {
    return await requestJson(path, {
      method: "POST",
      body: payload
    });
  } catch (error) {
    return null;
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    credentials: "same-origin",
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message ?? data.error ?? `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

const candidateProfilePayload = {
  role: "Продуктовый менеджер",
  desiredRoles: ["Продуктовый менеджер", "Growth Product Manager"],
  location: "Москва",
  formats: ["Удалёнка", "Гибрид"],
  salaryMin: 260,
  salaryMax: 320,
  skills: ["подписка", "growth", "аналитика", "retention", "B2C"],
  tasks: ["Подписка", "B2C продукт", "Удержание", "Growth"],
  avoid: ["Офис 5/2", "Микроменеджмент"],
  cases: [
    "Поднял активацию подписки на 18%",
    "Собрал процесс growth-экспериментов"
  ],
  motivation: ["рост продукта", "понятная зона решений"]
};

const employerBriefPayload = {
  role: "Продуктовый менеджер роста",
  company: "Финтех-сервис",
  location: "Москва / гибрид",
  format: "Гибрид",
  salaryMin: 260,
  salaryMax: 340,
  mission: "Поднять удержание платных пользователей",
  tasks: ["подписка", "retention", "платные функции", "growth"],
  mustHave: ["подписка", "аналитика", "growth", "B2C"],
  reject: ["офис 5/2 без гибкости", "нет работы с данными"],
  risks: ["высокая скорость команды", "офис 2 дня в неделю"],
  sellingPoint:
    "Есть зона решений, доступ к данным и задача с понятным бизнес-эффектом."
};

function App() {
  const [screen, setScreen] = useState(initialScreen);
  const [mode, setMode] = useState(initialMode);
  const [backendData, setBackendData] = useState(fallbackData);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }, [screen]);

  const refreshBootstrap = () =>
    requestJson("/api/bootstrap")
      .then((data) => {
        setBackendData((current) => ({
          ...current,
          ...data
        }));
        return data;
      })
      .catch(() => null);

  useEffect(() => {
    let cancelled = false;

    requestJson("/api/bootstrap")
      .then((data) => {
        if (!cancelled) {
          setBackendData((current) => ({
            ...current,
            ...data
          }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    requestJson("/api/auth/me")
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const Screen = useMemo(() => {
    const map = {
      welcome: WelcomeScreen,
      auth: AuthScreen,
      role: RoleChoiceScreen,
      "candidate-onboarding": CandidateOnboarding,
      "candidate-home": CandidateHome,
      "match-detail": MatchDetail,
      "evidence-vault": EvidenceVaultScreen,
      "employer-brief": EmployerBrief,
      "employer-shortlist": EmployerShortlist,
      "mutual-match": MutualMatch,
      admin: AdminScreen
    };
    return map[screen] ?? WelcomeScreen;
  }, [screen]);

  const showNav = ![
    "welcome",
    "auth",
    "role",
    "candidate-onboarding",
    "employer-brief"
  ].includes(screen);
  const navItems = useMemo(() => {
    const base = mode === "employer" ? employerNav : candidateNav;
    if (user?.role !== "admin") return base;
    return [...base.slice(0, 3), { label: "Админ", icon: Settings, screen: "admin" }];
  }, [mode, user]);
  const data = useMemo(
    () => {
      const selected = selectedMatch
        ? {
            candidateMatch: selectedMatch.candidateMatch ?? selectedMatch,
            employerCandidate: selectedMatch.employerCandidate ?? backendData.employerCandidate,
            detailBlocks: selectedMatch.detailBlocks ?? backendData.detailBlocks,
            matchDossier: selectedMatch.matchDossier ?? backendData.matchDossier,
            evidenceVault: selectedMatch.evidenceVault ?? backendData.evidenceVault,
            mutualPipeline: selectedMatch.mutualPipeline ?? backendData.mutualPipeline
          }
        : {};

      return {
        ...backendData,
        ...selected,
        detailBlocks: withDetailIcons(selected.detailBlocks ?? backendData.detailBlocks)
      };
    },
    [backendData, selectedMatch]
  );

  const saveCandidateProfile = (payload) =>
    postJson("/api/candidate-profile", payload);
  const saveEmployerBrief = (payload) =>
    postJson("/api/employer-brief", payload);
  const recordDecision = (payload) =>
    postJson("/api/decisions", payload);
  const login = (payload) =>
    requestJson("/api/auth/login", { method: "POST", body: payload }).then((result) => {
      setUser(result.user);
      return result.user;
    });
  const register = (payload) =>
    requestJson("/api/auth/register", { method: "POST", body: payload }).then((result) => {
      setUser(result.user);
      return result.user;
    });
  const logout = () =>
    postJson("/api/auth/logout", {}).then(() => {
      setUser(null);
      setScreen("welcome");
    });

  return (
    <main className="app-shell">
      <div className="phone">
        <AppStatus
          mode={mode}
          screen={screen}
          setScreen={setScreen}
          user={user}
          logout={logout}
        />
        <AnimatePresence mode="wait">
          <motion.section
            key={screen}
            className={`screen ${showNav ? "with-nav" : ""}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <Screen
              mode={mode}
              data={data}
              user={user}
              setMode={setMode}
              setScreen={setScreen}
              setSelectedMatch={setSelectedMatch}
              saveCandidateProfile={saveCandidateProfile}
              saveEmployerBrief={saveEmployerBrief}
              recordDecision={recordDecision}
              login={login}
              register={register}
              logout={logout}
              refreshBootstrap={refreshBootstrap}
            />
          </motion.section>
        </AnimatePresence>
        {showNav && (
          <BottomNav
            activeScreen={screen}
            items={navItems}
            setScreen={setScreen}
          />
        )}
      </div>
    </main>
  );
}

function AppStatus({ mode, screen, setScreen, user, logout }) {
  const canGoBack = screen !== "welcome";

  return (
    <header className="app-status">
      <button
        className="round-button"
        aria-label={canGoBack ? "Назад" : "На главный экран"}
        onClick={() => {
          if (!canGoBack) return;
          if (screen === "role") setScreen("welcome");
          else if (screen === "auth") setScreen("welcome");
          else if (screen === "admin") setScreen(mode === "employer" ? "employer-shortlist" : "candidate-home");
          else if (screen === "evidence-vault") setScreen("candidate-home");
          else if (mode === "employer") setScreen("employer-shortlist");
          else setScreen("candidate-home");
        }}
      >
        {canGoBack ? <ArrowLeft size={19} /> : <Sparkles size={18} />}
      </button>
      <div className="status-copy">
        <span>
          {user?.role === "admin"
            ? "админка"
            : mode === "employer"
              ? "для компаний"
              : "для специалистов"}
        </span>
        <strong>{user ? user.displayName || user.email : "Тихий поиск"}</strong>
      </div>
      {user ? (
        <button
          className="status-pill"
          onClick={() => (user.role === "admin" ? setScreen("admin") : logout())}
        >
          {user.role === "admin" ? "админ" : "выйти"}
        </button>
      ) : (
        <button className="status-pill" onClick={() => setScreen("auth")}>
          войти
        </button>
      )}
    </header>
  );
}

function WelcomeScreen({ user, setMode, setScreen }) {
  return (
    <div className="welcome">
      <section className="hero-block">
        <div className="soft-label">взаимный поиск работы</div>
        <h1>Работа без откликов в пустоту</h1>
        <p>
          Мы показываем только те вакансии и кандидатов, где есть понятное
          взаимное совпадение.
        </p>
      </section>

      <div className="welcome-actions">
        <button
          className="main-cta"
          onClick={() => {
            setMode("candidate");
            setScreen(user ? "candidate-onboarding" : "auth");
          }}
        >
          Я ищу работу <ArrowRight size={18} />
        </button>
        <button
          className="quiet-cta"
          onClick={() => {
            setMode("employer");
            setScreen(user ? "employer-brief" : "auth");
          }}
        >
          Я нанимаю <BriefcaseBusiness size={18} />
        </button>
        <button className="text-link" onClick={() => setScreen("role")}>
          Как это работает
        </button>
      </div>

      <div className="promise-stack">
        <PromiseItem title="Без массовых откликов" text="Не надо отправлять резюме всем подряд." />
        <PromiseItem title="С понятными причинами" text="Видно, почему вариант появился." />
        <PromiseItem title="Только взаимный интерес" text="Разговор начинается, когда обеим сторонам ок." />
      </div>
    </div>
  );
}

function RoleChoiceScreen({ user, setMode, setScreen }) {
  return (
    <div className="role-choice">
      <ScreenTitle
        eyebrow="первый шаг"
        title="Что ты хочешь сделать?"
        text="Выбери сторону. Логика одна: меньше шума, больше честных причин."
      />
      <div className="choice-stack">
        <ChoiceCard
          icon={Search}
          title="Найти работу"
          text="Получать только подходящие предложения и понимать, почему они тебе показаны."
          onClick={() => {
            setMode("candidate");
            setScreen(user ? "candidate-onboarding" : "auth");
          }}
        />
        <ChoiceCard
          icon={UsersRound}
          title="Найти человека"
          text="Видеть не поток резюме, а короткий список людей с понятным совпадением."
          onClick={() => {
            setMode("employer");
            setScreen(user ? "employer-brief" : "auth");
          }}
        />
      </div>
      <HumanNote>
        Это не отказ и не рейтинг людей. Мы просто не показываем слабые совпадения,
        чтобы никто не тратил вечер на пустые отклики.
      </HumanNote>
    </div>
  );
}

function AuthScreen({ mode, setMode, setScreen, login, register, refreshBootstrap }) {
  const [authMode, setAuthMode] = useState("register");
  const [accountRole, setAccountRole] = useState(mode);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = async (user) => {
    await refreshBootstrap();
    setMode(accountRole);
    if (user?.role === "admin") {
      setScreen("admin");
      return;
    }
    setScreen(accountRole === "employer" ? "employer-brief" : "candidate-onboarding");
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    try {
      const payload = {
        email,
        password,
        displayName,
        role: accountRole
      };
      const user =
        authMode === "login"
          ? await login({ email, password })
          : await register(payload);
      await finish(user);
    } catch (error) {
      const message =
        error.message === "password_too_short"
          ? "Пароль минимум 8 символов."
          : error.message === "email_taken"
            ? "Такой email уже есть. Попробуй войти."
            : error.message === "invalid_credentials"
              ? "Email или пароль не совпали."
              : "Не получилось войти. Проверь данные.";
      setStatus(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <ScreenTitle
        eyebrow="аккаунт"
        title={authMode === "login" ? "Войти спокойно" : "Создать профиль"}
        text="Нужен аккаунт, чтобы сохранять границы, решения и взаимный интерес."
      />

      <form className="auth-form" onSubmit={submit}>
        <div className="auth-tabs">
          <button
            type="button"
            className={authMode === "register" ? "active" : ""}
            onClick={() => setAuthMode("register")}
          >
            новый
          </button>
          <button
            type="button"
            className={authMode === "login" ? "active" : ""}
            onClick={() => setAuthMode("login")}
          >
            вход
          </button>
        </div>

        <label>
          <span>
            <Mail size={16} />
            email
          </span>
          <input
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {authMode === "register" && (
          <label>
            <span>
              <UserRound size={16} />
              имя
            </span>
            <input
              value={displayName}
              autoComplete="name"
              placeholder="как тебя звать"
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
        )}

        <label>
          <span>
            <KeyRound size={16} />
            пароль
          </span>
          <input
            type="password"
            value={password}
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
            placeholder="минимум 8 символов"
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {authMode === "register" && (
          <div className="role-toggle">
            <button
              type="button"
              className={accountRole === "candidate" ? "active" : ""}
              onClick={() => setAccountRole("candidate")}
            >
              Ищу работу
            </button>
            <button
              type="button"
              className={accountRole === "employer" ? "active" : ""}
              onClick={() => setAccountRole("employer")}
            >
              Нанимаю
            </button>
          </div>
        )}

        {status && <p className="auth-error">{status}</p>}

        <button className="main-cta wide" disabled={busy}>
          {busy ? "проверяем" : authMode === "login" ? "Войти" : "Создать и продолжить"}
          <ArrowRight size={18} />
        </button>
      </form>

      <HumanNote>
        Если админов ещё нет, первый созданный аккаунт получит админ-доступ.
        Дальше новые аккаунты становятся кандидатами или работодателями.
      </HumanNote>
    </div>
  );
}

function CandidateOnboarding({ setScreen, saveCandidateProfile, refreshBootstrap }) {
  const [step, setStep] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(true);
  const current = onboardingSteps[step];
  const progress = ((step + 1) / onboardingSteps.length) * 100;

  return (
    <div className="onboarding">
      <div className="progress-head">
        <span>Настройка помощника</span>
        <strong>{step + 1}/{onboardingSteps.length}</strong>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>

      <ScreenTitle
        eyebrow="без длинной анкеты"
        title={current.title}
        text={current.hint}
      />

      <motion.div
        className="assistant-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        {current.type === "chips" && <ChipPicker options={current.options} />}
        {current.type === "salary" && <SalaryStep />}
        {current.type === "cases" && <CasesStep />}
      </motion.div>

      <button className="sheet-trigger" onClick={() => setSheetOpen(!sheetOpen)}>
        <span>
          <SlidersHorizontal size={18} />
          Почему это важно
        </span>
        <motion.span animate={{ rotate: sheetOpen ? 180 : 0 }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {sheetOpen && (
          <motion.div
            className="bottom-sheet"
            initial={{ opacity: 0, y: 24, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 24, height: 0 }}
          >
            <p>
              Мы будем скрывать варианты, где условия явно расходятся с твоими
              границами. Например: компания просит офис 5/2, а ты выбрал удалёнку.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky-actions inline">
        <button
          className="secondary-cta"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          Назад
        </button>
        <button
          className="main-cta"
          onClick={() => {
            if (step === onboardingSteps.length - 1) {
              void saveCandidateProfile({
                ...candidateProfilePayload,
                completed: true,
                stepCount: onboardingSteps.length,
                source: "mobile-onboarding"
              }).then(refreshBootstrap);
              setScreen("candidate-home");
            } else {
              setStep((value) => value + 1);
            }
          }}
        >
          {step === onboardingSteps.length - 1 ? "К ленте" : "Дальше"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function visibleQueue(items = [], fallback) {
  const list = items.filter((item) => item && item.state !== "passed");
  return list.length ? list : [fallback].filter(Boolean);
}

function nextQueue(current) {
  return current.length > 1 ? current.slice(1) : current;
}

function CandidateHome({ setScreen, data, recordDecision, setSelectedMatch }) {
  const fallbackMatch = data.candidateMatch;
  const [queue, setQueue] = useState(() => [fallbackMatch]);
  const [queueMeta, setQueueMeta] = useState(null);
  const [queueStatus, setQueueStatus] = useState("тихо проверяем рынок");
  const match = queue[0] ?? fallbackMatch;
  const radar = data.marketRadar ?? marketRadar;

  useEffect(() => {
    let cancelled = false;
    requestJson("/api/matches?mode=candidate")
      .then((result) => {
        if (cancelled) return;
        setQueue(visibleQueue(result.matches, fallbackMatch));
        setQueueMeta(result.counts ?? null);
        setQueueStatus(result.backend?.database ? "живая очередь из базы" : "пример очереди");
      })
      .catch(() => {
        if (!cancelled) {
          setQueue([fallbackMatch]);
          setQueueStatus("показываем сохранённый пример");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackMatch.id]);

  const pass = () => {
    void recordDecision({
      actor: "candidate",
      targetId: match.id,
      action: "pass",
      data: { screen: "candidate-home" }
    });
    setQueue((current) => nextQueue(current));
  };

  const openDetail = () => {
    setSelectedMatch(match);
    setScreen("match-detail");
  };

  return (
    <div className="home-screen">
      <ScreenTitle
        eyebrow="сегодня"
        title={radar.title ?? data.stats?.candidateTitle ?? fallbackData.stats.candidateTitle}
        text={radar.text ?? match.hidden}
      />

      <CandidateJobCard
        match={match}
        onPass={pass}
        onInterest={openDetail}
      />

      <QueueStatus
        status={queueStatus}
        counts={queueMeta}
        items={queue.slice(1, 4)}
        onPick={(item) => {
          setSelectedMatch(item);
          setQueue((current) => [item, ...current.filter((next) => next.id !== item.id)]);
        }}
      />

      <SwipeHint />
      <MarketRadar data={radar} />
      <HiddenReasonCard match={match} radar={radar} />
      <ProfileNudge vault={data.evidenceVault ?? evidenceVault} setScreen={setScreen} />
    </div>
  );
}

function CandidateJobCard({ match, onPass, onInterest }) {
  const summary = `${match.why[0]}. ${match.salaryNote ?? "вилка близко"}. Детали ниже.`;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-160, 0, 160], [-4, 0, 4]);
  const rightOpacity = useTransform(x, [30, 130], [0, 1]);
  const leftOpacity = useTransform(x, [-130, -30], [1, 0]);
  const upOpacity = useTransform(y, [-120, -30], [1, 0]);
  const downOpacity = useTransform(y, [30, 120], [0, 1]);

  return (
    <motion.article
      className="match-card"
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      style={{ x, y, rotate }}
      whileTap={{ scale: 0.985 }}
    >
      <motion.span className="swipe-label right" style={{ opacity: rightOpacity }}>
        интересно
      </motion.span>
      <motion.span className="swipe-label left" style={{ opacity: leftOpacity }}>
        не моё
      </motion.span>
      <motion.span className="swipe-label up" style={{ opacity: upOpacity }}>
        подробнее
      </motion.span>
      <motion.span className="swipe-label down" style={{ opacity: downOpacity }}>
        позже
      </motion.span>

      <div className="card-top">
        <span className="match-badge">{match.badge}</span>
        <span className="fit-muted">{match.fit}</span>
      </div>
      <h2>{match.role}</h2>
      <p className="company-line">{match.company} · {match.location}</p>
      <p className="salary-line">{match.salary}</p>

      <section className="why-preview">
        <span>Почему показали</span>
        <p>{summary}</p>
      </section>

      <CheckMini title="Что проверить" items={match.checks} />

      <div className="card-actions candidate-actions">
        <button className="secondary-cta" onClick={onPass}>
          <X size={17} />
          Не моё
        </button>
        <button className="main-cta" onClick={onInterest}>
          Интересно
          <ArrowRight size={17} />
        </button>
      </div>
    </motion.article>
  );
}

function QueueStatus({ status, counts, items, onPick }) {
  return (
    <section className="queue-status">
      <div className="queue-head">
        <span>
          <Activity size={15} />
          очередь
        </span>
        <strong>{status}</strong>
      </div>
      <div className="queue-counts">
        <span>{counts?.visible ?? 1} в работе</span>
        <span>{counts?.waiting ?? 0} ждут ответ</span>
        <span>{counts?.mutual ?? 0} взаимно</span>
      </div>
      {items.length ? (
        <div className="queue-rail">
          {items.map((item) => (
            <button className="queue-chip" key={item.id} onClick={() => onPick(item)}>
              <strong>{item.role}</strong>
              <span>{item.stateLabel ?? item.fit}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="queue-empty">Пока не расширяем список. Лучше меньше, но с понятной причиной.</p>
      )}
    </section>
  );
}

function MatchDetail({ setScreen, data, recordDecision }) {
  const [open, setOpen] = useState(0);
  const match = data.candidateMatch;
  const dossier = data.matchDossier ?? matchDossier;
  const vault = data.evidenceVault ?? evidenceVault;

  return (
    <div className="detail-screen">
      <ScreenTitle
        eyebrow="объяснение"
        title="Почему мы это показали"
        text="Не нужно угадывать. Ниже видно, что совпало, на чём основано совпадение и что лучше обсудить."
      />

      <div className="compact-match">
        <span className="match-badge">Сильное совпадение</span>
        <strong>{match.role}</strong>
        <span>{match.company} · {match.salary}</span>
        <small>{match.fit}</small>
      </div>

      <SalaryFairness data={dossier.salaryFairness} />

      <FitMap items={dossier.fitMap} />

      <EvidenceVaultPreview vault={vault} onClick={() => setScreen("evidence-vault")} />

      <div className="accordion-stack">
        {data.detailBlocks.map((block, index) => {
          const Icon = block.icon;
          const isOpen = open === index;
          return (
            <motion.article className="explain-accordion" layout key={block.title}>
              <button onClick={() => setOpen(isOpen ? -1 : index)}>
                <span>
                  <Icon size={18} />
                  {block.title}
                </span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                  <ChevronDown size={18} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>

      <ConversationOpener text={dossier.opener} />

      <HumanNote>
        Это не гарантия оффера. Это честный повод поговорить без холодного
        отклика и без угадывания, почему тебя заметили.
      </HumanNote>

      <div className="sticky-actions inline">
        <button
          className="secondary-cta"
          onClick={() => {
            void recordDecision({
              actor: "candidate",
              targetId: match.id,
              action: "pass",
              data: { screen: "match-detail" }
            });
            setScreen("candidate-home");
          }}
        >
          Не моё
        </button>
        <button
          className="main-cta"
          onClick={() => {
            void recordDecision({
              actor: "candidate",
              targetId: match.id,
              action: "interested",
              data: { screen: "match-detail" }
            });
            setScreen("mutual-match");
          }}
        >
          Интересно
          <HeartHandshake size={18} />
        </button>
      </div>
    </div>
  );
}

function EmployerBrief({ setScreen, saveEmployerBrief, refreshBootstrap }) {
  return (
    <div className="employer-brief">
      <ScreenTitle
        eyebrow="честный запрос"
        title="Кого ищем?"
        text="Начните не с списка требований, а с задачи, которую человек должен решить за первые 3 месяца."
      />

      <div className="mission-card">
        <span>главный вопрос</span>
        <strong>Какую задачу человек должен решить за первые 3 месяца?</strong>
        <p>
          Например: поднять удержание платных пользователей, собрать процесс
          экспериментов и договориться с аналитикой.
        </p>
      </div>

      <div className="field-stack">
        {employerFields.map((field, index) => (
          <label className="brief-field" key={field}>
            <span>{field}</span>
            <input
              readOnly
              value={index === 2 ? "260-340 тыс. ₽" : index === 3 ? "гибрид, Москва" : ""}
              placeholder="заполнить коротко"
            />
          </label>
        ))}
      </div>

      <HumanNote>
        Сильный кандидат выбирает не только зарплату. Ему важно понять задачу,
        свободу решений и честные ограничения команды.
      </HumanNote>

      <button
        className="main-cta wide"
        onClick={() => {
          void saveEmployerBrief({
            ...employerBriefPayload,
            source: "mobile-brief"
          }).then(refreshBootstrap);
          setScreen("employer-shortlist");
        }}
      >
        Смотреть кандидатов
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function EmployerShortlist({ setScreen, data, recordDecision, setSelectedMatch }) {
  const fallbackCandidate = data.employerCandidate;
  const [queue, setQueue] = useState(() => [fallbackCandidate]);
  const [queueMeta, setQueueMeta] = useState(null);
  const [queueStatus, setQueueStatus] = useState("собираем короткий список");
  const candidate = queue[0] ?? fallbackCandidate;
  const vault = data.evidenceVault ?? evidenceVault;

  useEffect(() => {
    let cancelled = false;
    requestJson("/api/matches?mode=employer")
      .then((result) => {
        if (cancelled) return;
        setQueue(visibleQueue(result.matches, fallbackCandidate));
        setQueueMeta(result.counts ?? null);
        setQueueStatus(result.backend?.database ? "живой shortlist из базы" : "пример shortlist");
      })
      .catch(() => {
        if (!cancelled) {
          setQueue([fallbackCandidate]);
          setQueueStatus("показываем сохранённый пример");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackCandidate.id]);

  const pass = () => {
    void recordDecision({
      actor: "employer",
      targetId: candidate.id,
      action: "pass",
      data: { screen: "employer-shortlist" }
    });
    setQueue((current) => nextQueue(current));
  };

  const wantToTalk = () => {
    setSelectedMatch(candidate);
    void recordDecision({
      actor: "employer",
      targetId: candidate.id,
      action: "want_to_talk",
      data: { screen: "employer-shortlist" }
    });
    setScreen("mutual-match");
  };

  return (
    <div className="shortlist-screen">
      <ScreenTitle
        eyebrow="короткий список"
        title={data.stats?.employerTitle ?? fallbackData.stats.employerTitle}
        text={data.stats?.employerHidden ?? fallbackData.stats.employerHidden}
      />

      <ShortlistContext />

      <QueueStatus
        status={queueStatus}
        counts={queueMeta}
        items={queue.slice(1, 4)}
        onPick={(item) => {
          setSelectedMatch(item);
          setQueue((current) => [item, ...current.filter((next) => next.id !== item.id)]);
        }}
      />

      <article className="match-card employer">
        <div className="card-top">
          <span className="match-badge">{candidate.badge}</span>
          <span className="fit-muted">{candidate.fit}</span>
        </div>
        <h2>{candidate.role}</h2>
        <p className="company-line">{candidate.location}</p>
        <p className="salary-line">{candidate.salary}</p>

        <CandidateEvidenceStrip items={vault.items} />

        <ReasonBlock title="Почему подходит" items={candidate.why} />
        <ReasonBlock title="Доказательства" items={candidate.proof} />
        <ReasonBlock title="Риски" items={candidate.risks} tone="warm" />

        <div className="card-actions">
          <button
            className="secondary-cta"
            onClick={pass}
          >
            <Minus size={17} />
            Пропустить
          </button>
          <button
            className="main-cta"
            onClick={wantToTalk}
          >
            Хочу поговорить
            <MessageCircle size={17} />
          </button>
        </div>
      </article>

      <HumanNote>
        Это не поток резюме. Мы скрыли людей, где уже сейчас виден разрыв по
        вилке, формату или задаче.
      </HumanNote>
    </div>
  );
}

function MutualMatch({ mode, data }) {
  const pipeline = data.mutualPipeline ?? mutualPipeline;
  const matchId = data.candidateMatch?.id ?? data.employerCandidate?.id ?? "local-match";
  const [thread, setThread] = useState(fallbackThread);
  const [threadStatus, setThreadStatus] = useState("готовим спокойный старт");

  useEffect(() => {
    let cancelled = false;
    requestJson(`/api/matches?threadMatchId=${encodeURIComponent(matchId)}`)
      .then((result) => {
        if (cancelled) return;
        setThread(result.thread ?? fallbackThread);
        setThreadStatus(result.stored ? "синхронизировано" : "можно выбрать формат");
      })
      .catch(() => {
        if (!cancelled) setThreadStatus("можно выбрать формат");
      });

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const saveThread = (payload) => {
    const optimistic = {
      ...thread,
      ...payload,
      timeline: [
        ...(thread.timeline ?? []),
        {
          title: payload.status === "question" ? "вопрос готов" : "формат выбран",
          text:
            payload.status === "question"
              ? payload.question
              : `${payload.format ?? thread.format} · ${payload.selectedSlot ?? thread.selectedSlot}`
        }
      ]
    };
    setThread(optimistic);
    setThreadStatus("сохраняем");
    postJson("/api/matches", { type: "thread", matchId, ...payload }).then((result) => {
      if (result?.thread) {
        setThread(result.thread);
        setThreadStatus(result.stored ? "сохранено" : "локально");
      } else {
        setThreadStatus("локально до входа");
      }
    });
  };

  return (
    <div className="mutual-screen">
      <motion.section
        className="mutual-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          boxShadow: [
            "0 18px 60px rgba(0,0,0,0.28)",
            "0 22px 72px rgba(116,240,196,0.18)",
            "0 18px 60px rgba(0,0,0,0.28)"
          ]
        }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <div className="mutual-mark">
          <HeartHandshake size={34} />
        </div>
        <span className="match-badge">взаимно</span>
        <h1>Есть взаимный интерес</h1>
        <p>
          Вы оба хотите поговорить. Теперь можно выбрать удобный формат без
          лишней переписки.
        </p>

        <PipelineSteps items={pipeline} />

        <ThreadComposer
          thread={thread}
          status={threadStatus}
          onChange={saveThread}
        />

        <div className="meeting-options">
          {["15 минут знакомства", "Полное интервью", "Сначала задать вопрос"].map((option) => (
            <button
              className={thread.format === option ? "active" : ""}
              key={option}
              onClick={() =>
                saveThread({
                  format: option,
                  status: option === "Сначала задать вопрос" ? "question" : "planned"
                })
              }
            >
              {option === "15 минут знакомства" && (
            <Clock3 size={18} />
              )}
              {option === "Полное интервью" && (
            <CalendarClock size={18} />
              )}
              {option === "Сначала задать вопрос" && (
            <MessageCircle size={18} />
              )}
              {option}
            </button>
          ))}
        </div>

        <div className="time-slots">
          {["завтра, 11:30", "ср, 16:00", "пт, 12:15"].map((slot) => (
            <button
              className={thread.selectedSlot === slot ? "active" : ""}
              key={slot}
              onClick={() => saveThread({ selectedSlot: slot, status: "planned" })}
            >
              {slot}
            </button>
          ))}
        </div>

        <button
          className="main-cta wide"
          onClick={() => saveThread({ status: "planned" })}
        >
          Выбрать время
          <ArrowRight size={18} />
        </button>
      </motion.section>

      <HumanNote>
        {mode === "employer"
          ? "Кандидат увидит задачу, вилку и честные риски. Так разговор начинается спокойнее."
          : "Компания увидит твои кейсы и границы. Не нужно заново объяснять базовые условия."}
      </HumanNote>
    </div>
  );
}

function ThreadComposer({ thread, status, onChange }) {
  const [question, setQuestion] = useState(thread.question ?? fallbackThread.question);

  useEffect(() => {
    setQuestion(thread.question ?? fallbackThread.question);
  }, [thread.question]);

  return (
    <section className="thread-composer">
      <div className="thread-head">
        <span>
          <MessageCircle size={16} />
          следующий шаг
        </span>
        <strong>{status}</strong>
      </div>

      <label className="question-box">
        <span>вопрос перед звонком</span>
        <textarea
          value={question}
          rows={3}
          onChange={(event) => setQuestion(event.target.value)}
          onBlur={() =>
            onChange({
              question,
              status: "question",
              format: "Сначала задать вопрос"
            })
          }
        />
      </label>

      <div className="thread-summary">
        <span>{thread.format}</span>
        <span>{thread.selectedSlot}</span>
      </div>

      <ThreadTimeline items={thread.timeline ?? []} />
    </section>
  );
}

function ThreadTimeline({ items }) {
  return (
    <div className="thread-timeline">
      {items.slice(-3).map((item, index) => (
        <article key={`${item.title}-${item.at ?? index}`}>
          <span>{item.title}</span>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function EvidenceVaultScreen({ data }) {
  const vault = data.evidenceVault ?? evidenceVault;
  const items = vault.items ?? evidenceVault.items;
  const nudges = vault.nudges ?? evidenceVault.nudges;

  return (
    <div className="evidence-screen">
      <ScreenTitle
        eyebrow="профиль"
        title={vault.title}
        text={vault.text}
      />

      <section className="vault-score">
        <div>
          <span>готовность профиля</span>
          <strong>{vault.completeness}%</strong>
        </div>
        <p>
          Это не рейтинг человека. Это насколько легко объяснить компаниям,
          почему тебя стоит увидеть.
        </p>
        <div className="vault-meter">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${vault.completeness}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </section>

      <div className="evidence-list">
        {items.map((item) => (
          <article className="evidence-item" key={`${item.type}-${item.title}`}>
            <div>
              <span>{item.type}</span>
              <strong>{item.title}</strong>
            </div>
            <em>{item.status}</em>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <section className="nudge-card">
        <span>Что можно улучшить</span>
        <ul className="plain-list">
          {nudges.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <HumanNote>
        Сильный профиль — не длинный профиль. Достаточно 2-3 честных доказательств,
        чтобы матч стал понятнее обеим сторонам.
      </HumanNote>
    </div>
  );
}

function MarketRadar({ data }) {
  const savedSearch = data.savedSearch ?? marketRadar.savedSearch;
  const hiddenReasons = data.hiddenReasons ?? marketRadar.hiddenReasons;

  return (
    <motion.section
      className="radar-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
    >
      <div className="radar-head">
        <span>
          <Activity size={16} />
          тихий радар
        </span>
        <strong>{data.nextCheck}</strong>
      </div>

      <div className="radar-numbers">
        <div>
          <strong>{data.found}</strong>
          <span>показали</span>
        </div>
        <div>
          <strong>{data.hidden}</strong>
          <span>убрали из шума</span>
        </div>
      </div>

      <div className="quiet-tags">
        {savedSearch.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="hidden-reason-grid">
        {hiddenReasons.map((reason) => (
          <article key={reason.label}>
            <strong>{reason.count}</strong>
            <span>{reason.label}</span>
            <p>{reason.text}</p>
          </article>
        ))}
      </div>
    </motion.section>
  );
}

function SalaryFairness({ data }) {
  const value = data ?? matchDossier.salaryFairness;

  return (
    <article className="salary-fairness">
      <div>
        <span>зарплата</span>
        <strong>{value.label}</strong>
      </div>
      <p>{value.text}</p>
    </article>
  );
}

function FitMap({ items }) {
  const list = items ?? matchDossier.fitMap;

  return (
    <section className="fit-map-card">
      <h3>Карта совпадения</h3>
      <div className="fit-map">
        {list.map((item) => (
          <article className={item.state === "совпало" ? "ok" : "check"} key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>{item.state}</strong>
            </div>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EvidenceVaultPreview({ vault, onClick }) {
  const items = vault.items ?? evidenceVault.items;

  return (
    <motion.button
      className="vault-preview"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
    >
      <div>
        <span>доказательства</span>
        <strong>{items.length} факта в профиле</strong>
        <p>{items[0]?.title}</p>
      </div>
      <span className="vault-percent">{vault.completeness}%</span>
    </motion.button>
  );
}

function ConversationOpener({ text }) {
  return (
    <article className="opener-card">
      <span>
        <MessageCircle size={16} />
        спокойный старт
      </span>
      <p>{text ?? matchDossier.opener}</p>
    </article>
  );
}

function PipelineSteps({ items }) {
  return (
    <div className="pipeline-steps">
      {items.map((item) => (
        <article className={`pipeline-step ${item.state}`} key={item.label}>
          <span>{item.label}</span>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function ShortlistContext() {
  return (
    <section className="shortlist-context">
      <span>как собрали список</span>
      <p>
        Сначала убрали профили, где расходятся задача, вилка или формат. Потом
        оставили людей, у которых есть доказательства под первые 3 месяца.
      </p>
    </section>
  );
}

function CandidateEvidenceStrip({ items }) {
  const list = items ?? evidenceVault.items;

  return (
    <section className="candidate-evidence-strip">
      <span>доказательства</span>
      <div>
        {list.slice(0, 3).map((item) => (
          <strong key={item.title}>{item.type}</strong>
        ))}
      </div>
      <p>{list[0]?.title}</p>
    </section>
  );
}

function AdminScreen({ user, logout, refreshBootstrap }) {
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const loadOverview = () =>
    requestJson("/api/admin/overview")
      .then((data) => {
        setOverview(data);
        setStatus("");
        return data;
      })
      .catch((error) => {
        setStatus(error.status === 403 ? "Нет админ-доступа." : "Админка пока недоступна.");
        return null;
      });

  useEffect(() => {
    void loadOverview();
  }, []);

  const recompute = async () => {
    setBusy(true);
    setStatus("");
    try {
      const result = await requestJson("/api/admin/recompute", {
        method: "POST",
        body: {}
      });
      await refreshBootstrap();
      await loadOverview();
      setStatus(`Пересчитали ${result.computed} совпадений.`);
    } catch (error) {
      setStatus("Не получилось пересчитать матчи.");
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="admin-screen">
        <ScreenTitle
          eyebrow="админка"
          title="Сначала войди"
          text="Админ-панель открывается только после входа."
        />
      </div>
    );
  }

  return (
    <div className="admin-screen">
      <ScreenTitle
        eyebrow="операторская"
        title="Что происходит внутри"
        text="Пользователи, профили, брифы, решения и пересчёт совпадений."
      />

      <div className="admin-actions">
        <button className="main-cta" onClick={recompute} disabled={busy}>
          <RefreshCw size={17} />
          {busy ? "считаем" : "Пересчитать"}
        </button>
        <button className="secondary-cta" onClick={logout}>
          <LogOut size={17} />
          Выйти
        </button>
      </div>

      {status && <p className="admin-status">{status}</p>}

      <div className="admin-grid">
        <AdminMetric icon={UserRound} label="аккаунты" value={overview?.counts?.users ?? 0} />
        <AdminMetric icon={FileText} label="профили" value={overview?.counts?.profiles ?? 0} />
        <AdminMetric icon={BriefcaseBusiness} label="брифы" value={overview?.counts?.briefs ?? 0} />
        <AdminMetric icon={HeartHandshake} label="матчи" value={overview?.counts?.matches ?? 0} />
        <AdminMetric icon={MessageCircle} label="диалоги" value={overview?.counts?.threads ?? 0} />
      </div>

      <AdminList
        icon={ShieldCheck}
        title="Топ совпадений"
        items={(overview?.matches ?? []).map((item) => ({
          title: `${item.score}% · ${item.category}`,
          text: `${item.candidate_role ?? "кандидат"} → ${item.brief_role ?? "роль"} · ${item.company ?? "компания"}`
        }))}
      />

      <AdminList
        icon={Activity}
        title="Сводка решений"
        items={(overview?.decisionStats ?? []).map((item) => ({
          title: item.action,
          text: `${item.count} событий`
        }))}
      />

      <AdminList
        icon={MessageCircle}
        title="Диалоги"
        items={(overview?.threads ?? []).map((item) => ({
          title: `${item.status} · ${item.format}`,
          text: `${item.selectedSlot} · ${item.question}`
        }))}
      />

      <AdminList
        icon={Database}
        title="Последние аккаунты"
        items={(overview?.users ?? []).map((item) => ({
          title: item.email,
          text: item.role
        }))}
      />

      <AdminList
        icon={Activity}
        title="Решения"
        items={(overview?.decisions ?? []).map((item) => ({
          title: `${item.actor} · ${item.action}`,
          text: item.target_id
        }))}
      />
    </div>
  );
}

function AdminMetric({ icon: Icon, label, value }) {
  return (
    <article className="admin-metric">
      <Icon size={18} />
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function AdminList({ icon: Icon, title, items }) {
  return (
    <section className="admin-list">
      <h3>
        <Icon size={18} />
        {title}
      </h3>
      {items.length ? (
        items.map((item) => (
          <article key={`${item.title}-${item.text}`}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </article>
        ))
      ) : (
        <p>Пока пусто.</p>
      )}
    </section>
  );
}

function BottomNav({ activeScreen, items, setScreen }) {
  const activeIndex = items.findIndex((item) => item.screen === activeScreen);

  return (
    <nav className="bottom-nav" aria-label="Нижняя навигация">
      {items.map((item, index) => {
        const Icon = item.icon;
        const active = index === activeIndex;
        return (
          <button
            key={item.label}
            className={active ? "active" : ""}
            onClick={() => setScreen(item.screen)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ScreenTitle({ eyebrow, title, text }) {
  return (
    <div className="screen-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function PromiseItem({ title, text }) {
  return (
    <article className="promise-item">
      <span>
        <Check size={16} />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function ChoiceCard({ icon: Icon, title, text, onClick }) {
  return (
    <motion.button
      className="choice-card"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -2 }}
    >
      <span className="choice-icon">
        <Icon size={22} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <ArrowRight size={18} />
    </motion.button>
  );
}

function ChipPicker({ options }) {
  const [selected, setSelected] = useState(options.slice(0, 2));

  return (
    <div className="chip-cloud">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            className={active ? "chip active" : "chip"}
            key={option}
            onClick={() =>
              setSelected((current) =>
                active
                  ? current.filter((item) => item !== option)
                  : [...current, option]
              )
            }
          >
            {active && <Check size={14} />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

function SalaryStep() {
  const [salary, setSalary] = useState(260);

  return (
    <div className="salary-step">
      <div className="salary-value">
        <WalletCards size={22} />
        <span>{salary}-320 тыс. ₽</span>
      </div>
      <input
        aria-label="Комфортная зарплата"
        type="range"
        min="180"
        max="360"
        step="10"
        value={salary}
        onChange={(event) => setSalary(event.target.value)}
      />
      <p>Ниже этой вилки мы будем скрывать предложения, чтобы не тратить твоё время.</p>
    </div>
  );
}

function CasesStep() {
  return (
    <div className="case-stack">
      <article>
        <span>кейс 1</span>
        <strong>Поднял активацию подписки на 18%</strong>
        <p>Коротко: что было, что сделал, какой результат.</p>
      </article>
      <article>
        <span>кейс 2</span>
        <strong>Собрал процесс growth-экспериментов</strong>
        <p>Можно заменить на свой реальный пример позже.</p>
      </article>
    </div>
  );
}

function HiddenReasonCard({ match, radar }) {
  const firstReason = radar.hiddenReasons?.[0] ?? marketRadar.hiddenReasons[0];

  return (
    <article className="hidden-card">
      <span>Почему мы это скрыли</span>
      <p>{firstReason ? `${firstReason.label}: ${firstReason.text}.` : match.hiddenReason}</p>
      <small>Это не отказ. Просто сейчас совпадение слабое.</small>
    </article>
  );
}

function SwipeHint() {
  return (
    <div className="swipe-hint">
      <span>свайпы</span>
      <p>вправо — интересно · влево — не моё · вверх — подробнее · вниз — позже</p>
    </div>
  );
}

function ReasonBlock({ title, items, tone = "default" }) {
  return (
    <section className={`reason-block ${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function CheckMini({ title, items }) {
  return (
    <section className="check-mini">
      <strong>{title}</strong>
      <div>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

function ProfileNudge({ vault, setScreen }) {
  const nudge = vault.nudges?.[0] ?? evidenceVault.nudges[0];

  return (
    <article className="nudge-card">
      <span>Что можно улучшить в профиле</span>
      <p>
        {nudge} Тогда мы сможем точнее объяснять компаниям,
        почему тебе стоит написать.
      </p>
      <button className="mini-link" onClick={() => setScreen("evidence-vault")}>
        Открыть доказательства
        <ArrowRight size={15} />
      </button>
    </article>
  );
}

function HumanNote({ children }) {
  return (
    <div className="human-note">
      <Sparkles size={16} />
      <p>{children}</p>
    </div>
  );
}

export default App;
