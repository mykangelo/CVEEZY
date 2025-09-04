import React from "react";
import { ResumeData, Website } from "@/types/resume";
import Placeholder from "./Placeholder";
import { processBulletedDescription, getBulletTexts } from "@/utils/bulletProcessor";

type Props = {
  resumeData: ResumeData;
};

const Modern: React.FC<Props> = ({ resumeData }) => {
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

  const getLanguageLevelBullets = (level: string): number => {
    switch (level) {
      case "Basic":
        return 1;
      case "Conversational":
        return 2;
      case "Fluent":
        return 3;
      case "Proficient":
        return 4;
      case "Native":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white text-black font-sans" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-black p-6">
        <h1 className="text-3xl font-bold mb-1">
          <Placeholder value={`${contact.firstName || ''} ${contact.lastName || ''}`.trim()} placeholder="Sebastian Bennett" />
        </h1>
        <p className="text-base font-normal mb-3 uppercase tracking-wide">
          <Placeholder value={contact.desiredJobTitle} placeholder="CHEMICAL ENGINEER" />
        </p>
        <div className="text-xs">
          <Placeholder value={[contact.phone, contact.address, contact.email].filter(Boolean).join(" | ")} placeholder="Phone | Address | Email" />
          {/* Websites */}
          {websites && websites.length > 0 && (
            <>
              <span> | </span>
              {websites.map((site, idx) => (
                <React.Fragment key={site.url}>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-black hover:text-black"
                  >
                    {site.url}
                  </a>
                  {idx < websites.length - 1 && <span> | </span>}
                </React.Fragment>
              ))}
            </>
          )}
          {/* Social Media */}
          {socials && socials.length > 0 && (
            <>
              <span> | </span>
              {socials.map((social: Website, idx: number) => (
                <React.Fragment key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-black hover:text-black"
                  >
                    {social.label || social.url}
                  </a>
                  {idx < socials.length - 1 && <span> | </span>}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Summary */}
        {summary && summary.trim() && (
          <div className="mb-6">
            <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider">SUMMARY</h2>
            </div>
            <p className="text-xs text-black leading-relaxed break-words">
              <Placeholder value={summary} placeholder={"Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills."} />
            </p>
          </div>
        )}

        {/* Work Experience */}
        <div className="mb-6">
          <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider">WORK EXPERIENCE</h2>
          </div>
          <div className="space-y-4">
            {(experiences.length > 0 ? experiences : [
              { 
                id: -1, 
                jobTitle: 'Policy Manager', 
                company: 'LexisMax Inc', 
                location: 'Location', 
                startDate: 'Oct 2020', 
                endDate: 'present', 
                description: 'Formulate and review policies for industry improvement\nCreate a functional and technical application of set policies' 
              },
              { 
                id: -2, 
                jobTitle: 'Quality Control Engineer', 
                company: 'CrystalPointe Water', 
                location: 'Location', 
                startDate: 'Jan 2019', 
                endDate: 'Sept 2020', 
                description: 'Collect and Analyze water samples from different stages of Production\nMake Recommendations on improvement based on my analysis\nSupervise implementations of Recommendations' 
              }
            ] as any[]).map((exp: any) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-black text-xs">
                      <Placeholder value={exp.jobTitle} placeholder="Policy Manager" /> | <Placeholder value={exp.company} placeholder="LexisMax Inc" />
                    </h3>
                  </div>
                  <div className="text-right text-xs text-black">
                    <Placeholder value={`${exp.startDate} - ${exp.endDate}`} placeholder="Oct 2020 - present" />
                  </div>
                </div>
                <div className="text-xs text-black space-y-1 mt-2">
                  {(() => {
                    const isPlaceholder = !(exp.description && String(exp.description).trim().length > 0);
                    
                    if (isPlaceholder) {
                      return (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-black mt-0.5 flex-shrink-0">•</span>
                            <p className="break-words leading-relaxed min-w-0 text-black text-gray-400 italic">Responsibilities</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-black mt-0.5 flex-shrink-0">•</span>
                            <p className="break-words leading-relaxed min-w-0 text-black text-gray-400 italic">Responsibilities</p>
                          </div>
                        </>
                      );
                    }

                    const processedBullets = processBulletedDescription(exp.description || '');
                    
                    if (processedBullets.length === 0) {
                      return (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-black mt-0.5 flex-shrink-0">•</span>
                            <p className="break-words leading-relaxed min-w-0 text-black">Responsibilities</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-black mt-0.5 flex-shrink-0">•</span>
                            <p className="break-words leading-relaxed min-w-0 text-black">Responsibilities</p>
                          </div>
                        </>
                      );
                    }

                    // Check if we have bullets or just regular text
                    const hasBullets = processedBullets.some(bullet => bullet.isBullet);
                    
                    if (hasBullets) {
                      return getBulletTexts(processedBullets).map((text, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-black mt-0.5 flex-shrink-0">•</span>
                          <p className="break-words leading-relaxed min-w-0 text-black">{text}</p>
                        </div>
                      ));
                    } else {
                      // Single paragraph or non-bulleted content
                      return (
                        <div className="flex items-start gap-2">
                          <span className="text-black mt-0.5 flex-shrink-0">•</span>
                          <p className="break-words leading-relaxed min-w-0 text-black">
                            {processedBullets[0]?.text || 'Responsibilities'}
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider">SKILLS</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {(skills.length > 0 ? skills : [
              { id: -1, name: 'Skill 1', level: 'Experienced' }, 
              { id: -2, name: 'Skill 2', level: 'Experienced' }, 
              { id: -3, name: 'Skill 3', level: 'Experienced' },
              { id: -4, name: 'Skill 4', level: 'Experienced' },
              { id: -5, name: 'Skill 5', level: 'Experienced' },
              { id: -6, name: 'Skill 6', level: 'Experienced' }
            ] as any[]).map((skill: any, index: number) => (
              <div key={index} className="flex items-center gap-5">
                <span className="text-xs text-black">
                  <Placeholder value={skill.name} placeholder={`Skill ${index + 1}`} />
                </span>
                {showExperienceLevel && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          i < getSkillLevelBullets(skill.level || 'Novice') 
                            ? 'bg-[#4a5a7a]' 
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

        {/* Education */}
        <div className="mb-6">
          <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider">EDUCATION</h2>
          </div>
          <div className="space-y-4">
            {(education.length > 0 ? education : [
              { 
                id: -1, 
                degree: 'MSc Process Engineering', 
                school: 'Dandillon', 
                location: 'Location', 
                startDate: 'Oct 2017', 
                endDate: 'Sept 2018',
                description: 'Studied Process planning, coordination, and efficiency\nWorked with various industries on launching efficient Process Systems'
              },
              { 
                id: -2, 
                degree: 'BEng Chemical Engineering', 
                school: 'Royal Clickton', 
                location: 'Location', 
                startDate: 'Jan 2012', 
                endDate: 'Sept 2016',
                description: 'Studied Chemical Engineering\nMinor in Process Management\nThesis in Modeling and Analysis of Process Efficiency in a Cement Plant'
              }
            ] as any[]).map((edu: any) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-black text-xs">
                      <Placeholder value={edu.degree} placeholder="MSc Process Engineering" /> | <Placeholder value={edu.school} placeholder="Dandillon" />
                    </h3>
                  </div>
                  <div className="text-right text-xs text-black">
                    <Placeholder value={`${edu.startDate} - ${edu.endDate}`} placeholder="Oct 2017 - Sept 2018" />
                  </div>
                </div>
                <p className="text-xs text-black mb-2"><Placeholder value={edu.location} placeholder="Location" /></p>
                {(() => {
                  const isPlaceholder = !(edu.description && String(edu.description).trim().length > 0);
                  
                  if (isPlaceholder) {
                    return null;
                  }

                  const processedBullets = processBulletedDescription(edu.description || '');
                  
                  if (processedBullets.length === 0) {
                    return null;
                  }

                  // Check if we have bullets or just regular text
                  const hasBullets = processedBullets.some(bullet => bullet.isBullet);
                  
                  if (hasBullets) {
                    return (
                      <div className="text-xs text-black space-y-1 mt-2">
                        {getBulletTexts(processedBullets).map((text, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-black mt-0.5 flex-shrink-0">•</span>
                            <p className="break-words leading-relaxed min-w-0 text-black">{text}</p>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-xs text-black mt-2">
                        <div className="flex items-start gap-2">
                          <span className="text-black mt-0.5 flex-shrink-0">•</span>
                          <p className="break-words leading-relaxed min-w-0 text-black">{processedBullets[0]?.text}</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            ))}
          </div>
        </div>

        

        {/* Interests */}
        {hobbies && hobbies.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider">INTERESTS</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {(hobbies.length > 0 ? hobbies : [
                { name: 'Simulation Design' },
                { name: 'Chess' },
                { name: 'Volunteer Work' },
                { name: 'International Affairs' },
                { name: 'Particulate Matters' },
                { name: 'Football' }
              ] as any[]).map((hobby: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-black mt-0.5 flex-shrink-0">•</span>
                  <span className="text-xs text-black">
                    <Placeholder value={hobby.name} placeholder={`Interest ${index + 1}`} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider">AWARDS</h2>
            </div>
            <div className="space-y-1">
              {(awards.length > 0 ? awards : [
                { title: 'Most Innovative Employee of the Year, LexisMax (2020)' },
                { title: 'Overall Best Employee of the Year, CrystalPointe (2019)' },
                { title: 'Project Leader, Dandillon (2018)' }
              ] as any[]).map((award: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-black mt-0.5 flex-shrink-0">•</span>
                  <span className="text-xs text-black">
                    <Placeholder value={award.title} placeholder={`Award ${index + 1}`} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider">LANGUAGES</h2>
            </div>
            <div className="space-y-1">
              {languages.map((lang, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-black mt-0.5 flex-shrink-0">•</span>
                  <span className="text-xs text-black">
                    {lang.proficiency ? `${lang.name} (${lang.proficiency})` : lang.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider">CERTIFICATIONS</h2>
            </div>
            <div className="space-y-1">
              {certifications.map((cert) => {
                const processedBullets = processBulletedDescription(cert.title || '');
                const hasBullets = processedBullets.some(bullet => bullet.isBullet);
                
                if (hasBullets) {
                  return getBulletTexts(processedBullets).map((text, index) => (
                    <div key={`${cert.id}-${index}`} className="flex items-start gap-2">
                      <span className="text-black mt-0.5 flex-shrink-0">•</span>
                      <span className="text-xs text-black break-words">{text}</span>
                    </div>
                  ));
                } else {
                  // If no bullets detected, try to split long certification strings by commas
                  const certTitle = cert.title || '';
                  if (certTitle.length > 100 && certTitle.includes(',')) {
                    // Split by commas and treat each as a bullet
                    const certItems = certTitle.split(',').map(item => item.trim()).filter(item => item.length > 0);
                    return certItems.map((item, index) => (
                      <div key={`${cert.id}-${index}`} className="flex items-start gap-2">
                        <span className="text-black mt-0.5 flex-shrink-0">•</span>
                        <span className="text-xs text-black break-words">{item}</span>
                      </div>
                    ));
                  } else {
                    return (
                      <div key={cert.id} className="flex items-start gap-2">
                        <span className="text-black mt-0.5 flex-shrink-0">•</span>
                        <span className="text-xs text-black break-words">{cert.title}</span>
                      </div>
                    );
                  }
                }
              })}
            </div>
          </div>
        )}

        {/* References */}
        {references && references.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider">REFERENCES</h2>
            </div>
            <div className="space-y-2">
              {references.map((ref) => (
                <div key={ref.id} className="text-xs text-black">
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
                <div className="bg-[#4a5a7a] text-white px-3 py-2 mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider break-all min-w-0" style={{wordBreak: 'break-all', overflowWrap: 'anywhere', wordWrap: 'break-word'}}>
                    {custom.title}
                  </h2>
                </div>
                <p className="text-xs text-black whitespace-pre-line break-all min-w-0" style={{wordBreak: 'break-all', overflowWrap: 'anywhere', wordWrap: 'break-word'}}>
                  {custom.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modern;
