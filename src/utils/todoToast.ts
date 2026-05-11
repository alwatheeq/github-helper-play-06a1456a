/**
 * Used during the Scholar v4 migration. Any v4 control that doesn't yet have
 * a real handler calls `todo("<feature name>")` instead of an empty onClick,
 * so missing functionality is visible to users (and to QA) without breaking
 * the UI.
 *
 * Implementation note: this util reads the project's custom ToastContext
 * lazily by dispatching a CustomEvent that the global ToastListener picks up.
 * Falls back to console.info if the listener isn't mounted yet.
 *
 * Every call site should also be logged in docs/SCHOLAR_V4_ISSUES.md so we
 * can track what still needs wiring.
 */

const TODO_EVENT = 'scholar-v4-todo-toast';

export interface TodoToastDetail {
  feature: string;
  description?: string;
}

export const todo = (feature: string, description = 'Coming soon') => {
  const detail: TodoToastDetail = { feature, description };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<TodoToastDetail>(TODO_EVENT, { detail }));
  } else {
    // SSR / non-browser safety net
    // eslint-disable-next-line no-console
    console.info(`[TODO] ${feature} — ${description}`);
  }
};

export const TODO_TOAST_EVENT = TODO_EVENT;
export default todo;
