"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DlesTopic } from "@/components/design/dles-topic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  List,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  title: string;
  topic: string;
}

interface GameList {
  id: string;
  name: string;
  games: Game[];
}

interface ListsClientProps {
  initialLists: GameList[];
}

export function ListsClient({ initialLists }: ListsClientProps) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName }),
      });

      if (res.ok) {
        const newList = await res.json();
        setLists([newList, ...lists]);
        setNewListName("");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  const handleRenameList = async (listId: string) => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (res.ok) {
        setLists(
          lists.map((l) => (l.id === listId ? { ...l, name: editName } : l))
        );
        setEditingListId(null);
      }
    } catch (error) {
      console.error("Failed to rename list:", error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLists(lists.filter((l) => l.id !== listId));
      }
    } catch (error) {
      console.error("Failed to delete list:", error);
    }
  };

  const handleRemoveGame = async (listId: string, gameId: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}/games`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      if (res.ok) {
        setLists(
          lists.map((l) =>
            l.id === listId
              ? { ...l, games: l.games.filter((g) => g.id !== gameId) }
              : l
          )
        );
      }
    } catch (error) {
      console.error("Failed to remove game:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Game Lists</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateList}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              You haven't created any lists yet.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Create a list to organize your favorite games!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((list) => (
            <Card key={list.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {editingListId === list.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRenameList(list.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleRenameList(list.id)
                    }
                    autoFocus
                    className="h-8 w-48 text-sm"
                  />
                ) : (
                  <CardTitle className="text-base font-semibold">
                    {list.name}
                  </CardTitle>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingListId(list.id);
                        setEditName(list.name);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {list.games.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No games in this list yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {list.games.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 group hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {game.title}
                          </span>
                          <DlesTopic topic={game.topic} className="text-xs" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveGame(list.id, game.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3 font-medium">
                  {list.games.length} game{list.games.length !== 1 && "s"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
