import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId?: number;
  resumeName?: string;
  onStatusChange?: (status: 'pending' | 'approved' | 'rejected') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, resumeId, resumeName, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  // Check payment status when modal opens and handle cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!isOpen || !resumeId) return;
      
      try {
        const response = await fetch(`/user/payment-proofs`);
        if (response.ok) {
          const proofs = await response.json();
          const latestProof = proofs.find((proof: any) => proof.resume_id === resumeId);
          
          if (latestProof) {
            setPaymentStatus(latestProof.status);
            
            // Handle status changes
            if (latestProof.status === 'approved') {
              setUploadStatus('success');
              setUploadMessage('🎉 Your payment has been approved! You can now download your PDF resume.');
              onStatusChange?.(latestProof.status);
              clearInterval(interval);
            } else if (latestProof.status === 'rejected') {
              setUploadStatus('error');
              setUploadMessage('❌ Your payment was rejected. Please upload a new payment proof.');
              onStatusChange?.(latestProof.status);
              clearInterval(interval);
            }
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

    // Set up polling if modal is open and we're waiting for approval
    if (isOpen && resumeId && (paymentStatus === 'pending' || uploadStatus === 'success')) {
      interval = setInterval(checkStatus, 5000);
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
      const response = await fetch(`/user/payment-proofs`);
      if (response.ok) {
        const paymentProofs = await response.json();
        const currentResumeProof = paymentProofs.find((proof: any) => proof.resume_id === resumeId);
        if (currentResumeProof) {
          const newStatus = currentResumeProof.status;
          setPaymentStatus(newStatus);
          
          // Show notification for status changes
          if (newStatus === 'approved' && paymentStatus !== 'approved') {
            setUploadMessage('🎉 Your payment has been approved! You can now download your PDF resume.');
            setUploadStatus('success');
            onStatusChange?.('approved');
          } else if (newStatus === 'rejected' && paymentStatus !== 'rejected') {
            setUploadMessage('❌ Your payment was rejected. Please upload a new payment proof.');
            setUploadStatus('error');
            onStatusChange?.('rejected');
          }
        }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Proof Upload
          </h2>
          <p className="text-gray-600">
            Upload your payment proof for review
          </p>
        </div>

        {/* Resume Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Resume: {resumeName || 'My Resume'}</h3>
          <p className="text-sm text-gray-600">
            Please upload a screenshot or receipt of your payment. Our admin team will review it within 24 hours.
          </p>
        </div>

        {/* Payment Status Display */}
        {paymentStatus && (
          <div className={`p-4 rounded-lg mb-6 ${
            statusInfo.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            statusInfo.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            statusInfo.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{statusInfo.icon}</div>
                <div>
                  <p className="font-semibold mb-1">
                    {paymentStatus === 'approved' ? 'Payment Approved' :
                     paymentStatus === 'rejected' ? 'Payment Rejected' :
                     'Payment Under Review'}
                  </p>
                  <p className="text-sm">{statusInfo.message}</p>
                </div>
              </div>
              {statusInfo.showDownload && (
                <button
                  onClick={() => {
                    window.open(`/resumes/${resumeId}/download`, '_blank');
                    handleClose();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>
        )}

        {/* Accepted Formats */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2 text-blue-800">Accepted formats:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>📄 Screenshots (PNG, JPG)</li>
            <li>📄 Receipt images</li>
            <li>📄 PDF documents</li>
            <li>📄 Transaction confirmations</li>
          </ul>
        </div>

        {/* File Upload Section - Only show if no payment or payment was rejected */}
        {(!paymentStatus || paymentStatus === 'rejected') && (
          <>
            <div className="mb-6">
              <label className="block font-semibold mb-3">
                Payment Proof File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  id="payment-proof-file"
                />
                <label htmlFor="payment-proof-file" className="cursor-pointer">
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-gray-600 mb-2">
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
                {uploadMessage}
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {uploadStatus === 'success' || paymentStatus ? 'Close' : 'Cancel'}
          </button>
          
          {(!paymentStatus || paymentStatus === 'rejected') && uploadStatus !== 'success' && (
            <button
              onClick={handlePaymentUpload}
              disabled={uploadStatus === 'uploading' || !selectedFile}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                uploadStatus === 'uploading' || !selectedFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Payment'}
            </button>
          )}
        </div>

        {/* Review Process Info */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p className="mb-2">
            <strong>Review Process:</strong>
          </p>
          <ol className="text-left space-y-1">
            <li>1. Upload your payment proof</li>
            <li>2. Admin reviews within 24 hours</li>
            <li>3. You'll be notified of approval/rejection</li>
            <li>4. Download PDF once approved</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 