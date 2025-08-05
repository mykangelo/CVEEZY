import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
    ArrowLeft,
    User,
    Mail,
    Calendar,
    FileText,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Download
} from 'lucide-react';

interface UserResume {
    id: number;
    name: string;
    status: string;
    is_paid: boolean;
    created_at: string;
    updated_at: string;
}

interface UserPaymentProof {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    file_path: string;
    created_at: string;
    resume: {
        id: number;
        name: string;
    } | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    is_admin: boolean;
    resumes: UserResume[];
    payment_proofs: UserPaymentProof[];
}

interface Props {
    user: User;
}

export default function AdminUserDetails({ user }: Props) {
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

    const viewPaymentProof = (filePath: string) => {
        window.open(`/storage/${filePath}`, '_blank');
    };

    const downloadPaymentProof = (filePath: string) => {
        window.open(`/storage/${filePath}`, '_blank');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Head title={`User Details - ${user.name}`} />
            <Header showDropdown={true} />
            
            <main className="flex-grow bg-white py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href="/admin/dashboard">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold mb-8">User Details</h1>

                            {/* User Information */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        User Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Name</p>
                                                    <p className="font-semibold">{user.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-semibold">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Joined</p>
                                                    <p className="font-semibold">{formatDate(user.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Role</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">
                                                            {user.is_admin ? 'Administrator' : 'User'}
                                                        </p>
                                                        {user.is_admin && (
                                                            <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{user.resumes.length}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Payment Proofs</CardTitle>
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{user.payment_proofs.length}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Paid Resumes</CardTitle>
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {user.resumes.filter(r => r.is_paid).length}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Resumes Section */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        User Resumes ({user.resumes.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.resumes.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No resumes found for this user.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {user.resumes.map((resume) => (
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
                                                                    <Calendar className="h-4 w-4" />
                                                                    Created: {formatDate(resume.created_at)}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Updated: {formatDate(resume.updated_at)}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">Status: {resume.status}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Link href={`/admin/resumes/${resume.id}`}>
                                                                <Button size="sm" variant="outline">
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            {resume.is_paid && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={() => window.open(`/admin/resumes/${resume.id}/download`, '_blank')}
                                                                >
                                                                    <Download className="h-4 w-4 mr-1" />
                                                                    Download
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payment Proofs Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Proofs ({user.payment_proofs.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.payment_proofs.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No payment proofs found for this user.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {user.payment_proofs.map((proof) => (
                                                <div key={proof.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <CreditCard className="h-5 w-5 text-gray-400" />
                                                                <h3 className="font-semibold">Payment Proof #{proof.id}</h3>
                                                                {getStatusBadge(proof.status)}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Submitted: {formatDate(proof.created_at)}
                                                                </div>
                                                                {proof.resume && (
                                                                    <div className="flex items-center gap-1">
                                                                        <FileText className="h-4 w-4" />
                                                                        Resume: {proof.resume.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {proof.file_path && (
                                                                <>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="outline"
                                                                        onClick={() => viewPaymentProof(proof.file_path)}
                                                                    >
                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                        View
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="outline"
                                                                        onClick={() => downloadPaymentProof(proof.file_path)}
                                                                    >
                                                                        <Download className="h-4 w-4 mr-1" />
                                                                        Download
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
} 