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
import { DlesBadge } from "@/components/design/dles-badge";

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
  selectedListId?: string;
  onTemplateSelect: (id: string) => void;
  onRandomSelect: (count: number) => void;
  onManualSelect: () => void;
  onStepFocus: () => void;
  hideInputs?: boolean;
}

export function RaceSetupForm({
  name,
  onNameChange,
  guestName,
  onGuestNameChange,
  isGuest,
  lists,
  selectedListId,
  onTemplateSelect,
  onRandomSelect,
  hideInputs = false,
}: RaceSetupFormProps) {
  return (
    <section className="space-y-8">
      {/* Race Details - hidden when inputs are rendered elsewhere */}
      {!hideInputs && (
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
      )}

      {/* Quick Start Section */}
      <div className="space-y-4">
        <h2 className="text-micro text-muted-foreground/70 pl-0.5 flex items-center gap-2">
          Quick Start — Presets
        </h2>
        <TooltipProvider delayDuration={300}>
          <div className="grid grid-cols-2 gap-2">
            {/* Random count buttons */}
            {[3, 5, 10, 15].map((count) => (
              <Tooltip key={count}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onRandomSelect(count)}
                    className="group flex items-center justify-center gap-2 p-2.5 h-10 rounded-lg border border-border/40 bg-card/50 hover:bg-muted/50 hover:border-border transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Dices className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-micro font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                      {count} Random
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {count} random games from any category
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Category templates */}
            {SYSTEM_TEMPLATES.map((t) => {
              const topicStyle =
                TOPIC_COLORS[t.topic] ||
                "bg-muted/5 border-muted/20 text-muted-foreground";

              return (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onTemplateSelect(t.id)}
                      className={cn(
                        "group flex items-center justify-center gap-2 p-2.5 h-10 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] border",
                        topicStyle
                      )}
                    >
                      <t.icon className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
                      <span className="relative text-micro font-bold uppercase tracking-wider opacity-80 group-hover:opacity-100">
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
          <div>
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
              value={selectedListId || ""}
              onChange={(val) => onTemplateSelect(val as string)}
              options={lists
                .filter((l) => l.games.length > 0)
                .map((l) => ({
                  value: l.id,
                  label: l.name,
                  color: l.color || "slate",
                }))}
              placeholder="Select games from a list..."
              contentClassName="p-2"
              renderOption={(option) => {
                return (
                  <DlesBadge
                    text={option.label}
                    color={option.color || "brand"}
                    count={
                      option.value !== "all"
                        ? lists.find((l) => l.id === option.value)?.games.length
                        : undefined
                    }
                    size="sm"
                  />
                );
              }}
              renderSelected={(option) => {
                return (
                  <DlesBadge
                    text={option.label}
                    color={option.color || "brand"}
                    count={
                      option.value !== "all"
                        ? lists.find((l) => l.id === option.value)?.games.length
                        : undefined
                    }
                    size="sm"
                  />
                );
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
