"use client";

import { cn } from "@/lib/utils";
import {
  format,
  subDays,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  addDays,
  isSameWeek,
  parseISO,
  startOfMonth,
  endOfMonth,
  getDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { useMemo } from "react";

interface CalendarHeatmapProps {
  data: Record<string, number>;
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  // Generate dates for the last 90 days (13 weeks)
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 90)); // Approx 3 months
  const endDate = today;

  const dates = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate]
  );

  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];

    dates.forEach((date) => {
      if (currentWeek.length > 0 && getDay(date) === 0) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(date);
    });
    if (currentWeek.length > 0) weeksArray.push(currentWeek);
    return weeksArray;
  }, [dates]);

  const months = useMemo(() => {
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: format(firstDay, "MMM"), weekIndex: index });
        lastMonth = month;
      }
    });
    return monthLabels;
  }, [weeks]);

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/40 hover:bg-muted-foreground/20";
    if (count <= 1)
      return "bg-emerald-300 dark:bg-emerald-900/80 hover:ring-2 hover:ring-emerald-500/50";
    if (count <= 2)
      return "bg-emerald-400 dark:bg-emerald-700/80 hover:ring-2 hover:ring-emerald-500/50";
    if (count <= 4)
      return "bg-emerald-500 dark:bg-emerald-500/80 hover:ring-2 hover:ring-emerald-400/50";
    return "bg-emerald-600 dark:bg-emerald-300 hover:ring-2 hover:ring-emerald-400/50";
  };

  // Cell size calculations
  const cellSize = 14;
  const gap = 4;

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-fit flex flex-col gap-2">
        {/* Month Labels */}
        <div className="flex text-xs font-medium text-muted-foreground mb-1 pl-8 relative h-4 select-none">
          {months.map((m, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${m.weekIndex * (cellSize + gap) + 32}px`,
              }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Weekday Labels */}
          <div className="flex flex-col gap-[4px] text-[10px] font-medium text-muted-foreground pt-[18px] pr-2 select-none">
            <span style={{ height: cellSize, lineHeight: `${cellSize}px` }}>
              Mon
            </span>
            <span
              style={{
                height: cellSize,
                lineHeight: `${cellSize}px`,
                marginTop: cellSize + gap,
              }}
            >
              Wed
            </span>
            <span
              style={{
                height: cellSize,
                lineHeight: `${cellSize}px`,
                marginTop: cellSize + gap,
              }}
            >
              Fri
            </span>
          </div>

          {/* Grid */}
          <div className="flex gap-[4px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[4px]">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const date = week[dayIndex];
                  if (!date || date > today) {
                    return (
                      <div
                        key={dayIndex}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    );
                  }

                  const dateStr = format(date, "yyyy-MM-dd");
                  const count = data[dateStr] || 0;

                  return (
                    <TooltipProvider key={dateStr}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            style={{ width: cellSize, height: cellSize }}
                            className={cn(
                              "rounded-sm transition-all duration-200 cursor-default",
                              getIntensity(count)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <span className="font-semibold text-foreground">
                            {count} {count === 1 ? "game" : "games"}
                          </span>{" "}
                          on{" "}
                          <span className="text-muted-foreground">
                            {format(date, "MMM do, yyyy")}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium select-none">
      <span className="hidden sm:inline">Less</span>
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-sm bg-muted/40" />
        <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-900/80" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700/80" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500/80" />
        <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-300" />
      </div>
      <span className="hidden sm:inline">More</span>
    </div>
  );
}
