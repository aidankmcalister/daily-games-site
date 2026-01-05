"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { useLists } from "@/lib/use-lists";
import { Topic } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import { Loader2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@/components/layout/user-button";
import { useSession } from "@/lib/auth-client";
import { DropResult } from "@hello-pangea/dnd";

// Imported Components
import {
  RaceSetupForm,
  SYSTEM_TEMPLATES,
} from "@/components/features/race/new-race/race-setup-form";
import { GameSelector } from "@/components/features/race/new-race/game-selector";
import { SelectedGamesList } from "@/components/features/race/new-race/selected-games-list";
import { RaceInstructions } from "@/components/features/race/new-race/race-instructions";
import { MobileRaceBar } from "@/components/features/race/new-race/mobile-race-bar";

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
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setGamesLoading(true);
        const res = await fetch("/api/games");
        if (res.ok) {
          const data = await res.json();
          const activeGames = data.filter((g: any) => !g.archived);
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

  // Helper: Get selected game names for summary
  const selectedGameNames = useMemo(
    () =>
      selectedGameIds
        .map((id) => allGames.find((g) => g.id === id)?.title)
        .filter(Boolean) as string[],
    [selectedGameIds, allGames]
  );

  // Quick 5 random selection
  const selectQuick5 = () => {
    const randomGames = [...allGames]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    setSelectedGameIds(randomGames.map((g) => g.id));
    toast.info("Selected 5 random games!");
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
        <div className="lg:col-span-8 space-y-8">
          <RaceSetupForm
            name={name}
            onNameChange={setName}
            guestName={guestName}
            onGuestNameChange={setGuestName}
            isGuest={!session?.user}
            lists={lists}
            onTemplateSelect={selectList}
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
                  new Set([
                    ...selectedGameIds,
                    ...filteredGames.map((g) => g.id),
                  ])
                )
              )
            }
            onClear={() => setSelectedGameIds([])}
            topics={topics}
          />
        </div>

        {/* RIGHT COLUMN: Instructions & Selected Games */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6 text-muted-foreground/50">
          <RaceInstructions />

          <SelectedGamesList
            selectedGameIds={selectedGameIds}
            allGames={allGames}
            onRemove={(id) =>
              setSelectedGameIds((prev) => prev.filter((gid) => gid !== id))
            }
            onReorder={(result: DropResult) => {
              if (!result.destination) return;
              const items = Array.from(selectedGameIds);
              const [reordered] = items.splice(result.source.index, 1);
              items.splice(result.destination.index, 0, reordered);
              setSelectedGameIds(items);
            }}
          />
        </div>
      </div>

      <MobileRaceBar
        selectedCount={selectedGameIds.length}
        firstGameTitle={
          allGames.find((g) => g.id === selectedGameIds[0])?.title || ""
        }
        onSubmit={handleCreateRace}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
