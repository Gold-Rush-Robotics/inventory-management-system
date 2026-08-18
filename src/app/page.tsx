"use client";

import {
  DataTable,
  Pagination,
  type ColumnDef,
  type PageSize,
} from "@/app/_components/data-table";
import { useRequireLogin } from "@/app/_components/require-login";
import SmartSearchInput, {
  type SmartSearchValue,
} from "@/app/_components/smart-search-input";
import { TagBadge } from "@/app/_components/tag-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { authClient } from "@/server/better-auth/client";
import { api, type RouterOutputs } from "@/trpc/react";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import NewItemButton from "./_components/new-item";
import { Typography } from "./_components/typography";
import WysiwygInlinePreview from "./_components/wysiwyg-inline-preview";

type ItemRow = RouterOutputs["items"]["get"]["items"][number];

export default function Home() {
  const { signOut } = useRequireLogin();
  const session = authClient.useSession();
  const userName = session.data?.user?.name ?? "Unknown User";
  const pfp = session.data?.user?.image ?? "";

  const [search, setSearch] = useState<SmartSearchValue>({
    chips: [],
    text: "",
  });
  const debouncedText = useDebouncedValue(search.text, 300);

  return (
    <main className="mx-auto min-h-screen w-full max-w-500 space-y-8 p-8">
      <Typography variant="h1">
        49er Robotics Inventory Management System
      </Typography>
      <div className="flex items-center gap-3">
        <SmartSearchInput value={search} onChange={setSearch} />
        <NewItemButton />
        <Button
          variant="outline"
          className="ml-2 w-max shrink-0 flex-row items-center gap-3 px-3 py-2 pl-0"
          onClick={() => void signOut()} // TODO: actually do this properly
        >
          <Avatar className="bg-card -ml-2" size="lg">
            <AvatarImage src={pfp} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <Typography variant="small" className="whitespace-nowrap">
            {userName}
          </Typography>
        </Button>
      </div>
      <Card className="p-0">
        <ItemsTable chips={search.chips} text={debouncedText} />
      </Card>
    </main>
  );
}

function propertyData<T extends ItemRow["properties"][number]["type"]>(
  item: ItemRow,
  type: T,
): Extract<ItemRow["properties"][number], { type: T }>[] {
  return item.properties.filter(
    (
      property,
    ): property is Extract<ItemRow["properties"][number], { type: T }> =>
      property.type === type,
  );
}

function ItemsTable({
  chips,
  text,
}: {
  chips: SmartSearchValue["chips"];
  text: string;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(25);

  const tagIds = chips.filter((c) => c.type === "tag").map((c) => c.id);
  const categoryIds = chips
    .filter((c) => c.type === "category")
    .map((c) => c.id);
  const locationIds = chips
    .filter((c) => c.type === "location")
    .map((c) => c.id);
  const chipsKey = chips.map((c) => c.key).join(",");

  useEffect(() => {
    setPage(1);
  }, [text, chipsKey]);

  const {
    data: items,
    isLoading,
    error,
  } = api.items.get.useQuery({
    page,
    limit,
    search: text.trim() || undefined,
    tagIds: tagIds.length ? tagIds : undefined,
    categoryIds: categoryIds.length ? categoryIds : undefined,
    locationIds: locationIds.length ? locationIds : undefined,
  });

  const columns: ColumnDef<ItemRow>[] = [
    {
      header: "Name",
      value: (row) => propertyData(row, "NAME").map((item) => item.title),
    },
    {
      header: "Description",
      value: (row) =>
        propertyData(row, "NAME").map((item) => (
          <WysiwygInlinePreview key={item.id} html={item.content ?? ""} />
        )),
    },
    {
      header: "Location",
      value: (row) => propertyData(row, "LOCATION").map((item) => item.title),
    },
    {
      header: "Tags",
      value: (row) =>
        propertyData(row, "TAG").map((tag) => (
          <TagBadge key={tag.id} className="mr-1" color={tag.data?.color}>
            {tag.title}
          </TagBadge>
        )),
    },
    {
      header: "Qty",
      value: "totalQty",
      float: "left",
    },
    {
      header: "Actions",
      float: "right",
      value: (row) =>
        row.requiresCheckout ? (
          <Tooltip>
            <TooltipTrigger
              render={<Button size="icon-xs" aria-label="Checkout" />}
            >
              <ShoppingCart />
            </TooltipTrigger>
            <TooltipContent side="right">Checkout</TooltipContent>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <div>
      <DataTable
        className="border-none"
        columns={columns}
        data={items?.items ?? []}
        loading={isLoading}
        error={error?.message}
      />
      <Pagination
        page={page}
        total={items?.total ?? 0}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
      />
    </div>
  );
}