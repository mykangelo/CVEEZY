import React from "react";
import { ResumeData } from "@/types/resume";
import Placeholder from "./Placeholder";

type Props = {
  resumeData: ResumeData;
};

const Classic: React.FC<Props> = ({ resumeData }) => {
  const {
    contact,
    experiences,
    education,
    skills,
    summary,
    languages,
    certifications,
    awards,
    websites,
    references,
    hobbies,
    customSections,
    showExperienceLevel,
  } = resumeData;

  const hasLocationInfo =
    contact.address || contact.city || contact.country || contact.postCode;

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


  const hasContactInfo =
    contact.address || contact.city || contact.country || contact.postCode;

  return (
    <div className="space-y-4 text-gray-800 ">
    {/* Contact Info - Always visible with placeholders */}
    <div>
      <h2 className="text-3xl font-bold text-center">
        
        <Placeholder className="font-bold" value={`${(contact.firstName || '').trim()} ${(contact.lastName || '').trim()}`.trim()} placeholder="FIRSTNAME LASTNAME" />
      </h2>

      <p className="text-lg text-gray-800 mt-2 text-center">
        <span className="font-bold">
          <Placeholder className="font-bold" value={contact.desiredJobTitle} placeholder="JOB TITLE" />
        </span>
      </p>
      <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />

      <div className="space-x-2 text-center">
        <span>
          <Placeholder
            value={[contact.address, contact.city, contact.country, contact.postCode].filter(Boolean).join(", ")}
            placeholder="123 Anywhere St, Any City | 12345"
          />
        </span>
        <span>|</span>
        <span><Placeholder value={contact.email} placeholder="email@example.com" /></span>
        <span>|</span>
        <span><Placeholder value={contact.phone} placeholder="(123) 456-7890" /></span>
      </div>
      <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
    </div>

      {/* Summary Section - Always rendered */}
      <div>
        <p className="text-sm text-gray-800 whitespace-pre-line -mt-2">
          <Placeholder
            value={summary}
            placeholder={"Motivated professional with a background in [field]. Eager to apply skills in [areas] and grow within a dynamic organization."}
            as="span"
          />
        </p>
      </div>

      
    {/* Skills Section - Always rendered with placeholders */}
    <div>
      <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
        AREA OF EXPERTISE
      </h3>
      <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        {(skills.length > 0
          ? skills
          : [
              { id: -1, name: '', level: 'Experienced' },
              { id: -2, name: '', level: 'Experienced' },
            ]
        ).map((skill: any, index: number) => (
          <div key={index} className="flex items-center gap-1">
            <span className="text-sm text-gray-800 font-medium">
              <Placeholder value={skill.name} placeholder="Sample Skill" />
            </span>
            {skill.name && skill.level && showExperienceLevel && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      i < getSkillLevelBullets(skill.level || 'Novice')
                        ? 'bg-black'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>


      {/* Experience Section - Always rendered with placeholders */}
      <div>
        <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
          PROFESSIONAL EXPERIENCE
        </h3>
        <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
        <div className="space-y-4">
          {(experiences.length > 0 ? experiences : [
            { id: -1, jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' } as any,
          ]).map((exp: any) => (
            <div key={exp.id}>
              <div className="flex justify-between items-center">
                <h4 className="font-bold">
                  <Placeholder value={exp.jobTitle} placeholder="Job Title" />
                </h4>
                <span className="text-sm text-gray-800 font-semibold">
                  <Placeholder value={(exp.startDate || exp.endDate) ? `${exp.startDate} - ${exp.endDate}` : ''} placeholder="Jan 2020 - Dec 2022" />
                </span>
              </div>
              <p className="text-sm text-gray-800 italic">
                <Placeholder value={exp.company || exp.location ? `${exp.company}${exp.location ? ` — ${exp.location}` : ''}` : ''} placeholder="Company — Employer" />
              </p>
              <li className="text-sm mt-1 ml-4">
                <Placeholder value={exp.description} placeholder="Describe impact and achievements" />
              </li>
            </div>
          ))}
        </div>
      </div>

      {/* Education Section - Always rendered */}
      <div>
        <>
          <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
            EDUCATION
          </h3>
          <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
          <div className="space-y-4">
            {(education.length > 0 ? education : [{ id: -1, degree: 'Degree', school: 'University Name', location: '', startDate: '2016', endDate: '2020', description: 'Relevant coursework or achievements' } as any]).map((edu: any) => (
              <div key={edu.id}>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold"><Placeholder value={edu.degree} placeholder="Degree" /></h4>
                  <span className="text-sm text-gray-800 font-semibold">
                    <Placeholder value={`${edu.startDate} - ${edu.endDate}`} placeholder="2016 - 2020" />
                  </span>
                </div>
                <p className="text-sm text-gray-800 italic">
                  <Placeholder value={edu.school || edu.location ? `${edu.school}${edu.location ? ` — ${edu.location}` : ''}` : ''} placeholder="University — Location" />
                </p>
                <li className="text-sm mt-1 ml-4">
                  <Placeholder value={edu.description} placeholder="Relevant coursework or achievements" />
                </li>
              </div>
            ))}
          </div>
        </>
      </div>
      {/* Hobbies Section - Always rendered */}
      <div>
        {hobbies && hobbies.length > 0 && (
          <>
            <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
              HOBBIES
            </h3>
            <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {hobbies.map((hobby) => (
                <div key={hobby.id} className="flex items-center gap-1">
                  <li className="text-sm text-gray-800 font-medium ml-4 ">
                    {hobby.name}
                  </li>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Websites Section - Always rendered */}
      <div>
        {websites && websites.length > 0 && (
          <>
            <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
              WEBSITES
            </h3>
            <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
            <ul className="space-y-1 text-sm">
              {websites.map((site) => (
                <li key={site.id}>
                  <strong>{site.label}:</strong>{" "}
                  <a
                    href={site.url}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {site.url}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* References Section - Always rendered */}
      <div>
        {references && references.length > 0 && (
          <>
            <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
              REFERENCES
            </h3>
            <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
            <ul className="space-y-2 text-sm">
              {references.map((ref) => (
                <li key={ref.id}>
                  <strong>{ref.name}</strong>
                  {ref.relationship && ` — ${ref.relationship}`}
                  {ref.contactInfo && ` | ${ref.contactInfo}`}  
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Additional Information - Always visible with placeholders */}
      <div>
        <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
          ADDITIONAL INFORMATION
        </h3>
        <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />

        <li className="text-sm text-gray-800 ml-4">
          <span className="font-semibold">Languages:</span>{" "}
          <Placeholder
            value={languages && languages.length ? languages.map(l => `${l.name}${l.proficiency ? ` – ${l.proficiency}` : ''}`).join(', ') : ''}
            placeholder="English, French, Mandarin"
          />
        </li>

        <li className="text-sm text-gray-800 ml-4">
          <span className="font-semibold">Certification:</span>{" "}
          <Placeholder
            value={certifications && certifications.length ? certifications.map(c => c.title).join(', ') : ''}
            placeholder="Professional Design Engineer (PDE), Project Management Tech (PMT), Structural Process Design (SPD)"
          />
        </li>

        <li className="text-sm text-gray-800 ml-4">
          <span className="font-semibold">Awards:</span>{" "}
          <Placeholder
            value={awards && awards.length ? awards.map(a => a.title).join(', ') : ''}
            placeholder="Most Innovative Intern (2022), Best Intern (2022), Onboarding Project Lead (2024)"
          />
        </li>
      </div>

      {/* Custom Sections - Always rendered */}
      <div>
        {customSections && customSections.length > 0 && (
          <>
            {customSections.map((custom) => (
              <div key={custom.id}>
                <h3 className="text-lg font-semibold -mb-1 text-gray-800">
                  {custom.title}
                </h3>
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {custom.content}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Classic;