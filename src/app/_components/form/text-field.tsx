import { Input } from "@/components/ui/input";
import type { ComponentProps, ReactNode } from "react";
import { useFieldContext } from "./contexts";
import FieldErrors from "./field-errors";
import FieldLabel from "./field-label";

type TextFieldProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "onBlur"
> & {
  label: string;
  description?: ReactNode;
};

export default function TextField({
  label,
  description,
  required,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const errorId = `${field.name}-error`;
  const showErrors = field.state.meta.isTouched && !field.state.meta.isValid;

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
        id={field.name}
        name={field.name}
        required={required}
        value={field.state.value}
        aria-describedby={showErrors ? errorId : undefined}
        aria-invalid={showErrors}
        onBlur={() => {
          field.handleBlur();
          void field.validate("change");
        }}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {showErrors && (
        <FieldErrors id={errorId} errors={field.state.meta.errors} />
      )}
    </div>
  );
}
