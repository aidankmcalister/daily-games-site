"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { TOPICS } from "@/lib/constants";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const suggestionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  link: z.string().url("Must be a valid URL"),
  topic: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

interface GameSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameSubmissionDialog({
  open,
  onOpenChange,
}: GameSubmissionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      topic: "puzzle",
    },
  });

  const selectedTopic = watch("topic");

  const onSubmit = async (data: SuggestionFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Suggestion submitted!", {
          description: "Thank you for contributing to the collection.",
        });
        reset();
        onOpenChange(false);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit suggestion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suggest a New Game</DialogTitle>
          <DialogDescription>
            Know a great daily game? Share it with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Field>
            <FieldLabel htmlFor="title">Game Title</FieldLabel>
            <Input
              id="title"
              placeholder="e.g. Wordle"
              {...register("title")}
            />
            {errors.title && <FieldError errors={[errors.title]} />}
          </Field>

          <Field>
            <FieldLabel htmlFor="link">Game URL</FieldLabel>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/game"
              {...register("link")}
            />
            {errors.link && <FieldError errors={[errors.link]} />}
          </Field>

          <Field>
            <FieldLabel htmlFor="topic">Category</FieldLabel>
            <Select
              value={selectedTopic}
              onValueChange={(v) =>
                setValue("topic", v, { shouldValidate: true })
              }
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((topic) => (
                  <SelectItem key={topic} value={topic} className="capitalize">
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.topic && <FieldError errors={[errors.topic]} />}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">
              Description (Optional)
            </FieldLabel>
            <Textarea
              id="description"
              placeholder="A brief description of the game..."
              {...register("description")}
              className="resize-none"
            />
            {errors.description && <FieldError errors={[errors.description]} />}
          </Field>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Suggestion
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
