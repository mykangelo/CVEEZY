import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import ValidationHolder from "./builder/ValidationHolder";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

type Contact = {
  firstName: string;
  lastName: string;
  desiredJobTitle: string;
  phone: string;
  email: string;
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
const finalizeSections = [
  { icon: "🌐", label: "Languages" },
  { icon: "📜", label: "Certifications and Licenses" },
  { icon: "🏆", label: "Awards and Honors" },
  { icon: "🌍", label: "Websites and Social Media" },
  { icon: "👤", label: "References" },
  { icon: "❤️", label: "Hobbies and Interests" },
  { icon: "➕", label: "Custom Sections" },
];
const FinalizeSection = () => (
  <div>
    <h2 className="text-2xl font-bold mb-2">Finalize</h2>
    <p className="text-gray-600 mb-6">Add certifications, languages, awards, or any extra details you want recruiters to see.</p>
    <div className="space-y-3">
      {finalizeSections.map((sec, i) => (
        <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <span className="text-2xl">{sec.icon}</span>
          <span className="font-medium text-gray-800">{sec.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const steps = ["Contacts", "Experience", "Education", "Skills", "Summary", "Finalize"];

const Builder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
          if (!exp.company.trim()) newErrors[`exp_${exp.id}_company`] = "Company is required";
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
        return <FinalizeSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4f6fb]">
      <Head title="CVeezy | Build Your Resume" />
      
      {/* Header with Back Button */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link
            href="/choose-resume-maker"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">Resume Builder</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </span>
        </div>
      </header>

      {/* Main Content */}
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
                onClick={() => {
                  const resumeData = {
                    contact: contacts,
                    experiences,
                    educations,
                    skills,
                    summary
                  };
                  // Store data in sessionStorage for the FinalCheck page
                  sessionStorage.setItem('resumeData', JSON.stringify(resumeData));
                  window.location.href = '/final-check';
                }}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Finalize Resume
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
            <p className="text-xs text-gray-500 italic">{exp.startDate} - {exp.endDate}</p>
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
        <ul className="list-disc ml-6 text-sm text-gray-700">
          {skills.map(skill => (
            <li key={skill.id}>
              {skill.name}
              {showExperienceLevel && skill.name && ` (${skill.level})`}
            </li>
          ))}
        </ul>
      </div>
    )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder; 