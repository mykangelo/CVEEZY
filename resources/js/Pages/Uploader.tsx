import React, { useRef, useState } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

interface UploaderProps {
  hasPendingPayments?: boolean;
  pendingResumesCount?: number;
}

interface ParsedData {
  contact: any;
  experiences: any[];
  education: any[];
  skills: any[];
  summary: string;
}

interface QualityAssessment {
  overall_score: number;
  sections_found: string[];
  missing_sections: string[];
  confidence: 'low' | 'medium' | 'high';
  suggestions: string[];
}

const Uploader: React.FC<UploaderProps> = ({ 
  hasPendingPayments = false, 
  pendingResumesCount = 0 
}) => {
  const { auth } = usePage().props as any;
  const user = auth.user;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setSelectedFile(file);

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/plain', 'text/html'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF, DOC, DOCX, TXT, or HTML file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size must be less than 10MB.');
      return;
    }

    // Show preview
    await getParsingPreview(file);
  };

  const getParsingPreview = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume_file', file);

      const response = await fetch('/api/resume/preview', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setParsedData(result.preview_data);
        setQualityAssessment(result.quality_assessment);
        setShowPreview(true);
      } else {
        setUploadError(result.error || 'Failed to parse resume');
      }
    } catch (error) {
      console.error('Preview error:', error);
      setUploadError('An error occurred while processing your resume');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume_file', selectedFile);
      formData.append('template_name', 'classic'); // Default template

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to template selection page with the new resume
        router.visit(`/choose-template?resume=${result.resume_id}&imported=true`);
      } else {
        setUploadError(result.error || 'Failed to create resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('An error occurred while creating your resume');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setParsedData(null);
    setQualityAssessment(null);
    setShowPreview(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
            <div className="min-h-screen flex flex-col bg-white font-sans">
      <Head title="CVeezy | Improve Your Resume" />
      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between h-16 px-6 shadow-sm">
        <div className="flex items-center">
          <Link href={route('home')} aria-label="Go to homepage" className="inline-flex items-center">
            <Logo 
              size="sm"
              showText={false}
              className="text-2xl font-bold text-[#222] font-sans hover:scale-105 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="border border-[#354eab] text-[#354eab] font-semibold px-5 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
          >
            Contact us
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="bg-[#354eab] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#2d3f8f] transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-[#354eab] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#2d3f8f] transition"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {/* Go Back Link */}
        <button
          className="flex items-center text-[#354eab] cursor-pointer hover:underline w-fit mt-5 ml-5 text-md font-semibold gap-1"
          onClick={() => router.visit("/")}
        >
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Go Back
        </button>

        {/* Warning for pending payments */}
        {user && hasPendingPayments && (
          <div className="mx-auto max-w-3xl mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-yellow-800 font-semibold">Payment Under Review</span>
            </div>
            <p className="text-yellow-700 text-sm">
              You have {pendingResumesCount} resume(s) with pending payment reviews. Please wait for admin approval before creating new resumes.
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className="flex items-center justify-center pt-20 pb-24">
          <div className="w-full max-w-3xl">
            {uploadError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-semibold">Upload Error</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{uploadError}</p>
                <button 
                  onClick={resetUpload}
                  className="mt-2 text-red-600 underline text-sm hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            <div
              className={`border-2 border-dashed p-8 rounded-3xl bg-white shadow-md text-center transition-all duration-300 ${
                isUploading 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-400/80 hover:shadow-xl hover:cursor-pointer'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              tabIndex={0}
              aria-label="Drag and drop your resume here"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <h2 className="text-xl font-semibold mb-2">Processing your resume...</h2>
                  <p className="text-gray-600">Please wait while we extract your information</p>
                </div>
              ) : (
                <>
                  <svg className="mx-auto text-slate-400/70 mb-4" width="56" height="56" fill="none" viewBox="0 0 56 56">
                    <rect width="56" height="56" rx="12" fill="#f4faff"/>
                    <path d="M28 38V18M28 18l-7 7m7-7l7 7" stroke="#354eab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="16" y="38" width="24" height="2" rx="1" fill="#354eab"/>
                  </svg>
                  <h2 className="text-2xl font-semibold mb-1">Drag and drop your resume here</h2>
                  <p className="text-gray-400 mb-1">or</p>
                  <button
                    type="button"
                    className="bg-[#354eab] text-white px-6 py-2 rounded-md hover:bg-[#2d3f8f] transition duration-200 disabled:opacity-50"
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    disabled={isUploading}
                  >
                    Upload from device
                  </button>
                  <input
                    type="file"
                    accept=".docx,.pdf,.html,.txt,.doc,.htm"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <p className="text-gray-400 my-3">Files we can read: PDF, DOC, DOCX, HTML, TXT</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal show={showPreview} onClose={() => setShowPreview(false)} maxWidth="2xl">
          <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#354eab] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Resume Preview</h2>
                    <p className="text-sm text-gray-600">Review extracted information before creating</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">

              {selectedFile && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                                              <div className="w-12 h-12 bg-[#354eab] rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {qualityAssessment && (
                <div className="mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Parsing Quality Assessment</h3>
                        <p className="text-sm text-gray-600">Analysis of extracted resume information</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          qualityAssessment.confidence === 'high' ? 'bg-green-500' :
                          qualityAssessment.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium capitalize text-gray-900">
                          {qualityAssessment.confidence} Confidence
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-[#354eab] rounded-full"></div>
                        <span className="font-medium text-gray-900">
                          Score: {qualityAssessment.overall_score}%
                        </span>
                      </div>
                    </div>

                    {qualityAssessment.sections_found.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-sm font-medium text-green-700">Sections Found:</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {qualityAssessment.sections_found.map((section) => (
                            <span key={section} className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full capitalize border border-green-200">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {qualityAssessment.missing_sections.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium text-orange-700">Missing Sections:</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {qualityAssessment.missing_sections.map((section) => (
                            <span key={section} className="px-3 py-1.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full capitalize border border-orange-200">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {qualityAssessment.suggestions.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium text-[#354eab]">Suggestions:</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <ul className="text-sm text-gray-700 space-y-2">
                            {qualityAssessment.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-[#354eab] rounded-full mt-2 flex-shrink-0"></div>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {parsedData && (
                <div className="mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Extracted Information Preview</h3>
                        <p className="text-sm text-gray-600">Information successfully extracted from your resume</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <h4 className="font-semibold text-gray-900">Contact Information</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium text-gray-900">
                              {parsedData.contact?.firstName || parsedData.contact?.lastName 
                                ? `${parsedData.contact?.firstName || ''} ${parsedData.contact?.lastName || ''}`.trim()
                                : 'Not found'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900">{parsedData.contact?.email || 'Not found'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-gray-900">{parsedData.contact?.phone || 'Not found'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                          <h4 className="font-semibold text-gray-900">Summary</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {parsedData.summary || 'No summary found'}
                        </p>
                      </div>

                      {/* Experience */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          <h4 className="font-semibold text-gray-900">Experience ({parsedData.experiences?.length || 0})</h4>
                        </div>
                        <div className="space-y-2">
                          {parsedData.experiences?.slice(0, 2).map((exp, index) => (
                            <div key={index} className="text-sm">
                              <p className="font-medium text-gray-900">{exp.jobTitle || 'Job Title'}</p>
                              <p className="text-gray-600">{exp.company || 'Company'}</p>
                            </div>
                          )) || <p className="text-sm text-gray-600">No experience found</p>}
                          {(parsedData.experiences?.length || 0) > 2 && (
                            <p className="text-xs text-gray-500">+{(parsedData.experiences?.length || 0) - 2} more</p>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#354eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h4 className="font-semibold text-gray-900">Skills ({parsedData.skills?.length || 0})</h4>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {parsedData.skills?.slice(0, 6).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                              {skill.name || skill}
                            </span>
                          )) || <p className="text-sm text-gray-600">No skills found</p>}
                          {(parsedData.skills?.length || 0) > 6 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                              +{(parsedData.skills?.length || 0) - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You can edit all information after creating the resume</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpload}
                  disabled={isUploading}
                  className="px-6 py-2 bg-[#354eab] text-white rounded-lg hover:bg-[#2d3f8f] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isUploading ? 'Creating Resume...' : 'Create Resume'}
                </button>
              </div>
            </div>
            </div>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
};

export default Uploader; 