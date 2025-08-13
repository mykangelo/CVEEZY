import React from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
    toasts: ToastProps[];
    onCloseToast: (id: string) => void;
}

export default function ToastContainer({ toasts, onCloseToast }: ToastContainerProps) {
    return (
        <div 
            className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
            style={{ zIndex: 9999 }}
        >
            {toasts.map((toast) => (
                <div 
                    key={toast.id}
                    className="animate-slide-in-right"
                >
                    <Toast
                        {...toast}
                        onClose={onCloseToast}
                    />
                </div>
            ))}
        </div>
    );
}
