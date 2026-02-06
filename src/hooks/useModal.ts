import { useState, useCallback } from 'react';

interface ModalData<T = void> {
    isOpen: boolean;
    data: T | null;
}

interface UseModalReturn<T = void> {
    isOpen: boolean;
    data: T | null;
    open: (data?: T) => void;
    close: () => void;
}

/**
 * Custom hook for managing modal state
 * Simplifies modal management with built-in open/close logic
 * 
 * @template T - Type of data to pass to the modal
 * @example
 * const confirmModal = useModal<{ id: number; name: string }>();
 * confirmModal.open({ id: 1, name: 'John' });
 */
export function useModal<T = void>(): UseModalReturn<T> {
    const [state, setState] = useState<ModalData<T>>({
        isOpen: false,
        data: null,
    });

    const open = useCallback((data?: T) => {
        setState({
            isOpen: true,
            data: data ?? null,
        });
    }, []);

    const close = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isOpen: false,
        }));

        // Clear data after animation (300ms)
        setTimeout(() => {
            setState({
                isOpen: false,
                data: null,
            });
        }, 300);
    }, []);

    return {
        isOpen: state.isOpen,
        data: state.data,
        open,
        close,
    };
}
