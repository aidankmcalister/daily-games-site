"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ExternalLink, Check, X, Loader2 } from "lucide-react";
import type { SubmissionStatus, Topic } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Submission {
  id: string;
  title: string;
  link: string;
  topic: Topic;
  description: string | null;
  status: SubmissionStatus;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export function SubmissionsTab({
  canManageGames,
}: {
  canManageGames: boolean;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: SubmissionStatus) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }), // Add reviewNote if UI supports it
      });

      if (res.ok) {
        toast.success(`Submission ${status.toLowerCase()}`);
        fetchSubmissions();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");
  const historySubmissions = submissions.filter((s) => s.status !== "PENDING");

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Review Queue
          <Badge variant="secondary">{pendingSubmissions.length}</Badge>
        </h2>

        {pendingSubmissions.length === 0 ? (
          <div className="p-8 text-center border rounded-md bg-muted/20 text-muted-foreground">
            No pending submissions.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingSubmissions.map((sub) => (
              <Card key={sub.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        {sub.title}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize text-xs font-normal",
                            TOPIC_COLORS[sub.topic as string]
                          )}
                        >
                          {sub.topic}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                        Submitted by {sub.user.name || sub.user.email} •{" "}
                        {formatDistanceToNow(new Date(sub.createdAt))} ago
                      </CardDescription>
                    </div>
                    <a
                      href={sub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="text-sm pb-3">
                  <div className="bg-muted/50 p-2 rounded text-muted-foreground font-mono text-xs mb-2 truncate">
                    {sub.link}
                  </div>
                  {sub.description && (
                    <p className="text-muted-foreground">{sub.description}</p>
                  )}
                </CardContent>
                {canManageGames && (
                  <CardFooter className="flex justify-end gap-2 pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={() => handleUpdateStatus(sub.id, "REJECTED")}
                      disabled={!!processingId}
                    >
                      {processingId === sub.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(sub.id, "APPROVED")}
                      disabled={!!processingId}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                    >
                      {processingId === sub.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve & Add
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {historySubmissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            History
          </h2>
          <div className="rounded-md border bg-card/50">
            <div className="divide-y text-sm">
              {historySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        sub.status === "APPROVED" ? "default" : "destructive"
                      }
                      className={cn(
                        "text-[10px] w-20 justify-center",
                        sub.status === "APPROVED" ? "bg-green-600" : ""
                      )}
                    >
                      {sub.status}
                    </Badge>
                    <span className="font-medium">{sub.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(sub.createdAt))} ago
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline-block">
                    by {sub.user.name || sub.user.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
