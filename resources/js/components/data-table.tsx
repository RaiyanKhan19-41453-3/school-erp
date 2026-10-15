import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useState } from 'react';

interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    // Cell values are heterogeneous (columns use computed keys like `student_name`);
    // each caller narrows the value to its own type in the render callback.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: (value: any, row: T) => ReactNode;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: PaginatedData<T>;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
        per_page?: number;
    };
    routeName?: string;
    searchPlaceholder?: string;
    extraParams?: Record<string, string | number | undefined>;
    actions?: (row: T) => ReactNode;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function DataTable<T>({
    columns,
    data,
    filters,
    routeName = 'classes.index',
    searchPlaceholder = 'Search...',
    extraParams = {},
    actions,
}: DataTableProps<T>) {
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchInput, 300);

    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            router.get(
                route(routeName),
                {
                    search: debouncedSearch,
                    page: 1,
                    sort: filters.sort || 'created_at',
                    direction: filters.direction || 'desc',
                    per_page: filters.per_page || 10,
                    ...extraParams,
                },
                { preserveState: true, preserveScroll: true },
            );
        }
    }, [debouncedSearch, filters.search, filters.sort, filters.direction, filters.per_page, routeName, extraParams]);

    const handleSort = useCallback(
        (key: string) => {
            const col = columns.find((c) => c.key === key);
            if (!col?.sortable) return;

            const currentSort = filters.sort;
            const currentDirection = filters.direction;
            const newDirection = currentSort === key && currentDirection === 'asc' ? 'desc' : 'asc';

            router.get(
                route(routeName),
                {
                    sort: key,
                    direction: newDirection,
                    page: 1,
                    per_page: filters.per_page || 10,
                    search: filters.search || '',
                    ...extraParams,
                },
                { preserveState: true, preserveScroll: true },
            );
        },
        [columns, filters.sort, filters.direction, filters.per_page, filters.search, routeName, extraParams],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            router.get(
                route(routeName),
                {
                    page: newPage,
                    sort: filters.sort || 'created_at',
                    direction: filters.direction || 'desc',
                    per_page: filters.per_page || 10,
                    search: filters.search || '',
                    ...extraParams,
                },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters.sort, filters.direction, filters.per_page, filters.search, routeName, extraParams],
    );

    const handlePerPageChange = useCallback(
        (newPerPage: number) => {
            router.get(
                route(routeName),
                {
                    per_page: newPerPage,
                    page: 1,
                    sort: filters.sort || 'created_at',
                    direction: filters.direction || 'desc',
                    search: filters.search || '',
                    ...extraParams,
                },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters.sort, filters.direction, filters.search, routeName, extraParams],
    );

    return (
        <div className="rounded-lg border">
            <div className="flex flex-wrap items-center gap-4 border-b p-4">
                <div className="max-w-[300px] min-w-[200px] flex-1">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                        {data.total} {data.total === 1 ? 'record' : 'records'}
                    </span>
                    <Select value={String(filters.per_page || 10)} onValueChange={(v) => handlePerPageChange(parseInt(v))}>
                        <SelectTrigger className="h-9 w-[110px]">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`text-muted-foreground px-4 py-3 text-left text-sm font-medium ${col.sortable ? 'hover:bg-muted cursor-pointer select-none' : ''}`}
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && filters.sort === col.key && (
                                            <span className="flex items-center">
                                                {filters.direction === 'asc' ? (
                                                    <ChevronUp className="text-muted-foreground h-3.5 w-3.5" />
                                                ) : (
                                                    <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-muted-foreground px-4 py-8 text-center text-sm">
                                    {filters.search ? 'No records match your search.' : 'No records found.'}
                                </td>
                            </tr>
                        ) : (
                            data.data.map((row, rowIndex) => {
                                const record = row as Record<string, unknown>;

                                return (
                                    <tr key={String(record.id ?? rowIndex)} className="hover:bg-muted/30 border-t transition-colors">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-4 py-3 text-sm">
                                                {col.render ? col.render(record[col.key], row) : String(record[col.key] ?? '—')}
                                            </td>
                                        ))}
                                        {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {data.last_page > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                    <div className="text-muted-foreground text-sm">
                        Showing {data.from} to {data.to} of {data.total} records
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(data.current_page - 1)}
                            disabled={data.current_page === 1}
                            className="border-input hover:bg-accent rounded-md border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-muted-foreground px-3 py-1 text-sm">
                            Page {data.current_page} of {data.last_page}
                        </span>
                        <button
                            onClick={() => handlePageChange(data.current_page + 1)}
                            disabled={data.current_page === data.last_page}
                            className="border-input hover:bg-accent rounded-md border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
