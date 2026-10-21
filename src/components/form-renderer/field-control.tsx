import type { ComponentType } from 'react';

import type { FieldType } from '@shared/form';

import { CheckboxControl } from '@/components/form-renderer/checkbox-control';
import type { FieldControlProps } from '@/components/form-renderer/field-control-props';
import { RadioControl } from '@/components/form-renderer/radio-control';
import { SelectControl } from '@/components/form-renderer/select-control';
import { TextInputControl } from '@/components/form-renderer/text-input-control';
import { TextareaControl } from '@/components/form-renderer/textarea-control';

const FIELD_CONTROLS: Readonly<Record<FieldType, ComponentType<FieldControlProps>>> = {
  text: TextInputControl,
  textarea: TextareaControl,
  email: TextInputControl,
  number: TextInputControl,
  select: SelectControl,
  radio: RadioControl,
  checkbox: CheckboxControl,
  date: TextInputControl,
};

export function FieldControl(props: FieldControlProps) {
  const Control = FIELD_CONTROLS[props.field.type];
  return <Control {...props} />;
}
