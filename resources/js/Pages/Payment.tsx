import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Head, Link } from "@inertiajs/react";
// import QRCode from "react-qr-code"; // QR generation lib (optional)

// Import your own components
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

// --- Helper Icons (can be moved to a separate file) ---
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);
const HourglassIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// --- Interface Definitions ---
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

// --- Main Payment Component ---
const Payment: React.FC<PaymentProps> = ({ resumeId: propResumeId, resumeName: propResumeName, paymentProofs = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);
  const [userInitiatedUpload, setUserInitiatedUpload] = useState<boolean>(false);

  const [resumeId, setResumeId] = useState<number | undefined>(propResumeId);
  const [resumeName, setResumeName] = useState<string | undefined>(propResumeName);

  const gcashNumber = '09365231328';
  const paymentAmount = '149';
  // For QR Code: In a real app, this payload would be generated according to payment gateway standards.
  const qrCodeValue = `upi://pay?pa=${gcashNumber}&pn=CVeezy&am=${paymentAmount}&cu=PHP`;


  // --- Existing Hooks for Data Fetching & State Management (Largely Unchanged) ---

  useEffect(() => {
    // Parse URL parameters if not provided as props
    if (!resumeId || !resumeName) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlResumeId = urlParams.get('resumeId') || urlParams.get('resume');
      const urlResumeName = urlParams.get('resumeName');

      if (urlResumeId) {
        const parsedId = parseInt(urlResumeId);
        setResumeId(parsedId);
        try { sessionStorage.setItem('paymentResumeId', String(parsedId)); } catch {}
      }
      if (urlResumeName) {
        setResumeName(decodeURIComponent(urlResumeName));
      }
    }
  }, [propResumeId, propResumeName]);

  useEffect(() => {
    if (!resumeId) {
      try {
        const stored = sessionStorage.getItem('paymentResumeId');
        if (stored) {
          const parsed = parseInt(stored);
          if (!Number.isNaN(parsed)) setResumeId(parsed);
        }
      } catch {}
    }
  }, [resumeId]);

  useEffect(() => {
    if (resumeId && paymentProofs.length > 0) {
      const currentProof: any = paymentProofs.find((proof: any) => proof.resume_id === resumeId);
      if (currentProof) {
        const effective = currentProof.status_effective || currentProof.status;
        if (effective === 'needs_payment' || effective === 'needs_payment_modified' || currentProof.is_downloadable === false) {
          setCurrentPaymentStatus(null);
          setUploadMessage('You modified a paid resume. Please upload a new payment proof to re-enable downloads.');
          setUploadStatus('error');
        } else if (effective) {
          setCurrentPaymentStatus(effective);
        }
      }
    }
  }, [resumeId, paymentProofs]);

  // Enhanced polling logic to check for all status changes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Check for status changes every 5 seconds when on payment page
    interval = setInterval(async () => {
      if (resumeId) {
        try {
          // Don't poll if we just uploaded a new payment proof (within last 10 seconds)
          // or if user is currently in the upload form (status is null)
          // or if user has initiated upload but hasn't uploaded yet
          const timeSinceUpload = Date.now() - lastUploadTime;
          if (timeSinceUpload < 10000 || currentPaymentStatus === null || userInitiatedUpload) {
            return;
          }
          
          // Use the authoritative payment status endpoint
          const response = await fetch(`/resumes/${resumeId}/payment-status?ts=${Date.now()}`, { 
            cache: 'no-store' 
          });
          if (response.ok) {
            const statusData = await response.json();
            const effective = statusData.status_effective;
            
            // Update status if it has changed
            if (effective && effective !== currentPaymentStatus) {
              setCurrentPaymentStatus(effective);
              
              // Set appropriate upload status and message based on new status
              if (effective === 'rejected') {
                setUploadStatus('error');
                setUploadMessage('Your payment was rejected. Please upload a new payment proof.');
              } else if (effective === 'approved') {
                setUploadStatus('success');
                setUploadMessage('🎉 Your payment has been approved! You can now download your PDF resume.');
              } else if (effective === 'pending') {
                setUploadStatus('success');
                setUploadMessage('Your payment proof is under review.');
              } else if (effective === 'unpaid') {
                setCurrentPaymentStatus(null);
                setUploadStatus('idle');
                setUploadMessage('');
              }
            }
          }
        } catch (error) { 
          console.error('Error polling payment status:', error); 
        }
      }
    }, 5000);
    
    return () => { 
      if (interval) clearInterval(interval); 
    };
  }, [resumeId, currentPaymentStatus, lastUploadTime, userInitiatedUpload]);

  // Immediate status check on component mount
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (resumeId) {
        try {
          // Use the authoritative payment status endpoint
          const response = await fetch(`/resumes/${resumeId}/payment-status?ts=${Date.now()}`, { 
            cache: 'no-store' 
          });
          if (response.ok) {
            const statusData = await response.json();
            const effective = statusData.status_effective;
            
            if (effective && effective !== currentPaymentStatus) {
              setCurrentPaymentStatus(effective);
              
              // Set appropriate upload status and message based on status
              if (effective === 'rejected') {
                setUploadStatus('error');
                setUploadMessage('Your payment was rejected. Please upload a new payment proof.');
              } else if (effective === 'approved') {
                setUploadStatus('success');
                setUploadMessage('🎉 Your payment has been approved! You can now download your PDF resume.');
              } else if (effective === 'pending') {
                setUploadStatus('success');
                setUploadMessage('Your payment proof is under review.');
              } else if (effective === 'unpaid') {
                setCurrentPaymentStatus(null);
                setUploadStatus('idle');
                setUploadMessage('');
              }
            }
          }
        } catch (error) {
          console.error('Error checking initial payment status:', error);
        }
      }
    };

    checkInitialStatus();
  }, [resumeId]);

  
  // --- Handler Functions ---

  const handleCopy = () => {
    navigator.clipboard.writeText(gcashNumber).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage('');
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearSelection = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
  }

  const handlePaymentUpload = async () => {
    // Upload logic remains the same...
    if (!selectedFile || !resumeId) return;
    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('resume_id', resumeId.toString());
    formData.append('proof', selectedFile);

    try {
      let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const response = await fetch('/upload-payment-proof', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
      });
      if (response.ok) {
        // Immediately set to pending status to prevent reverting to rejected
        setCurrentPaymentStatus('pending');
        setUploadStatus('success');
        setUploadMessage('Your new payment proof has been uploaded and is under review.');
        
        // Set upload time to prevent immediate polling reversion
        setLastUploadTime(Date.now());
        
        // Reset user initiated upload flag since they've now uploaded
        setUserInitiatedUpload(false);
        
        // Clear any previous error states
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        const errorData = await response.json();
        setUploadStatus('error');
        setUploadMessage(errorData.message || 'Upload failed. Please check the file and try again.');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('An error occurred during upload.');
    }
  };
  
  const handleDownloadPDF = () => {
    if (!resumeId) return;
    setIsLoading(true);
    window.open(`/resumes/${resumeId}/download`, '_blank');
    setIsLoading(false);
  };


  // --- Conditional "No Resume" Screen ---
  if (!resumeId) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Head title="Payment - CVeezy" />
            <main className="flex-grow bg-white py-8">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">No Resume Found</h1>
                <p className="text-xl text-gray-600 mb-8">Please create or select a resume before proceeding to payment.</p>
              </div>
            </main>
            <Footer />
        </div>
    );
  }
  
  // --- Main Render ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head title="Payment - CVeezy" />
      <Head title="Payment - CVeezy" />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Centered Progress Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <div className="max-w-2xl w-full">
                <div className="flex items-center justify-center space-x-3 sm:space-x-6">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentPaymentStatus === 'pending' || currentPaymentStatus === 'approved' 
                        ? 'bg-[#354eab] text-white shadow-lg' 
                        : 'bg-[#354eab] text-white shadow-lg ring-4 ring-blue-100'
                    }`}>
                      {currentPaymentStatus === 'pending' || currentPaymentStatus === 'approved' ? <CheckIcon /> : '1'}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 mt-1 text-center">Upload Proof</span>
                  </div>

                  {/* Connector Line */}
                  <div className={`h-1 w-12 sm:w-16 rounded-full transition-all duration-300 ${
                    currentPaymentStatus === 'pending' || currentPaymentStatus === 'approved' 
                      ? 'bg-[#354eab]' 
                      : 'bg-gray-300'
                  }`}></div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentPaymentStatus === 'approved' 
                        ? 'bg-[#354eab] text-white shadow-lg' 
                        : currentPaymentStatus === 'pending'
                        ? 'bg-[#4a5fc7] text-white shadow-lg ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentPaymentStatus === 'approved' ? <CheckIcon /> : currentPaymentStatus === 'pending' ? <HourglassIcon /> : '2'}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 mt-1 text-center">Admin Review</span>
                  </div>

                  {/* Connector Line */}
                  <div className={`h-1 w-12 sm:w-16 rounded-full transition-all duration-300 ${
                    currentPaymentStatus === 'approved' 
                      ? 'bg-[#354eab]' 
                      : 'bg-gray-300'
                  }`}></div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentPaymentStatus === 'approved' 
                        ? 'bg-[#354eab] text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentPaymentStatus === 'approved' ? <CheckIcon /> : '3'}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 mt-1 text-center">Download PDF</span>
                  </div>
                </div>
                
                {/* Dashboard Button - Show when payment is approved or rejected */}
                {(currentPaymentStatus === 'approved' || currentPaymentStatus === 'rejected') && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 }}
                    className="mt-6 flex justify-center"
                  >
                    <Link 
                      href={`/dashboard${currentPaymentStatus === 'approved' ? `?payment_approved=true&resumeId=${resumeId}` : currentPaymentStatus === 'rejected' ? `?payment_rejected=true&resumeId=${resumeId}` : ''}`}
                      className="inline-flex items-center gap-2 bg-[#354eab] hover:bg-[#4a5fc7] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                      </svg>
                      Go to Dashboard
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* **NEW** Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                
                {/* --- LEFT COLUMN: Instructions --- */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
                    {/* Combined Payment Method & Instructions Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header with Title */}
                        <div className="bg-gradient-to-r from-[#354eab] to-[#4a5fc7] p-4 text-white text-center">
                            <h3 className="text-3xl font-bold text-white">How to Pay</h3>
                            <p className="text-white/80 text-xs">Complete your payment in 3 simple steps</p>
                        </div>

                        {/* Payment Method Section */}
                        <div className="p-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <img src="/images/gcash.png" alt="GCash" className="h-10" />
                                
                                {/* Blue Line Separator */}
                                <div className="w-px h-8 bg-[#354eab]"></div>
                                
                                <div className="text-center">
                                    <div className="font-bold text-gray-900 text-2xl mb-0.5">Pay via GCash</div>
                                    <div className="text-xs text-gray-500">Secure & Instant Payment</div>
                                </div>
                            </div>
                            
                            {/* QR Code and Payment Details */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100 mb-4">
                                <div 
                                    className="w-32 h-32 mx-auto p-3 bg-white rounded-xl shadow-md border-2 border-blue-300 flex items-center justify-center mb-3 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 relative group"
                                    onClick={() => setIsQRModalOpen(true)}
                                >
                                    <img src="/images/QR_Code_Example.svg" alt="GCash QR Code" className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="bg-[#354eab] text-white px-3 py-1 rounded-lg font-semibold text-sm shadow-lg">View</span>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-gray-800 mb-1">Scan to Pay ₱{paymentAmount}</p>
                                <p className="text-xs text-gray-600 mb-3">OR pay to this number:</p>
                                <div className="bg-white border-2 border-blue-200 rounded-lg px-4 py-2 shadow-sm">
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="font-mono font-bold text-lg text-gray-800 tracking-wider">{gcashNumber}</span>
                                        <button 
                                            onClick={handleCopy} 
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                                isCopied 
                                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                                    : 'bg-[#354eab] text-white hover:bg-[#4a5fc7] border border-[#354eab]'
                                            }`}
                                        >
                                            {isCopied ? '✓ Copied!' : 'COPY'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Instructions */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-base font-bold text-gray-900 mb-3 text-center">Payment Instructions</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">1</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-900 mb-1">Send exactly ₱{paymentAmount} to the GCash number above</p>
                                            <p className="text-xs text-gray-500">Make sure the amount is correct</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-900 mb-1">Take a screenshot of your payment receipt</p>
                                            <p className="text-xs text-gray-500">Include transaction details and reference number</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs font-bold">3</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-900 mb-1">Upload the screenshot using the form on the right</p>
                                            <p className="text-xs text-gray-500">We'll review and approve within 24 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- RIGHT COLUMN: Action Area --- */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Order Summary Header */}
                        <div className="bg-gradient-to-r from-[#354eab] to-[#4a5fc7] p-4 text-white text-center">
                            <h3 className="text-3xl font-bold text-white">Order Summary</h3>
                            <p className="text-white/80 text-xs">Review your order details</p>
                        </div>

                        {/* Order Details and Payment Amount Side by Side */}
                        <div className="p-4">
                            <div className="flex gap-4">
                                {/* Order Details */}
                                <div className="flex-1">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                <span className="text-gray-600 font-medium text-xs">Resume:</span>
                                            </div>
                                            <span className="font-semibold text-gray-800 text-xs">{resumeName || 'My Resume'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                <span className="text-gray-600 font-medium text-xs">Plan:</span>
                                            </div>
                                            <span className="font-semibold text-gray-800 text-xs">Single PDF Download</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                                <span className="text-gray-600 font-medium text-xs">Processing:</span>
                                            </div>
                                            <span className="font-semibold text-gray-800 text-xs">24 Hours</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Vertical Line Separator */}
                                <div className="w-0.5 bg-[#354eab]"></div>
                                
                                {/* Payment Amount */}
                                <div className="flex-1">
                                    <div className="bg-[#354eab]/20 rounded-xl p-3 shadow-sm border-l-4 border-r-4 border-[#354eab] relative overflow-hidden transition-all duration-300 hover:bg-[#354eab]/30 hover:shadow-md hover:scale-[1.02] cursor-pointer h-full">
                                        <div className="absolute right-0 top-0 w-16 h-16 bg-[#354eab]/10 rounded-full -translate-y-8 translate-x-8 transition-transform duration-300 hover:scale-110"></div>
                                        <div className="absolute right-2 top-2 w-8 h-8 bg-[#354eab]/20 rounded-full -translate-y-4 translate-x-4 transition-transform duration-300 hover:scale-110"></div>
                                        <div className="flex flex-col justify-center h-full">
                                            <p className="text-[#354eab] font-semibold text-sm mb-1 transition-colors duration-300 hover:text-[#354eab]/80">Payment Amount</p>
                                            <p className="text-2xl font-extrabold text-[#354eab] mb-2 transition-colors duration-300 hover:text-[#354eab]/80">₱{paymentAmount}</p>
                                            <p className="text-[#354eab]/70 text-xs opacity-90 transition-colors duration-300 hover:text-[#354eab]/60">
                                                One-time payment • No recurring charges
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Conditional Rendering: Upload Form OR Status */}
                        {currentPaymentStatus === 'approved' ? (
                            <PaymentStatusCard status="approved" onDownload={handleDownloadPDF} isLoading={isLoading}/>
                        ) : currentPaymentStatus === 'pending' ? (
                            <PaymentStatusCard status="pending" />
                        ) : currentPaymentStatus === 'rejected' ? (
                            <PaymentStatusCard status="rejected" onReset={() => {
                                setCurrentPaymentStatus(null);
                                setLastUploadTime(0); // Reset upload time to allow fresh polling
                                setUploadStatus('idle');
                                setUploadMessage('');
                                setUserInitiatedUpload(true); // Mark that user initiated upload
                            }} />
                        ) : (
                            <UploadSection
                                selectedFile={selectedFile}
                                previewUrl={previewUrl}
                                onFileSelect={handleFileSelect}
                                onClear={clearSelection}
                                onUpload={handlePaymentUpload}
                                uploadStatus={uploadStatus}
                                uploadMessage={uploadMessage}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
      </main>
      <Footer />
      
      {/* QR Code Modal */}
      <AnimatePresence>
        <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
      </AnimatePresence>
    </div>
  );
};


