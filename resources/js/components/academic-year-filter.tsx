import { Combobox } from '@/components/ui/combobox';

interface AcademicYearOption {
    id: number;
    name: string;
    is_current: boolean;
}

export function AcademicYearFilter({
    academicYears,
    value,
    onValueChange,
}: {
    academicYears: AcademicYearOption[];
    value: string;
    onValueChange: (value: string) => void;
}) {
    return (
        <div className="w-56 space-y-1.5">
            <span className="text-sm font-medium">Academic Year</span>
            <Combobox
                options={academicYears.map((year) => ({
                    value: String(year.id),
                    label: year.is_current ? `${year.name} (Current)` : year.name,
                }))}
                value={value}
                onValueChange={onValueChange}
                placeholder="Select academic year"
                searchPlaceholder="Search years..."
                emptyText="No year found."
            />
        </div>
    );
}
