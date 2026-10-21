import { sendFormEvent } from '@/lib/api-client';

const SESSION_ID_KEY = 'form-session-id';
const SESSION_ID_BYTES = 16;
const HEX_RADIX = 16;
const HEX_BYTE_LENGTH = 2;

export type FormTracker = {
  readonly trackView: () => void;
  readonly trackFieldFocus: (fieldId: string) => void;
  readonly trackAnswerChange: (fieldId: string) => void;
  readonly trackSubmit: () => void;
};

function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SESSION_ID_BYTES));
  return Array.from(bytes, (byte) => byte.toString(HEX_RADIX).padStart(HEX_BYTE_LENGTH, '0')).join(
    '',
  );
}

function readSessionId(): string {
  try {
    const savedId = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (savedId) {
      return savedId;
    }

    const newId = generateSessionId();
    window.sessionStorage.setItem(SESSION_ID_KEY, newId);
    return newId;
  } catch {
    return generateSessionId();
  }
}

function createOneTimeAction(action: () => void): () => void {
  let hasRun = false;
  return () => {
    if (hasRun) {
      return;
    }
    hasRun = true;
    action();
  };
}

export function createFormTracker(slug: string): FormTracker {
  const sessionId = readSessionId();
  let lastFieldId = '';

  const trackView = createOneTimeAction(() => sendFormEvent(slug, { sessionId, type: 'view' }));
  const trackStart = createOneTimeAction(() => sendFormEvent(slug, { sessionId, type: 'start' }));
  const trackSubmit = createOneTimeAction(() => sendFormEvent(slug, { sessionId, type: 'submit' }));

  function trackFieldFocus(fieldId: string): void {
    if (fieldId === lastFieldId) {
      return;
    }
    lastFieldId = fieldId;
    sendFormEvent(slug, { sessionId, type: 'field_focus', fieldId });
  }

  function trackAnswerChange(fieldId: string): void {
    trackFieldFocus(fieldId);
    trackStart();
  }

  return { trackView, trackFieldFocus, trackAnswerChange, trackSubmit };
}
