import React from "react";
import { Button } from "@/components/ui/button";
import { Utensils, ShoppingBag, MoreHorizontal } from "lucide-react";


export const CATEGORIES_TO_COLOR = {
  Food: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-50",
    text: "text-blue-700",
    textSelected: "text-white",
    border: "border-blue-200",
    icon: Utensils,
    gradient: "from-blue-400 to-blue-600"
  },
  Shopping: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-50",
    text: "text-purple-700",
    textSelected: "text-white",
    border: "border-purple-200",
    icon: ShoppingBag,
    gradient: "from-purple-400 to-purple-600"
  },
  Others: {
    bg: "bg-slate-500",
    bgLight: "bg-slate-50",
    text: "text-slate-700",
    textSelected: "text-white",
    border: "border-slate-200",
    icon: MoreHorizontal,
    gradient: "from-slate-400 to-slate-600"
  },
};

const CategoryPicker = React.memo(function CategoryPicker({ category, setCategory }) {
  return (
    <div className="flex gap-3">
      {Object.entries(CATEGORIES_TO_COLOR).map(([cat, config]) => {
        const isSelected = category === cat;
        const Icon = config.icon;
        
        return (
          <Button
            key={cat}
            onClick={() => setCategory(cat)}
            variant="ghost"
            className={`flex-1 h-16 flex flex-col items-center gap-2 rounded-2xl border-2 transition-all duration-200 ${
              isSelected 
                ? `bg-gradient-to-r ${config.gradient} ${config.textSelected} border-transparent shadow-lg` 
                : `${config.bgLight} ${config.text} ${config.border} active:bg-opacity-80`
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{cat}</span>
          </Button>
        );
      })}
    </div>
  );
});

export default CategoryPicker;
