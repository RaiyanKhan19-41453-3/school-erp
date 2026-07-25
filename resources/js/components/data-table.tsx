import { ReactNode } from 'react';

interface Column<T> {
    key: string;
    label: string;
    render?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
}

export function DataTable<T extends Record<string, any>>({ columns, data }: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                No records found.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
                <thead>
                    <tr className="bg-muted/50">
                        {columns.map((col) => (
                            <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={row.id ?? rowIndex} className="border-t transition-colors hover:bg-muted/30">
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3 text-sm">
                                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
