"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { type GameList } from "@/lib/use-lists";
import { Tag, Library, Trophy, Dices, Gamepad, Globe } from "lucide-react";
import { TOPIC_COLORS, LIST_CARD_STYLES } from "@/lib/constants";
import { DlesSelect } from "@/components/design/dles-select";
import { cn } from "@/lib/utils";
import { ListChip } from "@/components/features/lists/list-chip";

export const SYSTEM_TEMPLATES = [
  {
    id: "sys-words",
    name: "Words",
    topic: "words",
    icon: Tag,
    count: 5,
    description: "5 random word games",
  },
  {
    id: "sys-logic",
    name: "Logic",
    topic: "logic",
    icon: Library,
    count: 5,
    description: "5 random logic games",
  },
  {
    id: "sys-trivia",
    name: "Trivia",
    topic: "trivia",
    icon: Trophy,
    count: 5,
    description: "5 random trivia games",
  },
  {
    id: "sys-geography",
    name: "Geography",
    topic: "geography",
    icon: Globe,
    count: 5,
    description: "5 random geography games",
  },
];

interface RaceSetupFormProps {
  name: string;
  onNameChange: (value: string) => void;
  guestName: string;
  onGuestNameChange: (value: string) => void;
  isGuest: boolean;
  lists: GameList[];
  onTemplateSelect: (id: string) => void;
  onRandomSelect: (count: number) => void;
  onManualSelect: () => void;
  onStepFocus: () => void;
}

export function RaceSetupForm({
  name,
  onNameChange,
  guestName,
  onGuestNameChange,
  isGuest,
  lists,
  onTemplateSelect,
  onRandomSelect,
}: RaceSetupFormProps) {
  return (
    <section className="space-y-8">
      {/* Race Details */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="raceName"
            className="text-micro text-muted-foreground/70 pl-0.5"
          >
            Race Name
          </label>
          <Input
            id="raceName"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="dles.fun race"
            className="h-10 text-sm font-medium bg-muted/40 border-border/40 focus:border-primary/50 focus:bg-background transition-all"
          />
        </div>

        {isGuest && (
          <div className="space-y-2">
            <label
              htmlFor="guestName"
              className="text-micro text-muted-foreground/70 pl-0.5"
            >
              Your Name
            </label>
            <Input
              id="guestName"
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
              placeholder="Enter your name"
              className="h-10 text-sm font-medium bg-muted/40 border-border/40 focus:border-primary/50 focus:bg-background transition-all"
            />
          </div>
        )}
      </div>

      {/* Quick Start Section */}
      <div className="space-y-3">
        <h2 className="text-micro text-muted-foreground/70 pl-0.5 flex items-center gap-2">
          Quick Start — Presets
        </h2>
        <TooltipProvider delayDuration={300}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Random buttons */}
            {[3, 5, 10, 15].map((count) => (
              <Tooltip key={count}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onRandomSelect(count)}
                    className="group relative flex flex-col items-center justify-center gap-3 p-4 h-24 rounded-xl border border-border/40 bg-card/50 hover:bg-muted/50 hover:border-border transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Dices className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-body-small font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                      {count} Random
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {count} random games from any category
                </TooltipContent>
              </Tooltip>
            ))}

            {SYSTEM_TEMPLATES.map((t) => {
              const topicStyle =
                TOPIC_COLORS[t.topic] ||
                "bg-muted/5 border-muted/20 text-muted-foreground";
              // topicStyle includes bg-*-500/5, border-*-500/20, text-*-700
              // We want to apply border and bg to the card, and text to the icon/label?
              // The constant string is: "bg-X/5 border-X/20 text-X ..."

              return (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onTemplateSelect(t.id)}
                      className={cn(
                        "group relative flex flex-col items-center justify-center gap-3 p-4 h-24 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                        topicStyle, // Applies bg, border, text color base
                        "hover:border-primary/40" // Override on hover? Or keep theme border?
                      )}
                    >
                      <div
                        className={cn(
                          "relative h-8 w-8 rounded-full flex items-center justify-center shadow-sm bg-background/80"
                        )}
                      >
                        <t.icon className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="relative text-body-small font-bold uppercase tracking-wider opacity-80 group-hover:opacity-100">
                        {t.name}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs font-medium">
                    {t.description}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Your Lists */}
        {lists.length > 0 && (
          <div className="pt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center mb-4">
                <span className="bg-background px-4 text-micro text-muted-foreground/60">
                  Or choose a list
                </span>
              </div>
            </div>

            <DlesSelect
              value=""
              onChange={(val) => onTemplateSelect(val as string)}
              options={lists.map((l) => ({ value: l.id, label: l.name }))}
              placeholder="Select games from a list..."
              contentClassName="p-2"
              renderOption={(option) => {
                const list = lists.find((l) => l.id === option.value);
                const color = list?.color || "slate";

                return (
                  <ListChip
                    label={option.label}
                    count={list?.gameCount || 0}
                    color={color}
                    className="w-full"
                  />
                );
              }}
              renderSelected={(option) => {
                const list = lists.find((l) => l.id === option.value);
                if (!list) return <span>{option.label}</span>;

                const color = list.color || "slate";
                const styles = LIST_CARD_STYLES[color];

                return (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-0.5 rounded-full border text-xs font-medium",
                      styles?.card
                    )}
                  >
                    <span>{list.name}</span>
                    <span className="flex items-center gap-1 opacity-80 border-l border-current pl-2 ml-1">
                      {list.gameCount} <Gamepad className="h-3 w-3" />
                    </span>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
