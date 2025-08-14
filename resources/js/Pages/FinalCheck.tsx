import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import Logo from "@/Components/Logo";

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
  const { contact, experiences, educations, skills, summary, languages, certifications, awards, websites, references, hobbies, customSections, templateName } = resumeData;



   // Function to handle clicking the "Download PDF" button
  const handleDownloadButtonClick = () => {
    // Check if resumeId is available
    if (!resumeId) {
      console.error('No resume ID available');
      alert('No resume ID available. Please go back and try again.');
      return;
    }
    
    // Get resume name from contact data
    const resumeName = `${contact.firstName} ${contact.lastName}`.trim() || 'My Resume';
    
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
    <div className="w-full h-full bg-white p-8 overflow-auto space-y-8 text-gray-800">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-center text-black mb-8">
          This is the {templateName?.charAt(0).toUpperCase() + templateName?.slice(1)} Template
        </h1>

        {/* Contact Info */}
        <div className="flex items-start gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold">
              {contact.firstName} {contact.lastName}
            </h2>
            <p className="text-xl text-gray-600">
              {contact.desiredJobTitle}
            </p>
            <div className="space-y-2 mt-4">
              <p className="text-lg">
                <strong>Phone:</strong> {contact.phone}
              </p>
              <p className="text-lg">
                <strong>Email:</strong> {contact.email}
              </p>
              {(contact.address || contact.city || contact.country || contact.postCode) && (
                <p className="text-lg">
                  <strong>Location:</strong>{" "}
                  {[
                    contact.address,
                    contact.city,
                    contact.country,
                    contact.postCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
          

        </div>
      </div>

      {/* Experience */}
      {experiences.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">
            Experience
          </h3>
          <div className="space-y-6">
            {experiences.map((exp: Experience) => (
              <div key={exp.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold">
                    {exp.jobTitle}
                  </h4>
                  <span className="text-base text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <p className="text-base text-gray-700 italic">
                  {exp.company} — {exp.location}
                </p>
                {exp.description && (
                  <p className="text-base mt-2 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">
            Education
          </h3>
          <div className="space-y-6">
            {educations.map((edu: Education) => (
              <div key={edu.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold">{edu.degree}</h4>
                  <span className="text-base text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-base text-gray-700 italic">
                  {edu.school} — {edu.location}
                </p>
                {edu.description && (
                  <p className="text-base mt-2 leading-relaxed">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">
            Skills
          </h3>
          <div className="space-y-3">
            {skills.map((skill: Skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <span className="text-base text-gray-800 font-medium">
                  {skill.name}
                </span>
                {skill.level && resumeData.showExperienceLevel && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          i < getSkillLevelBullets(skill.level || "Novice")
                            ? "bg-black"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">
            Summary
          </h3>
          <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">LANGUAGES</h2>
          <div className="space-y-2">
            {languages.map((lang: any) => (
              <div key={lang.id} className="flex items-center gap-2">
                <span className="text-sm text-gray-800 font-medium">
                  {lang.name}
                </span>
                {lang.proficiency && (
                  <span className="text-sm text-gray-600">- {lang.proficiency}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">CERTIFICATIONS</h2>
          <div className="space-y-2">
            {certifications.map((cert: any) => (
              <div key={cert.id}>
                <p className="text-sm text-gray-800 font-medium">{cert.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Awards */}
      {awards && awards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">AWARDS & HONORS</h2>
          <div className="space-y-2">
            {awards.map((award: any) => (
              <div key={award.id}>
                <p className="text-sm text-gray-800 font-medium">{award.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Websites */}
      {websites && websites.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">WEBSITES & SOCIAL MEDIA</h2>
          <div className="space-y-2">
            {websites.map((site: any) => (
              <div key={site.id}>
                <p className="text-sm text-gray-800 font-medium">{site.label}:</p>
                <a
                  href={site.url}
                  className="text-sm text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {site.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {references && references.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">REFERENCES</h2>
          <div className="space-y-3">
            {references.map((ref: any) => (
              <div key={ref.id}>
                <p className="text-sm text-gray-800 font-medium">{ref.name}</p>
                {ref.relationship && (
                  <p className="text-sm text-gray-600">{ref.relationship}</p>
                )}
                {ref.contactInfo && (
                  <p className="text-sm text-gray-600">{ref.contactInfo}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hobbies */}
      {hobbies && hobbies.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">HOBBIES & INTERESTS</h2>
          <div className="space-y-2">
            {hobbies.map((hobby: any) => (
              <div key={hobby.id}>
                <p className="text-sm text-gray-800 font-medium">{hobby.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        <div className="mb-6">
          {customSections.map((section: any) => (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">{section.title.toUpperCase()}</h2>
              <div className="text-sm text-gray-700 leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f4f6fb]">
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
              {spellcheck.length > 0 && (
                <div className="mt-6 space-y-4">
                  {spellcheck.map((issue: SpellCheckMatch, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-lg ${getSpellCheckSeverityIcon(issue.rule.category.name)}`}>
                          {getSpellCheckSeverityIcon(issue.rule.category.name)}
                        </span>
                        <span className={`font-semibold ${getSpellCheckSeverityColor(issue.rule.category.name)}`}>
                          {issue.rule.category.name.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">({issue.shortMessage})</span>
                      </div>
                      <p className="text-sm text-gray-800">
                        {issue.context.text}
                        <span className="font-bold text-red-600">
                          {issue.context.text.substring(issue.context.offset, issue.context.offset + issue.length)}
                        </span>
                        {issue.context.text.substring(issue.context.offset + issue.length)}
                      </p>
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
                  ))}
                </div>
              )}
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
        <div className="flex-1 p-6">
          <div className="bg-white shadow-2xl rounded-lg w-full h-full overflow-hidden">
            <div className="h-full">
              {renderResumeContent()}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FinalCheck;