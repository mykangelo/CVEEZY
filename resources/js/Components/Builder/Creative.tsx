import React from "react";
import { ResumeData } from "@/types/resume";
import { Mail } from "lucide-react";
import Placeholder from "./Placeholder";

type Props = {
    resumeData: ResumeData;
};

const Creative: React.FC<Props> = ({ resumeData }) => {
    const {
        contact,
        experiences,
        education,
        summary,
        skills,
        languages,
        certifications,
        awards,
        websites,
        references,
        hobbies,
        customSections,
    } = resumeData;

    const hasLocationInfo =
        contact.address || contact.city || contact.country || contact.postCode;

    const getSkillLevelBullets = (level: string | undefined): number => {
        if (!level) {
            return 3;
        }

        const normalizedLevel = level.toLowerCase().trim();

        if (normalizedLevel.includes("expert")) {
            return 5;
        } else if (
            normalizedLevel.includes("experienced") ||
            normalizedLevel.includes("advanced")
        ) {
            return 4;
        } else if (normalizedLevel.includes("intermediate")) {
            return 3;
        } else if (normalizedLevel.includes("beginner")) {
            return 2;
        } else if (normalizedLevel.includes("novice")) {
            return 1;
        } else {
            // Try exact matches as fallback
            switch (normalizedLevel) {
                case "expert":
                    return 5;
                case "experienced":
                case "advanced":
                    return 4;
                case "intermediate":
                    return 3;
                case "beginner":
                    return 2;
                case "novice":
                    return 1;
                default:
                    return 3;
            }
        }
    };

    const getProficiencyLevel = (proficiency: string): number => {
        if (!proficiency) return 3; // default
        const level = proficiency.toLowerCase();
        if (level.includes("beginner") || level.includes("basic")) return 2;
        if (level.includes("intermediate")) return 3;
        if (level.includes("advanced") || level.includes("fluent")) return 4;
        if (level.includes("native") || level.includes("expert")) return 5;
        return 3; // default
    };

    // Using explicit section construction later with fallbacks, so remove unused derived arrays

    const renderSectionContent = (section: any) => {
        switch (section.id) {
            case "languages":
                return (
                    <div className="space-y-3">
                        {section.content.map((lang: any) => (
                            <div
                                key={lang.id}
                                className="flex items-center gap-2"
                            >
                                <span className="text-xs font-medium">
                                    {lang.name}
                                </span>
                                <div className="flex space-x-0.5 flex-shrink-0">
                                    {[1, 2, 3, 4, 5].map((bar) => (
                                        <div
                                            key={bar}
                                            className={`w-2 h-0.5 ${
                                                getProficiencyLevel(
                                                    lang.proficiency || ""
                                                ) >= bar
                                                    ? "bg-black"
                                                    : "bg-gray-300"
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "certifications":
                return (
                    <ul className="space-y-1">
                        {section.content.map((cert: any) => (
                            <li
                                key={cert.id}
                                className="flex items-start text-xs"
                            >
                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {cert.title}
                            </li>
                        ))}
                    </ul>
                );

            case "awards":
                return (
                    <ul className="space-y-1">
                        {section.content.map((award: any) => (
                            <li
                                key={award.id}
                                className="flex items-start text-xs"
                            >
                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {award.title}
                            </li>
                        ))}
                    </ul>
                );

            case "hobbies":
                return (
                    <ul className="space-y-1">
                        {section.content.map((hobby: any) => (
                            <li
                                key={hobby.id}
                                className="flex items-start text-xs"
                            >
                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {hobby.name}
                            </li>
                        ))}
                    </ul>
                );

            case "websites":
                return (
                    <div className="space-y-1">
                        {section.content.map((site: any) => (
                            <div key={site.id} className="text-xs">
                                <div className="font-medium">{site.label}</div>
                                <a
                                    href={site.url}
                                    className="text-blue-600 underline break-all"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {site.url}
                                </a>
                            </div>
                        ))}
                    </div>
                );

            case "references":
                return (
                    <div className="space-y-3">
                        {section.content.map((ref: any) => (
                            <div key={ref.id} className="text-xs">
                                <div className="font-bold text-gray-800">
                                    {ref.name}
                                </div>
                                {ref.relationship && (
                                    <div className="text-gray-600 text-xs uppercase tracking-wide mb-1">
                                        {ref.relationship}
                                    </div>
                                )}
                                {ref.contactInfo && (
                                    <div className="text-gray-700">
                                        <div className="font-medium">Phone</div>
                                        <div>{ref.contactInfo}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
            {/* Header Section */}
            <div className="flex">
                {/* Left Column */}
                <div className="w-[60%] flex items-start">
                    <div className="bg-black text-white px-8 py-8">
                        <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
                            <Placeholder value={`${contact.firstName} ${contact.lastName}`.trim()} placeholder="YOUR NAME" />
                        </h1>
                        <p className="text-lg uppercase tracking-wider text-gray-300">
                            <Placeholder value={contact.desiredJobTitle} placeholder="JOB TITLE" />
                        </p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="bg-white px-8 pb-8 w-[40%] flex flex-col justify-center space-y-4 pt-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-black text-sm">☎</span>
                        </div>
                        <span className="text-sm text-black">
                            <Placeholder value={contact.phone} placeholder="(123) 456-7890" />
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-sm text-black">
                            <Placeholder value={contact.email} placeholder="email@example.com" />
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-black text-sm">⚲</span>
                        </div>
                        <span className="text-sm text-black">
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
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="px-8 pb-8">
                {/* About Me / Summary */}
                <div className="flex border-t border-black py-6">
                    <div className="w-1/4 pr-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            ABOUT ME
                        </h2>
                    </div>
                    <div className="w-3/4">
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                            <Placeholder
                                value={summary}
                                placeholder={
                                    "Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills."
                                }
                            />
                        </p>
                    </div>
                </div>

                {/* Experience */}
                <div className="flex border-t border-black py-6">
                    <div className="w-1/4 pr-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            EXPERIENCE
                        </h2>
                    </div>
                    <div className="w-3/4 space-y-6">
                        {(experiences.length > 0
                            ? experiences
                            : [
                                  {
                                      id: -1,
                                      company: "Company Name",
                                      jobTitle: "Job Title",
                                      startDate: "Sep 2017",
                                      endDate: "May 2020",
                                      description:
                                          "• Responsibilities\n• Responsibilities",
                                  },
                                  {
                                      id: -2,
                                      company: "Company Name",
                                      jobTitle: "Job Title",
                                      startDate: "Jun 2015",
                                      endDate: "Aug 2017",
                                      description:
                                          "• Responsibilities\n• Responsibilities",
                                  },
                              ]).map((exp: any) => (
                            <div key={exp.id}>
                                <div className="mb-1">
                                    <h3 className="font-bold text-sm">
                                        <Placeholder
                                            value={`${exp.company} ${exp.startDate} - ${exp.endDate}`}
                                            placeholder="Company Name Sep 2017 - May 2020"
                                        />
                                    </h3>
                                    <p className="text-gray-700 text-sm">
                                        <Placeholder
                                            value={exp.jobTitle}
                                            placeholder="Job Title"
                                        />
                                    </p>
                                    {exp.location && (
                                      <p className="text-gray-600 text-xs italic">
                                        {exp.location}
                                      </p>
                                    )}
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                                    {(exp.description ||
                                        "• Responsibilities\n• Responsibilities")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                <div className="flex border-t border-black py-6">
                    <div className="w-1/4 pr-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            EDUCATION
                        </h2>
                    </div>
                    <div className="w-3/4 space-y-4">
                        {(education.length > 0
                            ? education
                            : [
                                  {
                                      id: -1,
                                      degree: "Degree in Field of study",
                                      school: "School Name",
                                      location: "Location",
                                      startDate: "2017",
                                      endDate: "2020",
                                      description: "",
                                  },
                              ]).map((edu: any) => (
                            <div key={edu.id} className="flex gap-2">
                                {/* Date and School Info Column */}
                                <div className="w-1/2">
                                    <p className="text-xs font-bold mb-1">
                                        <Placeholder
                                            value={`${edu.startDate} - ${edu.endDate}`}
                                            placeholder="2017 - 2020"
                                        />
                                    </p>
                                    <p className="text-xs text-gray-700 mb-1">
                                        <Placeholder
                                            value={`${edu.school}${edu.location ? ` — ${edu.location}` : ""}`}
                                            placeholder="School Name — Location"
                                        />
                                    </p>
                                    <h4 className="font-bold text-xs">
                                        <Placeholder
                                            value={edu.degree}
                                            placeholder="Degree in Field of study"
                                        />
                                    </h4>
                                </div>

                                {/* Description Column */}
                                <div className="w-1/2 -ml-3">
                                    {edu.description && (
                                        <p className="text-xs text-gray-800 leading-relaxed">
                                            {edu.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="flex border-t border-black py-6">
                    <div className="w-1/4 pr-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            SKILLS
                        </h2>
                    </div>
                    <div className="w-3/4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {(skills.length > 0
                                ? skills
                                : [
                                      { id: -1, name: "Skill 1", level: "Experienced" },
                                      { id: -2, name: "Skill 2", level: "Experienced" },
                                      { id: -3, name: "Skill 3", level: "Experienced" },
                                      { id: -4, name: "Skill 4", level: "Experienced" },
                                  ]).map((skill: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-sm text-gray-800 font-medium">
                                        <Placeholder value={skill.name} placeholder={`Skill ${index + 1}`} />
                                    </span>
                                    {(
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                                        i < getSkillLevelBullets(skill.level || "Experienced")
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
                    </div>
                </div>

                {/* Additional Sections - 3 Column Grid Layout with samples */}
                <div className="border-t border-black py-6">
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            {
                                id: "languages",
                                title: "Languages",
                                content:
                                    (languages && languages.length > 0)
                                        ? languages
                                        : [
                                              { id: -1, name: "English", proficiency: "Fluent" },
                                              { id: -2, name: "Spanish", proficiency: "Basic" },
                                          ],
                            },
                            {
                                id: "certifications",
                                title: "Certifications",
                                content:
                                    (certifications && certifications.length > 0)
                                        ? certifications
                                        : [
                                              { id: -1, title: "Certification Title" },
                                          ],
                            },
                            {
                                id: "awards",
                                title: "Awards",
                                content:
                                    (awards && awards.length > 0)
                                        ? awards
                                        : [
                                              { id: -1, title: "Award Title" },
                                          ],
                            },
                            {
                                id: "websites",
                                title: "Websites",
                                content:
                                    (websites && websites.length > 0)
                                        ? websites
                                        : [
                                              { id: -1, label: "Portfolio", url: "https://portfolio.example.com" },
                                          ],
                            },
                            {
                                id: "hobbies",
                                title: "Interests",
                                content:
                                    (hobbies && hobbies.length > 0)
                                        ? hobbies
                                        : [
                                              { id: -1, name: "Reading" },
                                              { id: -2, name: "Photography" },
                                          ],
                            },
                            {
                                id: "references",
                                title: "References",
                                content:
                                    (references && references.length > 0)
                                        ? references
                                        : [
                                              { id: -1, name: "Jane Doe", relationship: "Manager", contactInfo: "jane@example.com" },
                                          ],
                            },
                        ].map((section) => (
                            <div key={section.id as string} className="w-full">
                                <h3 className="text-xs font-bold mb-3 text-gray-800 uppercase tracking-wide">
                                    {section.title as string}
                                </h3>
                                {renderSectionContent(section)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Custom Sections */}
                {customSections && customSections.length > 0 && (
                    <>
                        {customSections.map((custom) => (
                            <div
                                key={custom.id}
                                className="flex border-t border-black py-6"
                            >
                                <div className="w-1/4 pr-8">
                                    <h2 className="text-sm font-bold uppercase tracking-wider">
                                        {custom.title}
                                    </h2>
                                </div>
                                <div className="w-3/4">
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                                        {custom.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Creative;
