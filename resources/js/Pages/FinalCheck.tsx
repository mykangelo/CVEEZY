import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";

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

interface FinalCheckProps {
  contact?: Contact;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  summary?: string;
  resumeId?: number;
}



const FinalCheck: React.FC<FinalCheckProps> = ({ 
  contact: propContact,
  experiences: propExperiences,
  educations: propEducations,
  skills: propSkills,
  summary: propSummary,
  resumeId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("templates");
  
  // Debug: Log the resumeId and other props
  console.log('FinalCheck - Props received:', {
    resumeId,
    propContact,
    propExperiences,
    propEducations,
    propSkills,
    propSummary
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
        urlResumeId
      });
    }
  }, [resumeId, propContact, propExperiences, propEducations, propSkills, propSummary]);
  
  // Get data from sessionStorage or use props
  const getResumeData = () => {
    // Prioritize props data (from database) over sessionStorage
    if (propContact && propExperiences && propEducations && propSkills && propSummary) {
      console.log('FinalCheck - Using props data from database');
      return {
        contact: propContact,
        experiences: propExperiences,
        educations: propEducations,
        skills: propSkills,
        summary: propSummary
      };
    }
    
    try {
      const storedData = sessionStorage.getItem('resumeData');
      if (storedData) {
        console.log('FinalCheck - Found resume data in sessionStorage');
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error parsing resume data:', error);
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
      summary: ""
    };
  };

  const resumeData = getResumeData();
  const { contact, experiences, educations, skills, summary } = resumeData;

  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const colorOptions = [
    { name: "Gray", class: "bg-gray-200" },
    { name: "Pink", class: "bg-pink-200" },
    { name: "Blue", class: "bg-blue-200" },
    { name: "Green", class: "bg-green-200" },
    { name: "Orange", class: "bg-orange-200" }
  ];

  const templates = [
    { name: "Template 1", hasImage: false },
    { name: "Template 2", hasImage: false },
    { name: "Template 3", hasImage: false },
    { name: "Template 4", hasImage: false },
    { name: "Template 5", hasImage: false },
    { name: "Template 6", hasImage: true }
  ];

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



  const renderResumeContent = () => (
    <div className="w-full h-full bg-white p-6 overflow-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {contact.firstName} {contact.lastName}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{contact.desiredJobTitle}</p>
        
        {/* Contact Info */}
        <div className="text-sm text-gray-600 space-y-1 mb-6">
          <p>{contact.address}</p>
          <p>{contact.email}</p>
          <p>{contact.phone}</p>
        </div>
        
        <hr className="border-gray-300 mb-6" />
      </div>

      {/* Websites and Social Links */}
      {contact.websites && contact.websites.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">WEBSITES AND SOCIAL LINKS</h2>
          <div className="space-y-1">
            {contact.websites.map((website: string, index: number) => (
              <p key={index} className="text-blue-600 underline text-sm">
                {website}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">SUMMARY</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">EXPERIENCE</h2>
        <div className="space-y-4">
          {experiences.map((exp: Experience) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{exp.jobTitle}</h3>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">EDUCATION</h2>
        <div className="space-y-4">
          {educations.map((edu: Education) => (
            <div key={edu.id}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{edu.school}</h3>
                <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{edu.location}</p>
              <p className="text-sm text-gray-700 mb-2">{edu.degree}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{edu.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-lg font-semibold bg-gray-100 px-3 py-1 mb-3">SKILLS</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill: Skill) => (
            <span key={skill.id} className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
              {skill.name}
            </span>
          ))}
        </div>
      </div>
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
              onClick={() => setCurrentSection("templates")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                currentSection === "templates" 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">📄</span>
              <span className="font-medium">Templates</span>
            </button>
            
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
          {currentSection === "templates" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Templates</h2>
              
              {/* Color Options */}
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color.class
                      } ${
                        selectedColor === index 
                          ? "border-blue-500 ring-2 ring-blue-200" 
                          : "border-gray-300"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTemplate(index)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedTemplate === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="bg-gray-100 h-32 rounded mb-2 flex items-center justify-center">
                      {template.hasImage && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          👤
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 text-center">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

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
              <img
                src="/icons/favicon-32x32.png"
                alt="CVeezy Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold text-gray-800">CVeezy</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-white shadow-2xl rounded-lg w-full max-w-4xl h-full overflow-hidden">
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