import React from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

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
  
  // Get template name from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateName = urlParams.get('template') || 'classic';
  
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Head title="CVeezy | How will you make your resume?" />
      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between h-16 px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Back Button */}

          
          <div className="flex items-center">
            <Link href={route('home')} aria-label="Go to homepage" className="inline-flex items-center">
              <Logo 
                size="sm"
                showText={false}
                className="text-2xl font-bold text-[#222] font-sans hover:scale-105 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
              />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="border border-[#2196f3] text-[#2196f3] font-semibold px-5 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
          >
            Contact us
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="bg-[#2196f3] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#1976d2] transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-[#2196f3] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#1976d2] transition"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
        <Link
          href="/choose-template"
          className=" mt-8 ml-10 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
           </svg>
          <span className="text-sm font-medium">Back to Templates</span>
        </Link>

      <main className="flex-grow px-4 py-6 flex flex-col items-center">

        {/* Title */}
        <h1 className="text-center text-3xl md:text-4xl font-bold mb-10 text-gray-700">
          How will you make your resume?
        </h1>

        {/* Warning for pending payments */}
        {user && hasPendingPayments && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl">
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

        {/* Option Cards */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {/* Upload Resume Card */}
          <div
            className={`bg-white border border-[#bcd6f6] p-8 rounded-xl shadow-md relative w-80 min-h-[220px] flex flex-col items-center transition group ${
              hasPendingPayments 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:shadow-lg'
            }`}
            onClick={() => {
              if (hasPendingPayments) {
                return; // Do nothing if pending payments
              }
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
                if (hasPendingPayments) {
                  return; // Do nothing if pending payments
                }
                if (user) {
                  router.visit('/uploader');
                } else {
                  router.visit('/login?redirect=/uploader');
                }
              }
            }}
          >
            <img src="/images/AlreadyIcon" alt="Upload Resume" className="w-20 h-16 mb-4" />
            <h2 className="text-lg font-bold mb-1 text-gray-700">I already have a resume</h2>
            <p className="text-[#1a3c6c] text-base mb-2 text-center">Upload your existing resume to make quick edits</p>
            {!user && (
              <p className="text-xs text-orange-600 mt-2 text-center">Login required to continue</p>
            )}
          </div>

          {/* Start from Scratch Card */}
          <div
            className={`bg-white border border-[#f6c6d6] p-8 rounded-xl shadow-md w-80 min-h-[220px] flex flex-col items-center transition group ${
              hasPendingPayments 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:shadow-lg'
            }`}
            onClick={() => {
              if (hasPendingPayments) {
                return; // Do nothing if pending payments
              }
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
                if (hasPendingPayments) {
                  return; // Do nothing if pending payments
                }
                if (user) {
                  router.visit(`/builder?template=${templateName}`);
                } else {
                  router.visit(`/login?redirect=/builder?template=${templateName}`);
                }
              }
            }}
          >
            <img src="/images/ScratchIcon" alt="Start from Scratch" className="w-20 h-16 mb-4" />
            <h2 className="text-lg font-bold mb-1 text-gray-700">Start from scratch</h2>
            <p className="text-[#1a3c6c] text-base mb-2 text-center">Our AI will guide you through creating a resume</p>
            {!user && (
              <p className="text-xs text-orange-600 mt-2 text-center">Login required to continue</p>
            )}
          </div>
        </div>

        {/* Testimonial */}
        <blockquote className="text-center text-sm italic text-gray-500 max-w-2xl mt-8 px-4">
          "I tried other tools but Resume Builder was the easiest. I could edit everything fast and download my resume. The paid version is worth it for more formats."
        </blockquote>
      </main>

      {/* Footer always visible */}
      <Footer />
    </div>
  );
};

export default ChooseResumeMaker; 