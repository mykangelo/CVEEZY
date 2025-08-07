import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

interface PaymentProof {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  resume_id: number;
}

interface PaymentProps {
  resumeId?: number;
  resumeName?: string;
  paymentProofs?: PaymentProof[];
}

const Payment: React.FC<PaymentProps> = ({ resumeId: propResumeId, resumeName: propResumeName, paymentProofs = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  
  // Get URL parameters for resume data
  const [resumeId, setResumeId] = useState<number | undefined>(propResumeId);
  const [resumeName, setResumeName] = useState<string | undefined>(propResumeName);

  useEffect(() => {
    // Parse URL parameters if not provided as props
    if (!resumeId || !resumeName) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlResumeId = urlParams.get('resumeId') || urlParams.get('resume');
      const urlResumeName = urlParams.get('resumeName');
      
      if (urlResumeId) {
        const parsedId = parseInt(urlResumeId);
        setResumeId(parsedId);
      }
      if (urlResumeName) {
        const decodedName = decodeURIComponent(urlResumeName);
        setResumeName(decodedName);
      }
    }
  }, [propResumeId, propResumeName]);

  // Check current payment status
  useEffect(() => {
    if (resumeId && paymentProofs.length > 0) {
      const currentProof = paymentProofs.find(proof => proof.resume_id === resumeId);
      if (currentProof) {
        setCurrentPaymentStatus(currentProof.status);
      }
    }
  }, [resumeId, paymentProofs]);

  // Poll for status changes when payment is pending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentPaymentStatus === 'pending') {
      interval = setInterval(async () => {
        try {
          const response = await fetch('/user/payment-proofs');
          if (response.ok) {
            const updatedPaymentProofs = await response.json();
            const currentProof = updatedPaymentProofs.find((proof: any) => proof.resume_id === resumeId);
            if (currentProof && currentProof.status !== 'pending') {
              setCurrentPaymentStatus(currentProof.status);
              if (currentProof.status === 'approved') {
                setUploadMessage('🎉 Your payment has been approved! You can now download your PDF resume.');
                setUploadStatus('success');
              } else if (currentProof.status === 'rejected') {
                setUploadMessage('❌ Your payment was rejected. Please upload a new payment proof.');
                setUploadStatus('error');
              }
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentPaymentStatus, resumeId]);

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          message: '🎉 Your payment has been approved! You can now download your PDF resume.',
          type: 'success',
          icon: '✅',
          color: 'green'
        };
      case 'rejected':
        return {
          message: '❌ Your payment was rejected. Please upload a new payment proof.',
          type: 'error',
          icon: '❌',
          color: 'red'
        };
      case 'pending':
        return {
          message: '⏳ Your payment is under review. Our admin team will review it within 24 hours.',
          type: 'warning',
          icon: '⏳',
          color: 'yellow'
        };
      default:
        return {
          message: '',
          type: 'info',
          icon: 'ℹ️',
          color: 'blue'
        };
    }
  };

  const handlePaymentUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a payment proof file');
      return;
    }

    if (!resumeId) {
      setUploadMessage('No resume selected for payment upload. Please go back to your dashboard and select a resume.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading payment proof...');

    const formData = new FormData();
    formData.append('resume_id', resumeId.toString());
    formData.append('proof', selectedFile);

    try {
      // Get CSRF token from meta tag or cookie
      let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        // Fallback to getting from cookie
        csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
        if (csrfToken) {
          csrfToken = decodeURIComponent(csrfToken);
        }
      }

      const response = await fetch('/upload-payment-proof', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('success');
        setCurrentPaymentStatus('pending');
        setUploadMessage('✅ Payment proof uploaded successfully! Your payment is now under review by our admin team. You will be notified once it is approved.');
      } else {
        const errorData = await response.json();
        setUploadStatus('error');
        
        // Handle specific validation errors
        if (errorData.errors) {
          const errorMessages = [];
          if (errorData.errors.resume_id) {
            errorMessages.push('Invalid resume selected. Please go back to your dashboard and select a valid resume.');
          }
          if (errorData.errors.proof) {
            errorMessages.push('Invalid file format. Please upload a PNG, JPG, JPEG, or PDF file under 2MB.');
          }
          setUploadMessage(errorMessages.join(' '));
        } else if (errorData.message) {
          setUploadMessage(errorData.message);
        } else {
          setUploadMessage(`Upload failed with status ${response.status}. Please try again.`);
        }
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  // If no resume is available, show a message
  if (!resumeId) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Head title="Payment - CVeezy" />
        <Header />
        
        <main className="flex-grow bg-white py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                No Resume Found
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                You need to create a resume before uploading payment proof.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Resume First</h2>
              <p className="text-gray-600 mb-6">
                Please go back to your dashboard and create a resume before proceeding with payment.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  const handleDownloadPDF = () => {
    if (!resumeId) {
      setUploadMessage('No resume selected for download');
      return;
    }
    
    setIsLoading(true);
    // Direct PDF download
    window.open(`/resumes/${resumeId}/download`, '_blank');
    setIsLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage('');
    }
  };

  const canUploadNewProof = () => {
    return !currentPaymentStatus || currentPaymentStatus === 'rejected';
  };

  const statusInfo = currentPaymentStatus ? getStatusMessage(currentPaymentStatus) : null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Head title="Payment - CVeezy" />
      <Header />

             <main className="flex-grow bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Your Resume
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Upload your payment proof to download your professional resume
            </p>
          </div>

          {/* Main Content Grid - Vertical Layout */}
          <div className="space-y-8">
            {/* Review Process Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Review Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Upload Payment Proof</h4>
                  <p className="text-sm text-gray-600">
                    Upload a screenshot or receipt of your payment
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Under Review</h4>
                  <p className="text-sm text-gray-600">
                    Our admin team reviews your payment proof within 24 hours
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Approved & Download</h4>
                  <p className="text-sm text-gray-600">
                    Once approved, you can download your PDF resume
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status Section */}
            {currentPaymentStatus ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Status</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      statusInfo?.color === 'green' ? 'bg-green-100' :
                      statusInfo?.color === 'red' ? 'bg-red-100' :
                      statusInfo?.color === 'yellow' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <span className={`text-lg ${
                        statusInfo?.color === 'green' ? 'text-green-600' :
                        statusInfo?.color === 'red' ? 'text-red-600' :
                        statusInfo?.color === 'yellow' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>{statusInfo?.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {currentPaymentStatus === 'approved' ? 'Payment Approved' :
                         currentPaymentStatus === 'rejected' ? 'Payment Rejected' :
                         'Payment Under Review'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">{statusInfo?.message}</p>
                      {currentPaymentStatus === 'approved' && (
                        <button
                          onClick={handleDownloadPDF}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                        >
                          {isLoading ? 'Downloading...' : 'Download PDF'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Upload Section - Only show when no payment status */
              canUploadNewProof() && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload Payment Proof</h3>
                  
                  {/* Accepted Formats */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Accepted formats:</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center gap-2">
                        <span>📄</span>
                        <span>Screenshots (PNG, JPG)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>📄</span>
                        <span>Receipt images</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>📄</span>
                        <span>PDF documents</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>📄</span>
                        <span>Transaction confirmations</span>
                      </li>
                    </ul>
                  </div>

                  {/* File Upload Section */}
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-700 mb-3">
                      Payment Proof File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        id="payment-proof-file"
                      />
                      <label htmlFor="payment-proof-file" className="cursor-pointer">
                        <div className="text-6xl mb-4">📁</div>
                        <p className="text-gray-600 mb-2 font-medium">
                          {selectedFile ? `Selected: ${selectedFile.name}` : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG, PDF up to 2MB
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Status Message */}
                  {uploadMessage && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      uploadStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                      uploadStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {uploadStatus === 'success' ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : uploadStatus === 'error' ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="font-medium">{uploadMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={handlePaymentUpload}
                    disabled={uploadStatus === 'uploading' || !selectedFile}
                    className={`w-full py-4 px-8 rounded-lg font-bold text-white text-lg transition-colors ${
                      uploadStatus === 'uploading' || !selectedFile
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Payment Proof'}
                  </button>
                </div>
              )
            )}

            {/* Features Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What You Get</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">📥</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Unlimited Downloads</h4>
                    <p className="text-sm text-gray-600">Download your resume in multiple formats</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🏔️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">ATS Optimized</h4>
                    <p className="text-sm text-gray-600">30+ templates optimized to beat ATS scans</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">✉️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Cover Letters</h4>
                    <p className="text-sm text-gray-600">Create and customize cover letters</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-lg">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Resume Checker</h4>
                    <p className="text-sm text-gray-600">Check for 30+ issues and get feedback</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-lg">💰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Money-Back Guarantee</h4>
                    <p className="text-sm text-gray-600">7-day money-back guarantee</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 text-lg">💬</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Round-the-clock customer support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment; 