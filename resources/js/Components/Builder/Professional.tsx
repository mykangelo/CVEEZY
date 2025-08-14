import React from "react";
import { ResumeData } from "@/types/resume";
import Placeholder from "./Placeholder";

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
          <Placeholder value={`${contact.firstName} ${contact.lastName}`.trim()} placeholder="YOUR NAME" />
        </h1>
        <p className="text-lg"><Placeholder value={contact.desiredJobTitle} placeholder="JOB TITLE" /></p>
        <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-1">
          <span><Placeholder value={contact.address} placeholder="123 Anywhere St" /></span>
          <span><Placeholder value={contact.city} placeholder="Any City" /></span>
          <span>┃</span>
          <span><Placeholder value={contact.phone} placeholder="(123) 456-7890" /></span>
          <span>┃</span>
          <span><Placeholder value={contact.email} placeholder="email@example.com" /></span>
          <span>┃</span>
          <span><Placeholder value={(websites[0] && websites[0].url) || ""} placeholder="portfolio.example.com" /></span>
        </div>
      </div>

      {/* Summary - always render */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase">Summary</h2>
        <p className="text-sm mt-1 leading-relaxed">
          <Placeholder value={summary} placeholder={"Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills."} />
        </p>
      </div>

      {/* Experience - always render with sample */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase">Professional Experience</h2>
        {(experiences.length > 0 ? experiences : [
          { id: -1, jobTitle: 'Job Title', company: 'Company', startDate: '2017', endDate: '2020', description: 'Led X to achieve Y\nOptimized Z for 20% improvement' },
          { id: -2, jobTitle: 'Job Title', company: 'Company', startDate: '2015', endDate: '2017', description: 'Built A to support B\nCollaborated with C teams' },
        ] as any[]).map(exp => (
          <div key={exp.id} className="mt-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>
                <Placeholder value={`${exp.jobTitle}, ${exp.company}`} placeholder="Job Title, Company" />
              </span>
              <span>
                <Placeholder value={`${exp.startDate} - ${exp.endDate}`} placeholder="2017 — 2020" />
              </span>
            </div>
            <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
              {((exp.description && exp.description.trim() !== '') ? exp.description : 'Led X to achieve Y\nOptimized Z for 20% improvement').split("\n").map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

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

      {/* Education - always render with sample */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase">Education</h2>
        {(education.length > 0 ? education : [
          { id: -1, degree: 'Degree in Field of study', school: 'School Name', startDate: '2013', endDate: '2017', description: '' },
        ] as any[]).map(edu => (
          <div key={edu.id} className="mt-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>
                <Placeholder value={`${edu.degree}, ${edu.school}`} placeholder="Degree in Field of study, School Name" />
              </span>
              <span>
                <Placeholder value={`${edu.startDate} - ${edu.endDate}`} placeholder="2013 — 2017" />
              </span>
            </div>
            {edu.description && (
              <p className="text-sm mt-1 leading-relaxed">{edu.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Skills - always render with sample */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase">Skills</h2>
        <ul className="text-sm grid grid-cols-2 gap-x-8 gap-y-2">
          {(skills.length > 0 ? skills : [
            { id: -1, name: 'Skill 1', level: 'Experienced' },
            { id: -2, name: 'Skill 2', level: 'Experienced' },
            { id: -3, name: 'Skill 3', level: 'Experienced' },
            { id: -4, name: 'Skill 4', level: 'Experienced' },
          ] as any[]).map((skill, i) => (
            <li key={i} className="flex items-center">
              <span className="w-32"><Placeholder value={skill.name} placeholder={`Skill ${i + 1}`} /></span>
              <span className="ml-1">{getSkillDots((skill.level as string) || "Experienced")}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Information */}
      {(languages.length > 0 ||
        certifications.length > 0 ||
        awards.length > 0 ||
        hobbies.length > 0 ||
        websites.length > 0) && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">
            Additional Information
          </h2>
          {languages.length > 0 && (
            <p className="text-sm mt-1">
              <strong>Languages:</strong>{" "}
              {languages.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(", ")}
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
