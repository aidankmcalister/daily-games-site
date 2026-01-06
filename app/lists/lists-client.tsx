"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DlesTopic } from "@/components/design/dles-topic";
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
} from "lucide-react";

interface Game {
  id: string;
  title: string;
  topic: string;
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
}

export function ListsClient({ initialLists }: ListsClientProps) {
  // Use the shared lists context for syncing
  const {
    lists: sharedLists,
    createList,
    deleteList,
    renameList,
    updateListColor,
    isLoading,
  } = useLists();

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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Game Lists</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <DlesButton size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New List
            </DlesButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Field>
                <FieldLabel>List Name</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Favorites, Completed..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      newListName.trim() &&
                      handleCreateList()
                    }
                    className="h-11 flex-1"
                  />
                  <Popover
                    open={isColorPickerOpen}
                    onOpenChange={setIsColorPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-11 h-11 rounded-lg shrink-0 border border-border/50",
                          LIST_CARD_STYLES[newListColor]?.dot || "bg-slate-500"
                        )}
                        title="Pick color"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="end">
                      <div className="grid grid-cols-6 gap-1.5">
                        {LIST_COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setNewListColor(color);
                              setIsColorPickerOpen(false);
                            }}
                            className={cn(
                              "w-5 h-5 rounded-full",
                              LIST_CARD_STYLES[color]?.dot,
                              newListColor === color &&
                                "ring-2 ring-offset-1 ring-offset-background ring-foreground"
                            )}
                            title={color}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">No lists yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
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
                      <h3 className="font-semibold truncate">{list.name}</h3>
                    )}
                    <p className="text-xs opacity-70 mt-0.5">
                      {list.games.length}{" "}
                      {list.games.length === 1 ? "game" : "games"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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
                    <div className="space-y-1">
                      {list.games.slice(0, 4).map((game) => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between py-1.5 px-2 rounded-md group/item hover:bg-background/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm truncate text-foreground">
                              {game.title}
                            </span>
                            <DlesTopic topic={game.topic} />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-5 w-5 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => handleRemoveGame(list.id, game.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {list.games.length > 4 && (
                        <p className="text-xs opacity-60 text-center pt-2">
                          +{list.games.length - 4} more
                        </p>
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
