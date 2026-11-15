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

type Primitive = string | number | boolean | null | undefined;
type RowData = Record<string, Primitive>;

export function DataTable({
  data,
  columns,
  labels = { empty: "No data yet.", yes: "yes", no: "no" },
}: {
  data: RowData[];
  columns: Array<{ key: string; header: string }>;
  labels?: { empty: string; yes: string; no: string };
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
    <div>
      <div className="grid gap-3 md:hidden">
        {table.getRowModel().rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-bg-subtle p-6 text-center text-sm text-text-secondary">
            {labels.empty}
          </div>
        ) : (
          table.getRowModel().rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-border bg-bg-subtle p-4">
              <div className="space-y-2">
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id}>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {cell.column.columnDef.header as string}
                    </p>
                    <div className="mt-0.5 text-sm text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-panel border border-border bg-bg-surface md:block">
        <table className="w-full min-w-[680px] border-collapse text-ui-body">
          <thead className="bg-bg-subtle text-ui-label">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-4 py-2.5 text-left font-semibold text-text-secondary">
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
                    <td key={cell.id} className="px-4 py-2.5 text-text-secondary">
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
    </div>
  );
}
