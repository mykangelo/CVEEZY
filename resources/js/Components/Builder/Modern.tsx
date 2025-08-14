import React from "react";
import { ResumeData } from "@/types/resume";

// Add Montserrat font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
if (!document.head.querySelector('link[href*="Montserrat"]')) {
    document.head.appendChild(fontLink);
}

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

    // Updated icons to match the CSS template design
    const PhoneIcon = () => (
        <div className="relative w-4 h-4 flex items-center justify-center">
            <div 
                className="absolute bg-gray-800 rounded-sm"
                style={{
                    width: '8px',
                    height: '12px',
                    top: '2px',
                    left: '4px'
                }}
            />
            <div 
                className="absolute bg-white rounded-sm"
                style={{
                    width: '4px',
                    height: '1px',
                    top: '4px',
                    left: '6px'
                }}
            />
        </div>
    );

    const MailIcon = () => (
        <div className="relative w-4 h-4 flex items-center justify-center">
            <div 
                className="absolute border border-gray-800 rounded-sm bg-white"
                style={{
                    width: '12px',
                    height: '8px',
                    top: '4px',
                    left: '2px'
                }}
            />
            <div 
                className="absolute"
                style={{
                    top: '5px',
                    left: '8px',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '3px solid #1f2937'
                }}
            />
        </div>
    );

    const MapPinIcon = () => (
        <div className="relative w-4 h-4 flex items-center justify-center">
            <div 
                className="absolute bg-gray-800 shadow-sm"
                style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    top: '2px',
                    left: '3.5px',
                    boxShadow: 'inset 2px 2px 0 #fff, 0 2px 3px rgba(0, 0, 0, 0.1)'
                }}
            />
            <div 
                className="absolute bg-white rounded-full"
                style={{
                    width: '3px',
                    height: '3px',
                    top: '4.5px',
                    left: '6.5px',
                    boxShadow: '0 0 0 1px rgba(31, 41, 55, 0.3)'
                }}
            />
        </div>
    );

    const GlobeIcon = () => (
        <div className="relative w-4 h-4 flex items-center justify-center">
            <div 
                className="absolute border-2 border-gray-800 rounded-sm bg-transparent"
                style={{
                    width: '5px',
                    height: '8px',
                    transform: 'rotate(-25deg)',
                    top: '2px',
                    left: '3px'
                }}
            />
            <div 
                className="absolute border-2 border-gray-800 rounded-sm bg-transparent"
                style={{
                    width: '5px',
                    height: '8px',
                    transform: 'rotate(-25deg)',
                    top: '6px',
                    left: '7px'
                }}
            />
        </div>
    );

    return (
        <div className="w-full text-gray-800 font-sans flex min-h-screen" style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Arial Unicode MS", "Noto Sans", sans-serif' }}>
            {/* Left Column */}
            <div className="w-3/5 p-8 border-r border-gray-300">
                {/* Header */}
                {(contact.firstName ||
                    contact.lastName ||
                    contact.desiredJobTitle) && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        {contact.firstName && (
                            <h1 className="font-semibold text-gray-800 mb-2 tracking-wider" style={{ fontSize: '42px', lineHeight: '0.9', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                                {contact.firstName.toUpperCase()}
                            </h1>
                        )}
                        {contact.lastName && (
                            <h1 className="font-semibold text-gray-800 mb-4 tracking-wider" style={{ fontSize: '42px', lineHeight: '0.9', letterSpacing: '.2em', textTransform: 'uppercase', display: 'block' }}>
                                {contact.lastName.toUpperCase()}
                            </h1>
                        )}
                        {contact.desiredJobTitle && (
                            <h2 className="font-normal text-gray-600 tracking-widest uppercase mb-8" style={{ fontSize: '20px', letterSpacing: '0.1em', marginTop: '8px' }}>
                                {contact.desiredJobTitle}
                            </h2>
                        )}
                    </div>
                )}

                {/* Profile/Summary */}
                {summary && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '15px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '2px solid #374151' }}>
                            Profile
                        </h3>
                        <p className="text-gray-600 leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.5', textAlign: 'justify' }}>
                            {summary}
                        </p>
                    </div>
                )}

                {/*Work Experience -Timeline */}
                {experiences && experiences.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '15px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '2px solid #374151' }}>
                            Work Experience
                        </h3>
                        <div className="relative">
                            {experiences.map((exp, index) => (
                                <div
                                    key={exp.id}
                                    className="relative flex mb-8 last:mb-0"
                                >
                                    {/* Timeline line and dot */}
                                    <div className="flex flex-col items-center mr-6">
                                        {/* Square dot */}
                                        <div className="w-2 h-2 bg-gray-800 relative z-10 border-none"></div>
                                        {/* Connecting line */}
                                        {index < experiences.length - 1 && (
                                            <div className="w-0.5 bg-gray-800 h-20 mt-1"></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        {(exp.startDate || exp.endDate) && (
                                            <div className="font-medium text-gray-600 uppercase mb-1" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                                                {exp.startDate && exp.startDate}
                                                {(exp.startDate || exp.endDate) && " – "}
                                                {exp.endDate && exp.endDate}
                                            </div>
                                        )}

                                        {exp.jobTitle && (
                                            <h4 className="font-medium text-gray-800 mb-2" style={{ fontSize: '14px' }}>
                                                {exp.jobTitle}{exp.company && ` at ${exp.company}`}
                                            </h4>
                                        )}

                                        {exp.description && (
                                            <div className="text-gray-600 leading-relaxed" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                {exp.description
                                                    .split("\n")
                                                    .map((line, index) => (
                                                        <div
                                                            key={index}
                                                            className="mb-1"
                                                        >
                                                            {line
                                                                .trim()
                                                                .startsWith(
                                                                    "•"
                                                                ) ||
                                                            line
                                                                .trim()
                                                                .startsWith(
                                                                    "-"
                                                                ) ? (
                                                                <div className="flex items-start pl-3 relative">
                                                                    <div className="absolute w-1 h-1 bg-gray-600 rounded-full" style={{ left: '0', top: '0.5em' }}></div>
                                                                    <span>
                                                                        {line.replace(
                                                                            /^[•-]\s*/,
                                                                            ""
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ) : line.trim() ? (
                                                                <div>
                                                                    {line}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {certifications && certifications.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '15px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '2px solid #374151' }}>
                            Certifications
                        </h3>
                        <ul className="space-y-2">
                            {certifications.map((cert) => (
                                <li
                                    key={cert.id}
                                    className="text-gray-600 flex items-start pl-3 relative" style={{ fontSize: '13px' }}
                                >
                                    <div className="absolute w-1 h-1 bg-gray-600 rounded-full" style={{ left: '0', top: '0.5em' }}></div>
                                    <span>{cert.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Awards/Key Achievements */}
                {awards && awards.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '15px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '2px solid #374151' }}>
                            Achievements
                        </h3>
                        <ul className="space-y-2">
                            {awards.map((award) => (
                                <li
                                    key={award.id}
                                    className="text-gray-600 flex items-start pl-3 relative" style={{ fontSize: '13px' }}
                                >
                                    <div className="absolute w-1 h-1 bg-gray-600 rounded-full" style={{ left: '0', top: '0.5em' }}></div>
                                    <span>{award.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/5 bg-white p-8">
                {/* Contact Info */}
                {(contact.phone ||
                    contact.email ||
                    hasLocationInfo ||
                    (websites && websites.length > 0)) && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <div className="space-y-3 text-gray-600" style={{ fontSize: '12px', fontWeight: '300', lineHeight: '1.3' }}>
                            {contact.phone && (
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-3.5 h-3.5">
                                        <PhoneIcon />
                                    </span>
                                    <span>{contact.phone}</span>
                                </div>
                            )}

                            {contact.email && (
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-3.5 h-3.5">
                                        <MailIcon />
                                    </span>
                                    <span>{contact.email}</span>
                                </div>
                            )}

                            {hasLocationInfo && (
                                <div className="flex items-start gap-2">
                                    <span className="flex items-center justify-center w-3.5 h-3.5 mt-0.5">
                                        <MapPinIcon />
                                    </span>
                                    <span>
                                        {[
                                            contact.address,
                                            contact.city,
                                            contact.country,
                                            contact.postCode,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </span>
                                </div>
                            )}

                            {websites && websites.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <span className="flex items-center justify-center w-3.5 h-3.5 mt-0.5">
                                        <GlobeIcon />
                                    </span>
                                    <div className="flex flex-col space-y-1">
                                        {websites.map((site) => (
                                            <a
                                                key={site.id}
                                                href={site.url}
                                                className="text-gray-700 hover:text-gray-900"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {site.url}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Education - Remove timeline, keep bullets */}
                {education && education.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb' }}>
                            Education
                        </h3>
                        <div className="space-y-4">
                            {education.map((edu, index) => (
                                <div
                                    key={edu.id}
                                    className="relative flex items-start pl-3"
                                >
                                    {/* Bullet point */}
                                    <div 
                                        className="absolute bg-gray-600 rounded-full"
                                        style={{
                                            width: '4px',
                                            height: '4px',
                                            left: '0',
                                            top: '0.5em'
                                        }}
                                    />

                                    {/* Content */}
                                    <div className="flex-1">
                                        {(edu.startDate || edu.endDate) && (
                                            <div className="font-medium text-gray-600 uppercase mb-1" style={{ fontSize: '11px' }}>
                                                {edu.startDate && edu.startDate}
                                                {(edu.startDate || edu.endDate) && " – "}
                                                {edu.endDate && edu.endDate}
                                            </div>
                                        )}
                                        {edu.school && (
                                            <div className="text-gray-600 uppercase tracking-wide mb-1" style={{ fontSize: '12px', fontWeight: '300', letterSpacing: '.04em' }}>
                                                {edu.school}
                                            </div>
                                        )}
                                        {edu.degree && (
                                            <h4 className="font-medium text-gray-800 mb-1" style={{ fontSize: '13px', lineHeight: '1.3' }}>
                                                {edu.degree}
                                            </h4>
                                        )}

                                        {edu.description && (
                                            <div className="text-gray-600 leading-relaxed" style={{ fontSize: '12px', fontWeight: '400', lineHeight: '1.35' }}>
                                                {edu.description
                                                    .split("\n")
                                                    .map((line, index) => (
                                                        <div
                                                            key={index}
                                                            className="mb-1"
                                                        >
                                                            {line
                                                                .trim()
                                                                .startsWith(
                                                                    "•"
                                                                ) ||
                                                            line
                                                                .trim()
                                                                .startsWith(
                                                                    "-"
                                                                ) ? (
                                                                <div className="flex items-start pl-3 relative">
                                                                    <div className="absolute w-1 h-1 bg-gray-600 rounded-full" style={{ left: '0', top: '0.5em' }}></div>
                                                                    <span>
                                                                        {line.replace(
                                                                            /^[•-]\s*/,
                                                                            ""
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ) : line.trim() ? (
                                                                <div style={{ marginBottom: '3px' }}>
                                                                    {line}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb' }}>
                            Skills
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            {skills.map((skill, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-800" style={{ fontSize: '13px', fontWeight: '500' }}>
                                            {skill.name}
                                        </span>
                                    </div>
                                    {skill.level && showExperienceLevel && (
                                        <div className="flex items-center gap-0.5">
                                            {Array.from(
                                                { length: 5 },
                                                (_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full border border-gray-800 ${
                                                            i <
                                                            getSkillLevelBullets(
                                                                skill.level ||
                                                                    "Novice"
                                                            )
                                                                ? "bg-gray-800"
                                                                : "bg-transparent"
                                                        }`}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {languages && languages.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb' }}>
                            Languages
                        </h3>
                        <div className="space-y-2">
                            {languages.map((lang, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-gray-800" style={{ fontSize: '13px', fontWeight: '500' }}>
                                        {lang.name}
                                    </span>
                                    {lang.proficiency && (
                                        <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: '300' }}>
                                            ({lang.proficiency})
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* References */}
{references && references.length > 0 && (
  <div className="mb-8 pb-8 border-b border-gray-300">
    <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb' }}>
      References
    </h3>
    <div className="space-y-4">
      {references.map((ref) => (
        <div key={ref.id} className="mb-3">
          {ref.name && (
            <div className="text-gray-800 font-medium" style={{ fontSize: '13px' }}>
              {ref.name}
            </div>
          )}
          {ref.relationship && (
            <div className="text-gray-600" style={{ fontSize: '12px', fontWeight: '300' }}>
              {ref.relationship}
            </div>
          )}
          {ref.contactInfo && (
            <div className="text-gray-600" style={{ fontSize: '12px', fontWeight: '300' }}>
              {ref.contactInfo}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}


                {/* Hobbies/Activities */}
                {hobbies && hobbies.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb' }}>
                            Hobbies
                        </h3>
                        <div className="space-y-1">
                            {hobbies.map((hobby, index) => (
                                <div
                                    key={index}
                                    className="flex items-center text-gray-600 pl-3 relative" style={{ fontSize: '13px', fontWeight: '400' }}
                                >
                                    <div className="absolute w-1 h-1 bg-gray-600 rounded-full" style={{ left: '0', top: '0.5em' }}></div>
                                    {hobby.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Sections */}
                {customSections && customSections.length > 0 && (
                    <div>
                        {customSections.map((custom, index) => (
                            <div
                                key={custom.id}
                                className={`mb-8 ${
                                    index < customSections.length - 1
                                        ? "pb-8 border-b border-gray-300"
                                        : ""
                                }`}
                            >
                                <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '13px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: index < customSections.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                    {custom.title}
                                </h3>
                                <div className="text-gray-600 whitespace-pre-line" style={{ fontSize: '11px' }}>
                                    {custom.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modern;