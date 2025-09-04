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
        showExperienceLevel,
    } = resumeData;

    const getSkillLevelBullets = (level: string): number => {
        const levelLower = level.toLowerCase().trim();
        if (levelLower.includes("expert")) return 5;
        if (levelLower.includes("experienced")) return 4;
        if (levelLower.includes("skillful")) return 3;
        if (levelLower.includes("beginner")) return 2;
        if (levelLower.includes("novice")) return 1;
        return 1;
    };

    const getProficiencyLevel = (proficiency: string): number => {
        if (!proficiency) return 3;
        const level = proficiency.toLowerCase();
        if (level.includes("beginner") || level.includes("basic")) return 1;
        if (level.includes("intermediate")) return 2;
        if (level.includes("advanced")) return 3;
        if (level.includes("fluent")) return 4;
        if (level.includes("native") || level.includes("expert")) return 5;
        return 3;
    };

    return (
        <div className="max-w-[210mm] mx-auto bg-white font-sans text-sm text-gray-800 p-8">
            {/* Header Section - Single Row Layout */}
            <div className="bg-black text-white px-8 py-8 mb-6 flex justify-between items-center gap-10">
                {/* Left - Name and Title */}
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-[2px] mb-2">
                        <Placeholder
                            value={`${contact.firstName} ${contact.lastName}`.trim()}
                            placeholder="DAPHNE LAUREN PINEDA"
                        />
                    </h1>
                    <p className="text-base uppercase tracking-[1.5px] text-gray-300">
                        <Placeholder
                            value={contact.desiredJobTitle}
                            placeholder="COMPUTER ENGINEER"
                        />
                    </p>
                </div>

                {/* Right - Contact Info */}
                <div className="flex flex-col space-y-2">
                    {/* Phone */}
                    <div className="flex items-center">
                        <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-white text-xs leading-none">
                                ☎
                            </span>
                        </div>
                        <span className="text-sm text-white">
                            <Placeholder
                                value={contact.phone}
                                placeholder="+968 541 9533"
                            />
                        </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center">
                        <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-white text-xs leading-none">
                                ✉
                            </span>
                        </div>
                        <span className="text-sm text-white">
                            <Placeholder
                                value={contact.email}
                                placeholder="daphnepineda18@gmail.com"
                            />
                        </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center">
                        <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-white text-xs leading-none">
                                ⚲
                            </span>
                        </div>
                        <span className="text-sm text-white">
                            <Placeholder
                                value={[
                                    contact.address,
                                    contact.city,
                                    contact.country,
                                    contact.postCode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                                placeholder="142 Sinagtala St., Brgy. Batasan Hills, Quezon City, Philippines. 1234"
                            />
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-0">
                {/* About Me / Summary */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
                        ABOUT ME
                    </h2>
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                        <Placeholder
                            value={summary}
                            placeholder="Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills."
                        />
                    </p>
                </div>

                {/* Experience */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        EXPERIENCE
                    </h2>
                    <div className="space-y-3">
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
                              ]
                        ).map((exp: any, index: number) => (
                            <div
                                key={exp.id}
                                className={
                                    index > 0
                                        ? "border-t border-gray-300 pt-3"
                                        : ""
                                }
                            >
                                <div className="mb-1">
                                    <h3 className="font-bold text-sm text-black">
                                        <Placeholder
                                            value={`${exp.company} ${exp.startDate} - ${exp.endDate}`}
                                            placeholder="Company Name Sep 2017 - May 2020"
                                        />
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <Placeholder
                                            value={exp.jobTitle}
                                            placeholder="Job Title"
                                        />
                                    </p>
                                    {exp.location && (
                                        <p className="text-gray-600 text-sm italic -mt-1 mb-2">
                                            {exp.location}
                                        </p>
                                    )}
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                                    {exp.description ||
                                        "• Responsibilities\n• Responsibilities"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education - Now matching Experience format */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        EDUCATION
                    </h2>
                    <div className="space-y-3">
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
                              ]
                        ).map((edu: any, index: number) => (
                            <div
                                key={edu.id}
                                className={
                                    index > 0
                                        ? "border-t border-gray-300 pt-3"
                                        : ""
                                }
                            >
                                <div className="mb-1">
                                    <h3 className="font-bold text-sm text-black">
                                        <Placeholder
                                            value={`${edu.school} ${edu.startDate} - ${edu.endDate}`}
                                            placeholder="School Name 2017 - 2020"
                                        />
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <Placeholder
                                            value={edu.degree}
                                            placeholder="Degree in Field of study"
                                        />
                                    </p>
                                    {edu.location && (
                                        <p className="text-gray-600 text-sm italic -mt-1 mb-2">
                                            {edu.location}
                                        </p>
                                    )}
                                </div>
                                {edu.description && (
                                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        SKILLS
                    </h2>
                    {showExperienceLevel ? (
                        /* Grid layout with skill level bullets - Matching Blade's table structure */
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {(skills.length > 0
                                ? skills
                                : [
                                      {
                                          id: -1,
                                          name: "Skill 1",
                                          level: "Experienced",
                                      },
                                      {
                                          id: -2,
                                          name: "Skill 2",
                                          level: "Experienced",
                                      },
                                      {
                                          id: -3,
                                          name: "Skill 3",
                                          level: "Experienced",
                                      },
                                      {
                                          id: -4,
                                          name: "Skill 4",
                                          level: "Experienced",
                                      },
                                  ]
                            ).map((skill: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-sm text-gray-800 font-normal pr-2">
                                        <Placeholder
                                            value={skill.name}
                                            placeholder={`Skill ${index + 1}`}
                                        />
                                    </span>
                                    <div className="flex items-center gap-0.5 ml-2">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    i <
                                                    getSkillLevelBullets(
                                                        skill.level ||
                                                            "Experienced"
                                                    )
                                                        ? "bg-black"
                                                        : "bg-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Simple grid layout without level indicators - Matching Blade's table structure */
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            {(skills.length > 0
                                ? skills
                                : [
                                      { id: -1, name: "Skill 1" },
                                      { id: -2, name: "Skill 2" },
                                      { id: -3, name: "Skill 3" },
                                      { id: -4, name: "Skill 4" },
                                  ]
                            ).map((skill: any, index: number) => (
                                <div
                                    key={index}
                                    className="text-sm text-gray-800"
                                >
                                    <Placeholder
                                        value={skill.name}
                                        placeholder={`Skill ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Languages Section */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        LANGUAGES
                    </h2>
                    <div className="space-y-2">
                        {(languages && languages.length > 0
                            ? languages
                            : [
                                  {
                                      id: -1,
                                      name: "English",
                                      proficiency: "Fluent",
                                  },
                                  {
                                      id: -2,
                                      name: "Spanish",
                                      proficiency: "Basic",
                                  },
                              ]
                        ).map((lang: any) => (
                            <div key={lang.id} className="flex items-start">
                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                <span className="text-sm font-normal">
                                    {lang.name}{" "}
                                    <span className="text-gray-600">
                                        ({lang.proficiency || "Intermediate"})
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certifications Section */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        CERTIFICATIONS
                    </h2>
                    <ul className="space-y-1">
                        {(certifications && certifications.length > 0
                            ? certifications
                            : [
                                  {
                                      id: -1,
                                      title: "Certification Title",
                                  },
                              ]
                        ).map((cert: any) => (
                            <li
                                key={cert.id}
                                className="flex items-start text-sm"
                            >
                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {cert.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Awards Section */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        AWARDS
                    </h2>
                    <ul className="space-y-1">
                        {(awards && awards.length > 0
                            ? awards
                            : [{ id: -1, title: "Award Title" }]
                        ).map((award: any) => (
                            <li
                                key={award.id}
                                className="flex items-start text-sm"
                            >
                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {award.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Websites Section */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        WEBSITES
                    </h2>
                    <div className="space-y-1.5">
                        {(websites && websites.length > 0
                            ? websites
                            : [
                                  {
                                      id: -1,
                                      label: "Portfolio",
                                      url: "https://portfolio.example.com",
                                  },
                              ]
                        ).map((site: any) => (
                            <div key={site.id} className="text-sm">
                                <div className="font-normal mb-0.5">
                                    {site.label}
                                </div>
                                <a
                                    href={site.url}
                                    className="text-blue-600 underline break-all text-xs leading-tight block"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {site.url}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interests Section */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        INTERESTS
                    </h2>
                    <ul className="space-y-1">
                        {(hobbies && hobbies.length > 0
                            ? hobbies
                            : [
                                  { id: -1, name: "Reading" },
                                  { id: -2, name: "Photography" },
                              ]
                        ).map((hobby: any) => (
                            <li
                                key={hobby.id}
                                className="flex items-start text-sm"
                            >
                                <span className="w-1 h-1 bg-black rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {hobby.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* References Section */}
                <div className="border-t border-black py-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        REFERENCES
                    </h2>
                    <div className="space-y-2.5">
                        {(references && references.length > 0
                            ? references
                            : [
                                  {
                                      id: -1,
                                      name: "Jane Doe",
                                      relationship: "Manager",
                                      contactInfo: "jane@example.com",
                                  },
                              ]
                        ).map((ref: any) => (
                            <div key={ref.id} className="text-sm">
                                <div className="font-bold text-gray-800">
                                    {ref.name}
                                </div>
                                {ref.relationship && (
                                    <div className="text-gray-600 text-sm uppercase tracking-wider mt-1">
                                        {ref.relationship}
                                    </div>
                                )}
                                {ref.contactInfo && (
                                    <div className="text-gray-600 mt-1">
                                        <div>{ref.contactInfo}</div>
                                    </div>
                                )}
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
                                className="border-t border-black py-3"
                            >
                                <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
                                    {custom.title}
                                </h2>
                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
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

export default Creative;
