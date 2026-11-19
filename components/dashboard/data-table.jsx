import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";

export function DataTable({ columns, rows, emptyTitle = "Nothing here yet", emptyDescription = "New activity will appear here when it is available." }) {
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <div className="overflow-hidden rounded-2xl border border-border/70 bg-background"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, rowIndex) => <TableRow key={row.id || row._id || rowIndex}>{columns.map((column) => <TableCell key={column.key}>{column.render ? column.render(row) : row[column.key]}</TableCell>)}</TableRow>)}</TableBody></Table></div>;
}
