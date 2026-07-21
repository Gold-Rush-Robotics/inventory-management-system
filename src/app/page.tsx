"use client";

import {
  DataTable,
  Pagination,
  type ColumnDef,
  type PageSize,
} from "@/app/_components/data-table";
import { useRequireLogin } from "@/app/_components/require-login";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/server/better-auth/client";
import { api, type RouterOutputs } from "@/trpc/react";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Typography } from "./_components/typography";

type ItemRow = RouterOutputs["items"]["get"]["items"][number];

export default function Home() {
  const { signOut } = useRequireLogin();
  const session = authClient.useSession();
  const userName = session.data?.user?.name ?? "Unknown User";
  const pfp = session.data?.user?.image ?? "";

  return (
    <main className="mx-auto min-h-screen w-full max-w-500 space-y-8 p-8">
      <Typography variant="h1">
        49er Robotics Inventory Management System
      </Typography>
      <div className="flex items-center gap-3">
        <Input type="text" placeholder="Search items..." />
        <Button
          variant="outline"
          className="ml-4 w-max shrink-0 flex-row items-center gap-3 px-3 py-2 pl-0"
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
        <ItemsTable />
      </Card>
    </main>
  );
}

function propertyTitles(
  item: ItemRow,
  type: ItemRow["properties"][number]["type"],
) {
  return item.properties
    .filter((property) => property.type === type)
    .map((property) => property.title);
}

function ItemsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(25);

  const {
    data: items,
    isLoading,
    error,
  } = api.items.get.useQuery({ page, limit });

  const columns: ColumnDef<ItemRow>[] = [
    {
      header: "Name",
      value: (row) => propertyTitles(row, "NAME").join(", "),
    },
    {
      header: "Description",
      value: (row) => propertyTitles(row, "DESCRIPTION").join(", "),
    },
    {
      header: "Location",
      value: (row) => propertyTitles(row, "LOCATION").join(", "),
    },
    {
      header: "Tags",
      value: (row) =>
        propertyTitles(row, "TAG").map((tag) => (
          <Badge key={tag} className="mr-1">
            {tag}
          </Badge>
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
            <TooltipTrigger>
              <Button size="icon-xs" aria-label="Checkout">
                <ShoppingCart />
              </Button>
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
