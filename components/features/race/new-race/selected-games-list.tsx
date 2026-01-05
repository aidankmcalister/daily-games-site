"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DlesTopic } from "@/components/design/dles-topic";
import { DlesButton } from "@/components/design/dles-button";
import { Gamepad, GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Topic } from "@/app/generated/prisma/client";

interface Game {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  archived?: boolean;
}

interface SelectedGamesListProps {
  selectedGameIds: string[];
  allGames: Game[];
  onRemove: (id: string) => void;
  onReorder: (result: DropResult) => void;
}

export function SelectedGamesList({
  selectedGameIds,
  allGames,
  onRemove,
  onReorder,
}: SelectedGamesListProps) {
  if (selectedGameIds.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden p-0">
      <CardHeader className="p-0 px-4 py-3 border-b border-primary/10">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-primary/80">
          <Gamepad className="h-4 w-4" />
          Games
          <Badge className="font-black rounded-sm px-2 py-0.5 bg-primary text-primary-foreground text-[10px]">
            {selectedGameIds.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <DragDropContext onDragEnd={onReorder}>
          <Droppable droppableId="selected-games">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="max-h-[280px] overflow-y-auto"
              >
                {selectedGameIds.map((id, index) => {
                  const game = allGames.find((g) => g.id === id);
                  if (!game) return null;
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "px-4 py-2.5 flex items-center gap-3 border-b border-primary/10 last:border-b-0",
                            snapshot.isDragging && "bg-primary/10 shadow-lg"
                          )}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-muted-foreground/50 hover:text-primary cursor-grab"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium truncate flex-1">
                            {game.title}
                          </span>
                          <DlesTopic
                            topic={game.topic}
                            className="text-[9px] px-1.5 h-4 border-none"
                          />
                          <DlesButton
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onRemove(id)}
                            className="h-6 w-6 text-muted-foreground/50 hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </DlesButton>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
