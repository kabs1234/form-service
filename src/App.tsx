import { Navigate, Route, Routes } from 'react-router'

import { RoutePath } from './routes'

type PlaceholderProps = {
  readonly title: string
}

function Placeholder({ title }: PlaceholderProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path={RoutePath.Root} element={<Navigate to={RoutePath.AdminFormList} replace />} />
      <Route path={RoutePath.AdminFormList} element={<Placeholder title="Forms" />} />
      <Route path={RoutePath.AdminFormNew} element={<Placeholder title="New form" />} />
      <Route path={RoutePath.AdminFormEdit} element={<Placeholder title="Edit form" />} />
      <Route path={RoutePath.AdminFormResponses} element={<Placeholder title="Responses" />} />
      <Route path={RoutePath.AdminFormAnalytics} element={<Placeholder title="Analytics" />} />
      <Route path={RoutePath.PublicForm} element={<Placeholder title="Public form" />} />
      <Route path={RoutePath.NotFound} element={<Placeholder title="Page not found" />} />
    </Routes>
  )
}
