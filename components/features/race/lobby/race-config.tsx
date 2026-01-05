"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Gamepad2, GripVertical } from "lucide-react";
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
    <Card className="border border-border shadow-none bg-card h-full">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-sm font-bold flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-muted-foreground text-[10px] font-black">
            <Gamepad2 className="h-3.5 w-3.5" />
          </div>
          Games in this Race
          <Badge
            variant="secondary"
            className="ml-1 font-bold rounded-full px-2 py-0 border-none bg-primary/10 text-primary text-[10px]"
          >
            {race.raceGames.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-2">
        <TooltipProvider delayDuration={200}>
          <DragDropContext onDragEnd={onReorder}>
            <Droppable droppableId="race-games">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="max-h-[400px] overflow-y-auto"
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
                            "px-4 py-3 flex items-center gap-3 border-b border-border last:border-b-0",
                            snapshot.isDragging && "bg-muted shadow-lg"
                          )}
                        >
                          {isCreator &&
                            (race.status === "waiting" ||
                              race.status === "ready") && (
                              <div
                                {...provided.dragHandleProps}
                                className="text-muted-foreground/50 hover:text-primary cursor-grab"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                            )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="font-semibold text-sm truncate">
                                  {rg.game.title}
                                </span>
                                <DlesTopic
                                  topic={rg.game.topic}
                                  className="text-[9px] px-1.5 h-4 shrink-0"
                                />
                              </div>
                            </TooltipTrigger>
                            {rg.game.description && (
                              <TooltipContent>
                                <p className="max-w-xs">
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
      </CardContent>
    </Card>
  );
}
