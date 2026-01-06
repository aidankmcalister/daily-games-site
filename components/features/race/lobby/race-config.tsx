"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DlesTopic } from "@/components/design/dles-topic";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Race, RaceGame } from "@/app/race/[id]/page";

interface RaceConfigProps {
  race: Race;
  orderedGames: RaceGame[];
  isCreator: boolean;
  onReorder: (result: DropResult) => void;
}

export function RaceConfig({
  race,
  orderedGames,
  isCreator,
  onReorder,
}: RaceConfigProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          Games in this Race
        </Label>
        <Badge
          variant="secondary"
          className="font-black rounded-full px-2 py-0 border-none bg-primary/10 text-primary text-[9px]"
        >
          {race.raceGames.length}
        </Badge>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden transition-all">
        <TooltipProvider delayDuration={200}>
          <DragDropContext onDragEnd={onReorder}>
            <Droppable droppableId="race-games">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y divide-border/30"
                >
                  {orderedGames.map((rg, index) => (
                    <Draggable
                      key={rg.id}
                      draggableId={rg.id}
                      index={index}
                      isDragDisabled={
                        !isCreator ||
                        (race.status !== "waiting" && race.status !== "ready")
                      }
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "px-4 py-3 flex items-center gap-3 bg-muted/5 transition-colors",
                            snapshot.isDragging &&
                              "bg-muted/40 shadow-xl z-50 ring-1 ring-primary/20",
                            !snapshot.isDragging && "hover:bg-muted/10"
                          )}
                        >
                          {isCreator &&
                            (race.status === "waiting" ||
                              race.status === "ready") && (
                              <div
                                {...provided.dragHandleProps}
                                className="text-muted-foreground/30 hover:text-primary transition-colors cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                            )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-3 flex-1 min-w-0  justify-between">
                                <span className="font-bold text-xs truncate text-foreground/90">
                                  {rg.game.title}
                                </span>
                                <DlesTopic topic={rg.game.topic} />
                              </div>
                            </TooltipTrigger>
                            {rg.game.description && (
                              <TooltipContent side="right">
                                <p className="max-w-xs text-xs">
                                  {rg.game.description}
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </TooltipProvider>
      </div>
    </div>
  );
}
