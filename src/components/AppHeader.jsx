import { BookOpen, CheckSquare, Flame, Layers, Menu, X } from "lucide-react";

const navigationItems = [
  { id: "quiz", label: "Тест", icon: <CheckSquare size={14} />, color: "indigo" },
  { id: "flashcards", label: "Картки: Perfekt", icon: <Layers size={14} />, color: "indigo" },
  { id: "imperativ-flashcards", label: "Картки: Imperativ", icon: <Flame size={14} />, color: "amber" },
  { id: "list-perfect", label: "Словник: Perfekt", icon: <BookOpen size={14} />, color: "indigo" },
  { id: "list-imperativ", label: "Словник: Imperativ", icon: <BookOpen size={14} />, color: "amber" },
];

export default function AppHeader({
  activeTab,
  verbCount,
  menuOpen,
  menuRef,
  onMenuToggle,
  onNavigate,
}) {
  const currentItem = navigationItems.find((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 py-3 px-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
            Німецький тренажер
          </h1>
          <p className="text-slate-400 text-[11px] mt-0.5 hidden sm:block">
            {verbCount} дієслів
          </p>
        </div>

        <span className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700/60">
          {currentItem?.icon}
          {currentItem?.label}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={onMenuToggle}
            aria-label="Відкрити навігацію"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-700 transition-all duration-200 text-slate-300 hover:text-white"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-14 w-64 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="p-2 flex flex-col gap-1">
                {navigationItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const activeClass = item.color === "amber"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20";

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${isActive ? activeClass : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"}`}
                    >
                      {item.icon}
                      {item.label}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