// --- Sub-Components for a Cleaner Structure ---

const TimelineStep = ({ number, title, description, isActive, isComplete, isPending }: any) => {
    const isDone = isComplete;
    const isCurrent = isActive && !isComplete;
  
    return (
      <li className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
          ${isDone ? 'bg-green-500 text-white' : ''}
          ${isCurrent ? 'bg-[#354eab] text-white ring-4 ring-blue-100' : ''}
          ${!isDone && !isCurrent ? 'bg-gray-200 text-gray-600' : ''}
        `}>
          {isDone ? <CheckIcon /> : number}
        </div>
        <div>
          <h4 className={`font-semibold text-gray-900 ${isCurrent ? 'text-[#354eab]' : ''}`}>
            {title} {isPending && <HourglassIcon />}
          </h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </li>
    );
};
  
const UploadSection = ({ selectedFile, previewUrl, onFileSelect, onClear, onUpload, uploadStatus, uploadMessage }: any) => (
    <div className="p-4">
      {!selectedFile ? (
        <label htmlFor="payment-proof-file" className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer hover:border-[#354eab] hover:bg-blue-50 transition-all group">
            <input type="file" onChange={onFileSelect} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id="payment-proof-file" />
            <div className="text-5xl mb-4 transition-transform group-hover:scale-110">📁</div>
            <p className="text-gray-700 font-semibold text-lg mb-1">Upload Proof of Payment Here</p>
            <p className="text-gray-600 font-medium text-sm mb-2">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500">PNG, JPG, or PDF (Max 2MB)</p>
        </label>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100 text-center">
            {previewUrl && <img src={previewUrl} alt="Preview" className="max-h-40 w-auto mx-auto mb-4 rounded-lg border shadow-lg" />}
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="font-bold text-gray-800 break-all text-lg">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mb-3">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                <button onClick={onClear} className="text-sm text-red-600 font-semibold hover:underline bg-red-50 px-3 py-2 rounded-md hover:bg-red-100 transition-colors">Change file</button>
            </div>
        </div>
      )}

      {uploadMessage && (
        <div className={`mt-4 p-4 rounded-xl text-sm font-medium shadow-sm ${uploadStatus === 'error' ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-l-4 border-red-400' : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-l-4 border-blue-400'}`}>
            <p className="leading-relaxed font-semibold mb-1">{uploadStatus === 'error' ? 'Payment Required' : 'Information'}</p>
            <p className="leading-relaxed text-xs opacity-90">{uploadMessage}</p>
        </div>
      )}

      {/* Upload Button - Below Upload Section */}
      <button 
        onClick={onUpload} 
        disabled={!selectedFile || uploadStatus === 'uploading'} 
        className="w-full mt-6 py-4 px-8 rounded-full font-bold text-white transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed bg-gradient-to-r from-[#354eab] to-[#4a5fc7] hover:from-[#4a5fc7] hover:to-[#354eab] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base border-2 border-transparent hover:border-white/20"
      >
        {uploadStatus === 'uploading' ? 'Uploading...' : 'Confirm & Upload Proof'}
      </button>

    </div>
);

const PaymentStatusCard = ({ status, onDownload, isLoading, onReset }: any) => {
    const details: Record<string, { icon: string; title: string; message: string; color: 'green' | 'yellow' | 'red' }> = {
      approved: { icon: 'check', title: 'Payment Approved!', message: 'Your resume is ready. You can now download the PDF file.', color: 'green' },
      pending: { icon: 'clock', title: 'Payment Under Review', message: 'We have received your proof and our team will review it shortly. You will be notified via email or phone.', color: 'yellow' },
      rejected: { icon: '❌', title: 'Payment Rejected', message: 'There was an issue with your payment proof. Please check your email for details from our admin team.', color: 'red' },
    };
  
    const current = details[String(status)] || details.pending;
  
    return (
      <div className={`text-center p-6 rounded-2xl bg-gradient-to-br from-${current.color}-50 to-${current.color}-100 border-2 border-${current.color}-200 shadow-lg mx-4 my-6`}>
        <div className={`text-5xl mb-4 animate-bounce`}>
          {current.icon === 'clock' ? (
            <div className="flex justify-center">
              <svg className="w-20 h-20" fill="none" stroke="#eab308" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : current.icon === 'check' ? (
            <div className="flex justify-center">
              <svg className="w-20 h-20" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            current.icon
          )}
        </div>
        <h3 className={`text-xl font-bold text-${current.color}-800 mb-3`}>{current.title}</h3>
        <p className={`text-sm text-${current.color}-700 mb-6 max-w-sm mx-auto leading-relaxed`}>{current.message}</p>
        
        {status === 'approved' && (
            <button 
                onClick={onDownload} 
                disabled={isLoading} 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? '⏳ Downloading...' : '📥 Download PDF'}
            </button>
        )}
        {status === 'rejected' && (
            <button 
                onClick={onReset} 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
                Upload New Proof
            </button>
        )}
        {status === 'pending' && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4">
                <p className="text-yellow-800 font-medium text-sm">We'll notify you once your payment is verified!</p>
            </div>
        )}
      </div>
    );
};

// QR Code Modal Component
const QRModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-4 border-[#354eab] relative overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#354eab]/10 to-[#4a5fc7]/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#354eab]/5 to-[#4a5fc7]/5 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="text-center relative z-10">
          {/* Header with GCash Logo */}
          <div className="flex items-center justify-center mb-4">
            <img src="/images/gcash.png" alt="GCash" className="h-8" />
          </div>
          
          {/* QR Code Container */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border-2 border-gray-200 shadow-inner">
            <div className="w-64 h-64 mx-auto p-3 bg-white rounded-lg shadow-lg border-2 border-[#354eab]/20 flex items-center justify-center">
              <img src="/images/QR_Code_Example.svg" alt="GCash QR Code" className="w-full h-full object-contain" />
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="bg-gradient-to-r from-[#354eab]/10 to-[#4a5fc7]/10 rounded-2xl p-4 mb-4 border-2 border-[#354eab]/30 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-[#354eab] rounded-full mr-2"></div>
              <p className="text-base font-semibold text-[#354eab]">One-time payment</p>
            </div>
            <p className="text-sm text-gray-600 text-center">No recurring charges</p>
          </div>
          
          {/* Instructions */}
          <div className="text-center mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Scan with your GCash app</p>
            <p className="text-xs text-gray-500">Make sure your app is updated to the latest version</p>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-center">
            <button 
              onClick={onClose}
              className="bg-gradient-to-r from-[#354eab] to-[#4a5fc7] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#4a5fc7] hover:to-[#354eab] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
  
export default Payment;