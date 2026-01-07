import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DlesButtonProps = React.ComponentProps<typeof Button> & {
  isActive?: boolean;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

export const DlesButton = React.forwardRef<HTMLButtonElement, DlesButtonProps>(
  ({ className, variant, isActive, href, asChild, ...props }, ref) => {
    if (href) {
      return (
        <Button
          ref={ref}
          variant={variant || (isActive ? "secondary" : "outline")}
          className={cn(
            // Base Layout
            "h-10 gap-2 whitespace-nowrap",
            // Typography
            "text-xs font-medium",
            // Borders & Backgrounds (Default Outline Style)
            (!variant || variant === "outline") &&
              !isActive &&
              "border-primary/20 hover:border-primary/50 hover:bg-primary/5",
            isActive && "border-transparent bg-secondary hover:bg-secondary/80",
            // Animations
            "transition-colors",
            className
          )}
          asChild
          {...props}
        >
          <Link href={href}>{props.children}</Link>
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        variant={variant || (isActive ? "secondary" : "outline")}
        className={cn(
          // Base Layout
          "h-10 gap-2 whitespace-nowrap",
          // Typography
          "text-xs font-medium",
          // Borders & Backgrounds (Default Outline Style)
          (!variant || variant === "outline") &&
            !isActive &&
            "border-primary/20 hover:border-primary/50 hover:bg-primary/5",
          isActive && "border-transparent bg-secondary hover:bg-secondary/80",
          // Animations
          "transition-colors",
          className
        )}
        asChild={asChild}
        {...props}
      />
    );
  }
);
DlesButton.displayName = "DlesButton";
