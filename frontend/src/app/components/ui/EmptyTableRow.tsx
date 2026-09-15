import { SearchX } from 'lucide-react';

/**
 * Full-width empty-state row for admin tables (e.g. a search with no
 * matches). Rendered inside <tbody> so the column headers stay visible.
 */
export default function EmptyTableRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3 opacity-60">
          <SearchX className="h-8 w-8" strokeWidth={1.5} />
          <p className="text-base">{message}</p>
        </div>
      </td>
    </tr>
  );
}
