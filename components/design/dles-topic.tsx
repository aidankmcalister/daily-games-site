import React from "react";
import { Badge } from "@/components/ui/badge";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn, formatTopic } from "@/lib/utils";
import type { Topic } from "@/app/generated/prisma/client";

interface DlesTopicProps {
  topic: string | Topic;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPos?: "left" | "right";
  children?: React.ReactNode;
}

const SIZE_CLASSES = {
  xs: "text-[8px] h-3 px-1 font-bold",
  sm: "text-[10px] h-4 px-2 font-bold",
  md: "text-[12px] h-5 px-3 font-bold",
  lg: "text-[14px] h-6 px-4 font-bold",
};

export function DlesTopic({
  topic,
  className,
  size = "md",
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

  const baseClasses = cn(
    "w-fit border-0 shadow-none pointer-events-none hover:bg-inherit transition-none normal-case leading-none items-center justify-center flex whitespace-nowrap",
    SIZE_CLASSES[size]
  );

  if (topic === "all") {
    return (
      <Badge
        className={cn(
          baseClasses,
          "bg-pink-500/20 text-pink-700 dark:text-pink-300",
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
        baseClasses,
        TOPIC_COLORS[topic as string] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {content}
    </Badge>
  );
}
