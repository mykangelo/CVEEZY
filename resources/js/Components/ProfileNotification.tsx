import { Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';

interface ProfileNotificationProps {
    status?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    autoDismiss?: boolean;
    dismissDelay?: number;
}

export default function ProfileNotification({ 
    status, 
    type = 'success', 
    autoDismiss = true,
    dismissDelay = 5000 
}: ProfileNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (status) {
            setIsVisible(true);
            
            if (autoDismiss) {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, dismissDelay);
                
                return () => clearTimeout(timer);
            }
        }
    }, [status, autoDismiss, dismissDelay]);

    if (!status) return null;

    const getNotificationStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-lg';
            case 'error':
                return 'bg-gradient-to-r from-red-500 to-pink-500 border-red-400 shadow-lg';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 shadow-lg';
            case 'info':
                return 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-400 shadow-lg';
            default:
                return 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-lg';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getProgressBarColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-300';
            case 'error':
                return 'bg-red-300';
            case 'warning':
                return 'bg-yellow-300';
            case 'info':
                return 'bg-blue-300';
            default:
                return 'bg-green-300';
        }
    };

    return (
        <Transition
            show={isVisible}
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="transform opacity-0 scale-95 translate-y-2"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 translate-y-2"
        >
            <div className="fixed top-6 right-6 z-50 max-w-sm w-full">
                <div className={`${getNotificationStyles()} rounded-xl border-2 p-4 text-white shadow-2xl`}>
                    {/* Header with Icon and Close Button */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {getIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold leading-5">
                                    {status}
                                </p>
                            </div>
                        </div>
                        
                        {/* Close Button */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="flex-shrink-0 ml-3 -mr-1.5 -mt-1.5 p-1.5 rounded-lg hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar for Auto-dismiss */}
                    {autoDismiss && (
                        <div className="mt-3 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                            <div 
                                className={`h-full ${getProgressBarColor()} rounded-full transition-all duration-200 ease-linear`}
                                style={{
                                    animation: `progress ${dismissDelay}ms linear forwards`
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* CSS Animation for Progress Bar */}
                <style>{`
                    @keyframes progress {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `}</style>
            </div>
        </Transition>
    );
}
