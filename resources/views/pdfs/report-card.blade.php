<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Report Card — {{ $student['name'] }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #111827; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #111827; padding-bottom: 12px; }
        .header h1 { margin: 0; font-size: 20px; }
        .header p { margin: 2px 0; color: #4b5563; }
        .meta { width: 100%; margin-bottom: 16px; border-collapse: collapse; }
        .meta td { padding: 3px 6px; }
        .meta .label { font-weight: 700; width: 140px; color: #4b5563; }
        table.results { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        table.results th, table.results td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
        table.results th { background: #f3f4f6; font-weight: 700; }
        table.results td.num, table.results th.num { text-align: right; }
        tfoot td { font-weight: 700; background: #f3f4f6; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .pass { background: #d1fae5; color: #065f46; }
        .fail { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature { width: 40%; text-align: center; }
        .signature .line { border-top: 1px solid #111827; margin-top: 40px; padding-top: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>School Report Card</h1>
        <p>{{ $exam['name'] }} · {{ $exam['class'] }} · {{ $exam['academic_year'] }}</p>
        @if ($exam['grading_scale'])
            <p>Grading Scale: {{ $exam['grading_scale'] }}</p>
        @endif
    </div>

    <table class="meta">
        <tr>
            <td class="label">Student</td>
            <td>{{ $student['name'] }}</td>
            <td class="label">Admission No.</td>
            <td>{{ $student['admission_number'] }}</td>
        </tr>
    </table>

    @if (! ($totals['is_complete'] ?? true))
        <p style="color: #92400e;">Incomplete — {{ $totals['missing_subjects'] }} of {{ $totals['total_subjects'] }} subjects still need marks. Totals below cover the {{ $totals['marked_subjects'] }} marked subjects only.</p>
    @endif

    <table class="results">
        <thead>
            <tr>
                <th>Subject</th>
                <th class="num">Marks</th>
                <th class="num">%</th>
                <th class="num">Grade</th>
                <th>Result</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($subjects as $subject)
                <tr>
                    <td>
                        {{ $subject['subject'] }}
                        @if (! ($subject['has_mark'] ?? true))
                            <span style="color: #6b7280;">(Pending)</span>
                        @endif
                        @if ($subject['remarks'])
                            <span style="color: #6b7280;">({{ $subject['remarks'] }})</span>
                        @endif
                    </td>
                    <td class="num">
                        @if ($subject['has_mark'] ?? true)
                            {{ $subject['marks_obtained'] }} / {{ $subject['full_marks'] }}
                        @else
                            — / {{ $subject['full_marks'] }}
                        @endif
                    </td>
                    <td class="num">
                        @if ($subject['has_mark'] ?? true)
                            {{ $subject['percentage'] }}%
                        @else
                            —
                        @endif
                    </td>
                    <td class="num">
                        @if ($subject['has_mark'] ?? true)
                            {{ $subject['grade_label'] ?? '—' }}
                            @if ($subject['grade_point'] !== null && $subject['grade_point'] !== '')
                                ({{ $subject['grade_point'] }})
                            @endif
                        @else
                            —
                        @endif
                    </td>
                    <td>
                        @if (! ($subject['has_mark'] ?? true))
                            <span class="badge">Pending</span>
                        @elseif ($subject['passed'])
                            <span class="badge pass">Pass</span>
                        @else
                            <span class="badge fail">Fail</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td>Total: {{ $totals['marks_obtained'] }} / {{ $totals['full_marks'] }} ({{ $totals['percentage'] }}%)</td>
                <td></td>
                <td></td>
                <td class="num">
                    {{ $totals['grade_label'] ?? '—' }}
                    @if ($totals['grade_point'] !== null && $totals['grade_point'] !== '')
                        ({{ $totals['grade_point'] }})
                    @endif
                </td>
                <td>{{ $totals['passed_subjects'] }}/{{ $totals['total_subjects'] }} passed</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <div class="signature">
            <div class="line">Class Teacher</div>
        </div>
        <div class="signature">
            <div class="line">Principal</div>
        </div>
    </div>
</body>
</html>
