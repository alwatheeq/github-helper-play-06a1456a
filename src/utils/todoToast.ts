import { toast } from 'sonner';

/**
 * Used during the Scholar v4 migration. Any v4 control that doesn't yet have
 * a real handler calls `todo("<feature name>")` instead of an empty onClick,
 * so missing functionality is visible to users (and to QA) without breaking
 * the UI.
 *
 * Every call site should also be logged in docs/SCHOLAR_V4_ISSUES.md so we
 * can track what still needs wiring.
 */
export const todo = (feature: string, description = 'Coming soon') => {
  toast(`${feature} — not implemented yet`, { description });
};

export default todo;
