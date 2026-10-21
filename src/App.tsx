import { Navigate, Route, Routes } from 'react-router';

import { FormBuilderPage } from '@/pages/form-builder-page';
import { FormListPage } from '@/pages/form-list-page';
import { FormResponsesPage } from '@/pages/form-responses-page';
import { PublicFormPage } from '@/pages/public-form-page';
import { RoutePath } from '@/routes';

type PlaceholderProps = {
  readonly title: string;
};

function Placeholder({ title }: PlaceholderProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path={RoutePath.Root} element={<Navigate to={RoutePath.AdminFormList} replace />} />
      <Route path={RoutePath.AdminFormList} element={<FormListPage />} />
      <Route path={RoutePath.AdminFormNew} element={<FormBuilderPage />} />
      <Route path={RoutePath.AdminFormEdit} element={<FormBuilderPage />} />
      <Route path={RoutePath.AdminFormResponses} element={<FormResponsesPage />} />
      <Route path={RoutePath.AdminFormAnalytics} element={<Placeholder title="Analytics" />} />
      <Route path={RoutePath.PublicForm} element={<PublicFormPage />} />
      <Route path={RoutePath.NotFound} element={<Placeholder title="Page not found" />} />
    </Routes>
  );
}
