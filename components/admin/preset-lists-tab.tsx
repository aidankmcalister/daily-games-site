"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Trash,
  Pencil,
  Tag,
  Trophy,
  Flame,
  Globe,
  Brain,
  Clapperboard,
  Sparkles,
  Music,
  Gamepad2,
  BookOpen,
  Dices,
  Star,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DlesButton } from "@/components/design/dles-button";
import { DlesBadge } from "@/components/design/dles-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LIST_CARD_STYLES, LIST_COLOR_OPTIONS } from "@/lib/constants";
import { cn, formatTopic } from "@/lib/utils";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Tag,
  Trophy,
  Flame,
  Globe,
  Brain,
  Clapperboard,
  Sparkles,
  Music,
  Gamepad2,
  BookOpen,
  Dices,
  Star,
  Heart,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

interface Game {
  id: string;
  title: string;
  topic: string;
}

interface PresetList {
  id: string;
  name: string;
  color: string;
  icon: string;
  isActive: boolean;
  order: number;
  games: Game[];
}

// Reusable Icon/Color selector component
const IconColorSelector = ({
  icon,
  setIcon,
  color,
  setColor,
  iconLabel = "Icon",
  colorLabel = "Color",
}: {
  icon: string;
  setIcon: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  iconLabel?: string;
  colorLabel?: string;
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-micro text-muted-foreground">{iconLabel}</label>
      <div className="grid grid-cols-4 gap-1.5 bg-muted/20 p-2 rounded-lg border border-border/40">
        {ICON_OPTIONS.map((iconName) => {
          const IconComp = ICON_MAP[iconName];
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              className={cn(
                "h-9 w-9 rounded-lg border flex items-center justify-center transition-all hover:bg-muted bg-background",
                icon === iconName &&
                  "ring-2 ring-primary bg-primary/10 border-primary/50"
              )}
            >
              <IconComp className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-micro text-muted-foreground">{colorLabel}</label>
      <div className="grid grid-cols-4 gap-1.5 bg-muted/20 p-2 rounded-lg border border-border/40">
        {LIST_COLOR_OPTIONS.map((c) => {
          const style = LIST_CARD_STYLES[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "h-9 w-9 rounded-lg border transition-all",
                style.card,
                color === c && "ring-2 ring-primary"
              )}
            >
              <div className={cn("w-3 h-3 mx-auto rounded-full", style.dot)} />
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// Reusable game selector component
const GameSelector = ({
  selected,
  setSelected,
  search,
  setSearch,
  excludeIds = [],
  allGames,
}: {
  selected: string[];
  setSelected: (v: string[]) => void;
  search: string;
  setSearch: (v: string) => void;
  excludeIds?: string[];
  allGames: Game[];
}) => {
  const games = allGames.filter(
    (g) =>
      (g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.topic.toLowerCase().includes(search.toLowerCase())) &&
      !excludeIds.includes(g.id)
  );

  return (
    <div className="space-y-2">
      <label className="text-micro text-muted-foreground">
        Games ({selected.length} selected)
      </label>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search games..."
        className="bg-muted/30"
      />
      <div className="h-[300px] overflow-y-auto border rounded-xl bg-muted/10">
        {games.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No games found
          </div>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                if (selected.includes(game.id)) {
                  setSelected(selected.filter((id) => id !== game.id));
                } else {
                  setSelected([...selected, game.id]);
                }
              }}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer border-b border-border/40 last:border-0 transition-colors bg-background/50",
                selected.includes(game.id)
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                  selected.includes(game.id)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {selected.includes(game.id) && <Plus className="h-3.5 w-3.5" />}
              </div>
              <span className="flex-1 text-sm font-medium truncate">
                {game.title}
              </span>
              <DlesBadge
                text={formatTopic(game.topic)}
                color={game.topic}
                size="xs"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export function PresetListsTab() {
  const [presetLists, setPresetLists] = useState<PresetList[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create dialog state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("slate");
  const [newIcon, setNewIcon] = useState("Sparkles");
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [gameSearch, setGameSearch] = useState("");

  // Edit dialog state
  const [editingList, setEditingList] = useState<PresetList | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("slate");
  const [editIcon, setEditIcon] = useState("Sparkles");

  // Add games dialog state
  const [addingGamesToList, setAddingGamesToList] = useState<PresetList | null>(
    null
  );
  const [gamesToAdd, setGamesToAdd] = useState<string[]>([]);
  const [addGameSearch, setAddGameSearch] = useState("");

  const fetchData = async () => {
    try {
      const [listsRes, gamesRes] = await Promise.all([
        fetch("/api/admin/preset-lists"),
        fetch("/api/games"),
      ]);

      if (listsRes.ok) {
        setPresetLists(await listsRes.json());
      }
      if (gamesRes.ok) {
        setAllGames(await gamesRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/admin/preset-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          color: newColor,
          icon: newIcon,
          gameIds: selectedGameIds,
        }),
      });

      if (res.ok) {
        toast.success("Preset list created");
        setIsCreating(false);
        setNewName("");
        setNewColor("slate");
        setNewIcon("Sparkles");
        setSelectedGameIds([]);
        setGameSearch("");
        fetchData();
      } else {
        toast.error("Failed to create preset list");
      }
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create preset list");
    }
  };

  const handleEdit = async () => {
    if (!editingList || !editName.trim()) return;

    try {
      const res = await fetch(`/api/admin/preset-lists/${editingList.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          color: editColor,
          icon: editIcon,
        }),
      });

      if (res.ok) {
        toast.success("Preset list updated");
        setEditingList(null);
        fetchData();
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update");
    }
  };

  const openEditDialog = (list: PresetList) => {
    setEditName(list.name);
    setEditColor(list.color);
    setEditIcon(list.icon);
    setEditingList(list);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/preset-lists/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Preset list deleted");
        fetchData();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const handleToggleActive = async (list: PresetList) => {
    try {
      const res = await fetch(`/api/admin/preset-lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !list.isActive }),
      });

      if (res.ok) {
        toast.success(list.isActive ? "Hidden" : "Visible");
        fetchData();
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const openAddGamesDialog = (list: PresetList) => {
    setAddingGamesToList(list);
    setGamesToAdd([]);
    setAddGameSearch("");
  };

  const handleSaveGames = async () => {
    if (!addingGamesToList || gamesToAdd.length === 0) return;

    try {
      const res = await fetch(
        `/api/admin/preset-lists/${addingGamesToList.id}/games`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameIds: gamesToAdd }),
        }
      );

      if (res.ok) {
        toast.success(`Added ${gamesToAdd.length} game(s)`);
        setAddingGamesToList(null);
        setGamesToAdd([]);
        fetchData();
      }
    } catch (error) {
      console.error("Add games error:", error);
      toast.error("Failed to add games");
    }
  };

  const handleRemoveGame = async (listId: string, gameId: string) => {
    try {
      const res = await fetch(`/api/admin/preset-lists/${listId}/games`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      if (res.ok) {
        toast.success("Game removed");
        fetchData();
      }
    } catch (error) {
      console.error("Remove game error:", error);
    }
  };

  const getIcon = (iconName: string) => {
    return ICON_MAP[iconName] || Sparkles;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-end">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <DlesButton className="gap-2">
              <Plus className="h-4 w-4" />
              New Preset
            </DlesButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Preset List</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-micro text-muted-foreground">Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Beginner Friendly"
                />
              </div>

              <IconColorSelector
                icon={newIcon}
                setIcon={setNewIcon}
                color={newColor}
                setColor={setNewColor}
              />

              <div className="pt-2 border-t border-border/40">
                <GameSelector
                  selected={selectedGameIds}
                  setSelected={setSelectedGameIds}
                  search={gameSearch}
                  setSearch={setGameSearch}
                  allGames={allGames}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <DlesButton
                  variant="ghost"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </DlesButton>
                <DlesButton onClick={handleCreate} disabled={!newName.trim()}>
                  Create List
                </DlesButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingList}
        onOpenChange={(open) => !open && setEditingList(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Preset List</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-micro text-muted-foreground">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="List name"
              />
            </div>

            <IconColorSelector
              icon={editIcon}
              setIcon={setEditIcon}
              color={editColor}
              setColor={setEditColor}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <DlesButton variant="ghost" onClick={() => setEditingList(null)}>
                Cancel
              </DlesButton>
              <DlesButton onClick={handleEdit} disabled={!editName.trim()}>
                Save Changes
              </DlesButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Games Dialog */}
      <Dialog
        open={!!addingGamesToList}
        onOpenChange={(open) => !open && setAddingGamesToList(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add games to {addingGamesToList?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <GameSelector
              selected={gamesToAdd}
              setSelected={setGamesToAdd}
              search={addGameSearch}
              setSearch={setAddGameSearch}
              excludeIds={addingGamesToList?.games.map((g) => g.id) || []}
              allGames={allGames}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
              <DlesButton
                variant="ghost"
                onClick={() => setAddingGamesToList(null)}
              >
                Cancel
              </DlesButton>
              <DlesButton
                onClick={handleSaveGames}
                disabled={gamesToAdd.length === 0}
              >
                Add {gamesToAdd.length} Game{gamesToAdd.length !== 1 && "s"}
              </DlesButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preset list grid */}
      {presetLists.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No preset lists yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presetLists.map((list) => {
            const style =
              LIST_CARD_STYLES[list.color] || LIST_CARD_STYLES.slate;
            const IconComponent = getIcon(list.icon);
            return (
              <div
                key={list.id}
                className={cn(
                  "border rounded-xl p-4 transition-all",
                  style.card,
                  !list.isActive && "opacity-50 grayscale"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", style.card)}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold leading-tight">{list.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {list.games.length} game{list.games.length !== 1 && "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <DlesButton
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(list)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </DlesButton>
                    <DlesButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(list)}
                      className="text-xs h-7 px-2"
                    >
                      {list.isActive ? "Hide" : "Show"}
                    </DlesButton>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DlesButton
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive h-7 w-7"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </DlesButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete "{list.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this preset list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(list.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Games */}
                <div className="rounded-lg border border-border/20 p-2 mt-3 bg-background/30">
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {list.games.slice(0, 12).map((game) => (
                      <span
                        key={game.id}
                        className="inline-flex items-center text-xs bg-muted/50 hover:bg-muted px-2 py-1 rounded-md group transition-colors cursor-default"
                      >
                        {game.title}
                        <button
                          onClick={() => handleRemoveGame(list.id, game.id)}
                          className="ml-1.5 w-0 overflow-hidden group-hover:w-4 text-muted-foreground hover:text-destructive transition-all"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {list.games.length > 12 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{list.games.length - 12} more
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openAddGamesDialog(list)}
                    className="text-xs text-primary hover:underline mt-2 font-medium"
                  >
                    + Add games
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
