"use client";

import * as React from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  emptyText?: string;
  renderLabel?: (option: MultiSelectOption) => React.ReactNode;
  renderSelectedItem?: (
    option: MultiSelectOption,
    onUnselect: () => void
  ) => React.ReactNode;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  emptyText = "No results found.",
  renderLabel,
  renderSelectedItem,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [shouldCollapse, setShouldCollapse] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastValueLength = React.useRef(0);

  // Check if items would overflow - only when value changes
  React.useLayoutEffect(() => {
    // Reset collapse state when value length decreases (user removed items)
    if (value.length < lastValueLength.current) {
      setShouldCollapse(false);
    }
    lastValueLength.current = value.length;

    // Only measure if we're currently NOT collapsed
    if (shouldCollapse) return;

    const container = containerRef.current;
    if (!container) return;

    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
      if (container.scrollWidth > container.clientWidth + 4) {
        setShouldCollapse(true);
      }
    });
  }, [value, shouldCollapse]);

  const handleUnselect = (item: string) => {
    onChange(value.filter((i) => i !== item));
  };

  const handleSelect = (currentValue: string) => {
    const isSelected = value.includes(currentValue);
    if (isSelected) {
      onChange(value.filter((item) => item !== currentValue));
    } else {
      onChange([...value, currentValue]);
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
            "h-10 w-full justify-between border-primary/20 hover:border-primary/50 hover:bg-primary/5",
            value.length > 0 ? "bg-primary/5" : "bg-transparent",
            className
          )}
        >
          <div
            ref={containerRef}
            className="flex gap-1 items-center overflow-hidden max-h-7"
          >
            {value.length === 0 && (
              <span className="text-muted-foreground font-normal">
                {placeholder}
              </span>
            )}

            {value.length > 0 && shouldCollapse ? (
              <Badge
                variant="secondary"
                className="rounded-sm px-1.5 font-normal bg-primary/10 text-primary border-primary/20"
              >
                {value.length} selected
              </Badge>
            ) : (
              value.map((item) => {
                const option = options.find((o) => o.value === item);
                if (!option) return null;

                if (renderSelectedItem) {
                  return (
                    <React.Fragment key={item}>
                      {renderSelectedItem(option, () => handleUnselect(item))}
                    </React.Fragment>
                  );
                }

                return (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="rounded-sm px-1.5 font-normal bg-primary/10 text-primary border-primary/20 gap-1"
                  >
                    {renderLabel ? renderLabel(option) : option.label}
                    <X
                      className="h-2 w-2 opacity-60 hover:opacity-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                    />
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[180px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    onClick={() => handleSelect(option.value)}
                    className="cursor-pointer"
                    data-checked={isSelected}
                  >
                    <div className="flex-1">
                      {renderLabel ? renderLabel(option) : option.label}
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
