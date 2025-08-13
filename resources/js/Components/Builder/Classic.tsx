import React from "react";
import { ResumeData } from "@/types/resume";

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
          {contact.firstName} {contact.lastName}
        </h2>

        <p className="text-lg text-gray-800 mt-2 text-center">
          {contact.desiredJobTitle && (
            <span className="font-bold">{contact.desiredJobTitle}</span>
          )}
        </p>
        <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />

        <div className="space-x-2 text-center">
          {hasLocationInfo && (
            <span>
              {[contact.address, contact.city, contact.country, contact.postCode]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {hasLocationInfo && contact.email && <span>|</span>}
          {contact.email && <span>{contact.email}</span>}

          {hasLocationInfo && contact.phone && <span>|</span>}
          {contact.phone && <span>{contact.phone}</span>}
        </div>
        <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
      </div>
    )}

      {/* Summary Section - Always rendered */}
      <div>
        {summary && (
          <>
            <p className="text-sm text-gray-800 whitespace-pre-line -mt-2">
              {summary}
            </p>
          </>
        )}
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
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-sm text-gray-800 font-medium">
                    {skill.name}
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
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">
                      {exp.jobTitle}
                    </h4>
                    <span className="text-sm text-gray-800 font-semibold">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 italic">
                    {exp.company} — {exp.location}
                  </p>
                  {exp.description && (
                    <li className="text-sm mt-1 ml-4">
                      {exp.description}
                    </li>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Education Section - Always rendered */}
      <div>
        {education.length > 0 && (
          <>
            <h3 className="text-lg font-semibold -mb-1 text-gray-800 ml-4 mt-7">
              EDUCATION
            </h3>
            <hr className="border-t border-b-[1.5px] border-gray-900 my-2" />
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">{edu.degree}</h4>
                    <span className="text-sm text-gray-800 font-semibold">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 italic">
                    {edu.school} — {edu.location}
                  </p>
                  {edu.description && (
                    <li className="text-sm mt-1 ml-4">
                      {edu.description}
                    </li>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
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