"use client";

import { useState } from "react";
import { List, Plus, Loader2, Gamepad } from "lucide-react";
import { ListChip } from "@/components/features/lists/list-chip";
import { Button } from "@/components/ui/button"; // Note: Changed from Button to generic since DlesButton might not be used or standard button is needed. Reverting to project standard.
// Actually project seems to use DlesButton or standard Button. The original file had Button import.
// Checking imports: Input.
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DlesSelect } from "@/components/design/dles-select";
import { useLists } from "@/lib/use-lists";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  LIST_COLORS,
  LIST_COLOR_OPTIONS,
  LIST_CARD_STYLES,
} from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ListsDropdownProps {
  gameId: string;
  className?: string; // For hover visibility
}

export function ListsDropdown({ gameId, className }: ListsDropdownProps) {
  const { data: session } = useSession();
  const {
    lists,
    createList,
    addGameToList,
    removeGameFromList,
    getListsForGame,
  } = useLists();

  const [isSubmitting, setIsSubmitting] = useState(false); // Network state
  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("slate");

  if (!session) return null;

  const currentListIds = getListsForGame(gameId);

  // Wrapper for onChange to handle immediate API calls
  const handleChange = async (newValues: string | string[]) => {
    const newIds = Array.isArray(newValues) ? newValues : [newValues];

    // Find what was added
    const added = newIds.find((id) => !currentListIds.includes(id));
    if (added) {
      await addGameToList(added, gameId);
    }

    // Find what was removed
    const removed = currentListIds.find((id) => !newIds.includes(id));
    if (removed) {
      await removeGameFromList(removed, gameId);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsSubmitting(true);
    const newList = await createList(newListName, newListColor);
    if (newList) {
      await addGameToList(newList.id, gameId);
      setNewListName("");
      setNewListColor("slate");
    }
    setIsSubmitting(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DlesSelect
              value={currentListIds}
              onChange={handleChange}
              multi
              searchable={lists.length >= 5}
              placeholder="Add to list"
              emptyText="No lists found."
              options={lists.map((list) => ({
                value: list.id,
                label: list.name,
              }))}
              trigger={
                <Button
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "p-1 h-auto w-auto rounded-md text-muted-foreground shrink-0",
                    "hover:bg-muted hover:text-foreground",
                    className
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              }
              renderOption={(option) => {
                const list = lists.find((l) => l.id === option.value);
                if (!list) return null;

                const color = list.color || "slate";

                return (
                  <ListChip
                    label={option.label}
                    count={list.games.length}
                    color={color}
                  />
                );
              }}
              contentClassName="w-auto p-0"
              footer={
                <div className="p-2 border-t border-border/40">
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider px-1">
                      New List
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateList()
                        }
                        className="h-8 text-xs bg-background/50 border-border/40 focus:border-border transition-all flex-1"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "w-8 h-8 rounded-md border shrink-0 transition-all hover:scale-105 focus:scale-105 border-border/40",
                              LIST_CARD_STYLES[newListColor]?.dot ||
                                "bg-slate-500"
                            )}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="end">
                          <div className="grid grid-cols-4 gap-2">
                            {LIST_COLOR_OPTIONS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewListColor(color)}
                                className={cn(
                                  "w-5 h-5 rounded-full transition-transform hover:scale-110",
                                  LIST_CARD_STYLES[color]?.dot,
                                  newListColor === color &&
                                    "ring-2 ring-offset-2 ring-foreground"
                                )}
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs border-dashed border-border/60 hover:border-primary/40 hover:text-primary transition-all"
                      onClick={handleCreateList}
                      disabled={!newListName.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Create List
                    </Button>
                  </div>
                </div>
              }
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Add to list
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
