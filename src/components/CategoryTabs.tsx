import { cn } from "@/lib/utils";
import { CATEGORIES, type Category } from "@/types/shorts";

interface CategoryTabsProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="scrollbar-none mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 py-2.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              "flex-shrink-0 rounded-full border px-[18px] py-[7px] text-sm font-medium transition-all whitespace-nowrap",
              active === cat
                ? "border-[#e8453c] bg-[#e8453c] text-white"
                : "border-border text-muted-foreground hover:border-[#e8453c] hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
