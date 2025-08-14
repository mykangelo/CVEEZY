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

  const hasContactSection =
    contact.firstName ||
    contact.lastName ||
    contact.desiredJobTitle ||
    hasContactInfo ||
    contact.email ||
    contact.phone;

  return (
    <div className="space-y-4 text-gray-800 ">
    {/* Contact Info - Only render if any contact info */}
    {hasContactSection && (
      <div>
        <h2 className="text-3xl font-bold text-center">
          <Placeholder value={`${contact.firstName} ${contact.lastName}`.trim()} placeholder="FIRSTNAME LASTNAME" />
        </h2>

        <p className="text-lg text-gray-800 mt-2 text-center">
          <span className="font-bold">
            <Placeholder value={contact.desiredJobTitle} placeholder="JOB TITLE" />
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
          {hasLocationInfo && contact.email && <span>|</span>}
          <span><Placeholder value={contact.email} placeholder="email@example.com" /></span>

          {hasLocationInfo && contact.phone && <span>|</span>}
          <span><Placeholder value={contact.phone} placeholder="(123) 456-7890" /></span>
        </div>
        <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
      </div>
    )}

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

      {/* Skills Section - Always rendered */}
      <div>
        {skills.length > 0 && (
          <>
            <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
              AREA OF EXPERTISE
            </h3>
            <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {(skills.length > 0 ? skills : [{ id: 1, name: 'Sample Skill', level: 'Experienced' }]).map((skill, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-sm text-gray-800 font-medium">
                    <Placeholder value={skill.name} placeholder="Sample Skill" />
                  </span>
                  {skill.name?.trim() && skill.level && showExperienceLevel && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
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
          </>
        )}
      </div>

      {/* Experience Section - Always rendered */}
      <div>
        {experiences.length > 0 && (
          <>
            <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
              PROFESSIONAL EXPERIENCE
            </h3>
            <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
            <div className="space-y-4">
              {(experiences.length > 0 ? experiences : [{ id: -1, jobTitle: 'Job Title', company: 'Company', location: 'City, ST', startDate: '2020', endDate: '2022', description: 'Describe impact and achievements', expanded: true } as any]).map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">
                      <Placeholder value={exp.jobTitle} placeholder="Job Title" />
                    </h4>
                    <span className="text-sm text-gray-800 font-semibold">
                      <Placeholder value={`${exp.startDate} - ${exp.endDate}`} placeholder="Jan 2020 - Dec 2022" />
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 italic">
                    <Placeholder value={`${exp.company} — ${exp.location}`} placeholder="Company — City, ST" />
                  </p>
                  <li className="text-sm mt-1 ml-4">
                    <Placeholder value={exp.description} placeholder="Describe impact and achievements" />
                  </li>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Education Section - Always rendered */}
      <div>
        <>
          <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
            EDUCATION
          </h3>
          <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
          <div className="space-y-4">
            {(education.length > 0 ? education : [{ id: -1, degree: 'Degree', school: 'University Name', location: 'City, ST', startDate: '2016', endDate: '2020', description: 'Relevant coursework or achievements' } as any]).map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold"><Placeholder value={edu.degree} placeholder="Degree" /></h4>
                  <span className="text-sm text-gray-800 font-semibold">
                    <Placeholder value={`${edu.startDate} - ${edu.endDate}`} placeholder="2016 - 2020" />
                  </span>
                </div>
                <p className="text-sm text-gray-800 italic">
                  <Placeholder value={`${edu.school} — ${edu.location}`} placeholder="University — City, ST" />
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

      {/* Additional Information Section - Always rendered */}
      <div>
        {(languages && languages.length > 0) || 
         (certifications && certifications.length > 0) || 
         (awards && awards.length > 0) ? (
          <>
            <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
              ADDITIONAL INFORMATION
            </h3>
            <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />

            {/* Languages */}
            {languages && languages.length > 0 && (
              <li className="text-sm text-gray-800 ml-4">
                <span className="font-semibold">Languages:</span>{" "}
                {languages.map((lang, index) => (
                  <span key={lang.id}>
                    {lang.name} {lang.proficiency && `– ${lang.proficiency}`} 
                    {index < languages.length - 1 && ", "}
                  </span>
                ))} 
              </li>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div>
                <li className="text-sm text-gray-800 ml-4">
                  <span className="font-semibold">Certification:</span>{" "}
                  {certifications.map((cert, index) => (
                    <span key={cert.id}>
                      {cert.title}
                      {index < certifications.length - 1 && ", "}
                    </span>
                  ))}
                </li>
              </div>
            )}

            {/* Awards */}
            {awards && awards.length > 0 && (
              <div>
                <li className="text-sm text-gray-800 ml-4">
                  <span className="font-semibold">Awards:</span>{" "}
                  {awards.map((award, index) => (
                    <span key={award.id}>
                      {award.title}
                      {index < awards.length - 1 && ", "}
                    </span>
                  ))}
                </li>
              </div>
            )}
          </>
        ) : null}
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