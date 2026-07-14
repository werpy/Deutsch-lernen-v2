import { useState, useEffect, useMemo, useRef } from "react";
import { verbsData } from "./data";
import { imperativData } from "./imperativData";
import {
  BookOpen,
  Layers,
  CheckSquare,
  Search,
  Award,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Brain,
  PenTool,
  Flame,
  Menu,
  X,
} from "lucide-react";

const combinedVerbsData = verbsData.map((verb) => {
  const impMatch = imperativData.find(
    (imp) => imp.infinitive === verb.infinitive,
  );
  return impMatch
    ? { ...verb, du: impMatch.du, ihr: impMatch.ihr, Sie: impMatch.Sie }
    : verb;
});

// ── Flip Card styles injected once ──────────────────────────────────────────
const flipStyles = `
  .flip-scene {
    perspective: 1000px;
    width: 100%;
  }
  .flip-card {
    position: relative;
    width: 100%;
    transition: transform 0.65s cubic-bezier(.4,0,.2,1);
    transform-style: preserve-3d;
    cursor: pointer;
  }
  .flip-card.flipped {
    transform: rotateY(180deg);
  }
  .flip-front,
  .flip-back {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 1.5rem;
    width: 100%;
  }
  .flip-back {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(180deg);
  }
`;

export default function App() {
  const [activeTab, setActiveTab] = useState("quiz");
  const [menuOpen, setMenuOpen] = useState(false);

  // Quiz states
  const [quizMode, setQuizMode] = useState("choice");
  const [quizType, setQuizType] = useState("all-forms");
  const [questionCount, setQuestionCount] = useState(10);
  const [quizState, setQuizState] = useState("setup");
  const [isCorrectTranslation, setIsCorrectTranslation] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [mistakes, setMistakes] = useState([]);
  const [showTranslation, setShowTranslation] = useState(false);

  const [userWrittenAnswer, setUserWrittenAnswer] = useState("");

  const [impAnswerDu, setImpAnswerDu] = useState("");
  const [impAnswerIhr, setImpAnswerIhr] = useState("");
  const [impAnswerSie, setImpAnswerSie] = useState("");
  const [activeImpField, setActiveImpField] = useState("du");

  const [blitzTaskType, setBlitzTaskType] = useState("classic");
  const [blitzQuestionText, setBlitzQuestionText] = useState("");
  const [blitzCorrectAnswer, setBlitzCorrectAnswer] = useState("");
  const [currentOptions, setCurrentOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  // Flashcard states — окремі для кожної вкладки
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlippedPerfect, setIsFlippedPerfect] = useState(false);

  const [imperativFlashcardIndex, setImperativFlashcardIndex] = useState(0);
  const [isFlippedImperativ, setIsFlippedImperativ] = useState(false);

  // Dictionary states
  const [searchTerm, setSearchTerm] = useState("");

  const inputRef = useRef(null);
  const inputDuRef = useRef(null);
  const menuRef = useRef(null);

  // Скидаємо картку при зміні індексу
  useEffect(() => {
    setIsFlippedPerfect(false);
  }, [flashcardIndex]);

  useEffect(() => {
    setIsFlippedImperativ(false);
  }, [imperativFlashcardIndex]);

  // Закриття меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (quizState === "active" && !hasAnswered) {
      if (quizMode === "write") {
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (quizMode === "imperativ") {
        setTimeout(() => inputDuRef.current?.focus(), 50);
      }
    }
  }, [currentIndex, quizState, quizMode, hasAnswered]);

  const generateAdvancedBlitz = (currentVerb) => {
  const taskTypes = ["classic", "match", "sentence"];
  const chosenType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
  setBlitzTaskType(chosenType);

  // ==================== SENTENCE ====================
  if (chosenType === "sentence") {
    const perfektAuxiliary =
      currentVerb.auxiliary === "sein" ? "bin" : "habe";
    const sentenceTypes = [
      {
        label: "Infinitiv",
        answer: currentVerb.infinitive,
        templates: [
          "Ich versuche, heute zu _____.",
          "Wir planen, zusammen zu _____.",
          "Es ist wichtig, rechtzeitig zu _____.",
          "Ich hoffe, bald zu _____.",
          "Du hast Zeit, jetzt zu _____.",
          "Wir lernen, besser zu _____.",
        ],
        option: (verb) => verb.infinitive,
      },
      {
        label: "Partizip II",
        answer: currentVerb.partizip2,
        templates: [
          `Heute ${perfektAuxiliary} ich schon _____.`,
          `Am Wochenende ${perfektAuxiliary} ich _____.`,
          `In letzter Zeit ${perfektAuxiliary} ich oft _____.`,
          `Gestern ${perfektAuxiliary} ich schließlich _____.`,
          `Diese Woche ${perfektAuxiliary} ich bereits _____.`,
        ],
        option: (verb) => verb.partizip2,
      },
      {
        label: "Hilfsverb im Perfekt",
        answer: perfektAuxiliary,
        templates: [
          `Im Perfekt: Ich _____ heute ${currentVerb.partizip2}.`,
          `Im Perfekt: Gestern _____ ich ${currentVerb.partizip2}.`,
          `Im Perfekt: Diese Woche _____ ich ${currentVerb.partizip2}.`,
        ],
        options: ["habe", "bin", "hatte", "werde"],
      },
    ];

    if (currentVerb.du) {
      sentenceTypes.push({
        label: "Imperativ (du)",
        answer: currentVerb.du,
        templates: [
          "Bitte _____!",
          "_____ bitte langsam!",
          "_____ jetzt!",
          "_____ doch mit uns!",
        ],
        option: (verb) => verb.du,
        eligible: (verb) => verb.du,
      });
    }

    const sentenceType =
      sentenceTypes[Math.floor(Math.random() * sentenceTypes.length)];
    const sentence =
      sentenceType.templates[
        Math.floor(Math.random() * sentenceType.templates.length)
      ];
    const correct = sentenceType.answer;
    const distractors = sentenceType.options
      ? sentenceType.options.filter((option) => option !== correct)
      : combinedVerbsData
          .filter(
            (verb) =>
              verb.infinitive !== currentVerb.infinitive &&
              (!sentenceType.eligible || sentenceType.eligible(verb)),
          )
          .map(sentenceType.option)
          .filter((option) => option && option !== correct)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

    setBlitzQuestionText(
      `Доповніть речення потрібною формою (${sentenceType.label}): ${sentence}`,
    );
    setCurrentOptions([...distractors, correct].sort(() => 0.5 - Math.random()));
    setBlitzCorrectAnswer(correct);
    return;
  }

  // ==================== MATCH ====================
  if (chosenType === "match") {
    const usePartizip = Math.random() > 0.5;
    const targetForm = usePartizip ? currentVerb.partizip2 : currentVerb.prateritum;

    setBlitzQuestionText(
      `Для якої інфінітивної форми це є правильним ${usePartizip ? "Partizip II" : "Präteritum"}: "${targetForm}"?`
    );

    const target = currentVerb.infinitive.toLowerCase();

    // Супер-схожі слова
    const similarVerbs = combinedVerbsData
      .filter((v) => v.infinitive !== currentVerb.infinitive)
      .filter((v) => {
        const b = v.infinitive.toLowerCase();
        const similarity = 
          (target.endsWith(b.slice(-6)) || b.endsWith(target.slice(-6))) || // дуже схожі закінчення
          (Math.abs(target.length - b.length) <= 3) ||
          target.slice(0, 5) === b.slice(0, 5) ||                         // схожий початок
          b.includes(target.slice(2, 6)) || target.includes(b.slice(2, 6));

        return similarity;
      })
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Якщо мало схожих — додаємо найближчі за написанням
    if (similarVerbs.length < 3) {
      const extra = combinedVerbsData
        .filter((v) => v.infinitive !== currentVerb.infinitive && 
                       !similarVerbs.some(s => s.infinitive === v.infinitive))
        .sort((a, b) => {
          const da = Math.abs(a.infinitive.length - target.length);
          const db = Math.abs(b.infinitive.length - target.length);
          return da - db;
        })
        .slice(0, 3 - similarVerbs.length);
      similarVerbs.push(...extra);
    }

    const options = [...similarVerbs.map(v => v.infinitive), currentVerb.infinitive]
      .sort(() => 0.5 - Math.random());

    setCurrentOptions(options);
    setBlitzCorrectAnswer(currentVerb.infinitive);
    return;
  }

  // ==================== CLASSIC ====================
  setBlitzQuestionText("Оберіть правильну комбінацію форм (Präteritum, Partizip II):");
  const correct = `${currentVerb.prateritum}, ${currentVerb.partizip2}`;

  let pool = combinedVerbsData
    .filter((v) => v.infinitive !== currentVerb.infinitive)
    .map((v) => `${v.prateritum}, ${v.partizip2}`)
    .sort((a, b) => Math.abs(a.length - correct.length) - Math.abs(b.length - correct.length));

  const smartDistractors = pool.slice(0, 12).sort(() => 0.5 - Math.random()).slice(0, 3);

  setCurrentOptions([...smartDistractors, correct].sort(() => 0.5 - Math.random()));
  setBlitzCorrectAnswer(correct);
};

  const getCorrectAnswerText = (verb, type) => {
    if (!verb) return "";
    if (type === "translation") return verb.translation;
    if (type === "prateritum") return verb.prateritum;
    if (type === "partizip") return verb.partizip2;
    if (type === "auxiliary") return verb.auxiliary;
    return `${verb.prateritum}, ${verb.partizip2}`;
  };

  const startQuiz = () => {
    if (!combinedVerbsData || combinedVerbsData.length === 0) return;
    let pool = [...combinedVerbsData];
    if (quizMode === "imperativ") pool = pool.filter((v) => v.du);
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(
      0,
      Math.min(questionCount, shuffled.length),
    );
    setQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setMistakes([]);
    setHasAnswered(false);
    setUserWrittenAnswer("");
    setImpAnswerDu("");
    setImpAnswerIhr("");
    setImpAnswerSie("");
    setActiveImpField("du");
    setSelectedOption(null);
    if (quizMode === "choice" && selected.length > 0) {
      generateAdvancedBlitz(selected[0]);
    }
    setQuizState("active");
  };

  const handleChoiceSubmit = (option) => {
    if (hasAnswered) return;
    setSelectedOption(option);
    setHasAnswered(true);
    if (option === blitzCorrectAnswer) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => [...prev, questions[currentIndex]]);
    }
  };

  const handleWrittenSubmit = (forcedAnswer = null) => {
    if (hasAnswered) return;

    const finalAnswer =
      forcedAnswer !== null ? forcedAnswer : userWrittenAnswer;
    if (forcedAnswer === null && !finalAnswer.trim()) return;

    setHasAnswered(true);

    const currentVerb = questions[currentIndex];
    const correct = getCorrectAnswerText(currentVerb, quizType)
      .toLowerCase()
      .trim();
    const user = finalAnswer.toLowerCase().trim();

    let isCorrect = false;

    if (quizType === "all-forms") {
      const normalizedUser = user.replace(/[^a-zäöüß]/g, "");
      const normalizedCorrect = correct.replace(/[^a-zäöüß]/g, "");
      isCorrect = normalizedUser === normalizedCorrect;
    } else if (quizType === "translation") {
      // Більш гнучке порівняння для перекладу
      isCorrect =
        user === correct ||
        currentVerb.translation.toLowerCase().includes(user) ||
        user.includes(currentVerb.translation.toLowerCase());
    } else {
      isCorrect = user === correct;
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (quizType === "translation") setIsCorrectTranslation(true);
    } else {
      setMistakes((prev) => [...prev, currentVerb]);
      if (quizType === "translation") setIsCorrectTranslation(false);
    }
  };

  const handleImperativSubmit = () => {
    if (hasAnswered) return;
    if (!impAnswerDu.trim() || !impAnswerIhr.trim() || !impAnswerSie.trim())
      return;
    setHasAnswered(true);
    const currentVerb = questions[currentIndex];
    const checkDu =
      impAnswerDu.toLowerCase().trim() === currentVerb.du.toLowerCase().trim();
    const checkIhr =
      impAnswerIhr.toLowerCase().trim() ===
      currentVerb.ihr.toLowerCase().trim();
    const checkSie =
      impAnswerSie.toLowerCase().trim() ===
      currentVerb.Sie.toLowerCase().trim();
    if (checkDu && checkIhr && checkSie) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => [...prev, currentVerb]);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setHasAnswered(false);
      setUserWrittenAnswer("");
      setImpAnswerDu("");
      setImpAnswerIhr("");
      setImpAnswerSie("");
      setActiveImpField("du");
      setSelectedOption(null);
      setShowTranslation(false);
      setIsCorrectTranslation(false);
      if (quizMode === "choice") generateAdvancedBlitz(questions[nextIndex]);
    } else {
      setQuizState("results");
    }
  };

  const insertChar = (char) => {
    if (quizMode === "write") {
      setUserWrittenAnswer((p) => p + char);
      setTimeout(() => inputRef.current?.focus(), 10);
    } else if (quizMode === "imperativ") {
      if (activeImpField === "du") setImpAnswerDu((p) => p + char);
      if (activeImpField === "ihr") setImpAnswerIhr((p) => p + char);
      if (activeImpField === "Sie") setImpAnswerSie((p) => p + char);
    }
  };

  const filteredVerbs = useMemo(() => {
    if (!combinedVerbsData) return [];
    return combinedVerbsData.filter(
      (v) =>
        v.infinitive?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.prateritum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.partizip2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.translation?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const filteredImperativVerbs = useMemo(
    () => filteredVerbs.filter((v) => v.du),
    [filteredVerbs],
  );

  const currentFlashcard = combinedVerbsData?.[flashcardIndex];

  const imperativFlashcards = useMemo(
    () => combinedVerbsData.filter((v) => v.du),
    [],
  );
  const currentImperativFlashcard =
    imperativFlashcards?.[imperativFlashcardIndex];

  const navItems = [
    {
      id: "quiz",
      label: "Тест",
      icon: <CheckSquare size={14} />,
      color: "indigo",
    },
    {
      id: "flashcards",
      label: "Картки: Perfect",
      icon: <Layers size={14} />,
      color: "indigo",
    },
    {
      id: "imperativ-flashcards",
      label: "Картки: Imperativ",
      icon: <Flame size={14} />,
      color: "amber",
    },
    {
      id: "list-perfect",
      label: "Словник: Perfect",
      icon: <BookOpen size={14} />,
      color: "indigo",
    },
    {
      id: "list-imperativ",
      label: "Словник: Imperativ",
      icon: <Flame size={14} />,
      color: "amber",
    },
  ];

  const currentNavItem = navItems.find((n) => n.id === activeTab);

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Inject flip card CSS */}
      <style>{flipStyles}</style>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 py-3 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          {/* Logo */}
          <div>
            <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              Нiмецький Тренажер
            </h1>
            <p className="text-slate-400 text-[11px] mt-0.5 hidden sm:block">
              {combinedVerbsData?.length || 0} дiєслiв
            </p>
          </div>

          {/* Current tab label (center, desktop) */}
          <span className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700/60">
            {currentNavItem?.icon}
            {currentNavItem?.label}
          </span>

          {/* Burger button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-700 transition-all duration-200 text-slate-300 hover:text-white"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-14 w-64 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                style={{ animation: "slideDown 0.18s ease" }}
              >
                <style>{`
                  @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
                <div className="p-2 flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const activeClass =
                      item.color === "amber"
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                        : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20";
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                          isActive
                            ? activeClass
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 relative z-10">
        {/* ── TAB: QUIZ ── */}
        {activeTab === "quiz" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {quizState === "setup" && (
              <div className="bg-slate-850/40 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-2xl space-y-6">
                <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-4">
                  Налаштування тренування
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">
                      Формат роботи
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          mode: "choice",
                          icon: <Brain size={16} className="text-indigo-400" />,
                          title: "Розумний Блiц",
                          desc: "Пастки, пошук помилок, швидкий вибiр форм.",
                          border: "indigo",
                        },
                        {
                          mode: "write",
                          icon: <PenTool size={16} className="text-blue-400" />,
                          title: "Суворий диктант",
                          desc: "Ручне введення Prateritum, Partizip II або перекладу.",
                          border: "indigo",
                        },
                        {
                          mode: "imperativ",
                          icon: <Flame size={16} className="text-amber-400" />,
                          title: "Тест: Imperativ",
                          desc: "Комплексна побудова наказового способу для форм du, ihr, Sie.",
                          border: "amber",
                        },
                      ].map(({ mode, icon, title, desc, border }) => (
                        <div
                          key={mode}
                          onClick={() => setQuizMode(mode)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                            quizMode === mode
                              ? border === "amber"
                                ? "border-amber-500 bg-amber-500/10 shadow-lg"
                                : "border-indigo-500 bg-indigo-500/10 shadow-lg"
                              : "border-slate-800 bg-slate-900/40 hover:bg-slate-800/40"
                          }`}
                        >
                          <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                            {icon} {title}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                            {desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {quizMode === "write" && (
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">
                        Контроль знань (Диктант)
                      </label>
                      <select
                        value={quizType}
                        onChange={(e) => setQuizType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-800 font-medium bg-slate-900/80 text-slate-200 focus:border-indigo-500 outline-none cursor-pointer transition text-sm"
                      >
                        <option value="all-forms">
                          Prateritum + Partizip II (Разом)
                        </option>
                        <option value="prateritum">Тiльки Prateritum</option>
                        <option value="partizip">Тiльки Partizip II</option>
                        <option value="auxiliary">
                          Допомiжне дiєслово Perfekt (haben / sein)
                        </option>
                        <option value="translation">
                          Переклад українською
                        </option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">
                      Кiлькiсть дiєслiв
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 20, 35, 100].map((count) => {
                        const maxPool =
                          quizMode === "imperativ"
                            ? imperativData.length
                            : combinedVerbsData.length;
                        const finalCount = count > maxPool ? maxPool : count;
                        return (
                          <button
                            key={count}
                            onClick={() => setQuestionCount(finalCount)}
                            className={`py-2.5 px-2 rounded-xl font-bold border text-xs transition-all ${
                              questionCount === finalCount
                                ? "border-indigo-500 bg-indigo-600 text-white"
                                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60"
                            }`}
                          >
                            {count === 100 ? `Всi (${maxPool})` : finalCount}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-xl shadow-indigo-600/15 transition transform active:scale-[0.98]"
                >
                  Запустити випробування
                </button>
              </div>
            )}

            {quizState === "active" &&
              questions.length > 0 &&
              questions[currentIndex] && (
                <div className="bg-slate-850/40 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-2xl space-y-6">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>
                      Питання {currentIndex + 1} з {questions.length}
                    </span>
                    <span className="text-emerald-400">
                      Результат: {score}/{currentIndex}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-350 ease-out"
                      style={{
                        width: `${(currentIndex / questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="text-center bg-slate-900/60 py-6 px-4 rounded-2xl border border-slate-800/60 shadow-inner space-y-3">
                    <span
                      className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border ${
                        quizMode === "imperativ"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                      }`}
                    >
                      {quizMode === "choice"
                        ? `БЛIЦ: ${blitzTaskType === "sentence" ? "РЕЧЕННЯ" : blitzTaskType.toUpperCase()}`
                        : quizMode === "imperativ"
                          ? "Утворення Imperativ"
                          : "Суворий Диктант"}
                    </span>

                    <h4 className="text-sm font-medium text-slate-300 max-w-md mx-auto">
                      {quizMode === "imperativ"
                        ? "Заповнiть форму наказового способу для трьох осiб:"
                        : quizMode === "choice"
                          ? blitzQuestionText
                          : "Введiть правильну форму дiєслова:"}
                    </h4>

                    {(quizMode !== "choice" || blitzTaskType === "classic") && (
                      <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        {questions[currentIndex].infinitive}
                      </h3>
                    )}

                    {(
                      <p className="text-slate-400 text-xs font-medium">
                        Переклад:{" "}
                        <span
                          className={`
                            text-slate-300 
                            italic 
                            inline-block 
                            transition-all 
                            duration-300 
                            cursor-pointer 
                            select-none
                            ${showTranslation ? "blur-none" : "blur-[6px] hover:blur-[2px]"}
                          `}
                          onClick={() => setShowTranslation((prev) => !prev)}
                        >
                          {questions[currentIndex].translation}
                        </span>
                      </p>
                    )}
                    {(
                      <p className="text-slate-400 text-xs italic font-medium">
                        (Натисніть щоб прибрати блюр)
                      </p>
                    )}
                  </div>

                  {/* БЛІЦ */}
                  {quizMode === "choice" && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentOptions.map((option, i) => {
                        let btnStyle =
                          "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/30";
                        if (hasAnswered) {
                          if (option === blitzCorrectAnswer) {
                            btnStyle =
                              "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold";
                          } else if (option === selectedOption) {
                            btnStyle =
                              "border-rose-500/50 bg-rose-500/10 text-rose-300 line-through";
                          } else {
                            btnStyle =
                              "border-slate-850 bg-slate-900/10 text-slate-500 opacity-40";
                          }
                        }
                        return (
                          <button
                            key={i}
                            disabled={hasAnswered}
                            onClick={() => handleChoiceSubmit(option)}
                            className={`w-full text-left p-4 rounded-xl border font-semibold transition-all duration-200 flex justify-between items-center text-sm ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {hasAnswered && option === blitzCorrectAnswer && (
                              <span className="text-emerald-400 font-black">
                                v
                              </span>
                            )}
                            {hasAnswered &&
                              option === selectedOption &&
                              option !== blitzCorrectAnswer && (
                                <span className="text-rose-400 font-black">
                                  x
                                </span>
                              )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ДИКТАНТ */}
                  {quizMode === "write" && (
                    <div className="space-y-4">
                      <label className="block text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wide">
                        {quizType === "all-forms" &&
                          "Введіть форми через кому (напр: begann, begonnen)"}
                        {quizType === "prateritum" &&
                          "Введіть тільки форму Präteritum"}
                        {quizType === "partizip" &&
                          "Введіть тільки форму Partizip II"}
                        {quizType === "auxiliary" &&
                          "Виберіть haben або sein нижче"}
                        {quizType === "translation" &&
                          "Введіть точний переклад українською"}
                      </label>

                      {quizType === "auxiliary" ? (
                        <div className="grid grid-cols-2 gap-4">
                          {["haben", "sein"].map((aux) => {
                            let btnStyle =
                              "border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/40";
                            if (hasAnswered) {
                              if (aux === questions[currentIndex].auxiliary) {
                                btnStyle =
                                  "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
                              } else if (userWrittenAnswer === aux) {
                                btnStyle =
                                  "border-rose-500 bg-rose-500/20 text-rose-300 line-through";
                              } else {
                                btnStyle =
                                  "border-slate-850 opacity-40 text-slate-600";
                              }
                            }
                            return (
                              <button
                                key={aux}
                                disabled={hasAnswered}
                                onClick={() => handleWrittenSubmit(aux)}
                                className={`p-4 rounded-xl border font-black text-lg uppercase tracking-wider transition-all duration-200 ${btnStyle}`}
                              >
                                {aux}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              ref={inputRef}
                              type="text"
                              value={userWrittenAnswer}
                              disabled={hasAnswered}
                              onChange={(e) =>
                                setUserWrittenAnswer(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleWrittenSubmit()
                              }
                              className={`flex-grow p-4 rounded-xl border bg-slate-900/60 text-base font-medium outline-none transition ${
                                hasAnswered
                                  ? isCorrectTranslation
                                    ? "border-emerald-500 text-emerald-300"
                                    : "border-rose-500 text-rose-300"
                                  : "border-slate-700 focus:border-indigo-500"
                              }`}
                              placeholder="Ваша відповідь..."
                            />
                            {!hasAnswered && (
                              <button
                                onClick={() => handleWrittenSubmit()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 rounded-xl transition"
                              >
                                OK
                              </button>
                            )}
                          </div>

                          {hasAnswered && quizType === "translation" && (
                            <p
                              className={`text-sm font-medium ${isCorrectTranslation ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {isCorrectTranslation
                                ? "✅ Правильно!"
                                : "❌ Неправильно"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* IMPERATIV */}
                  {quizMode === "imperativ" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          {
                            field: "du",
                            label: '1. Особa "du"',
                            color: "emerald",
                            val: impAnswerDu,
                            set: setImpAnswerDu,
                            ref: inputDuRef,
                          },
                          {
                            field: "ihr",
                            label: '2. Особа "ihr"',
                            color: "amber",
                            val: impAnswerIhr,
                            set: setImpAnswerIhr,
                          },
                          {
                            field: "Sie",
                            label: '3. Ввiчлива "Sie"',
                            color: "blue",
                            val: impAnswerSie,
                            set: setImpAnswerSie,
                          },
                        ].map(
                          ({
                            field,
                            label,
                            color,
                            val,
                            set,
                            ref: fieldRef,
                          }) => (
                            <div key={field} className="space-y-1">
                              <label
                                className={`block text-[11px] font-bold uppercase tracking-wide text-${color}-400`}
                              >
                                {label}
                              </label>
                              <input
                                ref={fieldRef}
                                type="text"
                                value={val}
                                disabled={hasAnswered}
                                onFocus={() => setActiveImpField(field)}
                                onChange={(e) => set(e.target.value)}
                                placeholder={
                                  field === "du"
                                    ? "напр: gib / lies"
                                    : field === "ihr"
                                      ? "напр: gebt / lest"
                                      : "напр: geben Sie"
                                }
                                className={`w-full p-3 rounded-xl border bg-slate-900/60 font-mono text-sm outline-none transition ${
                                  hasAnswered
                                    ? val.toLowerCase().trim() ===
                                      questions[currentIndex][field]
                                        .toLowerCase()
                                        .trim()
                                      ? "border-emerald-500/60 text-emerald-300"
                                      : "border-rose-500/60 text-rose-300"
                                    : `border-slate-800 focus:border-amber-500`
                                }`}
                              />
                              {hasAnswered && (
                                <span className="text-[11px] text-slate-400 block pt-0.5">
                                  Правильно:{" "}
                                  <b className={`text-${color}-400 font-mono`}>
                                    {questions[currentIndex][field]}
                                  </b>
                                </span>
                              )}
                            </div>
                          ),
                        )}
                      </div>

                      {!hasAnswered && (
                        <button
                          onClick={handleImperativSubmit}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                        >
                          Перевiрити форми Iмперативу
                        </button>
                      )}
                    </div>
                  )}

                  {/* Keyboard */}
                  {/* Кнопки управління */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    {hasAnswered && (
                      <button
                        onClick={handleNextQuestion}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg transition transform active:scale-[0.99] text-sm"
                      >
                        Наступне дієслово <ArrowRight size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => setQuizState("results")}
                      className="px-6 py-3 bg-rose-600/90 hover:bg-rose-600 text-white font-bold rounded-xl transition text-sm border border-rose-500/30 flex items-center justify-center"
                    >
                      Завершити тест
                    </button>
                  </div>

                  {hasAnswered && quizMode === "write" && (
                    <div className="p-4 rounded-xl border text-center font-bold text-sm bg-slate-950 space-y-1 border-slate-800">
                      <div>
                        Правильнi форми минулого часу:{" "}
                        <span className="underline font-extrabold ml-1 text-indigo-400">
                          ({questions[currentIndex].auxiliary}){" "}
                          {questions[currentIndex].prateritum},{" "}
                          {questions[currentIndex].partizip2}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* RESULTS */}
            {quizState === "results" && (
              <div className="bg-slate-850/40 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                  <Award size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Тестування завершено!
                  </h2>
                  <p className="text-slate-400 font-medium text-xs mt-0.5">
                    Вашi показники у вибраному форматi
                  </p>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-2xl inline-block min-w-[200px] border border-slate-800/60 shadow-inner">
                  <span className="text-4xl font-black text-indigo-400 block my-1">
                    {score} / {questions.length}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    (
                    {questions.length > 0
                      ? Math.round((score / questions.length) * 100)
                      : 0}
                    %)
                  </span>
                </div>

                {mistakes.length > 0 && (
                  <div className="text-left border border-rose-500/10 rounded-xl p-4 bg-rose-500/5 space-y-3">
                    <h3 className="font-extrabold text-rose-300 text-xs flex items-center gap-2 uppercase tracking-wide">
                      <AlertCircle size={15} className="text-rose-400" />
                      Помилки, якi треба повторити (
                      {
                        [
                          ...new Map(
                            mistakes.map((v) => [v.infinitive, v]),
                          ).values(),
                        ].length
                      }
                      ):
                    </h3>
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                      {[
                        ...new Map(
                          mistakes.map((v) => [v.infinitive, v]),
                        ).values(),
                      ].map(
                        (verb, idx) =>
                          verb && (
                            <div
                              key={idx}
                              className="p-3 bg-slate-900/80 border border-slate-800/60 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-sm"
                            >
                              <div>
                                <span className="font-bold text-slate-200 text-sm">
                                  {verb.infinitive}
                                </span>
                                <span className="text-xs text-slate-400 ml-2 italic">
                                  ({verb.translation})
                                </span>
                              </div>
                              <div className="text-[11px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-850 text-amber-400">
                                {verb.du
                                  ? `Imp: ${verb.du} | ${verb.ihr} | ${verb.Sie}`
                                  : `Prat: ${verb.prateritum} | P2: ${verb.partizip2}`}
                              </div>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setQuizState("setup")}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg text-sm"
                >
                  <RotateCcw size={16} /> Почати заново
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: FLASHCARDS PERFECT ── */}
        {activeTab === "flashcards" &&
          combinedVerbsData &&
          currentFlashcard && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Флеш-картки: Perfect
                </h2>
                <p className="text-slate-400 text-xs font-medium">
                  Натиснiть на картку, щоб побачити вiдповiдь
                </p>
              </div>

              {/* Flip card */}
              <div
                className="flip-scene"
                style={{ height: "260px" }}
                onClick={() => setIsFlippedPerfect((f) => !f)}
              >
                <div
                  className={`flip-card ${isFlippedPerfect ? "flipped" : ""}`}
                  style={{ height: "260px" }}
                >
                  {/* FRONT — infinitive */}
                  <div className="flip-front absolute inset-0 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 p-8 text-center shadow-2xl select-none">
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">
                      Infinitiv
                    </span>
                    <h3 className="text-4xl font-black text-white tracking-tight">
                      {currentFlashcard.infinitive}
                    </h3>
                    <p className="text-slate-400 italic text-sm">
                      {currentFlashcard.translation}
                    </p>
                    <span className="text-[10px] text-slate-600 mt-2 uppercase tracking-wider">
                      натиснiть щоб перевернути
                    </span>
                  </div>

                  {/* BACK — forms */}
                  <div className="flip-back absolute inset-0 bg-slate-950 border border-indigo-500/30 flex flex-col items-center justify-center gap-4 p-8 text-center shadow-2xl select-none">
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">
                      {currentFlashcard.infinitive}
                    </span>
                    <div className="space-y-3 w-full">
                      <div>
                        <span className="text-xs text-slate-500 block">
                          Auxiliary
                        </span>
                        <b className="text-blue-400 text-lg uppercase font-black">
                          {currentFlashcard.auxiliary}
                        </b>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">
                          Prateritum
                        </span>
                        <b className="text-emerald-400 text-2xl font-black">
                          {currentFlashcard.prateritum}
                        </b>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">
                          Partizip II
                        </span>
                        <b className="text-amber-400 text-2xl font-black">
                          {currentFlashcard.partizip2}
                        </b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <button
                  onClick={() => {
                    setFlashcardIndex(
                      (p) =>
                        (p - 1 + combinedVerbsData.length) %
                        combinedVerbsData.length,
                    );
                  }}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  Назад
                </button>
                <span className="text-xs text-slate-400">
                  {flashcardIndex + 1} з {combinedVerbsData.length}
                </span>
                <button
                  onClick={() => {
                    setFlashcardIndex(
                      (p) => (p + 1) % combinedVerbsData.length,
                    );
                  }}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  Далi
                </button>
              </div>
            </div>
          )}

        {/* ── TAB: FLASHCARDS IMPERATIV ── */}
        {activeTab === "imperativ-flashcards" && currentImperativFlashcard && (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white">
                Флеш-картки: Imperativ
              </h2>
              <p className="text-slate-400 text-xs">
                Натиснiть на картку, щоб побачити вiдповiдь
              </p>
            </div>

            {/* Flip card */}
            <div
              className="flip-scene"
              style={{ height: "260px" }}
              onClick={() => setIsFlippedImperativ((f) => !f)}
            >
              <div
                className={`flip-card ${isFlippedImperativ ? "flipped" : ""}`}
                style={{ height: "260px" }}
              >
                {/* FRONT */}
                <div className="flip-front absolute inset-0 bg-slate-950 border border-amber-500/20 flex flex-col items-center justify-center gap-3 p-8 text-center shadow-2xl select-none">
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                    Infinitiv
                  </span>
                  <h3 className="text-4xl font-black text-white tracking-tight">
                    {currentImperativFlashcard.infinitive}
                  </h3>
                  <p className="text-slate-400 italic text-sm">
                    {currentImperativFlashcard.translation}
                  </p>
                  <span className="text-[10px] text-slate-600 mt-2 uppercase tracking-wider">
                    натиснiть щоб перевернути
                  </span>
                </div>

                {/* BACK */}
                <div className="flip-back absolute inset-0 bg-slate-950 border border-amber-500/30 flex flex-col items-center justify-center gap-4 p-8 text-center shadow-2xl select-none">
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                    {currentImperativFlashcard.infinitive}
                  </span>
                  <div className="space-y-3 font-mono w-full">
                    <div>
                      <span className="text-xs text-slate-500 block">du</span>
                      <b className="text-emerald-400 text-2xl font-black">
                        {currentImperativFlashcard.du}
                      </b>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">ihr</span>
                      <b className="text-amber-400 text-2xl font-black">
                        {currentImperativFlashcard.ihr}
                      </b>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Sie</span>
                      <b className="text-blue-400 text-2xl font-black">
                        {currentImperativFlashcard.Sie}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <button
                onClick={() =>
                  setImperativFlashcardIndex(
                    (p) =>
                      (p - 1 + imperativFlashcards.length) %
                      imperativFlashcards.length,
                  )
                }
                className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Назад
              </button>
              <span className="text-xs text-slate-400">
                {imperativFlashcardIndex + 1} з {imperativFlashcards.length}
              </span>
              <button
                onClick={() =>
                  setImperativFlashcardIndex(
                    (p) => (p + 1) % imperativFlashcards.length,
                  )
                }
                className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Далi
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: DICTIONARY PERFECT ── */}
        {activeTab === "list-perfect" && (
          <div className="space-y-4">
            <div className="bg-slate-850/40 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Пошук у Perfect..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-slate-200 outline-none focus:border-indigo-500 font-medium placeholder:text-slate-500 transition"
                />
                <Search
                  size={14}
                  className="absolute left-3 top-3 text-slate-500"
                />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/60 py-2 px-4 rounded-xl border border-slate-800 shadow-inner w-full sm:w-auto text-center">
                Знайдено:{" "}
                <span className="text-indigo-400 font-mono font-bold">
                  {filteredVerbs.length}
                </span>
              </div>
            </div>

            <div className="bg-slate-850/40 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Infinitiv</th>
                      <th className="p-4 text-blue-400">Auxiliary</th>
                      <th className="p-4">Prateritum</th>
                      <th className="p-4">Partizip II</th>
                      <th className="p-4">Переклад</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-sm">
                    {filteredVerbs.length > 0 ? (
                      filteredVerbs.map((v, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="p-4 font-bold text-white text-base tracking-tight">
                            {v.infinitive}
                          </td>
                          <td className="p-4 text-blue-400 font-black font-mono uppercase text-xs">
                            <span className="px-2 py-1 rounded bg-blue-500/5 border border-blue-500/10">
                              {v.auxiliary}
                            </span>
                          </td>
                          <td className="p-4 text-emerald-400 font-semibold font-mono">
                            {v.prateritum}
                          </td>
                          <td className="p-4 text-amber-400 font-semibold font-mono">
                            {v.partizip2}
                          </td>
                          <td className="p-4 text-slate-400 font-medium italic">
                            {v.translation}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-slate-500 font-medium text-sm"
                        >
                          Нiчого не знайдено.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: DICTIONARY IMPERATIV ── */}
        {activeTab === "list-imperativ" && (
          <div className="space-y-4">
            <div className="bg-slate-850/40 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Пошук у Imperativ..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-slate-200 outline-none focus:border-amber-500 font-medium placeholder:text-slate-500 transition"
                />
                <Search
                  size={14}
                  className="absolute left-3 top-3 text-slate-500"
                />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/60 py-2 px-4 rounded-xl border border-slate-800 shadow-inner w-full sm:w-auto text-center">
                З формами:{" "}
                <span className="text-amber-400 font-mono font-bold">
                  {filteredImperativVerbs.length}
                </span>
              </div>
            </div>

            <div className="bg-slate-850/40 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Infinitiv</th>
                      <th className="p-4 text-emerald-400">du (ти)</th>
                      <th className="p-4 text-amber-400">ihr (ви)</th>
                      <th className="p-4 text-blue-400">Sie (Ви, ввiчливо)</th>
                      <th className="p-4">Переклад</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-sm">
                    {filteredImperativVerbs.length > 0 ? (
                      filteredImperativVerbs.map((v, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="p-4 font-bold text-white text-base tracking-tight">
                            {v.infinitive}
                          </td>
                          <td className="p-4 text-emerald-400 font-bold font-mono text-sm">
                            {v.du}
                          </td>
                          <td className="p-4 text-amber-400 font-bold font-mono text-sm">
                            {v.ihr}
                          </td>
                          <td className="p-4 text-blue-400 font-bold font-mono text-sm">
                            {v.Sie}
                          </td>
                          <td className="p-4 text-slate-400 font-medium italic">
                            {v.translation}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-slate-500 font-medium text-sm"
                        >
                          Дiєслiв з Imperativ за цим фiльтром не знайдено.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
