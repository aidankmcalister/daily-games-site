import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DlesTopic } from "@/components/design/dles-topic";
import { MicroLabel } from "@/components/design/micro-label";
import { Check, ExternalLink, Loader2, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

const meta = {
  title: "Race/RaceGameCard",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Game card used in active races. Shows game info, player status, and action buttons. Shrinks after completion.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Active game card (not completed)
const ActiveCard = ({
  opponentCompleted = false,
  opponentSkipped = false,
  opponentTime = 45,
}: {
  opponentCompleted?: boolean;
  opponentSkipped?: boolean;
  opponentTime?: number;
}) => (
  <Card className="border-border/40 hover:border-primary/20 hover:bg-card bg-card/50 overflow-hidden transition-all duration-300">
    <CardContent className="p-6">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-black tracking-tight">Worldle</h3>
            <DlesTopic topic="geography" size="sm" />
          </div>
          <a
            href="#"
            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors w-fit"
          >
            worldle.teuteuf.fr
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="h-px bg-border/40" />

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <MicroLabel>You</MicroLabel>
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs font-medium">Racing...</span>
            </div>
          </div>

          <div className="space-y-1.5 border-l pl-4 border-border/40">
            <MicroLabel>Opponent</MicroLabel>
            {opponentCompleted ? (
              opponentSkipped ? (
                <div className="flex items-center gap-2 text-rose-500">
                  <SkipForward className="h-4 w-4" />
                  <span className="font-bold text-sm">Lost</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-primary">
                  <Check className="h-4 w-4" />
                  <span className="font-bold tabular-nums text-sm">
                    {formatTime(opponentTime)}
                  </span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground/60">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs font-medium">Racing...</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-border/40" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <Button
            variant="outline"
            className="h-10 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            Play Game
          </Button>

          <Button className="h-10 rounded-xl text-xs font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/10 order-first sm:order-0">
            <Check className="h-3.5 w-3.5 mr-2" />
            Done
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl text-xs font-black uppercase tracking-widest border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/50"
          >
            <SkipForward className="h-3.5 w-3.5 mr-2" />
            Lost
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Completed card (shrunk)
const CompletedCard = ({
  skipped = false,
  time = 65,
  opponentTime = 72,
  opponentSkipped = false,
}: {
  skipped?: boolean;
  time?: number;
  opponentTime?: number;
  opponentSkipped?: boolean;
}) => (
  <Card
    className={cn(
      "overflow-hidden transition-all duration-300 border bg-card/50",
      skipped
        ? "border-rose-500/20 bg-rose-500/5"
        : "border-green-500/20 bg-green-500/5"
    )}
  >
    <CardContent className="py-3 px-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {skipped ? (
            <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
              <SkipForward className="h-4 w-4 text-rose-500" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-bold text-sm leading-none",
                  skipped
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-green-600 dark:text-green-400"
                )}
              >
                Worldle
              </h3>
              <a
                href="#"
                className="text-muted-foreground/40 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2 tabular-nums font-medium">
              <span>{skipped ? "Lost" : formatTime(time)}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-foreground">
                Opp: {opponentSkipped ? "Lost" : formatTime(opponentTime)}
              </span>
            </div>
          </div>
        </div>

        <DlesTopic topic="geography" size="sm" />
      </div>
    </CardContent>
  </Card>
);

// Locked card
const LockedCard = () => (
  <Card className="overflow-hidden transition-all duration-300 border bg-card/50 border-border/40 opacity-50 pointer-events-none grayscale">
    <CardContent className="p-6">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-black tracking-tight">Heardle</h3>
            <DlesTopic topic="music" size="sm" />
          </div>
          <span className="text-xs text-muted-foreground">heardle.io</span>
        </div>
        <div className="h-px bg-border/40" />
        <p className="text-xs text-muted-foreground">
          Complete previous game to unlock
        </p>
      </div>
    </CardContent>
  </Card>
);

// All states showcase
export const AllStates: Story = {
  name: "All Card States",
  render: () => (
    <div className="space-y-4 max-w-lg">
      <h3 className="text-sm font-bold text-muted-foreground">
        Active (Racing)
      </h3>
      <ActiveCard />

      <h3 className="text-sm font-bold text-muted-foreground mt-6">
        Active (Opponent Completed)
      </h3>
      <ActiveCard opponentCompleted opponentTime={45} />

      <h3 className="text-sm font-bold text-muted-foreground mt-6">
        Active (Opponent Lost)
      </h3>
      <ActiveCard opponentCompleted opponentSkipped />

      <h3 className="text-sm font-bold text-muted-foreground mt-6">
        Completed (Won)
      </h3>
      <CompletedCard time={65} opponentTime={72} />

      <h3 className="text-sm font-bold text-muted-foreground mt-6">
        Completed (Lost / Skipped)
      </h3>
      <CompletedCard skipped time={0} opponentTime={45} />

      <h3 className="text-sm font-bold text-muted-foreground mt-6">Locked</h3>
      <LockedCard />
    </div>
  ),
};

// Individual states
export const Active: Story = {
  render: () => (
    <div className="max-w-lg">
      <ActiveCard />
    </div>
  ),
};

export const ActiveOpponentDone: Story = {
  name: "Active - Opponent Completed",
  render: () => (
    <div className="max-w-lg">
      <ActiveCard opponentCompleted opponentTime={45} />
    </div>
  ),
};

export const CompletedWon: Story = {
  name: "Completed - Won",
  render: () => (
    <div className="max-w-lg">
      <CompletedCard time={65} opponentTime={72} />
    </div>
  ),
};

export const CompletedLost: Story = {
  name: "Completed - Lost",
  render: () => (
    <div className="max-w-lg">
      <CompletedCard skipped opponentTime={45} />
    </div>
  ),
};

export const Locked: Story = {
  render: () => (
    <div className="max-w-lg">
      <LockedCard />
    </div>
  ),
};
