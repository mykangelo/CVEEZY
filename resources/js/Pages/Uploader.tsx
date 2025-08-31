import React, { useRef, useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

// Custom CSS animations
const customStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 0.6s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.6s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scale-in 0.6s ease-out forwards;
  }
`;
 

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
  const [templateName, setTemplateName] = useState<string>('classic');
  const [activeTab, setActiveTab] = useState<string>('overview');
  

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
        setActiveTab('overview');
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
      formData.append('template_name', templateName);

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
    setActiveTab('overview');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* AI Status Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800 text-sm">AI Processing Notice</h4>
                  <p className="text-amber-700 text-xs">Processed using Google Gemini AI. Daily quota limits apply. Process during off-peak hours for optimal results.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    qualityAssessment?.confidence === 'high' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {qualityAssessment?.confidence === 'high' ? '✅ Available' : '⚠️ Fallback'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Score & Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray={`${qualityAssessment?.overall_score || 0}, 100`} strokeDashoffset="25"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-700">{qualityAssessment?.overall_score || 0}%</span>
                  </div>
                </div>
                <h4 className="font-semibold text-blue-800 text-sm">Overall Score</h4>
              </div>

              {/* Sections Found */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-green-800 text-sm">Found ({qualityAssessment?.sections_found.length || 0})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {qualityAssessment?.sections_found.map((section, index) => (
                    <span key={section} className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-lg border border-green-200">
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Sections */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-amber-800 text-sm">Missing ({qualityAssessment?.missing_sections.length || 0})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {qualityAssessment?.missing_sections.map((section, index) => (
                    <span key={section} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg border border-amber-200">
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Name</h4>
                </div>
                <p className="text-gray-700 font-medium">
                  {parsedData?.contact?.firstName || parsedData?.contact?.lastName 
                    ? `${parsedData.contact?.firstName || ''} ${parsedData.contact?.lastName || ''}`.trim()
                    : 'Not found'
                  }
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                </div>
                <p className="text-gray-700 font-medium break-all">
                  {parsedData?.contact?.email || 'Not found'}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Phone</h4>
                </div>
                <p className="text-gray-700 font-medium">
                  {parsedData?.contact?.phone || 'Not found'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {parsedData?.experiences && parsedData.experiences.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {parsedData.experiences.map((exp, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">{exp.jobTitle || 'Job Title'}</h4>
                        <p className="text-blue-600 font-medium mb-2">{exp.company || 'Company'}</p>
                        {exp.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No experience information found</p>
                <p className="text-gray-400 text-sm">The AI couldn't extract work experience from your resume</p>
              </div>
            )}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            {parsedData?.skills && parsedData.skills.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Skills ({parsedData.skills.length})</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {parsedData.skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:scale-105 transition-all duration-200">
                      {skill.name || skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No skills information found</p>
                <p className="text-gray-400 text-sm">The AI couldn't extract skills from your resume</p>
              </div>
            )}
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            {parsedData?.summary ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Professional Summary</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">{parsedData.summary}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No summary found</p>
                <p className="text-gray-400 text-sm">The AI couldn't extract a professional summary from your resume</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f0f4ff] via-[#f8faff] to-[#e0eaff] font-sans relative overflow-hidden">
      <Head title="CVeezy | Improve Your Resume" />
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] 2xl:w-[32rem] 2xl:h-[32rem] bg-gradient-to-r from-[#4a5fc7]/5 to-[#5a6fd7]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] 2xl:w-[32rem] 2xl:h-[32rem] bg-gradient-to-r from-[#4a5fc7]/5 to-[#5a6fd7]/5 rounded-full blur-3xl"></div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[10000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#354eab]/20 border-t-[#354eab] mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900">Processing....</h2>
            <p className="mt-2 text-gray-700 max-w-xl">Please wait while our artificial intelligence processes the information from your resume and selects the right fields</p>
          </div>
        </div>
      )}


      <main className="flex-grow">
        {/* Clean Blue Button Style */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10 xl:py-12">
          <Link
            href="/choose-resume-maker"
            className="inline-flex items-center gap-3 bg-[#354eab] hover:bg-[#4a5fc7] text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full transition-all duration-300 mb-6 sm:mb-8 lg:mb-10 text-xs sm:text-sm lg:text-base font-bold shadow-md hover:shadow-lg group"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Choose Option
          </Link>
        </div>

        {/* Warning for pending payments */}
        {user && hasPendingPayments && (
          <div className="mx-auto max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mb-6 sm:mb-8 lg:mb-10 p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-md border border-yellow-200/30 rounded-2xl shadow-xl shadow-yellow-200/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm sm:text-lg">⚠️</span>
              </div>
              <span className="text-yellow-800 font-bold text-base sm:text-lg">Payment Pending</span>
            </div>
            <p className="text-yellow-700 text-xs sm:text-sm leading-relaxed text-center">
              {pendingResumesCount} resume(s) awaiting payment approval. Please wait for confirmation.
            </p>
          </div>
        )}

        {/* Enhanced Title Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16 relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-[#354eab] mb-4 sm:mb-6 lg:mb-8 drop-shadow-sm">
              Improve Your Resume
            </h1>
            <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 lg:mb-6">
              Upload your existing resume and let AI enhance it
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed">
              Our AI-powered system will analyze your resume, extract key information, and help you create a professional, optimized version that stands out to employers.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="flex items-center justify-center pb-8 sm:pb-12 lg:pb-16 xl:pb-20">
          <div className="w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            {uploadError && (
              <div className="mb-6 sm:mb-8 lg:mb-10 p-4 sm:p-6 lg:p-8 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-red-800 font-bold text-base sm:text-lg">Upload Error</span>
                </div>
                <p className="text-red-700 text-xs sm:text-sm leading-relaxed text-center mb-3 sm:mb-4">{uploadError}</p>
                <button 
                  onClick={resetUpload}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            <div
              className={`border-2 border-dashed p-6 sm:p-8 lg:p-10 xl:p-12 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-sm shadow-lg text-center transition-all duration-300 ${
                isUploading 
                  ? 'border-[#354eab] bg-blue-50/50' 
                  : 'border-[#bcd6f6] hover:shadow-2xl hover:cursor-pointer hover:border-[#9bc4f0] hover:bg-white/98'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              tabIndex={0}
              aria-label="Drag and drop your resume here"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">Processing your resume...</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Please wait while we extract your information</p>
                </div>
              ) : (
                <>
                  <svg className="mx-auto text-slate-400/70 mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" fill="none" viewBox="0 0 48 48">
                    <rect width="48" height="48" rx="12" fill="#f4faff"/>
                    <path d="M24 32V16M24 16l-6 6m6-6l6 6" stroke="#354eab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="32" width="20" height="2" rx="1" fill="#354eab"/>
                  </svg>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-1">Drag and drop your resume here</h2>
                  <p className="text-gray-400 mb-1 text-sm sm:text-base">or</p>
                  <button
                    type="button"
                    className="bg-[#354eab] hover:bg-[#4a5fc7] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
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
                  <p className="text-gray-400 my-2 sm:my-3 text-xs sm:text-sm">Files we can read: PDF, DOC, DOCX, HTML, TXT</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compact Preview Modal - Landscape Layout without Tabs */}
        <Modal show={showPreview} onClose={() => setShowPreview(false)} maxWidth="lg">
          <div className="bg-gray-100 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out animate-fade-in border-4 border-[#354eab]">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#354eab] rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Resume Preview</h2>
                    <p className="text-gray-600 text-xs">Review extracted information before creating your resume</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-7 h-7 bg-white/80 hover:bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Compact File Info */}
            {selectedFile && (
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-3 h-3 bg-[#354eab] rounded flex items-center justify-center">
                    <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">{selectedFile.name}</span>
                  <span>•</span>
                  <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{selectedFile.type}</span>
                </div>
              </div>
            )}

            {/* Main Content - Compact Landscape Layout */}
            <div className="p-2">
              {/* AI Status Banner - Compact */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-700 text-xs">Processed using Google Gemini AI. Daily quota limits apply.</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    qualityAssessment?.confidence === 'high' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {qualityAssessment?.confidence === 'high' ? '✅ Available' : '⚠️ Fallback'}
                  </span>
                </div>
              </div>

              {/* Quality Assessment Row */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {/* Overall Score */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 animate-scale-in">
                  <div className="w-14 h-14 mx-auto mb-1 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray={`${qualityAssessment?.overall_score || 0}, 100`} strokeDashoffset="25" className="animate-dash"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700 animate-fade-in">{qualityAssessment?.overall_score || 0}%</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-blue-800 text-xs">Overall Score</h4>
                </div>

                {/* Sections Found */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 hover:scale-105 hover:shadow-lg transition-all duration-300 animate-slide-in-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 bg-green-500 rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-green-800 text-xs">Found ({qualityAssessment?.sections_found.length || 0})</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {qualityAssessment?.sections_found.map((section, index) => (
                      <span key={section} className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-md border border-green-200 hover:scale-110 hover:bg-green-200 transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        {section}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Sections */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-2 hover:scale-105 hover:shadow-lg transition-all duration-300 animate-slide-in-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 bg-amber-500 rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-amber-800 text-xs">Missing ({qualityAssessment?.missing_sections.length || 0})</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {qualityAssessment?.missing_sections.map((section, index) => (
                      <span key={section} className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-md border border-amber-200 hover:scale-110 hover:bg-amber-200 transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extracted Information - Compact Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Contact Information */}
                                                    <div className="bg-white border border-gray-200 rounded-lg p-1.5 hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-fade-in">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                        <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Contact</h4>
                    </div>
                    <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {parsedData?.contact?.firstName || parsedData?.contact?.lastName 
                          ? `${parsedData.contact?.firstName || ''} ${parsedData.contact?.lastName || ''}`.trim()
                          : 'Not found'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900 max-w-[120px] text-right break-all">
                        {parsedData?.contact?.email || 'Not found'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">
                        {parsedData?.contact?.phone || 'Not found'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-1.5 hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-fade-in">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                      <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Summary</h4>
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {parsedData?.summary || 'No summary found'}
                  </p>
                </div>

                {/* Experience */}
                <div className="bg-white border border-gray-200 rounded-lg p-1.5 hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-fade-in">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                      <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Experience ({parsedData?.experiences?.length || 0})</h4>
                  </div>
                  <div className="space-y-1.5">
                                         {parsedData?.experiences?.slice(0, 2).map((exp, index) => (
                       <div key={index} className="text-xs">
                         <p className="font-semibold text-gray-900">{exp.jobTitle || 'Job Title'}</p>
                         <p className="text-blue-600">{exp.company || 'Company'}</p>
                       </div>
                     )) || <p className="text-gray-500 text-xs">No experience found</p>}
                     {(parsedData?.experiences && parsedData.experiences.length > 2) && (
                       <p className="text-xs text-blue-600 font-medium">+{(parsedData.experiences.length - 2)} more</p>
                     )}
                  </div>
                </div>

                                {/* Skills */}
                <div className="bg-white border border-gray-200 rounded-lg p-1.5 hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-fade-in">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                      <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Skills ({parsedData?.skills?.length || 0})</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {parsedData?.skills?.slice(0, 4).map((skill, index) => (
                      <span key={index} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200 hover:scale-110 hover:bg-blue-100 transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        {skill.name || skill}
                      </span>
                    )) || <p className="text-gray-500 text-xs">No skills found</p>}
                    {(parsedData?.skills && parsedData.skills.length > 4) && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:scale-105 transition-all duration-200">
                        +{(parsedData.skills.length - 4)} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Action Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>💡 You can edit all information after creating the resume</span>
                <span>•</span>
                <span>🔄 AI quota resets daily at midnight UTC</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetUpload}
                  className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:scale-105 hover:shadow-md transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#354eab] text-white rounded-lg hover:bg-[#2d3f8f] hover:scale-105 hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
                >
                  {isUploading && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  )}
                  {isUploading ? 'Creating...' : 'Create Resume'}
                </button>
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