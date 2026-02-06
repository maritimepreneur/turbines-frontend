import { useState, useCallback } from 'react';

interface NotificationData {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
}

interface UseNotificationReturn {
    notification: NotificationData | null;
    isOpen: boolean;
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
    showInfo: (title: string, message: string) => void;
    close: () => void;
}

/**
 * Custom hook for managing notification/toast state
 * Provides convenient methods for showing different types of notifications
 * 
 * @example
 * const notify = useNotification();
 * notify.showSuccess('Success!', 'Operation completed');
 * notify.showError('Error!', 'Something went wrong');
 */
export function useNotification(): UseNotificationReturn {
    const [notification, setNotification] = useState<NotificationData | null>(null);

    const show = useCallback((data: NotificationData) => {
        setNotification(data);
    }, []);

    const close = useCallback(() => {
        setNotification(null);
    }, []);

    const showSuccess = useCallback((title: string, message: string) => {
        show({ type: 'success', title, message });
    }, [show]);

    const showError = useCallback((title: string, message: string) => {
        show({ type: 'error', title, message });
    }, [show]);

    const showInfo = useCallback((title: string, message: string) => {
        show({ type: 'info', title, message });
    }, [show]);

    return {
        notification,
        isOpen: notification !== null,
        showSuccess,
        showError,
        showInfo,
        close,
    };
}
