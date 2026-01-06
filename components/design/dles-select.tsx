"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, formatTopic } from "@/lib/utils";
import { TOPICS } from "@/lib/constants";
import { DlesTopic } from "@/components/design/dles-topic";

export interface DlesSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DlesSelectProps {
  options?: DlesSelectOption[];
  value: string | string[];
  onChange: (value: any) => void;
  multi?: boolean;
  topics?: boolean;
  placeholder?: string;
  className?: string;
  emptyText?: string;
  renderOption?: (option: DlesSelectOption) => React.ReactNode;
  renderSelected?: (option: DlesSelectOption) => React.ReactNode;
}

export function DlesSelect({
  options: providedOptions,
  value,
  onChange,
  multi = false,
  topics = false,
  placeholder = "Select...",
  className,
  emptyText = "No results found.",
  renderOption,
  renderSelected,
}: DlesSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedValues = React.useMemo(() => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }, [value]);

  // Collapse to "X selected" when 2+ items are selected in multi-select
  const shouldCollapse = multi && selectedValues.length > 1;

  // Auto-generate options if topics prop is present
  const options = React.useMemo(() => {
    if (topics) {
      const topicOptions = TOPICS.map((t) => ({
        value: t,
        label: formatTopic(t),
      }));
      return multi
        ? [{ value: "all", label: "All Topics" }, ...topicOptions]
        : topicOptions;
    }
    return providedOptions || [];
  }, [topics, providedOptions, multi]) as DlesSelectOption[];

  const handleSelect = (currentValue: string) => {
    if (multi) {
      const isSelected = selectedValues.includes(currentValue);
      let newValue: string[];

      if (currentValue === "all") {
        newValue = ["all"];
      } else {
        const filtered = selectedValues.filter((v) => v !== "all");
        if (isSelected) {
          newValue = filtered.filter((item) => item !== currentValue);
          if (newValue.length === 0) newValue = ["all"];
        } else {
          newValue = [...filtered, currentValue];
        }
      }
      onChange(newValue);
    } else {
      onChange(currentValue);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-10 w-full justify-between border-border/50 bg-muted/50 hover:bg-muted font-normal transition-colors rounded-lg px-3 overflow-hidden",
            selectedValues.length > 0 && "border-primary/20 bg-primary/5",
            className
          )}
        >
          <div
            ref={containerRef}
            className="flex gap-1.5 items-center overflow-hidden flex-1"
          >
            {selectedValues.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedValues.length > 0 && shouldCollapse ? (
              <Badge
                variant="secondary"
                className="rounded-md px-2 h-6 font-medium bg-primary/10 text-primary border-primary/20 shrink-0"
              >
                {selectedValues.length} selected
              </Badge>
            ) : (
              selectedValues.map((val) => {
                const option = options.find((o) => o.value === val);
                if (!option) return null;

                if (topics || val === "all") {
                  return (
                    <DlesTopic key={val} topic={val} className="shrink-0" />
                  );
                }

                if (renderSelected) {
                  return (
                    <div key={val} className="shrink-0">
                      {renderSelected(option)}
                    </div>
                  );
                }

                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="rounded-md px-2 h-6 font-medium bg-primary/10 text-primary border-primary/20 gap-1 shrink-0"
                  >
                    {option.label}
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border shadow-xl rounded-lg"
        align="start"
      >
        <Command>
          <CommandList>
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                    data-checked={isSelected}
                    disabled={option.disabled}
                  >
                    <div className="flex-1">
                      {topics || option.value === "all" ? (
                        <DlesTopic topic={option.value} size="md" />
                      ) : renderOption ? (
                        renderOption(option)
                      ) : (
                        <span className="text-sm">{option.label}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
