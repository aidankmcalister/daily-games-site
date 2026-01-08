"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLists } from "@/lib/use-lists";
import { Topic } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  RaceSetupForm,
  SYSTEM_TEMPLATES,
} from "@/components/features/race/new-race/race-setup-form";
import { GameSelector } from "@/components/features/race/new-race/game-selector";
import { DlesButton } from "@/components/design/dles-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeaderSearch } from "@/components/header/header-search";
import { DlesSelect } from "@/components/design/dles-select";
import { Flag } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  archived?: boolean;
}

export default function NewRacePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { lists } = useLists();
  const [name, setName] = useState("dles.fun Race");
  const [guestName, setGuestName] = useState("");
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [, setActiveStep] = useState<1 | 2>(1);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setGamesLoading(true);
        const res = await fetch("/api/games?limit=2000");
        if (res.ok) {
          const data = await res.json();
          // API returns { items: Game[], meta: ... }
          // API already filters out archived games by default
          setAllGames(data.items || []);
        }
      } catch (error) {
        console.error("Fetch games error:", error);
      } finally {
        setGamesLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTopic =
        selectedTopics.length === 0 ||
        selectedTopics.includes("all") ||
        selectedTopics.includes(game.topic);
      return matchesSearch && matchesTopic;
    });
  }, [allGames, searchQuery, selectedTopics]);

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
      if (template && template.topic) {
        const categoryGames = allGames.filter(
          (g) => g.topic === template.topic
        );
        const games = [...categoryGames]
          .sort(() => 0.5 - Math.random())
          .slice(0, template.count || 5);
        setSelectedGameIds(games.map((g) => g.id));
        setSelectedListId(""); // Clear list selection for system templates
        toast.info(
          `Selected ${games.length} ${template.name.toLowerCase()} games!`
        );
        setActiveStep(2);
      }
    } else {
      const list = lists.find((l) => l.id === id);
      if (list) {
        setSelectedGameIds(list.games);
        setSelectedListId(list.id);
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

        if (!session?.user && guestName) {
          const myParticipant = race.participants.find(
            (p: { guestName?: string }) => p.guestName === guestName
          );
          if (myParticipant) {
            localStorage.setItem(`race_guest_${race.id}`, myParticipant.id);
          }
        }

        toast.success("Race created!");
        router.push(`/race/${race.id}`);
      } else toast.error((await res.text()) || "Failed to create race");
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Top bar: Race Name + Search + Filters inline */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 items-end">
          {/* Race Name */}
          <div className="md:col-span-3">
            <Label
              htmlFor="race-name"
              className="text-micro text-muted-foreground mb-2 block"
            >
              RACE NAME
            </Label>
            <Input
              id="race-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="dles.fun Race"
            />
          </div>

          {/* Guest Name (if not logged in) */}
          {!session?.user && (
            <div className="md:col-span-2">
              <Label
                htmlFor="guest-name"
                className="text-micro text-muted-foreground mb-2 block"
              >
                YOUR NAME
              </Label>
              <Input
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          )}

          {/* Search */}
          <div className={session?.user ? "md:col-span-6" : "md:col-span-4"}>
            <Label className="text-micro text-muted-foreground mb-2 block">
              SEARCH GAMES
            </Label>
            <HeaderSearch
              query={searchQuery}
              onChange={setSearchQuery}
              className="w-full"
            />
          </div>

          {/* Topic Filter */}
          <div className="md:col-span-3">
            <Label className="text-micro text-muted-foreground mb-2 block">
              FILTER BY TOPIC
            </Label>
            <DlesSelect
              multi
              topics
              value={selectedTopics.length === 0 ? ["all"] : selectedTopics}
              onChange={setSelectedTopics}
              placeholder="All Topics"
              className="w-full"
            />
          </div>
        </div>

        {/* Two-column layout: Quick Picks + Game Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Quick Picks */}
          <div className="lg:col-span-3 space-y-4">
            <RaceSetupForm
              name={name}
              onNameChange={setName}
              guestName={guestName}
              onGuestNameChange={setGuestName}
              isGuest={!session?.user}
              lists={lists}
              selectedListId={selectedListId}
              onTemplateSelect={selectList}
              onRandomSelect={(count) => {
                const randomGames = [...allGames]
                  .sort(() => 0.5 - Math.random())
                  .slice(0, count);
                setSelectedGameIds(randomGames.map((g) => g.id));
                setSelectedListId(""); // Clear list selection for random
                toast.info(`Selected ${count} random games!`);
              }}
              onManualSelect={() => {
                setSelectedGameIds([]);
                setSelectedListId(""); // Clear list selection
                setActiveStep(2);
              }}
              onStepFocus={() => setActiveStep(1)}
              hideInputs
            />

            {/* Create Race Button - desktop */}
            <div className="hidden lg:block sticky top-5 space-y-3">
              <DlesButton
                onClick={handleCreateRace}
                disabled={
                  isSubmitting || gamesLoading || selectedGameIds.length === 0
                }
                className="w-full h-12 text-base font-bold gap-2"
                size="lg"
              >
                <Flag className="h-5 w-5" />
                {selectedGameIds.length > 0
                  ? `Create Race (${selectedGameIds.length})`
                  : "Select Games"}
              </DlesButton>
              {selectedGameIds.length > 0 && (
                <p className="text-center text-micro text-muted-foreground">
                  {selectedGameIds
                    .slice(0, 3)
                    .map((id) => allGames.find((g) => g.id === id)?.title)
                    .filter(Boolean)
                    .join(", ")}
                  {selectedGameIds.length > 3 &&
                    ` +${selectedGameIds.length - 3} more`}
                </p>
              )}
            </div>
          </div>

          {/* Right column: Game Grid */}
          <div className="lg:col-span-9">
            <GameSelector
              allGames={allGames}
              selectedGameIds={selectedGameIds}
              filteredGames={filteredGames}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTopics={selectedTopics}
              onTopicChange={setSelectedTopics}
              isLoading={gamesLoading}
              onToggleGame={toggleGame}
              onSelectAll={() =>
                setSelectedGameIds(
                  Array.from(
                    new Set([
                      ...selectedGameIds,
                      ...filteredGames.map((g) => g.id),
                    ])
                  )
                )
              }
              onClear={() => setSelectedGameIds([])}
              topics={topics}
              hideFilters
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer CTA - Mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur-md z-40 shadow-lg">
        <div className="px-4 py-3 space-y-2">
          {selectedGameIds.length > 0 && (
            <div className="flex items-center justify-between text-body-small">
              <span className="text-muted-foreground truncate">
                <span className="font-bold text-foreground">
                  {selectedGameIds.length}
                </span>{" "}
                game{selectedGameIds.length !== 1 && "s"} selected
              </span>
              <button
                className="text-micro text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => setSelectedGameIds([])}
              >
                Clear
              </button>
            </div>
          )}
          <DlesButton
            onClick={handleCreateRace}
            disabled={
              isSubmitting || gamesLoading || selectedGameIds.length === 0
            }
            className="w-full h-11 text-sm font-bold gap-2"
          >
            <Flag className="h-4 w-4" />
            {selectedGameIds.length > 0
              ? `Create Race with ${selectedGameIds.length} Game${
                  selectedGameIds.length > 1 ? "s" : ""
                }`
              : "Select Games to Continue"}
          </DlesButton>
        </div>
      </div>
    </main>
  );
}
