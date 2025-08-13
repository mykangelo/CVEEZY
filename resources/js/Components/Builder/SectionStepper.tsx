import React from 'react';
import { Check, User, Briefcase, GraduationCap, Code, FileText, Flag } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  isCompleted: boolean;
}

interface SectionStepperProps {
  currentSection: string;
  sections: Section[];
  onSectionChange: (sectionId: string) => void;
}

export const SectionStepper: React.FC<SectionStepperProps> = ({
  currentSection,
  sections,
  onSectionChange,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Section Steps */}
      <div className="flex justify-between items-center relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />

        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex flex-col items-center relative group"
          >
            {/* Step Circle */}
            <button
              onClick={() => onSectionChange(section.id)}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-200 relative
                ${currentSection === section.id
                  ? 'bg-blue-500 text-white shadow-lg scale-110'
                  : section.isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-blue-400'
                }
              `}
            >
              {section.isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5">{section.icon}</div>
              )}

              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {section.label}
              </div>
            </button>

            {/* Label */}
            <span className={`
              mt-2 text-sm font-medium transition-colors
              ${currentSection === section.id
                ? 'text-blue-600'
                : section.isCompleted
                ? 'text-green-600'
                : 'text-gray-500'
              }
            `}>
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
