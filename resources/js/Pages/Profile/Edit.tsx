import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import EmailVerificationCard from './Partials/EmailVerificationCard';
import ProfileOverviewCard from './Partials/ProfileOverviewCard';
import ProfileNotification from '@/Components/ProfileNotification';
import TabbedLayout from '@/Components/TabbedLayout';

export default function Edit({
    emailVerificationStatus,
    status,
}: PageProps<{ emailVerificationStatus: any; status?: string }>) {
    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    {/* Profile Overview Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Account Overview
                            </h2>
                        </div>
                        <div className="p-6">
                            <ProfileOverviewCard />
                        </div>
                    </div>

                    {/* Email Verification Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Email Verification
                            </h2>
                        </div>
                        <div className="p-6">
                            <EmailVerificationCard
                                emailVerificationStatus={emailVerificationStatus}
                                userEmail={emailVerificationStatus?.userEmail || ''}
                                className="max-w-full"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'personal',
            label: 'Personal',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    {/* Profile Information Form */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <UpdateProfileInformationForm
                                status={status}
                                className="max-w-full"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'security',
            label: 'Security',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    {/* Password Update Form */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Security Settings
                            </h2>
                        </div>
                        <div className="p-6">
                            <UpdatePasswordForm className="max-w-full" />
                        </div>
                    </div>

                    {/* Account Deletion Form */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Danger Zone
                            </h2>
                        </div>
                        <div className="p-6">
                            <DeleteUserForm className="max-w-full" />
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <AuthenticatedLayout header={<span>Profile Settings</span>}>
            <Head title="Profile Settings" />

            {/* Status Notification */}
            <ProfileNotification status={status} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Enhanced Page Header */}
                    <div className="mb-8">
                        {/* Main Header Card */}
                        <div className="bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] rounded-xl shadow-xl overflow-hidden">
                            <div className="px-6 py-6 text-center relative">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10"></div>
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full translate-x-8 -translate-y-8"></div>
                                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white rounded-full -translate-x-6 translate-y-6"></div>
                                </div>
                                
                                {/* Header Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    
                                    {/* Title */}
                                    <h1 className="text-3xl font-bold text-white sm:text-4xl mb-3">
                                        Profile Settings
                                    </h1>
                                    
                                    {/* Subtitle */}
                                    <p className="text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
                                        Manage your account information, security settings, and preferences
                                    </p>
                                    
                                    {/* Quick Stats */}
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex items-center gap-4 text-blue-100">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-xs font-medium">Secure & Private</span>
                                            </div>
                                            <div className="w-px h-3 bg-blue-200/30"></div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span className="text-xs font-medium">Real-time Updates</span>
                                            </div>
                                            <div className="w-px h-3 bg-blue-200/30"></div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                <span className="text-xs font-medium">24/7 Access</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabbed Layout */}
                    <TabbedLayout 
                        tabs={tabs} 
                        defaultTab="overview"
                        className="w-full"
                    />

                    {/* Quick Actions Footer */}
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Need help? Contact our support team for assistance
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
