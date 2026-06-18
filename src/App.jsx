import React, { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform
} from "framer-motion";
import {
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
  FileText,
  HeartHandshake,
  Home,
  MessageCircle,
  Minus,
  Search,
  ShieldAlert,
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
  { label: "Профиль", icon: UserRound, screen: "candidate-onboarding" },
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

const detailIcons = [BadgeCheck, FileText, ShieldAlert];

function withDetailIcons(blocks = detailBlocks) {
  return blocks.map((block, index) => ({
    ...block,
    icon: block.icon ?? detailIcons[index] ?? BadgeCheck
  }));
}

async function postJson(path, payload) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    return null;
  }
}

function App() {
  const [screen, setScreen] = useState("welcome");
  const [mode, setMode] = useState("candidate");
  const [backendData, setBackendData] = useState(fallbackData);

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }, [screen]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/bootstrap")
      .then((response) => {
        if (!response.ok) throw new Error(`Bootstrap failed: ${response.status}`);
        return response.json();
      })
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

  const Screen = useMemo(() => {
    const map = {
      welcome: WelcomeScreen,
      role: RoleChoiceScreen,
      "candidate-onboarding": CandidateOnboarding,
      "candidate-home": CandidateHome,
      "match-detail": MatchDetail,
      "employer-brief": EmployerBrief,
      "employer-shortlist": EmployerShortlist,
      "mutual-match": MutualMatch
    };
    return map[screen] ?? WelcomeScreen;
  }, [screen]);

  const showNav = ![
    "welcome",
    "role",
    "candidate-onboarding",
    "employer-brief"
  ].includes(screen);
  const navItems = mode === "employer" ? employerNav : candidateNav;
  const data = useMemo(
    () => ({
      ...backendData,
      detailBlocks: withDetailIcons(backendData.detailBlocks)
    }),
    [backendData]
  );

  const saveCandidateProfile = (payload) =>
    postJson("/api/candidate-profile", payload);
  const saveEmployerBrief = (payload) =>
    postJson("/api/employer-brief", payload);
  const recordDecision = (payload) =>
    postJson("/api/decisions", payload);

  return (
    <main className="app-shell">
      <div className="phone">
        <AppStatus mode={mode} screen={screen} setScreen={setScreen} />
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
              setMode={setMode}
              setScreen={setScreen}
              saveCandidateProfile={saveCandidateProfile}
              saveEmployerBrief={saveEmployerBrief}
              recordDecision={recordDecision}
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

function AppStatus({ mode, screen, setScreen }) {
  const canGoBack = screen !== "welcome";

  return (
    <header className="app-status">
      <button
        className="round-button"
        aria-label={canGoBack ? "Назад" : "На главный экран"}
        onClick={() => {
          if (!canGoBack) return;
          if (screen === "role") setScreen("welcome");
          else if (mode === "employer") setScreen("employer-shortlist");
          else setScreen("candidate-home");
        }}
      >
        {canGoBack ? <ArrowLeft size={19} /> : <Sparkles size={18} />}
      </button>
      <div className="status-copy">
        <span>{mode === "employer" ? "для компаний" : "для специалистов"}</span>
        <strong>Тихий поиск</strong>
      </div>
      <span className="status-pill">без шума</span>
    </header>
  );
}

function WelcomeScreen({ setMode, setScreen }) {
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
            setScreen("candidate-onboarding");
          }}
        >
          Я ищу работу <ArrowRight size={18} />
        </button>
        <button
          className="quiet-cta"
          onClick={() => {
            setMode("employer");
            setScreen("employer-brief");
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

function RoleChoiceScreen({ setMode, setScreen }) {
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
            setScreen("candidate-onboarding");
          }}
        />
        <ChoiceCard
          icon={UsersRound}
          title="Найти человека"
          text="Видеть не поток резюме, а короткий список людей с понятным совпадением."
          onClick={() => {
            setMode("employer");
            setScreen("employer-brief");
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

function CandidateOnboarding({ setScreen, saveCandidateProfile }) {
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
                completed: true,
                stepCount: onboardingSteps.length,
                source: "mobile-onboarding"
              });
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

function CandidateHome({ setScreen, data, recordDecision }) {
  const match = data.candidateMatch;

  return (
    <div className="home-screen">
      <ScreenTitle
        eyebrow="сегодня"
        title={data.stats?.candidateTitle ?? fallbackData.stats.candidateTitle}
        text={match.hidden}
      />

      <CandidateJobCard match={match} />

      <div className="feed-actions sticky-actions inline">
        <button
          className="secondary-cta"
          onClick={() =>
            recordDecision({
              actor: "candidate",
              targetId: match.id,
              action: "pass",
              data: { screen: "candidate-home" }
            })
          }
        >
          <X size={17} />
          Не моё
        </button>
        <button className="main-cta" onClick={() => setScreen("match-detail")}>
          Интересно
          <ArrowRight size={17} />
        </button>
      </div>

      <HiddenReasonCard match={match} />
      <ProfileNudge />
    </div>
  );
}

function CandidateJobCard({ match }) {
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

      <p className="quick-why">
        Почему подходит: {match.why.slice(0, 3).join(", ")}.
      </p>
      <CheckMini title="Что проверить" items={match.checks} />
    </motion.article>
  );
}

function MatchDetail({ setScreen, data, recordDecision }) {
  const [open, setOpen] = useState(0);
  const match = data.candidateMatch;

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

function EmployerBrief({ setScreen, saveEmployerBrief }) {
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
            role: "Продуктовый менеджер роста",
            mission: "Поднять удержание платных пользователей",
            salary: "260-340 тыс. ₽",
            format: "гибрид, Москва"
          });
          setScreen("employer-shortlist");
        }}
      >
        Смотреть кандидатов
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function EmployerShortlist({ setScreen, data, recordDecision }) {
  const candidate = data.employerCandidate;

  return (
    <div className="shortlist-screen">
      <ScreenTitle
        eyebrow="короткий список"
        title={data.stats?.employerTitle ?? fallbackData.stats.employerTitle}
        text={data.stats?.employerHidden ?? fallbackData.stats.employerHidden}
      />

      <article className="match-card employer">
        <div className="card-top">
          <span className="match-badge">{candidate.badge}</span>
          <span className="fit-muted">{candidate.fit}</span>
        </div>
        <h2>{candidate.role}</h2>
        <p className="company-line">{candidate.location}</p>
        <p className="salary-line">{candidate.salary}</p>

        <ReasonBlock title="Почему подходит" items={candidate.why} />
        <ReasonBlock title="Доказательства" items={candidate.proof} />
        <ReasonBlock title="Риски" items={candidate.risks} tone="warm" />

        <div className="card-actions">
          <button
            className="secondary-cta"
            onClick={() =>
              recordDecision({
                actor: "employer",
                targetId: candidate.id,
                action: "pass",
                data: { screen: "employer-shortlist" }
              })
            }
          >
            <Minus size={17} />
            Пропустить
          </button>
          <button
            className="main-cta"
            onClick={() => {
              void recordDecision({
                actor: "employer",
                targetId: candidate.id,
                action: "want_to_talk",
                data: { screen: "employer-shortlist" }
              });
              setScreen("mutual-match");
            }}
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

function MutualMatch({ mode }) {
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

        <div className="meeting-options">
          <button>
            <Clock3 size={18} />
            15 минут знакомства
          </button>
          <button>
            <CalendarClock size={18} />
            Полное интервью
          </button>
          <button>
            <MessageCircle size={18} />
            Сначала задать вопрос
          </button>
        </div>

        <button className="main-cta wide">
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

function HiddenReasonCard({ match }) {
  return (
    <article className="hidden-card">
      <span>Почему мы это скрыли</span>
      <p>{match.hiddenReason}</p>
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

function ProfileNudge() {
  return (
    <article className="nudge-card">
      <span>Что можно улучшить в профиле</span>
      <p>
        Добавь один кейс с цифрами. Тогда мы сможем точнее объяснять компаниям,
        почему тебе стоит написать.
      </p>
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
