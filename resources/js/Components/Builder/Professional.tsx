import React from "react";
import { ResumeData } from "@/types/resume";

type Props = {
  resumeData: ResumeData;
};

const Professional: React.FC<Props> = ({ resumeData }) => {
  const {
    contact = {
      firstName: "",
      lastName: "",
      desiredJobTitle: "",
      address: "",
      city: "",
      phone: "",
      email: "",
    },
    experiences = [],
    education = [],
    skills = [],
    summary = "",
    languages = [],
    certifications = [],
    awards = [],
    websites = [],
    hobbies = [],
    customSections = [],
  } = resumeData;

  const Divider = () => (
    <div className="h-px bg-orange-700 opacity-70 w-full mb-1"></div>
  );

  // Function to convert skill level
  const getSkillDots = (level: string) => {
    const levels = ["Novice", "Beginner", "Skillful", "Experienced", "Expert"];
    const levelIndex = levels.indexOf(level);
    const maxDots = 5;

    let activeDots = levelIndex + 1;
    if (activeDots < 0) activeDots = 1;
    if (activeDots > maxDots) activeDots = maxDots;

    return (
      <span className="text-black-500 tracking-widest">
        {"●".repeat(activeDots)}
        {"○".repeat(maxDots - activeDots)}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto text-gray-800 font-sans p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold leading-tight">
          {contact.firstName} {contact.lastName}
        </h1>
        <p className="text-lg">{contact.desiredJobTitle}</p>
        <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-1">
          {contact.address && <span>{contact.address}</span>}
          {contact.city && <span>{contact.city}</span>}
          {contact.phone && (
            <>
              <span>┃</span>
              <span>{contact.phone}</span>
            </>
          )}
          {contact.email && (
            <>
              <span>┃</span>
              <span>{contact.email}</span>
            </>
          )}
          {websites.length > 0 && (
            <>
              <span>┃</span>
              <span>{websites[0].url}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">Summary</h2>
          <p className="text-sm mt-1 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">
            Professional Experience
          </h2>
          {experiences.map(exp => (
            <div key={exp.id} className="mt-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>
                  {exp.jobTitle}, {exp.company}
                </span>
                <span>
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              {exp.description && (
                <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                  {exp.description.split("\n").map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {customSections && customSections.length > 0 && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">Projects</h2>
          {customSections.map(section => (
            <div key={section.id} className="mt-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>{section.title}</span>
                {section.title && <span>{section.title}</span>}
              </div>
              <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                {section.content.split("\n").map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="mt-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>
                  {edu.degree}, {edu.school}
                </span>
                <span>
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              {edu.description && (
                <p className="text-sm mt-1 leading-relaxed">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">Skills</h2>
          <ul className="text-sm grid grid-cols-2 gap-x-8 gap-y-2">
            {skills.map((skill, i) => (
              <li key={i} className="flex items-center">
                <span className="w-32">{skill.name}</span>
                <span className="ml-1">{getSkillDots(skill.level || "Novice")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Information */}
      {(languages.length > 0 ||
        certifications.length > 0 ||
        awards.length > 0) && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">
            Additional Information
          </h2>
          {languages.length > 0 && (
            <p className="text-sm mt-1">
              <strong>Languages:</strong>{" "}
              {languages.map(l => `${l.name} (${l.proficiency})`).join(", ")}
            </p>
          )}
          {certifications.length > 0 && (
            <p className="text-sm mt-1">
              <strong>Certifications:</strong>{" "}
              {certifications.map(c => c.title).join(", ")}
            </p>
          )}
          {awards.length > 0 && (
            <p className="text-sm mt-1">
              <strong>Awards/Activities:</strong>{" "}
              {awards.map(a => a.title).join(", ")}
            </p>
          )}
          {hobbies.length > 0 && (
            <p className="text-sm mt-1">
              <strong>Hobbies:</strong>{" "}
              {hobbies.map(l => l.name).join(", ")}
            </p>
          )}
          {websites.length > 0 && (
            <p className="text-sm mt-1">
              <strong>Websites:</strong>{" "}
              {websites.map(w => `${w.label}: ${w.url}`).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* References */}
      {resumeData.references && resumeData.references.length > 0 && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">References</h2>
          {resumeData.references.map(ref => (
            <div key={ref.id} className="mt-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>{ref.name}</span>
                {ref.relationship && (
                  <span>({ref.relationship})</span>
                )}
              </div>
              {ref.contactInfo && (
                <p className="text-sm mt-1">{ref.contactInfo}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Professional;
