import { CATEGORIES } from "@/lib/categories";

export default function CategoryChips({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const selected = value === c.name;
        return (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(c.name)}
            className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium ${
              selected
                ? "border-[#0F172A] bg-[#0F172A] text-white"
                : "border-[#E3E6EB] bg-white text-[#0F172A]"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
