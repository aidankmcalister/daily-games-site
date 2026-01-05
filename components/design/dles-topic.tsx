import React from "react";
import { Badge } from "@/components/ui/badge";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn, formatTopic } from "@/lib/utils";
import type { Topic } from "@/app/generated/prisma/client";

interface DlesTopicProps {
  topic: string | Topic;
  className?: string;
  icon?: React.ReactNode;
  iconPos?: "left" | "right";
  children?: React.ReactNode;
}

export function DlesTopic({
  topic,
  className,
  icon,
  iconPos = "left",
  children,
}: DlesTopicProps) {
  const content = (
    <>
      {icon && iconPos === "left" && (
        <span className="mr-1 flex items-center">{icon}</span>
      )}
      <span className="truncate">{formatTopic(topic as string)}</span>
      {children}
      {icon && iconPos === "right" && (
        <span className="ml-1 flex items-center">{icon}</span>
      )}
    </>
  );

  if (topic === "all") {
    return (
      <Badge
        className={cn(
          "capitalize font-normal w-fit bg-pink-500/20 text-pink-700 dark:text-pink-300 border-0",
          className
        )}
      >
        {content}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize font-normal w-fit",
        TOPIC_COLORS[topic as string] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {content}
    </Badge>
  );
}
