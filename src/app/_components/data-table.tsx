"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef as TanstackColumnDef,
} from "@tanstack/react-table";
import { isValidElement, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { Typography } from "./typography";

export type ColumnDef<TData> = {
  id?: string;
  header: TanstackColumnDef<TData>["header"];
  /** Field key on the row, or a function that returns the cell content. */
  value: (keyof TData & string) | ((row: TData) => ReactNode);
  /** Shrink the column to its content and align it. */
  float?: "left" | "right";
};

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  className?: React.ComponentProps<"div">["className"];
  onRowClick?: (row: TData) => void;
  loading?: boolean;
  error?: string | null;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    float?: "left" | "right";
  }
}

function floatClassName(float: "left" | "right" | undefined) {
  if (!float) return undefined;

  return cn(
    "w-0 whitespace-nowrap",
    float === "left" && "text-left",
    float === "right" && "text-right",
  );
}

/** Render cell values that may be React nodes (not only primitives). */
function renderCellValue(value: unknown): ReactNode {
  if (value == null || typeof value === "boolean") {
    return value;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    isValidElement(value) ||
    Array.isArray(value)
  ) {
    return value;
  }

  return String(value);
}

function toTanstackColumnDef<TData>(
  column: ColumnDef<TData>,
  index: number,
): TanstackColumnDef<TData, unknown> {
  const id =
    column.id ??
    (typeof column.value === "string" ? column.value : `column_${index}`);

  const base = {
    id,
    header: column.header,
    meta: { float: column.float },
  };

  if (typeof column.value === "function") {
    const getContent = column.value;
    return {
      ...base,
      accessorFn: (row) => getContent(row),
      cell: ({ getValue }) => renderCellValue(getValue()),
    };
  }

  return {
    ...base,
    accessorKey: column.value,
    cell: ({ getValue }) => renderCellValue(getValue()),
  };
}

export function DataTable<TData>({
  columns,
  data,
  className,
  onRowClick,
  loading,
  error,
}: DataTableProps<TData>) {
  const tableColumns = columns.map(toTanstackColumnDef);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  let body: ReactNode;
  if (loading) {
    body = (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <div className="flex items-center justify-center gap-2">
            <Typography variant="muted">Loading...</Typography>
            <Loader2 className="animate-spin" size={16} />
          </div>
        </TableCell>
      </TableRow>
    );
  } else if (error) {
    body = (
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className="text-destructive h-24 text-center"
        >
          {error}
        </TableCell>
      </TableRow>
    );
  } else if (table.getRowModel().rows.length) {
    body = table.getRowModel().rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className={onRowClick ? "cursor-pointer" : undefined}
        onClick={
          onRowClick
            ? (event) => {
                const target = event.target as HTMLElement;
                if (
                  target.closest(
                    "button, a, input, select, textarea, [role='button']",
                  )
                ) {
                  return;
                }
                onRowClick(row.original);
              }
            : undefined
        }
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={floatClassName(cell.column.columnDef.meta?.float)}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  } else {
    body = (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={floatClassName(
                    header.column.columnDef.meta?.float,
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{body}</TableBody>
      </Table>
    </div>
  );
}

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export function Pagination({
  page,
  total,
  limit,
  setPage,
  setLimit,
}: {
  page: number;
  total: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: PageSize) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <div className="flex items-center gap-2">
        <Typography variant="muted">
          {total === 0 ? "No items" : `Showing ${from}–${to} of ${total}`}
        </Typography>
        <Typography variant="muted">·</Typography>
        <Typography variant="muted">Rows per page:</Typography>
        <Select
          value={String(limit)}
          onValueChange={(value) => {
            if (value == null) return;
            setLimit(Number(value) as PageSize);
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            aria-label="First page"
            onClick={() => setPage(1)}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            aria-label="Previous page"
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            <ChevronLeft />
          </Button>
          <Typography as="span" variant="small" className="px-2">
            Page {page} of {totalPages}
          </Typography>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            aria-label="Next page"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            aria-label="Last page"
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
