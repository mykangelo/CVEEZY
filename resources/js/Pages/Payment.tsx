import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
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

  // Polling logic remains the same...
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
            }
          }
        } catch (error) { console.error('Error polling status:', error); }
      }, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [currentPaymentStatus, resumeId]);

  
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
        setCurrentPaymentStatus('pending');
        setUploadStatus('success');
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
                <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-[#354eab] hover:bg-[#4a5fc7] text-white font-semibold rounded-lg">
                  Go to Dashboard
                </Link>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header with Dashboard button */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition shadow-sm hover:shadow-md">
                    <span className="text-lg">←</span>
                    <span className="font-semibold">Dashboard</span>
                </Link>
                <div className="text-center flex-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Final Step: Unlock Your PDF</h1>
                    <p className="text-gray-600 mt-1">Complete the payment and upload proof to download your resume.</p>
                </div>
                <div className="w-28" />
            </motion.div>

            {/* **NEW** Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* --- LEFT COLUMN: Instructions --- */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
                    {/* Payment Method Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-center mb-2">
                            <Logo size="sm" showText={false} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">1. How to Pay</h3>
                        <div className="flex items-center gap-3 mb-5">
                            <img src="/images/gcash.png" alt="GCash" className="h-8" />
                            <div className="font-semibold text-gray-900">Pay via GCash</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className="w-40 h-40 mx-auto p-2 bg-white rounded-lg shadow-inner border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
                                GCash QR
                            </div>
                            <p className="text-sm font-semibold text-gray-800 mt-3">Scan to Pay ₱{paymentAmount}</p>
                            <p className="text-xs text-gray-500 mt-1">OR pay to this number:</p>
                            <div className="mt-2 text-center bg-white border rounded-lg px-3 py-2">
                                <span className="font-mono font-bold text-lg text-gray-800 tracking-wider">{gcashNumber}</span>
                                <button onClick={handleCopy} className="ml-3 text-xs font-semibold text-[#354eab] hover:underline focus:outline-none">
                                    {isCopied ? 'Copied!' : 'COPY'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">2. Your Progress</h3>
                        <ul className="space-y-4">
                            <TimelineStep
                                number={1}
                                title="Upload Proof"
                                description="Submit a screenshot of your receipt."
                                isComplete={currentPaymentStatus === 'pending' || currentPaymentStatus === 'approved'}
                                isActive={!currentPaymentStatus}
                            />
                            <TimelineStep
                                number={2}
                                title="Admin Review"
                                description="We'll verify your payment (usually within 24h)."
                                isComplete={currentPaymentStatus === 'approved'}
                                isActive={currentPaymentStatus === 'pending'}
                                isPending={currentPaymentStatus === 'pending'}
                            />
                            <TimelineStep
                                number={3}
                                title="Download PDF"
                                description="Get your professional resume."
                                isComplete={currentPaymentStatus === 'approved'}
                                isActive={currentPaymentStatus === 'approved'}
                            />
                        </ul>
                    </div>
                </motion.div>

                {/* --- RIGHT COLUMN: Action Area --- */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        {/* Order Summary */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Resume:</span> <span className="font-medium text-gray-800">{resumeName || 'My Resume'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Plan:</span> <span className="font-medium text-gray-800">Single PDF Download</span></div>
                            </div>
                            <div className="border-t my-4"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-base font-semibold text-gray-900">Total Due:</span>
                                <span className="text-2xl font-extrabold text-[#354eab]">₱{paymentAmount}</span>
                            </div>
                        </div>
                        <div className="border-t-2 border-dashed border-gray-200 my-6"></div>

                        {/* Conditional Rendering: Upload Form OR Status */}
                        {currentPaymentStatus === 'approved' ? (
                            <PaymentStatusCard status="approved" onDownload={handleDownloadPDF} isLoading={isLoading}/>
                        ) : currentPaymentStatus === 'pending' ? (
                            <PaymentStatusCard status="pending" />
                        ) : currentPaymentStatus === 'rejected' ? (
                            <PaymentStatusCard status="rejected" onReset={() => setCurrentPaymentStatus(null)} />
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
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">3. Upload Your Proof</h3>
      
      {!selectedFile ? (
        <label htmlFor="payment-proof-file" className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 cursor-pointer hover:border-[#354eab] hover:bg-blue-50 transition-all group">
            <input type="file" onChange={onFileSelect} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id="payment-proof-file" />
            <div className="text-5xl mb-3 transition-transform group-hover:scale-110">📁</div>
            <p className="text-gray-700 font-medium">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or PDF (Max 2MB)</p>
        </label>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 text-center">
            {previewUrl && <img src={previewUrl} alt="Preview" className="max-h-32 w-auto mx-auto mb-4 rounded-lg border shadow-sm" />}
            <p className="font-semibold text-gray-800 break-all">{selectedFile.name}</p>
            <p className="text-xs text-gray-500 mb-3">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            <button onClick={onClear} className="text-xs text-red-600 font-semibold hover:underline">Change file</button>
        </div>
      )}

      {uploadMessage && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${uploadStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            <span>{uploadStatus === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{uploadMessage}</span>
        </div>
      )}

      <button onClick={onUpload} disabled={!selectedFile || uploadStatus === 'uploading'} className="w-full mt-6 py-3 px-6 rounded-lg font-bold text-white transition-all disabled:bg-gray-400 disabled:cursor-not-allowed bg-[#354eab] hover:bg-[#4a5fc7] shadow-sm hover:shadow-md active:scale-[0.99]">
        {uploadStatus === 'uploading' ? 'Uploading...' : 'Confirm & Upload Proof'}
      </button>
    </div>
);

const PaymentStatusCard = ({ status, onDownload, isLoading, onReset }: any) => {
    const details: Record<string, { icon: string; title: string; message: string; color: 'green' | 'yellow' | 'red' }> = {
      approved: { icon: '🎉', title: 'Payment Approved!', message: 'Your resume is ready. You can now download the PDF file.', color: 'green' },
      pending: { icon: '⏳', title: 'Payment Under Review', message: 'We have received your proof and our team will review it shortly. You will be notified via email or phone.', color: 'yellow' },
      rejected: { icon: '❌', title: 'Payment Rejected', message: 'There was an issue with your payment proof. Please check your email for details from our admin team.', color: 'red' },
    };
  
    const current = details[String(status)] || details.pending;
  
    return (
      <div className={`text-center p-6 rounded-2xl bg-${current.color}-50 border border-${current.color}-200`}>
        <div className={`text-5xl mb-3`}>{current.icon}</div>
        <h3 className={`text-xl font-bold text-${current.color}-800`}>{current.title}</h3>
        <p className={`text-sm text-${current.color}-700 mt-2 mb-6 max-w-sm mx-auto`}>{current.message}</p>
        
        {status === 'approved' && (
            <button onClick={onDownload} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm hover:shadow-md">
                {isLoading ? 'Downloading...' : 'Download PDF'}
            </button>
        )}
        {status === 'rejected' && (
            <button onClick={onReset} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-sm hover:shadow-md">
                Upload New Proof
            </button>
        )}
      </div>
    );
};
  
export default Payment;