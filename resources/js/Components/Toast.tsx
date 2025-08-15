import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-400" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-400" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-white border-l-4 border-green-400 shadow-md';
            case 'error':
                return 'bg-white border-l-4 border-red-400 shadow-md';
            case 'warning':
                return 'bg-white border-l-4 border-amber-400 shadow-md';
            case 'info':
                return 'bg-white border-l-4 border-blue-400 shadow-md';
        }
    };

    return (
        <div className={`${getStyles()} rounded-lg p-4 transition-all duration-300 ease-in-out transform`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                        {title}
                    </h3>
                    {message && (
                        <div className="mt-1 text-sm text-gray-500">
                            {message}
                        </div>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#354eab]"
                        onClick={() => onClose(id)}
                    >
                        <span className="sr-only">Close</span>
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
