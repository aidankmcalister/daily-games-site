"use client";

import { useState, useEffect } from "react";
import { List, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DlesButton } from "@/components/design/dles-button";
import { DlesSelect } from "@/components/design/dles-select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
}

export function ListsDropdown({ gameId }: ListsDropdownProps) {
  const { data: session } = useSession();
  const {
    lists,
    createList,
    addGameToList,
    removeGameFromList,
    getListsForGame,
  } = useLists();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("slate");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Initialize selected lists when dialog opens (only on open, not on lists change)
  useEffect(() => {
    if (isOpen) {
      setSelectedListIds(getListsForGame(gameId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, gameId]);

  if (!session) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    const currentLists = getListsForGame(gameId);

    for (const listId of selectedListIds.filter(
      (id) => !currentLists.includes(id)
    )) {
      await addGameToList(listId, gameId);
    }

    for (const listId of currentLists.filter(
      (id) => !selectedListIds.includes(id)
    )) {
      await removeGameFromList(listId, gameId);
    }

    setIsSubmitting(false);
    setIsOpen(false);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsSubmitting(true);
    const newList = await createList(newListName, newListColor);
    if (newList) {
      await addGameToList(newList.id, gameId);
      // Filter to only valid existing list IDs, then add the new one
      const existingListIds = new Set(lists.map((l) => l.id));
      setSelectedListIds((prev) => {
        const validPrev = prev.filter((id) => existingListIds.has(id));
        return [...validPrev, newList.id];
      });
      setNewListName("");
      setNewListColor("slate");
    }
    setIsSubmitting(false);
  };

  const hasChanges = () => {
    const currentLists = getListsForGame(gameId);
    if (currentLists.length !== selectedListIds.length) return true;
    return !currentLists.every((id) => selectedListIds.includes(id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <DlesButton
                variant="ghost"
                size="icon-sm"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "p-1 rounded-md text-muted-foreground shrink-0",
                  "hover:bg-muted hover:text-foreground"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </DlesButton>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Add to list
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="w-full max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Existing lists multi-select */}
          {lists.length > 0 && (
            <div className="w-full">
              <Label className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 block">
                Your Lists
              </Label>
              <div className="w-full">
                <DlesSelect
                  value={selectedListIds}
                  onChange={setSelectedListIds}
                  placeholder="Select lists..."
                  multi
                  className="w-full"
                  options={lists.map((list) => ({
                    value: list.id,
                    label: list.name,
                  }))}
                  renderOption={(option: { value: string; label: string }) => {
                    const list = lists.find((l) => l.id === option.value);
                    const colorClass = list
                      ? LIST_COLORS[list.color] || LIST_COLORS.slate
                      : LIST_COLORS.slate;
                    return (
                      <Badge
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full normal-case pointer-events-none",
                          colorClass
                        )}
                      >
                        {option.label}
                      </Badge>
                    );
                  }}
                  renderSelected={(option: {
                    value: string;
                    label: string;
                  }) => {
                    const list = lists.find((l) => l.id === option.value);
                    const colorClass = list
                      ? LIST_COLORS[list.color] || LIST_COLORS.slate
                      : LIST_COLORS.slate;
                    return (
                      <Badge
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full normal-case",
                          colorClass
                        )}
                      >
                        {option.label}
                      </Badge>
                    );
                  }}
                />
              </div>
            </div>
          )}

          {/* Divider */}
          {lists.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-background px-2 text-muted-foreground/60 font-bold">
                  Or
                </span>
              </div>
            </div>
          )}

          {/* Create new list */}
          <div className="w-full">
            <Label className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 block">
              Create New List
            </Label>
            <div className="flex gap-2 w-full">
              <Input
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && newListName.trim() && handleCreateList()
                }
                className="h-10 flex-1 min-w-0"
              />
              <Popover
                open={isColorPickerOpen}
                onOpenChange={setIsColorPickerOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-10 h-10 rounded-lg shrink-0 border border-border/50",
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
              <Button
                type="button"
                onClick={handleCreateList}
                disabled={!newListName.trim() || isSubmitting}
                className="shrink-0 h-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges() || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
