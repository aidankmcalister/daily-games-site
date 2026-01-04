"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { PageHeader } from "@/components/page-header";
import { TOPICS } from "@/lib/constants";
import { Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SubmitGamePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [topic, setTopic] = useState<Topic | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auth redirect happens in effect or check here
  if (!session) {
    return (
      <div className="container py-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <h1 className="text-2xl font-bold">Sign in Required</h1>
        <p className="text-muted-foreground">
          You must be signed in to submit game suggestions.
        </p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !link || !topic) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          link,
          topic,
          description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
      } else {
        toast.error(data.error || "Failed to submit game");
        if (data.error === "Submissions are currently disabled") {
          // handle specific error UI if needed
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold">Submission Received!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thanks for suggesting <strong>{title}</strong>. We'll review it
              shortly and add it to the collection if it fits!
            </p>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
              <Button
                onClick={() => {
                  setTitle("");
                  setLink("");
                  setTopic("");
                  setDescription("");
                  setIsSuccess(false);
                }}
              >
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-4 mb-4 text-muted-foreground"
        >
          <Link href="/">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Games
          </Link>
        </Button>
        <PageHeader
          title="Submit a Game"
          subtitle="Found a great game? Suggest it for the collection."
        />
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <Field>
              <FieldLabel htmlFor="title">Game Title</FieldLabel>
              <Input
                id="title"
                placeholder="e.g. Wordle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="link">Game Link</FieldLabel>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="topic">Category</FieldLabel>
              <Select
                value={topic}
                onValueChange={(v) => setTopic(v as Topic)}
                required
              >
                <SelectTrigger id="topic" className="capitalize">
                  <SelectValue placeholder="Select a category" />
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

            <Field>
              <FieldLabel htmlFor="description">Notes (Optional)</FieldLabel>
              <Textarea
                id="description"
                placeholder="Any extra info or why it's great..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Field>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Submit Game
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
