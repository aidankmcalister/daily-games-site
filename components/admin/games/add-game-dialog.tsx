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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { TOPICS } from "@/lib/constants";
import { Plus } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";

interface AddGameDialogProps {
  onAdd: (game: { title: string; link: string; topic: Topic }) => Promise<void>;
}

export function AddGameDialog({ onAdd }: AddGameDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [topic, setTopic] = useState<Topic>("puzzle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!title || !link) return;
    setIsSubmitting(true);
    try {
      await onAdd({ title, link, topic });
      setTitle("");
      setLink("");
      setTopic("puzzle");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Game
        </Button>
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
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleAdd}
            disabled={isSubmitting || !title.trim() || !link.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Game"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
