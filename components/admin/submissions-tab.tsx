"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Clock, Layers } from "lucide-react";
import type { SubmissionStatus, Topic } from "@/app/generated/prisma/client";
import { DlesButton } from "@/components/design/dles-button";
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
        <h2 className="text-heading-section">
          Game Submissions ({filteredSubmissions.length})
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 text-xs text-muted-foreground bg-muted/40 border-border/40 hover:border-border hover:bg-muted/60 focus:bg-background focus:border-border transition-all"
          />
        </div>
        <div className="flex gap-2">
          <DlesButton
            isActive={statusFilter === "PENDING"}
            onClick={() => setStatusFilter("PENDING")}
          >
            <Clock className="h-3.5 w-3.5" />
            Pending
          </DlesButton>
          <DlesButton
            isActive={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          >
            <Layers className="h-3.5 w-3.5" />
            All
          </DlesButton>
        </div>
      </div>

      <div className="rounded-md border border-border/40 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="divide-y divide-border/30">
            {filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                  <Layers className="h-6 w-6 opacity-20" />
                </div>
                <p className="text-body">No submissions found</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="px-4 py-3 hover:bg-muted/5 transition-colors"
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
    </div>
  );
}
