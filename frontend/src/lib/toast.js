import { store } from '../store/store';
import { addToast, removeToast } from '../store/toastSlice';

let idSeq = 0;

/**
 * Show a toast notification
 * @param {string} title - The title of the toast
 * @param {string} message - The message to display
 * @param {Object} options - Options for the toast
 * @param {string} [options.type='info'] - The type of toast (success, error, warning, info)
 * @param {number} [options.duration=5000] - Duration in milliseconds to show the toast
 * @returns {Function} A function to dismiss the toast
 */
export function toast(title, message, { type = 'info', duration = 5000 } = {}) {
  const id = idSeq++;
  
  // Add the toast
  store.dispatch(addToast({ id, title, message, type }));

  // Auto-dismiss after duration
  const timer = setTimeout(() => {
    dismissToast(id);
  }, duration);

  // Return a dismiss function
  return () => {
    clearTimeout(timer);
    dismissToast(id);
  };
}

// Helper methods
toast.success = (title, message) => toast(title, message, { type: 'success' });
toast.error = (title, message) => toast(title, message, { type: 'error' });
toast.warning = (title, message) => toast(title, message, { type: 'warning' });
toast.info = (title, message) => toast(title, message, { type: 'info' });

/**
 * Dismiss a toast by ID
 * @param {number} id - The ID of the toast to dismiss
 */
function dismissToast(id) {
  store.dispatch(removeToast(id));
}

/**
 * Toast component props type
typedef {Object} ToastProps
 * @property {number} id - Unique identifier for the toast
 * @property {string} title - The title of the toast
 * @property {string} message - The message to display
 * @property {'success'|'error'|'warning'|'info'} type - The type of toast
 */
