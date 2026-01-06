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
import { DlesTopic } from "@/components/design/dles-topic";
import { DlesSelect } from "@/components/design/dles-select";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { TOPICS } from "@/lib/constants";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const suggestionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  link: z.string().url("Must be a valid URL"),
  topic: z.string().min(1, "Category is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be 200 characters or less"),
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
      topic: "words",
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
            <Label
              htmlFor="title"
              className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 block"
            >
              Game Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Wordle"
              {...register("title")}
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-muted transition-colors rounded-lg px-4"
            />
            {errors.title && <FieldError errors={[errors.title]} />}
          </Field>

          <Field>
            <Label
              htmlFor="link"
              className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 block"
            >
              Game URL
            </Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/game"
              {...register("link")}
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-muted transition-colors rounded-lg px-4"
            />
            {errors.link && <FieldError errors={[errors.link]} />}
          </Field>

          <Field>
            <Label
              htmlFor="topic"
              className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 block"
            >
              Category
            </Label>
            <DlesSelect
              topics
              value={selectedTopic}
              onChange={(v) => setValue("topic", v, { shouldValidate: true })}
              placeholder="Select a category"
            />
            {errors.topic && <FieldError errors={[errors.topic]} />}
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-1.5">
              <Label
                htmlFor="description"
                className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest"
              >
                Description
              </Label>
              <span className="text-xs text-muted-foreground">
                {watch("description")?.length || 0}/200
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="A brief 1-2 sentence description of the game..."
              {...register("description")}
              className="resize-none bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-muted transition-colors rounded-lg p-4 min-h-[100px]"
              maxLength={200}
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
