"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DlesTopic } from "@/components/design/dles-topic";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { TOPICS } from "@/lib/constants";
import { Plus } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";

interface AddGameDialogProps {
  onAdd: (game: {
    title: string;
    link: string;
    topic: Topic;
    description: string;
  }) => Promise<void>;
}

import { DlesButton } from "@/components/design/dles-button";

export function AddGameDialog({ onAdd }: AddGameDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState<Topic>("words");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    title.trim().length > 0 &&
    link.trim().length > 0 &&
    description.trim().length >= 10;

  const handleAdd = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onAdd({ title, link, topic, description });
      setTitle("");
      setLink("");
      setDescription("");
      setTopic("words");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DlesButton>
          <Plus className="h-3.5 w-3.5" />
          Add Game
        </DlesButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Custom Game</AlertDialogTitle>
          <AlertDialogDescription>
            Add a new game to your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <Field>
            <Label
              htmlFor="game-title"
              className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 block"
            >
              Title
            </Label>
            <Input
              id="game-title"
              placeholder="Game name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field>
            <Label
              htmlFor="game-link"
              className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 block"
            >
              Link
            </Label>
            <Input
              id="game-link"
              placeholder="https://example.com/game"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </Field>
          <Field>
            <Label
              htmlFor="game-topic"
              className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 block"
            >
              Category
            </Label>
            <Select value={topic} onValueChange={(v) => setTopic(v as Topic)}>
              <SelectTrigger id="game-topic" className="w-full capitalize">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    <DlesTopic topic={t} size="lg" className="font-bold" />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <div className="flex items-center justify-between mb-1.5">
              <Label
                htmlFor="game-description"
                className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest"
              >
                Description
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {description.length}/200
              </span>
            </div>
            <Textarea
              id="game-description"
              placeholder="A brief 1-2 sentence description of the game..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              maxLength={200}
            />
            {description.length > 0 && description.length < 10 && (
              <p className="text-xs text-destructive mt-1">
                Description must be at least 10 characters
              </p>
            )}
          </Field>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <DlesButton onClick={handleAdd} disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Adding..." : "Add Game"}
          </DlesButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
