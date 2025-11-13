import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast, selectToasts } from '../store/toastSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const toasts = useSelector(selectToasts);

  const handleDismiss = useCallback((id) => {
    dispatch(removeToast(id));
  }, [dispatch]);

  useEffect(() => {
    // Auto-dismiss toasts after 5 seconds
    const timers = toasts.map(toast => 
      setTimeout(() => {
        handleDismiss(toast.id);
      }, 5000)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, handleDismiss]);

  if (!toasts.length) return null;

  const getToastClasses = (type) => {
    const baseClasses = 'p-4 rounded-lg shadow-lg mb-2 flex justify-between items-center max-w-md';
    const typeClasses = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white',
    };
    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={getToastClasses(toast.type)}
        >
          <div>
            {toast.title && <div className="font-bold">{toast.title}</div>}
            <div>{toast.message}</div>
          </div>
          <button
            onClick={() => handleDismiss(toast.id)}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
