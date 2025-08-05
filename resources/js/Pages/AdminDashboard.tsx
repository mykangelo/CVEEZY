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
    Mail
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
                                        <CardHeader>
                                            <CardTitle>Payment Proof Management</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {paymentList.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-8">No payment proofs found.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {paymentList.map((payment) => (
                                                            <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <h3 className="font-semibold">{payment.user.name}</h3>
                                                                        <p className="text-sm text-gray-600">{payment.user.email}</p>
                                                                        <p className="text-sm text-gray-500">Resume: {payment.resume.name}</p>
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
                                                        ))}
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
                                                {userList.length === 0 ? (
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
                                        <CardHeader>
                                            <CardTitle>Resume Management</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {resumeList.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-8">No resumes found.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {resumeList.map((resume) => (
                                                            <div key={resume.id} className="border rounded-lg p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <FileText className="h-5 w-5 text-gray-400" />
                                                                            <h3 className="font-semibold">{resume.name}</h3>
                                                                            {resume.is_paid && (
                                                                                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                            <div className="flex items-center gap-1">
                                                                                <User className="h-4 w-4" />
                                                                                By: {resume.user.name}
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Mail className="h-4 w-4" />
                                                                                {resume.user.email}
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
        </div>
    );
}
