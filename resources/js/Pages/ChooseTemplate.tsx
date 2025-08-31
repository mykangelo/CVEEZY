import React, { useState } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

// Template list with names and descriptions
const templates = [
  {
    id: 1,
    name: 'professional',
    displayName: 'Professional',
    description: '• ATS-optimized design for maximum compatibility\n• Clean, structured layout perfect for corporate roles\n• Clear section separation and professional typography\n• Industry-standard formatting for traditional sectors\n• Ideal for finance, healthcare, and manufacturing',
    category: 'ats'
  },
  {
    id: 2,
    name: 'classic',
    displayName: 'Classic',
    description: '• Timeless and sophisticated design approach\n• Refined typography with neutral color scheme\n• Elegant spacing and professional layout\n• Subtle visual elements conveying reliability\n• Perfect for executives and conservative industries',
    category: 'simple'
  },
  {
    id: 3,
    name: 'creative',
    displayName: 'Creative',
    description: '• Modern design with personal profile image\n• Creative layout elements and visual hierarchy\n• Engaging presentation showcasing personality\n• Maintains professional standards\n• Excellent for creative industries and marketing',
    category: 'professional'
  },
  {
    id: 4,
    name: 'minimal',
    displayName: 'Minimal',
    description: '• Clean, content-focused design approach\n• Maximum readability with generous white space\n• Clear typography and streamlined layout\n• Subtle visual elements for modern appeal\n• Perfect for tech roles and minimalist professionals',
    category: 'simple'
  },
  {
    id: 5,
    name: 'elegant',
    displayName: 'Elegant',
    description: '• Premium design with sophisticated typography\n• Refined visual elements and elegant spacing\n• Professional color palette and polished layout\n• Conveys sophistication and attention to detail\n• Ideal for executive and consulting positions',
    category: 'professional'
  },
  {
    id: 6,
    name: 'modern',
    displayName: 'Modern',
    description: '• Contemporary design with bold visual impact\n• Innovative layout structure and modern typography\n• Dynamic spacing and creative elements\n• Showcases innovation and forward-thinking\n• Perfect for tech, design, and creative roles',
    category: 'modern'
  },
];

