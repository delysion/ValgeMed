import { Edit3, Trash2 } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";

export function ResourceTable<T extends { id: string }>({
  rows,
  columns,
  editBasePath,
  editParam = "edit",
  deleteAction,
  extraActions,
}: {
  rows: T[];
  columns: Array<{
    header: string;
    render: (row: T) => React.ReactNode;
  }>;
  editBasePath: string;
  editParam?: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  extraActions?: (row: T) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="px-3 py-2 text-left font-medium">
                {column.header}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-medium">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-muted">
                Nessun dato.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10 align-top">
                {columns.map((column) => (
                  <td key={column.header} className="px-3 py-2 text-muted">
                    {column.render(row)}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    {extraActions?.(row)}
                    <Button asChild variant="ghost" size="icon">
                      <a href={`${editBasePath}?${editParam}=${row.id}`} aria-label="Modifica">
                        <Edit3 className="h-4 w-4" />
                      </a>
                    </Button>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="icon"
                        aria-label="Elimina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
