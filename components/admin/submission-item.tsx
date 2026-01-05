"use client";

import { Badge } from "@/components/ui/badge";
import { DlesTopic } from "@/components/design/dles-topic";
import { DlesButton } from "@/components/design/dles-button";
import { cn } from "@/lib/utils";
import { TOPIC_COLORS } from "@/lib/constants";
import { ExternalLink, Check, X, Loader2 } from "lucide-react";
import type { SubmissionStatus, Topic } from "@/app/generated/prisma/client";
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

interface SubmissionItemProps {
  submission: Submission;
  isProcessing: boolean;
  canManage: boolean;
  onUpdateStatus: (id: string, status: SubmissionStatus) => Promise<void>;
}

export function SubmissionItem({
  submission,
  isProcessing,
  canManage,
  onUpdateStatus,
}: SubmissionItemProps) {
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-[180px_100px_minmax(0,1fr)_150px] gap-4 items-center flex-1 min-w-0">
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-medium truncate"
            title={submission.title}
          >
            {submission.title}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            by {submission.user.name || submission.user.email}
          </span>
        </div>

        <div className="flex items-center">
          <DlesTopic
            topic={submission.topic}
            className="text-[10px] shrink-0"
          />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-xs text-muted-foreground truncate font-mono"
            title={submission.link}
          >
            {submission.link}
          </span>
          <a
            href={submission.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <span className="text-[10px] text-muted-foreground truncate">
          {formatDistanceToNow(new Date(submission.createdAt))} ago
        </span>
      </div>

      {canManage && submission.status === "PENDING" && (
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <DlesButton
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onUpdateStatus(submission.id, "REJECTED")}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </DlesButton>
          <DlesButton
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
            onClick={() => onUpdateStatus(submission.id, "APPROVED")}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </DlesButton>
        </div>
      )}

      {submission.status !== "PENDING" && (
        <Badge
          variant={submission.status === "APPROVED" ? "default" : "destructive"}
          className={cn(
            "text-[10px] h-6 px-2 shrink-0 ml-auto",
            submission.status === "APPROVED"
              ? "bg-green-600/20 text-green-700 hover:bg-green-600/20"
              : ""
          )}
        >
          {submission.status}
        </Badge>
      )}
    </div>
  );
}