// Template image map
const templateImages: Record<number, string> = {
  1: "/images/templates/professional.png",
  2: "/images/templates/classic.png",
  3: "/images/templates/creative.jpg",
  4: "/images/templates/minimal.jpg",
  5: "/images/templates/elegant.jpg",
  6: "/images/templates/modern.jpg",
};

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
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);

  // Check if this is an imported resume
  const urlParams = new URLSearchParams(window.location.search || '');
  const resumeId = urlParams.get('resume');
  const isImported = urlParams.get('imported') === 'true';

  const handleTemplateSelect = async (templateName: string) => {
    if (isImported && resumeId) {
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
          router.visit(`/builder?resume=${resumeId}`);
        }
      } catch (error) {
        router.visit(`/builder?resume=${resumeId}`);
      }
    } else {
      router.visit(`/choose-resume-maker?template=${templateName}`);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f8faff] to-[#e0eaff] font-sans relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-br from-[#354eab]/10 to-[#4a5fc7]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-tr from-[#5a6fd7]/10 to-[#354eab]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-r from-[#4a5fc7]/5 to-[#5a6fd7]/5 rounded-full blur-3xl"></div>
        </div>
        <Head title="CVeezy | Templates" />



        {/* Main Content - Full Screen Gallery */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 xl:py-10 w-full overflow-hidden">
          {/* Clean Blue Button Style */}
          <Link
            href={isImported ? "/uploader" : "/dashboard"}
            className="inline-flex items-center gap-2 sm:gap-3 bg-[#354eab] hover:bg-[#4a5fc7] text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full transition-all duration-300 mb-6 sm:mb-8 lg:mb-10 text-xs sm:text-sm lg:text-base font-bold shadow-md hover:shadow-lg group"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            {isImported ? 'Back to Upload' : 'Back to Dashboard'}
          </Link>

          {/* Enhanced Header Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20 relative z-10">
            {hasPendingPayments && (
              <div className="mb-6 sm:mb-8 lg:mb-10 p-3 sm:p-4 lg:p-6 xl:p-8 bg-white/80 backdrop-blur-md border border-yellow-200/30 rounded-xl sm:rounded-2xl lg:rounded-3xl max-w-sm sm:max-w-lg mx-auto shadow-xl shadow-yellow-200/20 mx-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs sm:text-sm lg:text-lg">⚠️</span>
                  </div>
                  <span className="text-yellow-800 font-bold text-sm sm:text-base lg:text-lg">Payment Pending</span>
                </div>
                <p className="text-yellow-700 text-xs sm:text-sm leading-relaxed text-center">
                  {pendingResumesCount} resume(s) awaiting payment approval. Please wait for confirmation.
                </p>
              </div>
            )}
            
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <div className="relative inline-block">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-[#354eab] mb-4 sm:mb-6 lg:mb-8 drop-shadow-sm">
                  {isImported ? 'Choose Template' : 'Resume Templates'}
                </h1>
              </div>
              
              <p className="text-gray-700 text-sm sm:text-base lg:text-xl xl:text-2xl max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed font-medium px-4">
                {isImported
                  ? 'Select a template to style your imported resume and make it stand out from the crowd.'
                  : 'Professional templates designed for every industry and career level. Create your perfect resume in minutes with our AI-powered builder.'
                }
              </p>
            </div>
            
            {isImported && (
              <div className="flex justify-center">
                <button
                  onClick={() => router.visit(`/builder?resume=${resumeId}`)}
                  className="inline-flex items-center gap-3 text-[#354eab] hover:text-[#4a5fc7] text-sm px-6 py-3 rounded-xl hover:bg-white/60 hover:shadow-lg transition-all duration-300 font-semibold backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Skip template selection
                </button>
              </div>
            )}
          </div>

          {/* Responsive Card-Style Template Gallery */}
          <div className="flex justify-center px-4 overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 w-full max-w-8xl">
              {templates.map((template, index) => (
                <div 
                  key={template.id} 
                  className="animate-fade-in flex justify-center"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Individual Card Design */}
                  <div 
                    className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl aspect-[7/9] bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:border hover:border-[#354eab]"
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                                         {/* Top Card Section - Template Image */}
                     <div 
                       className="bg-white rounded-t-xl sm:rounded-t-2xl overflow-hidden h-[90%]"
                     >
                       <div className="w-full h-full flex items-center justify-center p-1">
                         <img
                           src={templateImages[template.id]}
                           alt={`${template.displayName} Template`}
                           className="w-full h-full object-contain object-center"
                         />
                       </div>
                     </div>
                    
                                         {/* Bottom Card Section - Template Info */}
                     <div 
                       className={`bg-gradient-to-br from-[#354eab] via-[#4a5fc7] to-[#5a6fd7] rounded-b-2xl relative transition-all duration-300 ease-in-out shadow-lg ${
                         hoveredTemplate === template.id ? 'h-[65%] -mt-[70%] shadow-2xl scale-[1.05]' : 'h-[20%] -mt-[10%]'
                       }`}
                       style={{ bottom: 0 }}
                     >
                       {/* Enhanced curved separator edge */}
                       <div className={`absolute top-0 left-0 w-full h-10 bg-white transition-all duration-300 ease-in-out ${
                         hoveredTemplate === template.id ? 'rounded-b-full shadow-md' : 'rounded-b-full transform -translate-y-1/2 shadow-sm'
                       }`}></div>
                       
                       {/* Subtle inner glow effect */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-b-2xl"></div>
                       
                       {/* Enhanced hover overlay effect */}
                       {hoveredTemplate === template.id && (
                         <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent rounded-b-2xl animate-pulse"></div>
                       )}
                      
                      {/* Card Content */}
                      <div className="pt-2 px-3 sm:px-4 flex flex-col justify-center items-center text-white h-full relative z-10">
                        <span className={`font-bold text-xl sm:text-2xl lg:text-3xl mb-2 text-center drop-shadow-sm transition-all duration-300 ${
                          hoveredTemplate === template.id ? 'text-2xl sm:text-3xl lg:text-4xl mb-2' : ''
                        }`}>
                          {template.displayName}
                        </span>
                        
                        {/* Description and Button - Only visible on hover */}
                        <div 
                          className={`transition-all duration-300 ease-in-out transform ${
                            hoveredTemplate === template.id 
                              ? 'opacity-100 translate-y-0 max-h-28 sm:max-h-32 lg:max-h-40' 
                              : 'opacity-0 translate-y-2 max-h-0 overflow-hidden'
                          }`}
                        >
                          {/* Description */}
                          <div className="mb-2 sm:mb-3 px-1">
                            <div className="text-sm sm:text-base text-center opacity-90 leading-tight drop-shadow-sm">
                              {template.description.split('\n').map((line, index) => (
                                <div key={index} className="mb-1">
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          {!hasPendingPayments && (
                            <div className="flex justify-center w-full">
                              <button
                                onClick={() => handleTemplateSelect(template.name)}
                                className="text-xs sm:text-sm font-medium text-white bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 hover:bg-white hover:text-[#354eab] transition-all duration-400 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-2xl hover:border-white/60"
                              >
                                {isImported ? 'Apply Template' : 'Use This Template'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          {!hasPendingPayments && (
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-[#354eab]/5 to-[#4a5fc7]/5 rounded-2xl p-8 border border-[#354eab]/10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to create your resume?
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Hover over any template above to see details, then click "Use This Template" to get started. Our AI-powered builder will guide you through the process.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#4a5fc7] hover:to-[#5a6fd7] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Get Started Now
                </Link>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
            opacity: 0;
          }
        `
      }} />
    </>
  );
};

export default ChooseTemplate;
