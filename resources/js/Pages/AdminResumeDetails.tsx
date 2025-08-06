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
    Download,
    Settings
} from 'lucide-react';

interface ResumePaymentProof {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    file_path: string;
    created_at: string;
}

interface ResumeUser {
    id: number;
    name: string;
    email: string;
}

interface Resume {
    id: number;
    name: string;
    status: string;
    is_paid: boolean;
    template_id: number;
    created_at: string;
    updated_at: string;
    user: ResumeUser;
    payment_proofs: ResumePaymentProof[];
}

interface Props {
    resume: Resume;
}

export default function AdminResumeDetails({ resume }: Props) {
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

    const downloadResume = () => {
        window.open(`/admin/resumes/${resume.id}/download`, '_blank');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Head title={`Resume Details - ${resume.name}`} />
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
                            <h1 className="text-3xl font-bold mb-8">Resume Details</h1>

                            {/* Resume Information */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Resume Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Name</p>
                                                    <p className="font-semibold">{resume.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Settings className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Template ID</p>
                                                    <p className="font-semibold">{resume.template_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Status</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">{resume.status}</p>
                                                        {resume.is_paid && (
                                                            <Badge className="bg-green-100 text-green-800">Paid</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Created</p>
                                                    <p className="font-semibold">{formatDate(resume.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Last Updated</p>
                                                    <p className="font-semibold">{formatDate(resume.updated_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

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
                                                    <p className="font-semibold">{resume.user.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-semibold">{resume.user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Link href={`/admin/users/${resume.user.id}`}>
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View User Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Resume Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {resume.is_paid ? (
                                                <span className="text-green-600">Paid</span>
                                            ) : (
                                                <span className="text-red-600">Unpaid</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Payment Proofs</CardTitle>
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{resume.payment_proofs.length}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Actions</CardTitle>
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center space-x-2">
                                            {resume.is_paid && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={downloadResume}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download PDF
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Payment Proofs Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Proofs ({resume.payment_proofs.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {resume.payment_proofs.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No payment proofs found for this resume.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {resume.payment_proofs.map((proof) => (
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