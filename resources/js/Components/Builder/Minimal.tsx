import React from "react";
import { ResumeData, Website } from "@/types/resume";
import Placeholder from "./Placeholder";

type Props = {
  resumeData: ResumeData;
};

const Minimal: React.FC<Props> = ({ resumeData }) => {
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

  // Some resumes may include social links on the contact object
  const socials: Website[] | undefined = (contact as unknown as { socials?: Website[] }).socials;

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

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2 tracking-wide">
          <Placeholder value={`${(contact.firstName||'').toUpperCase()} ${(contact.lastName||'').toUpperCase()}`.trim()} placeholder="YOUR NAME" />
        </h1>
        <p className="text-xl font-bold text-black mb-3">
          <Placeholder value={contact.desiredJobTitle} placeholder="JOB TITLE" />
        </p>
        <div className="text-sm text-black space-x-4">
          <span>
            <Placeholder value={[contact.address, contact.city, contact.country, contact.postCode].filter(Boolean).join(", ")} placeholder="123 Anywhere St, Any City | 12345" />
          </span>
          <span className="mx-1">|</span>
          <span><Placeholder value={contact.phone} placeholder="(123) 456-7890" /></span>
          <span className="mx-1">|</span>
          <span><Placeholder value={contact.email} placeholder="email@example.com" /></span>
          {/* Websites */}
          {websites && websites.length > 0 && (
            <>
              <span>|</span>
              {websites.map((site, idx) => (
                <React.Fragment key={site.url}>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-black hover:text-black mr-2"
                  >
                    {site.label || site.url}
                  </a>
                  {idx < websites.length - 1 && <span>|</span>}
                </React.Fragment>
              ))}
            </>
          )}
          {/* Social Media */}
          {socials && socials.length > 0 && (
            <>
              <span>|</span>
              {socials.map((social: Website, idx: number) => (
                <React.Fragment key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-black hover:text-black mr-2"
                  >
                    {social.label || social.url}
                  </a>
                  {idx < socials.length - 1 && <span>|</span>}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <div className="bg-gray-200 px-4 py-2 mb-3 rounded-full">
          <h2 className="text-lg font-semibold italic text-black">SUMMARY</h2>
        </div>
        <p className="text-sm text-black leading-relaxed break-words">
          <Placeholder value={summary} placeholder={"Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills."} />
        </p>
      </div>

       {/* Skills */}
       <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 mb-3 rounded-full">
            <h2 className="text-lg font-semibold italic text-black">TECHNICAL SKILLS</h2>
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            {(skills.length > 0 ? skills : [{ id: -1, name: 'Skill 1', level: 'Experienced' }, { id: -2, name: 'Skill 2', level: 'Experienced' }, { id: -3, name: 'Skill 3', level: 'Experienced' }] as any[]).map((skill: any, index: number) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-sm text-black font-medium"><Placeholder value={skill.name} placeholder={`Skill ${index + 1}`} /></span>
                {showExperienceLevel && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i < getSkillLevelBullets(skill.level || 'Novice') ? 'bg-black' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      {/* Experience */}
      <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 mb-3 rounded-full">
            <h2 className="text-lg font-semibold italic text-black">PROFESSIONAL EXPERIENCE</h2>
          </div>
          <div className="space-y-4">
            {(experiences.length > 0 ? experiences : [{ id: -1, jobTitle: 'Job Title', company: 'Company', location: 'Location', startDate: '2017', endDate: '2020', description: 'Responsibilities\nResponsibilities' }] as any[]).map((exp: any) => (
              <div key={exp.id} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-black flex-1 mr-4"><Placeholder value={`${exp.jobTitle}, ${exp.company}`} placeholder="Job Title, Company" /></h3>
                  <span className="text-sm font-bold text-black whitespace-nowrap text-right"><Placeholder value={`${exp.startDate} - ${exp.endDate}`} placeholder="2017 — 2020" /></span>
                </div>
                <p className="text-sm text-black mb-3"><Placeholder value={exp.location} placeholder="Location" /></p>
                <div className="text-sm text-black space-y-2">
                  {((exp.description && exp.description.trim() !== '') ? exp.description : 'Responsibilities\nResponsibilities').split('\n').map((line: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-black font-bold mt-0.5 flex-shrink-0">•</span>
                      <p className="break-words leading-relaxed min-w-0">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Education */}
      <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 mb-3 rounded-full">
            <h2 className="text-lg font-semibold italic text-black">EDUCATION</h2>
          </div>
          <div className="space-y-4">
            {(education.length > 0 ? education : [{ id: -1, degree: 'Degree in Field of study', school: 'School Name', location: 'Location', startDate: '2017', endDate: '2020' }] as any[]).map((edu: any) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-black flex-1 mr-4"><Placeholder value={edu.degree} placeholder="Degree in Field of study" /></h3>
                  <span className="text-sm font-bold text-black whitespace-nowrap ml-4"><Placeholder value={`${edu.startDate} - ${edu.endDate}`} placeholder="2017 — 2020" /></span>
                </div>
                <p className="text-sm text-black mb-2"><Placeholder value={edu.school} placeholder="School Name" /></p>
                <p className="text-sm text-black mb-2"><Placeholder value={edu.location} placeholder="Location" /></p>
                {edu.description && (
                  <div className="text-sm text-black">
                    {edu.description.trim() !== '' ? (
                      <div className="flex items-start gap-2">
                        <span className="text-black font-bold mt-0.5 flex-shrink-0">•</span>
                        <p className="break-words min-w-0">{edu.description.trim()}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      {/* Additional Information */}
      {((languages && languages.length > 0) || (certifications && certifications.length > 0) || (awards && awards.length > 0) || (hobbies && hobbies.length > 0)) && (
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 mb-3 rounded-full">
            <h2 className="text-lg font-semibold italic text-black">ADDITIONAL INFORMATION</h2>
          </div>
          <div className="space-y-3">
            {/* Languages */}
            {languages && languages.length > 0 && (
              <div>
                <span className="text-sm text-black">• <span className="font-semibold">Languages:</span> </span>
                <span className="text-sm text-black">
                  {languages.map(lang => lang.name).join(', ')}
                </span>
              </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div>
                <span className="text-sm text-black">• <span className="font-semibold">Certifications:</span> </span>
                <span className="text-sm text-black">
                  {certifications.map(cert => cert.title).join(', ')}
                </span>
              </div>
            )}

            {/* Awards */}
            {awards && awards.length > 0 && (
              <div>
                <span className="text-sm text-black">• <span className="font-semibold">Awards/Activities:</span> </span>
                <span className="text-sm text-black">
                  {awards.map(award => award.title).join(', ')}
                </span>
              </div>
            )}

            {/* Hobbies */}
            {hobbies && hobbies.length > 0 && (
              <div>
                <span className="text-sm text-black">• <span className="font-semibold">Hobbies:</span> </span>
                <span className="text-sm text-black">
                  {hobbies.map(hobby => hobby.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* References */}
      {references && references.length > 0 && (
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 mb-3 rounded-full">
            <h2 className="text-lg font-semibold italic text-black">REFERENCES</h2>
          </div>
          <div className="space-y-2">
            {references.map((ref) => (
              <div key={ref.id} className="text-sm text-black">
                <span className="font-semibold">{ref.name}</span>
                {ref.relationship && ` — ${ref.relationship}`}
                {ref.contactInfo && (
                  <span className="text-black"> — {ref.contactInfo}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        <div className="space-y-6">
          {customSections.map((custom) => (
            <div key={custom.id}>
              <div className="bg-gray-200 px-4 py-2 mb-3">
                <h2 className="text-lg font-bold italic text-black">
                  {custom.title.toUpperCase()}
                </h2>
              </div>
              <p className="text-sm text-black whitespace-pre-line">
                {custom.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Minimal;