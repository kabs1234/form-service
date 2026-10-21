import { useState } from 'react';
import { useNavigate } from 'react-router';

import { formInputSchema } from '@shared/form';
import type { Field, FieldType, Form, FormInput } from '@shared/form';

import { createForm, getErrorMessage, regenerateFormSlug, updateForm } from '@/lib/api-client';
import { moveItem, removeItemAt, replaceItemAt } from '@/lib/array';
import type { MoveIndices } from '@/lib/array';
import { createField, EMPTY_FORM_INPUT, extractFormInput, isSameFormInput } from '@/lib/form-draft';
import type { FormDetails } from '@/lib/form-draft';
import { buildErrorMap, NO_ERRORS } from '@/lib/validation-errors';
import type { ErrorMap } from '@/lib/validation-errors';
import { buildFormEditPath } from '@/routes';

export type FormBuilderState = {
  readonly draft: FormInput;
  readonly savedForm?: Form;
  readonly errors: ErrorMap;
  readonly hasErrors: boolean;
  readonly hasUnsavedChanges: boolean;
  readonly isSaving: boolean;
  readonly isRegenerating: boolean;
  readonly requestError: string;
  readonly newFieldId: string;
  readonly updateDetails: (details: FormDetails) => void;
  readonly addField: (type: FieldType) => void;
  readonly updateField: (index: number, field: Field) => void;
  readonly moveField: (indices: MoveIndices) => void;
  readonly deleteField: (index: number) => void;
  readonly save: () => void;
  readonly publish: () => void;
  readonly unpublish: () => void;
  readonly regenerateLink: () => void;
};

function validateDraft(draft: FormInput): ErrorMap {
  const result = formInputSchema.safeParse(draft);

  return result.success ? NO_ERRORS : buildErrorMap(result.error.issues);
}

export function useFormBuilder(initialForm?: Form): FormBuilderState {
  const navigate = useNavigate();
  const [savedForm, setSavedForm] = useState(initialForm);
  const [draft, setDraft] = useState(() =>
    initialForm ? extractFormInput(initialForm) : EMPTY_FORM_INPUT,
  );
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [newFieldId, setNewFieldId] = useState('');

  const savedInput = savedForm ? extractFormInput(savedForm) : EMPTY_FORM_INPUT;
  const hasUnsavedChanges = !isSameFormInput(draft, savedInput);
  const errors = hasTriedSave ? validateDraft(draft) : NO_ERRORS;
  const hasErrors = Object.keys(errors).length > 0;

  function updateFields(update: (fields: readonly Field[]) => Field[]): void {
    setDraft((current) => ({ ...current, fields: update(current.fields) }));
  }

  function addField(type: FieldType): void {
    const field = createField(type);
    setNewFieldId(field.id);
    updateFields((fields) => [...fields, field]);
  }

  async function updateSavedForm(form: Form, input: FormInput): Promise<void> {
    const updatedForm = await updateForm(form.id, input);
    setSavedForm(updatedForm);
    setDraft(extractFormInput(updatedForm));
    setHasTriedSave(false);
  }

  async function createSavedForm(input: FormInput): Promise<void> {
    const createdForm = await createForm(input);
    await navigate(buildFormEditPath(createdForm.id), { replace: true });
  }

  async function persistDraft(input: FormInput): Promise<void> {
    setHasTriedSave(true);
    const result = formInputSchema.safeParse(input);
    if (!result.success) {
      return;
    }

    setIsSaving(true);
    setRequestError('');
    try {
      await (savedForm ? updateSavedForm(savedForm, result.data) : createSavedForm(result.data));
    } catch (error: unknown) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function regenerateSavedFormLink(form: Form): Promise<void> {
    setIsRegenerating(true);
    setRequestError('');
    try {
      setSavedForm(await regenerateFormSlug(form.id));
    } catch (error: unknown) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsRegenerating(false);
    }
  }

  return {
    draft,
    savedForm,
    errors,
    hasErrors,
    hasUnsavedChanges,
    isSaving,
    isRegenerating,
    requestError,
    newFieldId,
    updateDetails: (details) => setDraft((current) => ({ ...current, ...details })),
    addField,
    updateField: (index, field) =>
      updateFields((fields) => replaceItemAt(fields, { index, item: field })),
    moveField: (indices) => updateFields((fields) => moveItem(fields, indices)),
    deleteField: (index) => updateFields((fields) => removeItemAt(fields, index)),
    save: () => persistDraft(draft),
    publish: () => persistDraft({ ...draft, published: true }),
    unpublish: () => persistDraft({ ...draft, published: false }),
    regenerateLink: () => {
      if (savedForm) {
        regenerateSavedFormLink(savedForm);
      }
    },
  };
}
