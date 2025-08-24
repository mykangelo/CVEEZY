import { User } from '@/types';
import { usePage } from '@inertiajs/react';

export default function ProfileOverviewCard() {
    const user = usePage().props.auth.user as User;

    const getAccountType = () => {
        if (user.is_social_user) {
            return {
                label: 'Social Login',
                icon: (
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                ),
                color: 'bg-blue-100 text-blue-800'
            };
        }
        
        if (user.has_password) {
            return {
                label: 'Email & Password',
                icon: (
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ),
                color: 'bg-green-100 text-green-800'
            };
        }
        
        return {
            label: 'Social Only',
            icon: (
                <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            ),
            color: 'bg-orange-100 text-orange-800'
        };
    };

    const accountType = getAccountType();

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full">
            {/* Main Grid Layout - Full Width */}
            <div className="grid grid-cols-2 gap-4 w-full">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg w-full border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Basic Info
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium text-gray-900 truncate max-w-[120px] text-right">{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900 truncate max-w-[120px] text-right">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Type:</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${accountType.color}`}>
                                {accountType.icon}
                                {accountType.label}
                            </span>
                        </div>
                        {user.role && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Role:</span>
                                <span className="font-medium text-gray-900 capitalize">{user.role}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 p-4 rounded-lg w-full border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Stats
                    </h3>
                    <div className="space-y-3">
                        <div className="text-center bg-white p-3 rounded border border-blue-200 shadow-sm">
                            <div className="text-xl font-bold text-[#354eab]">{user.total_resumes_count || 0}</div>
                            <div className="text-xs text-gray-600">Total</div>
                        </div>
                        <div className="text-center bg-white p-3 rounded border border-green-200 shadow-sm">
                            <div className="text-xl font-bold text-green-600">{user.completed_resumes_count || 0}</div>
                            <div className="text-xs text-gray-600">Completed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Full Width */}
            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                {/* Activity */}
                <div className="bg-gray-50 p-4 rounded-lg w-full border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Activity
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Since:</span>
                            <span className="font-medium text-gray-900">{formatDate(user.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Updated:</span>
                            <span className="font-medium text-gray-900">{formatDate(user.updated_at)}</span>
                        </div>
                        {user.last_login_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Login:</span>
                                <span className="font-medium text-gray-900">{formatDate(user.last_login_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-gray-50 p-4 rounded-lg w-full border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Security
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                                user.email_verified_at 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {user.email_verified_at ? (
                                    <>
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Verified
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Unverified
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Password:</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                                user.password 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {user.password ? (
                                    <>
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Set
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Not Set
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
