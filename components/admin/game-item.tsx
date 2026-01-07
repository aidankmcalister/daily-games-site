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
import { DlesBadge } from "@/components/design/dles-badge";
import { formatTopic } from "@/lib/utils";
import { TOPICS, TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pencil, Trash, Archive } from "lucide-react";
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
            className="h-8 bg-background/50 border-border/20 focus:border-primary/50 transition-all font-medium"
            placeholder="Title"
          />
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="h-8 bg-background/50 border-border/20 focus:border-primary/50 transition-all font-mono text-xs"
            placeholder="Link"
          />
          <Select value={topic} onValueChange={(v) => setTopic(v as Topic)}>
            <SelectTrigger className="h-8 capitalize bg-background/50 border-border/20 focus:border-primary/50 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t} value={t}>
                  <DlesBadge text={formatTopic(t)} color={t} size="sm" />
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
        "grid grid-cols-[16px_1fr_100px] md:grid-cols-[16px_180px_150px_minmax(0,1fr)_80px_80px] gap-4 items-center w-full",
        game.archived && "opacity-60 grayscale"
      )}
    >
      {/* Selection Checkbox */}
      <div className="flex items-center justify-center">
        {canManage && onSelect ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary/20 bg-background/50 cursor-pointer"
          />
        ) : (
          <div className="w-3.5" />
        )}
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        {game.archived && (
          <Badge
            variant="outline"
            className="h-5 text-micro px-1 bg-muted/40 border-border/40 text-muted-foreground shrink-0"
          >
            Archived
          </Badge>
        )}
        <span className="text-body truncate" title={game.title}>
          {game.title}
        </span>
      </div>

      {/* Topic */}
      <div className="items-center hidden md:flex">
        <DlesBadge
          text={formatTopic(game.topic)}
          color={game.topic}
          size="sm"
        />
      </div>

      {/* Link */}
      <span
        className="text-xs text-muted-foreground truncate font-mono hidden md:block"
        title={game.link}
      >
        {game.link}
      </span>

      {/* Stats */}
      <span className="text-xs text-muted-foreground truncate text-right md:text-left font-mono hidden md:block">
        {game.playCount || 0}
      </span>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        {canManage && (
          <>
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
                  <Trash className="h-3.5 w-3.5" />
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
          </>
        )}
      </div>
    </div>
  );
}
