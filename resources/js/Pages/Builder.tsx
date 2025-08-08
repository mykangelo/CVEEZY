import React, { useState, useEffect, useCallback } from "react";
import { Head, Link } from "@inertiajs/react";
import ValidationHolder from "./builder/ValidationHolder";
import { Trash2, Plus, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { debounce } from "lodash";

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
  location: string;
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
        location: "",
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
                  <label className="block text-gray-700 mb-1">Location</label>
                  <input 
                    className={`w-full border rounded-md p-2 ${errors[`exp_${exp.id}_location`] ? 'border-red-500' : ''}`}
                    value={exp.location} 
                    onChange={e => updateExperience(exp.id, 'location', e.target.value)} 
                    placeholder="New York, NY" 
                  />
                  {errors[`exp_${exp.id}_location`] && <p className="text-red-500 text-xs mt-1">{errors[`exp_${exp.id}_location`]}</p>}
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
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Education</h2>
      {educations.map((edu, idx) => (
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

const skillLevels = ["Beginner", "Novice", "Skillful", "Experienced", "Expert"];

const getOpacity = (level: string): number => {
  switch (level) {
    case "Beginner":
      return 0.2;
    case "Novice":
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
    setSkills([...skills, { id: Date.now(), name: "", level: "Beginner" }]);
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
                className={`w-full h-12 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`skill_${skill.id}_name`] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-100'}`}
              />
              {errors[`skill_${skill.id}_name`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`skill_${skill.id}_name`]}
                </p>
              )}
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
const SummarySection: React.FC<SummarySectionProps> = ({ summary, setSummary, errors }) => (
  <div>
    <h2 className="text-2xl font-bold mb-2">Summary</h2>
    <p className="text-gray-600 mb-6">Write a short introduction that highlights your experience, key skills, and career goals.</p>
    <label className="block text-gray-700 mb-1">Professional Summary</label>
    <textarea
      className={`w-full border rounded-md p-3 mb-4 ${errors.summary ? 'border-red-500' : ''}`}
      value={summary}
      onChange={e => setSummary(e.target.value)}
      placeholder="Write your summary here..."
      rows={4}
    />
    {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
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

// Finalize Section
interface BaseSectionItem {
  id: number;
  content: string;
}

interface WebsiteItem extends BaseSectionItem {
  title: string;
  url: string;
}

type SectionItem = BaseSectionItem | LanguageItem | WebsiteItem;


interface LanguageItem {
  id: number;
  content: string;
  level: string;
}

interface CustomSection {
  id: number;
  sectionName: string;
  description: string;
}

interface ReferenceItem {
  id: number;
  content: string;
}

interface HobbiesItem {
  id: number;
  content: string;
}

interface AwardsItem {
  id: number;
  content: string;
}

interface CertificationItem {
  id: number;
  content: string;
}

  const languageLevels = ["Elementary", "Intermediate", "Proficient", "Advanced", "Native"];

  const getLanguageOpacity = (level: string): number => {
    switch (level) {
      case "Elementary":
        return 0.2;
      case "Intermediate":
        return 0.4;
      case "Proficient":
        return 0.6;
      case "Advanced":
        return 0.8;
      case "Native":
        return 1.0;
      default:
        return 0.3;
    }
  };

  const LanguageLevelSlider = ({
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
        className={`flex flex-col items-center w-64 transition-opacity duration-300 ${
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
              left: `${languageLevels.indexOf(level) * 20}%`,
              width: "20%",
              backgroundColor: `rgba(96, 165, 250, ${getLanguageOpacity(level)})`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Clickable Segments */}
          {languageLevels.map((languageLevel, index) => (
            <div
              key={languageLevel}
              onClick={() => isActive && onChange(languageLevel)}
              title={languageLevel}
              className="flex-1 z-10 flex items-center justify-center cursor-pointer relative"
            >
              {/* Vertical divider */}
              {index < languageLevels.length - 1 && (
                <div className="absolute right-0 top-1/4 h-1/2 w-px bg-blue-400 opacity-70" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

interface FinalizeSectionProps {
  languages: LanguageItem[];
  setLanguages: React.Dispatch<React.SetStateAction<LanguageItem[]>>;
  certifications: CertificationItem[];
  setCertifications: React.Dispatch<React.SetStateAction<CertificationItem[]>>;
  awards: AwardsItem[];
  setAwards: React.Dispatch<React.SetStateAction<AwardsItem[]>>;
  websites: WebsiteItem[];
  setWebsites: React.Dispatch<React.SetStateAction<WebsiteItem[]>>;
  showReferences: ReferenceItem[];
  setShowReferences: React.Dispatch<React.SetStateAction<ReferenceItem[]>>;
  hobbies: HobbiesItem[];
  setHobbies: React.Dispatch<React.SetStateAction<HobbiesItem[]>>;
  customSections: CustomSection[];
  setCustomSections: React.Dispatch<React.SetStateAction<CustomSection[]>>;

}



const FinalizeSection: React.FC<FinalizeSectionProps> = ({
  languages, 
  setLanguages,
  certifications,
  setCertifications,
  awards,
  setAwards,
  websites,
  setWebsites,
  showReferences,
  setShowReferences,
  hobbies,
  setHobbies,
  customSections,
  setCustomSections,
}) => {

  const [expanded, setExpanded] = useState<string | null>(null);

  
  const toggleExpand = (label: string) => {
    setExpanded(prev => (prev === label ? null : label));
  };

  const updateLanguage = (id: number, field: keyof LanguageItem, value: string) => {
    setLanguages(languages.map(lang =>
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  const addLanguage = () => {
    setLanguages((prev) => [
      ...prev,
      { id: Date.now(), content: "", level: "Elementary" },
    ]);
  };

  const removeLanguage = (id: number) => {
    setLanguages((prev) => prev.filter((lang) => lang.id !== id));
  };


  const addCertification = () => {
    setCertifications((prev) => [
      ...prev,
      { id: Date.now(), content: "" },
    ]);
  };

  const removeCertification = (id: number) => {
    setCertifications((prev) => prev.filter((cert) => cert.id !== id));
  };

  useEffect(() => {
  if (languages.length === 0) {
    addLanguage();}

  if (hobbies.length === 0) {
      addHobbies();}

  if (websites.length === 0) {
      addWebsites();}

  if (showReferences.length === 0) {
      addshowReferences();}

  if (customSections.length === 0) {
      addCustomSections();}
  }, []);



  const addHobbies = () => {
    setHobbies((prev) => [
      ...prev,
      { id: Date.now(), content: "" },
    ]);
  };

  const removeHobbies = (id: number) => {
    setHobbies((prev) => prev.filter((h) => h.id !== id));
  };


  const addWebsites = () => {
    setWebsites((prev) => [
      ...prev,
      { id: Date.now(), title: "", url: "", content: "" },
    ]);
  };

  const removeWebsites = (id: number) => {
    setWebsites((prev) => prev.filter((item) => item.id !== id));
  };


  const addCustomSections = () => {
    setCustomSections((prev) => [
      ...prev,
      {
        id: Date.now(),
        sectionName: "",
        description: "",
      },
    ]);
  };

  const removeCustomSections = (id: number) => {
    setCustomSections((prev) => prev.filter((item) => item.id !== id));
  };


  const addshowReferences = () => {
    setShowReferences((prev) => [
      ...prev,
      { id: Date.now(), content: "" },
    ]);
  };

  const removeshowReferences = (id: number) => {
    setShowReferences((prev) => prev.filter((item) => item.id !== id));
  };




  
  const finalizeSections = [
    { icon: "🌐", label: "Languages" },
    { icon: "📜", label: "Certifications and Licenses" },
    { icon: "🏆", label: "Awards and Honors" },
    { icon: "🌍", label: "Websites and Social Media" },
    { icon: "👤", label: "References" },
    { icon: "❤️", label: "Hobbies and Interests" },
    { icon: "➕", label: "Custom Sections" },
  ];
  
  const renderSectionContent = (label: string) => {
    switch (label) {
      case "Languages":
        return (
          <div className="w-full max-w-xl mx-auto p-4">
            {/* Iterate over each language */}
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="grid grid-cols-2 gap-4 items-center mb-4"
              >
                {/* Column 1: Label + Input */}
                <div className="flex flex-col w-full">
                  <p className="text-base text-gray-800 mb-2 ">Languages</p>
                  <input
                    type="text"
                    placeholder="Enter language"
                    value={lang.content}
                    onChange={(e) =>
                      updateLanguage(lang.id, "content", e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* Column 2: Slider + Delete */}
                <div className="flex items-center w-full">
                  <LanguageLevelSlider
                    level={lang.level}
                    onChange={(level) =>
                      updateLanguage(lang.id, "level", level)
                    }
                  />
                  <button
                    onClick={() => removeLanguage(lang.id)}
                    className="ml-4 whitespace-nowrap"
                  >
                    &#128465;
                  </button>
                </div>
              </div>
            ))}

            {/* Add Language Button (outside map) */}
            <div className="flex justify-start mt-2">
              <button
                onClick={addLanguage}
                className="px-3 py-1 text-[#2196f3] hover:text-[#1976d2] w-fit font-semibold"
              >
                + Add Language
              </button>
            </div>
          </div>
        );

      case "Certifications and Licenses":
        return (
          <div>
            <p className="text-sm text-gray-500 italic mb-2">
              This is the Certifications section
            </p>

            <ul className="ml-2 space-y-2">
              {(certifications.length === 0
                ? [{ id: 0, content: "" }]
                : certifications
              ).map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => {
                        if (item.id === 0) {
                          // Convert initial input into a real certification
                          setCertifications([
                            { id: Date.now(), content: e.target.value },
                          ]);
                        } else {
                          // Update existing certification
                          const updated = certifications.map((cert) =>
                            cert.id === item.id
                              ? { ...cert, content: e.target.value }
                              : cert
                          );
                          setCertifications(updated);
                        }
                      }}
                      className="border px-2 py-1 rounded flex-grow"
                      placeholder="Enter certification"
                    />

                  </div>
                </li>
              ))}
            </ul>
          </div>
        );


      case "Awards and Honors":
        return (
          <div>
            <p className="text-sm text-gray-500 italic mb-2">
              This is the Award and Honors section
            </p>

            <ul className="ml-2 space-y-2">
              {(awards.length === 0
                ? [{ id: 0, content: "" }]
                : awards
              ).map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => {
                        if (item.id === 0) {
                          // Convert initial input into a real certification
                          setAwards([
                            { id: Date.now(), content: e.target.value },
                          ]);
                        } else {
                          // Update existing certification
                          const updated = awards.map((awa) =>
                            awa.id === item.id
                              ? { ...awa, content: e.target.value }
                              : awa
                          );
                          setAwards(updated);
                        }
                      }}
                      className="border px-2 py-1 rounded flex-grow"
                      placeholder="Enter Awards"
                    />

                  </div>
                </li>
              ))}
            </ul>
          </div>
        );

      case "Websites and Social Media":
        return (
          <div>
            <p className="text-sm text-gray-500 italic mb-2">
              This is the Websites section
            </p>

            <ul className="ml-2 space-y-2">
              {websites.map((item) => (
                <li key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Column 1: Link Name */}
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = websites.map((web) =>
                        web.id === item.id ? { ...web, title: e.target.value } : web
                      );
                      setWebsites(updated);
                    }}
                    className="border px-2 py-1 rounded w-full sm:w-1/2"
                    placeholder="Link Name (e.g., LinkedIn)"
                  />

                  {/* Column 2: URL */}
                  <div className="flex items-center w-full sm:w-1/2 gap-2">
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => {
                        const updated = websites.map((web) =>
                          web.id === item.id ? { ...web, url: e.target.value } : web
                        );
                        setWebsites(updated);
                      }}
                      className="border px-2 py-1 rounded flex-grow"
                      placeholder="https://example.com"
                    />

                    <button
                      onClick={() => removeWebsites(item.id)}
                      className="text-red-500 hover:text-red-700 text-xl"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-start mt-2">
              <button
                onClick={addWebsites}
                className="px-3 py-1 text-[#2196f3] hover:text-[#1976d2] w-fit font-semibold"
              >
                + Add Another Link
              </button>
            </div>
          </div>
        );


      case "References":
        return (
          <div>
            <p className="text-sm text-gray-500 italic mb-2">
              This is the References section
            </p>

            <ul className="ml-2 space-y-2">
              {showReferences.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => {
                        const updated = showReferences.map((ref) =>
                          ref.id === item.id
                            ? { ...ref, content: e.target.value }
                            : ref
                        );
                        setShowReferences(updated);
                      }}
                      className="border px-2 py-1 rounded flex-grow"
                      placeholder="Enter References"
                    />
                    <button
                      onClick={() => removeshowReferences(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xl"
                      title="Delete"
                    >
                      &#128465;
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-start mt-2">
              <button
                onClick={addshowReferences}
                className="px-3 py-1 text-[#2196f3] hover:text-[#1976d2] w-fit font-semibold"
              >
                + Add References
              </button>
            </div>
          </div>
        );
      case "Hobbies and Interests":
        return (
          <div>
            <p className="text-sm text-gray-500 italic mb-2">
              This is the Hobbies and Interest section
            </p>

            <ul className="ml-2 space-y-2">
              {hobbies.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => {
                        const updated = hobbies.map((h) =>
                          h.id === item.id
                            ? { ...h, content: e.target.value }
                            : h
                        );
                        setHobbies(updated);
                      }}
                      className="border px-2 py-1 rounded flex-grow"
                      placeholder="Enter Hobbies and Interest"
                    />
                    <button
                      onClick={() => removeHobbies(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xl"
                      title="Delete"
                    >
                      &#128465;
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-start mt-2">
              <button
                onClick={addHobbies}
                className="px-3 py-1 text-[#2196f3] hover:text-[#1976d2] w-fit font-semibold"
              >
                + Add Hobbies and Interest
              </button>
            </div>
          </div>
        );

      case "Custom Sections":
        return (
          <div>
            <p className="text-sm text-gray-500 italic mb-2">
              This is the Custom Section
            </p>

            <ul className="ml-2 space-y-4">
              {customSections.map((item) => (
                <li key={item.id} className="flex flex-col gap-2">
                  <div className="flex items-center w-full gap-2">
                    <input
                      type="text"
                      value={item.sectionName}
                      onChange={(e) => {
                        const updated = customSections.map((cussec) =>
                          cussec.id === item.id
                            ? { ...cussec, sectionName: e.target.value }
                            : cussec
                        );
                        setCustomSections(updated);
                      }}
                      className="border px-2 py-1 rounded w-1/2"
                      placeholder="Enter Section Name"
                    />

                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const updated = customSections.map((cussec) =>
                          cussec.id === item.id
                            ? { ...cussec, description: e.target.value }
                            : cussec
                        );
                        setCustomSections(updated);
                      }}
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Enter Description"
                    />

                    <button
                      onClick={() => removeCustomSections(item.id)}
                      className="text-red-500 hover:text-red-700 text-xl"
                      title="Delete"
                    >
                      &#128465;
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-start mt-2">
              <button
                onClick={addCustomSections}
                className="px-3 py-1 text-[#2196f3] hover:text-[#1976d2] w-fit font-semibold"
              >
                + Add Custom Section
              </button>
            </div>
          </div>
        );


      default:
        return null;
    }
  };


  return (
    <div className="w-full space-y-4">
      {finalizeSections.map(({ icon, label }) => (
        <div key={label} className="border rounded-lg p-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpand(label)}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>{icon}</span> {label}
            </h3>
            {expanded === label ? <ChevronDown /> : <ChevronRight />}
          </div>

          {expanded === label && (
            <div className="mt-4 p-2 border-t pt-4">
              {renderSectionContent(label)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};




/*********************************************************************************************/

const steps = ["Contacts", "Experience", "Education", "Skills", "Summary", "Finalize"];

const Builder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get template ID and resume ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = parseInt(urlParams.get('template') || '1');
  const existingResumeId = urlParams.get('resume');
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact>({
    firstName: "",
    lastName: "",
    desiredJobTitle: "",
    phone: "",
    email: "",
  });
  
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: Date.now(),
      jobTitle: "Software Developer",
      employer: "ABC Company",
      location: "New York, NY",
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
  const [skills, setSkills] = useState<Skill[]>([{ id: Date.now(), name: "", level: "Beginner" }]);
  const [showExperienceLevel, setShowExperienceLevel] = useState(false);
  const [summary, setSummary] = useState("");
  const skillLevels = ["Beginner", "Novice", "Skillful", "Experienced", "Expert"];
  const languageLevels = ["Elementary", "Intermediate", "Proficient", "Advanced", "Native"];

  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [awards, setAwards] = useState<AwardsItem[]>([]);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [showReferences, setShowReferences] = useState<ReferenceItem[]>([]);
  const [hobbies, setHobbies] = useState<HobbiesItem[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);


  // Load existing resume or create new one
  useEffect(() => {
    const initializeResume = async () => {
      try {
        if (existingResumeId) {
          // Load existing resume
          console.log('Loading existing resume with ID:', existingResumeId);
          const response = await fetch(`/resumes/${existingResumeId}`, {
            headers: {
              'Accept': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            const resumeData = result.resume.resume_data;
            
            // Set resume ID
            setResumeId(result.resume.id);
            
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
              if (resumeData.showReferences) {
                setShowReferences(resumeData.showReferences);
              }
              if (resumeData.hobbies) {
                setHobbies(resumeData.hobbies);
              }
              if (resumeData.customSections) {
                setCustomSections(resumeData.customSections);
              }
            }
          } else {
            console.error('Failed to load existing resume');
            // Fallback to creating new resume
            await createNewResume();
          }
        } else {
          // Create new resume
          await createNewResume();
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
        const response = await fetch('/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify({
            name: 'My Resume',
            template_id: templateId,
            resume_data: {
              contact: contacts,
              experiences,
              educations,
              skills,
              summary,

              languages,
              certifications,
              awards,
              websites,
              showReferences,
              hobbies,
              customSections
            }
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Resume created with ID:', result.resume.id);
          setResumeId(result.resume.id);
        } else {
          console.error('Failed to create initial resume');
        }
      } catch (error) {
        console.error('Error creating initial resume:', error);
      }
    };

    initializeResume();
  }, [existingResumeId, templateId]);

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
          resume_data: newData
        })
      });
      
      if (response.ok) {
        console.log('Resume updated successfully');
      } else {
        console.error('Failed to update resume');
      }
    } catch (error) {
      console.error('Error updating resume:', error);
    } finally {
      setIsUpdating(false);
    }
  };

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

        languages,
        certifications,
        awards,
        websites,
        showReferences,
        hobbies,
        customSections
      };
      debouncedUpdate(resumeData);
    }
  }, [contacts, experiences, educations, skills, summary, resumeId,         
        languages,
        certifications,
        awards,
        websites,
        showReferences,
        hobbies,
        customSections,

        debouncedUpdate]);

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

        languages,
        certifications,
        awards,
        websites,
        showReferences,
        hobbies,
        customSections 
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

    switch (currentStep) {
      case 0: // Contacts
        if (!contacts.firstName.trim()) newErrors.firstName = "First name is required";
        if (!contacts.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!contacts.desiredJobTitle.trim()) newErrors.desiredJobTitle = "Desired job title is required";
        if (!contacts.phone.trim()) newErrors.phone = "Phone number is required";
        if (!contacts.email.trim()) newErrors.email = "Email is required";
        break;

      case 1: // Experience
        experiences.forEach((exp) => {
          if (!exp.jobTitle.trim()) newErrors[`exp_${exp.id}_jobTitle`] = "Job title is required";
          if (!exp.employer.trim()) newErrors[`exp_${exp.id}_employer`] = "Employer is required";
          if (!exp.location.trim()) newErrors[`exp_${exp.id}_location`] = "Location is required";
          if (!exp.startDate.trim()) newErrors[`exp_${exp.id}_startDate`] = "Start date is required";
          if (!exp.endDate.trim()) newErrors[`exp_${exp.id}_endDate`] = "End date is required";
          if (!exp.description.trim()) newErrors[`exp_${exp.id}_description`] = "Description is required";
        });
        break;

      case 2: // Education
        educations.forEach((edu) => {
          if (!edu.school.trim()) newErrors[`edu_${edu.id}_school`] = "School name is required";
          if (!edu.location.trim()) newErrors[`edu_${edu.id}_location`] = "Location is required";
          if (!edu.degree.trim()) newErrors[`edu_${edu.id}_degree`] = "Degree is required";
          if (!edu.startDate.trim()) newErrors[`edu_${edu.id}_startDate`] = "Start date is required";
          if (!edu.endDate.trim()) newErrors[`edu_${edu.id}_endDate`] = "End date is required";
          if (!edu.description.trim()) newErrors[`edu_${edu.id}_description`] = "Description is required";
        });
        break;

      case 3: // Skills
        skills.forEach((skill) => {
          if (!skill.name.trim()) newErrors[`skill_${skill.id}_name`] = "Skill name is required";
        });
        break;

      case 4: // Summary
        if (!summary.trim()) newErrors.summary = "Summary is required";
        break;

      case 5: // Finalize - no validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };




  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ValidationHolder contacts={contacts} setContacts={setContacts} errors={errors} />;
      case 1:
        return <ExperienceSection experiences={experiences} setExperiences={setExperiences} errors={errors} />;
      case 2:
        return <EducationSection educations={educations} setEducations={setEducations} errors={errors} />;
      case 3:
        return <SkillsSection skills={skills} setSkills={setSkills} showExperienceLevel={showExperienceLevel} setShowExperienceLevel={setShowExperienceLevel} errors={errors} />;
      case 4:
        return <SummarySection summary={summary} setSummary={setSummary} errors={errors} />;
      case 5:
        return   <FinalizeSection
          languages={languages}
          setLanguages={setLanguages}
          certifications={certifications}
          setCertifications={setCertifications}
          awards={awards}
          setAwards={setAwards}
          websites={websites}
          setWebsites={setWebsites}
          showReferences={showReferences}
          setShowReferences={setShowReferences}
          hobbies={hobbies}
          setHobbies={setHobbies}
          customSections={customSections}
          setCustomSections={setCustomSections}         />; // Resume will be created when user clicks Finalize
      default:
        return null;
    }
  };

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
              {/* Stepper */}
              <div className="flex justify-between items-center mb-12">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center text-xs font-medium cursor-pointer ${index === currentStep ? 'text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                        index === currentStep
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {index === currentStep && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <span className="mt-1 text-center">{step}</span>
                  </div>
                ))}
              </div>

              {renderStepContent()}
            </div>

            <div className="w-full max-w-2xl mt-2 bg-white p-4 rounded-xl shadow-md flex justify-between">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                  className="bg-gray-200 px-6 py-2 rounded-md text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Previous
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
                        const response = await fetch('/resumes', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                          },
                          body: JSON.stringify({
                            name: `${contacts.firstName} ${contacts.lastName}`.trim() || 'My Resume',
                            template_id: templateId,
                            resume_data: {
                              contact: contacts,
                              experiences,
                              educations,
                              skills,
                              summary,
                              
                              languages,
                              certifications,
                              awards,
                              websites,
                              showReferences,
                              hobbies,
                              customSections 
                            }
                          })
                        });
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('Resume created with ID:', result.resume.id);
                          setResumeId(result.resume.id);
                          
                          // Continue with finalization
                          await finalizeResume(result.resume.id);
                        } else {
                          console.error('Failed to create resume');
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
                  className="bg-blue-500 px-6 py-2 rounded-md text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Resume...' : 'Finalize Resume'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md disabled:opacity-50"
                >
                  Next: {steps[currentStep + 1] || "Done"}
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="lg:w-1/2 w-full p-4">
            <div className="w-full max-w-[525px] h-[772px] bg-white shadow-lg p-6 mx-auto overflow-auto">

      {/* CONTACTS */}
      <h2 className="text-2xl font-bold mb-1">
        {contacts.firstName || "First"} {contacts.lastName || "Last"}
      </h2>
      <p className="text-sm text-gray-600 mb-4">{contacts.desiredJobTitle}</p>
      <p className="text-xs text-gray-500">{contacts.email} | {contacts.phone}</p>

      {/* SUMMARY */}
      {summary && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">SUMMARY</h3>
          <p className="text-gray-700 text-sm whitespace-pre-line">{summary}</p>
        </div>
      )}

      {/* EXPERIENCE */}
      {experiences.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">EXPERIENCE</h3>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-2">
              <p className="font-medium text-sm text-gray-800">{exp.jobTitle}, {exp.employer}</p>
              <p className="text-xs text-gray-500 italic">{exp.location} | {exp.startDate} - {exp.endDate}</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION */}
      {educations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">EDUCATION</h3>
          {educations.map((edu) => (
            <div key={edu.id} className="mb-2">
              <p className="font-medium text-sm text-gray-800">{edu.school}, {edu.location}</p>
              <p className="text-xs text-gray-500 italic">{edu.degree} ({edu.startDate} - {edu.endDate})</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{edu.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">SKILLS</h3>
          <ul className="ml-6 text-sm text-gray-700 space-y-2">
            {skills.map((skill) => (
              <li key={skill.id}>
                <div className="flex items-center gap-3">
                  <span>{skill.name}</span>

                  {showExperienceLevel  && skill.name.trim() !== "" && (
                    <div className="flex gap-1">
                      {skillLevels.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx <= skillLevels.indexOf(skill.level)
                              ? "bg-gray-600"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FINLAIZE */}
      {/* LANGUAGES */}
      {languages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">LANGUAGES</h3>
          <ul className="ml-6 text-sm text-gray-700 space-y-2">
            {languages.map((lang) => (
              <li key={lang.id}>
                <div className="flex items-center gap-3">
                  <span>{lang.content}</span>

                  {lang.content.trim() !== "" && (
                    <div className="flex gap-1">
                      {languageLevels.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx <= languageLevels.indexOf(lang.level)
                              ? "bg-gray-600"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* CERTIFICATIONS AND LICENSES */}
      {certifications.some((cert) => cert.content.trim() !== "") && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">CERTIFICATIONS AND LICENSES</h3>
          <ul className="ml-6 text-sm text-gray-700 space-y-2">
            {certifications
              .filter((cert) => cert.content.trim() !== "")
              .map((cert) => (
                <li key={cert.id}>
                  <div className="flex items-center gap-3">
                    <span>{cert.content}</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
      {/* AWARDS AND HONORS */}
      {awards.some((awa) => awa.content.trim() !== "") && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">AWARDS AND HONORS</h3>
          <ul className="ml-6 text-sm text-gray-700 space-y-2">
            {awards
              .filter((awa) => awa.content.trim() !== "")
              .map((awa) => (
                <li key={awa.id}>
                  <div className="flex items-center gap-3">
                    <span>{awa.content}</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* WEBSITES AND SOCIAL MEDIA */}
      {websites.some((web) => web.title.trim() !== "" || web.url.trim() !== "") && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">WEBSITES AND SOCIAL MEDIA</h3>
          <ul className="ml-6 text-sm text-gray-700 space-y-2">
            {websites
              .filter((web) => web.title.trim() !== "" || web.url.trim() !== "")
              .map((web) => (
                <li key={web.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-medium">{web.title}</span>
                    <a href={web.url} className="text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer">
                      {web.url}
                    </a>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* REFERENCES */}
      {showReferences.some((ref) => ref.content.trim() !== "") && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">REFERENCES</h3>
          <ul className="ml-6 text-sm text-gray-700 space-y-2">
            {showReferences
              .filter((ref) => ref.content.trim() !== "")
              .map((ref) => (
                <li key={ref.id}>
                  <div className="flex items-center gap-3">
                    <span>{ref.content}</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* HOBBIES AND INTERESTS */}
      {hobbies.some((h) => h.content.trim() !== "") && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">HOBBIES AND INTERESTS</h3>
          <ul className="ml-6 text-sm text-gray-700 space-y-2">
            {hobbies
              .filter((h) => h.content.trim() !== "")
              .map((h) => (
                <li key={h.id}>
                  <div className="flex items-center gap-3">
                    <span>{h.content}</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* CUSTOM SECTION */}
      {customSections
        .filter(
          (c) => c.sectionName.trim() !== "" || c.description.trim() !== ""
        )
        .map((c) => (
          <div key={c.id} className="mt-4">
            {c.sectionName.trim() !== "" && (
              <h3 className="text-lg font-semibold">{c.sectionName}</h3>
            )}
            {c.description.trim() !== "" && (
              <p className="ml-6 text-sm text-gray-700 mt-1">{c.description}</p>
            )}
          </div>
      ))}


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder; 