"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field } from "@/components/ui/field";
import { matchOptions } from "@/lib/match-options";
import type { ReactNode } from "react";
import { useFieldContext } from "./contexts";
import FieldErrors from "./field-errors";
import FieldLabel from "./field-label";

export type DropdownOption = {
  value: number;
  label: string;
  keywords?: string[];
};

type DropdownProps = {
  label: string;
  options: DropdownOption[];
  description?: ReactNode;
  required?: boolean;
  placeholder?: string;
  emptyMessage?: string;
};

export default function Dropdown({
  label,
  options,
  description,
  required = false,
  placeholder = "Select an option...",
  emptyMessage = "No matching options.",
}: DropdownProps) {
  const field = useFieldContext<number[]>();
  const selected = options.find((option) =>
    field.state.value.includes(option.value),
  );
  const errorId = `${field.name}-error`;
  const showErrors = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="gap-1.5" data-invalid={showErrors}>
      <FieldLabel
        htmlFor={field.name}
        label={label}
        description={description}
        required={required}
      />
      <Combobox
        items={options}
        autoHighlight
        value={selected ?? null}
        onValueChange={(option: DropdownOption | null) => {
          field.handleChange(option ? [option.value] : []);
        }}
        isItemEqualToValue={(a: DropdownOption, b: DropdownOption) =>
          a.value === b.value
        }
        filter={(item, query) =>
          matchOptions([{ title: item.label, aliases: item.keywords }], query)
            .length > 0
        }
        onOpenChange={(open) => {
          if (!open) {
            field.handleBlur();
            void field.validate("change");
          }
        }}
      >
        <ComboboxInput
          id={field.name}
          name={field.name}
          placeholder={placeholder}
          className="w-full"
          aria-describedby={showErrors ? errorId : undefined}
          aria-invalid={showErrors}
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(option: DropdownOption) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {showErrors && (
        <FieldErrors id={errorId} errors={field.state.meta.errors} />
      )}
    </Field>
  );
}
