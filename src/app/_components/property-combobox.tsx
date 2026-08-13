"use client";

import { TagBadge } from "@/app/_components/tag-badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { matchOptions } from "@/lib/match-options";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

export type Property = {
  id: number;
  title: string;
  aliases?: string[];
  color?: string;
};

export type CreatePanelProps = {
  search: string;
  onCancel: () => void;
  onCreated: (property: Property) => void;
};

export type PropertyComboboxProps = {
  properties: Property[];
  value: Property[];
  onValueChange: (value: Property[]) => void;
  /** Keep the popup open after a pick so you can keep adding. Defaults to true. */
  multiple?: boolean;
  /** Show the create footer. Defaults to false; form fields pass true. */
  showCreateButton?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  addPlaceholder?: string;
  isLoading?: boolean;
  error?: unknown;
  loadingMessage?: string;
  errorMessage?: string;
  noPropertiesMessage?: string;
  /** Noun phrase used before anything has been typed, e.g. `a new tag`. */
  createLabel?: string;
  renderCreatePanel?: (props: CreatePanelProps) => ReactNode;
  onBlur?: () => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

/**
 * Chip + typeahead picker for label properties (tags, categories, ...) on top of
 * the Combobox backbone. Callers own the properties and their meaning — form
 * fields store ids, a later search bar can treat chips as filters like
 * `tag: Motors`. Filtering is done here via {@link matchOptions}; pass fresh
 * `properties` if you want a different universe.
 */
export default function PropertyCombobox({
  properties,
  value,
  onValueChange,
  multiple = true,
  showCreateButton = false,
  id,
  name,
  placeholder = "Search properties...",
  addPlaceholder = "Add property...",
  isLoading = false,
  error,
  loadingMessage = "Loading properties...",
  errorMessage = "Could not load properties.",
  noPropertiesMessage = "No properties to select.",
  createLabel = "a new property",
  renderCreatePanel,
  onBlur,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: PropertyComboboxProps) {
  const anchor = useComboboxAnchor();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const selectedIds = new Set(value.map((property) => property.id));
  const matches = matchOptions(
    properties.filter((property) => !selectedIds.has(property.id)),
    search,
  );

  function select(next: Property[]) {
    onValueChange(next);
    setSearch("");
    setIsOpen(multiple && next.length > value.length);
  }

  return (
    <>
      <Combobox
        multiple
        items={matches}
        filter={null}
        autoHighlight
        openOnInputClick
        value={value}
        onValueChange={select}
        inputValue={search}
        onInputValueChange={setSearch}
        open={isOpen && !isCreating}
        onOpenChange={setIsOpen}
        itemToStringLabel={(property: Property) => property.title}
        isItemEqualToValue={(a: Property, b: Property) => a.id === b.id}
      >
        <ComboboxChips
          ref={anchor}
          aria-invalid={ariaInvalid}
          onBlur={(event) => {
            if (event.currentTarget.contains(event.relatedTarget)) return;
            onBlur?.();
          }}
        >
          {value.map((property) => (
            <ComboboxChip
              key={property.id}
              render={<TagBadge color={property.color} />}
              aria-label={property.title}
            >
              {property.title}
            </ComboboxChip>
          ))}
          <ComboboxChipsInput
            id={id}
            name={name}
            placeholder={value.length === 0 ? placeholder : addPlaceholder}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                matches.length === 0 &&
                search.trim() &&
                showCreateButton &&
                renderCreatePanel
              ) {
                event.preventDefault();
                setIsCreating(true);
              }
            }}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxList>
            {matches.map((property) => (
              <ComboboxItem key={property.id} value={property}>
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
            {isLoading
              ? loadingMessage
              : error
                ? errorMessage
                : search.trim()
                  ? "No matching properties."
                  : noPropertiesMessage}
          </ComboboxEmpty>
          {showCreateButton && (
            <Button
              type="button"
              variant="ghost"
              className="border-border w-full justify-start border-0 border-t"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={() => setIsCreating(true)}
            >
              <Plus />
              Create {search.trim() ? `"${search.trim()}"` : createLabel}
            </Button>
          )}
        </ComboboxContent>
      </Combobox>
      {showCreateButton && renderCreatePanel && (
        <Popover open={isCreating} onOpenChange={setIsCreating}>
          <PopoverContent align="start" className="w-80" anchor={anchor}>
            {renderCreatePanel({
              search: search.trim(),
              onCancel: () => setIsCreating(false),
              onCreated: (property) => {
                setIsCreating(false);
                select([...value, property]);
              },
            })}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
