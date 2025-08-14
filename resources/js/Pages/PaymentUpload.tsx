import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle, Download, Eye } from 'lucide-react';

interface PaymentProof {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    resume: {
        id: number;
        name: string;
        is_paid: boolean;
    };
}

interface Props {
    resumeId?: number;
    resumeName?: string;
    paymentProofs?: PaymentProof[];
}

export default function PaymentUpload({ resumeId, resumeName, paymentProofs = [] }: Props) {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        resume_id: resumeId || '',
        proof: null as File | null,
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('proof', file);
            setUploadMessage('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setUploadMessage('Uploading payment proof...');
        
        post('/upload-payment-proof', {
            onSuccess: () => {
                setUploading(false);
                setSelectedFile(null);
                setData('proof', null);
                setUploadSuccess(true);
                setUploadMessage('✅ Payment proof uploaded successfully! Your payment is now under review by our admin team. You will be notified once it is approved.');
            },
            onError: (errors) => {
                setUploading(false);
                setUploadMessage('❌ Upload failed. Please check your file and try again.');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Under Review
                    </Badge>
                );
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    message: '🎉 Your payment has been approved! You can now download your PDF resume.',
                    type: 'success',
                    icon: <CheckCircle className="h-5 w-5 text-green-600" />
                };
            case 'rejected':
                return {
                    message: '❌ Your payment was rejected. Please upload a new payment proof.',
                    type: 'error',
                    icon: <XCircle className="h-5 w-5 text-red-600" />
                };
            case 'pending':
                return {
                    message: '⏳ Your payment is under review. Our admin team will review it within 24 hours.',
                    type: 'warning',
                    icon: <Clock className="h-5 w-5 text-yellow-600" />
                };
            default:
                return {
                    message: '',
                    type: 'info',
                    icon: <AlertCircle className="h-5 w-5 text-blue-600" />
                };
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

    const canUploadNewProof = () => {
        const latestProof = paymentProofs[0];
        return !latestProof || latestProof.status === 'rejected';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Upload" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold mb-8">Payment Proof Upload</h1>

                            {/* Status Overview */}
                            {paymentProofs.length > 0 && (
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Eye className="h-5 w-5" />
                                            Current Payment Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {paymentProofs.map((proof) => {
                                            const statusInfo = getStatusMessage(proof.status);
                                            return (
                                                <div key={proof.id} className={`p-4 rounded-lg border ${
                                                    statusInfo.type === 'success' ? 'bg-green-50 border-green-200' :
                                                    statusInfo.type === 'error' ? 'bg-red-50 border-red-200' :
                                                    statusInfo.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                                    'bg-blue-50 border-blue-200'
                                                }`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            {statusInfo.icon}
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h3 className="font-semibold">{proof.resume.name}</h3>
                                                                    {getStatusBadge(proof.status)}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {statusInfo.message}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Uploaded: {formatDate(proof.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {proof.status === 'approved' && (
                                                            <Button
                                                                onClick={() => window.open(`/resumes/${proof.resume.id}/download`, '_blank')}
                                                                className="bg-green-500 hover:bg-green-600 text-white"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download PDF
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Upload Section - Only show if no payment or payment was rejected */}
                            {canUploadNewProof() && (
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Upload className="h-5 w-5" />
                                            Upload Payment Proof
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Success Message */}
                                        {uploadSuccess && (
                                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <p className="text-green-700 font-medium">
                                                        Payment proof uploaded successfully!
                                                    </p>
                                                </div>
                                                <p className="text-sm text-green-600 mt-1">
                                                    Your payment is now under review by our admin team. You will be notified once it is approved.
                                                </p>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Resume
                                                </label>
                                                <div className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5 text-gray-500" />
                                                        <span className="font-medium">{resumeName || 'Selected Resume'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Payment Proof File
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                                    <input
                                                        type="file"
                                                        onChange={handleFileSelect}
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        className="hidden"
                                                        id="proof-file"
                                                    />
                                                    <label htmlFor="proof-file" className="cursor-pointer">
                                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, JPEG, PDF up to 2MB
                                                        </p>
                                                    </label>
                                                </div>
                                                {selectedFile && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        Selected: {selectedFile.name}
                                                    </div>
                                                )}
                                                {errors.proof && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.proof}</p>
                                                )}
                                            </div>

                                            {/* Upload Message */}
                                            {uploadMessage && (
                                                <div className={`p-4 rounded-lg ${
                                                    uploadMessage.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                                                    uploadMessage.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                                                    'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {uploadMessage}
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                disabled={!selectedFile || processing || uploading}
                                                className="w-full"
                                            >
                                                {uploading ? 'Uploading...' : 'Upload Payment Proof'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Review Process Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Review Process</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                1
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Upload Payment Proof</h4>
                                                <p className="text-sm text-gray-600">
                                                    Upload a screenshot or receipt of your payment
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                2
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Under Review</h4>
                                                <p className="text-sm text-gray-600">
                                                    Our admin team reviews your payment proof within 24 hours
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                3
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Approved & Download</h4>
                                                <p className="text-sm text-gray-600">
                                                    Once approved, you can download your PDF resume
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 