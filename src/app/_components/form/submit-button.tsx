import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useFormContext } from "./contexts";

export default function SubmitButton({
  children,
  showSpinner = true,
  ...props
}: ComponentProps<typeof Button> & { showSpinner?: boolean }) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          {...props}
          type="submit"
          disabled={isSubmitting ? true : props.disabled}
        >
          {children}
          {isSubmitting && showSpinner && (
            <Loader2 className="ml-1 animate-spin" />
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}
