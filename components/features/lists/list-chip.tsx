import { cn } from "@/lib/utils";
import { LIST_CARD_STYLES } from "@/lib/constants";
import { Gamepad } from "lucide-react";

export interface ListChipProps {
  label: string;
  count: number;
  color?: string;
  className?: string; // Allow overriding width and other styles
}

export function ListChip({
  label,
  count,
  color = "slate",
  className,
}: ListChipProps) {
  const styles = LIST_CARD_STYLES[color] || LIST_CARD_STYLES["slate"];

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-1.5 rounded-full transition-all border",
        // Default to w-fit, allowing className to override. max-w-full prevents overflow.
        "w-fit max-w-full",
        "hover:bg-opacity-20 cursor-pointer mb-1 last:mb-0",
        styles?.card,
        className
      )}
    >
      <span className="text-body-small font-semibold truncate min-w-0 flex-1">
        {label}
      </span>

      <div className="flex items-center gap-1.5 ml-2 shrink-0">
        <span className="text-body-small font-mono font-bold tabular-nums opacity-80">
          {count}
        </span>
        <Gamepad className="h-3.5 w-3.5 opacity-70" />
      </div>
    </div>
  );
}
