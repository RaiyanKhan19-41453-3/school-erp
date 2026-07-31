'use client';

import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
}

const DMY_PATTERN = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;

function dmyToIso(input: string): string | null {
    const match = DMY_PATTERN.exec(input.trim());
    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isoToDmy(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) {
        return '';
    }

    return `${match[3]}/${match[2]}/${match[1]}`;
}

function isoToNative(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) {
        return '';
    }

    return `${match[1]}-${match[2]}-${match[3]}`;
}

export function DatePicker({
    value,
    onChange,
    placeholder = 'DD/MM/YYYY',
    id,
    disabled,
}: DatePickerProps) {
    const [text, setText] = React.useState(isoToDmy(value));
    const nativeInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setText(isoToDmy(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setText(raw);

        if (!raw.trim()) {
            onChange('');
            return;
        }

        const iso = dmyToIso(raw);
        if (iso) {
            onChange(iso);
        }
    };

    const handleBlur = () => {
        if (text.trim() && !dmyToIso(text)) {
            setText(isoToDmy(value));
        }
    };

    const openNativePicker = () => {
        nativeInputRef.current?.showPicker();
    };

    return (
        <div className="relative">
            <Input
                id={id}
                value={text}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={10}
                inputMode="numeric"
                onChange={handleChange}
                onBlur={handleBlur}
                className="pr-10"
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={openNativePicker}
                aria-label="Open date picker"
                className="absolute inset-y-0 right-0 my-auto mr-1 size-9"
            >
                <CalendarIcon />
            </Button>
            <input
                ref={nativeInputRef}
                type="date"
                value={isoToNative(value)}
                onChange={(e) => onChange(e.target.value || '')}
                disabled={disabled}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
            />
        </div>
    );
}
