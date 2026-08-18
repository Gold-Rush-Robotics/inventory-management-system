"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { detectActiveToken } from "@/lib/detect-active-token";
import { matchOptions } from "@/lib/match-options";
import { api } from "@/trpc/react";
import { useRef, useState, useEffect } from "react";

export type SearchChip = {
  key: string;
  type: "tag" | "category" | "location";
  id: number;
  label: string;
  color?: string;
};

export type SmartSearchValue = {
  chips: SearchChip[];
  text: string;
};

type DirectiveProperty = {
  id: number;
  title: string;
  aliases?: string[];
  color?: string;
};

export type SmartSearchInputProps = {
  value: SmartSearchValue;
  onChange: (value: SmartSearchValue) => void;
  placeholder?: string;
};

const EMPTY_MESSAGE: Record<"tag" | "category" | "location", string> = {
  tag: "No matching tags.",
  category: "No matching categories.",
  location: "No matching locations.",
};

export default function SmartSearchInput({
  value,
  onChange,
  placeholder = 'Search items... try "tag:" or "loc:"',
}: SmartSearchInputProps) {
  const anchor = useComboboxAnchor();
  const inputRef = useRef<HTMLInputElement>(null);

  const [cursorPos, setCursorPos] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const active = detectActiveToken(value.text, cursorPos);
  const isDirective = active.kind === "directive";

  // Temp
  useEffect(() => {
    if (!isDirective) {
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [value.text, cursorPos, isDirective]);

  const tags = api.properties.list.useQuery(
    { type: "TAG" },
    { enabled: isDirective && active.type === "tag" },
  );
  const categories = api.properties.list.useQuery(
    { type: "CATEGORY" },
    { enabled: isDirective && active.type === "category" },
  );
  const locations = api.properties.listLocations.useQuery(undefined, {
    enabled: isDirective && active.type === "location",
  });

  const properties = activeProperties(
    active,
    tags.data,
    categories.data,
    locations.data,
  );
  const selectedIds = new Set(
    value.chips
      .filter((chip) => isDirective && chip.type === active.type)
      .map((chip) => chip.id),
  );
  const matches = isDirective
    ? matchOptions(
        properties.filter((property) => !selectedIds.has(property.id)),
        active.query,
      )
    : [];
  const showDropdown = isOpen && isDirective;

  function addChip(property: DirectiveProperty) {
    if (!isDirective) return;

    const chip: SearchChip = {
      key: `${active.type}-${property.id}`,
      type: active.type,
      id: property.id,
      label: property.title,
      color: property.color,
    };

    onChange({
      chips: [...value.chips, chip],
      text: removeDirectiveToken(value.text, active),
    });

    setIsOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function removeChip(key: string) {
    onChange({ ...value, chips: value.chips.filter((chip) => chip.key !== key) });
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const el = inputRef.current;
    if (
      event.key === "Backspace" &&
      el?.selectionStart === 0 &&
      el?.selectionEnd === 0 &&
      value.chips.length > 0
    ) {
      event.preventDefault();
      removeChip(value.chips[value.chips.length - 1]!.key);
    }
  }

  return (
    <div className="flex-1">
      <Combobox
        items={matches}
        filter={null}
        autoHighlight
        value={null}
        onValueChange={(property: DirectiveProperty | null) => {
          if (property) addChip(property);
        }}
        open={showDropdown}
        onOpenChange={setIsOpen}
        itemToStringLabel={(property: DirectiveProperty) => property.title}
        isItemEqualToValue={(a: DirectiveProperty, b: DirectiveProperty) =>
          a.id === b.id
        }
      >
        <div
          ref={anchor}
          className="flex min-h-8 w-full flex-wrap items-center gap-1 rounded-none border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-xs transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 dark:bg-input/30"
        >
          {value.chips.map((chip) => (
            <div
              key={chip.key}
              className="flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-none bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground"
              style={chip.color ? { backgroundColor: chip.color + '33', color: chip.color, border: `1px solid ${chip.color}66` } : undefined}
            >
              {chip.label}
              <button
                type="button"
                className="-mr-0.5 ml-1 opacity-50 hover:opacity-100 flex items-center justify-center"
                aria-label={`Remove ${chip.type} filter ${chip.label}`}
                onClick={() => removeChip(chip.key)}
              >
                <X className="size-3 pointer-events-none" />
              </button>
            </div>
          ))}

          <Input
            ref={inputRef}
            type="text"
            placeholder={value.chips.length === 0 ? placeholder : ""}
            value={value.text}
            className="min-w-16 flex-1 outline-none h-6 border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-xs"
            onChange={(e) => {
              const newText = e.target.value;
              const newCursorPos = e.target.selectionStart ?? newText.length;
              onChange({ ...value, text: newText });
              setCursorPos(newCursorPos);
              setIsOpen(false); // Close immediately while typing, debounce will reopen it after stopping
            }}
            onKeyUp={(event) => {
              const pos = event.currentTarget.selectionStart ?? 0;
              setCursorPos(pos);
            }}
            onClick={(event) => {
              const pos = event.currentTarget.selectionStart ?? 0;
              setCursorPos(pos);
            }}
            onFocus={() => {
              setIsOpen(false);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        <ComboboxContent anchor={anchor}>
          <ComboboxList>
            {matches.map((property) => (
              <ComboboxItem
                key={property.id}
                value={property}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addChip(property);
                }}
              >
                {property.color && (
                  <span
                    className="size-2.5 shrink-0 border border-black/10"
                    style={{ backgroundColor: property.color }}
                  />
                )}
                <span className="min-w-0 flex-1 truncate">
                  {property.title}
                </span>
                {(property.aliases?.length ?? 0) > 0 && (
                  <span className="text-muted-foreground max-w-1/2 truncate">
                    {property.aliases?.join(", ")}
                  </span>
                )}
              </ComboboxItem>
            ))}
          </ComboboxList>
          <ComboboxEmpty>
            {isDirective ? EMPTY_MESSAGE[active.type] : ""}
          </ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function activeProperties(
  active: ReturnType<typeof detectActiveToken>,
  tags:
    | { id: number; title: string; aliases: string[]; data: { color: string } }[]
    | undefined,
  categories:
    | { id: number; title: string; aliases: string[]; data: { color: string } }[]
    | undefined,
  locations: { id: number; title: string; aliases: string[] }[] | undefined,
): DirectiveProperty[] {
  if (active.kind !== "directive") return [];

  if (active.type === "tag") {
    return (tags ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      aliases: t.aliases,
      color: t.data.color,
    }));
  }
  if (active.type === "category") {
    return (categories ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      aliases: c.aliases,
      color: c.data.color,
    }));
  }
  return (locations ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    aliases: l.aliases,
  }));
}

function removeDirectiveToken(
  text: string,
  active: ReturnType<typeof detectActiveToken>,
): string {
  if (active.kind !== "directive") return text;

  let start = active.start;
  const textBeforeStart = text.slice(0, start);

  const prefixMatch = textBeforeStart.match(/\b\w+:$/);
  if (prefixMatch) {
    start -= prefixMatch[0].length;
  }

  const before = text.slice(0, start);
  const after = text.slice(active.end);

  return `${before} ${after}`.replace(/\s+/g, " ").trim();
}
