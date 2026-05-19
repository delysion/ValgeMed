"use client";

/* eslint-disable react-hooks/incompatible-library */

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Primitive = string | number | boolean | null | undefined;
type RowData = Record<string, Primitive>;

export function DataTableShell({
  data,
  columns,
  labels = { empty: "No data yet.", yes: "yes", no: "no" },
  className,
}: {
  data: RowData[];
  columns: Array<{ key: string; header: string }>;
  labels?: { empty: string; yes: string; no: string };
  className?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const yesLabel = labels.yes;
  const noLabel = labels.no;
  const tableColumns = useMemo<ColumnDef<RowData>[]>(
    () =>
      columns.map((column) => ({
        accessorKey: column.key,
        header: ({ column: tableColumn }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 text-xs"
            onClick={() => tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc")}
          >
            {column.header}
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue<Primitive>();
          if (typeof value === "boolean") {
            return value ? yesLabel : noLabel;
          }

          return value ?? "";
        },
      })),
    [columns, noLabel, yesLabel],
  );
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border", className)}>
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead className="bg-bg-subtle">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 text-left font-medium text-text-secondary">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-text-secondary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-text-secondary">
                {labels.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
