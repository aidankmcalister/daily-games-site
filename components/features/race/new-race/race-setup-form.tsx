"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DlesButton } from "@/components/design/dles-button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { type GameList } from "@/lib/use-lists";
import { Tag, Library, Trophy, Dices } from "lucide-react";

export const SYSTEM_TEMPLATES = [
  { id: "sys-words", name: "Word Nerd Sprint", topic: "words", icon: Tag },
  { id: "sys-logic", name: "Logic Master", topic: "logic", icon: Library },
  { id: "sys-trivia", name: "Trivia Showdown", topic: "trivia", icon: Trophy },
  { id: "sys-quick5", name: "The Fast Five", count: 5, icon: Dices },
];

interface RaceSetupFormProps {
  name: string;
  onNameChange: (value: string) => void;
  guestName: string;
  onGuestNameChange: (value: string) => void;
  isGuest: boolean;
  lists: GameList[];
  onTemplateSelect: (id: string) => void;
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
  onManualSelect,
  onStepFocus,
}: RaceSetupFormProps) {
  return (
    <section className="transition-all duration-300">
      <Card className="border border-border transition-all duration-300 shadow-none bg-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-sm font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-muted-foreground text-[10px] font-black">
              1
            </div>
            Race Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Race Name
            </label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="dles.fun race"
              className="h-10 text-sm font-medium bg-muted border-border focus:border-primary/30 rounded-md px-3 shadow-none"
              onFocus={onStepFocus}
            />
          </div>

          {isGuest && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Your Name (Guest)
              </label>
              <Input
                value={guestName}
                onChange={(e) => onGuestNameChange(e.target.value)}
                placeholder="Enter your name"
                className="h-10 text-sm font-medium bg-muted border-border focus:border-primary/30 rounded-md px-3 shadow-none"
              />
            </div>
          )}

          <div className="flex items-center h-fit gap-3">
            <div className="flex-1">
              <Select onValueChange={onTemplateSelect}>
                <SelectTrigger className="w-full bg-muted border-border focus:border-primary/30 rounded-md text-sm px-3 shadow-none">
                  <SelectValue placeholder="Apply Template or List" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-[9px] uppercase tracking-widest text-muted-foreground/40 py-2">
                      System Templates
                    </SelectLabel>
                    {SYSTEM_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <t.icon className="h-4 w-4 text-primary/40" />
                          <span>{t.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {lists.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[9px] uppercase tracking-widest text-muted-foreground/40 py-2 border-t border-border/10 mt-2">
                        Your Lists
                      </SelectLabel>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          <div className="flex justify-between items-center w-full gap-4">
                            <span>{list.name}</span>
                            <Badge
                              variant="secondary"
                              className="font-bold border-none bg-muted/40 text-[9px] h-3.5"
                            >
                              {list.gameCount}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
            <span className="text-[9px] font-black text-muted-foreground/30 uppercase">
              or
            </span>
            <DlesButton
              variant="outline"
              className="flex-1 text-sm font-medium gap-2"
              onClick={onManualSelect}
            >
              Select Games Manually
              <ChevronRight className="h-3.5 w-3.5 opacity-40" />
            </DlesButton>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
