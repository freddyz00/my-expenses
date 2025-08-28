import { Button } from "@/components/ui/button";

export const CATEGORIES_TO_COLOR = {
  Food: "bg-cyan-600",
  Shopping: "bg-violet-600",
  Others: "bg-gray-600",
};

export default function CategoryPicker({ category, setCategory }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {Object.entries(CATEGORIES_TO_COLOR).map(([cat, color]) => {
        const isSelected = category === cat;
        return (
          <Button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 ${
              isSelected ? `${color} text-white` : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat}
          </Button>
        );
      })}
    </div>
  );
}
