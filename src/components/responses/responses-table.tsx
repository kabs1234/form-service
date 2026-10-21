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

export function ResponsesTable({ fields, responses }: ResponsesTableProps) {
  const columns = buildResponseColumns(fields, responses);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submitted</TableHead>

            {columns.map((column) => (
              <TableHead
                key={column.fieldId}
                className={cn(column.isDeleted && 'text-muted-foreground italic')}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortByRecentSubmission(responses).map((response) => (
            <TableRow key={response.id}>
              <TableCell className="text-muted-foreground">
                {formatSubmittedAt(response.submittedAt)}
              </TableCell>

              {columns.map((column) => (
                <TableCell
                  key={column.fieldId}
                  className="max-w-xs truncate"
                  title={formatAnswer(response, column.fieldId)}
                >
                  {formatAnswer(response, column.fieldId)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
