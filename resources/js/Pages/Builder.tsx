import React, { useState, useEffect, useCallback } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import ValidationHolder from "./builder/ValidationHolder";
import { Trash2, Plus, GripVertical, Flame, Star, CheckCircle, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Square, Camera, User, Briefcase, GraduationCap, Code, FileText, Flag } from "lucide-react";
import { SectionStepper } from '@/Components/Builder/SectionStepper';
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { ResumeData, Language, Certification, Award, Website, Reference, Hobby, CustomSection } from '@/types/resume';


// Import all resume template components
import Classic from '@/Components/Builder/Classic';
import Modern from '@/Components/Builder/Modern';
import Creative from '@/Components/Builder/Creative';
import Elegant from '@/Components/Builder/Elegant';
import Professional from '@/Components/Builder/Professional';
import Minimal from '@/Components/Builder/Minimal';

const templateComponents: Record<string, React.FC<{ resumeData: ResumeData }>> = {
  classic: Classic,
  modern: Modern,
  creative: Creative,
  elegant: Elegant,
  professional: Professional,
  minimal: Minimal,
};

// Resume Score Component
interface ResumeScoreProps {
  resumeData: ResumeData;
}

const ResumeScore: React.FC<ResumeScoreProps> = ({ resumeData }) => {
  const calculateScore = () => {
    let score = 0;
    const maxScore = 100;
    
    // Contact info (20 points)
    if (resumeData.contact.firstName && resumeData.contact.lastName) score += 5;
    if (resumeData.contact.email) score += 5;
    if (resumeData.contact.phone) score += 5;
    if (resumeData.contact.desiredJobTitle) score += 5;
    
    // Experience (25 points)
    if (resumeData.experiences.length > 0) {
      score += 10;
      const hasDetailedExp = resumeData.experiences.some(exp => 
        exp.description && exp.description.length > 50
      );
      if (hasDetailedExp) score += 15;
    }
    
    // Education (20 points)
    if (resumeData.education.length > 0) {
      score += 10;
      const hasDetailedEdu = resumeData.education.some(edu => 
        edu.description && edu.description.length > 20
      );
      if (hasDetailedEdu) score += 10;
    }
    
    // Skills (15 points)
    if (resumeData.skills.length >= 3) score += 8;
    if (resumeData.skills.length >= 6) score += 7;
    
    // Summary (10 points)
    if (resumeData.summary && resumeData.summary.length > 50) score += 10;
    
    // Additional sections (10 points)
    if (resumeData.certifications && resumeData.certifications.length > 0) score += 3;
    if (resumeData.languages && resumeData.languages.length > 0) score += 2;
    if (resumeData.websites && resumeData.websites.length > 0) score += 2;
    if (resumeData.awards && resumeData.awards.length > 0) score += 3;
    
    return Math.min(score, maxScore);
  };
  
  const score = calculateScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getScoreEmoji = (score: number) => {
    if (score >= 90) return <Flame className="w-5 h-5 text-orange-500" />;
    if (score >= 80) return <Star className="w-5 h-5 text-yellow-500" />;
    if (score >= 60) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2 shadow-sm">
            {getScoreEmoji(score)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Your resume score</h3>
            <p className="text-sm text-gray-600">Based on recruiter feedback</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type Contact = {
  firstName: string;
  lastName: string;
  desiredJobTitle: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  postCode?: string;
};

type Experience = {
  id: number;
  jobTitle: string;
  employer: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  expanded: boolean;
};

type Education = {
  id: number;
  school: string;
  location: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
  expanded: boolean;
};

type Skill = {
  id: number;
  name: string;
  level: string;
};

// Experience Section
interface ExperienceSectionProps {
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  errors: Record<string, string>;
}
const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences, setExperiences, errors }) => {
  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now(),
        jobTitle: "",
        employer: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
        expanded: true,
      },
    ]);
  };
  const updateExperience = (id: number, field: keyof Experience, value: string) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };
  const removeExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };
  const toggleExpand = (id: number) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, expanded: !exp.expanded } : exp
      )
    );
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Experience</h2>
      {experiences.map((exp, idx) => (
        <div key={exp.id} className="bg-white rounded-xl border p-6 mb-4 shadow-sm relative">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">
              Job Title, Employer Start - End
            </span>
            <div className="flex gap-2">
              <button onClick={() => toggleExpand(exp.id)} className="text-gray-400 hover:text-blue-500">
                {exp.expanded ? <>&#9650;</> : <>&#9660;</>}
              </button>
              <button onClick={() => removeExperience(exp.id)} className="text-gray-400 hover:text-red-500">
                &#128465;
              </button>
            </div>
          </div>
          {exp.expanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-gray-700 mb-1">Job Title</label>
                  <input 
                    className={`w-full border rounded-md p-2 ${errors[`exp_${exp.id}_jobTitle`] ? 'border-red-500' : ''}`}
                    value={exp.jobTitle} 
                    onChange={e => updateExperience(exp.id, 'jobTitle', e.target.value)} 
                    placeholder="Software Developer" 
                  />
                  {errors[`exp_${exp.id}_jobTitle`] && <p className="text-red-500 text-xs mt-1">{errors[`exp_${exp.id}_jobTitle`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Employer</label>
                  <input 
                    className={`w-full border rounded-md p-2 ${errors[`exp_${exp.id}_employer`] ? 'border-red-500' : ''}`}
                    value={exp.employer} 
                    onChange={e => updateExperience(exp.id, 'employer', e.target.value)} 
                    placeholder="ABC Company" 
                  />
                  {errors[`exp_${exp.id}_employer`] && <p className="text-red-500 text-xs mt-1">{errors[`exp_${exp.id}_employer`]}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="block text-gray-700 mb-1">Company</label>
                  <input 
                    className={`w-full border rounded-md p-2 ${errors[`exp_${exp.id}_company`] ? 'border-red-500' : ''}`}
                    value={exp.company} 
                    onChange={e => updateExperience(exp.id, 'company', e.target.value)} 
                    placeholder="ABC Corp" 
                  />
                  {errors[`exp_${exp.id}_company`] && <p className="text-red-500 text-xs mt-1">{errors[`exp_${exp.id}_company`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Start Date</label>
                  <input 
                    className={`w-full border rounded-md p-2 ${errors[`exp_${exp.id}_startDate`] ? 'border-red-500' : ''}`}
                    value={exp.startDate} 
                    onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} 
                    placeholder="MM/YYYY" 
                  />
                  {errors[`exp_${exp.id}_startDate`] && <p className="text-red-500 text-xs mt-1">{errors[`exp_${exp.id}_startDate`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">End Date</label>
                  <input 
                    className={`w-full border rounded-md p-2 ${errors[`exp_${exp.id}_endDate`] ? 'border-red-500' : ''}`}
                    value={exp.endDate} 
                    onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} 
                    placeholder="MM/YYYY" 
                  />
                  {errors[`exp_${exp.id}_endDate`] && <p className="text-red-500 text-xs mt-1">{errors[`exp_${exp.id}_endDate`]}</p>}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea 
                  className={`w-full border rounded-md p-2 ${errors[`exp_${exp.id}_description`] ? 'border-red-500' : ''}`}
                  value={exp.description} 
                  onChange={e => updateExperience(exp.id, 'description', e.target.value)} 
                  placeholder="Sample Text" 
                />
                {errors[`exp_${exp.id}_description`] && <p className="text-red-500 text-xs mt-1">{errors[`exp_${exp.id}_description`]}</p>}
              </div>
            </>
          )}
        </div>
      ))}
      <button onClick={addExperience} className="text-blue-600 hover:underline text-sm mt-2">+ Add Experience</button>
    </div>
  );
};

// Education Section
interface EducationSectionProps {
  educations: Education[];
  setEducations: React.Dispatch<React.SetStateAction<Education[]>>;
  errors: Record<string, string>;
}

const EducationSection: React.FC<EducationSectionProps> = ({ educations, setEducations, errors }) => {
  const [loadingId, setLoadingId] = React.useState<number | null>(null);

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now(),
        school: "",
        location: "",
        degree: "",
        startDate: "",
        endDate: "",
        description: "",
        expanded: true,
      },
    ]);
  };

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setEducations(
      educations.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const removeEducation = (id: number) => {
    setEducations(educations.filter((edu) => edu.id !== id));
  };

  const toggleExpand = (id: number) => {
    setEducations(
      educations.map((edu) =>
        edu.id === id ? { ...edu, expanded: !edu.expanded } : edu
      )
    );
  };

  // Call Gemini API for description revision
  const reviseDescription = async (id: number, description: string) => {
    if (!description.trim()) return;
    setLoadingId(id); // Start loading for this education entry
    try {
      const res = await fetch("/reviseEducationDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description }),
      });
      const data = await res.json();
      updateEducation(id, "description", data.revised_text);
    } catch (err) {
      console.error(err);
    }
    setLoadingId(null); // Stop loading
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Education</h2>
      {educations.map((edu) => (
        <div key={edu.id} className="bg-white rounded-xl border p-6 mb-4 shadow-sm relative">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">
              School Name, Location Start - End
            </span>
            <div className="flex gap-2">
              <button onClick={() => toggleExpand(edu.id)} className="text-gray-400 hover:text-blue-500">
                {edu.expanded ? <>&#9650;</> : <>&#9660;</>}
              </button>
              <button onClick={() => removeEducation(edu.id)} className="text-gray-400 hover:text-red-500">
                &#128465;
              </button>
            </div>
          </div>
          {edu.expanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-gray-700 mb-1">School Name</label>
                  <input
                    className={`w-full border rounded-md p-2 ${errors[`edu_${edu.id}_school`] ? 'border-red-500' : ''}`}
                    value={edu.school}
                    onChange={e => updateEducation(edu.id, 'school', e.target.value)}
                    placeholder="UCLA"
                  />
                  {errors[`edu_${edu.id}_school`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${edu.id}_school`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Location</label>
                  <input
                    className={`w-full border rounded-md p-2 ${errors[`edu_${edu.id}_location`] ? 'border-red-500' : ''}`}
                    value={edu.location}
                    onChange={e => updateEducation(edu.id, 'location', e.target.value)}
                    placeholder="New York"
                  />
                  {errors[`edu_${edu.id}_location`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${edu.id}_location`]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="block text-gray-700 mb-1">Degree</label>
                  <input
                    className={`w-full border rounded-md p-2 ${errors[`edu_${edu.id}_degree`] ? 'border-red-500' : ''}`}
                    value={edu.degree}
                    onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Information Tech"
                  />
                  {errors[`edu_${edu.id}_degree`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${edu.id}_degree`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Start Date</label>
                  <input
                    className={`w-full border rounded-md p-2 ${errors[`edu_${edu.id}_startDate`] ? 'border-red-500' : ''}`}
                    value={edu.startDate}
                    onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                  {errors[`edu_${edu.id}_startDate`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${edu.id}_startDate`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">End Date</label>
                  <input
                    className={`w-full border rounded-md p-2 ${errors[`edu_${edu.id}_endDate`] ? 'border-red-500' : ''}`}
                    value={edu.endDate}
                    onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                  {errors[`edu_${edu.id}_endDate`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${edu.id}_endDate`]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  className={`w-full border rounded-md p-2 ${errors[`edu_${edu.id}_description`] ? 'border-red-500' : ''}`}
                  value={edu.description}
                  onChange={e => updateEducation(edu.id, 'description', e.target.value)}
                  placeholder="Sample Text"
                />
                {errors[`edu_${edu.id}_description`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${edu.id}_description`]}</p>}

                <button
                  onClick={() => reviseDescription(edu.id, edu.description)}
                  disabled={loadingId === edu.id}
                  className={`mt-2 px-3 py-1 text-white rounded transition ${
                    loadingId === edu.id ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loadingId === edu.id ? "Asking AI for assistance..." : "Revise Summary"}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      <button onClick={addEducation} className="text-blue-600 hover:underline text-sm mt-2">+ Add Education</button>
    </div>
  );
};

// Skills Section
interface SkillsSectionProps {
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  showExperienceLevel: boolean;
  setShowExperienceLevel: React.Dispatch<React.SetStateAction<boolean>>;
  errors: Record<string, string>;
}

const skillLevels = ["Novice", "Beginner", "Skillful", "Experienced", "Expert"];

const getOpacity = (level: string): number => {
  switch (level) {
    case "Novice":
      return 0.2;
    case "Beginner":
      return 0.4;
    case "Skillful":
      return 0.6;
    case "Experienced":
      return 0.8;
    case "Expert":
      return 1.0;
    default:
      return 0.3;
  }
};

const SkillLevelSlider = ({
  level,
  onChange,
  show = true,
}: {
  level: string;
  onChange: (level: string) => void;
  show?: boolean;
}) => {
  const isActive = show;

  return (
    <div
      className={`flex flex-col items-center w-80 transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-30 pointer-events-none"
      }`}
    >
      <div className="text-sm font-medium text-gray-700 mb-1 w-full text-left">
        Level - <span className="text-blue-500">{level}</span>
      </div>
      <div
        className={`relative flex h-12 w-full ${
          isActive ? "bg-blue-200" : "bg-slate-200"
        } rounded-md overflow-hidden`}
      >
        {/* Animated Highlight */}
        <motion.div
          className="absolute top-0 bottom-0 rounded-md"
          initial={false}
          animate={{
            left: `${skillLevels.indexOf(level) * 20}%`,
            width: "20%",
            backgroundColor: `rgba(96, 165, 250, ${getOpacity(level)})`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Clickable Segments */}
        {skillLevels.map((skillLevel, index) => (
          <div
            key={skillLevel}
            onClick={() => isActive && onChange(skillLevel)}
            title={skillLevel}
            className="flex-1 z-10 flex items-center justify-center cursor-pointer relative"
          >
            {/* Vertical divider */}
            {index < skillLevels.length - 1 && (
              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-blue-400 opacity-70" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, setSkills, showExperienceLevel, setShowExperienceLevel, errors }) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  const addSkill = () => {
    setSkills([...skills, { id: Date.now(), name: "", level: "Novice" }]);
  };
  const updateSkill = (id: number, field: keyof Skill, value: string) => {
    setSkills(skills.map(skill => skill.id === id ? { ...skill, [field]: value } : skill));
  };
  const removeSkill = (id: number) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleDragStart = (index: number) => setDraggedItem(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    const newSkills = [...skills];
    const [removed] = newSkills.splice(draggedItem, 1);
    newSkills.splice(dropIndex, 0, removed);
    setSkills(newSkills);
    setDraggedItem(null);
  };


  return (
    <div className="skills-container">
      <h2 className="text-2xl font-bold mb-2">Skills</h2>
      <p className="text-gray-600 mb-6">
        Add your most relevant professional skills.
      </p>

      {/* Experience Level Toggle */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setShowExperienceLevel(!showExperienceLevel)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showExperienceLevel ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              showExperienceLevel ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">
          Show experience level
        </span>
      </div>

      {/* Skills List */}
      <div className="space-y-3 mb-4">
        {skills.map((skill, index) => (
          <div
            key={skill.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-move"
          >
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
            <div className="w-[50%] px-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
              <input
                type="text"
                value={skill.name}
                onChange={(e) =>
                  updateSkill(skill.id, "name", e.target.value)
                }
                placeholder="Enter skill"
                className="w-full h-12 p-2 border border-gray-200 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <SkillLevelSlider
              level={skill.level}
              onChange={(level) =>
                updateSkill(skill.id, "level", level)
              }
              show={showExperienceLevel}
            />
            <button
              onClick={() => {
                removeSkill(skill.id);}}
              className="flex items-center mt-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              &#128465;
            </button>

          </div>
        ))}
      </div>
      {/* Add Skill Button */}
      <button
        onClick={addSkill}
        className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        aria-label="Add new skill"
      >
        + Add Skill
      </button>

    </div>
  );
};

// Summary Section
// 8/12/2025 Modfified Summary text area to allow for AI Improve button
const summarySuggestions = [
  "Detail-oriented professional with 3+ years of experience in [field]. Skilled in [key skills]. Seeking to contribute to [type of team/company or goal].",
  "Motivated recent graduate with a background in [field]. Eager to apply skills in [skill area] and grow within a dynamic organization.",
  "Creative thinker with a passion for [field]. Experienced in [tools or platforms]. Looking to bring fresh ideas.",
  "Results-driven professional with expertise in [field]. Proven track record of [achievement]. Ready to take on new challenges.",
];
interface SummarySectionProps {
  summary: string;
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  errors: Record<string, string>;
}
const SummarySection: React.FC<SummarySectionProps> = ({ summary, setSummary, errors }) => {
  const [loading, setLoading] = React.useState(false);

  const handleRevise = async () => {
    if (!summary.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/revise-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summary }),
      });

      const data = await res.json();
      setSummary(data.revised_text);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Summary</h2>
      <p className="text-gray-600 mb-6">
        Write a short introduction that highlights your experience, key skills, and career goals.
      </p>

      <label className="block text-gray-700 mb-1">Professional Summary</label>
      <textarea
        className={`w-full border rounded-md p-3 mb-4 ${errors.summary ? "border-red-500" : ""}`}
        value={summary}
        onChange={e => setSummary(e.target.value)}
        placeholder="Write your summary here..."
        rows={4}
      />

      {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}

      {/* Revise button */}
      <button
        onClick={handleRevise}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {loading ? "Revising..." : "Improve Summary using AI"}
      </button>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="font-semibold mb-2">Suggested summary structure</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {summarySuggestions.map((s, i) => (
            <button
              key={i}
              className="text-left bg-white border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition"
              onClick={() => setSummary(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


// Finalize Section
const finalizeSections = [
  { icon: "🌐", label: "Languages", description: "Add languages you speak and proficiency levels" },
  { icon: "📜", label: "Certifications", description: "Include professional certifications and licenses" },
  { icon: "🏆", label: "Awards", description: "List awards, honors, and achievements" },
  { icon: "🌍", label: "Websites", description: "Add portfolio, LinkedIn, or other professional links" },
  { icon: "👤", label: "References", description: "Include professional references" },
  { icon: "❤️", label: "Hobbies", description: "Add relevant hobbies and interests" },
  { icon: "➕", label: "Custom Sections", description: "Create additional sections as needed" },
];

interface FinalizeSectionProps {
  onAddSection: (sectionType: string) => void;
  languages: Language[];
  setLanguages: React.Dispatch<React.SetStateAction<Language[]>>;
  certifications: Certification[];
  setCertifications: React.Dispatch<React.SetStateAction<Certification[]>>;
  awards: Award[];
  setAwards: React.Dispatch<React.SetStateAction<Award[]>>;
  websites: Website[];
  setWebsites: React.Dispatch<React.SetStateAction<Website[]>>;
  references: Reference[];
  setReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
  hobbies: Hobby[];
  setHobbies: React.Dispatch<React.SetStateAction<Hobby[]>>;
  customSections: CustomSection[];
  setCustomSections: React.Dispatch<React.SetStateAction<CustomSection[]>>;
}

const FinalizeSection: React.FC<FinalizeSectionProps> = ({ 
  onAddSection,
  languages,
  setLanguages,
  certifications,
  setCertifications,
  awards,
  setAwards,
  websites,
  setWebsites,
  references,
  setReferences,
  hobbies,
  setHobbies,
  customSections,
  setCustomSections
}) => (
  <div>
    <h2 className="text-2xl font-bold mb-2">Additional Sections</h2>
    <p className="text-gray-600 mb-6">
      Add certifications, languages, awards, or any extra details you want recruiters to see.
    </p>
    
    {/* Currently Added Sections */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Currently Added Sections</h3>
      
      {/* Certifications Section */}
      {certifications.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📜</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Certifications and licenses</h3>
                <p className="text-sm text-gray-600">Add credentials that back up your expertise</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600">
                <span>▼</span>
              </button>
              <button 
                onClick={() => setCertifications([])}
                className="text-gray-400 hover:text-red-500"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {certifications.map((cert, index) => (
              <div key={cert.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  value={cert.title}
                  onChange={(e) => {
                    const newCerts = [...certifications];
                    newCerts[index].title = e.target.value;
                    setCertifications(newCerts);
                  }}
                  placeholder="Enter certification title"
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setCertifications([...certifications, { id: Date.now(), title: '' }])}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add certification
          </button>
        </div>
      )}

      {/* Languages Section */}
      {languages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🌐</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Languages</h3>
                <p className="text-sm text-gray-600">Add languages you speak and proficiency levels</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600">
                <span>▼</span>
              </button>
              <button 
                onClick={() => setLanguages([])}
                className="text-gray-400 hover:text-red-500"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {languages.map((lang, index) => (
              <div key={lang.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => {
                    const newLangs = [...languages];
                    newLangs[index].name = e.target.value;
                    setLanguages(newLangs);
                  }}
                  placeholder="Language"
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <select
                  value={lang.proficiency || ''}
                  onChange={(e) => {
                    const newLangs = [...languages];
                    newLangs[index].proficiency = e.target.value;
                    setLanguages(newLangs);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Select level</option>
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
                <button
                  onClick={() => setLanguages(languages.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setLanguages([...languages, { id: Date.now(), name: '', proficiency: '' }])}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add language
          </button>
        </div>
      )}

      {/* Awards Section */}
      {awards.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🏆</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Awards and honors</h3>
                <p className="text-sm text-gray-600">List awards, honors, and achievements</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600">
                <span>▼</span>
              </button>
              <button 
                onClick={() => setAwards([])}
                className="text-gray-400 hover:text-red-500"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {awards.map((award, index) => (
              <div key={award.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  value={award.title}
                  onChange={(e) => {
                    const newAwards = [...awards];
                    newAwards[index].title = e.target.value;
                    setAwards(newAwards);
                  }}
                  placeholder="Enter award title"
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setAwards(awards.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setAwards([...awards, { id: Date.now(), title: '' }])}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add award
          </button>
        </div>
      )}

      {/* Websites Section */}
      {websites.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🔗</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Websites and social media</h3>
                <p className="text-sm text-gray-600">Share your portfolio, blog, LinkedIn, or other related websites</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600">
                <span>▼</span>
              </button>
              <button 
                onClick={() => setWebsites([])}
                className="text-gray-400 hover:text-red-500"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {websites.map((site, index) => (
              <div key={site.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  value={site.label}
                  onChange={(e) => {
                    const newSites = [...websites];
                    newSites[index].label = e.target.value;
                    setWebsites(newSites);
                  }}
                  placeholder="Label (e.g., Portfolio, LinkedIn)"
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <input
                  type="url"
                  value={site.url}
                  onChange={(e) => {
                    const newSites = [...websites];
                    newSites[index].url = e.target.value;
                    setWebsites(newSites);
                  }}
                  placeholder="URL"
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setWebsites(websites.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setWebsites([...websites, { id: Date.now(), label: '', url: '' }])}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add website
          </button>
        </div>
      )}

      {/* References Section */}
      {references.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🤝</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">References</h3>
                <p className="text-sm text-gray-600">Add professional references and contacts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600">
                <span>▼</span>
              </button>
              <button 
                onClick={() => setReferences([])}
                className="text-gray-400 hover:text-red-500"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {references.map((ref, index) => (
              <div key={ref.id} className="p-2 bg-gray-50 rounded space-y-2">
                <input
                  type="text"
                  value={ref.name}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index].name = e.target.value;
                    setReferences(newRefs);
                  }}
                  placeholder="Reference name"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  value={ref.relationship || ''}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index].relationship = e.target.value;
                    setReferences(newRefs);
                  }}
                  placeholder="Relationship (e.g., Manager, Colleague)"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  value={ref.contactInfo || ''}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index].contactInfo = e.target.value;
                    setReferences(newRefs);
                  }}
                  placeholder="Contact info (email, phone)"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setReferences(references.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  × Remove reference
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setReferences([...references, { id: Date.now(), name: '', relationship: '', contactInfo: '' }])}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add reference
          </button>
        </div>
      )}

      {/* Hobbies Section */}
      {hobbies.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🎮</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Hobbies and interests</h3>
                <p className="text-sm text-gray-600">Share your personal interests and activities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600">
                <span>▼</span>
              </button>
              <button 
                onClick={() => setHobbies([])}
                className="text-gray-400 hover:text-red-500"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {hobbies.map((hobby, index) => (
              <div key={hobby.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  value={hobby.name}
                  onChange={(e) => {
                    const newHobbies = [...hobbies];
                    newHobbies[index].name = e.target.value;
                    setHobbies(newHobbies);
                  }}
                  placeholder="Enter hobby or interest"
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setHobbies(hobbies.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setHobbies([...hobbies, { id: Date.now(), name: '' }])}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add hobby
          </button>
        </div>
      )}
    </div>

    {/* Sections to Add */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Sections to Add</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Certifications */}
        {certifications.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📜</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Certifications and licenses</h3>
                  <p className="text-sm text-gray-600">Add credentials that back up your expertise</p>
                </div>
              </div>
              <button
                onClick={() => setCertifications([{ id: Date.now(), title: '' }])}
                className="text-blue-500 hover:text-blue-700 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🌐</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Languages</h3>
                  <p className="text-sm text-gray-600">Add languages you speak and proficiency levels</p>
                </div>
              </div>
              <button
                onClick={() => setLanguages([{ id: Date.now(), name: '', proficiency: '' }])}
                className="text-blue-500 hover:text-blue-700 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🏆</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Awards and honors</h3>
                  <p className="text-sm text-gray-600">List awards, honors, and achievements</p>
                </div>
              </div>
              <button
                onClick={() => setAwards([{ id: Date.now(), title: '' }])}
                className="text-blue-500 hover:text-blue-700 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Websites */}
        {websites.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🔗</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Websites and social media</h3>
                  <p className="text-sm text-gray-600">Share your portfolio, blog, LinkedIn, or other related websites</p>
                </div>
              </div>
              <button
                onClick={() => setWebsites([{ id: Date.now(), label: '', url: '' }])}
                className="text-blue-500 hover:text-blue-700 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* References */}
        {references.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🤝</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">References</h3>
                  <p className="text-sm text-gray-600">Add professional references and contacts</p>
                </div>
              </div>
                             <button
                 onClick={() => setReferences([{ id: Date.now(), name: '', relationship: '', contactInfo: '' }])}
                 className="text-blue-500 hover:text-blue-700 text-lg font-bold"
               >
                +
              </button>
            </div>
          </div>
        )}

        {/* Hobbies */}
        {hobbies.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🎮</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Hobbies and interests</h3>
                  <p className="text-sm text-gray-600">Share your personal interests and activities</p>
                </div>
              </div>
              <button
                onClick={() => setHobbies([{ id: Date.now(), name: '' }])}
                className="text-blue-500 hover:text-blue-700 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const steps = ["Contacts", "Experience", "Education", "Skills", "Summary", "Finalize"];

interface BuilderProps {
  hasPendingPayments?: boolean;
  pendingResumesCount?: number;
  editingResumeId?: number;
  editingResumeName?: string;
  editingResumeData?: any;
  editingTemplateName?: string;
}

const Builder: React.FC<BuilderProps> = ({ 
  hasPendingPayments = false, 
  pendingResumesCount = 0,
  editingResumeId,
  editingResumeName,
  editingResumeData,
  editingTemplateName
}) => {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split('?')[1]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Preview zoom and scroll states
  const [zoomLevel, setZoomLevel] = useState(0.6); // Start with a smaller zoom to see full resume
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);


  
  // Zoom control functions with smooth transitions
  const handleZoomIn = () => {
    setIsZooming(true);
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
    setTimeout(() => setIsZooming(false), 300);
  };
  
  const handleZoomOut = () => {
    setIsZooming(true);
    setZoomLevel(prev => Math.max(prev - 0.2, 0.25));
    setTimeout(() => setIsZooming(false), 300);
  };
  
  const handleZoomReset = () => {
    setIsZooming(true);
    setZoomLevel(1);
    setTimeout(() => setIsZooming(false), 300);
  };
  
  const handleFitToScreen = () => {
    setIsZooming(true);
    // Calculate fit-to-screen zoom level based on available container size
    const containerHeight = isFullscreen ? window.innerHeight - 60 : 600; // Account for control panel height
    const containerWidth = isFullscreen ? window.innerWidth - 40 : 400;
    const resumeHeight = 297 * 3.78; // A4 height in pixels
    const resumeWidth = 210 * 3.78; // A4 width in pixels
    
    // Calculate zoom to fit both width and height with padding
    const heightFit = containerHeight / resumeHeight;
    const widthFit = containerWidth / resumeWidth;
    const fitZoom = Math.min(heightFit, widthFit);
    const finalZoom = Math.max(fitZoom * 0.85, 0.25);
    
    setZoomLevel(finalZoom); // 85% of fit size for comfortable padding
    setTimeout(() => setIsZooming(false), 300);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  // Keyboard shortcuts for zoom controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);
  
  // Get template name and resume ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTemplateName = urlParams.get('template') || 'classic';
  const existingResumeId = urlParams.get('resume');
  
  // State for template name - will be set from existing resume or URL parameter
  const [templateName, setTemplateName] = useState(defaultTemplateName);
  
  // Add debugging for template initialization
  console.log('Builder - Template initialization:', {
    defaultTemplateName,
    existingResumeId,
    editingResumeId,
    editingResumeData: editingResumeData ? 'present' : 'not present',
    editingTemplateName
  });
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact>({
    firstName: "",
    lastName: "",
    desiredJobTitle: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    postCode: "",
  });
  
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: Date.now(),
      jobTitle: "Software Developer",
      employer: "ABC Company",
      company: "ABC Corp",
      startDate: "",
      endDate: "",
      description: "Sample Text",
      expanded: true,
    },
  ]);
  const [educations, setEducations] = useState<Education[]>([
    {
      id: Date.now() + 1,
      school: "UCLA",
      location: "New York",
      degree: "Bachelor of Science in Information Tech",
      startDate: "",
      endDate: "",
      description: "Sample Text",
      expanded: true,
    },
  ]);
  const [skills, setSkills] = useState<Skill[]>([{ id: Date.now(), name: "", level: "Novice" }]);
  const [showExperienceLevel, setShowExperienceLevel] = useState(false);
  const [summary, setSummary] = useState("");
  
  // Additional sections state
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  



  // ResumeData state for template system
  const [resumeData, setResumeData] = useState<ResumeData>({
    contact: {
      firstName: '',
      lastName: '',
      desiredJobTitle: '',
      phone: '',
      email: '',
      country: '',
      city: '',
      address: '',
      postCode: '',
    },
    experiences: [],
    education: [],
    skills: [],
    summary: '',
    languages: [],
    certifications: [],
    awards: [],
    websites: [],
    references: [],
    hobbies: [],
    customSections: [],

  });

  const TemplateComponent = templateComponents[templateName] || Classic;

  // Load existing resume or create new one
  useEffect(() => {
    const initializeResume = async () => {
      try {
        // Check if we're editing an existing resume (from props or URL)
        const urlParams = new URLSearchParams(window.location.search);
        const urlResumeId = urlParams.get('resume');
        const urlTemplate = urlParams.get('template');
        const resumeIdToUse = editingResumeId || (urlResumeId ? parseInt(urlResumeId) : null);
        
        if (resumeIdToUse) {
          // We have a specific resume ID - load it (either from URL or props)
          console.log('Loading existing resume with ID:', resumeIdToUse);
          
          // If we have editing data from props, use it
          if (editingResumeData) {
            console.log('Using editing data from props:', editingResumeData);
            const resumeData = editingResumeData;
            
            // Set resume ID
            setResumeId(Number(resumeIdToUse));
            
            // Set template name from props (highest priority)
            if (editingTemplateName) {
              console.log('Builder - Setting template from props:', editingTemplateName);
              setTemplateName(editingTemplateName);
            }
            
            // Load resume data
            if (resumeData) {
              if (resumeData.contact) {
                setContacts(resumeData.contact);
              }
              if (resumeData.experiences) {
                setExperiences(resumeData.experiences);
              }
              if (resumeData.educations) {
                setEducations(resumeData.educations);
              }
              if (resumeData.skills) {
                setSkills(resumeData.skills);
              }
              if (resumeData.summary) {
                setSummary(resumeData.summary);
              }
              if (resumeData.showExperienceLevel !== undefined) {
                setShowExperienceLevel(resumeData.showExperienceLevel);
              }
              if (resumeData.languages) {
                setLanguages(resumeData.languages);
              }
              if (resumeData.certifications) {
                setCertifications(resumeData.certifications);
              }
              if (resumeData.awards) {
                setAwards(resumeData.awards);
              }
              if (resumeData.websites) {
                setWebsites(resumeData.websites);
              }
              if (resumeData.references) {
                setReferences(resumeData.references);
              }
              if (resumeData.hobbies) {
                setHobbies(resumeData.hobbies);
              }
              if (resumeData.customSections) {
                setCustomSections(resumeData.customSections);
              }

            }
            
            console.log('Loaded existing resume data from props:', resumeData);
            console.log('Builder - Template from props (editingResumeData):', editingResumeData?.templateName);
          } else {
            // Load existing resume data from API
            const response = await fetch(`/resumes/${resumeIdToUse}`, {
              headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
              },
            });
            
            if (response.ok) {
              const result = await response.json();
              const resumeData = result.resume.resume_data;
              
              // Set resume ID
              setResumeId(Number(result.resume.id));
              
              // Set template name from existing resume
              console.log('Builder - Loading template from database:', result.resume.template_name);
              if (result.resume.template_name) {
                setTemplateName(result.resume.template_name);
                console.log('Builder - Template set to:', result.resume.template_name);
              } else {
                console.log('Builder - No template_name in database, keeping current:', templateName);
              }
              
              // Load resume data
              if (resumeData) {
                if (resumeData.contact) {
                  setContacts(resumeData.contact);
                }
                if (resumeData.experiences) {
                  setExperiences(resumeData.experiences);
                }
                if (resumeData.educations) {
                  setEducations(resumeData.educations);
                }
                if (resumeData.skills) {
                  setSkills(resumeData.skills);
                }
                if (resumeData.summary) {
                  setSummary(resumeData.summary);
                }
                if (resumeData.showExperienceLevel !== undefined) {
                  setShowExperienceLevel(resumeData.showExperienceLevel);
                }
                if (resumeData.languages) {
                  setLanguages(resumeData.languages);
                }
                if (resumeData.certifications) {
                  setCertifications(resumeData.certifications);
                }
                if (resumeData.awards) {
                  setAwards(resumeData.awards);
                }
                if (resumeData.websites) {
                  setWebsites(resumeData.websites);
                }
                if (resumeData.references) {
                  setReferences(resumeData.references);
                }
                if (resumeData.hobbies) {
                  setHobbies(resumeData.hobbies);
                }
                if (resumeData.customSections) {
                  setCustomSections(resumeData.customSections);
                }

              }
              
              console.log('Loaded existing resume data from API:', resumeData);
            } else {
              console.error('Failed to load existing resume');
              // Fallback to creating new resume
              await createNewResume();
            }
          }
        } else if (searchParams.get('template')) {
          // User came with template parameter - they want to create a NEW resume
          console.log('User creating new resume with template:', searchParams.get('template'));
          console.log('Ignoring any existing resume data from server');
          await createNewResume();
        } else {
          // No resume ID and no template - this is likely a refresh scenario
          // Check if we have editing data from props (server-side loaded recent draft)
          if (editingResumeId && editingResumeData) {
            console.log('Loading recent draft from server props (refresh scenario):', editingResumeId);
            setResumeId(editingResumeId);
            
            // Update URL to include the resume ID to prevent issues on refresh
            const currentUrl = new URL(window.location.href);
            if (!currentUrl.searchParams.has('resume')) {
              currentUrl.searchParams.set('resume', editingResumeId.toString());
              window.history.replaceState({}, '', currentUrl.toString());
              console.log('Updated URL to include resume ID:', editingResumeId);
            }
            
            // Set template name from props
            if (editingTemplateName) {
              console.log('Builder - Setting template from props (recent draft):', editingTemplateName);
              setTemplateName(editingTemplateName);
            }
            
            // Load resume data
            const resumeData = editingResumeData;
            if (resumeData) {
              if (resumeData.contact) {
                setContacts(resumeData.contact);
              }
              if (resumeData.experiences) {
                setExperiences(resumeData.experiences);
              }
              if (resumeData.educations) {
                setEducations(resumeData.educations);
              }
              if (resumeData.skills) {
                setSkills(resumeData.skills);
              }
              if (resumeData.summary) {
                setSummary(resumeData.summary);
              }
              if (resumeData.showExperienceLevel !== undefined) {
                setShowExperienceLevel(resumeData.showExperienceLevel);
              }
              if (resumeData.languages) {
                setLanguages(resumeData.languages);
              }
              if (resumeData.certifications) {
                setCertifications(resumeData.certifications);
              }
              if (resumeData.awards) {
                setAwards(resumeData.awards);
              }
              if (resumeData.websites) {
                setWebsites(resumeData.websites);
              }
              if (resumeData.references) {
                setReferences(resumeData.references);
              }
              if (resumeData.hobbies) {
                setHobbies(resumeData.hobbies);
              }
              if (resumeData.customSections) {
                setCustomSections(resumeData.customSections);
              }

            }
            
            console.log('Loaded recent draft from server props:', resumeData);
          } else {
            // Only create new resume as last resort
          await createNewResume();
          }
        }
      } catch (error) {
        console.error('Error initializing resume:', error);
        // Fallback to creating new resume
        await createNewResume();
      } finally {
        setIsLoading(false);
      }
    };

    const createNewResume = async () => {
      try {
        console.log('Creating new resume...');
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        console.log('CSRF Token:', csrfToken ? 'Present' : 'Missing');
        
        const requestBody = {
          name: 'My Resume',
          template_name: templateName,
          resume_data: {
            contact: contacts,
            experiences,
            educations,
            skills,
            summary,
            showExperienceLevel,
            languages,
            certifications,
            awards,
            websites,
            references,
            hobbies,
            customSections
          }
        };
        
        console.log('Request body:', requestBody);
        
        const response = await fetch('/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const result = await response.json();
          console.log('Resume created with ID:', result.resume.id);
          setResumeId(result.resume.id);
          
          // Update URL to include the new resume ID
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('resume', result.resume.id.toString());
          window.history.replaceState({}, '', currentUrl.toString());
          console.log('Updated URL with new resume ID:', result.resume.id);
        } else {
          const errorText = await response.text();
          console.error('Failed to create initial resume. Status:', response.status);
          console.error('Response text:', errorText);
          
          // Try to parse as JSON if possible
          try {
            const errorJson = JSON.parse(errorText);
            console.error('Error details:', errorJson);
          } catch (e) {
            console.error('Response is not JSON:', errorText.substring(0, 200));
          }
        }
      } catch (error) {
        console.error('Error creating initial resume:', error);
      }
    };

    initializeResume();
  }, [editingResumeId, editingResumeData, editingTemplateName]);

  // Function to update resume data in real-time
  const updateResumeData = async (newData: any) => {
    if (!resumeId || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          resume_data: newData,
          template_name: templateName
        })
      });
      
      if (response.ok) {
        console.log('Resume updated successfully with data:', newData);
      } else {
        console.error('Failed to update resume');
      }
    } catch (error) {
      console.error('Error updating resume:', error);
    } finally {
      setIsUpdating(false);
    }
  };



  // Keep resumeData state in sync with form state for template preview
  useEffect(() => {
    setResumeData({
      contact: contacts,
      experiences: experiences as any, // Temporary fix for type mismatch
      education: educations,
      skills,
      summary,
      showExperienceLevel,
      languages,
      certifications,
      awards,
      websites,
      references,
      hobbies,
      customSections,

    });
  }, [contacts, experiences, educations, skills, summary, showExperienceLevel, languages, certifications, awards, websites, references, hobbies, customSections]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((newData: any) => {
      updateResumeData(newData);
    }, 1000),
    [resumeId]
  );

  // Update resume whenever data changes
  useEffect(() => {
    if (resumeId) {
      const resumeData = {
        contact: contacts,
        experiences,
        educations,
        skills,
        summary,
        showExperienceLevel,
        languages,
        certifications,
        awards,
        websites,
        references,
        hobbies,
        customSections
      };
      debouncedUpdate(resumeData);
    }
  }, [contacts, experiences, educations, skills, summary, showExperienceLevel, languages, certifications, awards, websites, references, hobbies, customSections, resumeId, debouncedUpdate]);

  // Update template name when it changes
  useEffect(() => {
    if (resumeId) {
      const updateTemplateName = async () => {
        try {
          const response = await fetch(`/resumes/${resumeId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ template_name: templateName })
          });
          
          if (response.ok) {
            console.log('Template name updated successfully:', templateName);
          }
        } catch (error) {
          console.error('Error updating template name:', error);
        }
      };
      
      updateTemplateName();
    }
  }, [templateName, resumeId]);

  // Update resume name when contact info changes
  useEffect(() => {
    if (resumeId && contacts.firstName && contacts.lastName) {
      const resumeName = `${contacts.firstName} ${contacts.lastName}`.trim();
      if (resumeName) {
        updateResumeName(resumeName);
      }
    }
  }, [contacts.firstName, contacts.lastName, resumeId]);

  // Function to update resume name
  const updateResumeName = async (name: string) => {
    if (!resumeId || isUpdating) return;
    
    try {
      const response = await fetch(`/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ name })
      });
      
      if (response.ok) {
        console.log('Resume name updated successfully');
      }
    } catch (error) {
      console.error('Error updating resume name:', error);
    }
  };

  // Function to finalize resume
  const finalizeResume = async (resumeIdToUse: number) => {
    try {
      console.log('Finalizing resume with ID:', resumeIdToUse);
      
      // Store data in sessionStorage for the FinalCheck page
      const resumeData = {
        contact: contacts,
        experiences,
        educations,
        skills,
        summary,
  
        showExperienceLevel,
        languages,
        certifications,
        awards,
        websites,
        references,
        hobbies,
        customSections,
        templateName
      };
      sessionStorage.setItem('resumeData', JSON.stringify(resumeData));
      
      // Navigate to Final Check with the resume ID
      const finalCheckUrl = `/final-check?resume=${resumeIdToUse}`;
      console.log('Navigating to:', finalCheckUrl);
      window.location.href = finalCheckUrl;
    } catch (error) {
      console.error('Error finalizing resume:', error);
      alert('Error finalizing resume. Please try again.');
    }
  };

  // Validation function
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    console.log('Validating step:', currentStep);
    console.log('Current contacts data:', contacts);

    switch (currentStep) {
      case 0: // Contacts
        if (!contacts.firstName || !contacts.firstName.trim()) newErrors.firstName = "First name is required";
        if (!contacts.lastName || !contacts.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!contacts.desiredJobTitle || !contacts.desiredJobTitle.trim()) newErrors.desiredJobTitle = "Desired job title is required";
        if (!contacts.phone || !contacts.phone.trim()) newErrors.phone = "Phone number is required";
        if (!contacts.email || !contacts.email.trim()) newErrors.email = "Email is required";
        break;

      case 1: // Experience
        experiences.forEach((exp) => {
          if (!exp.jobTitle || !exp.jobTitle.trim()) newErrors[`exp_${exp.id}_jobTitle`] = "Job title is required";
          if (!exp.employer || !exp.employer.trim()) newErrors[`exp_${exp.id}_employer`] = "Employer is required";
          if (!exp.company || !exp.company.trim()) newErrors[`exp_${exp.id}_company`] = "Company is required";
          if (!exp.startDate || !exp.startDate.trim()) newErrors[`exp_${exp.id}_startDate`] = "Start date is required";
          if (!exp.endDate || !exp.endDate.trim()) newErrors[`exp_${exp.id}_endDate`] = "End date is required";
          if (!exp.description || !exp.description.trim()) newErrors[`exp_${exp.id}_description`] = "Description is required";
        });
        break;

      case 2: // Education
        educations.forEach((edu) => {
          if (!edu.school || !edu.school.trim()) newErrors[`edu_${edu.id}_school`] = "School name is required";
          if (!edu.location || !edu.location.trim()) newErrors[`edu_${edu.id}_location`] = "Location is required";
          if (!edu.degree || !edu.degree.trim()) newErrors[`edu_${edu.id}_degree`] = "Degree is required";
          if (!edu.startDate || !edu.startDate.trim()) newErrors[`edu_${edu.id}_startDate`] = "Start date is required";
          if (!edu.endDate || !edu.endDate.trim()) newErrors[`edu_${edu.id}_endDate`] = "End date is required";
          if (!edu.description || !edu.description.trim()) newErrors[`edu_${edu.id}_description`] = "Description is required";
        });
        break;

      case 3: // Skills
        skills.forEach((skill) => {
          if (!skill.name || !skill.name.trim()) newErrors[`skill_${skill.id}_name`] = "Skill name is required";
        });
        break;

      case 4: // Summary
        if (!summary || !summary.trim()) newErrors.summary = "Summary is required";
        break;

      case 5: // Finalize - no validation needed
        break;
    }

    console.log('Validation errors found:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to clear individual field errors
  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };



  const handleNext = () => {
    console.log('handleNext called');
    
    // Get validation result and error count directly
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Contacts
        if (!contacts.firstName || !contacts.firstName.trim()) newErrors.firstName = "First name is required";
        if (!contacts.lastName || !contacts.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!contacts.desiredJobTitle || !contacts.desiredJobTitle.trim()) newErrors.desiredJobTitle = "Desired job title is required";
        if (!contacts.phone || !contacts.phone.trim()) newErrors.phone = "Phone number is required";
        if (!contacts.email || !contacts.email.trim()) newErrors.email = "Email is required";
        break;
      case 1: // Experience
        experiences.forEach((exp) => {
          if (!exp.jobTitle || !exp.jobTitle.trim()) newErrors[`exp_${exp.id}_jobTitle`] = "Job title is required";
          if (!exp.employer || !exp.employer.trim()) newErrors[`exp_${exp.id}_employer`] = "Employer is required";
          if (!exp.company || !exp.company.trim()) newErrors[`exp_${exp.id}_company`] = "Company is required";
          if (!exp.startDate || !exp.startDate.trim()) newErrors[`exp_${exp.id}_startDate`] = "Start date is required";
          if (!exp.endDate || !exp.endDate.trim()) newErrors[`exp_${exp.id}_endDate`] = "End date is required";
          if (!exp.description || !exp.description.trim()) newErrors[`exp_${exp.id}_description`] = "Description is required";
        });
        break;
      case 2: // Education
        educations.forEach((edu) => {
          if (!edu.school || !edu.school.trim()) newErrors[`edu_${edu.id}_school`] = "School name is required";
          if (!edu.location || !edu.location.trim()) newErrors[`edu_${edu.id}_location`] = "Location is required";
          if (!edu.degree || !edu.degree.trim()) newErrors[`edu_${edu.id}_degree`] = "Degree is required";
          if (!edu.startDate || !edu.startDate.trim()) newErrors[`edu_${edu.id}_startDate`] = "Start date is required";
          if (!edu.endDate || !edu.endDate.trim()) newErrors[`edu_${edu.id}_endDate`] = "End date is required";
          if (!edu.description || !edu.description.trim()) newErrors[`edu_${edu.id}_description`] = "Description is required";
        });
        break;
      case 3: // Skills
        skills.forEach((skill) => {
          if (!skill.name || !skill.name.trim()) newErrors[`skill_${skill.id}_name`] = "Skill name is required";
        });
        break;
      case 4: // Summary
        if (!summary || !summary.trim()) newErrors.summary = "Summary is required";
        break;
    }
    
    console.log('New errors found:', newErrors);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Validation result:', isValid);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      // Scroll to top to show validation errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ValidationHolder 
          contacts={contacts} 
          setContacts={setContacts} 
          errors={errors}
          onClearError={clearError}
        />;
      case 1:
        return <ExperienceSection experiences={experiences} setExperiences={setExperiences} errors={errors} />;
      case 2:
        return <EducationSection educations={educations} setEducations={setEducations} errors={errors} />;
      case 3:
        return <SkillsSection skills={skills} setSkills={setSkills} showExperienceLevel={showExperienceLevel} setShowExperienceLevel={setShowExperienceLevel} errors={errors} />;
      case 4:
        return <SummarySection summary={summary} setSummary={setSummary} errors={errors} />;
      case 5:
        return <FinalizeSection 
          onAddSection={(sectionType) => {
            // Handle adding different sections
            console.log(`Adding section: ${sectionType}`);
            // For now, just show an alert. In a full implementation, this would open a modal or navigate to a section editor
            alert(`Adding ${sectionType} section - This feature will be implemented in the next update.`);
          }}
          languages={languages}
          setLanguages={setLanguages}
          certifications={certifications}
          setCertifications={setCertifications}
          awards={awards}
          setAwards={setAwards}
          websites={websites}
          setWebsites={setWebsites}
          references={references}
          setReferences={setReferences}
          hobbies={hobbies}
          setHobbies={setHobbies}
          customSections={customSections}
          setCustomSections={setCustomSections}
        />;
      default:
        return null;
    }
  };

  // Synchronize old state with new resumeData for templates
  useEffect(() => {
    setResumeData(prev => ({
      ...prev,
      contact: {
        firstName: contacts.firstName || '',
        lastName: contacts.lastName || '',
        desiredJobTitle: contacts.desiredJobTitle || '',
        phone: contacts.phone || '',
        email: contacts.email || '',
        country: contacts.country || '',
        city: contacts.city || '',
        address: contacts.address || '',
        postCode: contacts.postCode || '',
      },
      experiences: experiences.map(exp => ({
        id: exp.id,
        jobTitle: exp.jobTitle,
        company: exp.company,
        location: exp.employer,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
      })),
      education: educations.map(edu => ({
        id: edu.id,
        school: edu.school,
        location: edu.location,
        degree: edu.degree,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: edu.description,
      })),
      skills: skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        level: skill.level,
      })),
      summary: summary,
      showExperienceLevel: showExperienceLevel,
      languages: languages,
      certifications: certifications,
      awards: awards,
      websites: websites,
      references: references,
      hobbies: hobbies,
      customSections: customSections,
    }));
      }, [contacts, experiences, educations, skills, summary, showExperienceLevel, languages, certifications, awards, websites, references, hobbies, customSections]);

  return (
    <div className="flex flex-col h-screen bg-[#f4f6fb]">
      <Head title="CVeezy | Build Your Resume" />
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-screen bg-[#f4f6fb]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resume...</p>
          </div>
        </div>
      )}
      
      {/* Header with Back Button */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">Resume Builder</h1>
          {isUpdating && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Saving...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </span>
        </div>
      </header>

      {/* Warning for pending payments */}
      {hasPendingPayments && (
        <div className="bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-yellow-800 font-semibold">Payment Under Review</span>
          </div>
          <p className="text-yellow-700 text-sm">
            You have {pendingResumesCount} resume(s) with pending payment reviews. Please wait for admin approval before creating new resumes.
          </p>
        </div>
      )}

      {/* Main Content */}
        <Link
            href="/choose-resume-maker"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mt-3 ml-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
      {!isLoading && (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Side */}
          <div className="lg:w-1/2 w-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 overflow-auto">
              {/* Section Stepper */}
              <SectionStepper
                currentSection={currentStep.toString()}
                sections={[
                  {
                    id: "0",
                    label: "Contacts",
                    icon: <User className="w-5 h-5" />,
                    isCompleted: !!(resumeData.contact?.firstName && resumeData.contact?.lastName && resumeData.contact?.email)
                  },
                  {
                    id: "1",
                    label: "Experience",
                    icon: <Briefcase className="w-5 h-5" />,
                    isCompleted: resumeData.experiences?.length > 0
                  },
                  {
                    id: "2",
                    label: "Education",
                    icon: <GraduationCap className="w-5 h-5" />,
                    isCompleted: resumeData.education?.length > 0
                  },
                  {
                    id: "3",
                    label: "Skills",
                    icon: <Code className="w-5 h-5" />,
                    isCompleted: resumeData.skills?.length > 0
                  },
                  {
                    id: "4",
                    label: "Summary",
                    icon: <FileText className="w-5 h-5" />,
                    isCompleted: !!resumeData.summary
                  },
                  {
                    id: "5",
                    label: "Finalize",
                    icon: <Flag className="w-5 h-5" />,
                    isCompleted: false
                  }
                ]}
                onSectionChange={(id) => setCurrentStep(parseInt(id))}
              />

              {/* Resume Score Display */}
              {currentStep === 5 && (
                <ResumeScore resumeData={resumeData} />
              )}

              {renderStepContent()}
            </div>

            <div className="w-full max-w-2xl mt-2 bg-white p-4 rounded-xl shadow-md flex justify-between">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                  className="bg-gray-100 hover:bg-gray-200 px-8 py-3 rounded-lg text-gray-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <span className="text-lg">←</span>
                  Back
                </button>
              )}
              {currentStep === 0 && <div></div>}
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={async () => {
                    if (!resumeId) {
                      // Try to create resume if it doesn't exist
                      try {
                        console.log('No resume ID found, attempting to create resume...');
                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                        console.log('CSRF Token:', csrfToken ? 'Present' : 'Missing');
                        
                        const requestBody = {
                          name: `${contacts.firstName} ${contacts.lastName}`.trim() || 'My Resume',
                          template_name: templateName,
                          resume_data: {
                            contact: contacts,
                            experiences,
                            educations,
                            skills,
                            summary
                          }
                        };
                        
                        console.log('Request body:', requestBody);
                        
                        const response = await fetch('/resumes', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                          },
                          body: JSON.stringify(requestBody)
                        });
                        
                        console.log('Response status:', response.status);
                        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('Resume created with ID:', result.resume.id);
                          setResumeId(result.resume.id);
                          
                          // Continue with finalization
                          await finalizeResume(result.resume.id);
                        } else {
                          const errorText = await response.text();
                          console.error('Failed to create resume. Status:', response.status);
                          console.error('Response text:', errorText);
                          
                          // Try to parse as JSON if possible
                          try {
                            const errorJson = JSON.parse(errorText);
                            console.error('Error details:', errorJson);
                          } catch (e) {
                            console.error('Response is not JSON:', errorText.substring(0, 200));
                          }
                          
                          alert('Unable to create resume. Please try again.');
                          return;
                        }
                      } catch (error) {
                        console.error('Error creating resume:', error);
                        alert('Error creating resume. Please try again.');
                        return;
                      }
                    } else {
                      // Resume ID exists, proceed with finalization
                      await finalizeResume(resumeId);
                    }
                  }}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Resume...
                    </>
                  ) : (
                    <>
                      Next: Download
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                >
                  Next: {steps[currentStep + 1] || "Done"}
                  <span className="text-lg">→</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Clean Resume Preview */}
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100' : 'lg:w-1/2 w-full'} ${isFullscreen ? 'p-0' : 'p-6'} flex flex-col`}>
            
            {/* Compact Control Panel */}
            <div className="flex-shrink-0 mb-3">
              {/* Unified Control Bar */}
              <motion.div
                className="flex items-center justify-between bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl px-4 py-2.5 shadow-lg shadow-gray-200/50 mx-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Left: Live Status */}
                <div className="flex items-center gap-2.5">
                  <motion.div 
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: ["0 0 0 0 rgba(16, 185, 129, 0.4)", "0 0 0 3px rgba(16, 185, 129, 0.1)", "0 0 0 0 rgba(16, 185, 129, 0.4)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="text-xs font-semibold text-gray-800">LIVE</span>
                  <motion.div 
                    className="flex items-center gap-1.5 ml-1"
                    key={zoomLevel}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs font-mono font-bold text-slate-700" title={`Exact: ${zoomLevel.toFixed(2)}`}>
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${Math.min((zoomLevel / 2) * 100, 100)}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Right: Control Groups */}
                <div className="flex items-center gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-gray-50/50 rounded-lg overflow-hidden">
                    <motion.button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.25}
                      className="p-2 hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
                      title="Zoom Out (Ctrl -)"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                    </motion.button>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <motion.button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 2}
                      className="p-2 hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
                      title="Zoom In (Ctrl +)"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                    </motion.button>
                  </div>

                  {/* View Controls */}
                  <div className="flex items-center bg-gray-50/50 rounded-lg overflow-hidden">
                    <motion.button
                      onClick={handleFitToScreen}
                      className="p-2 hover:bg-white/80 transition-all duration-200 group"
                      title="Fit to Screen"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Square className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                    </motion.button>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <motion.button
                      onClick={handleZoomReset}
                      className="p-2 hover:bg-white/80 transition-all duration-200 group"
                      title="Reset Zoom (100%)"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-600 transition-colors" />
                    </motion.button>
                  </div>

                  {/* Fullscreen Control */}
                  <div className="bg-gray-50/50 rounded-lg overflow-hidden">
                    <motion.button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/80 transition-all duration-200 group"
                      title={isFullscreen ? "Exit Fullscreen (F11)" : "Fullscreen (F11)"}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-600 transition-colors" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-600 transition-colors" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Preview Container */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl relative border border-gray-200/50 shadow-inner mx-4">
              {/* Aligned preview container */}
              <div className="min-h-full flex justify-center py-6 px-4">
                {/* Premium Resume Document */}
                <motion.div 
                  className="bg-white shadow-2xl border border-gray-100 relative rounded-lg overflow-hidden"
                  style={{ 
                    width: `${210 * 3.78}px`, // A4 width in pixels (210mm)
                    minHeight: `${297 * 3.78}px`, // A4 height in pixels (297mm)
                    maxWidth: 'none',
                    padding: '40px',
                    marginBottom: `${150 * zoomLevel}px`, // Dynamic bottom margin to ensure full visibility
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)',
                    transformOrigin: 'top center'
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.6 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: zoomLevel 
                  }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    y: { duration: 0.5 },
                    scale: { duration: 0.3, ease: "easeOut" }
                  }}
                  key={`zoom-${zoomLevel}`}
                >
              <TemplateComponent resumeData={resumeData} />
                </motion.div>
            </div>
            </div>

            {/* Zoom level indicator when zooming */}
            {isZooming && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-medium backdrop-blur-sm"
              >
                {Math.round(zoomLevel * 100)}%
              </motion.div>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default Builder; 