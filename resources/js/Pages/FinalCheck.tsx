import React, { useState } from "react";
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
}

const DownloadModal = ({ onClose, onDownload }: { onClose: () => void; onDownload: () => void }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "32px",
        minWidth: "350px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "16px" }}>Create an account to get your resume</h2>
      <input
        type="email"
        placeholder="Email Address"
        style={{
          width: "90%",
          padding: "10px",
          marginBottom: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
      <br />
      <button
        onClick={onDownload}
        style={{
          background: "#009cff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        Save & Next
      </button>
      <br />
      <a href="#" onClick={onClose} style={{ color: "#009cff", textDecoration: "underline" }}>
        Already have an account?
      </a>
      <div style={{ marginTop: "18px", textAlign: "left" }}>
        <div style={{ background: "#f5f7fa", borderRadius: "8px", padding: "12px" }}>
          <b>Now for the finishing touches!</b>
          <ul style={{ margin: "8px 0 0 18px", fontSize: "14px" }}>
            <li>⭐ Use our variety of tools to create your professionally designed resume</li>
            <li>⭐ Utilize expert pre-written content to match you to the right job</li>
            <li>⭐ Download in PDF or Word format</li>
            <li>⭐ All your information is safe every step of the way</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const FinalCheck: React.FC<FinalCheckProps> = ({ 
  contact: propContact,
  experiences: propExperiences,
  educations: propEducations,
  skills: propSkills,
  summary: propSummary
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("templates");
  const [showDownloadModal, setShowDownloadModal] = useState(false); 

  // Get data from sessionStorage or use props
  const getResumeData = () => {
    try {
      const storedData = sessionStorage.getItem('resumeData');
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error parsing resume data:', error);
    }
    
    // Fallback to props or default values
    return {
      contact: propContact || {
        firstName: "",
        lastName: "",
        desiredJobTitle: "",
        phone: "",
        email: "",
        address: "",
        websites: []
      },
      experiences: propExperiences || [],
      educations: propEducations || [],
      skills: propSkills || [],
      summary: propSummary || ""
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
    setShowDownloadModal(true);
  };

  // Function to handle closing the modal
  const handleModalClose = () => {
    setShowDownloadModal(false);
  };

  // Function to handle the "Save & Next" action within the modal
  const handleModalSaveAndNext = () => {
    // implement the logic for saving and proceeding
    // For now, we'll do nothing
    setShowDownloadModal(false); 
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
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
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
      {/* Conditional rendering of the DownloadModal */}
      {showDownloadModal && (
        <DownloadModal
          onClose={handleModalClose}
          onDownload={handleModalSaveAndNext}
        />
      )}
    </div>
  );
};

export default FinalCheck;