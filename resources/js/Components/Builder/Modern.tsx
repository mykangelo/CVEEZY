import React from "react";
import { ResumeData } from "@/types/resume";
import Placeholder from "./Placeholder";
import { processBulletedDescription, getBulletTexts } from "@/utils/bulletProcessor";

// Add DejaVu Sans font (using system fallback)
// DejaVu Sans is available as a system font on most systems

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

    // Normalize URLs for display/click (prepend https:// if missing)
    const normalizeUrl = (u?: string) => {
        if (!u) return '';
        return /^https?:\/\//i.test(u) ? u : `https://${u}`;
    };

    return (
        <div className="w-full text-gray-800 font-sans flex min-h-screen" style={{ fontFamily: 'DejaVu Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Arial Unicode MS", "Noto Sans", sans-serif', color: '#374151', fontSize: '15px', lineHeight: '1.4' }}>
            {/* Left Column */}
            <div className="w-3/5 p-8" style={{ padding: '25px 30px 25px 30px', width: '60%', borderRight: '1px solid #e5e7eb' }}>
                {/* Header */}
                <div className="mb-8" style={{ marginBottom: '2px', paddingBottom: '2px' }}>
                    <h1 className="font-semibold text-gray-800 mb-2 tracking-wider break-words" style={{ fontSize: '42px', lineHeight: '0.9', letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                        <Placeholder value={`${contact.firstName || ''}`.toUpperCase()} placeholder="YOUR" />
                    </h1>
                    <h1 className="font-semibold text-gray-800 mb-4 tracking-wider break-words" style={{ fontSize: '42px', lineHeight: '0.9', letterSpacing: '.2em', textTransform: 'uppercase', display: 'block', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                        <Placeholder value={`${contact.lastName || ''}`.toUpperCase()} placeholder="NAME" />
                    </h1>
                    <h2 className="font-normal text-gray-500 tracking-widest uppercase mb-8 break-words" style={{ fontSize: '24px', letterSpacing: '0.1em', marginTop: '8px', fontWeight: '400', color: '#6b7280', textTransform: 'uppercase' }}>
                        <Placeholder value={contact.desiredJobTitle} placeholder="Job Title" />
                    </h2>
                </div>

                {/* Profile/Summary */}
                <div className="mb-8" style={{ marginBottom: '20px' }}>
                    <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '16px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                        Profile
                    </h3>
                    <p className="text-gray-500 leading-relaxed break-words" style={{ fontSize: '15px', lineHeight: '1.5', textAlign: 'justify', color: '#1f2937', fontWeight: '400', margin: '0' }}>
                        <Placeholder
                            value={summary}
                            placeholder={"Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills."}
                            as="span"
                        />
                    </p>
                </div>

                {/*Work Experience -Timeline */}
                <div className="mb-8" style={{ marginBottom: '20px' }}>
                    <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase break-words" style={{ fontSize: '16px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                        Work Experience
                    </h3>
                    <div className="relative" style={{ marginLeft: '0', borderLeft: '2px solid #2f3846ff', paddingLeft: '20px' }}>
                        {(experiences && experiences.length > 0 ? experiences : [
                            { id: -1, jobTitle: 'Job Title 1', company: 'Company Name', location: 'Location', startDate: 'Sep 2017', endDate: 'May 2020', description: '• Responsibilities\n• Responsibilities' },
                            { id: -2, jobTitle: 'Job Title 2', company: 'Company Name', location: 'Location', startDate: 'Sep 2017', endDate: 'May 2020', description: '• Responsibilities\n• Responsibilities' }
                        ] as any[]).map((exp, index) => (
                            <div
                                key={exp.id}
                                className="relative mb-8 last:mb-0"
                                style={{ 
                                    position: 'relative',
                                    marginBottom: index < experiences.length - 1 ? '32px' : '0',
                                    paddingLeft: '0'
                                }}
                            >
                                {/* Timeline dot */}
                                <div 
                                    className="absolute bg-gray-800"
                                    style={{
                                        position: 'absolute',
                                        left: '-24px',
                                        top: '5px',
                                        width: '7px',
                                        height: '7px',
                                        background: '#374151',
                                        border: '1px solid #fff',
                                      
                                    }}
                                />

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="font-medium text-gray-600 uppercase mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '500', color: '#6b7280', marginBottom: '3px' }}>
                                        <Placeholder value={`${exp.startDate || ''}${(exp.startDate || exp.endDate) ? ' – ' : ''}${exp.endDate || ''}`} placeholder="Sep 2017 — May 2020" />
                                    </div>

                                    <h4 className="font-medium text-gray-800" style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', margin: '0 0 4px' }}>
                                        <Placeholder value={`${exp.jobTitle || ''}${exp.company ? ` at ${exp.company}` : ''}`} placeholder="Job Title 1" />
                                    </h4>
                                    {exp.location && (
                                      <div className="text-xs text-gray-600 italic mb-2" style={{ fontSize: '13px', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '.04em', color: '#6b7280', marginBottom: '2px' }}>{exp.location}</div>
                                    )}

                                    <div className="text-gray-500 leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.4', fontWeight: '500', color: '#1f2937' }}>
                                        {(() => {
                                            const isPlaceholder = !(exp.description && String(exp.description).trim().length > 0);
                                            
                                            if (isPlaceholder) {
                                                return (
                                                    <div className="mb-1" style={{ marginBottom: '4px' }}>
                                                        <div className="flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', color: '#1f2937' }}>
                                                            <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
                                                            <span className="text-gray-400 italic">Responsibilities</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const processedBullets = processBulletedDescription(exp.description || '');
                                            
                                            if (processedBullets.length === 0) {
                                                return (
                                                    <div className="mb-1" style={{ marginBottom: '4px' }}>
                                                        <div className="flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', color: '#1f2937' }}>
                                                            <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
                                                            <span>Responsibilities</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Check if we have bullets or just regular text
                                            const hasBullets = processedBullets.some(bullet => bullet.isBullet);
                                            
                                            if (hasBullets) {
                                                return getBulletTexts(processedBullets).map((text, index) => (
                                                    <div key={index} className="mb-1" style={{ marginBottom: '4px' }}>
                                                        <div className="flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', color: '#1f2937' }}>
                                                            <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
                                                            <span>{text}</span>
                                                        </div>
                                                    </div>
                                                ));
                                            } else {
                                                // Single paragraph or non-bulleted content
                                                return (
                                                    <div style={{ marginBottom: '3px' }}>
                                                        {processedBullets[0]?.text || 'Responsibilities'}
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certifications */}
                {certifications && certifications.length > 0 && (
                    <div className="mb-8" style={{ marginBottom: '20px' }}>
                        <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '16px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                            Certifications
                        </h3>
                        <div className="space-y-2">
                            {certifications.map((cert) => {
                                const processedBullets = processBulletedDescription(cert.title || '');
                                const hasBullets = processedBullets.some(bullet => bullet.isBullet);
                                
                                if (hasBullets) {
                                    return getBulletTexts(processedBullets).map((text, index) => (
                                        <div
                                            key={`${cert.id}-${index}`}
                                            className="text-gray-500 flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', margin: '0 0 4px', color: '#1f2937', fontSize: '14px' }}
                                        >
                                            <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
                                            <span>{text}</span>
                                        </div>
                                    ));
                                } else {
                                    // If no bullets detected, try to split long certification strings by commas
                                    const certTitle = cert.title || '';
                                    if (certTitle.length > 100 && certTitle.includes(',')) {
                                        // Split by commas and treat each as a bullet
                                        const certItems = certTitle.split(',').map(item => item.trim()).filter(item => item.length > 0);
                                        return certItems.map((item, index) => (
                                            <div
                                                key={`${cert.id}-${index}`}
                                                className="text-gray-500 flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', margin: '0 0 4px', color: '#1f2937', fontSize: '14px' }}
                                            >
                                                <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
                                                <span>{item}</span>
                                            </div>
                                        ));
                                    } else {
                                        return (
                                            <div
                                                key={cert.id}
                                                className="text-gray-500 flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', margin: '0 0 4px', color: '#1f2937', fontSize: '14px' }}
                                            >
                                                <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
                                                <span>{cert.title}</span>
                                            </div>
                                        );
                                    }
                                }
                            })}
                        </div>
                    </div>
                )}

                {/* Awards/Key Achievements */}
                {awards && awards.length > 0 && (
                    <div className="mb-8" style={{ marginBottom: '20px' }}>
                        <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '16px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                            Achievements
                        </h3>
                        <div className="space-y-2">
                            {awards.map((award) => (
                                <div
                                    key={award.id}
                                    className="text-gray-400 flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', margin: '0 0 4px', color: '#1f2937', fontSize: '14px' }}
                                >
                                    <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
                                    <span>{award.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="w-2/5 bg-white p-8" style={{ width: '40%', padding: '25px 20px 25px 20px' }}>
                {/* Contact Info */}
                <div className="mb-8" style={{ marginBottom: '18px' }}>
                    <div className="space-y-3 text-gray-400" style={{ fontSize: '13px', fontWeight: '300', lineHeight: '1.3', color: '#1f2937' }}>
                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span className="flex items-center justify-center w-3.5 h-3.5" style={{ flex: '0 0 auto', width: '16px', height: '16px' }}>
                                <PhoneIcon />
                            </span>
                            <span style={{ flex: '1', wordBreak: 'break-word' }}><Placeholder value={contact.phone} placeholder="(123) 456-7890" /></span>
                        </div>

                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span className="flex items-center justify-center w-3.5 h-3.5" style={{ flex: '0 0 auto', width: '16px', height: '16px' }}>
                                <MailIcon />
                            </span>
                            <span style={{ flex: '1', wordBreak: 'break-word' }}><Placeholder value={contact.email} placeholder="email@example.com" /></span>
                        </div>

                        <div className="flex items-start gap-2" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span className="flex items-center justify-center w-3.5 h-3.5 mt-0.5" style={{ flex: '0 0 auto', width: '16px', height: '16px' }}>
                                <MapPinIcon />
                            </span>
                            <span style={{ flex: '1', wordBreak: 'break-word' }}>
                                <Placeholder
                                    value={[
                                        contact.address,
                                        contact.city,
                                        contact.country,
                                        contact.postCode,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                    placeholder="123 Anywhere St, Any City, Country 12345"
                                />
                            </span>
                        </div>

                        <div className="flex items-start gap-2" style={{ display: 'flex', alignItems: 'start', gap: '10px', marginBottom: '8px' }}>
                            <span className="flex items-center justify-center w-3.5 h-3.5 mt-0.5" style={{ flex: '0 0 auto', width: '16px', height: '16px' }}>
                                <GlobeIcon />
                            </span>
                            <div className="flex flex-col space-y-1" style={{ flex: '1' }}>
                                {(websites && websites.length > 0 ? websites : [{ id: -1, label: '', url: '' }] as any[]).map((site: any) => (
                                    <div key={site.id} className="text-gray-700">
                                        <span className="font-medium mr-1" style={{ fontWeight: '500' }}>
                                            <Placeholder value={site.label} placeholder="Portfolio" />:
                                        </span>
                                        <Placeholder 
                                            value={site.url} 
                                            placeholder="https://portfolio.example.com"
                                            as="span"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education */}
                <div className="mb-8" style={{ marginBottom: '20px' }}>
                    <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase break-words" style={{ fontSize: '14px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                        Education
                    </h3>
                    <div className="space-y-4">
                        {(education && education.length > 0 ? education : [
                            { id: -1, degree: 'Degree in Field of study', school: 'School Name, Location', startDate: '2017', endDate: '2020', description: '' },
                            { id: -2, degree: 'Degree in Field of study', school: 'School Name, Location', startDate: '2017', endDate: '2020', description: '' }
                        ] as any[]).map((edu, index) => (
                            <div
                                key={edu.id}
                                className="relative flex items-start pl-3"
                                style={{ position: 'relative', paddingLeft: '12px', marginBottom: '15px' }}
                            >
                                {/* Bullet point */}
                                <div 
                                    className="absolute bg-gray-700 rounded-full"
                                    style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '5px',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: '#6b7280'
                                    }}
                                />

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="font-medium text-gray-700 uppercase mb-1" style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '3px' }}>
                                        <Placeholder value={`${edu.startDate || ''}${(edu.startDate || edu.endDate) ? ' – ' : ''}${edu.endDate || ''}`} placeholder="2017 — 2020" />
                                    </div>
                                    <div className="text-gray-700 uppercase tracking-wide mb-1" style={{ fontSize: '13px', fontWeight: '300', letterSpacing: '.04em', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase' }}>
                                        <Placeholder value={`${edu.school || ''}${(edu as any).location ? ` — ${(edu as any).location}` : ''}`} placeholder="School Name — Location" />
                                    </div>
                                    <h4 className="font-medium text-gray-500 mb-1" style={{ fontSize: '14px', lineHeight: '1.3', fontWeight: '500', color: '#1f2937', margin: '0 0 4px' }}>
                                        <Placeholder value={edu.degree} placeholder="Degree in Field of study" />
                                    </h4>

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
                                        
                                        return (
                                            <div className="text-gray-500 leading-relaxed" style={{ fontSize: '13px', fontWeight: '400', lineHeight: '1.35', color: '#4b5563' }}>
                                                {hasBullets ? (
                                                    getBulletTexts(processedBullets).map((text, index) => (
                                                        <div key={index} className="mb-1">
                                                            <div className="flex items-start pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', color: '#4b5563' }}>
                                                                <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '3px', height: '3px', borderRadius: '50%', background: '#6b7280' }}></div>
                                                                <span>{text}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ marginBottom: '3px' }}>
                                                        {processedBullets[0]?.text}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-8" style={{ marginBottom: '20px' }}>
                    <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase break-words" style={{ fontSize: '14px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                        Skills
                    </h3>
                    <div style={{ fontSize: '0' }}>
                        {(skills && skills.length > 0 ? skills : [{ id: -1, name: 'Skill 1' } as any, { id: -2, name: 'Skill 2' } as any, { id: -3, name: 'Skill 3' } as any, { id: -4, name: 'Skill 4' } as any]).map((skill: any, index: number) => (
                            <div key={index} style={{ display: 'inline-block', width: '48%', verticalAlign: 'top', marginBottom: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-500 break-words" style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 3px' }}>
                                        <Placeholder value={skill.name} placeholder={`Skill ${index + 1}`} />
                                    </span>
                                </div>
                                {skill.level && showExperienceLevel && (
                                    <div className="flex items-center gap-0.5" style={{ fontSize: '0', whiteSpace: 'nowrap' }}>
                                        {Array.from(
                                            { length: 5 },
                                            (_, i) => (
                                                <div
                                                    key={i}
                                                    className={`rounded-full border border-gray-800 ${
                                                        i <
                                                        getSkillLevelBullets(
                                                            skill.level ||
                                                                "Novice"
                                                        )
                                                            ? "bg-gray-800"
                                                            : "bg-transparent"
                                                    }`}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '5px',
                                                        height: '5px',
                                                        marginRight: '2px',
                                                        borderRadius: '50%',
                                                        border: '1px solid #374151',
                                                        background: i < getSkillLevelBullets(skill.level || "Novice") ? '#374151' : 'transparent'
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Languages */}
                {languages && languages.length > 0 && (
                    <div className="mb-8" style={{ marginBottom: '20px' }}>
                        <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '14px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                            Languages
                        </h3>
                        <div className="space-y-2">
                            {languages.map((lang, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                    style={{ marginBottom: '6px', fontSize: '14px', color: '#1f2937' }}
                                >
                                    <span className="text-gray-800" style={{ fontWeight: '500' }}>
                                        {lang.name}
                                    </span>
                                    {lang.proficiency && (
                                        <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: '300', color: '#1f2937' }}>
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
                    <div className="mb-8" style={{ marginBottom: '20px' }}>
                        <h3 className="font-semibold text-gray-800 mb-4 tracking-widest uppercase" style={{ fontSize: '14px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                            References
                        </h3>
                        <div className="space-y-4">
                            {references.map((ref) => (
                                <div key={ref.id} className="mb-3" style={{ marginBottom: '12px' }}>
                                    {ref.name && (
                                        <div className="text-gray-500 font-medium" style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                                            {ref.name}
                                        </div>
                                    )}
                                    {ref.relationship && (
                                        <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: '300', color: '#6b7280', margin: '1px 0' }}>
                                            {ref.relationship}
                                        </div>
                                    )}
                                    {ref.contactInfo && (
                                        <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: '300', color: '#6b7280', margin: '1px 0' }}>
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
                    <div className="mb-8" style={{ marginBottom: '20px' }}>
                        <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '14px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#1f2937', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                            Hobbies
                        </h3>
                        <div className="space-y-1">
                            {hobbies.map((hobby, index) => (
                                <div
                                    key={index}
                                    className="flex items-center text-gray-600 pl-3 relative" style={{ position: 'relative', paddingLeft: '12px', margin: '0 0 4px', color: '#4b5563', fontSize: '14px', fontWeight: '400' }}
                                >
                                    <div className="absolute rounded-full" style={{ position: 'absolute', left: '0', top: '.5em', width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280' }}></div>
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
                                style={{ marginBottom: '20px' }}
                            >
                                <h3 className="font-semibold text-gray-800 mb-6 tracking-widest uppercase" style={{ fontSize: '14px', letterSpacing: '0.05em', paddingBottom: '6px', borderBottom: index < customSections.length - 1 ? '1px solid #e5e7eb' : 'none', fontWeight: '600', color: '#1f2937', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                                    {custom.title}
                                </h3>
                                <div className="text-gray-600 whitespace-pre-line" style={{ fontSize: '12px', color: '#4b5563' }}>
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