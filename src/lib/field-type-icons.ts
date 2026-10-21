import {
  AlignLeftIcon,
  AtSignIcon,
  CalendarIcon,
  ChevronsUpDownIcon,
  CircleDotIcon,
  HashIcon,
  SquareCheckIcon,
  TypeIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { FieldType } from '@shared/form';

export const FIELD_TYPE_ICONS: Readonly<Record<FieldType, LucideIcon>> = {
  text: TypeIcon,
  textarea: AlignLeftIcon,
  email: AtSignIcon,
  number: HashIcon,
  select: ChevronsUpDownIcon,
  radio: CircleDotIcon,
  checkbox: SquareCheckIcon,
  date: CalendarIcon,
};
