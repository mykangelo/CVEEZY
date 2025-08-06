import React from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

const ChooseResumeMaker: React.FC = () => {
  const { auth } = usePage().props as any;
  const user = auth.user;
  
  // Get template ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('template') || '1';
  
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Head title="CVeezy | How will you make your resume?" />
      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Back Button */}

          
          <Logo 
            size="sm"
            text="CVeezy"
            imageSrc="/images/supsoft-logo.jpg"
            imageAlt="CVeezy Logo"
            className="text-2xl font-bold text-gray-800 font-sans hover:scale-110 hover:drop-shadow-lg  focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="border border-[#2196f3] text-[#2196f3] font-semibold px-6 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
          >
            Contact us
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="bg-[#2196f3] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1976d2] transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-[#2196f3] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1976d2] transition"
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

        {/* Option Cards */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {/* Upload Resume Card */}
          <div
            className="bg-white border border-[#bcd6f6] p-8 rounded-xl shadow-md cursor-pointer relative w-80 min-h-[220px] flex flex-col items-center hover:shadow-lg transition group"
            onClick={() => router.visit("/uploader")}
            tabIndex={0}
            role="button"
            aria-label="Upload your existing resume to make quick edits"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.visit('/uploader'); }}
          >
            <img src="/images/AlreadyIcon" alt="Upload Resume" className="w-20 h-16 mb-4" />
            <h2 className="text-lg font-bold mb-1 text-gray-700">I already have a resume</h2>
            <p className="text-[#1a3c6c] text-base mb-2 text-center">Upload your existing resume to make quick edits</p>
          </div>

          {/* Start from Scratch Card */}
          <div
            className="bg-white border border-[#f6c6d6] p-8 rounded-xl shadow-md cursor-pointer w-80 min-h-[220px] flex flex-col items-center hover:shadow-lg transition group"
            onClick={() => router.visit(`/builder?template=${templateId}`)}
            tabIndex={0}
            role="button"
            aria-label="Start from scratch with AI guidance"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.visit(`/builder?template=${templateId}`); }}
          >
            <img src="/images/ScratchIcon" alt="Start from Scratch" className="w-20 h-16 mb-4" />
            <h2 className="text-lg font-bold mb-1 text-gray-700">Start from scratch</h2>
            <p className="text-[#1a3c6c] text-base mb-2 text-center">Our AI will guide you through creating a resume</p>
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