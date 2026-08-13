import { Input } from "@/components/ui/input";
import type { ComponentProps, ReactNode } from "react";
import { useFieldContext } from "./contexts";
import FieldErrors from "./field-errors";
import FieldLabel from "./field-label";

type NumberFieldProps = Omit<
  ComponentProps<typeof Input>,
  "onChange" | "onBlur" | "type"
> & {
  label: string;
  description?: ReactNode;
};

export default function NumberField({
  label,
  description,
  required,
  value,
  ...props
}: NumberFieldProps) {
  const field = useFieldContext<number>();
  const errorId = `${field.name}-error`;
  const showErrors = field.state.meta.isTouched && !field.state.meta.isValid;
  const fieldValue = Number.isNaN(field.state.value) ? "" : field.state.value;

  return (
    <div className="grid gap-1.5">
      <FieldLabel
        htmlFor={field.name}
        label={label}
        description={description}
        required={required}
      />
      <Input
        {...props}
        type="number"
        id={field.name}
        name={field.name}
        required={required}
        value={value ?? fieldValue}
        aria-describedby={showErrors ? errorId : undefined}
        aria-invalid={showErrors}
        onBlur={() => {
          field.handleBlur();
          void field.validate("change");
        }}
        onChange={(event) => {
          const next = event.target.value;
          field.handleChange(
            next === "" ? Number.NaN : event.target.valueAsNumber,
          );
        }}
      />
      {showErrors && (
        <FieldErrors id={errorId} errors={field.state.meta.errors} />
      )}
    </div>
  );
}
