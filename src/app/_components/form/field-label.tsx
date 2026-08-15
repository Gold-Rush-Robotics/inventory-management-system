"use client";

import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CircleHelp } from "lucide-react";
import { useRef, type ReactNode } from "react";

export default function FieldLabel({
  htmlFor,
  label,
  description,
  required = false,
  children,
  className,
}: {
  htmlFor: string;
  label: string;
  description?: ReactNode;
  required?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const helpRef = useRef<HTMLButtonElement>(null);

  const labelEl = (
    <Label htmlFor={htmlFor} className={cn(description && "w-fit", className)}>
      {children}
      <span>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            {" *"}
          </span>
        )}
      </span>
    </Label>
  );

  if (!description) {
    return labelEl;
  }

  return (
    <Popover
      onOpenChange={(nextOpen, details) => {
        if (
          nextOpen &&
          details.reason === "trigger-press" &&
          !(
            details.event.target instanceof Node &&
            helpRef.current?.contains(details.event.target)
          )
        ) {
          details.cancel();
        }
      }}
    >
      <PopoverTrigger
        openOnHover
        delay={0}
        nativeButton={false}
        role="group"
        tabIndex={-1}
        render={<div className="flex w-fit items-center gap-2" />}
      >
        {labelEl}
        <button
          ref={helpRef}
          type="button"
          className="text-muted-foreground inline-flex p-0 pr-2" // padding right so the description tooltip isn't up its ass
          aria-label={`More information about ${label}`}
        >
          <CircleHelp className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-fit max-w-xs">
        {description}
      </PopoverContent>
    </Popover>
  );
}
