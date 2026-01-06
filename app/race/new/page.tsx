"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UserButton } from "@/components/layout/user-button";
import { useLists } from "@/lib/use-lists";
import { Topic } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  RaceSetupForm,
  SYSTEM_TEMPLATES,
} from "@/components/features/race/new-race/race-setup-form";
import { GameSelector } from "@/components/features/race/new-race/game-selector";

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
  const [, setActiveStep] = useState<1 | 2>(1);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setGamesLoading(true);
        const res = await fetch("/api/games");
        if (res.ok) {
          const data = await res.json();
          const activeGames = data.filter((g: Game) => !g.archived);
          setAllGames(activeGames);
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
        // Shuffle and pick only template.count games (default 5)
        const games = [...categoryGames]
          .sort(() => 0.5 - Math.random())
          .slice(0, template.count || 5);
        setSelectedGameIds(games.map((g) => g.id));
        toast.info(
          `Selected ${games.length} ${template.name.toLowerCase()} games!`
        );
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
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <PageHeader
          title="Start a Race"
          subtitle="Challenge your friends to see who can finish their daily games the fastest."
          backHref="/"
        />
        <UserButton />
      </div>

      <div className="space-y-8">
        <RaceSetupForm
          name={name}
          onNameChange={setName}
          guestName={guestName}
          onGuestNameChange={setGuestName}
          isGuest={!session?.user}
          lists={lists}
          onTemplateSelect={selectList}
          onRandomSelect={(count) => {
            const randomGames = [...allGames]
              .sort(() => 0.5 - Math.random())
              .slice(0, count);
            setSelectedGameIds(randomGames.map((g) => g.id));
            toast.info(`Selected ${count} random games!`);
          }}
          onManualSelect={() => {
            setSelectedGameIds([]);
            setActiveStep(2);
          }}
          onStepFocus={() => setActiveStep(1)}
        />

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
                new Set([...selectedGameIds, ...filteredGames.map((g) => g.id)])
              )
            )
          }
          onClear={() => setSelectedGameIds([])}
          topics={topics}
        />
      </div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur-md z-40 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
          {selectedGameIds.length > 0 && (
            <div className="flex items-center justify-between text-body-small">
              <span className="text-muted-foreground truncate">
                <span className="font-bold text-foreground">
                  {selectedGameIds.length}
                </span>{" "}
                selected:{" "}
                {selectedGameIds
                  .slice(0, 3)
                  .map((id) => allGames.find((g) => g.id === id)?.title)
                  .filter(Boolean)
                  .join(", ")}
                {selectedGameIds.length > 3 &&
                  ` +${selectedGameIds.length - 3}`}
              </span>
              <button
                className="text-micro text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => setSelectedGameIds([])}
              >
                Clear
              </button>
            </div>
          )}
          <button
            className={`w-full h-11 text-sm font-bold gap-2 rounded-lg transition-all shadow-sm flex items-center justify-center ${
              selectedGameIds.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                : "bg-muted/80 text-muted-foreground cursor-not-allowed border border-border/50"
            }`}
            onClick={handleCreateRace}
            disabled={
              isSubmitting || gamesLoading || selectedGameIds.length === 0
            }
          >
            {selectedGameIds.length > 0
              ? `Start Race with ${selectedGameIds.length} Game${
                  selectedGameIds.length > 1 ? "s" : ""
                }`
              : "Select Games to Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
