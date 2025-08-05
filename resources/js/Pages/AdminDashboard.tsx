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

    // Update payment list when props change
    useEffect(() => {
        setPaymentList(paymentProofs);
    }, [paymentProofs]);

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
                
                setNotification({
                    type: 'success',
                    message: `Payment ${action}d successfully.`
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
                            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total_users}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total_resumes}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-yellow-600">{stats.pending_payments}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total_payments}</div>
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
                                                {users.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-8">No users found.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {users.map((user) => (
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
                                                {resumes.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-8">No resumes found.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {resumes.map((resume) => (
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
