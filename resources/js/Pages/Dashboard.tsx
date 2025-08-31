import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PaymentModal from '@/Components/PaymentModal';
import { Resume } from "@/types/resume";
import SidebarMenu from '@/Components/SidebarMenu';
import InterviewPrepPopUp from "@/Components/InterviewPrepPopUp"; // Fixed import path
import ResumeReviewModal from "@/Components/ResumeReviewModal";
import ToastContainer from '@/Components/ToastContainer';
import ConfirmationModal from '@/Components/ConfirmationModal';
import InlineEdit from '@/Components/InlineEdit';
import { ToastProps } from '@/Components/Toast';

interface PaymentProof {
    id: number;
    resume_id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface DashboardProps {
    resumes?: Resume[];
    paymentProofs?: PaymentProof[];
    error?: string;
    success?: string;
}

export default function Dashboard({ resumes = [], paymentProofs: initialPaymentProofs = [], error, success }: DashboardProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    // Add modal state
    const [resumeList, setResumeList] = useState<Resume[]>(resumes);
    const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>(initialPaymentProofs);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isResumeReviewModalOpen, setIsResumeReviewModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Toast and modal states
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // Toast management functions
    const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { ...toast, id, onClose: removeToast }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Check for error/success messages from props and convert to toasts
    useEffect(() => {
        if (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: error
            });
        } else if (success) {
            addToast({
                type: 'success',
                title: 'Success',
                message: success
            });
        }
    }, [error, success]);

    // Update resume list when props change
    useEffect(() => {
        setResumeList(resumes);
    }, [resumes]);

    // Removed auto-refresh on window focus to avoid unexpected UI updates

    // Update payment proofs when props change
    useEffect(() => {
        setPaymentProofs(initialPaymentProofs);
    }, [initialPaymentProofs]);

    // Removed automatic initial re-fetch; rely on server-provided props and manual refresh/actions

    // Check if user has pending payments
    const hasPendingPayments = () => {
        // If no resumes, allow creation
        if (resumeList.length === 0) {
            return false;
        }
        
        // Check if any resume has pending payment status (only restrict on pending, not rejected)
        const hasPending = resumeList.some(resume => {
            const paymentStatus = getPaymentStatus(resume.id);
            return paymentStatus === 'pending';
        });
        
        return hasPending; // Return true if there are pending payments (restrict creation)
    };

    // Check if user can create new resume
    const canCreateNewResume = () => {
        return !hasPendingPayments();
    };


    // Function to refresh dashboard data
    // Public method so other components/actions can request an on-demand refresh
    const refreshDashboardData = async () => {
        setIsRefreshing(true);
        try {
            // Refresh both resumes and payment proofs
            const [dashboardResponse, paymentProofsResponse] = await Promise.all([
                fetch('/dashboard/data'),
                fetch('/user/payment-proofs')
            ]);

            if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                if (dashboardData.resumes) {
                    setResumeList(dashboardData.resumes);
                }
            }

            if (paymentProofsResponse.ok) {
                const updatedPaymentProofs = await paymentProofsResponse.json();
                setPaymentProofs(updatedPaymentProofs);
            }
        } catch (error) {
            console.error('Error refreshing dashboard data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Removed periodic polling; dashboard refreshes only on explicit actions or when changes occur

    const handlePaymentStatusChange = (status: 'pending' | 'approved' | 'rejected', resumeId?: number) => {
        // debounced/once-per-session notification guard per resumeId
        const key = resumeId ? `toastShown:${resumeId}:${status}` : `toastShown:global:${status}`;
        try {
            const already = sessionStorage.getItem(key);
            if (already) {
                // Still refresh data but don't re-toast
                if (status === 'approved' || status === 'rejected') {
                    refreshDashboardData();
                }
                return;
            }
            sessionStorage.setItem(key, '1');
        } catch {}
        if (status === 'approved') {
            addToast({
                type: 'success',
                title: 'Payment Approved!',
                message: 'Your payment has been approved! You can now download your PDF resume.',
                duration: 8000
            });
            // Refresh dashboard data immediately when payment is approved
            refreshDashboardData();
        } else if (status === 'rejected') {
            addToast({
                type: 'error',
                title: 'Payment Rejected',
                message: 'Your payment was rejected. Please upload a new payment proof.',
                duration: 8000
            });
            // Refresh dashboard data immediately when payment is rejected
            refreshDashboardData();
        }
    };

    // Handle resume rename
    const handleResumeRename = async (resumeId: number, newName: string): Promise<boolean> => {
        try {
            const response = await fetch(`/resumes/${resumeId}/rename`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ name: newName }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update the resume list with the new name
                setResumeList(prev => prev.map(resume => 
                    resume.id === resumeId 
                        ? { ...resume, name: data.resume.name }
                        : resume
                ));

                addToast({
                    type: 'success',
                    title: 'Resume Renamed',
                    message: `Resume renamed to "${data.resume.name}"`,
                    duration: 3000
                });

                return true;
            } else {
                const errorData = await response.json();
                addToast({
                    type: 'error',
                    title: 'Rename Failed',
                    message: errorData.message || 'Failed to rename resume',
                    duration: 5000
                });
                return false;
            }
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Rename Failed',
                message: 'An error occurred while renaming the resume',
                duration: 5000
            });
            return false;
        }
    };







    // Function to get payment status for a resume
    const getPaymentStatus = (resumeId: number) => {
        const resume = resumeList.find(r => r.id === resumeId);
        return resume?.payment_status_detailed || resume?.payment_status || null; // Return null if no payment proof exists
    };

    // Function to check if resume can be downloaded
    const canDownloadResume = (resumeId: number) => {
        const resume = resumeList.find(r => r.id === resumeId);
        return resume?.is_downloadable || false;
    };



    const getPaymentStatusBadge = (resumeId: number) => {
        const resume = resumeList.find(r => r.id === resumeId);
        const status = resume?.payment_status_detailed || resume?.payment_status;
        
        // Priority: Check if needs payment due to modifications
        if (status === 'needs_payment_modified') {
            return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Needs Payment (Modified)
            </span>;
        }
        
        if (status === 'needs_payment') {
            return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Needs Payment
            </span>;
        }
        
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Payment Approved
                </span>;
            case 'rejected':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Payment Rejected
                </span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Pending
                </span>;
            case 'unpaid':
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No Payment
                </span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="CVeezy - My Dashboard" />

            {/* Notification Display */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${
                    notification.type === 'success' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {notification.type === 'success' ? (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className="font-medium text-base">{notification.message}</span>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-gray-400 hover:text-gray-600 ml-4"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar Menu */}
            <SidebarMenu 
                user={user}
                onResumeReviewClick={() => setIsResumeReviewModalOpen(true)}
                onInterviewPrepClick={() => setIsInterviewModalOpen(true)}
            />

            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-[#f8faff] via-white to-[#e8f2ff] border-b border-[#354eab]/20 ml-72 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#354eab]/5 to-[#4a5fc7]/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-[#4a5fc7]/5 to-[#354eab]/5 rounded-full blur-3xl"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-center py-6 gap-6">
                        <div className="flex-1 max-w-xl">
                            {/* Welcome badge */}
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#354eab]/10 to-[#4a5fc7]/10 border border-[#354eab]/20 rounded-full px-3 py-1.5 mb-4">
                                <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-[#354eab]">Welcome back!</span>
                            </div>
                            
                            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                Hello, <span className="bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5a6fd7] bg-clip-text text-transparent">{user?.name || 'User'}</span>! 👋
                            </h1>
                            
                            <p className="text-base text-gray-600 leading-relaxed max-w-xl mb-6">
                                Ready to build your next great resume? Let's create something amazing together.
                            </p>
                            
                            {/* Quick stats or motivational text */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Professional templates</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>ATS optimized</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>AI-powered insights</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-shrink-0 lg:ml-6 flex flex-col items-center lg:items-end justify-center">
                            {canCreateNewResume() ? (
                                <div className="relative group">
                                    {/* Enhanced glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                                    
                                    {/* Floating particles effect */}
                                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-75"></div>
                                    
                                    <button
                                        onClick={() => router.visit('/choose-template')}
                                        className="relative bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5a6fd7] hover:from-[#4a5fc7] hover:via-[#5a6fd7] hover:to-[#6a7fe7] text-white font-bold py-4 px-8 rounded-3xl transition-all duration-500 flex items-center gap-4 shadow-2xl hover:shadow-[#354eab]/40 transform hover:scale-110 border border-white/30 hover:border-white/50"
                                    >
                                        <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center group-hover:bg-white/35 transition-all duration-300">
                                            <svg className="w-5 h-5 transition-all duration-500 group-hover:rotate-90 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-lg font-bold block leading-tight">Create a New Resume</span>
                                            <span className="text-xs font-normal opacity-90">Start building now →</span>
                                        </div>
                                    </button>
                                    
                                    {/* Subtle hint text below button */}
                                    <p className="text-center text-xs text-gray-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Choose from premium templates
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 shadow-lg max-w-sm relative overflow-hidden">
                                    {/* Decorative pattern */}
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100/50 rounded-full -translate-y-10 translate-x-10"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-yellow-800 font-bold text-base block">Payment Under Review</span>
                                                <span className="text-yellow-600 text-xs">Processing your submission</span>
                                            </div>
                                        </div>
                                        <p className="text-yellow-700 text-xs leading-relaxed">
                                            You have resumes with pending payment reviews. Please wait for admin approval before creating new resumes.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl lg:max-w-7xl xl:max-w-8xl 2xl:max-w-9xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-10 lg:py-12 xl:py-16 ml-0 sm:ml-0 lg:ml-72">
                {/* My Recent Resumes Section */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 mb-8 sm:mb-10 lg:mb-12 overflow-hidden">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">My Recent Resumes</h2>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-600">Manage and track your professional resumes</p>
                            </div>
                            <button
                                onClick={refreshDashboardData}
                                disabled={isRefreshing}
                                className="text-[#354eab] hover:text-[#4a5fc7] text-xs sm:text-sm lg:text-base font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg border border-gray-200 hover:border-[#354eab] transition-all duration-200"
                            >
                                <svg className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    {resumeList.length === 0 ? (
                        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
                            <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">No resumes yet</h3>
                                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">Get started by creating your first professional resume. Choose from our premium templates and build something amazing.</p>
                                <Link
                                    href="/choose-template"
                                    className="inline-flex items-center px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-[#354eab] hover:bg-[#4a5fc7] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base lg:text-lg"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create Your First Resume
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto px-2">
                            <table className="w-full divide-y divide-gray-200 min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5">
                                            Resume Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">
                                            Payment
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {resumeList.map((resume) => (
                                        <tr key={resume.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-lg flex items-center justify-center mr-3">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 mb-1">
                                                            <InlineEdit
                                                                value={resume.name}
                                                                onSave={(newName) => handleResumeRename(resume.id, newName)}
                                                                placeholder="Resume Name"
                                                                maxLength={255}
                                                                triggerMode="icon"
                                                                validation={(value) => {
                                                                    const trimmed = value.trim();
                                                                    if (trimmed.length === 0) {
                                                                        return 'Resume name cannot be empty';
                                                                    }
                                                                    if (trimmed.length > 255) {
                                                                        return 'Resume name is too long';
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {resume.template_name ? resume.template_name.charAt(0).toUpperCase() + resume.template_name.slice(1) : 'Classic'} Template
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{resume.creation_date}</div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                                                    resume.status === 'published' 
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : resume.status === 'completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : resume.status === 'in_progress'
                                                        ? 'bg-[#e3f2fd] text-[#354eab]'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {resume.status === 'in_progress' 
                                                        ? 'In Progress' 
                                                        : resume.status.charAt(0).toUpperCase() + resume.status.slice(1)
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                {getPaymentStatusBadge(resume.id)}
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    {/* Edit functionality */}
                                                    <button
                                                        onClick={() => {
                                                            const isPaid = canDownloadResume(resume.id);
                                                            if (isPaid) {
                                                                setConfirmationModal({
                                                                    isOpen: true,
                                                                    title: 'Edit Paid Resume',
                                                                    message: 'This resume is already paid for. If you edit it, you will need to pay again to download the updated version. Do you want to continue?',
                                                                    onConfirm: async () => {
                                                                        try {
                                                                            // Mark resume as modified immediately
                                                                            const response = await fetch(`/resumes/${resume.id}/mark-modified`, {
                                                                                method: 'PATCH',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                                },
                                                                            });

                                                                            if (response.ok) {
                                                                                const data = await response.json();
                                                                                
                                                                                // Update the resume in state immediately
                                                                                setResumeList(prev => prev.map(r => 
                                                                                    r.id === resume.id 
                                                                                        ? { 
                                                                                            ...r, 
                                                                                            is_paid: data.resume.is_paid,
                                                                                            needs_payment: data.resume.needs_payment,
                                                                                            is_downloadable: data.resume.is_downloadable,
                                                                                            payment_status_detailed: data.resume.payment_status_detailed,
                                                                                            payment_status: data.resume.payment_status_detailed
                                                                                        }
                                                                                        : r
                                                                                ));

                                                                                addToast({
                                                                                    type: 'warning',
                                                                                    title: 'Download Access Restricted',
                                                                                    message: 'Resume download is now restricted. You\'ll need to pay again after editing.',
                                                                                    duration: 5000
                                                                                });

                                                                                // Navigate to builder
                                                                                router.visit(`/builder?resume=${resume.id}`);
                                                                            } else {
                                                                                addToast({
                                                                                    type: 'error',
                                                                                    title: 'Error',
                                                                                    message: 'Failed to update resume status. Please try again.',
                                                                                    duration: 5000
                                                                                });
                                                                            }
                                                                        } catch (error) {
                                                                            addToast({
                                                                                type: 'error',
                                                                                title: 'Error',
                                                                                message: 'An error occurred. Please try again.',
                                                                                duration: 5000
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                router.visit(`/builder?resume=${resume.id}`);
                                                            }
                                                        }}
                                                        className={`${
                                                            canDownloadResume(resume.id) 
                                                                ? 'text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100' 
                                                                : 'text-[#354eab] hover:text-[#4a5fc7] bg-blue-50 hover:bg-blue-100'
                                                        } inline-flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-xs`}
                                                        title={canDownloadResume(resume.id) ? 'Edit will require new payment' : 'Edit resume'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span>Edit</span>
                                                    </button>
                                                    
                                                    {/* Download PDF functionality */}
                                                    {canDownloadResume(resume.id) ? (
                                                        <button
                                                            onClick={() => {
                                                                // Download PDF functionality
                                                                window.open(`/resumes/${resume.id}/download`, '_blank');
                                                            }}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 inline-flex items-center space-x1 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-xs"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span>Download</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 bg-gray-50 inline-flex items-center space-x-1 px-2 py-1 rounded-lg font-medium text-xs">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span>Download</span>
                                                        </span>
                                                    )}
                                                    
                                                    {/* Payment actions */}
                                                    {(() => {
                                                        const paymentStatus = getPaymentStatus(resume.id);
                                                        
                                                        // Don't show payment buttons for approved payments only
                                                        if (paymentStatus === 'approved') {
                                                            return null;
                                                        }
                                                        
                                                        // Show appropriate payment button based on status
                                                        if (paymentStatus === 'needs_payment_modified') {
                                                            return (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedResumeId(resume.id);
                                                                        setIsPaymentModalOpen(true);
                                                                    }}
                                                                    className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 inline-flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-xs"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                    <span>Upload Payment</span>
                                                                </button>
                                                            );
                                                        }
                                                        
                                                        if (paymentStatus === 'pending') {
                                                            return (
                                                                <button
                                                                    disabled
                                                                    title="Payment proof is pending review"
                                                                    className="text-yellow-600 bg-yellow-50 inline-flex items-center space-x-1 px-2 py-1 rounded-lg opacity-60 cursor-not-allowed font-medium text-xs"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span>Pending</span>
                                                                </button>
                                                            );
                                                        }
                                                        
                                                        if (paymentStatus === 'rejected') {
                                                            return (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedResumeId(resume.id);
                                                                        setIsPaymentModalOpen(true);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 inline-flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-xs"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                    <span>Re-upload</span>
                                                                </button>
                                                            );
                                                        }
                                                        
                                                        // Show add payment for resumes without payment proof or needing payment
                                                        if (paymentStatus === null || paymentStatus === 'needs_payment' || paymentStatus === 'unpaid') {
                                                            return (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedResumeId(resume.id);
                                                                        setIsPaymentModalOpen(true);
                                                                    }}
                                                                    className="text-[#354eab] hover:text-[#4a5fc7] bg-blue-50 hover:bg-blue-100 inline-flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 font-medium text-xs"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                    <span>Add Payment</span>
                                                                </button>
                                                            );
                                                        }
                                                        
                                                        return null;
                                                    })()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Interview Guide Promotion Section */}
                <div className="bg-gradient-to-r from-[#e3f2fd] to-[#e8f4fd] rounded-2xl border border-[#bcd6f6] overflow-hidden shadow-lg">
                    <div className="flex flex-col lg:flex-row items-center">
                        {/* Content */}
                        <div className="flex-1 p-8">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                                Get Ready to Impress: Your <span className="text-[#354eab]">Interview Guide</span> is Here!
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 text-lg">
                                        Receive a guide created by <span className="font-semibold">top recruiters</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 text-lg">
                                        Learn to make an impressive <span className="font-semibold">self-introduction</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 text-lg">
                                        Master key <span className="font-semibold">interview techniques</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 text-lg">
                                        Gain <span className="font-semibold">the confidence</span> to secure your dream job
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsInterviewModalOpen(true)}
                                className="bg-[#354eab] hover:bg-[#4a5fc7] text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-200 inline-flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span>Get it Now</span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Illustration */}
                        <div className="flex-1 lg:flex-none lg:w-96 p-8">
                            <div className="relative">
                                {/* Mock illustration - replace with actual interview guide illustration */}
                                <div className="bg-white rounded-xl shadow-xl p-8 transform rotate-3">
                                    <div className="space-y-4">
                                        <div className="h-5 bg-[#bcd6f6] rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        <div className="h-10 bg-[#e3f2fd] rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                                <div className="absolute -top-3 -left-3 bg-yellow-300 rounded-xl shadow-xl p-5 transform -rotate-6">
                                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-bold">💡</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-green-300 rounded-xl shadow-xl p-5 transform rotate-12">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-bold">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interview Preparation Modal */}
            <InterviewPrepPopUp 
                isOpen={isInterviewModalOpen} 
                onClose={() => setIsInterviewModalOpen(false)} 
            />

            {/* Resume Review Modal */}
            <ResumeReviewModal 
                isOpen={isResumeReviewModalOpen} 
                onClose={() => setIsResumeReviewModalOpen(false)} 
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedResumeId(undefined);
                    // Refresh dashboard data when payment modal is closed
                    setTimeout(() => refreshDashboardData(), 500);
                }}
                resumeId={selectedResumeId}
                resumeName={selectedResumeId ? resumeList.find(r => r.id === selectedResumeId)?.name : undefined}
                onStatusChange={handlePaymentStatusChange}
            />

            {/* Toast Container */}
            <ToastContainer 
                toasts={toasts} 
                onCloseToast={removeToast} 
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText="Continue Editing"
                cancelText="Cancel"
                type="warning"
            />
        </div>
    );
}

