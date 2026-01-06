import { DlesButton } from "@/components/design/dles-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { DlesTopic } from "@/components/design/dles-topic";
import { TOPICS, TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Archive } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";
import { useState } from "react";

export interface Game {
  id: string;
  title: string;
  link: string;
  topic: string;
  playCount: number;
  createdAt: string;
  archived: boolean;
}

interface GameItemProps {
  game: Game;
  isEditing: boolean;
  canManage: boolean;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    data: { title: string; link: string; topic: Topic }
  ) => Promise<void>;
  onCancelEdit: () => void;
}

export function GameItem({
  game,
  isEditing,
  canManage,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
}: GameItemProps) {
  const [title, setTitle] = useState(game.title);
  const [link, setLink] = useState(game.link);
  const [topic, setTopic] = useState<Topic>(game.topic as Topic);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate(game.id, { title, link, topic });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full pl-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8"
            placeholder="Title"
          />
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="h-8"
            placeholder="Link"
          />
          <Select value={topic} onValueChange={(v) => setTopic(v as Topic)}>
            <SelectTrigger className="h-8 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t} value={t}>
                  <DlesTopic topic={t} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <DlesButton size="sm" onClick={handleSave} disabled={isSubmitting}>
            Save
          </DlesButton>
          <DlesButton size="sm" variant="outline" onClick={onCancelEdit}>
            Cancel
          </DlesButton>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 w-full",
        game.archived && "opacity-60 grayscale"
      )}
    >
      {/* Selection Checkbox */}
      {canManage && onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-[180px_200px_minmax(0,1fr)_100px] gap-4 items-center flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {game.archived && (
            <Badge variant="outline" className="h-5 text-[10px] px-1 bg-muted">
              Archived
            </Badge>
          )}
          <span className="text-sm font-medium truncate" title={game.title}>
            {game.title}
          </span>
        </div>

        <div className="flex items-center">
          <DlesTopic topic={game.topic} />
        </div>

        <span
          className="text-xs text-muted-foreground truncate font-mono"
          title={game.link}
        >
          {game.link}
        </span>

        <span className="text-xs text-muted-foreground truncate">
          {game.playCount || 0} plays
        </span>
      </div>

      {canManage && (
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <DlesButton
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              setTitle(game.title);
              setLink(game.link);
              setTopic(game.topic as Topic);
              onEdit(game);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </DlesButton>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DlesButton
                size="icon-sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </DlesButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {game.title}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(game.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
