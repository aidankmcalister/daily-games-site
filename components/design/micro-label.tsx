import { cn } from "@/lib/utils";

interface MicroLabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function MicroLabel({ children, className, ...props }: MicroLabelProps) {
  return (
    <p
      className={cn(
        "text-[10px] font-black uppercase tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}
