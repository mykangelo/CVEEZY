import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
    Users, 
    FileText, 
    CreditCard, 
    CheckCircle, 
    XCircle, 
    Clock,
    Download,
    Eye,
    Trash2,
    ExternalLink,
    ArrowLeft,
    User,
    Calendar,
    Mail,
    AlertTriangle,
    Filter,
    ChevronDown
} from 'lucide-react';

interface PaymentProof {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    resume: {
        id: number;
        name: string;
        is_paid: boolean;
    };
    file_path: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    resumes_count: number;
    is_admin: boolean;
}

interface Resume {
    id: number;
    name: string;
    user: {
        name: string;
        email: string;
    };
    status: string;
    is_paid: boolean;
    created_at: string;
}

interface DashboardStats {
    total_users: number;
    total_resumes: number;
    total_payments: number;
    pending_payments: number;
    approved_payments: number;
    rejected_payments: number;
}

interface Props {
    stats: DashboardStats;
    users: User[];
    resumes: Resume[];
    paymentProofs: PaymentProof[];
}

export default function AdminDashboard({ stats, users, resumes, paymentProofs }: Props) {
    const [loading, setLoading] = useState(false);
    const [viewingProof, setViewingProof] = useState<PaymentProof | null>(null);
    const [paymentList, setPaymentList] = useState<PaymentProof[]>(paymentProofs);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null);
    const [resumeList, setResumeList] = useState<Resume[]>(resumes);
    const [userList, setUserList] = useState<User[]>(users);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>(stats);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('1_hour');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['draft']);
    const [storagePathModal, setStoragePathModal] = useState({
        isOpen: false,
        data: null as any
    });

    // Update payment list when props change
    useEffect(() => {
        setPaymentList(paymentProofs);
    }, [paymentProofs]);

    // Update resume list when props change
    useEffect(() => {
        setResumeList(resumes);
    }, [resumes]);

    // Update user list when props change
    useEffect(() => {
        setUserList(users);
    }, [users]);

    // Update stats when props change
    useEffect(() => {
        setDashboardStats(stats);
    }, [stats]);

    // Poll for admin dashboard updates
    useEffect(() => {
        const pollAdminData = async () => {
            try {
                setIsRefreshing(true);
                const response = await fetch('/admin/dashboard-data');
                if (response.ok) {
                    const data = await response.json();
                    // Update all dashboard data
                    setPaymentList(data.paymentProofs);
                    setResumeList(data.resumes);
                    setUserList(data.users);
                    setDashboardStats(data.stats);
                }
            } catch (error) {
                console.error('Error polling admin data:', error);
            } finally {
                setIsRefreshing(false);
            }
        };

        // Poll every 30 seconds for updates
        const interval = setInterval(pollAdminData, 30000);

        return () => clearInterval(interval);
    }, []);

    const handlePaymentAction = async (paymentId: number, action: 'approve' | 'reject') => {
        setLoading(true);
        setNotification(null);
        
        try {
            console.log(`Attempting to ${action} payment ${paymentId}`);
            
            // Get CSRF token from multiple sources
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                // Fallback to getting from cookie
                csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
                if (csrfToken) {
                    csrfToken = decodeURIComponent(csrfToken);
                }
            }
            
            console.log('CSRF Token:', csrfToken);
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page and try again.');
            }
            
            const response = await fetch(`/admin/payment/${paymentId}/${action}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (response.status === 419) {
                // CSRF token mismatch - refresh the page
                console.error('CSRF token mismatch. Refreshing page...');
                setNotification({
                    type: 'error',
                    message: 'Session expired. Please refresh the page and try again.'
                });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }

            if (response.ok) {
                const result = await response.json();
                console.log(`${action} successful:`, result);
                
                // Update local state
                setPaymentList(prev => 
                    prev.map(payment => 
                        payment.id === paymentId 
                            ? { ...payment, status: action === 'approve' ? 'approved' : 'rejected' }
                            : payment
                    )
                );
                
                // Update stats to reflect the status change
                setDashboardStats(prev => {
                    const newStats = { ...prev };
                    if (action === 'approve') {
                        newStats.pending_payments = Math.max(0, prev.pending_payments - 1);
                        newStats.approved_payments = prev.approved_payments + 1;
                    } else {
                        newStats.pending_payments = Math.max(0, prev.pending_payments - 1);
                        newStats.rejected_payments = prev.rejected_payments + 1;
                    }
                    return newStats;
                });
                
                setNotification({
                    type: 'success',
                    message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
                });
            } else {
                const errorData = await response.json();
                console.error(`${action} failed:`, errorData);
                setNotification({
                    type: 'error',
                    message: errorData.message || `Failed to ${action} payment. Please try again.`
                });
            }
        } catch (error) {
            console.error(`Error ${action}ing payment:`, error);
            setNotification({
                type: 'error',
                message: error instanceof Error ? error.message : `Error ${action}ing payment. Please try again.`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResume = async (resumeId: number) => {
        if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            return;
        }

        setDeletingResumeId(resumeId);
        setNotification(null);
        
        try {
            // Get CSRF token
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
                if (csrfToken) {
                    csrfToken = decodeURIComponent(csrfToken);
                }
            }
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page and try again.');
            }
            
            const response = await fetch(`/admin/resumes/${resumeId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 419) {
                setNotification({
                    type: 'error',
                    message: 'Session expired. Please refresh the page and try again.'
                });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }

            if (response.ok) {
                const result = await response.json();
                console.log('Resume deleted successfully:', result);
                
                // Remove from local state
                setResumeList(prev => prev.filter(resume => resume.id !== resumeId));
                
                // Update stats to reflect the deletion
                setDashboardStats(prev => ({
                    ...prev,
                    total_resumes: prev.total_resumes - 1
                }));
                
                setNotification({
                    type: 'success',
                    message: 'Resume deleted successfully.'
                });
            } else {
                const errorData = await response.json();
                console.error('Delete failed:', errorData);
                setNotification({
                    type: 'error',
                    message: errorData.message || 'Failed to delete resume. Please try again.'
                });
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            setNotification({
                type: 'error',
                message: error instanceof Error ? error.message : 'Error deleting resume. Please try again.'
            });
        } finally {
            setDeletingResumeId(null);
        }
    };

    const handleBulkDeleteUnfinishedResumes = async () => {
        // Validation: ensure at least one status is selected
        if (selectedStatuses.length === 0) {
            setNotification({
                type: 'error',
                message: 'Please select at least one resume status to delete.'
            });
            return;
        }
        
        setBulkDeleting(true);
        setNotification(null);
        setShowTimeFilterModal(false);
        
        const timeLabels = {
            '7_days': '7 days',
            '14_days': '14 days',
            '30_days': '30 days',
            '60_days': '60 days',
            '90_days': '90 days',
            '6_months': '6 months',
            '1_year': '1 year',
            'all': 'any age'
        };
        
        try {
            // Get CSRF token
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                // Try to get it from the page props or make a request to get it
                const metaResponse = await fetch('/');
                const metaText = await metaResponse.text();
                const csrfMatch = metaText.match(/<meta name="csrf-token" content="([^"]+)"/);
                csrfToken = csrfMatch ? csrfMatch[1] : '';
            }

            const response = await fetch('/admin/resumes/bulk-delete/unfinished', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    time_filter: selectedTimeFilter,
                    statuses: selectedStatuses
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setNotification({
                    type: 'error',
                    message: errorData.message || 'Failed to delete resumes. Please try again.'
                });
                return;
            }

            const result = await response.json();
            
            if (result.success) {
                // Log debug info to console for troubleshooting
                console.log('Bulk delete result:', result);
                
                let message = result.message || `Successfully deleted ${result.deleted_count} unfinished resumes.`;
                
                setNotification({
                    type: 'success',
                    message: message
                });
                
                // Refresh the page to show updated counts
                setTimeout(() => {
                    router.visit('/admin/dashboard', { preserveState: false });
                }, 2500); // Longer delay to read debug info
            } else {
                setNotification({
                    type: 'error',
                    message: result.message || 'Failed to delete resumes.'
                });
            }
        } catch (error) {
            console.error('Error bulk deleting resumes:', error);
            setNotification({
                type: 'error',
                message: error instanceof Error ? error.message : 'Error deleting resumes. Please try again.'
            });
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleOpenStorageFolder = async () => {
        try {
            const response = await fetch('/admin/open-storage-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setNotification({ 
                    type: 'success', 
                    message: `Folder opened successfully! Path: ${data.path}` 
                });
            } else {
                setNotification({ 
                    type: 'error', 
                    message: data.error || 'Failed to open storage folder' 
                });
            }
        } catch (error) {
            console.error('Error opening storage folder:', error);
            setNotification({ 
                type: 'error', 
                message: 'An error occurred while trying to open the storage folder' 
            });
        }
    };

    const handleShowStoragePath = async () => {
        try {
            const response = await fetch('/admin/payment-storage-path');
            const data = await response.json();
            
            if (response.ok) {
                setStoragePathModal({
                    isOpen: true,
                    data: data
                });
            } else {
                setNotification({ 
                    type: 'error', 
                    message: data.error || 'Failed to get storage path information' 
                });
            }
        } catch (error) {
            console.error('Error getting storage path:', error);
            setNotification({ 
                type: 'error', 
                message: 'An error occurred while fetching storage path information' 
            });
        }
    };

    const openTimeFilterModal = () => {
        setShowTimeFilterModal(true);
    };

    const viewPaymentProof = (payment: PaymentProof) => {
        // Open payment proof file in new tab
        const fileUrl = `/storage/${payment.file_path}`;
        window.open(fileUrl, '_blank');
    };

    const viewUserDetails = (userId: number) => {
        router.visit(`/admin/users/${userId}`);
    };

    const viewResumeDetails = (resumeId: number) => {
        router.visit(`/admin/resumes/${resumeId}`);
    };

    const downloadResume = (resumeId: number) => {
        // Open download link in new tab
        window.open(`/admin/resumes/${resumeId}/download`, '_blank');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Head title="Admin Dashboard" />
            <Header showDropdown={true} />
            
            <main className="flex-grow bg-white py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Notification */}
                    {notification && (
                        <div className={`mb-4 p-4 rounded-lg ${
                            notification.type === 'success' 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {notification.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <XCircle className="w-5 h-5" />
                                    )}
                                    <span className="font-medium">{notification.message}</span>
                                </div>
                                <button 
                                    onClick={() => setNotification(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                                {isRefreshing && (
                                    <div className="flex items-center text-blue-600 text-sm">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Refreshing...
                                    </div>
                                )}
                            </div>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{dashboardStats.total_users}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{dashboardStats.total_resumes}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-yellow-600">{dashboardStats.pending_payments}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{dashboardStats.total_payments}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="payments" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="payments">Payment Proofs</TabsTrigger>
                                    <TabsTrigger value="users">Users</TabsTrigger>
                                    <TabsTrigger value="resumes">Resumes</TabsTrigger>
                                </TabsList>

                                <TabsContent value="payments" className="space-y-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle>Payment Proof Management</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleOpenStorageFolder}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                                    title="Open storage folder in file explorer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M10 6V5a2 2 0 112 0v1M10 6h4M14 10l2-2m0 0l2-2m-2 2v8" />
                                                    </svg>
                                                    Open Folder
                                                </button>
                                                <button
                                                    onClick={handleShowStoragePath}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                                    title="Show storage location info"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Info
                                                </button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {!paymentList || paymentList.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-8">No payment proofs found.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {paymentList.map((payment) => payment ? (
                                                            <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <h3 className="font-semibold">{payment.user?.name || 'Unknown User'}</h3>
                                                                        <p className="text-sm text-gray-600">{payment.user?.email || 'No email'}</p>
                                                                        <p className="text-sm text-gray-500">Resume: {payment.resume?.name || 'Unknown Resume'}</p>
                                                                        <p className="text-sm text-gray-500">Submitted: {formatDate(payment.created_at)}</p>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        {getStatusBadge(payment.status)}
                                                                        {payment.status === 'pending' && (
                                                                            <div className="flex space-x-2">
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => handlePaymentAction(payment.id, 'approve')}
                                                                                    className="bg-green-600 hover:bg-green-700"
                                                                                    disabled={loading}
                                                                                >
                                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                                    Approve
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    onClick={() => handlePaymentAction(payment.id, 'reject')}
                                                                                    disabled={loading}
                                                                                >
                                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                                    Reject
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {payment.file_path && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            onClick={() => viewPaymentProof(payment)}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            View Proof
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            onClick={() => window.open(`/storage/${payment.file_path}`, '_blank')}
                                                                        >
                                                                            <Download className="h-4 w-4 mr-1" />
                                                                            Download
                                                                        </Button>
                                                                        <span className="text-xs text-gray-500">
                                                                            {payment.file_path.split('/').pop()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : null)}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="users" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>User Management</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {!userList || userList.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-8">No users found.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {userList.map((user) => (
                                                            <div key={user.id} className="border rounded-lg p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <User className="h-5 w-5 text-gray-400" />
                                                                            <h3 className="font-semibold">{user.name}</h3>
                                                                            {user.is_admin && (
                                                                                <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                            <div className="flex items-center gap-1">
                                                                                <Mail className="h-4 w-4" />
                                                                                {user.email}
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Calendar className="h-4 w-4" />
                                                                                Joined: {formatDate(user.created_at)}
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <FileText className="h-4 w-4" />
                                                                                Resumes: {user.resumes_count}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            onClick={() => viewUserDetails(user.id)}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            View Details
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="resumes" className="space-y-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                            <CardTitle>Resume Management</CardTitle>
                                            <Button 
                                                variant="destructive"
                                                size="sm"
                                                onClick={openTimeFilterModal}
                                                disabled={bulkDeleting}
                                                className="flex items-center gap-2"
                                            >
                                                {bulkDeleting ? (
                                                    <>
                                                        <div className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Cleaning up...
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Filter className="h-4 w-4" />
                                                        Clean Up Unfinished
                                                    </>
                                                )}
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {!resumeList || resumeList.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-8">No resumes found.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {resumeList.map((resume) => (
                                                            <div key={resume.id} className="border rounded-lg p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <FileText className="h-5 w-5 text-gray-400" />
                                                                            <h3 className="font-semibold">{resume.name || 'Untitled Resume'}</h3>
                                                                            {resume.is_paid && (
                                                                                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                            <div className="flex items-center gap-1">
                                                                                <User className="h-4 w-4" />
                                                                                By: {resume.user?.name || 'Unknown User'}
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Mail className="h-4 w-4" />
                                                                                {resume.user?.email || 'No email'}
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Calendar className="h-4 w-4" />
                                                                                Created: {formatDate(resume.created_at)}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm text-gray-500 mt-1">Status: {resume.status}</p>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            onClick={() => viewResumeDetails(resume.id)}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-1" />
                                                                            View
                                                                        </Button>
                                                                        {resume.is_paid && (
                                                                            <Button 
                                                                                size="sm" 
                                                                                variant="outline"
                                                                                onClick={() => downloadResume(resume.id)}
                                                                            >
                                                                                <Download className="h-4 w-4 mr-1" />
                                                                                Download PDF
                                                                            </Button>
                                                                        )}
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="destructive"
                                                                            onClick={() => handleDeleteResume(resume.id)}
                                                                            disabled={deletingResumeId === resume.id}
                                                                        >
                                                                            {deletingResumeId === resume.id ? (
                                                                                <div className="flex items-center">
                                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                    </svg>
                                                                                    Deleting...
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                                                    Delete
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />

            {/* Time Filter Modal */}
            {showTimeFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Clean Up Settings</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowTimeFilterModal(false)}
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* Time Filter Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delete resumes older than:
                                </label>
                                <select
                                    value={selectedTimeFilter}
                                    onChange={(e) => setSelectedTimeFilter(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="1_minute">1 minute (testing)</option>
                                    <option value="1_hour">1 hour (testing)</option>
                                    <option value="1_day">1 day (testing)</option>
                                    <option value="7_days">7 days (newest)</option>
                                    <option value="14_days">14 days (recent)</option>
                                    <option value="30_days">30 days (default)</option>
                                    <option value="60_days">60 days</option>
                                    <option value="90_days">90 days (old)</option>
                                    <option value="6_months">6 months (very old)</option>
                                    <option value="1_year">1 year (ancient)</option>
                                    <option value="all">Any age (all time)</option>
                                </select>
                            </div>

                            {/* Status Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resume statuses to delete:
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'draft', label: 'Draft', description: 'Barely started resumes' },
                                        { value: 'in_progress', label: 'In Progress', description: 'Partially completed resumes' },
                                        { value: 'completed', label: 'Completed', description: 'Finished but not published' },
                                        { value: 'published', label: 'Published', description: 'Live and accessible resumes' }
                                    ].map((status) => (
                                        <label key={status.value} className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.includes(status.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStatuses([...selectedStatuses, status.value]);
                                                    } else {
                                                        setSelectedStatuses(selectedStatuses.filter(s => s !== status.value));
                                                    }
                                                }}
                                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{status.label}</div>
                                                <div className="text-xs text-gray-500">{status.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Preview/Warning */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <div className="flex">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-yellow-800 font-medium">This will delete:</p>
                                        <ul className="text-yellow-700 mt-1 list-disc list-inside">
                                            <li>Resumes with status: {selectedStatuses.length === 0 ? 'None selected' : selectedStatuses.join(', ')}</li>
                                            <li>Older than {selectedTimeFilter === '1_minute' ? '1 minute' :
                                                selectedTimeFilter === '1_hour' ? '1 hour' :
                                                selectedTimeFilter === '1_day' ? '1 day' :
                                                selectedTimeFilter === '7_days' ? '7 days' : 
                                                selectedTimeFilter === '14_days' ? '14 days' :
                                                selectedTimeFilter === '30_days' ? '30 days' :
                                                selectedTimeFilter === '60_days' ? '60 days' :
                                                selectedTimeFilter === '90_days' ? '90 days' :
                                                selectedTimeFilter === '6_months' ? '6 months' :
                                                selectedTimeFilter === '1_year' ? '1 year' : 'any age'}</li>
                                        </ul>
                                        <p className="text-yellow-800 font-medium mt-2">This action cannot be undone!</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowTimeFilterModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleBulkDeleteUnfinishedResumes}
                                disabled={bulkDeleting || selectedStatuses.length === 0}
                                className="flex items-center gap-2"
                            >
                                {bulkDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete Resumes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Storage Path Modal */}
            {storagePathModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Payment Proof Storage Location</h3>
                            <button
                                onClick={() => setStoragePathModal({ isOpen: false, data: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {storagePathModal.data && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Storage Information</h4>
                                    <div className="grid grid-cols-1 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Full Path:</span>
                                            <div className="mt-1 p-2 bg-gray-100 rounded border font-mono text-xs break-all">
                                                {storagePathModal.data.storage_path}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className="font-medium text-gray-600">Relative Path:</span>
                                            <div className="mt-1 p-2 bg-gray-100 rounded border font-mono text-xs">
                                                {storagePathModal.data.relative_path}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="font-medium text-gray-600">Directory Status:</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {storagePathModal.data.exists ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Exists
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Not Found
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <span className="font-medium text-gray-600">Write Access:</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {storagePathModal.data.writable ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Writable
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Read Only
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className="font-medium text-gray-600">Files Count:</span>
                                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                {storagePathModal.data.file_count} files
                                            </span>
                                        </div>
                                        
                                        <div>
                                            <span className="font-medium text-gray-600">Storage Disk:</span>
                                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                                                {storagePathModal.data.disk}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Access Information</h4>
                                    <p className="text-sm text-blue-700 mb-2">
                                        Payment proof files are accessible via web at:
                                    </p>
                                    <div className="p-2 bg-blue-100 rounded border font-mono text-xs break-all text-blue-800">
                                        {storagePathModal.data.url_prefix}[filename]
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setStoragePathModal({ isOpen: false, data: null })}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
