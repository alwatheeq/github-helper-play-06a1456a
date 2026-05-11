import { useEffect } from 'react';
import { useToast } from '../Toast/Toast';
import { TODO_TOAST_EVENT, type TodoToastDetail } from '../../utils/todoToast';

/**
 * Bridges the custom-event-based `todo()` helper to the project's
 * ToastContext. Mount once near the top of the tree (inside ToastProvider).
 */
export const TodoToastListener: React.FC = () => {
  const { info } = useToast();
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<TodoToastDetail>).detail;
      info(`${detail.feature} — not implemented yet`, 3500);
    };
    window.addEventListener(TODO_TOAST_EVENT, handler);
    return () => window.removeEventListener(TODO_TOAST_EVENT, handler);
  }, [info]);
  return null;
};

export default TodoToastListener;
