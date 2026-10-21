import { Navigate, Route, Routes } from 'react-router'

import { ROUTE_PATHS } from './routes'

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
      <Route path={ROUTE_PATHS.root} element={<Navigate to={ROUTE_PATHS.adminFormList} replace />} />
      <Route path={ROUTE_PATHS.adminFormList} element={<Placeholder title="Forms" />} />
      <Route path={ROUTE_PATHS.adminFormNew} element={<Placeholder title="New form" />} />
      <Route path={ROUTE_PATHS.adminFormEdit} element={<Placeholder title="Edit form" />} />
      <Route path={ROUTE_PATHS.adminFormResponses} element={<Placeholder title="Responses" />} />
      <Route path={ROUTE_PATHS.adminFormAnalytics} element={<Placeholder title="Analytics" />} />
      <Route path={ROUTE_PATHS.publicForm} element={<Placeholder title="Public form" />} />
      <Route path={ROUTE_PATHS.notFound} element={<Placeholder title="Page not found" />} />
    </Routes>
  )
}
