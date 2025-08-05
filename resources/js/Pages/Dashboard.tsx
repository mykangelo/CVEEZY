import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Resume } from "@/types/resume";
import Logo from "@/Components/Logo";
import Dropdown from "@/Components/Dropdown";
import InterviewPrepPopUp from "@/Components/InterviewPrepPopUp"; // Fixed import path
import PaymentModal from "@/Components/PaymentModal";

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

export default function Dashboard({ resumes = [], paymentProofs = [], error, success }: DashboardProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    // Add modal state
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedResumeForPayment, setSelectedResumeForPayment] = useState<Resume | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Check for error/success messages from props
    useEffect(() => {
        if (error) {
            setNotification({
                type: 'error',
                message: error
            });
        } else if (success) {
            setNotification({
                type: 'success',
                message: success
            });
        }
    }, [error, success]);

    // Use real resumes from props, or create a default one if none exist
    const [resumeList, setResumeList] = useState<Resume[]>(resumes);

    // Update resume list when props change
    useEffect(() => {
        setResumeList(resumes);
    }, [resumes]);

    // Check if user has unpaid resumes
    const hasUnpaidResumes = () => {
        // If no resumes, allow creation
        if (resumeList.length === 0) {
            return false;
        }
        
        // Check if all resumes have approved payment status
        const allPaid = resumeList.every(resume => {
            const paymentStatus = getPaymentStatus(resume.id);
            return paymentStatus === 'approved';
        });
        
        return !allPaid; // Return true if NOT all are paid (i.e., has unpaid resumes)
    };

    // Check if user can create new resume
    const canCreateNewResume = () => {
        return !hasUnpaidResumes();
    };


    // Poll for payment status updates
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/user/payment-proofs');
                if (response.ok) {
                    const updatedPaymentProofs = await response.json();
                    // Update payment proofs state if needed
                    // This will trigger a re-render with updated status
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const handlePaymentStatusChange = (status: 'pending' | 'approved' | 'rejected') => {
        if (status === 'approved') {
            setNotification({
                type: 'success',
                message: '🎉 Your payment has been approved! You can now download your PDF resume.'
            });
        } else if (status === 'rejected') {
            setNotification({
                type: 'error',
                message: '❌ Your payment was rejected. Please upload a new payment proof.'
            });
        }
        
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
    };







    // Function to get payment status for a resume
    const getPaymentStatus = (resumeId: number) => {
        const paymentProof = paymentProofs.find(proof => {
            return proof.resume_id === resumeId;
        });
        
        const status = paymentProof ? paymentProof.status : null;
        return status;
    };

    // Function to check if resume can be downloaded
    const canDownloadResume = (resumeId: number) => {
        const paymentStatus = getPaymentStatus(resumeId);
        return paymentStatus === 'approved';
    };



    const getPaymentStatusBadge = (resumeId: number) => {
        const status = getPaymentStatus(resumeId);
        if (!status) {
            return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No Payment
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
                    Under Review
                </span>;
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
        <div className="min-h-screen bg-gray-50">
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
                            <span className="font-medium">{notification.message}</span>
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
                            <Logo 
                                size="sm"
                                text="CVeezy"
                                imageSrc="/images/supsoft-logo.jpg"
                                imageAlt="CVeezy Logo"
                                className="text-2xl font-bold text-[#222] font-sans hover:scale-110 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
                            />
                        </div>

                        {/* Center: Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link 
                                href="/dashboard" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Resume Review
                            </Link>
                            {/* Updated Interview Preparation button to trigger modal */}
                            <button 
                                onClick={() => setIsInterviewModalOpen(true)}
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
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
                                        <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                                            <span className="font-medium">{user?.email || 'USER@EXAMPLE.COM'}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content>
                                        <Dropdown.Link href="/profile">
                                            My Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link 
                                            href="/logout" 
                                            method="post" 
                                            as="button"
                                        >
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
                            {canCreateNewResume() ? (
                                <Link
                                    href="/choose-template"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Create a New Resume</span>
                                </Link>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button
                                        disabled
                                        className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Create a New Resume</span>
                                    </button>
                                    <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                                        ⚠️ Please complete payment for existing resumes first
                                    </div>
                                </div>
                            )}
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
                                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
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
                                                            {resume.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Template {resume.template_id || 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {resume.creation_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    resume.status === 'completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : resume.status === 'draft'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPaymentStatusBadge(resume.id)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {getPaymentStatus(resume.id) !== 'approved' ? (
                                                    <Link
                                                        href={`/builder?resume=${resume.id}`}
                                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span>Edit</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 inline-flex items-center space-x-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span>Edit</span>
                                                    </span>
                                                )}
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
                                                {getPaymentStatus(resume.id) !== 'approved' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedResumeForPayment(resume);
                                                            setIsPaymentModalOpen(true);
                                                        }}
                                                        className="text-purple-600 hover:text-purple-900 inline-flex items-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <span>Upload Payment</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Interview Guide Promotion Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-center">
                        {/* Content */}
                        <div className="flex-1 p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Get Ready to Impress: Your <span className="text-blue-600">Interview Guide</span> is Here!
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
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center space-x-2"
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
                                        <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                        <div className="h-8 bg-blue-100 rounded"></div>
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
                    setSelectedResumeForPayment(null);
                }}
                resumeId={selectedResumeForPayment?.id}
                resumeName={selectedResumeForPayment?.name}
                onStatusChange={handlePaymentStatusChange}
            />
        </div>
    );
}