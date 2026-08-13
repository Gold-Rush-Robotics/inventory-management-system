function getErrorMessages(errors: readonly unknown[]): string[] {
  return errors.flatMap((error) => {
    if (Array.isArray(error)) {
      return getErrorMessages(error);
    }

    if (typeof error === "string") {
      return error;
    }

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }

    return [];
  });
}

export default function FieldErrors({
  id,
  errors,
}: {
  id: string;
  errors: unknown[];
}) {
  const messages = getErrorMessages(errors);

  if (messages.length === 0) {
    return null;
  }

  return <FieldError id={id}>{messages.join(", ")}</FieldError>;
}
import { FieldError } from "@/components/ui/field";
