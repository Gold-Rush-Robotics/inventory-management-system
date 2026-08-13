"use client";

import CreatePropertyPanel from "@/app/_components/create-property-panel";
import PropertyCombobox, {
  type Property,
} from "@/app/_components/property-combobox";
import { Field } from "@/components/ui/field";
import type { LabelPropertyType } from "@/server/api/routers/properties";
import { api } from "@/trpc/react";
import type { ReactNode } from "react";
import { useFieldContext } from "./contexts";
import FieldErrors from "./field-errors";
import FieldLabel from "./field-label";

const nouns = {
  TAG: { singular: "tag", plural: "tags" },
  CATEGORY: { singular: "category", plural: "categories" },
} as const satisfies Record<
  LabelPropertyType,
  { singular: string; plural: string }
>;

type PropertyFieldProps = {
  property: LabelPropertyType;
  label: string;
  /** Shown in a tooltip with a (?) icon next to the label. */
  description?: ReactNode;
  /** Shows a red asterisk next to the label. Defaults to false. */
  required?: boolean;
  /** Keeps the popup open after a pick. Defaults to true. */
  multiple?: boolean;
  placeholder?: string;
  addPlaceholder?: string;
};

/**
 * Form field for colored label properties (tags, categories, ...). They share a
 * table and only differ by `type`, so they share this field. Selection UX comes
 * from {@link PropertyCombobox}; this just maps form ids ↔ properties and wires
 * create/list through tRPC.
 */
export default function PropertyField({
  property,
  label,
  description,
  required = false,
  multiple = true,
  placeholder,
  /** Text for the + (create new) button. */
  addPlaceholder,
}: PropertyFieldProps) {
  const field = useFieldContext<number[]>();
  const { singular, plural } = nouns[property];
  const {
    data: listed = [],
    isLoading,
    error,
  } = api.properties.list.useQuery({ type: property });

  const properties: Property[] = listed.map((item) => ({
    ...item,
    color: item.data.color,
  }));
  const selectedIds = new Set(field.state.value);
  const value = properties.filter((item) => selectedIds.has(item.id));
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
      <PropertyCombobox
        properties={properties}
        value={value}
        multiple={multiple}
        showCreateButton
        onValueChange={(next) => {
          field.handleChange(next.map((item) => item.id));
        }}
        id={field.name}
        name={field.name}
        isLoading={isLoading}
        error={error}
        placeholder={placeholder ?? `Search ${plural}...`}
        addPlaceholder={addPlaceholder ?? `Add ${singular}...`}
        loadingMessage={`Loading ${plural}...`}
        errorMessage={`Could not load ${plural}.`}
        noPropertiesMessage={`No more ${plural} to select.`}
        createLabel={`a new ${singular}`}
        aria-describedby={showErrors ? errorId : undefined}
        aria-invalid={showErrors}
        onBlur={() => {
          field.handleBlur();
          void field.validate("change");
        }}
        renderCreatePanel={(panelProps) => (
          <CreatePropertyPanel
            {...panelProps}
            type={property}
            noun={singular}
          />
        )}
      />
      {showErrors && (
        <FieldErrors id={errorId} errors={field.state.meta.errors} />
      )}
    </Field>
  );
}
