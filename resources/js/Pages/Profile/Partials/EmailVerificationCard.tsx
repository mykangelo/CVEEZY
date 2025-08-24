import { EmailVerificationStatus } from '@/types';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Transition } from '@headlessui/react';

interface EmailVerificationCardProps {
    emailVerificationStatus: EmailVerificationStatus;
    userEmail: string;
    className?: string;
}

export default function EmailVerificationCard({
    emailVerificationStatus,
    userEmail,
    className = '',
}: EmailVerificationCardProps) {
    const [showResendForm, setShowResendForm] = useState(false);
    
    const { post, processing, recentlySuccessful } = useForm();

    const handleSendVerification = () => {
        post(route('profile.send-verification-email'));
        setShowResendForm(false);
    };

    const getStatusIcon = () => {
        switch (emailVerificationStatus.status) {
            case 'verified':
                return (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'social_user':
                return (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                );
        }
    };

    const getStatusColor = () => {
        switch (emailVerificationStatus.status) {
            case 'verified':
                return 'bg-green-50 border-green-200';
            case 'social_user':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusBadge = () => {
        switch (emailVerificationStatus.status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                    </span>
                );
            case 'social_user':
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Social Login
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Unverified
                    </span>
                );
        }
    };

    return (
        <div className={className}>
            <div className="space-y-6">
                {/* Status Display */}
                <div className={`p-6 rounded-xl border-2 ${getStatusColor()}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            {getStatusIcon()}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {emailVerificationStatus.message}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-mono font-medium">{userEmail}</span>
                                </div>
                            </div>
                        </div>
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Action Buttons */}
                {emailVerificationStatus.recommended && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <PrimaryButton
                                onClick={() => setShowResendForm(true)}
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Verification Email
                            </PrimaryButton>
                            
                            <SecondaryButton
                                onClick={() => setShowResendForm(false)}
                                className="flex items-center gap-2 px-6 py-3 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </SecondaryButton>
                        </div>

                        {/* Resend Form */}
                        <Transition
                            show={showResendForm}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 transform scale-95"
                            enterTo="opacity-100 transform scale-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 transform scale-100"
                            leaveTo="opacity-0 transform scale-95"
                        >
                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            Send Verification Email
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            We'll send a verification link to <span className="font-medium text-gray-900">{userEmail}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PrimaryButton
                                        onClick={handleSendVerification}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-3 text-sm font-medium"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Send Verification Link
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </Transition>
                    </div>
                )}

                {/* Success Message */}
                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-green-800">
                                    Verification email sent successfully!
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    Check your inbox and click the verification link.
                                </p>
                            </div>
                        </div>
                    </div>
                </Transition>

                {/* Benefits Information */}
                {!emailVerificationStatus.verified && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl border-2 border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Why verify your email?
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-900">Enhanced Security</h5>
                                </div>
                                <p className="text-xs text-gray-600">Protect your account from unauthorized access</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-900">Password Recovery</h5>
                                </div>
                                <p className="text-xs text-gray-600">Reset your password if you forget it</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-900">Important Updates</h5>
                                </div>
                                <p className="text-xs text-gray-600">Receive critical account notifications</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
