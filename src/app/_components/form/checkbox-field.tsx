import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { useFieldContext } from "./contexts";
import FieldErrors from "./field-errors";
import FieldLabel from "./field-label";

type CheckboxFieldProps = Omit<
  ComponentProps<typeof Checkbox>,
  "defaultChecked" | "onCheckedChange"
> & {
  label: string;
  description?: ReactNode;
};

export default function CheckboxField({
  label,
  description,
  required,
  disabled,
  className,
  checked,
  ...props
}: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const errorId = `${field.name}-error`;
  const showErrors = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className={cn("grid gap-1.5", disabled && "opacity-50")}>
      <FieldLabel
        htmlFor={field.name}
        label={label}
        description={description}
        required={required}
      >
        <Checkbox
          {...props}
          id={field.name}
          name={field.name}
          required={required}
          disabled={disabled}
          className={cn(
            className,
            disabled && "cursor-not-allowed data-disabled:opacity-100",
          )}
          checked={checked ?? field.state.value}
          aria-describedby={showErrors ? errorId : undefined}
          aria-invalid={showErrors}
          onBlur={() => {
            field.handleBlur();
            void field.validate("change");
          }}
          onCheckedChange={field.handleChange}
        />
      </FieldLabel>
      {showErrors && (
        <FieldErrors id={errorId} errors={field.state.meta.errors} />
      )}
    </div>
  );
}
