import { generatePath } from 'react-router';

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

export function buildFormEditPath(id: string): string {
  return generatePath(RoutePath.AdminFormEdit, { id });
}

export function buildFormResponsesPath(id: string): string {
  return generatePath(RoutePath.AdminFormResponses, { id });
}

export function buildFormAnalyticsPath(id: string): string {
  return generatePath(RoutePath.AdminFormAnalytics, { id });
}

export function buildPublicFormUrl(slug: string): string {
  return new URL(generatePath(RoutePath.PublicForm, { slug }), window.location.origin).href;
}
