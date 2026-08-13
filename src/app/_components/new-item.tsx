"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/react";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import z from "zod";
import FieldErrors from "./form/field-errors";
import useAppForm from "./form/form";

const newItemSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(5000),
  buyLink: z.union([z.literal(""), z.string().url()]),
  requireCheckout: z.boolean(),
  tags: z.array(z.number().int()),
  categories: z.array(z.number().int()).min(1, "Select at least one category"),
  location: z.array(z.number().int()).length(1, "Select a location"),
  notifyThreshold: z.number().int().min(-1).max(1000),
  trackStock: z.boolean(),
  stock: z.number().int().min(0).max(100000),
});

export default function NewItemButton() {
  return (
    <Tooltip>
      <NewItemModal>
        <TooltipTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Add new item" />
          }
        >
          <Plus />
        </TooltipTrigger>
      </NewItemModal>
      <TooltipContent>Add new item</TooltipContent>
    </Tooltip>
  );
}

function NewItemModal({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const locations = api.properties.listLocations.useQuery();
  const createItem = api.items.create.useMutation({
    onSuccess: async () => {
      await utils.items.get.invalidate();
      setOpen(false);
    },
  });
  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      buyLink: "",
      requireCheckout: false,
      tags: [] as number[],
      categories: [] as number[],
      location: [] as number[],
      trackStock: false,
      stock: 0,
      notifyThreshold: -1,
    },
    validators: {
      onChange: newItemSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createItem.mutateAsync({
          ...value,
          requireCheckout: value.requireCheckout || value.trackStock,
          notifyThreshold: value.trackStock ? value.notifyThreshold : -1,
        });
      } catch {
        // Keep the dialog open; createItem.error is shown below.
        return;
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset();
          createItem.reset();
        }
      }}
    >
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Inventory Item</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="-mr-1.5 grid max-h-[80vh] gap-4 overflow-y-scroll pr-1.5">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Name"
                  placeholder="Name of the item"
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="description">
              {(field) => <field.WysiwygField label="Description" />}
            </form.AppField>
            <form.AppField name="categories">
              {(field) => (
                <field.PropertyField
                  property="CATEGORY"
                  label="Categories"
                  multiple
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="location">
              {(field) => (
                <field.Dropdown
                  label="Location"
                  options={(locations.data ?? []).map((location) => ({
                    value: location.id,
                    label: location.title,
                    keywords: location.aliases,
                  }))}
                  placeholder="Select a location..."
                  emptyMessage={
                    locations.isLoading
                      ? "Loading locations..."
                      : locations.error
                        ? "Could not load locations."
                        : "No matching locations."
                  }
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="tags">
              {(field) => (
                <field.PropertyField property="TAG" label="Tags" multiple />
              )}
            </form.AppField>

            <form.AppField name="trackStock">
              {(field) => (
                <field.CheckboxField
                  label="Enable stock tracking"
                  description="When enabled, the amount of items in stock will be stored and tracked, and the item will be able to be checked out."
                />
              )}
            </form.AppField>
            <form.Subscribe selector={(state) => state.values.trackStock}>
              {(trackStock) =>
                trackStock ? (
                  <form.AppField name="stock">
                    {(field) => (
                      <field.NumberField
                        label="Current stock level"
                        required
                        min={0}
                        max={100000}
                        inputMode="numeric"
                      />
                    )}
                  </form.AppField>
                ) : null
              }
            </form.Subscribe>

            {/* Advanced section */}
            <Collapsible>
              <CollapsibleTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-1.5 w-fit aria-expanded:bg-transparent"
                  />
                }
              >
                <ChevronRight className="transition-transform duration-200 group-aria-expanded/button:rotate-90" />
                Advanced
              </CollapsibleTrigger>
              <CollapsibleContent className="grid gap-4 px-1.5 pt-3">
                <form.Subscribe selector={(state) => state.values.trackStock}>
                  {(trackStock) => (
                    <form.AppField name="requireCheckout">
                      {(field) => (
                        <field.CheckboxField
                          label="Require checkout"
                          description="When enabled, this item will have the ability to be checked out. Required when stock tracking is enabled."
                          checked={trackStock ? true : undefined}
                          disabled={trackStock}
                        />
                      )}
                    </form.AppField>
                  )}
                </form.Subscribe>
                <form.AppField name="buyLink">
                  {(field) => (
                    <field.TextField
                      label="Link to Purchase Additional Items"
                      placeholder="https://www.amazon.com/dp/B0BJPGV1FR"
                    />
                  )}
                </form.AppField>
                <form.Subscribe selector={(state) => state.values.trackStock}>
                  {(trackStock) => (
                    <form.AppField name="notifyThreshold">
                      {(field) => (
                        <field.NumberField
                          label="Low stock notify threshold"
                          description={
                            <div className="space-y-1">
                              Sends a notification in discord when stock falls
                              below this level. Set to -1 to disable stock
                              notifications.
                              <br />
                              <strong>
                                &quot;Enable stock tracking&quot; must be
                                checked to set a value other than -1.
                              </strong>
                            </div>
                          }
                          min={-1}
                          max={1000}
                          inputMode="numeric"
                          value={trackStock ? undefined : -1}
                          disabled={!trackStock}
                          required
                        />
                      )}
                    </form.AppField>
                  )}
                </form.Subscribe>
              </CollapsibleContent>
            </Collapsible>
          </div>
          {createItem.error && (
            <FieldErrors id="create-item-error" errors={[createItem.error]} />
          )}
          <form.AppForm>
            <form.SubmitButton>Create item</form.SubmitButton>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
