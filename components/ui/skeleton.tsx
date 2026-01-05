import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted rounded-md animate-pulse duration-700",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
