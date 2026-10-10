const GERMAN_CHARACTERS = ["ä", "ö", "ü", "ß"];

export default function GermanCharacterButtons({ onInsert }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        Німецькі літери:
      </span>
      {GERMAN_CHARACTERS.map((character) => (
        <button
          key={character}
          type="button"
          onClick={() => onInsert(character)}
          className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-800/70 text-slate-100 font-bold hover:border-indigo-400 hover:bg-indigo-500/20 transition"
        >
          {character}
        </button>
      ))}
    </div>
  );
}
