import React, { useState, useEffect, useRef, useMemo } from "react";
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

// Spell Check Issue Card Component
const SpellCheckIssueCard: React.FC<{ issue: any; index: number }> = ({ issue, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-red-200 rounded-lg sm:rounded-xl overflow-hidden hover:border-red-300 hover:shadow-md transition-all duration-200"
    >
      {/* Collapsible Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 text-left hover:bg-red-50 transition-colors duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {/* Icon with gradient background */}
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm">
                POSSIBLE TYPO
              </h4>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-300 flex-shrink-0">
                #{index + 1}
              </span>
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
        
        <div className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">
          {issue.shortMessage || issue.message || 'Spelling mistake'}
        </div>
      </motion.button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-t border-gray-100">
              {/* Context Section */}
              {issue.context?.text && (
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Context:</div>
                  <div className="p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-xs sm:text-sm text-gray-800 font-mono overflow-x-auto">
                      "{issue.context.text}"
                    </div>
                  </div>
                </div>
              )}
              
              {/* Suggestions Section */}
              {issue.replacements && issue.replacements.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Suggestions:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {issue.replacements.slice(0, 6).map((replacement: any, idx: number) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-2 sm:px-3 py-2 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200 text-left"
                      >
                        {replacement.value}
                      </motion.button>
                    ))}
                    {issue.replacements.length > 6 && (
                      <div className="px-2 sm:px-3 py-2 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-lg border border-gray-200 flex items-center justify-center">
                        +{issue.replacements.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Rule Information */}
              {issue.rule?.description && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Rule: {issue.rule.description}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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
  const [currentSection, setCurrentSection] = useState<string>("reminders");
  const [clientSpellcheck, setClientSpellcheck] = useState<SpellCheckMatch[]>([]);
  const [isClientChecking, setIsClientChecking] = useState<boolean>(false);
  const segmentContainerRef = useRef<HTMLDivElement | null>(null);
  const designBtnRef = useRef<HTMLButtonElement | null>(null);
  const spellBtnRef = useRef<HTMLButtonElement | null>(null);
  const [segmentIndicator, setSegmentIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  

  const INDICATOR_INSET = 2; // px

  const updateSegmentIndicator = () => {
    const container = segmentContainerRef.current;
    const target = (currentSection === 'reminders' ? designBtnRef.current : spellBtnRef.current);
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
        spellcheckIssues: spellcheck?.length || 0
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


  // Checklist logic (6 items)
  type ChecklistItem = {
    id: string;
    title: string;
    ok: boolean;
    description: string;
    color: string; // tailwind color keyword base used to style
  };

  const checklistItems: ChecklistItem[] = useMemo(() => {
    const rd: any = normalizedResumeData || {};
    const issuesCount = (spellcheck?.length || 0) || (clientSpellcheck?.length || 0);

    const hasContact = Boolean((rd.contact?.email || '').trim()) && Boolean((rd.contact?.phone || '').trim());
    const hasExperience = Array.isArray(rd.experiences) && rd.experiences.length > 0;
    const hasEducation = Array.isArray(rd.education) && rd.education.length > 0;
    const hasSkills = Array.isArray(rd.skills) && rd.skills.length > 0;
    const hasSummary = typeof rd.summary === 'string' && rd.summary.trim().length > 0;
    const formatConsistent = true; // heuristic placeholder – final visual pass

    return [
      {
        id: 'contact',
        title: 'Check Contact Information',
        ok: hasContact,
        description: 'Verify phone and email are correct and professional.',
        color: 'blue'
      },
      {
        id: 'experience',
        title: 'Review Work Experience',
        ok: hasExperience,
        description: 'Confirm titles, companies, dates, and descriptions are accurate.',
        color: 'green'
      },
      {
        id: 'education',
        title: 'Check Education Details',
        ok: hasEducation,
        description: 'Verify schools, degrees, dates, and key coursework/achievements.',
        color: 'purple'
      },
      {
        id: 'skills',
        title: 'Review Skills Section',
        ok: hasSkills,
        description: 'Ensure skills are relevant and properly categorized.',
        color: 'orange'
      },
      {
        id: 'proofread',
        title: 'Proofread Everything',
        ok: issuesCount === 0,
        description: issuesCount === 0 ? 'No spelling issues found.' : `${issuesCount} potential spelling issues. Run spell check and review.`,
        color: 'red'
      },
      {
        id: 'consistency',
        title: 'Format Consistency',
        ok: formatConsistent && hasSummary,
        description: 'Keep dates, bullets, and headers consistent across sections.',
        color: 'indigo'
      }
    ];
  }, [normalizedResumeData, spellcheck, clientSpellcheck]);

  const checklistCompletedCount = useMemo(() => checklistItems.filter(i => i.ok).length, [checklistItems]);

  // Expanded details state for reminders
  const [expandedReminderIds, setExpandedReminderIds] = useState<Set<string>>(new Set());
  const [isContentExpanded, setIsContentExpanded] = useState<boolean>(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageHeight, setPageHeight] = useState(0);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Calculate pagination based on content height
  useEffect(() => {
    if (resumeRef.current) {
      const contentHeight = resumeRef.current.scrollHeight;
      const pageHeight = 297 * 3.78; // A4 height in pixels (297mm * 3.78px/mm)
      const calculatedPages = Math.ceil(contentHeight / pageHeight);
      setTotalPages(Math.max(1, calculatedPages));
      setPageHeight(pageHeight);
    }
  }, [normalizedResumeData]);

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleReminderDetails = (id: string) => {
    console.log('Toggle reminder details called with ID:', id);
    try {
      setExpandedReminderIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          // If clicking the same item, close it
          console.log('Closing section:', id);
          next.delete(id);
        } else {
          // If clicking a different item, close all others and open this one
          const wasAnyOpen = next.size > 0;
          console.log('Opening section:', id, 'wasAnyOpen:', wasAnyOpen);
          next.clear();
          next.add(id);
          
          // Add a subtle visual feedback when auto-closing other sections
          if (wasAnyOpen) {
            // You could add a toast notification here if desired
            console.log('Auto-closing other sections to open:', id);
          }
        }
        console.log('New expanded IDs:', Array.from(next));
        return next;
      });
    } catch (error) {
      console.error('Error in toggleReminderDetails:', error);
    }
  };

  const renderReminderDetails = (itemId: string) => {
    console.log('renderReminderDetails called with itemId:', itemId);
    try {
      const rd: any = normalizedResumeData || {};
      console.log('Normalized resume data:', rd);
    
    if (itemId === 'contact') {
      const contact = rd.contact || {};
      const hasEmail = Boolean(contact.email?.trim());
      const hasPhone = Boolean(contact.phone?.trim());
      const hasName = Boolean((contact.firstName?.trim() || '') + (contact.lastName?.trim() || ''));
      const hasJobTitle = Boolean(contact.desiredJobTitle?.trim());
      const hasLocation = Boolean(contact.address?.trim() || contact.city?.trim() || contact.country?.trim());
      
      return (
        <div className="mt-3 space-y-3">
          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name Card */}
            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              hasName 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-red-50 border-red-200 hover:border-red-300'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hasName ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Name</span>
              </div>
              <div className={`text-sm font-semibold ${hasName ? 'text-green-800' : 'text-red-700'}`}>
                {hasName ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '✓ Provided' : 'Missing'}
              </div>
            </div>

            {/* Job Title Card */}
            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              hasJobTitle 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-red-50 border-red-200 hover:border-red-300'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hasJobTitle ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Job Title</span>
              </div>
              <div className={`text-sm font-semibold ${hasJobTitle ? 'text-green-800' : 'text-red-700'}`}>
                {hasJobTitle ? contact.desiredJobTitle : 'Missing'}
              </div>
            </div>

            {/* Email Card */}
            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              hasEmail 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-red-50 border-red-200 hover:border-red-300'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hasEmail ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email</span>
              </div>
              <div className={`text-sm font-semibold break-all ${hasEmail ? 'text-green-800' : 'text-red-700'}`}>
                {hasEmail ? contact.email : 'Missing'}
              </div>
            </div>

            {/* Phone Card */}
            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              hasPhone 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-red-50 border-red-200 hover:border-red-300'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hasPhone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Phone</span>
              </div>
              <div className={`text-sm font-semibold ${hasPhone ? 'text-green-800' : 'text-red-700'}`}>
                {hasPhone ? contact.phone : 'Missing'}
              </div>
            </div>
          </div>

          {/* Location Card (Full Width) */}
          {hasLocation && (
            <div className="p-3 rounded-lg border-2 bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Location</span>
              </div>
              <div className="text-sm font-semibold text-green-800">
                {[contact.address, contact.city, contact.country].filter(Boolean).join(', ')}
              </div>
            </div>
          )}

          {/* Warning Messages */}
          {!hasName && (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs">⚠</span>
              </div>
              <div className="text-xs text-amber-800">
                <div className="font-medium mb-1">Missing Name</div>
                <div>Add your full name to make your resume more personal and professional.</div>
              </div>
            </div>
          )}

          {!hasJobTitle && (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs">⚠</span>
              </div>
              <div className="text-xs text-amber-800">
                <div className="font-medium mb-1">Missing Job Title</div>
                <div>Specify your desired position to help recruiters understand your career goals.</div>
              </div>
            </div>
          )}

          {!hasEmail && (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs">⚠</span>
              </div>
              <div className="text-xs text-amber-800">
                <div className="font-medium mb-1">Missing Email</div>
                <div>Add a professional email address for recruiters to contact you.</div>
              </div>
            </div>
          )}

          {!hasPhone && (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-xs">⚠</span>
              </div>
              <div className="text-xs text-amber-800">
                <div className="font-medium mb-1">Missing Phone</div>
                <div>Include your phone number for direct communication with potential employers.</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (itemId === 'experience') {
      const experiences = Array.isArray(rd.experiences) ? rd.experiences : [];
      const hasExperiences = experiences.length > 0;
      const experiencesWithDescriptions = experiences.filter((exp: any) => exp.description?.trim());
      const experiencesWithDates = experiences.filter((exp: any) => exp.startDate || exp.endDate);
      
      return (
        <div className="mt-3 space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              hasExperiences 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-red-50 border-red-200 hover:border-red-300'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${hasExperiences ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Roles</span>
              </div>
              <div className={`text-lg font-bold ${hasExperiences ? 'text-green-800' : 'text-red-700'}`}>
                {experiences.length}
              </div>
            </div>

            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              experiencesWithDescriptions.length > 0 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${experiencesWithDescriptions.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">With Details</span>
              </div>
              <div className={`text-lg font-bold ${experiencesWithDescriptions.length > 0 ? 'text-green-800' : 'text-amber-700'}`}>
                {experiencesWithDescriptions.length}/{experiences.length}
              </div>
            </div>
          </div>
          
          {/* Experience Cards */}
          {experiences.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-800">Work Experience</span>
              </div>
              <div className="space-y-2">
                {experiences.slice(0, 3).map((exp: any, i: number) => (
                  <div key={i} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    exp.description?.trim() 
                      ? 'bg-green-50 border-green-200 hover:border-green-300' 
                      : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm mb-1">
                          {exp.jobTitle || 'Untitled role'}
                        </div>
                        <div className="text-gray-600 text-xs mb-1">
                          {exp.employer || exp.company || 'Company not specified'}
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <div className="text-gray-500 text-xs">
                            {exp.startDate || '—'} to {exp.endDate || 'Present'}
                          </div>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                        exp.description?.trim() ? 'bg-green-500' : 'bg-amber-500'
                      }`}></div>
                    </div>
                    {!exp.description?.trim() && (
                      <div className="flex items-start space-x-2 mt-2 p-2 bg-amber-100 rounded">
                        <span className="text-amber-600 text-xs">⚠</span>
                        <span className="text-amber-700 text-xs">No job description provided</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No Experience Warning */}
          {!hasExperiences && (
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">⚠</span>
              </div>
              <div className="text-sm text-amber-800">
                <div className="font-semibold mb-1">No Work Experience Added</div>
                <div>Add your professional experience to showcase your career background and achievements.</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (itemId === 'education') {
      const education = Array.isArray(rd.education) ? rd.education : [];
      const hasEducation = education.length > 0;
      const educationWithDescriptions = education.filter((edu: any) => edu.description?.trim());
      
      return (
        <div className="mt-3 space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              hasEducation 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-red-50 border-red-200 hover:border-red-300'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${hasEducation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Entries</span>
              </div>
              <div className={`text-lg font-bold ${hasEducation ? 'text-green-800' : 'text-red-700'}`}>
                {education.length}
              </div>
            </div>

            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              educationWithDescriptions.length > 0 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${educationWithDescriptions.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">With Details</span>
              </div>
              <div className={`text-lg font-bold ${educationWithDescriptions.length > 0 ? 'text-green-800' : 'text-amber-700'}`}>
                {educationWithDescriptions.length}/{education.length}
              </div>
            </div>
          </div>
          
          {/* Education Cards */}
          {education.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-800">Education Background</span>
              </div>
              <div className="space-y-2">
                {education.slice(0, 3).map((edu: any, i: number) => (
                  <div key={i} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    edu.description?.trim() 
                      ? 'bg-green-50 border-green-200 hover:border-green-300' 
                      : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm mb-1">
                          {edu.degree || 'Degree not specified'}
                        </div>
                        <div className="text-gray-600 text-xs mb-1">
                          {edu.school || 'School not specified'}
                        </div>
                        {(edu.startDate || edu.endDate) && (
                          <div className="text-gray-500 text-xs">
                            {edu.startDate || '—'} to {edu.endDate || '—'}
                          </div>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                        edu.description?.trim() ? 'bg-green-500' : 'bg-amber-500'
                      }`}></div>
                    </div>
                    {!edu.description?.trim() && (
                      <div className="flex items-start space-x-2 mt-2 p-2 bg-amber-100 rounded">
                        <span className="text-amber-600 text-xs">⚠</span>
                        <span className="text-amber-700 text-xs">No additional details provided</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No Education Warning */}
          {!hasEducation && (
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">⚠</span>
              </div>
              <div className="text-sm text-amber-800">
                <div className="font-semibold mb-1">No Education Added</div>
                <div>Add your educational background to strengthen your professional profile.</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (itemId === 'skills') {
      try {
        console.log('Skills section - Raw data:', rd.skills);
        const skills = Array.isArray(rd.skills) ? rd.skills : [];
        console.log('Skills section - Processed skills:', skills);
        const hasSkills = skills.length > 0;
        const skillsWithLevels = skills.filter((skill: any) => {
          try {
            // Handle different skill formats
            if (typeof skill === 'string') {
              return false; // String skills don't have levels
            }
            if (typeof skill === 'object' && skill !== null) {
              return skill.level && skill.level !== 'beginner';
            }
            return false;
          } catch (e) {
            console.warn('Error processing skill:', skill, e);
            return false;
          }
        });
      
      return (
        <div className="mt-3 space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              hasSkills 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-red-50 border-red-200 hover:border-red-300'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${hasSkills ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Skills</span>
              </div>
              <div className={`text-lg font-bold ${hasSkills ? 'text-green-800' : 'text-red-700'}`}>
                {skills.length}
              </div>
            </div>

            <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              skillsWithLevels.length > 0 
                ? 'bg-green-50 border-green-200 hover:border-green-300' 
                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${skillsWithLevels.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">With Levels</span>
              </div>
              <div className={`text-lg font-bold ${skillsWithLevels.length > 0 ? 'text-green-800' : 'text-amber-700'}`}>
                {skillsWithLevels.length}/{skills.length}
              </div>
            </div>
          </div>
          
          {/* Skills Display */}
          {skills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-800">Skills & Competencies</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 20).map((skill: any, i: number) => {
                    try {
                      // Handle different skill data formats
                      let skillName = 'Unknown Skill';
                      let skillLevel = null;
                      
                      if (typeof skill === 'string') {
                        skillName = skill;
                      } else if (typeof skill === 'object' && skill !== null) {
                        skillName = skill.name || skill.title || skill.skill || 'Unknown Skill';
                        skillLevel = skill.level || skill.proficiency || null;
                      }
                      
                      const hasAdvancedLevel = skillLevel && skillLevel !== 'beginner';
                      
                      return (
                        <div key={i} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          hasAdvancedLevel
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          <span>{skillName}</span>
                          {skillLevel && (
                            <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-50 rounded text-xs">
                              {skillLevel}
                            </span>
                          )}
                        </div>
                      );
                    } catch (e) {
                      console.warn('Error rendering skill:', skill, e);
                      return (
                        <div key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <span>Invalid Skill</span>
                        </div>
                      );
                    }
                  })}
                  {skills.length > 20 && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      +{skills.length - 20} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* No Skills Warning */}
          {!hasSkills && (
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">⚠</span>
              </div>
              <div className="text-sm text-amber-800">
                <div className="font-semibold mb-1">No Skills Added</div>
                <div>Add relevant skills to highlight your technical and professional capabilities.</div>
              </div>
            </div>
          )}
        </div>
      );
      } catch (error) {
        console.error('Error in skills section:', error);
        return (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠</span>
              <span className="text-red-800 text-sm">Error loading skills details. Please try again.</span>
            </div>
          </div>
        );
      }
    }
    
    if (itemId === 'proofread') {
      const issues = (spellcheck && spellcheck.length > 0) ? spellcheck : (clientSpellcheck || []);
      const hasIssues = issues && issues.length > 0;
      
      return (
        <div className="mt-3 space-y-4">
          {/* Status Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
              hasIssues 
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:border-red-300 shadow-red-100' 
                : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:border-green-300 shadow-green-100'
            } shadow-lg hover:shadow-xl`}
          >
            {/* Background Pattern */}
            <div className={`absolute inset-0 opacity-5 ${
              hasIssues ? 'bg-red-500' : 'bg-green-500'
            }`} style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    hasIssues ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {hasIssues ? (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-800 mb-1">
                      {hasIssues ? 'Issues Found' : 'All Clear!'}
                    </div>
                    <div className={`text-sm font-medium ${
                      hasIssues ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {hasIssues ? `${issues.length} spelling or grammar issues detected` : 'No issues detected'}
                    </div>
                  </div>
                </div>
                
                {/* Issue Count Badge */}
                <div className={`text-4xl font-black ${
                  hasIssues ? 'text-red-600' : 'text-green-600'
                }`}>
                  {issues.length}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Issues List */}
          {hasIssues ? (
            <div className="space-y-4">
              {/* Issues Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-800">Issues to Fix</span>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {issues.length} total
                </div>
              </div>
              
              {/* Collapsible Issues List */}
              <div className="space-y-3">
                {issues && issues.length > 0 ? (
                  <>
                    {issues.slice(0, 6).map((issue: any, i: number) => (
                      <SpellCheckIssueCard key={i} issue={issue} index={i} />
                    ))}
                    
                    {/* More Issues Indicator */}
                    {issues.length > 6 && (
                      <div className="text-center py-3">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>+{issues.length - 6} more issues</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-sm">No issues to display</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm text-green-800">
                <div className="font-semibold mb-1">Perfect! No Issues Found</div>
                <div>Your resume is free of spelling and grammar errors.</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (itemId === 'consistency') {
      const experiences = Array.isArray(rd.experiences) ? rd.experiences : [];
      const education = Array.isArray(rd.education) ? rd.education : [];
      
      // Check for consistency issues
      const dateFormats = [...experiences, ...education]
        .map(item => item.startDate || item.endDate)
        .filter(Boolean)
        .map(date => {
          if (typeof date === 'string') {
            if (date.includes('/')) return 'MM/DD/YYYY';
            if (date.includes('-')) return 'YYYY-MM-DD';
            if (date.match(/\w{3}\s+\d{4}/)) return 'MMM YYYY';
            if (date.match(/\d{4}/)) return 'YYYY';
          }
          return 'unknown';
        });
      
      const uniqueDateFormats = [...new Set(dateFormats)];
      const hasInconsistentDates = uniqueDateFormats.length > 1;
      
      return (
        <div className="mt-3 space-y-4">
          {/* Consistency Status Card */}
          <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
            hasInconsistentDates 
              ? 'bg-amber-50 border-amber-200 hover:border-amber-300' 
              : 'bg-green-50 border-green-200 hover:border-green-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${hasInconsistentDates ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {hasInconsistentDates ? 'Needs Attention' : 'Consistent Format'}
                  </div>
                  <div className={`text-xs ${hasInconsistentDates ? 'text-amber-600' : 'text-green-600'}`}>
                    {hasInconsistentDates ? 'Date formats are inconsistent' : 'All formats are consistent'}
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold ${hasInconsistentDates ? 'text-amber-600' : 'text-green-600'}`}>
                {uniqueDateFormats.length}
              </div>
            </div>
          </div>

          {/* Date Format Analysis */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-800">Format Analysis</span>
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              hasInconsistentDates 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Date Formats Found:</span>
                <span className={`text-sm font-semibold ${hasInconsistentDates ? 'text-amber-700' : 'text-green-700'}`}>
                  {hasInconsistentDates ? 'Inconsistent' : 'Consistent'}
                </span>
              </div>
              
              {hasInconsistentDates ? (
                <div className="space-y-2">
                  <div className="text-xs text-amber-600 mb-2">
                    Found {uniqueDateFormats.length} different format(s):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueDateFormats.map((format, i) => (
                      <span key={i} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-green-600">
                  ✓ All dates use consistent formatting
                </div>
              )}
            </div>
          </div>
          
          {/* Best Practices Guide */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-800">Best Practices</span>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Date Formatting</div>
                    <div className="text-xs text-blue-600">Use consistent date format (e.g., Jan 2023 – Present)</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Bullet Points</div>
                    <div className="text-xs text-blue-600">Keep bullet points parallel in structure and tense</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Tense Consistency</div>
                    <div className="text-xs text-blue-600">Use past tense for completed roles, present for current</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Capitalization</div>
                    <div className="text-xs text-blue-600">Maintain consistent capitalization throughout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
    } catch (error) {
      console.error('Error rendering reminder details:', error);
      return (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠</span>
            <span className="text-red-800 text-sm">Error loading details. Please try again.</span>
          </div>
        </div>
      );
    }
  };


  // Enhanced text extraction for accurate client-side spellcheck
  const buildTextToCheck = (): string => {
    const rd: any = resumeData || {};
    const rdExperiences: any[] = (rd.experiences || []) as any[];
    const rdEducations: any[] = (rd.educations || rd.education || []) as any[];
    const rdSkills: any[] = (rd.skills || []) as any[];
    const rdSummary: string = rd.summary || '';
    const rdDesiredJobTitle: string = (rd.contact && rd.contact.desiredJobTitle) || '';

    // Clean and normalize text for better spell checking
    const cleanText = (text: string): string => {
      return text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s\-.,!?]/g, '') // Remove special characters except basic punctuation
        .trim();
    };

    // Extract experience text with better structure
    const experienceTexts = rdExperiences.map((exp: any) => {
      const parts = [
      exp.jobTitle || '',
      exp.employer || exp.company || '',
      exp.description || ''
      ].filter(Boolean);
      
      return parts.map(cleanText).join(' ');
    }).filter(text => text.length > 0);

    // Extract education text with better structure
    const educationTexts = rdEducations.map((edu: any) => {
      const parts = [
      edu.degree || '',
      edu.school || '',
      edu.description || ''
      ].filter(Boolean);
      
      return parts.map(cleanText).join(' ');
    }).filter(text => text.length > 0);

    // Extract skills text (only skill names, not levels)
    const skillsText = rdSkills
      .map((s: any) => s.name || s.skill || '')
      .filter(Boolean)
      .map(cleanText)
      .join(', ');

    // Build comprehensive text for spell checking
    const allTexts = [
      cleanText(rdSummary),
      cleanText(rdDesiredJobTitle),
      ...experienceTexts,
      ...educationTexts,
      skillsText
    ].filter(text => text.length > 0);

    const combinedText = allTexts.join('\n');
    
    console.log('Text extracted for spell check:', {
      summaryLength: rdSummary.length,
      experienceCount: rdExperiences.length,
      educationCount: rdEducations.length,
      skillsCount: rdSkills.length,
      totalLength: combinedText.length,
      preview: combinedText.substring(0, 200) + '...'
    });

    return combinedText;
  };

  // Enhanced client-side fallback spellcheck: runs when server returned none
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

    // Debounce the spell check to avoid too many API calls
    const timeoutId = setTimeout(() => {
    let isCancelled = false;
    setIsClientChecking(true);
      
    const language = (navigator.language || 'en-US').replace('_', '-');
    const endpoint = 'https://api.languagetool.org/v2/check';

      // Enhanced request parameters
      const body = new URLSearchParams({ 
        text: text.substring(0, 20000), // Limit text length
        language,
        enabledOnly: 'false', // Enable all rules
        enabledRules: 'MORFOLOGIK_RULE_EN_US,SPELLING_RULE', // Focus on spelling rules
        disabledRules: 'WHITESPACE_RULE,COMMA_PARENTHESIS_WHITESPACE', // Disable formatting rules
      });

      console.log('Starting client-side spell check:', { textLength: text.length, language });

    fetch(endpoint, {
      method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CVeezy/1.0',
          'Accept': 'application/json'
        },
      body: body.toString()
    })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json().catch((error) => {
            console.error('JSON parsing error:', error);
            return { matches: [] };
          });
          
          console.log('Client-side spell check response:', data);
          
        const allMatches: SpellCheckMatch[] = (data?.matches || []) as SpellCheckMatch[];
          
          // Enhanced filtering for more accurate spell check results
          const filtered = allMatches.filter((match: any) => {
            if (!match || !match.rule) return false;
            
            const category = String(match.rule.category?.name || '').toLowerCase();
            const ruleId = String(match.rule.id || '').toLowerCase();
            const message = String(match.message || '').toLowerCase();
            const shortMessage = String(match.rule.description || '').toLowerCase();
            
            // Spelling-related keywords (expanded list)
            const spellingKeywords = [
              'spelling', 'typos', 'typo', 'morfologik', 'morfo', 
              'misspelling', 'misspell', 'spell', 'word', 'unknown word',
              'not found', 'unrecognized', 'incorrect'
            ];
            
            // Grammar/style keywords to exclude
            const excludeKeywords = [
              'grammar', 'style', 'punctuation', 'capitalization', 
              'whitespace', 'comma', 'period', 'semicolon', 'colon',
              'apostrophe', 'quotation', 'bracket', 'parenthesis',
              'sentence', 'paragraph', 'formatting', 'layout'
            ];
            
            // Check if it's a spelling issue
            const isSpellingIssue = spellingKeywords.some(keyword => 
              category.includes(keyword) || 
              ruleId.includes(keyword) || 
              message.includes(keyword) ||
              shortMessage.includes(keyword)
            );
            
            // Check if it should be excluded
            const shouldExclude = excludeKeywords.some(keyword => 
              category.includes(keyword) || 
              ruleId.includes(keyword) || 
              message.includes(keyword) ||
              shortMessage.includes(keyword)
            );
            
            // Additional checks for better accuracy
            const hasValidOffset = typeof match.offset === 'number' && match.offset >= 0;
            const hasValidLength = typeof match.length === 'number' && match.length > 0;
            const hasSuggestions = Array.isArray(match.replacements) && match.replacements.length > 0;
            
            return isSpellingIssue && !shouldExclude && hasValidOffset && hasValidLength && hasSuggestions;
          });
          
          console.log(`Client-side spell check: ${allMatches.length} total matches, ${filtered.length} spelling issues`);
          
          if (!isCancelled) {
            setClientSpellcheck(filtered);
          }
        })
        .catch((error) => {
          console.error('Client-side spell check error:', error);
          if (!isCancelled) {
            setClientSpellcheck([]);
          }
      })
      .finally(() => {
          if (!isCancelled) {
            setIsClientChecking(false);
          }
      });

    return () => { isCancelled = true; };
    }, 1000); // 1 second debounce

    return () => { 
      clearTimeout(timeoutId);
    };
  // Re-run when inputs that affect the on-screen text change
  }, [
    spellcheck,
    (resumeData as any)?.summary,
    (resumeData as any)?.contact?.desiredJobTitle,
    (resumeData as any)?.experiences,
    (resumeData as any)?.educations || (resumeData as any)?.education,
    (resumeData as any)?.skills,
  ]);


  // Function to handle clicking the "Download PDF" button
  const handleDownloadButtonClick = async () => {
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
    <div className="min-h-screen bg-[#f4faff]">
      <Head title="CVeezy | Final Check" />
      
      {/* Back to Builder Button - Near Final Check Container */}
    <motion.div
        className="absolute left-2 sm:left-4 top-2 sm:top-4 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onClick={() => {
            if (resumeId) {
              window.location.href = `/builder?resume=${resumeId}`;
            } else {
              window.location.href = '/builder';
            }
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#354eab] hover:bg-[#354eab] focus:outline-none focus:ring-4 focus:ring-[#354eab]/20"
          whileHover={{ 
            rotate: -5,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <motion.svg 
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-white transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            initial={{ x: 0 }}
            whileHover={{ x: -2 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </motion.svg>
        </motion.button>
      </motion.div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 sm:gap-6 lg:gap-2"> 
          
          {/* Left Panel - Review Tools */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:-ml-2 xl:-ml-4 relative z-10 pl-2">
            {/* Review Sections */}
      <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Progress Overview Header with Title */}
              <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 pb-2 sm:pb-3 lg:pb-4 bg-gradient-to-r from-[#354eab] to-[#4a5fc7] text-white text-center">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2">Final Check</h1>
                <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4">Review and perfect your resume before downloading</p>
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold text-white">Review Progress</h2>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                    <span className="text-xs sm:text-sm text-white/90">Ready</span>
                  </div>
                </div>
              </div>
              {/* Section Tabs */}
              <div className="flex border-b border-gray-100">
            <button
                  onClick={() => setCurrentSection('reminders')}
                  className={`flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    currentSection === 'reminders'
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
                    <span className="hidden xs:inline">Reminders</span>
                    <span className="xs:hidden">Rem</span>
                  </div>
            </button>
            <button
                  onClick={() => setCurrentSection('spellcheck')}
                  className={`flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    currentSection === 'spellcheck'
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <span className="text-sm sm:text-lg">AB</span>
                    <span className="hidden xs:inline">Spell Check</span>
                    <span className="xs:hidden">Spell</span>
                  </div>
            </button>
        </div>

              {/* Section Content */}
              <div className="p-3 sm:p-4 lg:p-6">
          <AnimatePresence mode="wait">
                  {currentSection === 'reminders' && (
            <motion.div
                      key="reminders-content"
                      initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-4">
                        {checklistItems.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              scale: expandedReminderIds.has(item.id) ? 1.02 : 1
                            }}
                            transition={{ 
                              duration: 0.4, 
                              delay: idx * 0.1,
                              scale: { duration: 0.2 }
                            }}
                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                              expandedReminderIds.has(item.id)
                                ? item.ok
                                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 shadow-lg shadow-green-100'
                                  : 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 shadow-lg shadow-blue-100'
                                : item.ok 
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-green-100' 
                                  : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300 hover:shadow-gray-100'
                            }`}
                          >
                            {/* Status indicator line */}
                            <motion.div 
                              className={`absolute top-0 left-0 w-1 h-full ${
                                item.ok ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                              animate={expandedReminderIds.has(item.id) ? {
                                scaleY: 1.1,
                                opacity: 0.8
                              } : {
                                scaleY: 1,
                                opacity: 1
                              }}
                              transition={{ duration: 0.3 }}
                            ></motion.div>
                            
                            <div className="p-3 sm:p-5 pl-4 sm:pl-6">
                              <div className="flex items-start space-x-3 sm:space-x-4">
                                <motion.div 
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-200 ${
                                    item.ok 
                                      ? 'bg-green-500 shadow-green-200' 
                                      : 'bg-gray-400 shadow-gray-200'
                                  }`}
                                  animate={expandedReminderIds.has(item.id) ? {
                                    scale: 1.1,
                                    rotate: 5
                                  } : {
                                    scale: 1,
                                    rotate: 0
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {item.ok ? (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                                  ) : (
                                    <span className="text-white text-xs sm:text-sm font-bold">{idx + 1}</span>
                                  )}
                                </motion.div>

                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm sm:text-base font-semibold mb-1 sm:mb-2 ${
                                    item.ok ? 'text-green-900' : 'text-gray-900'
                                  }`}>
                                    {item.title}
                                  </h4>
                                  <p className={`text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 ${
                                    item.ok ? 'text-green-700' : 'text-gray-600'
                                  }`}>
                                    {item.description}
                                  </p>
                                  
                                                      <motion.button
                                    onClick={() => toggleReminderDetails(item.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                                      expandedReminderIds.has(item.id)
                                        ? item.ok
                                          ? 'bg-green-200 text-green-800 border-2 border-green-300 shadow-md'
                                          : 'bg-blue-200 text-blue-800 border-2 border-blue-300 shadow-md'
                                        : item.ok
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                  >
                                    <svg className="w-3 h-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                                    <span className="hidden sm:inline">{expandedReminderIds.has(item.id) ? 'Hide Details' : 'View Details'}</span>
                                    <span className="sm:hidden">{expandedReminderIds.has(item.id) ? 'Hide' : 'View'}</span>
                                  </motion.button>
                                  
                                  <AnimatePresence mode="wait">
                                    {expandedReminderIds.has(item.id) && (
                                      <motion.div
                                        key={`details-${item.id}`}
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ 
                                          opacity: 1, 
                                          height: 'auto', 
                                          y: 0,
                                          transition: {
                                            duration: 0.4,
                                            ease: "easeOut",
                                            opacity: { duration: 0.3 },
                                            height: { duration: 0.4, ease: "easeInOut" },
                                            y: { duration: 0.3 }
                                          }
                                        }}
                                        exit={{ 
                                          opacity: 0, 
                                          height: 0, 
                                          y: -10,
                                          transition: {
                                            duration: 0.3,
                                            ease: "easeIn",
                                            opacity: { duration: 0.2 },
                                            height: { duration: 0.3, ease: "easeInOut" },
                                            y: { duration: 0.2 }
                                          }
                                        }}
                                        className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
                                      >
                                        {renderReminderDetails(item.id)}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                </div>
              </div>
                      </div>
                          </motion.div>
                        ))}
                    </div>
                    </motion.div>
                  )}

                  {currentSection === 'spellcheck' && (
                    <motion.div
                      key="spellcheck-content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {(() => {
                        const issues = (spellcheck && spellcheck.length > 0) ? spellcheck : (clientSpellcheck || []);
                        const hasIssues = issues && issues.length > 0;
                        
                        return (
                          <div className="space-y-4">
                            {/* Status Card */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                                hasIssues 
                                  ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:border-red-300 shadow-red-100' 
                                  : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:border-green-300 shadow-green-100'
                              } shadow-md hover:shadow-lg`}
                            >
                              {/* Background Pattern */}
                              <div className={`absolute inset-0 opacity-5 ${
                                hasIssues ? 'bg-red-500' : 'bg-green-500'
                              }`} style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                              }}></div>
                              
                              <div className="relative p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      hasIssues ? 'bg-red-100' : 'bg-green-100'
                                    }`}>
                                      {hasIssues ? (
                <div className="relative">
                                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full animate-ping absolute"></div>
                                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full relative"></div>
                      </div>
                                      ) : (
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm sm:text-base font-bold text-gray-800 mb-1 truncate">
                                        {hasIssues ? 'Issues Found' : 'All Clear!'}
                  </div>
                                      <div className={`text-xs font-medium ${
                                        hasIssues ? 'text-red-600' : 'text-green-600'
                                      }`}>
                                        <span className="hidden sm:inline">
                                          {hasIssues ? `${issues.length} spelling or grammar issues detected` : 'No issues detected'}
                                        </span>
                                        <span className="sm:hidden">
                                          {hasIssues ? `${issues.length} issues found` : 'No issues'}
                                        </span>
                  </div>
                </div>
              </div>

                                  {/* Issue Count Badge */}
                                  <div className={`text-2xl sm:text-3xl font-black flex-shrink-0 ${
                                    hasIssues ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {issues.length}
                      </div>
                    </div>
                  </div>
                            </motion.div>
                            
                            {/* Issues List */}
                            {hasIssues ? (
                              <div className="space-y-3 sm:space-y-4">
                                {/* Collapsible Issues List */}
                                <div className="space-y-2 sm:space-y-3">
                                  {issues.slice(0, 6).map((issue: any, i: number) => (
                                    <SpellCheckIssueCard key={i} issue={issue} index={i} />
                                  ))}
                                  
                                  {/* More Issues Indicator */}
                                  {issues.length > 6 && (
                                    <div className="text-center py-2 sm:py-3">
                                      <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-lg">
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>+{issues.length - 6} more issues</span>
                  </div>
                </div>
                                  )}
              </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
              </div>
                                <div className="text-sm text-green-800">
                                  <div className="font-semibold mb-1">Perfect! No Issues Found</div>
                                  <div>Your resume is free of spelling and grammar errors.</div>
                  </div>
                </div>
              )}
                </div>
                );
              })()}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.div>
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="lg:col-span-5 lg:ml-2 xl:ml-4 relative z-0 mr-0">
                    <motion.div 
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#354eab]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#354eab] rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-[#354eab] capitalize">{propTemplateName || 'classic'}</span>
                  {totalPages > 1 && (
                    <span className="text-xs text-gray-500 ml-2">
                      Page {currentPage} of {totalPages}
            </span>
                  )}
            </div>
              <button
                  onClick={handleDownloadButtonClick}
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#354eab] to-[#4a5fc7] rounded-lg hover:from-[#2d3f8a] hover:to-[#3e55b7] focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">Download</span>
                    </button>
                            </div>
              
              <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 relative pr-0 mr-0">
                <div className="flex justify-center">
                  <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ width: '210mm', height: '297mm' }}>
                    <div className="p-4 sm:p-6 lg:p-8 h-full">
                      <div 
                        ref={resumeRef}
                        className="relative"
                        style={{ 
                          height: totalPages > 1 ? `${pageHeight}px` : 'auto',
                          overflow: totalPages > 1 ? 'hidden' : 'visible'
                        }}
                      >
                        <div 
                          className="transition-transform duration-300 ease-in-out"
                          style={{
                            transform: totalPages > 1 ? `translateY(-${(currentPage - 1) * pageHeight}px)` : 'none',
                            height: totalPages > 1 ? `${totalPages * pageHeight}px` : 'auto'
                          }}
                        >
                          <SelectedTemplate resumeData={normalizedResumeData} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vertical Pagination Controls - Outside Resume Preview */}
              {totalPages > 1 && (
                <div className="absolute top-8 -right-20 flex flex-col items-center space-y-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200 z-20">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-full hover:from-[#354eab] hover:to-[#4a5fc7] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-sm"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  
                  {/* Current Page Display */}
                  <div className="flex flex-col items-center space-y-0.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] text-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold">{currentPage}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      of {totalPages}
                    </div>
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-full hover:from-[#354eab] hover:to-[#4a5fc7] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-sm"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default FinalCheck;