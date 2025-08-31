import { Link } from '@inertiajs/react';
import Logo from "@/Components/Logo";
import { User } from '@/types';

interface SidebarMenuProps {
    user: User;
    onResumeReviewClick: () => void;
    onInterviewPrepClick: () => void;
}

export default function SidebarMenu({ user, onResumeReviewClick, onInterviewPrepClick }: SidebarMenuProps) {
    return (
        <div className="fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-40 border-r border-gray-100">
            {/* Sidebar Header */}
            <div className="flex items-center justify-center p-10 border-b border-gray-100">
                <div className="flex items-center justify-center w-full">
                    <Logo
                        size="xxl"
                        showText={false}
                        className="!h-24 !w-96 text-2xl font-bold text-[#222] hover:scale-105 transition-all duration-500 ease-out"
                    />
                </div>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2">
                {/* Homepage - Primary Navigation */}
                <Link 
                    href="/"
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 text-gray-800 hover:text-[#354eab] hover:bg-[#f8faff] font-semibold rounded-lg transition-all duration-300 ease-out group border border-transparent hover:border-[#354eab]/20"
                >
                    <div className="w-7 h-7 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-out shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span className="text-sm">Homepage</span>
                </Link>

                {/* Dashboard - Primary Navigation */}
                <Link 
                    href="/dashboard"
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 text-gray-800 hover:text-[#354eab] hover:bg-[#f8faff] font-semibold rounded-lg transition-all duration-300 ease-out group border border-transparent hover:border-[#354eab]/20"
                >
                    <div className="w-7 h-7 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-out shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                    </div>
                    <span className="text-sm">Dashboard</span>
                </Link>

                {/* Profile Settings - Primary Navigation */}
                <Link 
                    href="/profile"
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 text-gray-800 hover:text-[#354eab] hover:bg-[#f8faff] font-semibold rounded-lg transition-all duration-300 ease-out group border border-transparent hover:border-[#354eab]/20"
                >
                    <div className="w-7 h-7 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-out shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="text-sm">Profile Settings</span>
                </Link>

                {/* Contact - Primary Navigation */}
                <Link 
                    href="/contact"
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 text-gray-800 hover:text-[#354eab] hover:bg-[#f8faff] font-semibold rounded-lg transition-all duration-300 ease-out group border border-transparent hover:border-[#354eab]/20"
                >
                    <div className="w-7 h-7 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-out shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-sm">Contact</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* Secondary Navigation Items */}
                <button 
                    onClick={onResumeReviewClick}
                    className="w-full flex items-center space-x-2 px-2 py-1.5 text-gray-600 hover:text-[#354eab] hover:bg-gray-50 font-medium rounded-lg transition-all duration-300 ease-out group"
                >
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#354eab] group-hover:scale-110 transition-all duration-300 ease-out">
                        <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-all duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <span className="text-sm">Get Resume Feedback</span>
                </button>
                
                <button 
                    onClick={onInterviewPrepClick}
                    className="w-full flex items-center space-x-2 px-2 py-1.5 text-gray-600 hover:text-[#354eab] hover:bg-gray-50 font-medium rounded-lg transition-all duration-300 ease-out group"
                >
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#354eab] group-hover:scale-110 transition-all duration-300 ease-out">
                        <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-all duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-sm">Ace Your Interview</span>
                </button>
            </nav>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                <Link 
                    href="/logout" 
                    method="post" 
                    as="button"
                    className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-all duration-300 ease-out group"
                >
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300 ease-out">
                        <svg className="w-5 h-5 text-red-600 group-hover:text-white transition-all duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <span className="text-base">Log out</span>
                </Link>
            </div>
        </div>
    );
}
