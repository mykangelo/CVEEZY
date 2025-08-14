import React from "react";
import { ResumeData } from "@/types/resume";

type Props = {
  resumeData: ResumeData;
};

const Elegant: React.FC<Props> = ({ resumeData }) => {
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

  const formatMonthYear = (value?: string): string => {
    if (!value) return "";
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value; // fallback to raw value
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  };

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
    <div className="text-[#333333] bg-white leading-[1.5] p-8 md:p-10 max-w-[850px] mx-auto elegant-template" style={{ fontFamily: "'Elegant Grotesk', 'Helvetica Neue', Arial, sans-serif" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @font-face { font-family: 'Elegant Grotesk'; src: url('/fonts/alte_haas_grotesk/AlteHaasGroteskRegular.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: swap; }
            @font-face { font-family: 'Elegant Grotesk'; src: url('/fonts/alte_haas_grotesk/AlteHaasGroteskBold.ttf') format('truetype'); font-weight: 700; font-style: normal; font-display: swap; }
            .elegant-name { font-size: 40px; font-weight: 800; letter-spacing: 0.20em; }
            .elegant-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.38em; font-weight: 700; }
            .elegant-section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.28em; }
          `,
        }}
      />
      {/* Top separator above header */}
      <div className="border-t border-gray-300 mb-6" />
      {/* Header: Name and Title */}
      <div className="relative text-center mb-8">
        {/* Signature initials background */}
        {((contact.firstName && contact.firstName[0]) || (contact.lastName && contact.lastName[0])) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0 }} aria-hidden>
            <span style={{
              fontFamily: '"Brush Script MT", "Segoe Script", "Pacifico", cursive',
              fontSize: 160,
              lineHeight: 1,
              opacity: 0.06,
              transform: 'translateY(8px) rotate(-8deg)'
            }}>
              {`${(contact.firstName?.[0] || '').toUpperCase()}${(contact.lastName?.[0] || '').toUpperCase()}`}
            </span>
          </div>
        )}
        <h1 className="elegant-name" style={{ position: 'relative', zIndex: 1 }}>
          {contact.firstName} {contact.lastName}
        </h1>
        {contact.desiredJobTitle && (
          <p className="mt-1 elegant-title text-[#333333]" style={{ position: 'relative', zIndex: 1 }}>
            {contact.desiredJobTitle}
          </p>
        )}
      </div>
      {/* Bottom separator is provided by the grid wrapper below to connect with the vertical divider */}

      {/* Content rows with single connected lines (table-like) */}
      <div className="border-t border-b border-gray-300">
        {/* Row 1: Contact | Profile Summary */}
        <div className="md:grid md:grid-cols-12">
          <div className="md:col-span-4 md:pr-0 md:border-r md:border-gray-300 py-5">
            <div className="pr-6">
              <h3 className="elegant-section-title mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                {contact.phone && (
                  <div className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 text-[#333333]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.1 4.16 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.31 1.77.57 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.47-1.09a2 2 0 0 1 2.11-.45c.84.26 1.71.45 2.61.57A2 2 0 0 1 22 16.92Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 text-[#333333]"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="m22 6-10 7L2 6" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{contact.email}</span>
                  </div>
                )}
                {hasLocationInfo && (
                  <div className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 text-[#333333]"><path d="M12 22s8-5.33 8-12a8 8 0 1 0-16 0c0 6.67 8 12 8 12Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="#333" strokeWidth="1.5"/></svg>
                    <span>
                      {[contact.address, contact.city, contact.country, contact.postCode]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {websites && websites.length > 0 && (
                  <div className="space-y-1">
                    {websites.map((site) => (
                      <div key={site.id} className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 text-[#333333]"><circle cx="12" cy="12" r="9" stroke="#333" strokeWidth="1.5"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" stroke="#333" strokeWidth="1.5"/></svg>
                        <a href={site.url} target="_blank" rel="noreferrer" className="underline text-[#333333]">
                          {site.url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-8 py-5 md:pl-6">
            <h3 className="elegant-section-title mb-3">Profile Summary</h3>
            {summary && <p className="text-[13px] whitespace-pre-line">{summary}</p>}
          </div>
        </div>

        {/* Row 2: Education | Work Experience */}
        <div className="border-t border-gray-300 md:grid md:grid-cols-12">
          <div className="md:col-span-4 md:pr-0 md:border-r md:border-gray-300 py-0">
            <div className="py-5 pr-6">
              <h3 className="elegant-section-title mb-3">Education</h3>
              {education.length > 0 && (
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <p className="text-[13px] font-semibold">{edu.degree}</p>
                      <p className="text-[13px]">{edu.school}{edu.location ? ` — ${edu.location}` : ""}</p>
                      <p className="text-[11px] text-gray-600">{formatMonthYear(edu.startDate)}{edu.endDate ? ` - ${formatMonthYear(edu.endDate)}` : ""}</p>
                      {edu.description && <p className="mt-1 text-[13px]">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* full-width separator inside the left column that touches the right vertical line */}
            {skills.length > 0 && <div className="border-t border-gray-300" />}
            {skills.length > 0 && (
              <div className="py-5 pr-6">
                <h3 className="elegant-section-title mb-3">Skills</h3>
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-[13px]">{skill.name}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < getSkillLevelBullets(skill.level || 'Novice')
                                ? 'bg-[#333333]'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {languages && languages.length > 0 && <div className="border-t border-gray-300" />}
            {languages && languages.length > 0 && (
              <div className="py-5 pr-6">
                <h3 className="elegant-section-title mb-3">Languages</h3>
                <ul className="list-disc pl-5 text-[13px] space-y-1">
                  {languages.map((lang) => (
                    <li key={lang.id}>
                      {lang.name}
                      {lang.proficiency ? ` (${lang.proficiency})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="md:col-span-8 py-5 md:pl-6">
            <h3 className="elegant-section-title mb-3">Work Experience</h3>
            {experiences.length > 0 && (
              <div className="space-y-4">
                {experiences.map((exp) => {
                  const lines = (exp.description || "").split(/\r?\n/).filter(Boolean);
                  return (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="text-[13px] font-semibold">{exp.company}</p>
                        <p className="text-[11px] text-gray-600">
                          {formatMonthYear(exp.startDate)}{exp.endDate ? ` - ${formatMonthYear(exp.endDate)}` : ""}
                        </p>
                      </div>
                      <p className="text-[13px] mb-2">{exp.jobTitle}{exp.location ? ` – ${exp.location}` : ""}</p>
                      {lines.length > 0 ? (
                        <ul className="list-disc pl-5 text-[13px] space-y-1">
                          {lines.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        exp.description && <p className="text-[13px]">{exp.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Only render if there are items for the right column (certs/awards/references/custom) */}
        {(!!(certifications && certifications.length) || !!(awards && awards.length) || !!(references && references.length) || !!(customSections && customSections.length)) && (
          <div className="md:grid md:grid-cols-12">
            <div className="hidden md:block md:col-span-4" />
            <div className="md:col-span-8 py-5 md:pl-6 md:border-l md:border-gray-300 border-t border-gray-300">
              {customSections && customSections.length > 0 && (
                <div className="space-y-4 mb-4">
                  {customSections.map((custom) => (
                    <div key={custom.id}>
                      <p className="elegant-section-title mb-2">{custom.title}</p>
                      <p className="text-[13px] whitespace-pre-line">{custom.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {certifications && certifications.length > 0 && (
                <div className="mb-4">
                  <p className="elegant-section-title mb-2">Certifications</p>
                  <ul className="list-disc pl-5 text-[13px] space-y-1">
                    {certifications.map((cert) => (
                      <li key={cert.id}>{cert.title}</li>
                    ))}
                  </ul>
                </div>
              )}
              {awards && awards.length > 0 && (
                <div className="mb-4">
                  <p className="elegant-section-title mb-2">Awards</p>
                  <ul className="list-disc pl-5 text-[13px] space-y-1">
                    {awards.map((award) => (
                      <li key={award.id}>{award.title}</li>
                    ))}
                  </ul>
                </div>
              )}
              {references && references.length > 0 && (
                <div>
                  <p className="elegant-section-title mb-2">References</p>
                  <ul className="list-disc pl-5 text-[13px] space-y-1">
                    {references.map((ref) => (
                      <li key={ref.id}>
                        <span className="font-semibold">{ref.name}</span>
                        {ref.relationship ? ` — ${ref.relationship}` : ""}
                        {ref.contactInfo ? ` — ${ref.contactInfo}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Elegant;