import { Badge } from "@/components/ui/badge";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn, formatTopic } from "@/lib/utils";
import type { Topic } from "@/app/generated/prisma/client";

interface DlesTopicProps {
  topic: string | Topic;
  className?: string;
}

export function DlesTopic({ topic, className }: DlesTopicProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize font-normal w-fit",
        TOPIC_COLORS[topic as string] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {formatTopic(topic as string)}
    </Badge>
  );
}
