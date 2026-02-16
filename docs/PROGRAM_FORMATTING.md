# Program Formatting Guide

## Overview
The system now includes a utility function to format program strings for better display throughout the application.

## Problem
Programs are stored in the database with concatenated strings like:
- `GRADE_1_6_GRADE_2` (Grade 1-6 program, Grade 2 level)
- `PRESCHOOL_AM_KINDER` (Preschool AM session, Kinder level)
- `PRESCHOOL_PM_NURSERY_JUNE` (Preschool PM session, Nursery level, June start)

These raw strings are not user-friendly when displayed in the UI.

## Solution
The `formatProgram()` utility function in `src/lib/format-program.ts` converts these strings into readable formats.

## Examples

### Grade Programs
| Database Value | Formatted Display |
|----------------|-------------------|
| `GRADE_1_6_GRADE_2` | `GRADE 2` |
| `GRADE_1_6_GRADE_5` | `GRADE 5` |
| `GRADE_1_6` | `GRADE 1-6` |

### Preschool Programs
| Database Value | Formatted Display |
|----------------|-------------------|
| `PRESCHOOL_AM_KINDER` | `KINDER (AM)` |
| `PRESCHOOL_PM_NURSERY` | `NURSERY (PM)` |
| `PRESCHOOL_AM_TODDLER_JUNE` | `TODDLER (AM) - JUNE` |
| `PRESCHOOL_PM_PREKINDER_JULY` | `PREKINDER (PM) - JULY` |

## Usage

### Import the function
```typescript
import { formatProgram } from '@/lib/format-program';
```

### Use in components
```typescript
// Instead of:
<TableCell>{enrollment.program}</TableCell>

// Use:
<TableCell>{formatProgram(enrollment.program)}</TableCell>
```

## Functions Available

### `formatProgram(program: string): string`
Main formatting function for full display.

### `formatProgramShort(program: string): string`
Returns abbreviated version for compact displays:
- `GRADE_1_6_GRADE_2` → `G2`
- `PRESCHOOL_AM_KINDER` → `K`
- `PRESCHOOL_PM_NURSERY` → `N`

## Components Updated
The following components now use the formatter:
- `students-list.tsx`
- `admissions-list.tsx`
- `enhanced-admin-dashboard.tsx`
- `parent-submissions.tsx`
- `enrollment-detail.tsx`
- `admin-dashboard.tsx`

## Notes
- The formatter handles missing or malformed data gracefully
- Returns empty string for null/undefined input
- Falls back to replacing underscores with spaces for unknown formats
