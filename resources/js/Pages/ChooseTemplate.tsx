import React, { useState } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

// Template list with names and descriptions
const templates = [
  { 
    id: 1, 
    name: 'classic',
    displayName: 'Classic',
    description: 'Soft neutral tones with refined typography for a sophisticated and professional feel.',
    category: 'simple'
  },
  { 
    id: 2, 
    name: 'modern',
    displayName: 'Modern',
    description: 'A visually striking resume template, perfect for illustrating the breadth and depth of your expertise.',
    category: 'modern'
  },
  { 
    id: 3, 
    name: 'creative',
    displayName: 'Creative',
    description: 'Includes a prominent profile image for a personal touch while maintaining professionalism.',
    category: 'professional'
  },
  { 
    id: 4, 
    name: 'elegant',
    displayName: 'Elegant',
    description: 'Clean and sophisticated design with elegant typography for a polished professional appearance.',
    category: 'professional'
  },
  { 
    id: 5, 
    name: 'professional',
    displayName: 'Professional',
    description: 'Classic professional layout optimized for ATS systems and traditional industries.',
    category: 'ats'
  },
  { 
    id: 6, 
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Clean and minimal design focusing on content with subtle visual elements.',
    category: 'simple'
  },
];

// Template image map
const templateImages: Record<number, string> = {
  1: "/images/templates/template1.png",
  2: "/images/templates/template2.png",
  3: "/images/templates/template3.jpg",
  4: "/images/templates/template4.jpg",
  5: "/images/templates/template5.jpg",
  6: "/images/templates/template6.jpg",
};

// Filter categories
const filterCategories = [
  { id: 'all', name: 'All Templates'},
  { id: 'favorites', name: 'Favorites'},
  { id: 'simple', name: 'Simple'},
  { id: 'modern', name: 'Modern'},
  { id: 'professional', name: 'Professional'},
  { id: 'ats', name: 'ATS'},
];

interface ChooseTemplateProps {
  hasPendingPayments?: boolean;
  pendingResumesCount?: number;
}

const ChooseTemplate: React.FC<ChooseTemplateProps> = ({ 
  hasPendingPayments = false, 
  pendingResumesCount = 0 
}) => {
  const { auth } = usePage().props as any;
  const user = auth.user;
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Check if this is an imported resume
  const urlParams = new URLSearchParams(window.location.search || '');
  const resumeId = urlParams.get('resume');
  const isImported = urlParams.get('imported') === 'true';

  const toggleFavorite = (templateId: number) => {
    setFavorites((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleTemplateSelect = async (templateName: string) => {
    if (isImported && resumeId) {
      // For imported resumes, update the template and redirect to builder
      try {
        const response = await fetch(`/resumes/${resumeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({
            template_name: templateName
          })
        });

        if (response.ok) {
          router.visit(`/builder?resume=${resumeId}`);
        } else {
          console.error('Failed to update template');
          // Fallback to builder anyway
          router.visit(`/builder?resume=${resumeId}`);
        }
      } catch (error) {
        console.error('Error updating template:', error);
        // Fallback to builder anyway
        router.visit(`/builder?resume=${resumeId}`);
      }
    } else {
      // Normal flow for new resumes
      router.visit(`/choose-resume-maker?template=${templateName}`);
    }
  };

  const filteredTemplates = currentFilter === "all" 
    ? templates 
    : currentFilter === "favorites"
    ? templates.filter(t => favorites.includes(t.id))
    : templates.filter(t => t.category === currentFilter);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Head title="CVeezy | Resume Templates" />

      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Logo
            size="sm"
            text="CVeezy"
            imageSrc="/images/supsoft-logo.jpg"
            imageAlt="CVeezy Logo"
            className="text-2xl font-bold text-gray-800 font-sans hover:scale-110 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
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
      <div className="flex-1 px-8 py-8">
        {/* Back Link */}
        <Link
          href={isImported ? "/uploader" : "/dashboard"}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">
            {isImported ? 'Back to Upload' : 'Back to Dashboard'}
          </span>
        </Link>

        {/* Header Section */}
        <div className="text-center mb-8">
          {hasPendingPayments && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-yellow-800 text-sm">
              ⚠️ You have {pendingResumesCount} pending payment(s). Please wait for admin approval before creating a new resume.
              </p>
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isImported ? 'Choose Your Template' : 'Resume templates'}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {isImported 
              ? 'Your resume has been imported! Now choose a template to style your content.'
              : 'Simple to use and ready in minutes resume templates — give it a try for free now!'
            }
          </p>
          {isImported ? (
            <button
              onClick={() => router.visit(`/builder?resume=${resumeId}`)}
              className="text-blue-600 underline hover:text-blue-800 text-sm"
            >
              Skip template selection
            </button>
          ) : (
            <Link
              href="/"
              className="text-blue-600 underline hover:text-blue-800 text-sm"
            >
              Choose later
            </Link>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-8 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCurrentFilter(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  currentFilter === category.id
                    ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-gray-400">
                No templates found for this category.
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 group ${
                  hasPendingPayments 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer hover:shadow-xl hover:scale-105'
                }`}
              >
                {/* Template Preview */}
                <div className="relative">
                  <img
                    src={templateImages[template.id]}
                    alt={`${template.displayName} Template`}
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Overlay with "Use This Template" button */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-300">
                    {!hasPendingPayments && (
                      <button
                        onClick={() => handleTemplateSelect(template.name)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-700"
                      >
                        {isImported ? 'Apply Template' : 'Use This Template'}
                      </button>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(template.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow-md transition-colors ${
                      favorites.includes(template.id) 
                        ? "text-red-500" 
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <svg className="w-5 h-5" fill={favorites.includes(template.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {template.displayName} Template
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {template.description}
                  </p>

                  {/* Color Options */}
                  <div className="flex space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-gray-300"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-300"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-gray-300"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-gray-300"></div>
                    <div className="w-6 h-6 rounded-full bg-teal-500 border-2 border-gray-300"></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                      PDF
                    </button>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                      DOCX
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChooseTemplate;
