import type { Form } from '@shared/form';

import { AddFieldPanel } from '@/components/builder/add-field-panel';
import { BuilderHeader } from '@/components/builder/builder-header';
import type { SaveStatus } from '@/components/builder/builder-header';
import { FieldEditor } from '@/components/builder/field-editor';
import { FormDetailsCard } from '@/components/builder/form-details-card';
import { PublicLinkPanel } from '@/components/builder/public-link-panel';
import { FormPreview } from '@/components/form-renderer/form-preview';
import { useFormBuilder } from '@/hooks/use-form-builder';
import type { FormBuilderState } from '@/hooks/use-form-builder';
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning';
import { selectNestedErrors } from '@/lib/validation-errors';

type FormBuilderProps = {
  readonly initialForm?: Form;
};

type SaveStatusInput = Pick<
  FormBuilderState,
  'savedForm' | 'isSaving' | 'hasErrors' | 'requestError' | 'hasUnsavedChanges'
>;

const UNTITLED_FORM = 'Untitled form';

function getSaveStatus(builder: SaveStatusInput): SaveStatus {
  if (builder.isSaving) {
    return { text: 'Saving…', isError: false };
  }

  if (builder.hasErrors) {
    return { text: 'Fix the highlighted fields to save', isError: true };
  }

  if (builder.requestError) {
    return { text: builder.requestError, isError: true };
  }

  if (builder.hasUnsavedChanges) {
    return { text: 'Unsaved changes', isError: false };
  }

  return { text: builder.savedForm ? 'All changes saved' : 'Not saved yet', isError: false };
}

export function FormBuilder({ initialForm }: FormBuilderProps) {
  const builder = useFormBuilder(initialForm);
  const { draft, savedForm, errors } = builder;
  const lastIndex = draft.fields.length - 1;

  useUnsavedChangesWarning(builder.hasUnsavedChanges);

  return (
    <>
      <BuilderHeader
        title={draft.title || UNTITLED_FORM}
        saveStatus={getSaveStatus(builder)}
        isPublished={draft.published}
        isSaving={builder.isSaving}
        hasUnsavedChanges={builder.hasUnsavedChanges}
        onPublish={builder.publish}
        onUnpublish={builder.unpublish}
        onSave={builder.save}
      />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2">
        <section aria-label="Form editor" className="grid content-start gap-4">
          <FormDetailsCard details={draft} errors={errors} onChange={builder.updateDetails} />

          {savedForm && (
            <PublicLinkPanel
              form={savedForm}
              isRegenerating={builder.isRegenerating}
              onRegenerate={builder.regenerateLink}
            />
          )}

          <ol className="grid gap-4">
            {draft.fields.map((field, index) => (
              <li key={field.id}>
                <FieldEditor
                  field={field}
                  position={index + 1}
                  isFirst={index === 0}
                  isLast={index === lastIndex}
                  isNew={field.id === builder.newFieldId}
                  errors={selectNestedErrors(errors, `fields.${index}`)}
                  onChange={(updatedField) => builder.updateField(index, updatedField)}
                  onMoveUp={() => builder.moveField({ from: index, to: index - 1 })}
                  onMoveDown={() => builder.moveField({ from: index, to: index + 1 })}
                  onDelete={() => builder.deleteField(index)}
                />
              </li>
            ))}
          </ol>

          <AddFieldPanel onAdd={builder.addField} />
        </section>

        <aside aria-label="Live preview" className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Live preview
          </p>

          <div className="rounded-xl border bg-card p-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <FormPreview form={draft} />
          </div>
        </aside>
      </main>
    </>
  );
}
