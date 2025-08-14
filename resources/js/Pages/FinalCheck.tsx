import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import Logo from "@/Components/Logo";
import Classic from "@/Components/Builder/Classic";
import Modern from "@/Components/Builder/Modern";
import Creative from "@/Components/Builder/Creative";
import Elegant from "@/Components/Builder/Elegant";
import Professional from "@/Components/Builder/Professional";
import Minimal from "@/Components/Builder/Minimal";

type Contact = {
  firstName: string;
  lastName: string;
  desiredJobTitle: string;
  phone: string;
  email: string;
  address?: string;
  websites?: string[];
};

type Experience = {
  id: number;
  jobTitle: string;
  employer: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  id: number;
  school: string;
  location: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Skill = {
  id: number;
  name: string;
  level: string;
};

type SpellCheckMatch = {
  message: string;
  shortMessage: string;
  replacements: Array<{ value: string }>;
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  rule: {
    id: string;
    description: string;
    category: {
      id: string;
      name: string;
    };
  };
};

interface FinalCheckProps {
  contact?: Contact;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  summary?: string;
  resumeId?: number;
  templateName?: string;
  spellcheck?: SpellCheckMatch[];
}

const FinalCheck: React.FC<FinalCheckProps> = ({ 
  contact: propContact,
  experiences: propExperiences,
  educations: propEducations,
  skills: propSkills,
  summary: propSummary,
  resumeId,
  templateName: propTemplateName,
  spellcheck = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("design");
  const [clientSpellcheck, setClientSpellcheck] = useState<SpellCheckMatch[]>([]);
  const [isClientChecking, setIsClientChecking] = useState<boolean>(false);
  
  // Debug: Log the resumeId and other props
  console.log('FinalCheck - Props received:', {
    resumeId,
    propContact,
    propExperiences,
    propEducations,
    propSkills,
    propSummary,
    propTemplateName,
    spellcheckCount: spellcheck.length
  });
  
  // Debug: Log URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlResumeId = urlParams.get('resume');
    console.log('FinalCheck - URL parameters:', {
      resume: urlResumeId,
      fullUrl: window.location.href
    });
    
    // Show debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('FinalCheck - Debug Info:', {
        resumeId,
        hasPropsData: !!(propContact && propExperiences && propEducations && propSkills && propSummary),
        hasSessionData: !!sessionStorage.getItem('resumeData'),
        urlResumeId,
        spellcheckIssues: spellcheck.length
      });
    }
  }, [resumeId, propContact, propExperiences, propEducations, propSkills, propSummary, spellcheck]);
  
  // Get data from sessionStorage or use props
  const getSkillLevelBullets = (level: string): number => {
    switch (level) {
      case "Novice":
        return 1;
      case "Beginner":
        return 2;
      case "Skillful":
        return 3;
      case "Experienced":
        return 4;
      case "Expert":
        return 5;
      default:
        return 1;
    }
  };

  const getResumeData = () => {
    // First try to get data from sessionStorage (includes showExperienceLevel)
    try {
      const storedData = sessionStorage.getItem('resumeData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('FinalCheck - Found resume data in sessionStorage with showExperienceLevel:', parsedData.showExperienceLevel);
        console.log('FinalCheck - Template name from sessionStorage:', parsedData.templateName);
        return parsedData;
      }
    } catch (error) {
      console.error('Error parsing resume data from sessionStorage:', error);
    }
    
    // Fallback to props data (from database) if no sessionStorage data
    if (propContact && propExperiences && propEducations && propSkills && propSummary) {
      console.log('FinalCheck - Using props data from database (no showExperienceLevel)');
      console.log('FinalCheck - Template name from props:', propTemplateName);
      return {
        contact: propContact,
        experiences: propExperiences,
        educations: propEducations,
        skills: propSkills,
        summary: propSummary,
        showExperienceLevel: false, // Default to false for database data
        templateName: propTemplateName || 'classic'
      };
    }
    
    console.log('FinalCheck - Using default data');
    // Fallback to default values
    return {
      contact: {
        firstName: "",
        lastName: "",
        desiredJobTitle: "",
        phone: "",
        email: "",
        address: "",
        websites: []
      },
      experiences: [],
      educations: [],
      skills: [],
      summary: "",
      showExperienceLevel: false,
      templateName: propTemplateName || 'classic'
    };
  };

  const resumeData = getResumeData();
  const templateName = (resumeData as any).templateName || 'classic';

  // Normalize resume data shape to what builder templates expect
  const normalizedResumeData: any = {
    contact: {
      firstName: (resumeData as any)?.contact?.firstName || '',
      lastName: (resumeData as any)?.contact?.lastName || '',
      desiredJobTitle: (resumeData as any)?.contact?.desiredJobTitle || '',
      phone: (resumeData as any)?.contact?.phone || '',
      email: (resumeData as any)?.contact?.email || '',
      address: (resumeData as any)?.contact?.address || '',
      city: (resumeData as any)?.contact?.city || '',
      country: (resumeData as any)?.contact?.country || '',
      postCode: (resumeData as any)?.contact?.postCode || '',
    },
    experiences: (resumeData as any)?.experiences || [],
    // Templates expect `education` (singular)
    education: (resumeData as any)?.education || (resumeData as any)?.educations || [],
    skills: (resumeData as any)?.skills || [],
    summary: (resumeData as any)?.summary || '',
    showExperienceLevel: (resumeData as any)?.showExperienceLevel ?? false,
    languages: (resumeData as any)?.languages || [],
    certifications: (resumeData as any)?.certifications || [],
    awards: (resumeData as any)?.awards || [],
    websites: (resumeData as any)?.websites || [],
    references: (resumeData as any)?.references || [],
    hobbies: (resumeData as any)?.hobbies || [],
    customSections: (resumeData as any)?.customSections || [],
  };

  const templateComponents: Record<string, React.FC<{ resumeData: any }>> = {
    classic: Classic,
    modern: Modern,
    creative: Creative,
    elegant: Elegant,
    professional: Professional,
    minimal: Minimal,
  };

  const SelectedTemplate = templateComponents[templateName || 'classic'] || Classic;


  // Build the exact text we render to run client-side spellcheck when needed
  const buildTextToCheck = (): string => {
    const experienceTexts = (experiences || []).map((exp: any) => [
      exp.jobTitle || '',
      exp.employer || exp.company || '',
      exp.description || ''
    ].filter(Boolean).join(' '));

    const educationTexts = (educations || []).map((edu: any) => [
      edu.degree || '',
      edu.school || '',
      edu.description || ''
    ].filter(Boolean).join(' '));

    const skillsText = (skills || []).map((s: any) => s.name).filter(Boolean).join(', ');

    return [
      summary || '',
      contact?.desiredJobTitle || '',
      ...experienceTexts,
      ...educationTexts,
      skillsText
    ].filter(Boolean).join('\n');
  };

  // Client-side fallback spellcheck: runs when server returned none
  useEffect(() => {
    const serverIssues = spellcheck?.length || 0;
    if (serverIssues > 0) {
      setClientSpellcheck([]);
      return;
    }

    const text = buildTextToCheck();
    if (!text || text.trim().length === 0) {
      setClientSpellcheck([]);
      return;
    }

    let isCancelled = false;
    setIsClientChecking(true);
    const language = (navigator.language || 'en-US').replace('_', '-');
    const endpoint = 'https://api.languagetool.org/v2/check';

    const body = new URLSearchParams({ text, language });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({ matches: [] }));
        const allMatches: SpellCheckMatch[] = (data?.matches || []) as SpellCheckMatch[];
        // Keep only spelling-related issues (not grammar/style)
        const keywords = ['spelling', 'typos', 'typo', 'morfologik', 'morfo'];
        const filtered = allMatches.filter((m: any) => {
          const category = String(m?.rule?.category?.name || '').toLowerCase();
          const ruleId = String(m?.rule?.id || '').toLowerCase();
          const message = String(m?.message || '').toLowerCase();
          const categoryMatches = keywords.some((kw) => category.includes(kw));
          const ruleOrMessageMatches = keywords.some((kw) => ruleId.includes(kw) || message.includes(kw));
          return categoryMatches || ruleOrMessageMatches;
        });
        if (!isCancelled) setClientSpellcheck(filtered);
      })
      .catch(() => {
        if (!isCancelled) setClientSpellcheck([]);
      })
      .finally(() => {
        if (!isCancelled) setIsClientChecking(false);
      });

    return () => { isCancelled = true; };
  // Re-run when inputs that affect the on-screen text change
  }, [spellcheck, summary, contact?.desiredJobTitle, experiences, educations, skills]);

   // Function to handle clicking the "Download PDF" button

  const handleDownloadButtonClick = () => {
    // Check if resumeId is available
    if (!resumeId) {
      console.error('No resume ID available');
      alert('No resume ID available. Please go back and try again.');
      return;
    }
    
    // Get resume name from contact data
    const resumeName = `${normalizedResumeData.contact.firstName} ${normalizedResumeData.contact.lastName}`.trim() || 'My Resume';
    
    console.log('Redirecting to payment with:', { resumeId, resumeName });
    
    // Redirect to payment page with correct parameters
    const paymentUrl = `/payment?resumeId=${resumeId}&resumeName=${encodeURIComponent(resumeName)}`;
    window.location.href = paymentUrl;
  };

  // Function to get spell check severity color
  const getSpellCheckSeverityColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'spelling':
        return 'text-red-600';
      case 'grammar':
        return 'text-orange-600';
      case 'style':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Function to get spell check severity icon
  const getSpellCheckSeverityIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'spelling':
        return '🔴';
      case 'grammar':
        return '🟠';
      case 'style':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const renderResumeContent = () => (
    <div className="w-full h-full bg-white p-8 overflow-auto text-gray-800">
      <SelectedTemplate resumeData={normalizedResumeData} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <Head title="CVeezy | Final Check" />
      
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Navigation */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
            <button
              onClick={() => setCurrentSection("design")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                currentSection === "design" 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">🔧</span>
              <span className="font-medium">Design & Formatting</span>
            </button>
            
            <button
              onClick={() => setCurrentSection("spellcheck")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                currentSection === "spellcheck" 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">AB</span>
              <span className="font-medium">Spell check</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {currentSection === "design" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Design & Formatting</h2>
              <p className="text-gray-600">Customize your resume's appearance and layout.</p>
            </div>
          )}

          {currentSection === "spellcheck" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Spell Check</h2>
              <p className="text-gray-600">Review and correct any spelling or grammar errors.</p>
              {(() => {
                const issues = (spellcheck && spellcheck.length > 0) ? spellcheck : clientSpellcheck;
                if (issues.length > 0) {
                  return (
                <div className="mt-6 space-y-4">
                  {issues.map((issue: SpellCheckMatch, index) => {
                    const severityIcon = getSpellCheckSeverityIcon(issue.rule.category.name);
                    return (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{severityIcon}</span>
                          <span className={`font-semibold ${getSpellCheckSeverityColor(issue.rule.category.name)}`}>
                            {issue.rule.category.name.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">({issue.shortMessage})</span>
                        </div>
                        {(() => {
                          const contextText = issue.context?.text || '';
                          const rawOffset = typeof issue.context?.offset === 'number' ? issue.context.offset : 0;
                          const start = (issue as any)?.context?.start;
                          let relativeOffset = typeof start === 'number' ? rawOffset - start : rawOffset;
                          // Guard within [0, contextText.length]
                          if (relativeOffset < 0) relativeOffset = 0;
                          if (relativeOffset > contextText.length) relativeOffset = contextText.length;
                          const highlightLen = Math.max(0, Math.min(issue.length || 0, contextText.length - relativeOffset));
                          const before = contextText.substring(0, relativeOffset);
                          const highlight = contextText.substring(relativeOffset, relativeOffset + highlightLen);
                          const after = contextText.substring(relativeOffset + highlightLen);
                          return (
                            <p className="text-sm text-gray-800">
                              {before}
                              <span className="font-bold text-red-600">{highlight}</span>
                              {after}
                            </p>
                          );
                        })()}
                        {issue.replacements && issue.replacements.length > 0 && (
                          <div className="mt-2 text-sm text-gray-700">
                            <span className="font-medium">Suggested replacements:</span>
                            <div className="mt-1 space-x-2">
                              {issue.replacements.map((rep, repIndex) => (
                                <span key={repIndex} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                  {rep.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                  );
                }
                // Empty state
                return (
                <div className="mt-6" role="status" aria-live="polite">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5" aria-hidden="true">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div className="text-green-800">
                      <p className="font-medium">No spelling issues found{isClientChecking ? ' (checking...)' : ''}</p>
                      <p className="text-sm text-green-700">Your resume looks good.</p>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size="xl" showText={false} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Go back to builder with the current resume ID
                if (resumeId) {
                  window.location.href = `/builder?resume=${resumeId}`;
                } else {
                  window.location.href = '/builder';
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to Builder</span>
            </button>

            <div className="flex items-center gap-2 text-green-600">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm font-medium">Saved</span>
            </div>

            <button
              onClick={handleDownloadButtonClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Download PDF
            </button>

            <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-xl">⋯</span>
            </button>
          </div>
        </div>


        {/* Resume Preview */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Match Builder: center a fixed A4-sized document without stretching */}
          <div className="flex justify-center pb-24">
            <div
              className="bg-white shadow-2xl border border-gray-100 relative rounded-lg overflow-hidden"
              style={{ width: `${210 * 3.78}px`, minHeight: `${297 * 3.78}px`, padding: '40px' }}
            >
              <SelectedTemplate resumeData={normalizedResumeData} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FinalCheck;