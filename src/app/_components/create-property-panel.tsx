"use client";

import type { CreatePanelProps } from "@/app/_components/property-combobox";
import { TagBadge } from "@/app/_components/tag-badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { LabelPropertyType } from "@/server/api/routers/properties";
import { api } from "@/trpc/react";
import { Check, LoaderCircle, Palette } from "lucide-react";
import { useState } from "react";

const presetColors = [
  "#dc2626",
  "#ea580c",
  "#eab308",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#64748b",
] as const;

export default function CreatePropertyPanel({
  type,
  noun,
  search,
  onCancel,
  onCreated,
}: CreatePanelProps & {
  type: LabelPropertyType;
  noun: string;
}) {
  const utils = api.useUtils();
  const [title, setTitle] = useState(search);
  const [aliases, setAliases] = useState("");
  const [color, setColor] = useState<string>(presetColors[4]);
  const isCustomColor = !presetColors.some((preset) => preset === color);
  const createProperty = api.properties.create.useMutation({
    onSuccess: (property) => {
      utils.properties.list.setData({ type }, (current) =>
        current
          ? [...current, property].sort((a, b) =>
              a.title.localeCompare(b.title),
            )
          : [property],
      );
      onCreated({ ...property, color: property.data.color });
    },
  });

  function create() {
    if (!title.trim() || createProperty.isPending) return;

    createProperty.mutate({
      type,
      title,
      aliases: aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter(Boolean),
      color,
    });
  }

  return (
    <div
      className="flex flex-col gap-2.5"
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          create();
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">Create {noun}</div>
        <p className="text-muted-foreground text-xs/relaxed">
          Add a reusable {noun}. Aliases are also used when searching.
        </p>
      </div>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={`new-${type}-title`}>Title</FieldLabel>
          <Input
            id={`new-${type}-title`}
            value={title}
            maxLength={80}
            autoFocus
            placeholder={`${noun.charAt(0).toUpperCase()}${noun.slice(1)} title`}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`new-${type}-aliases`}>Aliases</FieldLabel>
          <Input
            id={`new-${type}-aliases`}
            value={aliases}
            placeholder="Alternative name, another name"
            onChange={(event) => setAliases(event.target.value)}
          />
          <FieldDescription>Separate aliases with commas.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Color</FieldLabel>
          <div className="flex flex-wrap items-center gap-1.5">
            {presetColors.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="icon-xs"
                style={{ backgroundColor: preset }}
                aria-label={`Use color ${preset}`}
                aria-pressed={color === preset}
                onClick={() => setColor(preset)}
              >
                {color === preset && (
                  <Check className="text-white drop-shadow-sm" />
                )}
              </Button>
            ))}
            <Separator orientation="vertical" />
            <Button
              nativeButton={false}
              variant="outline"
              size="icon-xs"
              className="relative border-dashed"
              render={<label htmlFor={`new-${type}-custom-color`} />}
              style={isCustomColor ? { backgroundColor: color } : undefined}
              title="Pick a custom color"
            >
              <Palette
                className={
                  isCustomColor ? "text-white drop-shadow-sm" : undefined
                }
              />
              <input
                id={`new-${type}-custom-color`}
                type="color"
                className="sr-only"
                value={color}
                aria-label="Pick a custom color"
                onChange={(event) => setColor(event.target.value)}
              />
            </Button>
          </div>
        </Field>
        <Field>
          <FieldLabel>Preview</FieldLabel>
          <FieldContent>
            <TagBadge color={color}>{title.trim() || `New ${noun}`}</TagBadge>
          </FieldContent>
        </Field>
        {createProperty.error && (
          <FieldError id={`new-${type}-error`}>
            {createProperty.error.message}
          </FieldError>
        )}
      </FieldGroup>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!title.trim() || createProperty.isPending}
          onClick={create}
        >
          {createProperty.isPending && (
            <LoaderCircle className="animate-spin" />
          )}
          Create {noun}
        </Button>
      </div>
    </div>
  );
}
