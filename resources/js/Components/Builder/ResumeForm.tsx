import React, { useEffect, useRef, useState } from 'react';
import { ResumeData } from '@/types/resume';
import ContactSection from './Sections/ContactSection';
import ExperienceSection from './Sections/ExperienceSection';
import EducationSection from './Sections/EducationSection';
import SkillsSection from './Sections/SkillsSection';
import SummarySection from './Sections/SummarySection';
import AdditionalSection from './Sections/AdditionalSection';
import axios from 'axios';

type Props = {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  selectedTemplate: string; // NEW
};

const sections = [
  'Contact',
  'Experience',
  'Education',
  'Skills',
  'Summary',
  'Additional',
] as const;

type SectionKey = typeof sections[number];

const ResumeForm: React.FC<Props> = ({ resumeData, setResumeData, selectedTemplate }) => {
  const [currentSection, setCurrentSection] = useState<SectionKey>('Contact');

  const nextExperienceId = useRef(
    resumeData.experiences.length > 0
      ? Math.max(...resumeData.experiences.map(exp => exp.id)) + 1
      : 1
  );

  const nextEducationId = useRef(
    resumeData.education.length > 0
      ? Math.max(...resumeData.education.map(edu => edu.id)) + 1
      : 1
  );

  const nextSkillId = useRef(
    resumeData.skills.length > 0
      ? Math.max(...resumeData.skills.map(skill => skill.id)) + 1
      : 1
  );

  const nextAdditionalId = useRef(1);

  useEffect(() => {
    if (resumeData.experiences.length === 0) {
      setResumeData(prev => ({
        ...prev,
        experiences: [
          {
            id: 0,
            jobTitle: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            description: '',
          },
        ],
      }));
      nextExperienceId.current = 1;
    }

    if (resumeData.education.length === 0) {
      setResumeData(prev => ({
        ...prev,
        education: [
          {
            id: 0,
            school: '',
            location: '',
            degree: '',
            startDate: '',
            endDate: '',
            description: '',
          },
        ],
      }));
      nextEducationId.current = 1;
    }

    if (resumeData.skills.length === 0) {
      setResumeData(prev => ({
        ...prev,
        skills: [
          {
            id: 0,
            name: '',
          },
        ],
      }));
      nextSkillId.current = 1;
    }
  }, []);

  const handleDownloadResume = async () => {
    try {
      const updatedResumeData = {
        ...resumeData,
        template: selectedTemplate,
      };

      // Get CSRF token from meta tag
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await axios.post('/save-resume', updatedResumeData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token || '',
        }
      });
      
      const resumeId = response.data.resumeId;
      localStorage.setItem('resumeId', resumeId);
      window.location.href = `/payment?resumeId=${resumeId}`;
    } catch (error: any) {
      console.error('Error saving resume:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert('Failed to save resume. Please try again.');
    }
  };


  const renderSection = () => {
    switch (currentSection) {
      case 'Contact':
        return <ContactSection resumeData={resumeData} setResumeData={setResumeData} />;
      case 'Experience':
        return <ExperienceSection resumeData={resumeData} setResumeData={setResumeData} nextIdRef={nextExperienceId} />;
      case 'Education':
        return <EducationSection resumeData={resumeData} setResumeData={setResumeData} nextIdRef={nextEducationId} />;
      case 'Skills':
        return <SkillsSection resumeData={resumeData} setResumeData={setResumeData} nextIdRef={nextSkillId} />;
      case 'Summary':
        return <SummarySection resumeData={resumeData} setResumeData={setResumeData} />;
      case 'Additional':
        return <AdditionalSection resumeData={resumeData} setResumeData={setResumeData} />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  };

  return (
    <div className="w-full pr-4">
      {/* Section Tabs */}
      <div className="flex space-x-2 mb-4">
        {sections.map(section => (
          <button
            key={section}
            onClick={() => setCurrentSection(section)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentSection === section ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Active Section */}
      <div>{renderSection()}</div>

      {/* Footer Button */}
      <div className="mt-6 flex justify-end">
        {currentSection !== 'Additional' ? (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleDownloadResume}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
          >
            Download Resume
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;