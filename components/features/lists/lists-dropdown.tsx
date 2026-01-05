"use client";

import { useState } from "react";
import { Plus, List, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLists } from "@/lib/use-lists";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ListsDropdownProps {
  gameId: string;
}

export function ListsDropdown({ gameId }: ListsDropdownProps) {
  const { data: session } = useSession();
  const { lists, createList, addGameToList, isLoading } = useLists();
  const [isOpen, setIsOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (!session) return null;

  const handleAdd = async () => {
    if (!selectedListId) return;
    setIsAdding(true);
    await addGameToList(selectedListId, gameId);
    setIsAdding(false);
    setIsOpen(false);
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) return;
    setIsAdding(true);
    const newList = await createList(newListName);
    if (newList) {
      await addGameToList(newList.id, gameId);
      setNewListName("");
      setIsOpen(false);
    }
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "p-1 rounded-md text-muted-foreground shrink-0",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-muted hover:text-foreground"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Add to list
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {lists.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select existing list
                </label>
                <div className="flex gap-2">
                  <Select
                    value={selectedListId}
                    onValueChange={setSelectedListId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a list..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((list) => {
                        const hasGame = list.games.includes(gameId);
                        return (
                          <SelectItem
                            key={list.id}
                            value={list.id}
                            disabled={hasGame}
                          >
                            <span className="flex items-center gap-2 justify-between w-full">
                              {list.name}
                              {hasGame && <Check className="h-3 w-3" />}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAdd}
                    disabled={!selectedListId || isAdding}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or create new
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Create new list</label>
            <div className="flex gap-2">
              <Input
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={handleCreateAndAdd}
                disabled={!newListName.trim() || isAdding}
              >
                Create & Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
