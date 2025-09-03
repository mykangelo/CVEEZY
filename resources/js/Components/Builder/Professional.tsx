import React from "react";
import { ResumeData } from "@/types/resume";
import Placeholder from "./Placeholder";
import { processBulletedDescription, getBulletTexts } from "@/utils/bulletProcessor";

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
      postCode: "",
      country: "",
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
    showExperienceLevel,
  } = resumeData;

  const Divider = () => (
    <div className="h-px bg-orange-700 opacity-70 w-full mb-1"></div>
  );

  // Function to convert skill level
  const getSkillDots = (level: string, muted: boolean = false) => {
    const levels = ["Novice", "Beginner", "Skillful", "Experienced", "Expert"];
    const levelIndex = levels.indexOf(level);
    const maxDots = 5;

    let activeDots = levelIndex + 1;
    if (activeDots < 0) activeDots = 1;
    if (activeDots > maxDots) activeDots = maxDots;

    return (
      <span className={`${muted ? 'text-gray-300' : 'text-gray-700'} tracking-widest`}>
        {"●".repeat(activeDots)}
        {"○".repeat(maxDots - activeDots)}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto text-gray-800 font-sans p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold leading-tight break-words">
          <Placeholder value={`${contact.firstName} ${contact.lastName}`.trim()} placeholder="YOUR NAME" />
        </h1>
        <p className="text-lg break-words"><Placeholder value={contact.desiredJobTitle} placeholder="JOB TITLE" /></p>
        <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-1 break-words">
          <span className="break-all"><Placeholder value={contact.address} placeholder="123 Anywhere St" />, </span>
          <span className="break-all"><Placeholder value={contact.city} placeholder="Any City" /></span>
          <span>, </span>
          <span className="break-all"><Placeholder value={contact.country} placeholder="Country" /></span>
          <span>, </span>
          <span className="break-all"><Placeholder value={contact.postCode} placeholder="12345" /></span>
          <span>┃</span>
          <span className="break-all"><Placeholder value={contact.phone} placeholder="(123) 456-7890" /></span>
          <span>┃</span>
          <span className="break-all"><Placeholder value={contact.email} placeholder="email@example.com" /></span>
        </div>
      </div>

      {/* Summary - always render */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase break-words">Summary</h2>
        <p className="text-sm mt-1 leading-relaxed break-words">
          <Placeholder value={summary} placeholder={"Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills."} />
        </p>
      </div>

      {/* Experience - always render with sample */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase break-words">Professional Experience</h2>
        {(experiences.length > 0 ? experiences : [
          { id: -1, jobTitle: '', company: '', startDate: '', endDate: '', description: '' },
        ] as any[]).map(exp => (
          <div key={exp.id} className="mt-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="break-words">
                <Placeholder value={(exp.jobTitle || exp.company) ? `${exp.jobTitle}${exp.jobTitle && exp.company ? ', ' : ''}${exp.company}` : ''} placeholder="Job Title, Company" />
              </span>
              <span className="break-words">
                <Placeholder value={(exp.startDate || exp.endDate) ? `${exp.startDate} - ${exp.endDate}` : ''} placeholder="2017 — 2020" />
              </span>
            </div>
            {/* Employer (stored as location in resumeData mapping) */}
            <p className="text-xs text-gray-600 italic mt-0.5 break-words">
              <Placeholder value={(exp as any).location} placeholder="Employer" />
            </p>
            {(() => {
              const isPlaceholder = !(exp.description && String(exp.description).trim().length > 0);
              
              if (isPlaceholder) {
                return (
                  <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                    <li className="text-gray-400 italic">Sample Text</li>
                  </ul>
                );
              }

              const processedBullets = processBulletedDescription(exp.description || '');
              
              if (processedBullets.length === 0) {
                return (
                  <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                    <li>Sample Text</li>
                  </ul>
                );
              }

              // Check if we have bullets or just regular text
              const hasBullets = processedBullets.some(bullet => bullet.isBullet);
              
              if (hasBullets) {
                return (
                  <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                    {getBulletTexts(processedBullets).map((text, index) => (
                      <li key={index} className="break-words">{text}</li>
                    ))}
                  </ul>
                );
              } else {
                // Single paragraph or non-bulleted content
                return (
                  <p className="text-sm mt-1 break-words">
                    {processedBullets[0]?.text || 'Sample Text'}
                  </p>
                );
              }
            })()}
          </div>
        ))}
      </div>

      {/* Projects - only show if user adds custom sections */}
      {customSections && customSections.length > 0 && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase">Projects</h2>
          {customSections.map((section: any) => (
            <div key={section.id} className="mt-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>{section.title}</span>
                {section.date && <span className="text-gray-500">{section.date}</span>}
              </div>
              <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                {String(section.content || '').split("\n").filter(Boolean).map((point: string, i: number) => (
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
        <h2 className="text-lg font-semibold uppercase break-words">Education</h2>
        {(education.length > 0 ? education : [
          { id: -1, degree: '', school: '', startDate: '', endDate: '', description: '', location: '' },
        ] as any[]).map(edu => (
          <div key={edu.id} className="mt-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="break-words">
                <Placeholder value={(edu.degree || edu.school) ? `${edu.degree}${edu.degree && edu.school ? ', ' : ''}${edu.school}` : ''} placeholder="Degree in Field of study, School Name" />
              </span>
              <span className="break-words">
                <Placeholder value={(edu.startDate || edu.endDate) ? `${edu.startDate} - ${edu.endDate}` : ''} placeholder="2013 — 2017" />
              </span>
            </div>
            {(edu as any).location && (
              <p className="text-xs text-gray-600 italic mt-0.5 break-words">{(edu as any).location}</p>
            )}
            {edu.description && (
              <p className="text-sm mt-1 leading-relaxed break-words">{edu.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Skills - always render with sample */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase break-words">Skills</h2>
        <ul className="text-sm grid grid-cols-2 gap-x-8 gap-y-2">
          {(skills.length > 0 ? skills : [
            { id: -1, name: '', level: 'Experienced' },
            { id: -2, name: '', level: 'Experienced' },
            { id: -3, name: '', level: 'Experienced' },
            { id: -4, name: '', level: 'Experienced' },
          ] as any[]).map((skill: any, i: number) => (
            <li key={i} className="flex items-center">
              <span className="w-32 break-words">
                <Placeholder value={skill.name} placeholder={`Skill ${i + 1}`} />
              </span>

              {/* Only show dots if experience levels are enabled */}
              {showExperienceLevel && (
                <span className="ml-1">
                  {getSkillDots(
                    (skill.level as string) || 'Experienced',
                    !(skill.name && String(skill.name).trim().length > 0)
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>


      {/* Additional Information - always show with placeholders */}
      <div>
        <Divider />
        <h2 className="text-lg font-semibold uppercase break-words">Additional Information</h2>
        <p className="text-sm mt-1 break-words">
          <strong>Languages:</strong>{" "}
          <Placeholder
            value={languages.length ? languages.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(', ') : ''}
            placeholder="English, French, Mandarin"
          />
        </p>
        <div className="text-sm mt-1 break-words">
          <strong>Certifications:</strong>
          {(() => {
            const isPlaceholder = !(certifications && certifications.length > 0);
            
            if (isPlaceholder) {
              return (
                <span className="text-gray-400 italic ml-1">
                  Professional Design Engineer (PDE), Project Management Tech (PMT), Structural Process Design (SPD)
                </span>
              );
            }

            // Process each certification title for potential bullet splitting
            const allCertTexts = certifications.map(cert => cert.title || '');
            const processedBullets = allCertTexts.map(title => processBulletedDescription(title));
            const hasAnyBullets = processedBullets.some(bullets => bullets.some(bullet => bullet.isBullet));
            
            if (hasAnyBullets) {
              return (
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  {processedBullets.flatMap((bullets, certIndex) => 
                    bullets.map((bullet, bulletIndex) => (
                      <li key={`${certIndex}-${bulletIndex}`} className="break-words">{bullet.text}</li>
                    ))
                  )}
                </ul>
              );
            } else {
              // If no bullets detected, try to split long certification strings by commas
              const allCerts = allCertTexts.join(', ');
              if (allCerts.length > 100 && allCerts.includes(',')) {
                // Split by commas and treat each as a bullet
                const certItems = allCerts.split(',').map(cert => cert.trim()).filter(cert => cert.length > 0);
                return (
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    {certItems.map((cert, index) => (
                      <li key={index} className="break-words">{cert}</li>
                    ))}
                  </ul>
                );
              } else {
                return (
                  <span className="ml-1 break-words">
                    {allCertTexts.join(', ')}
                  </span>
                );
              }
            }
          })()}
        </div>
        <p className="text-sm mt-1 break-words">
          <strong>Awards/Activities:</strong>{" "}
          <Placeholder
            value={awards.length ? awards.map(a => a.title).join(', ') : ''}
            placeholder="Most Innovative Intern of the Year (2022), Overall Best Intern (2022), Onboarding Project Lead (2024)"
          />
        </p>
        {websites && websites.length > 0 && (
          <p className="text-sm mt-1 break-words">
            <strong>Websites:</strong>{" "}
            {websites.map(w => `${w.label}: ${w.url}`).join(', ')}
          </p>
        )}
        {hobbies && hobbies.length > 0 && (
          <p className="text-sm mt-1 break-words">
            <strong>Hobbies:</strong>{" "}
            {hobbies.map(h => h.name).join(', ')}
          </p>
        )}
      </div>

      {/* References */}
      {resumeData.references && resumeData.references.length > 0 && (
        <div>
          <Divider />
          <h2 className="text-lg font-semibold uppercase break-words">References</h2>
          {resumeData.references.map(ref => (
            <div key={ref.id} className="mt-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="break-words">{ref.name}</span>
                {ref.relationship && (
                  <span className="break-words">({ref.relationship})</span>
                )}
              </div>
              {ref.contactInfo && (
                <p className="text-sm mt-1 break-words">{ref.contactInfo}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Professional;
