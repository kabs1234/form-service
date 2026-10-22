import type { ReactNode } from 'react';

import type { Field } from '@shared/form';
import type { FormResponse } from '@shared/response';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  buildResponseColumns,
  formatAnswer,
  formatSubmittedAt,
  sortByRecentSubmission,
} from '@/lib/response-table';
import { cn } from '@/lib/utils';

type ResponsesTableProps = {
  readonly fields: readonly Field[];
  readonly responses: readonly FormResponse[];
};

type ResponseCellProps = {
  readonly label: string;
  readonly labelClassName?: string;
  readonly className?: string;
  readonly title?: string;
  readonly children: ReactNode;
};

const SUBMITTED_AT_LABEL = 'Отправлено';

const DELETED_COLUMN_CLASS_NAME = 'text-muted-foreground italic';

function ResponseCell({ label, labelClassName, className, title, children }: ResponseCellProps) {
  return (
    <TableCell
      title={title}
      className={cn(
        'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-4 py-1.5 wrap-break-wordwhitespace-normal md:table-cell md:max-w-xs md:truncate md:px-2 md:py-2',
        className,
      )}
    >
      <span className={cn('text-muted-foreground md:hidden', labelClassName)}>{label}</span>

      {children}
    </TableCell>
  );
}

export function ResponsesTable({ fields, responses }: ResponsesTableProps) {
  const columns = buildResponseColumns(fields, responses);

  return (
    <div className="rounded-sm border bg-sheet">
      <Table className="block md:table">
        <TableHeader className="hidden md:table-header-group">
          <TableRow>
            <TableHead>{SUBMITTED_AT_LABEL}</TableHead>

            {columns.map((column) => (
              <TableHead
                key={column.fieldId}
                className={cn(column.isDeleted && DELETED_COLUMN_CLASS_NAME)}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="block md:table-row-group">
          {sortByRecentSubmission(responses).map((response) => (
            <TableRow key={response.id} className="block py-2 md:table-row md:py-0">
              <ResponseCell label={SUBMITTED_AT_LABEL} className="text-muted-foreground">
                {formatSubmittedAt(response.submittedAt)}
              </ResponseCell>

              {columns.map((column) => (
                <ResponseCell
                  key={column.fieldId}
                  label={column.label}
                  labelClassName={cn(column.isDeleted && 'italic')}
                  title={formatAnswer(response, column.fieldId)}
                >
                  {formatAnswer(response, column.fieldId)}
                </ResponseCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
