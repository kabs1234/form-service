export const RoutePath = {
  Root: '/',
  AdminFormList: '/admin',
  AdminFormNew: '/admin/forms/new',
  AdminFormEdit: '/admin/forms/:id',
  AdminFormResponses: '/admin/forms/:id/responses',
  AdminFormAnalytics: '/admin/forms/:id/analytics',
  PublicForm: '/f/:slug',
  NotFound: '*',
} as const;
