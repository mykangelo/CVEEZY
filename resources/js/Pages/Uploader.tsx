import React, { useRef } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

const Uploader: React.FC = () => {
  const { auth } = usePage().props as any;
  const user = auth.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Handle file upload here
      // Example: uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Handle file upload here
      // Example: uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-serif">
      <Head title="CVeezy | Improve Your Resume" />
      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
        <div className="flex items-center">
          <Logo 
            size="sm"
            text="CVeezy"
            imageSrc="/images/supsoft-logo.jpg"
            imageAlt="CVeezy Logo"
            className="text-2xl font-bold text-[#222] font-sans hover:scale-110 hover:drop-shadow-lg  focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
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

      <main className="flex-grow">
        {/* Go Back Link */}
        <button
          className="flex items-center text-[#2196f3] cursor-pointer hover:underline w-fit mt-5 ml-5 text-md font-semibold gap-1"
          onClick={() => router.visit("/")}
        >
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Go Back
        </button>

        {/* Upload Section */}
        <div className="flex items-center justify-center pt-20 pb-24">
          <div
            className="w-full max-w-3xl border-2 border-dashed border-slate-400/80 p-8 rounded-3xl bg-white shadow-md text-center transition-all duration-300 hover:shadow-xl hover:cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            tabIndex={0}
            aria-label="Drag and drop your resume here"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto text-slate-400/70 mb-4" width="56" height="56" fill="none" viewBox="0 0 56 56"><rect width="56" height="56" rx="12" fill="#f4faff"/><path d="M28 38V18M28 18l-7 7m7-7l7 7" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="16" y="38" width="24" height="2" rx="1" fill="#2196f3"/></svg>
            <h2 className="text-2xl font-semibold mb-1">Drag and drop your resume here</h2>
            <p className="text-gray-400 mb-1">or</p>
            <button
              type="button"
              className="bg-[#2196f3] text-white px-6 py-2 rounded-md hover:bg-[#1976d2] transition duration-200"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Upload from device
            </button>
            <input
              type="file"
              accept=".docx,.pdf,.html,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <p className="text-gray-400 my-3">Files we can read: DOCX, PDF, HTML, TXT</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Uploader; 