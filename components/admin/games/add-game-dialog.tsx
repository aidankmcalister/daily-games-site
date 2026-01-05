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
import { Button } from "@/components/ui/button";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { TOPICS } from "@/lib/constants";
import { formatTopic } from "@/lib/utils";
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
            <FieldLabel htmlFor="game-title">Title</FieldLabel>
            <Input
              id="game-title"
              placeholder="Game name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="game-link">Link</FieldLabel>
            <Input
              id="game-link"
              placeholder="https://example.com/game"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="game-topic">Category</FieldLabel>
            <Select value={topic} onValueChange={(v) => setTopic(v as Topic)}>
              <SelectTrigger id="game-topic" className="w-full capitalize">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    <DlesTopic topic={t} className="text-[10px] px-1.5 h-4" />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="game-description">Description</FieldLabel>
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
          <Button onClick={handleAdd} disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Adding..." : "Add Game"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
