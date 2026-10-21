export const ROUTE_PATHS = {
  root: '/',
  adminFormList: '/admin',
  adminFormNew: '/admin/forms/new',
  adminFormEdit: '/admin/forms/:id',
  adminFormResponses: '/admin/forms/:id/responses',
  adminFormAnalytics: '/admin/forms/:id/analytics',
  publicForm: '/f/:slug',
  notFound: '*',
} as const
