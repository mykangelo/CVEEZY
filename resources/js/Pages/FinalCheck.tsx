import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Head } from "@inertiajs/react";
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

// Add design settings interface
interface DesignSettings {
  fontStyle: 'small' | 'normal' | 'large';
  fontFamily: string;
  sectionSpacing: number;
  paragraphSpacing: number;
  lineSpacing: number;
  scope?: 'all' | 'summary' | 'experience' | 'education' | 'skills' | 'contact';
}

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
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);
  
  // Get template-specific default font
  const getDefaultFontForTemplate = (template: string): string => {
    switch (template) {
      case 'elegant':
        return 'Alte Haas Grotesk';
      case 'modern':
        return 'DejaVu Sans';
      case 'creative':
        return 'Mont';
      case 'professional':
        return 'Arial';
      case 'minimal':
        return 'Montserrat';
      case 'classic':
      default:
        return 'Montserrat';
    }
  };

  // Add design settings state with template-specific defaults (no localStorage persistence initially)
  const [designSettings, setDesignSettings] = useState<DesignSettings>(() => {
    // Get template name from props or session storage
    const templateName = propTemplateName || 'classic';
    const defaultFont = getDefaultFontForTemplate(templateName);
    
    return {
      fontStyle: 'normal',
      fontFamily: defaultFont,
      sectionSpacing: 50,
      paragraphSpacing: 30,
      lineSpacing: 60,
      scope: 'all'
    };
  });

  // Track if any design settings have been changed from their defaults
  const [hasDesignChanges, setHasDesignChanges] = useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const segmentContainerRef = useRef<HTMLDivElement | null>(null);
  const designBtnRef = useRef<HTMLButtonElement | null>(null);
  const spellBtnRef = useRef<HTMLButtonElement | null>(null);
  const [segmentIndicator, setSegmentIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  

  const INDICATOR_INSET = 2; // px

  const updateSegmentIndicator = () => {
    const container = segmentContainerRef.current;
    const target = (currentSection === 'design' ? designBtnRef.current : spellBtnRef.current);
    if (!container || !target) return;
    const left = target.offsetLeft;
    const width = target.offsetWidth;
    setSegmentIndicator({ left, width });
  };

  useEffect(() => {
    updateSegmentIndicator();
    // also after initial paint
    const t = setTimeout(updateSegmentIndicator, 0);
    return () => clearTimeout(t);
  }, [currentSection]);

  useEffect(() => {
    const onResize = () => updateSegmentIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Check if any design settings differ from defaults
  useEffect(() => {
    // Check if any settings differ from defaults
    const templateName = propTemplateName || 'classic';
    const defaultFont = getDefaultFontForTemplate(templateName);
    const hasChanges = designSettings.fontStyle !== 'normal' ||
                      designSettings.fontFamily !== defaultFont ||
                      designSettings.sectionSpacing !== 50 ||
                      designSettings.paragraphSpacing !== 30 ||
                      designSettings.lineSpacing !== 60;
    
    setHasDesignChanges(hasChanges);
    
    // Only save to localStorage if user has made changes
    if (hasChanges) {
      localStorage.setItem('resumeDesignSettings', JSON.stringify(designSettings));
    }
  }, [designSettings, propTemplateName]);

  // Only apply CSS custom properties when user has made design changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (hasDesignChanges) {
      const templateName = propTemplateName || 'classic';
      const defaultFont = getDefaultFontForTemplate(templateName);
      
      // Only apply section spacing if changed from default
      if (designSettings.sectionSpacing !== 50) {
        root.style.setProperty('--section-spacing', `${designSettings.sectionSpacing}px`);
      }
      
      // Only apply paragraph spacing if changed from default
      if (designSettings.paragraphSpacing !== 30) {
        root.style.setProperty('--paragraph-spacing', `${designSettings.paragraphSpacing}px`);
      }
      
      // Only apply line spacing if changed from default
      if (designSettings.lineSpacing !== 60) {
        root.style.setProperty('--line-spacing', `${designSettings.lineSpacing / 100}`);
      }
    } else {
      // Remove all custom properties when no changes are active
      root.style.removeProperty('--section-spacing');
      root.style.removeProperty('--paragraph-spacing');
      root.style.removeProperty('--line-spacing');
    }
  }, [hasDesignChanges, designSettings, propTemplateName]);
  
  // Debug: Log the resumeId and other props (dev only)
  if (process.env.NODE_ENV === 'development') {
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
  }
  
  // Debug: Log URL parameters (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const urlParams = new URLSearchParams(window.location.search);
    const urlResumeId = urlParams.get('resume');
    console.log('FinalCheck - URL parameters:', {
      resume: urlResumeId,
      fullUrl: window.location.href
    });
      console.log('FinalCheck - Debug Info:', {
        resumeId,
        hasPropsData: !!(propContact && propExperiences && propEducations && propSkills && propSummary),
        hasSessionData: !!sessionStorage.getItem('resumeData'),
        urlResumeId,
        spellcheckIssues: spellcheck.length
      });
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
    const rd: any = resumeData || {};
    const rdExperiences: any[] = (rd.experiences || []) as any[];
    const rdEducations: any[] = (rd.educations || rd.education || []) as any[];
    const rdSkills: any[] = (rd.skills || []) as any[];
    const rdSummary: string = rd.summary || '';
    const rdDesiredJobTitle: string = (rd.contact && rd.contact.desiredJobTitle) || '';

    const experienceTexts = rdExperiences.map((exp: any) => [
      exp.jobTitle || '',
      exp.employer || exp.company || '',
      exp.description || ''
    ].filter(Boolean).join(' '));

    const educationTexts = rdEducations.map((edu: any) => [
      edu.degree || '',
      edu.school || '',
      edu.description || ''
    ].filter(Boolean).join(' '));

    const skillsText = rdSkills.map((s: any) => s.name).filter(Boolean).join(', ');

    return [
      rdSummary,
      rdDesiredJobTitle,
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
  }, [
    spellcheck,
    (resumeData as any)?.summary,
    (resumeData as any)?.contact?.desiredJobTitle,
    (resumeData as any)?.experiences,
    (resumeData as any)?.educations || (resumeData as any)?.education,
    (resumeData as any)?.skills,
  ]);

   // Function to save design settings to the resume
  const saveDesignSettings = async () => {
    if (!resumeId) {
      console.error('No resume ID available');
      return;
    }

    setIsSavingSettings(true);
    setSettingsSaved(false);

    try {
      const response = await fetch(`/dashboard/resumes/${resumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          settings: {
            design: designSettings
          }
        })
      });

      if (response.ok) {
        console.log('Design settings saved successfully');
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        console.error('Failed to save design settings');
      }
    } catch (error) {
      console.error('Error saving design settings:', error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Function to handle clicking the "Download PDF" button
  const handleDownloadButtonClick = async () => {
    // Check if resumeId is available
    if (!resumeId) {
      console.error('No resume ID available');
      alert('No resume ID available. Please go back and try again.');
      return;
    }
    
    // Save design settings before redirecting
    await saveDesignSettings();
    
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

  // Create a wrapper component that ONLY applies design settings when user has made changes
  const StyledResumeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // If no design changes have been made, return the resume without any wrapper styling
    if (!hasDesignChanges) {
      return <>{children}</>;
    }

    const getFontSize = () => {
      switch (designSettings.fontStyle) {
        case 'small': return '14px';
        case 'large': return '18px';
        default: return '16px';
      }
    };

    const getLineHeight = () => {
      return `${designSettings.lineSpacing / 100}`;
    };

    // Get template-specific default font
    const templateName = propTemplateName || 'classic';
    const defaultFont = getDefaultFontForTemplate(templateName);

    // Only apply styles when they differ from defaults
    const styles: React.CSSProperties & { [key: string]: string } = {};

    // Only apply section spacing if changed from default
    if (designSettings.sectionSpacing !== 50) {
      styles['--section-spacing'] = `${designSettings.sectionSpacing}px`;
    }

    // Only apply paragraph spacing if changed from default
    if (designSettings.paragraphSpacing !== 30) {
      styles['--paragraph-spacing'] = `${designSettings.paragraphSpacing}px`;
    }

    // Only apply line height if changed from default
    if (designSettings.lineSpacing !== 60) {
      styles['--line-height'] = getLineHeight();
    }

    // Only apply font family if user specifically changed it from template default
    if (designSettings.fontFamily !== defaultFont) {
      styles['--font-family'] = designSettings.fontFamily;
    }

    // Only apply font size if user specifically changed it from default
    if (designSettings.fontStyle !== 'normal') {
      styles['--font-size'] = getFontSize();
    }

    // Build a scope selector to narrow where styles apply
    const scopeClass = (() => {
      const scope = designSettings.scope || 'all';
      switch (scope) {
        case 'summary': return 'scope-summary';
        case 'experience': return 'scope-experience';
        case 'education': return 'scope-education';
        case 'skills': return 'scope-skills';
        case 'contact': return 'scope-contact';
        case 'all':
        default: return 'scope-all';
      }
    })();

    return (
      <div
        style={styles}
        className={`styled-resume ${scopeClass}`}
        data-font-family={designSettings.fontFamily}
        data-font-size={getFontSize()}
        data-line-height={getLineHeight()}
        data-section-spacing={designSettings.sectionSpacing}
        data-paragraph-spacing={designSettings.paragraphSpacing}
        data-has-changes={hasDesignChanges}
      >
        {children}
      </div>
    );
  };

  return (
    <motion.div
      className="flex min-h-screen bg-[#f4f6fb]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Head title="CVeezy | Final Check" />
      
      {/* Left Sidebar */}
      <motion.div
        className="hidden"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Navigation */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentSection("design")}
              className={`group flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                currentSection === "design" 
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              <span className="font-medium">Design & Formatting</span>
            </button>
            
            <button
              onClick={() => setCurrentSection("spellcheck")}
              className={`group flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                currentSection === "spellcheck" 
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm" 
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
          <AnimatePresence mode="wait">
          {currentSection === "design" && (
            <motion.div
              key="design-section"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6">Design & Formatting</h2>
              <p className="text-gray-600 mb-6">Customize your resume's appearance and layout.</p>
              
              {/* Design Changes Indicator */}
              {hasDesignChanges && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Custom design settings are active</span>
                  </div>
                </div>
              )}
              
              {/* Font Style Controls */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  Font Style
                  <span className="ml-2 text-xs font-normal text-gray-500">(Default: Normal)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'small', label: 'Small', icon: 'A', size: '14px' },
                    { value: 'normal', label: 'Normal', icon: 'A', size: '16px' },
                    { value: 'large', label: 'Large', icon: 'A', size: '18px' }
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => {
                        setDesignSettings(prev => ({ ...prev, fontStyle: style.value as 'small' | 'normal' | 'large' }));
                      }}
                      className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        designSettings.fontStyle === style.value
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg shadow-blue-100'
                          : 'border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-gray-50'
                      }`}
                      style={{ 
                        minHeight: '100px',
                        fontSize: style.size
                      }}
                    >
                      <div className={`mb-2 transition-transform duration-200 ${
                        designSettings.fontStyle === style.value ? 'scale-110' : 'group-hover:scale-105'
                      }`}>
                        <span className="text-3xl font-bold" style={{ fontSize: style.size }}>{style.icon}</span>
                      </div>
                      <span className="text-sm font-semibold mb-1">{style.label}</span>
                      {style.value === 'normal' && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">Default</span>
                      )}
                      {designSettings.fontStyle === style.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Font Family
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    (Template default: {getDefaultFontForTemplate(propTemplateName || 'classic')})
                  </span>
                </label>
                
                {/* Font Preview */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <div 
                    className="text-lg font-medium text-gray-800"
                    style={{ fontFamily: designSettings.fontFamily }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Font: {designSettings.fontFamily}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: getDefaultFontForTemplate(propTemplateName || 'classic'), label: 'Template Default', category: 'default' },
                    { value: 'Montserrat', label: 'Montserrat', category: 'modern' },
                    { value: 'Alte Haas Grotesk', label: 'Alte Haas Grotesk', category: 'elegant' },
                    { value: 'Mont', label: 'Mont', category: 'creative' },
                    { value: 'DejaVu Sans', label: 'DejaVu Sans', category: 'modern' },
                    { value: 'Arial', label: 'Arial', category: 'professional' },
                    { value: 'Times New Roman', label: 'Times New Roman', category: 'traditional' },
                    { value: 'Georgia', label: 'Georgia', category: 'traditional' },
                    { value: 'Roboto', label: 'Roboto', category: 'modern' },
                    { value: 'Open Sans', label: 'Open Sans', category: 'modern' }
                  ].map((font) => (
                    <button
                      key={font.value}
                      onClick={() => {
                        setDesignSettings(prev => ({ ...prev, fontFamily: font.value }));
                      }}
                      className={`group relative p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        designSettings.fontFamily === font.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <div className="font-medium text-sm mb-1">{font.label}</div>
                      <div className="text-xs text-gray-500 capitalize">{font.category}</div>
                      {designSettings.fontFamily === font.value && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Spacing */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Section Spacing
                  <span className="ml-2 text-xs font-normal text-gray-500">({designSettings.sectionSpacing}px)</span>
                </label>
                
                <div className="relative">
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Current: {designSettings.sectionSpacing}px</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={designSettings.sectionSpacing}
                      onChange={(e) => {
                        setDesignSettings(prev => ({ ...prev, sectionSpacing: parseInt(e.target.value) }));
                      }}
                      className="w-full h-4 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-400 rounded-full appearance-none cursor-pointer slider section-slider"
                    />
                    <div className="absolute inset-0 rounded-full bg-gray-100 -z-10"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span className="font-medium text-blue-600">Tight (20px)</span>
                    <span className="font-medium text-blue-600">Loose (100px)</span>
                  </div>
                </div>
              </div>

              {/* Paragraph Spacing */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Paragraph Spacing
                  <span className="ml-2 text-xs font-normal text-gray-500">({designSettings.paragraphSpacing}px)</span>
                </label>
                
                <div className="relative">
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Current: {designSettings.paragraphSpacing}px</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-200 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="15"
                      max="60"
                      value={designSettings.paragraphSpacing}
                      onChange={(e) => {
                        setDesignSettings(prev => ({ ...prev, paragraphSpacing: parseInt(e.target.value) }));
                      }}
                      className="w-full h-4 bg-gradient-to-r from-green-100 via-green-200 to-green-400 rounded-full appearance-none cursor-pointer slider paragraph-slider"
                    />
                    <div className="absolute inset-0 rounded-full bg-gray-100 -z-10"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span className="font-medium text-green-600">Tight (15px)</span>
                    <span className="font-medium text-green-600">Loose (60px)</span>
                  </div>
                </div>
              </div>

              {/* Line Spacing */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Line Spacing
                  <span className="ml-2 text-xs font-normal text-gray-500">({designSettings.lineSpacing}%)</span>
                </label>
                
                <div className="relative">
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Current: {designSettings.lineSpacing}%</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                        <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="100"
                      max="200"
                      value={designSettings.lineSpacing}
                      onChange={(e) => {
                        setDesignSettings(prev => ({ ...prev, lineSpacing: parseInt(e.target.value) }));
                      }}
                      className="w-full h-4 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-400 rounded-full appearance-none cursor-pointer slider line-slider"
                    />
                    <div className="absolute inset-0 rounded-full bg-gray-100 -z-10"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span className="font-medium text-purple-600">Tight (100%)</span>
                    <span className="font-medium text-purple-600">Loose (200%)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Save Settings Button */}
                <button
                  onClick={saveDesignSettings}
                  disabled={!hasDesignChanges || isSavingSettings}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    hasDesignChanges && !isSavingSettings
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSavingSettings ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Settings</span>
                    </>
                  )}
                </button>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    const templateName = propTemplateName || 'classic';
                    const defaultFont = getDefaultFontForTemplate(templateName);
                    setDesignSettings({
                      fontStyle: 'normal',
                      fontFamily: defaultFont,
                      sectionSpacing: 50,
                      paragraphSpacing: 30,
                      lineSpacing: 60
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-600 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>

              {/* Save Status */}
              {settingsSaved && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Settings saved successfully!</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentSection === "spellcheck" && (
            <motion.div
              key="spellcheck-section"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6">Spell Check</h2>
              <p className="text-gray-600">Review and correct any spelling or grammar errors.</p>
              {(() => {
                const issues = (spellcheck && spellcheck.length > 0) ? spellcheck : clientSpellcheck;
                if (issues.length > 0) {
                  return (
                <div className="mt-6 space-y-4">
                  {issues.map((issue: SpellCheckMatch, index) => {
                    const severityIcon = getSpellCheckSeverityIcon(issue.rule.category.name);
                    const keyId = `${issue.rule?.id || 'rule'}-${issue.offset || 0}-${issue.length || 0}-${index}`;
                    return (
                      <div key={keyId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                                <span key={`${rep.value}-${repIndex}`} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
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
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          className="bg-white/90 backdrop-blur border-b border-gray-200 px-4 md:px-6 py-3.5 md:py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {/* Left: Title + merged controls (with section selector) */}
          <div className="flex items-stretch gap-3 md:gap-4 min-w-0">
            <div className="flex items-center gap-3.5">
              <div className="flex flex-col -space-y-0.5 leading-tight">
                <div className="text-lg md:text-2xl font-semibold text-gray-900 tracking-tight">Final Check</div>
                <div className="text-[12px] md:text-sm text-gray-500">Design & Spellcheck</div>
            </div>
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="capitalize">{propTemplateName || 'classic'}</span>
            </span>
            </div>
            {/* Combined selector + controls */}
            <div className="hidden lg:flex items-center gap-2.5 bg-white/90 border border-gray-200 rounded-2xl px-3.5 py-2 shadow-sm">
              {/* Segmented selector */}
              <div ref={segmentContainerRef} className="relative flex items-center bg-gray-100 rounded-2xl p-1.5">
              <button
                  ref={designBtnRef}
                onClick={() => setCurrentSection('design')}
                  className={`relative z-10 px-3.5 py-1.5 text-[12px] rounded-lg transition-colors ${currentSection==='design' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
              >Design</button>
              <button
                  ref={spellBtnRef}
                onClick={() => setCurrentSection('spellcheck')}
                  className={`relative z-10 px-3.5 py-1.5 text-[12px] rounded-lg transition-colors ${currentSection==='spellcheck' ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >Spellcheck</button>
                <motion.span
                  layout
                  className="absolute top-0 bottom-0 rounded-2xl bg-blue-600 shadow"
                  style={{ width: Math.max(0, segmentIndicator.width - INDICATOR_INSET * 2) }}
                  animate={{ left: Math.max(0, segmentIndicator.left + INDICATOR_INSET) }}
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                />
          </div>

              {/* Divider */}
              <span className="w-px h-5 bg-gray-200" />

              <AnimatePresence mode="wait">
            {currentSection === 'design' && (
                <motion.div
                  key="hdr-design-controls"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-600">
                    <span className="font-semibold">Aa</span>
                    Font
                  </span>
                  <div className="relative">
                    <button
                      onClick={()=>setIsFontMenuOpen(v=>!v)}
                      className="text-[12px] px-2.5 py-1.5 border rounded-md text-gray-700 bg-white hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      {designSettings.fontStyle === 'small' ? 'Small' : designSettings.fontStyle === 'large' ? 'Large' : 'Default'}
                      <span className="text-xs">▾</span>
                    </button>
                    <AnimatePresence>
                      {isFontMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-30 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                        >
                          {[
                            { value: 'small', label: 'Small', size: '14px' },
                            { value: 'normal', label: 'Default', size: '16px' },
                            { value: 'large', label: 'Large', size: '18px' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              onClick={()=>{ setDesignSettings(prev=>({...prev, fontStyle: opt.value as any })); setIsFontMenuOpen(false); }}
                              className={`w-full text-left px-3.5 py-2.5 text-[12px] hover:bg-gray-50 flex items-center justify-between ${designSettings.fontStyle===opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                            >
                              <span>{opt.label}</span>
                              <span className="font-medium" style={{ fontSize: opt.size }}>Aa</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
              </div>
                  <span className="text-[12px] text-gray-600">Section</span>
                  <input type="range" min="20" max="100" value={designSettings.sectionSpacing} onChange={(e)=>setDesignSettings(p=>({...p, sectionSpacing: parseInt(e.target.value)}))} className="w-20" />
                  <span className="text-[12px] text-gray-600">Paragraph</span>
                  <input type="range" min="15" max="60" value={designSettings.paragraphSpacing} onChange={(e)=>setDesignSettings(p=>({...p, paragraphSpacing: parseInt(e.target.value)}))} className="w-20" />
                  <span className="text-[12px] text-gray-600">Line</span>
                  <input type="range" min="100" max="200" value={designSettings.lineSpacing} onChange={(e)=>setDesignSettings(p=>({...p, lineSpacing: parseInt(e.target.value)}))} className="w-20" />
                  <button onClick={saveDesignSettings} disabled={!hasDesignChanges || isSavingSettings} className={`text-[12px] px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1 ${hasDesignChanges && !isSavingSettings ? 'bg-[#354eab] text-white hover:bg-[#4a5fc7]' : 'bg-gray-200 text-gray-500'}`}>
                    {isSavingSettings ? 'Saving…' : 'Save'}
                  </button>
                  {settingsSaved && (
                    <span className="text-[12px] text-emerald-600 font-medium">Saved</span>
                  )}
                </motion.div>
            )}
            {currentSection === 'spellcheck' && (
                <motion.div
                  key="hdr-spell-controls"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[12px] text-gray-600">Issues</span>
                  <span className="text-[12px] font-semibold text-red-600">{(spellcheck?.length||0) || clientSpellcheck.length}</span>
                <button
                  onClick={()=>{
                    const text = buildTextToCheck();
                    if (!text) return;
                    setIsClientChecking(true);
                    const language = (navigator.language || 'en-US').replace('_','-');
                    fetch('https://api.languagetool.org/v2/check', { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body: new URLSearchParams({ text, language }).toString() })
                      .then(r=>r.json()).then(data=> setClientSpellcheck((data?.matches||[]) as any)).finally(()=>setIsClientChecking(false));
                  }}
                    className="text-[12px] px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >Check</button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: quick nav + actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => {
                if (resumeId) {
                  window.location.href = `/builder?resume=${resumeId}`;
                } else {
                  window.location.href = '/builder';
                }
              }}
              className="group flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 bg-white/70 hover:bg-white shadow-sm hover:shadow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a5fc7]/40"
            >
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">Builder</span>
            </button>

            <motion.div 
              className="hidden sm:flex items-center gap-1.5 text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-[9px]">✓</span>
              </div>
              <span className="text-[12px] font-medium">Saved</span>
            </motion.div>

            <button
              onClick={handleDownloadButtonClick}
              aria-label="Download PDF"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-[#354eab] to-[#4a5fc7] hover:from-[#3e55b7] hover:to-[#5a6fd7] shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#4a5fc7]/50 active:scale-[0.99]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"/></svg>
              Download PDF
            </button>

            <button aria-label="More" className="text-gray-500 hover:text-gray-900 p-2.5 rounded-xl border border-gray-200 bg-white/70 hover:bg-white shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a5fc7]/40 transition-colors">
              <span className="text-xl">⋯</span>
            </button>
          </div>
        </motion.div>
        {/* Decorative gradient underline */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-100 via-indigo-100 to-transparent" />


        {/* Resume Preview */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Match Builder: center a fixed A4-sized document without stretching */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -left-20 w-72 h-72 bg-gradient-to-br from-[#354eab]/10 to-[#4a5fc7]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-gradient-to-tr from-[#5a6fd7]/10 to-[#354eab]/10 rounded-full blur-3xl" />
            </div>
          <div className="flex justify-center pb-24">
              <motion.div
              className="bg-white shadow-2xl border border-gray-100 relative rounded-lg overflow-hidden"
              style={{ width: `${210 * 3.78}px`, minHeight: `${297 * 3.78}px`, padding: '40px' }}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="absolute top-3 right-3 text-[11px] text-gray-400">A4</div>
              <StyledResumeWrapper>
                <SelectedTemplate resumeData={normalizedResumeData} />
              </StyledResumeWrapper>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS styles for design controls */}
      <style>{`
        /* Import Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&display=swap');
        
        /* Custom Fonts from Templates */
        @font-face {
          font-family: 'Alte Haas Grotesk';
          src: url('/fonts/alte_haas_grotesk/AlteHaasGroteskRegular.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Alte Haas Grotesk';
          src: url('/fonts/alte_haas_grotesk/AlteHaasGroteskBold.ttf') format('truetype');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Mont';
          src: url('/fonts/mont/Mont-ExtraLightDEMO.otf') format('opentype');
          font-weight: 200;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Mont';
          src: url('/fonts/mont/Mont-HeavyDEMO.otf') format('opentype');
          font-weight: 800;
          font-style: normal;
          font-display: swap;
        }
        
        /* Enhanced Slider Styling */
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 10;
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
          border: none;
          border-radius: 12px;
          height: 16px;
        }
        
        /* Make the slider track visible with the gradient */
        .slider::-webkit-slider-runnable-track {
          background: transparent;
          border: none;
          border-radius: 12px;
          height: 16px;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 3px solid #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #2563eb;
        }
        
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-moz-range-track {
          background: transparent;
          border: none;
          border-radius: 12px;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 3px solid #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #2563eb;
        }
        
        .slider::-moz-range-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
        }
        
        /* Firefox track styling */
        .slider::-moz-range-track {
          background: transparent;
          border: none;
          border-radius: 12px;
          height: 16px;
        }
        
        /* Firefox specific slider colors - unified to brand blue */
        .section-slider::-moz-range-track,
        .paragraph-slider::-moz-range-track,
        .line-slider::-moz-range-track {
          background: linear-gradient(to right, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%);
          border-radius: 12px;
          height: 16px;
        }
        
        /* Specific slider colors */
        .section-slider::-webkit-slider-thumb,
        .paragraph-slider::-webkit-slider-thumb,
        .line-slider::-webkit-slider-thumb {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .section-slider::-webkit-slider-thumb:hover,
        .paragraph-slider::-webkit-slider-thumb:hover,
        .line-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #2563eb;
        }
        .section-slider::-webkit-slider-runnable-track,
        .paragraph-slider::-webkit-slider-runnable-track,
        .line-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%);
          border-radius: 12px;
          height: 16px;
        }
        
        
        /* IMPORTANT: Only apply styles when user has made design changes */
        .styled-resume[data-has-changes="true"] {
          --section-spacing: 50px;
          --paragraph-spacing: 30px;
          --line-spacing: 1.6;
        }

        /* APPLY font changes ONLY to content text when user has made changes (descriptions, bullet points, etc.) */
        .styled-resume[data-has-changes="true"][data-font-family]:not([data-font-family="Montserrat"]) p,
        .styled-resume[data-has-changes="true"][data-font-family]:not([data-font-family="Montserrat"]) li,
        .styled-resume[data-has-changes="true"][data-font-family]:not([data-font-family="Montserrat"]) span:not(.font-bold):not(.font-semibold),
        .styled-resume[data-has-changes="true"][data-font-family]:not([data-font-family="Montserrat"]) div:not(.font-bold):not(.font-semibold):not(.text-center):not(.text-lg):not(.text-3xl) {
          font-family: var(--font-family) !important;
        }

        .styled-resume[data-has-changes="true"][data-font-size]:not([data-font-size="16px"]) p,
        .styled-resume[data-has-changes="true"][data-font-size]:not([data-font-size="16px"]) li,
        .styled-resume[data-has-changes="true"][data-font-size]:not([data-font-size="16px"]) span:not(.font-bold):not(.font-semibold),
        .styled-resume[data-has-changes="true"][data-font-size]:not([data-font-size="16px"]) div:not(.font-bold):not(.font-semibold):not(.text-center):not(.text-lg):not(.text-3xl) {
          font-size: var(--font-size) !important;
        }

        /* LINE SPACING: apply to core text blocks only (avoid generic divs) */
        .styled-resume[data-has-changes="true"] p,
        .styled-resume[data-has-changes="true"] li,
        .styled-resume[data-has-changes="true"] .text,
        .styled-resume[data-has-changes="true"] [class*="description" i],
        .styled-resume[data-has-changes="true"] [class*="summary" i] p {
          line-height: var(--line-height) !important;
        }

        /* Apply section spacing to all major resume sections ONLY when user has made changes */
        /* SECTION SPACING: affect section wrappers anywhere in the resume tree (avoid "item" blocks) */
        .styled-resume[data-has-changes="true"] section,
        .styled-resume[data-has-changes="true"] div[class*="experience" i]:not([class*="item" i]),
        .styled-resume[data-has-changes="true"] div[class*="education" i]:not([class*="item" i]),
        .styled-resume[data-has-changes="true"] div[class*="skills" i]:not([class*="item" i]),
        .styled-resume[data-has-changes="true"] div[class*="contact" i]:not([class*="item" i]),
        .styled-resume[data-has-changes="true"] div[class*="summary" i]:not([class*="item" i]),
        /* Fallbacks using :has to grab typical section blocks with headings */
        .styled-resume[data-has-changes="true"] div:has(> h1),
        .styled-resume[data-has-changes="true"] div:has(> h2),
        .styled-resume[data-has-changes="true"] div:has(> h3),
        .styled-resume[data-has-changes="true"] section:has(> h1),
        .styled-resume[data-has-changes="true"] section:has(> h2),
        .styled-resume[data-has-changes="true"] section:has(> h3) {
          margin-bottom: var(--section-spacing) !important;
        }

        /* PARAGRAPH SPACING: affect paragraphs and descriptive lines only */
        .styled-resume[data-has-changes="true"] p,
        .styled-resume[data-has-changes="true"] div[class*="description" i],
        .styled-resume[data-has-changes="true"] div[class*="summary" i] p,
        .styled-resume[data-has-changes="true"] li { margin-bottom: var(--paragraph-spacing) !important; }

        /* Paragraph fallback: any block that has continuous text content without child blocks */
        .styled-resume[data-has-changes="true"] div:has(> p) { margin-bottom: var(--paragraph-spacing) !important; }

        /* Also space typical item containers by paragraph spacing (not sections) */
        .styled-resume[data-has-changes="true"] div[class*="experience-item" i],
        .styled-resume[data-has-changes="true"] div[class*="education-item" i],
        .styled-resume[data-has-changes="true"] div[class*="skill-item" i] { margin-bottom: var(--paragraph-spacing) !important; }

        /* Ensure headers don't get extra paragraph spacing */
        .styled-resume[data-has-changes="true"] h1,
        .styled-resume[data-has-changes="true"] h2,
        .styled-resume[data-has-changes="true"] h3,
        .styled-resume[data-has-changes="true"] h4 { margin-bottom: revert; }

        /* Smooth transitions for all design changes */
        .styled-resume * {
          transition: all 0.3s ease;
        }
        
        /* Hover effects for interactive elements */
        .styled-resume button:hover,
        .styled-resume input:hover,
        .styled-resume select:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

      `}</style>
      
    </motion.div>
  );
};

export default FinalCheck;