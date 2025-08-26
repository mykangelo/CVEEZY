import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PaymentModal from '@/Components/PaymentModal';
import { Resume } from "@/types/resume";
import Logo from "@/Components/Logo";
import Dropdown from "@/Components/Dropdown";
import InterviewPrepPopUp from "@/Components/InterviewPrepPopUp"; // Fixed import path
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

            {/* Custom Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left: Logo */}
                        <div className="flex items-center">
                            <Link href={route('home')} aria-label="Go to homepage" className="inline-flex items-center">
                                <Logo 
                                    size="sm"
                                    showText={false}
                                    className="text-2xl font-bold text-[#222] font-sans hover:scale-105 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-[#354eab] rounded transition"
                                />
                            </Link>
                        </div>

                        {/* Center: Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link 
                                href="/dashboard" 
                                className="text-gray-700 hover:text-[#354eab] font-medium text-base transition-colors"
                            >
                                Resume Review
                            </Link>
                            {/* Updated Interview Preparation button to trigger modal */}
                            <button 
                                onClick={() => setIsInterviewModalOpen(true)}
                                className="text-gray-700 hover:text-[#354eab] font-medium text-base transition-colors"
                            >
                                Interview Preparation
                            </button>
                        </nav>

                        {/* Right: Message Icon + User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* Message Icon */}
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium leading-4 text-gray-700 transition-all duration-200 ease-in-out hover:border-[#354eab] hover:bg-[#f8faff] hover:text-[#354eab] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-offset-2"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-7 h-7 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold truncate max-w-[220px]">{user?.name || user?.email || 'User'}</span>
                                                </div>
                                                <svg
                                                    className="ml-3 h-4 w-4 text-gray-500 transition-transform duration-200 group-hover:text-[#354eab]"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content contentClasses="py-2 bg-white">
                                        <Dropdown.Link href="/profile" className="px-4 py-2">
                                            Profile Settings
                                        </Dropdown.Link>
                                        <div className="mx-4 my-2 h-px bg-gray-200"></div>
                                        <Dropdown.Link href="/logout" method="post" as="button" className="px-4 py-2">
                                            Log out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Welcome Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {user?.name || 'User'}!
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Ready to build your next great resume?
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Create New Resume Button */}
                <div className="mb-6">
                    {canCreateNewResume() ? (
                        <button
                            onClick={() => router.visit('/choose-template')}
                            className="bg-[#354eab] hover:bg-[#4a5fc7] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create a New Resume
                        </button>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-yellow-800 font-semibold">Payment Under Review</span>
                            </div>
                            <p className="text-yellow-700 text-sm">
                                You have resumes with pending payment reviews. Please wait for admin approval before creating new resumes.
                            </p>
                        </div>
                    )}
                </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* My Recent Resumes Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                                            <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">My Recent Resumes</h2>
                        <button
                            onClick={refreshDashboardData}
                            disabled={isRefreshing}
                            className="text-[#354eab] hover:text-[#4a5fc7] text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    </div>

                    {resumeList.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first professional resume.</p>
                            <Link
                                href="/choose-template"
                                className="inline-flex items-center px-4 py-2 bg-[#354eab] hover:bg-[#4a5fc7] text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                Create Your First Resume
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Creation Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {resumeList.map((resume) => (
                                        <tr key={resume.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
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
                                                        <div className="text-sm text-gray-500">
                                                            {resume.template_name ? resume.template_name.charAt(0).toUpperCase() + resume.template_name.slice(1) : 'Classic'} Template
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {resume.creation_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPaymentStatusBadge(resume.id)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {/* Edit functionality - users can edit all resumes, with warning for paid ones */}
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
                                                            ? 'text-amber-600 hover:text-amber-900' 
                                                            : 'text-[#354eab] hover:text-[#4a5fc7]'
                                                    } inline-flex items-center space-x-1 transition-colors duration-200`}
                                                    title={canDownloadResume(resume.id) ? 'Edit will require new payment' : 'Edit resume'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span>
                                                        Edit
                                                    </span>
                                                </button>
                                                
                                                {/* Download PDF functionality */}
                                                {canDownloadResume(resume.id) ? (
                                                    <button
                                                        onClick={() => {
                                                            // Download PDF functionality
                                                            window.open(`/resumes/${resume.id}/download`, '_blank');
                                                        }}
                                                        className="text-green-600 hover:text-green-900 inline-flex items-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span>Download PDF</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 inline-flex items-center space-x-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span>Download PDF</span>
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
                                                                className="text-orange-600 hover:text-orange-900 inline-flex items-center space-x-1"
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
                                                                className="text-yellow-600 hover:text-yellow-900 inline-flex items-center space-x-1 opacity-60 cursor-not-allowed"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span>Payment Pending</span>
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
                                                                className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                </svg>
                                                                <span>Re-upload Payment</span>
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
                                                                className="text-[#354eab] hover:text-[#4a5fc7] inline-flex items-center space-x-1"
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Interview Guide Promotion Section */}
                <div className="bg-gradient-to-r from-[#e3f2fd] to-[#e8f4fd] rounded-xl border border-[#bcd6f6] overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-center">
                        {/* Content */}
                        <div className="flex-1 p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Get Ready to Impress: Your <span className="text-[#354eab]">Interview Guide</span> is Here!
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Receive a guide created by <span className="font-semibold">top recruiters</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Learn to make an impressive <span className="font-semibold">self-introduction</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Master key <span className="font-semibold">interview techniques</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Gain <span className="font-semibold">the confidence</span> to secure your dream job
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsInterviewModalOpen(true)}
                                className="bg-[#354eab] hover:bg-[#4a5fc7] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center space-x-2"
                            >
                                <span>Get it Now</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Illustration */}
                        <div className="flex-1 lg:flex-none lg:w-80 p-8">
                            <div className="relative">
                                {/* Mock illustration - replace with actual interview guide illustration */}
                                <div className="bg-white rounded-lg shadow-lg p-6 transform rotate-3">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-[#bcd6f6] rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                        <div className="h-8 bg-[#e3f2fd] rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                                <div className="absolute -top-2 -left-2 bg-yellow-300 rounded-lg shadow-lg p-4 transform -rotate-6">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold">💡</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-300 rounded-lg shadow-lg p-4 transform rotate-12">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold">✓</span>
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