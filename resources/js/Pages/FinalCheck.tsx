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

// Add design settings interface
interface DesignSettings {
  fontStyle: 'small' | 'normal' | 'large';
  fontFamily: string;
  sectionSpacing: number;
  paragraphSpacing: number;
  lineSpacing: number;
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
      lineSpacing: 60
    };
  });

  // Track if any design settings have been changed from their defaults
  const [hasDesignChanges, setHasDesignChanges] = useState(false);

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

    return (
      <div
        style={styles}
        className="styled-resume"
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
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
            <div className="text-sm text-gray-600">
              Template: <span className="font-medium capitalize">{propTemplateName || 'classic'}</span>
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
                                          className="bg-[#354eab] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4a5fc7] transition-colors"
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
              <StyledResumeWrapper>
                <SelectedTemplate resumeData={normalizedResumeData} />
              </StyledResumeWrapper>
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
        
        /* Firefox specific slider colors */
        .section-slider::-moz-range-track {
          background: linear-gradient(to right, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%);
          border-radius: 12px;
          height: 16px;
        }
        
        .paragraph-slider::-moz-range-track {
          background: linear-gradient(to right, #d1fae5 0%, #6ee7b7 50%, #10b981 100%);
          border-radius: 12px;
          height: 16px;
        }
        
        .line-slider::-moz-range-track {
          background: linear-gradient(to right, #e9d5ff 0%, #c4b5fd 50%, #8b5cf6 100%);
          border-radius: 12px;
          height: 16px;
        }
        
        /* Specific slider colors */
        .section-slider::-webkit-slider-thumb {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .section-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #2563eb;
        }
        
        .section-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%);
          border-radius: 12px;
          height: 16px;
        }
        
        .paragraph-slider::-webkit-slider-thumb {
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .paragraph-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #059669;
        }
        
        .paragraph-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #d1fae5 0%, #6ee7b7 50%, #10b981 100%);
          border-radius: 12px;
          height: 16px;
        }
        
        .line-slider::-webkit-slider-thumb {
          border-color: #8b5cf6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .line-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #7c3aed;
        }
        
        .line-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #e9d5ff 0%, #c4b5fd 50%, #8b5cf6 100%);
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

        .styled-resume[data-has-changes="true"] p,
        .styled-resume[data-has-changes="true"] li,
        .styled-resume[data-has-changes="true"] span:not(.font-bold):not(.font-semibold),
        .styled-resume[data-has-changes="true"] div:not(.font-bold):not(.font-semibold):not(.text-center):not(.text-lg):not(.text-3xl) {
          line-height: var(--line-height) !important;
        }

        /* Apply section spacing to all major resume sections ONLY when user has made changes */
        .styled-resume[data-has-changes="true"] > div > div,
        .styled-resume[data-has-changes="true"] > div > section,
        .styled-resume[data-has-changes="true"] > div > div[class*="section"],
        .styled-resume[data-has-changes="true"] > div > div[class*="Section"],
        .styled-resume[data-has-changes="true"] > div > div[class*="experience"],
        .styled-resume[data-has-changes="true"] > div > div[class*="education"],
        .styled-resume[data-has-changes="true"] > div > div[class*="skills"],
        .styled-resume[data-has-changes="true"] > div > div[class*="contact"],
        .styled-resume[data-has-changes="true"] > div > div[class*="summary"],
        .styled-resume[data-has-changes="true"] > div > div[class*="Summary"] {
          margin-bottom: var(--section-spacing) !important;
        }

        /* Apply paragraph spacing to all text elements ONLY when user has made changes */
        .styled-resume[data-has-changes="true"] p,
        .styled-resume[data-has-changes="true"] div,
        .styled-resume[data-has-changes="true"] span,
        .styled-resume[data-has-changes="true"] li,
        .styled-resume[data-has-changes="true"] td,
        .styled-resume[data-has-changes="true"] th {
          margin-bottom: var(--paragraph-spacing) !important;
          line-height: var(--line-spacing) !important;
        }

        /* Specific spacing for different resume components ONLY when user has made changes */
        .styled-resume[data-has-changes="true"] div[class*="Experience"],
        .styled-resume[data-has-changes="true"] div[class*="Education"],
        .styled-resume[data-has-changes="true"] div[class*="Skills"],
        .styled-resume[data-has-changes="true"] div[class*="Contact"],
        .styled-resume[data-has-changes="true"] div[class*="Summary"] {
          margin-bottom: var(--section-spacing) !important;
        }

        .styled-resume[data-has-changes="true"] div[class*="experience-item"],
        .styled-resume[data-has-changes="true"] div[class*="education-item"],
        .styled-resume[data-has-changes="true"] div[class*="skill-item"] {
          margin-bottom: var(--paragraph-spacing) !important;
        }

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
    </div>
  );
};

export default FinalCheck;