"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useLists } from "@/lib/use-lists";
import { Topic } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  Gamepad,
  Check,
  Trophy,
  Users,
  ChevronRight,
  Info,
  X,
  Flag,
  Library,
  Tag,
  Dices,
  GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "@/components/header/header-search";
import { UserButton } from "@/components/user-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface Game {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  archived?: boolean;
}

const SYSTEM_TEMPLATES = [
  { id: "sys-words", name: "Word Nerd Sprint", topic: "words", icon: Tag },
  { id: "sys-puzzle", name: "Puzzle Master", topic: "puzzle", icon: Library },
  { id: "sys-trivia", name: "Trivia Showdown", topic: "trivia", icon: Trophy },
  { id: "sys-quick5", name: "The Fast Five", count: 5, icon: Dices },
];

export default function NewRacePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { lists, isLoading: listsLoading } = useLists();
  const [name, setName] = useState("Daily Games Race");
  const [guestName, setGuestName] = useState("");
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setGamesLoading(true);
        const res = await fetch("/api/games");
        if (res.ok) {
          const data = await res.json();
          console.log("[NewRacePage] Fetched games count:", data.length);
          const activeGames = data.filter((g: any) => !g.archived);
          console.log("[NewRacePage] Active games count:", activeGames.length);
          setAllGames(activeGames);
        } else {
          console.error(
            "[NewRacePage] Failed to fetch games:",
            res.status,
            res.statusText
          );
        }
      } catch (error) {
        console.error("[NewRacePage] Fetch games error:", error);
      } finally {
        setGamesLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = useMemo(() => {
    const filtered = allGames.filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTopic =
        selectedTopic === "all" || game.topic === selectedTopic;
      return matchesSearch && matchesTopic;
    });
    console.log(
      "[NewRacePage] Filtered games count:",
      filtered.length,
      "(total:",
      allGames.length,
      "topic:",
      selectedTopic,
      ")"
    );
    return filtered;
  }, [allGames, searchQuery, selectedTopic]);

  const topics = useMemo(
    () => Array.from(new Set(allGames.map((g) => g.topic))).sort(),
    [allGames]
  );

  const toggleGame = (gameId: string) => {
    setSelectedGameIds((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const selectList = (id: string) => {
    if (id.startsWith("sys-")) {
      const template = SYSTEM_TEMPLATES.find((t) => t.id === id);
      if (template) {
        let games: Game[] = [];
        if (template.topic)
          games = allGames.filter((g) => g.topic === template.topic);
        else if (template.count)
          games = [...allGames]
            .sort(() => 0.5 - Math.random())
            .slice(0, template.count);
        setSelectedGameIds(games.map((g) => g.id));
        toast.info(`Applied template: ${template.name}`);
        setActiveStep(2);
      }
    } else {
      const list = lists.find((l) => l.id === id);
      if (list) {
        setSelectedGameIds(list.games);
        toast.info(`Applied list: ${list.name}`);
        setActiveStep(2);
      }
    }
  };

  const handleCreateRace = async () => {
    if (!name.trim())
      return toast.error("Please enter a race name"), setActiveStep(1);
    if (!session?.user && !guestName.trim())
      return toast.error("Please enter your name"), setActiveStep(1);
    if (selectedGameIds.length === 0)
      return toast.error("Please select at least one game"), setActiveStep(2);

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/race", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gameIds: selectedGameIds,
          guestName: !session?.user ? guestName : undefined,
        }),
      });
      if (res.ok) {
        const race = await res.json();

        // If created as guest, save identity
        if (!session?.user && guestName) {
          const myParticipant = race.participants.find(
            (p: any) => p.guestName === guestName
          );
          if (myParticipant) {
            localStorage.setItem(`race_guest_${race.id}`, myParticipant.id);
          }
        }

        toast.success("Race created!");
        router.push(`/race/${race.id}`);
      } else toast.error((await res.text()) || "Failed to create race");
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-32">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Start a Race"
          subtitle="Challenge your friends to see who can finish their daily games the fastest."
          backHref="/"
        />
        <UserButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: RACE SETUP */}
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Daily Games Race"
                    className="h-10 text-sm font-medium bg-muted border-border focus:border-primary/30 rounded-md px-3 shadow-none"
                    onFocus={() => setActiveStep(1)}
                  />
                </div>

                {!session?.user && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Your Name (Guest)
                    </label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-10 text-sm font-medium bg-muted border-border focus:border-primary/30 rounded-md px-3 shadow-none"
                    />
                  </div>
                )}

                <div className="flex items-center h-fit gap-3">
                  <div className="flex-1">
                    <Select onValueChange={selectList}>
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
                  <Button
                    variant="outline"
                    className="flex-1 rounded-md hover:bg-muted/50 text-sm font-medium gap-2"
                    onClick={() => {
                      setSelectedGameIds([]);
                      setActiveStep(2);
                    }}
                  >
                    Select Games Manually
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* STEP 2: SELECT GAMES */}
          <section className="transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-muted-foreground text-[10px] font-black">
                    2
                  </div>
                  Select Games
                  <Badge className="ml-1 font-bold rounded-full px-2 py-0 border-none bg-primary/10 text-primary text-[10px]">
                    {selectedGameIds.length} Picked
                  </Badge>
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedGameIds(
                        Array.from(
                          new Set([
                            ...selectedGameIds,
                            ...filteredGames.map((g) => g.id),
                          ])
                        )
                      )
                    }
                    className="h-7 px-2.5 rounded-md font-bold border-border text-[10px]"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGameIds([])}
                    className="h-7 px-2.5 rounded-md font-bold text-[10px] text-muted-foreground hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <HeaderSearch
                  query={searchQuery}
                  onChange={setSearchQuery}
                  className="flex-1"
                  showKbd
                />
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger
                    size="lg"
                    className={`w-[160px] h-10 text-sm ${
                      selectedTopic !== "all"
                        ? "border-primary bg-primary/5 text-primary"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>All Topics</span>
                      </div>
                    </SelectItem>
                    {topics.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                {gamesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">
                      Loading Library...
                    </p>
                  </div>
                ) : filteredGames.length === 0 ? (
                  <div className="text-center py-20 bg-muted/50 rounded-xl border border-dashed border-border">
                    <p className="text-xs font-bold text-muted-foreground/30">
                      No games found
                    </p>
                  </div>
                ) : (
                  <TooltipProvider delayDuration={300}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredGames.map((game) => {
                        const isSelected = selectedGameIds.includes(game.id);
                        return (
                          <Tooltip key={game.id}>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() => toggleGame(game.id)}
                                className={cn(
                                  "group relative flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none h-20",
                                  "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
                                  isSelected
                                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/10"
                                    : "border-border bg-card"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex items-center justify-center h-4 w-4 rounded-sm border transition-all shrink-0",
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "bg-muted/40 border-border"
                                  )}
                                >
                                  {isSelected && (
                                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                  <span
                                    className={cn(
                                      "font-bold text-sm tracking-tight truncate leading-tight transition-colors",
                                      isSelected
                                        ? "text-primary"
                                        : "text-foreground"
                                    )}
                                  >
                                    {game.title}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "w-fit capitalize text-[9px] font-normal px-2 py-0 h-4 border-0 rounded-sm",
                                      TOPIC_COLORS[game.topic]
                                    )}
                                  >
                                    {game.topic}
                                  </Badge>
                                </div>
                              </div>
                            </TooltipTrigger>
                            {game.description && (
                              <TooltipContent
                                side="top"
                                className="max-w-xs text-xs"
                              >
                                {game.description}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </section>

          <div className="pt-6">
            <Button
              className={cn(
                "w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-none border border-transparent",
                selectedGameIds.length > 0
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.01]"
                  : "bg-muted text-muted-foreground cursor-not-allowed border-border/30"
              )}
              onClick={handleCreateRace}
              disabled={
                isSubmitting || gamesLoading || selectedGameIds.length === 0
              }
            >
              {isSubmitting ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <Flag className="mr-3 h-4 w-4" />
              )}
              {selectedGameIds.length > 0
                ? `Create Race (${selectedGameIds.length} Games)`
                : "Select Games"}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: How It Works */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6 text-muted-foreground/50">
          <Card className="border border-border shadow-none bg-card overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-primary/80">
                <Info className="h-4 w-4" />
                How it Works
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-7">
              {[
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
              ].map((item, i) => (
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

          {selectedGameIds.length > 0 && (
            <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden p-0">
              <CardHeader className="p-0 px-4 py-3 border-b border-primary/10">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-primary/80">
                  <Gamepad className="h-4 w-4" />
                  Games
                  <Badge className="font-black rounded-sm px-2 py-0.5 bg-primary text-primary-foreground text-[10px]">
                    {selectedGameIds.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DragDropContext
                  onDragEnd={(result: DropResult) => {
                    if (!result.destination) return;
                    const items = Array.from(selectedGameIds);
                    const [reordered] = items.splice(result.source.index, 1);
                    items.splice(result.destination.index, 0, reordered);
                    setSelectedGameIds(items);
                  }}
                >
                  <Droppable droppableId="selected-games">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="max-h-[280px] overflow-y-auto"
                      >
                        {selectedGameIds.map((id, index) => {
                          const game = allGames.find((g) => g.id === id);
                          if (!game) return null;
                          return (
                            <Draggable key={id} draggableId={id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                    "px-4 py-2.5 flex items-center gap-3 border-b border-primary/10 last:border-b-0",
                                    snapshot.isDragging &&
                                      "bg-primary/10 shadow-lg"
                                  )}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-muted-foreground/50 hover:text-primary cursor-grab"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  <span className="text-xs font-medium truncate flex-1">
                                    {game.title}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-[9px] capitalize px-1.5 h-4 border-none",
                                      TOPIC_COLORS[game.topic]
                                    )}
                                  >
                                    {game.topic}
                                  </Badge>
                                  <button
                                    onClick={() =>
                                      setSelectedGameIds((prev) =>
                                        prev.filter((gid) => gid !== id)
                                      )
                                    }
                                    className="text-muted-foreground/50 hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* MOBILE STICKY BAR */}
      {selectedGameIds.length > 0 && !isSubmitting && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-card border border-border rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 overflow-hidden ring-1 ring-primary/10 font-bold">
            <div className="flex items-center gap-2 px-1 text-[10px]">
              <Badge className="font-black rounded-sm px-1 py-0 bg-primary text-primary-foreground h-4">
                {selectedGameIds.length}
              </Badge>
              <span className="truncate max-w-[100px]">
                {allGames.find((g) => g.id === selectedGameIds[0])?.title}...
              </span>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 font-black uppercase text-[9px] tracking-widest rounded-lg"
              onClick={handleCreateRace}
              disabled={isSubmitting}
            >
              CREATE
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
