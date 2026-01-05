"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { SubmissionStatus, Topic } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import { SubmissionItem } from "./submission-item";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "ALL">(
    "PENDING"
  );

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
        body: JSON.stringify({ id, status }),
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

  const filteredSubmissions = submissions
    .filter((s) => {
      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.user.email?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">
          Game Submissions ({filteredSubmissions.length})
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("PENDING")}
            className="h-9"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("ALL")}
            className="h-9"
          >
            All
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <div className="divide-y">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No submissions found.
            </div>
          ) : (
            filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <SubmissionItem
                  submission={sub}
                  isProcessing={processingId === sub.id}
                  canManage={canManageGames}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
