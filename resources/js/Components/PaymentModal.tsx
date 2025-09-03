import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId?: number;
  resumeName?: string;
  onStatusChange?: (status: 'pending' | 'approved' | 'rejected', resumeId?: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, resumeId, resumeName, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  // Reset transient UI state when opening for a new resume
  useEffect(() => {
    if (isOpen) {
      setUploadStatus('idle');
      setUploadMessage('');
      setPaymentStatus(null);
      setSelectedFile(null);
    }
  }, [isOpen, resumeId]);

  // Check payment status when modal opens and handle cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!isOpen || !resumeId) return;
      
      try {
        // Authoritative single source to avoid inconsistent states
        const statusRes = await fetch(`/resumes/${resumeId}/payment-status?ts=${Date.now()}`, { cache: 'no-store' });
        const statusJson = statusRes.ok ? await statusRes.json() : null;
        const effective: string | null = statusJson?.status_effective ?? null;

        if (effective) {
          const prev = paymentStatus;
          if (effective === 'unpaid') {
            // No payment uploaded yet → don't show a status banner
            setPaymentStatus(null);
            return;
          }
          setPaymentStatus(effective as any);
          if (effective === 'approved') {
            setUploadStatus('success');
            setUploadMessage('🎉 Your payment has been approved! You can now download your PDF resume.');
            if (prev !== 'approved') onStatusChange?.('approved', resumeId);
          } else if (effective === 'rejected') {
            setUploadStatus('error');
            setUploadMessage('❌ Your payment was rejected. Please upload a new payment proof.');
            if (prev !== 'rejected') onStatusChange?.('rejected', resumeId);
          } else if (effective === 'needs_payment' || effective === 'needs_payment_modified') {
            setUploadStatus('error');
            setUploadMessage('You proceeded to modify a previously paid resume. For security and accuracy, please upload a new payment proof to re-enable PDF downloads.');
            setPaymentStatus(null);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Initial check
    if (isOpen && resumeId) {
      checkStatus();
    }

    // Poll while waiting for a decision
    if (isOpen && resumeId && paymentStatus === 'pending') {
      interval = setInterval(checkStatus, 2000);
    }

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen, resumeId, paymentStatus, uploadStatus, onStatusChange]);

  const checkPaymentStatus = async () => {
    try {
      const res = await fetch(`/resumes/${resumeId}/payment-status?ts=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const newStatus = data?.status_effective;
      const prev = paymentStatus;
      if (newStatus === 'unpaid') {
        setPaymentStatus(null);
        return;
      }
      if (newStatus) setPaymentStatus(newStatus);
      if (newStatus === 'approved' && prev !== 'approved') {
        setUploadMessage('🎉 Your payment has been approved! You can now download your PDF resume.');
        setUploadStatus('success');
        onStatusChange?.('approved', resumeId);
      } else if (newStatus === 'rejected' && prev !== 'rejected') {
        setUploadMessage('❌ Your payment was rejected. Please upload a new payment proof.');
        setUploadStatus('error');
        onStatusChange?.('rejected', resumeId);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handlePaymentUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a payment proof file');
      return;
    }

    if (!resumeId) {
      setUploadMessage('No resume selected for payment upload');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading payment proof...');

    const formData = new FormData();
    formData.append('resume_id', resumeId.toString());
    formData.append('proof', selectedFile);

    try {
      console.log('Uploading payment proof...', {
        resumeId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      });

      // Get CSRF token from meta tag or cookie
      let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        // Fallback to getting from cookie
        csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
        if (csrfToken) {
          csrfToken = decodeURIComponent(csrfToken);
        }
      }
      console.log('CSRF Token:', csrfToken);
      console.log('Resume ID being uploaded for:', resumeId);

      const response = await fetch('/upload-payment-proof', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        setUploadStatus('success');
        setPaymentStatus('pending');
        setUploadMessage('Payment proof uploaded successfully! Your payment is now under review by our admin team. You will be notified once it is approved.');
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        setUploadStatus('error');
        setUploadMessage(errorData.message || `Upload failed with status ${response.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage('');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadMessage('');
    setPaymentStatus(null);
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'approved':
        return {
          message: '🎉 Your payment has been approved! You can now download your PDF resume.',
          type: 'success',
          showDownload: true,
          icon: '✅'
        };
      case 'rejected':
        return {
          message: '❌ Your payment was rejected. Please upload a new payment proof.',
          type: 'error',
          showDownload: false,
          icon: '❌'
        };
      case 'pending':
        return {
          message: '⏳ Your payment is under review. Our admin team will review it within 24 hours.',
          type: 'warning',
          showDownload: false,
          icon: '⏳'
        };
      default:
        return {
          message: '',
          type: 'info',
          showDownload: false,
          icon: 'ℹ️'
        };
    }
  };

  const statusInfo = getStatusMessage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Enhanced Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container with modern styling */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        {/* Enhanced Header with gradient background */}
        <div className="relative bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Payment Proof Upload
            </h2>
            <p className="text-white/90 text-sm">
              Upload your payment proof for review
            </p>
          </div>
        </div>

        {/* Enhanced Resume Info Card */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  Resume: {resumeName || 'My Resume'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Please upload a screenshot or receipt of your payment. Our admin team will review it within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Payment Status Display */}
          {paymentStatus && (
            <div className={`rounded-xl p-5 mb-6 border-2 ${
              statusInfo.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
              statusInfo.type === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
              statusInfo.type === 'warning' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
              'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    statusInfo.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    statusInfo.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                    statusInfo.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}>
                    {statusInfo.type === 'success' ? <CheckCircle className="w-6 h-6 text-white" /> :
                     statusInfo.type === 'error' ? <AlertCircle className="w-6 h-6 text-white" /> :
                     statusInfo.type === 'warning' ? <Clock className="w-6 h-6 text-white" /> :
                     <CheckCircle className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 text-lg ${
                      statusInfo.type === 'success' ? 'text-green-800' :
                      statusInfo.type === 'error' ? 'text-red-800' :
                      statusInfo.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {paymentStatus === 'approved' ? 'Payment Approved' :
                       paymentStatus === 'rejected' ? 'Payment Rejected' :
                       'Payment Under Review'}
                    </h4>
                    <p className={`text-sm leading-relaxed ${
                      statusInfo.type === 'success' ? 'text-green-700' :
                      statusInfo.type === 'error' ? 'text-red-700' :
                      statusInfo.type === 'warning' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {statusInfo.message}
                    </p>
                  </div>
                </div>
                {statusInfo.showDownload && (
                  <button
                    onClick={() => {
                      window.open(`/resumes/${resumeId}/download`, '_blank');
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Accepted Formats */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
            <h4 className="font-semibold mb-3 text-blue-800 text-lg">Accepted formats:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Screenshots (PNG, JPG)
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Receipt images
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                PDF documents
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Transaction confirmations
              </div>
            </div>
          </div>

          {/* Enhanced File Upload Section */}
          {(!paymentStatus || paymentStatus === 'rejected') && (
            <>
              <div className="mb-6">
                <label className="block font-semibold mb-4 text-gray-900 text-lg">
                  Payment Proof File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer hover:border-[#354eab] hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    id="payment-proof-file"
                  />
                  <label htmlFor="payment-proof-file" className="cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">
                      {selectedFile ? `Selected: ${selectedFile.name}` : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG, PDF up to 2MB
                    </p>
                  </label>
                </div>
              </div>

              {/* Enhanced Status Message */}
              {uploadMessage && (
                <div className={`rounded-xl p-5 mb-6 border-2 ${
                  uploadStatus === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
                  uploadStatus === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                  'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      uploadStatus === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                      uploadStatus === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}>
                      {uploadStatus === 'error' ? <AlertCircle className="w-4 h-4 text-white" /> :
                       uploadStatus === 'success' ? <CheckCircle className="w-4 h-4 text-white" /> :
                       <Clock className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`text-sm font-medium ${
                      uploadStatus === 'error' ? 'text-red-700' :
                      uploadStatus === 'success' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>
                      {uploadMessage}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex gap-4 px-6 pb-6">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              {uploadStatus === 'success' || paymentStatus ? 'Close' : 'Cancel'}
            </button>
            
            {(!paymentStatus || paymentStatus === 'rejected') && uploadStatus !== 'success' && (
              <button
                onClick={handlePaymentUpload}
                disabled={uploadStatus === 'uploading' || !selectedFile}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                  uploadStatus === 'uploading' || !selectedFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#354eab] to-[#4a5fc7] hover:from-[#2d3f8f] hover:to-[#3a4fb0] shadow-md hover:shadow-lg'
                }`}
              >
                {uploadStatus === 'uploading' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload Payment'
                )}
              </button>
            )}
          </div>

          {/* Enhanced Review Process Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 rounded-b-2xl p-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-4 text-lg">Review Process</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  Upload your payment proof
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  Admin reviews within 24 hours
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  You'll be notified of approval/rejection
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                  Download PDF once approved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 