import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Food", color: "bg-cyan-600 text-white" },
  { name: "Shopping", color: "bg-violet-600 text-white" },
  { name: "Others", color: "bg-gray-600 text-white" },
];

export default function CategoryPicker({ category, setCategory }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {categories.map((cat) => {
        const isSelected = category === cat.name;
        return (
          <Button
            key={cat.name}
            onClick={() => setCategory(cat.name)}
            className={`flex-1 ${
              isSelected ? cat.color : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat.name}
          </Button>
        );
      })}
    </div>
  );
}
