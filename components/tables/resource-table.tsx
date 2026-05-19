import { Edit3, Trash2 } from "lucide-react";
import type React from "react";

import { EmptyState } from "@/components/premium/empty-state";
import { Button } from "@/components/ui/button";

export function ResourceTable<T extends { id: string }>({
  rows,
  columns,
  editBasePath,
  editParam = "edit",
  deleteAction,
  extraActions,
  labels = { actions: "Actions", empty: "No data yet.", edit: "Edit", delete: "Delete" },
  emptyState,
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
  labels?: {
    actions: string;
    empty: string;
    edit: string;
    delete: string;
  };
  emptyState?: {
    title: string;
    description: string;
    actionLabel?: string;
    href?: string;
  };
}) {
  return (
    <div>
      <div className="grid gap-3 md:hidden">
        {rows.length === 0 ? (
          emptyState ? (
            <EmptyState title={emptyState.title} description={emptyState.description} actionLabel={emptyState.actionLabel} href={emptyState.href} />
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.035] p-6 text-center text-sm text-muted">
              {labels.empty}
            </div>
          )
        ) : (
          rows.map((row) => (
            <article key={row.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[var(--ring-soft)]">
              <div className="space-y-3">
                {columns.map((column) => (
                  <div key={column.header}>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-2">
                      {column.header}
                    </p>
                    <div className="mt-1 text-sm text-muted">{column.render(row)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-1 border-t border-white/10 pt-3">
                {extraActions?.(row)}
                <Button asChild variant="ghost" size="icon">
                  <a href={`${editBasePath}?${editParam}=${row.id}`} aria-label={labels.edit}>
                    <Edit3 className="h-4 w-4" />
                  </a>
                </Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" variant="destructive" size="icon" aria-label={labels.delete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-white/10 md:block">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="px-3 py-2 text-left font-medium">
                {column.header}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-medium">{labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-3 py-8">
                {emptyState ? (
                  <EmptyState title={emptyState.title} description={emptyState.description} actionLabel={emptyState.actionLabel} href={emptyState.href} />
                ) : (
                  <p className="text-center text-muted">{labels.empty}</p>
                )}
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
                      <a href={`${editBasePath}?${editParam}=${row.id}`} aria-label={labels.edit}>
                        <Edit3 className="h-4 w-4" />
                      </a>
                    </Button>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="icon"
                        aria-label={labels.delete}
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
    </div>
  );
}
