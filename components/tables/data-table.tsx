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
}: {
  data: RowData[];
  columns: Array<{ key: string; header: string }>;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
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
            return value ? "si" : "no";
          }

          return value ?? "";
        },
      })),
    [columns],
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
    <div className="overflow-hidden rounded-lg border border-white/10">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead className="bg-white/[0.04]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 text-left font-medium text-muted">
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
              <tr key={row.id} className="border-t border-white/10">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-muted">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-muted">
                Nessun dato.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
