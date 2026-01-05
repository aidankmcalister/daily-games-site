"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info, CheckCircle2, Users, Trophy, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export function RaceInstructions() {
  const steps = [
    {
      icon: CheckCircle2,
      step: "PICK",
      desc: "Select daily games",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: Users,
      step: "INVITE",
      desc: "Share unique link",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: Trophy,
      step: "PLAY",
      desc: "Click Start together",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      icon: Flag,
      step: "WIN!",
      desc: "First to finish wins! Log in to save history.",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
  ];

  return (
    <Card className="border border-border shadow-none bg-card overflow-hidden">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-primary/80">
          <Info className="h-4 w-4" />
          How it Works
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-7">
        {steps.map((item, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border/5 shadow-inner",
                item.bg
              )}
            >
              <item.icon className={cn("h-5 w-5", item.color)} />
            </div>
            <div className="space-y-1">
              <p
                className={cn(
                  "font-black text-[10px] uppercase tracking-widest",
                  item.color
                )}
              >
                {item.step}
              </p>
              <p className="text-sm font-bold leading-tight text-foreground/90">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
