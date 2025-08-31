import React, { useState } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";
import LoadingSpinner from "@/Components/LoadingSpinner";

interface ChooseResumeMakerProps {
  hasPendingPayments?: boolean;
  pendingResumesCount?: number;
}

const ChooseResumeMaker: React.FC<ChooseResumeMakerProps> = ({ 
  hasPendingPayments = false, 
  pendingResumesCount = 0 
}) => {
  const { auth } = usePage().props as any;
  const user = auth.user;
  const [isLoading, setIsLoading] = useState(false);
  
  // Get template name from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateName = urlParams.get('template') || 'classic';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f8faff] to-[#e0eaff] font-sans relative overflow-hidden flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#354eab]/10 to-[#4a5fc7]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#5a6fd7]/10 to-[#354eab]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#4a5fc7]/5 to-[#5a6fd7]/5 rounded-full blur-3xl"></div>
      </div>
      <Head title="CVeezy | How will you make your resume?" />
      {isLoading && <LoadingSpinner text="Processing..." />}
      

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 relative z-10">
        {/* Clean Blue Button Style */}
        <Link
          href="/choose-template"
          className="inline-flex items-center gap-3 bg-[#354eab] hover:bg-[#4a5fc7] text-white px-6 py-3 rounded-full transition-all duration-300 mb-8 text-sm font-bold shadow-md hover:shadow-lg group"
        >
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Templates
        </Link>

        {/* Compact Title Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#354eab] mb-3 sm:mb-4 drop-shadow-sm">
              How will you make your resume?
            </h1>
            <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
              Choose your preferred approach
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Whether you have an existing resume to improve or want to start fresh, we've got you covered.
            </p>
          </div>
        </div>

        {/* Warning for pending payments */}
        {user && hasPendingPayments && (
          <div className="mb-8 sm:mb-10 lg:mb-12 p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-md border border-yellow-200/30 rounded-2xl sm:rounded-3xl max-w-lg mx-auto shadow-xl shadow-yellow-200/20 mx-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
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

        {/* Compact Option Cards */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12 px-4">
          {/* Upload Resume Card */}
          <div
            className={`bg-white/95 backdrop-blur-sm border-2 border-[#bcd6f6] p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg relative w-full max-w-xs sm:max-w-sm lg:max-w-md min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] flex flex-col items-center transition-all duration-300 group ${
              hasPendingPayments 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:shadow-xl hover:border-[#9bc4f0] hover:-translate-y-2 hover:bg-blue-50/30'
            }`}
            onClick={() => {
              if (hasPendingPayments) return;
              if (user) {
                router.visit("/uploader");
              } else {
                router.visit("/login?redirect=/uploader");
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Upload your existing resume to make quick edits"
            onKeyDown={e => { 
              if (e.key === 'Enter' || e.key === ' ') {
                if (hasPendingPayments) return;
                if (user) {
                  router.visit('/uploader');
                } else {
                  router.visit('/login?redirect=/uploader');
                }
              }
            }}
          >

            {/* Compact Icon Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 shadow-md">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800 text-center group-hover:text-blue-600 transition-colors duration-300">I already have a resume</h2>
            <p className="text-gray-600 text-xs sm:text-sm text-center mb-3 sm:mb-4 leading-relaxed px-2 sm:px-3">
              Upload and enhance your existing resume with AI-powered improvements
            </p>
            
            {/* Feature highlights */}
            <div className="w-full mt-auto">
              <div className="bg-blue-50/60 rounded-xl p-2 sm:p-3 text-center group-hover:bg-blue-100/60 transition-all duration-300">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-blue-700 font-medium text-xs">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI-Powered Analysis
                </div>
              </div>
            </div>
            

            
            {!user && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Login required
                </span>
              </div>
            )}
          </div>

          {/* Start from Scratch Card */}
          <div
            className={`bg-white/95 backdrop-blur-sm border-2 border-[#f6c6d6] p-6 sm:p-8 lg:p-8 rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm lg:max-w-md min-h-[180px] sm:min-h-[200px] lg:min-h-[200px] flex flex-col items-center transition-all duration-300 group ${
              hasPendingPayments 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:shadow-xl hover:border-[#f0a8c0] hover:-translate-y-2 hover:bg-pink-50/30'
            }`}
            onClick={() => {
              if (hasPendingPayments) return;
              setIsLoading(true);
              if (user) {
                router.visit(`/builder?template=${templateName}`);
              } else {
                router.visit(`/login?redirect=/builder?template=${templateName}`);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Start from scratch with AI guidance"
            onKeyDown={e => { 
              if (e.key === 'Enter' || e.key === ' ') {
                if (hasPendingPayments) return;
                setIsLoading(true);
                if (user) {
                  router.visit(`/builder?template=${templateName}`);
                } else {
                  router.visit(`/login?redirect=/builder?template=${templateName}`);
                }
              }
            }}
          >
            {/* Compact Icon Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300 shadow-md">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600 group-hover:text-pink-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800 text-center group-hover:text-pink-600 transition-colors duration-300">Start from scratch</h2>
            <p className="text-gray-600 text-xs sm:text-sm text-center mb-3 sm:mb-4 leading-relaxed px-2 sm:px-3">
              Create a professional resume from the ground up with our AI guidance
            </p>
            
            {/* Feature highlights */}
            <div className="w-full mt-auto">
              <div className="bg-pink-50/60 rounded-xl p-2 sm:p-3 text-center group-hover:bg-pink-100/60 transition-all duration-300">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-pink-700 font-medium text-xs">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Professional Builder
                </div>
              </div>
            </div>
            

            
            {!user && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Login required
                </span>
              </div>
            )}
          </div>
        </div>


      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChooseResumeMaker; 