"use client";
// forcing refresh

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { DlesBadge } from "@/components/design/dles-badge";
import { formatTopic } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel } from "@/components/ui/field";
import { LIST_CARD_STYLES, LIST_COLOR_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { DlesButton } from "@/components/design/dles-button";
import { useLists } from "@/lib/use-lists";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Gamepad2,
  Sparkles,
  Loader2,
  ExternalLink,
  Tag,
  Trophy,
  Flame,
  Globe,
  Brain,
  Clapperboard,
  Music,
  BookOpen,
  Dices,
  Star,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icon mapping for preset lists
const PRESET_ICON_MAP: Record<string, LucideIcon> = {
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

interface Game {
  id: string;
  title: string;
  topic: string;
  link?: string;
}

interface PresetList {
  id: string;
  name: string;
  color: string;
  icon: string;
  games: Game[];
}

// Extended list with full game objects for display
interface DisplayList {
  id: string;
  name: string;
  color?: string;
  games: Game[];
}

interface ListsClientProps {
  initialLists: DisplayList[];
  showPresetLists: boolean;
}

export function ListsClient({
  initialLists,
  showPresetLists,
}: ListsClientProps) {
  // Use the shared lists context for syncing
  const {
    lists: sharedLists,
    createList,
    deleteList,
    renameList,
    updateListColor,
    isLoading,
  } = useLists();

  // Preset lists state
  const [presetLists, setPresetLists] = useState<PresetList[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);

  // Fetch preset lists on mount
  useEffect(() => {
    if (showPresetLists) {
      const fetchPresetLists = async () => {
        try {
          const res = await fetch("/api/preset-lists");
          if (res.ok) {
            const data = await res.json();
            setPresetLists(data);
          }
        } catch (error) {
          console.error("Failed to fetch preset lists:", error);
        } finally {
          setPresetsLoading(false);
        }
      };
      fetchPresetLists();
    }
  }, [showPresetLists]);

  // Merge shared list data (colors, names) with initial full game data
  // Merge shared list data (colors, names) with initial full game data
  // Drive from sharedLists so newly created lists appear immediately
  const lists = sharedLists.map((shared) => {
    const initial = initialLists.find((i) => i.id === shared.id);
    return {
      id: shared.id,
      name: shared.name,
      color: shared.color,
      games: initial?.games || [],
    };
  });

  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("slate");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName, newListColor);
    setNewListName("");
    setNewListColor("slate");
    setIsCreating(false);
  };

  const handleRenameList = async (listId: string) => {
    if (!editName.trim()) return;
    await renameList(listId, editName);
    setEditingListId(null);
  };

  const handleChangeColor = async (listId: string, color: string) => {
    await updateListColor(listId, color);
  };

  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
  };

  const handleRemoveGame = async (listId: string, gameId: string) => {
    try {
      await fetch(`/api/lists/${listId}/games`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
      // Force page refresh to get updated game data
      window.location.reload();
    } catch (error) {
      console.error("Failed to remove game:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/40 bg-muted/20 p-4 h-[200px] animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{
                animationDelay: `${i * 50}ms`,
                animationDuration: "300ms",
              }}
            >
              <div className="space-y-3">
                <div className="h-5 w-2/3 bg-muted/50 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Preset Lists Section */}
      {showPresetLists && presetLists.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-micro text-muted-foreground/60">
            Featured Collections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {presetLists.map((preset) => {
              const style =
                LIST_CARD_STYLES[preset.color] || LIST_CARD_STYLES.slate;
              const IconComponent = PRESET_ICON_MAP[preset.icon] || Sparkles;
              return (
                <Link
                  key={preset.id}
                  href={`/?list=${preset.id}`}
                  className={cn(
                    "group flex items-center justify-center gap-2 p-2.5 h-10 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] border",
                    style.card
                  )}
                >
                  <IconComponent className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                  <span className="text-micro font-bold uppercase tracking-wider opacity-80 group-hover:opacity-100">
                    {preset.name}
                  </span>
                  <span className="text-micro opacity-50">
                    ({preset.games.length})
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-micro text-muted-foreground/60">Your Game Lists</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <DlesButton size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New List
            </DlesButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden bg-card border-border/60">
            <DialogHeader className="p-4 py-3 border-b border-border/40 bg-muted/20">
              <DialogTitle className="text-micro text-muted-foreground">
                Create New List
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-micro text-muted-foreground/70">
                  List Name
                </label>
                <Input
                  placeholder="e.g. My Favorites"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    newListName.trim() &&
                    handleCreateList()
                  }
                  className="h-10 text-sm font-medium bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-micro text-muted-foreground/70">
                  Color Theme
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {LIST_COLOR_OPTIONS.map((color) => {
                    const style = LIST_CARD_STYLES[color];
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewListColor(color)}
                        className={cn(
                          "aspect-square rounded-md border flex items-center justify-center transition-all",
                          style.card,
                          newListColor === color
                            ? "ring-2 ring-primary border-primary/50 bg-background"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                        )}
                        title={color}
                      >
                        <div
                          className={cn("w-2.5 h-2.5 rounded-full", style.dot)}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <DlesButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="h-9 text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </DlesButton>
                <DlesButton
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                  className="h-9 px-6 font-bold"
                >
                  Create List
                </DlesButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card/50 py-16 text-center">
          <div className="h-12 w-12 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <p className="text-sm font-bold text-foreground">No lists yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px] mx-auto">
            Create your first list to organize games
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const style =
              LIST_CARD_STYLES[list.color || "slate"] || LIST_CARD_STYLES.slate;
            return (
              <div
                key={list.id}
                className={cn(
                  "group rounded-xl border p-4 flex flex-col",
                  style.card
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    {editingListId === list.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleRenameList(list.id)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleRenameList(list.id)
                        }
                        autoFocus
                        className="h-7 text-sm font-semibold -ml-2 px-2 bg-background/80"
                      />
                    ) : (
                      <h3 className="text-heading-card truncate">
                        {list.name}
                      </h3>
                    )}
                    <p className="text-micro text-muted-foreground/60 mt-1">
                      {list.games.length}{" "}
                      {list.games.length === 1 ? "game" : "games"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DlesButton
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DlesButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingListId(list.id);
                          setEditName(list.name);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-2">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          Color
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {LIST_COLOR_OPTIONS.map((color) => {
                            const colorStyle = LIST_CARD_STYLES[color];
                            return (
                              <button
                                key={color}
                                onClick={() =>
                                  handleChangeColor(list.id, color)
                                }
                                className={cn(
                                  "w-4 h-4 rounded-full transition-all",
                                  colorStyle.dot,
                                  list.color === color &&
                                    "ring-2 ring-offset-1 ring-offset-background ring-foreground"
                                )}
                                title={color}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete list?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{list.name}" and
                              remove all games from it. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteList(list.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Games list */}
                <div className="bg-background/30 rounded-lg p-2 -mx-1 flex-1 flex flex-col">
                  {list.games.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 opacity-60">
                      <Gamepad2 className="h-5 w-5 mb-1.5" />
                      <p className="text-xs">Add games from the homepage</p>
                    </div>
                  ) : (
                    <div className="relative group/list">
                      <div
                        className={cn(
                          "space-y-1 max-h-[190px] overflow-y-auto pr-2 -mr-2 scrollbar-none hover:scrollbar-thin scrollbar-thumb-muted/10 hover:scrollbar-thumb-muted/20 transition-colors",
                          list.games.length > 5 && "mask-linear-fade"
                        )}
                      >
                        {list.games.map((game) => (
                          <div
                            key={game.id}
                            className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md group/item hover:bg-background/50 transition-colors relative"
                          >
                            {game.link ? (
                              <Link
                                href={game.link}
                                target="_blank"
                                className="flex items-center gap-1.5 text-sm truncate text-foreground flex-1 min-w-0 hover:text-brand transition-colors"
                              >
                                <span className="truncate">{game.title}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                              </Link>
                            ) : (
                              <span className="text-sm truncate text-foreground flex-1 min-w-0">
                                {game.title}
                              </span>
                            )}
                            <div className="flex items-center shrink-0 relative">
                              <div className="transition-transform duration-200 ease-out group-hover/item:-translate-x-6">
                                <DlesBadge
                                  text={formatTopic(game.topic)}
                                  color={game.topic}
                                  size="sm"
                                />
                              </div>
                              <DlesButton
                                variant="ghost"
                                size="icon-sm"
                                className="h-5 w-5 absolute right-0 opacity-0 scale-75 group-hover/item:opacity-100 group-hover/item:scale-100 text-muted-foreground hover:text-destructive transition-all duration-200"
                                onClick={() =>
                                  handleRemoveGame(list.id, game.id)
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </DlesButton>
                            </div>
                          </div>
                        ))}
                      </div>
                      {list.games.length > 5 && (
                        <div className="absolute -bottom-2 left-0 right-0 h-12 bg-gradient-to-t from-card/20 to-transparent flex items-end justify-center pb-2 pointer-events-none group-hover/list:opacity-0 transition-opacity duration-300">
                          <span className="text-[10px] text-muted-foreground/70 font-mono bg-background/50 backdrop-blur-[1px] px-2 py-0.5 rounded-full border border-border/10 shadow-sm flex items-center gap-1">
                            Scroll for more
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
