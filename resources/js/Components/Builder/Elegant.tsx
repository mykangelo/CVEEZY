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
  } = resumeData;

  const hasLocationInfo =
    contact.address || contact.city || contact.country || contact.postCode;

  // ... rest of your component


    return (
        <div className="space-y-6 text-gray-800">
            <h1 className="text-3xl font-bold text-center text-black mb-6">
                This is the Elegant Template
            </h1>

            {/* Contact Info */}
            <div>
                <h2 className="text-2xl font-bold">
                    {contact.firstName} {contact.lastName}
                </h2>
                <p className="text-lg text-gray-600">
                    {contact.desiredJobTitle}
                </p>
                <div className="space-y-1 mt-2">
                    <p>
                        <strong>Phone:</strong> {contact.phone}
                    </p>
                    <p>
                        <strong>Email:</strong> {contact.email}
                    </p>
                    {hasLocationInfo && (
                        <p>
                            <strong>Location:</strong>{" "}
                            {[
                                contact.address,
                                contact.city,
                                contact.country,
                                contact.postCode,
                            ]
                                .filter(Boolean)
                                .join(", ")}
                        </p>
                    )}
                </div>
            </div>

            {/* Experience */}
            {experiences.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Experience
                    </h3>
                    <div className="space-y-4">
                        {experiences.map((exp) => (
                            <div key={exp.id} className="border-b pb-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold">
                                        {exp.jobTitle}
                                    </h4>
                                    <span className="text-sm text-gray-500">
                                        {exp.startDate} - {exp.endDate}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 italic">
                                    {exp.company} — {exp.location}
                                </p>
                                {exp.description && (
                                    <p className="text-sm mt-1">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Education
                    </h3>
                    <div className="space-y-4">
                        {education.map((edu) => (
                            <div key={edu.id} className="border-b pb-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold">{edu.degree}</h4>
                                    <span className="text-sm text-gray-500">
                                        {edu.startDate} - {edu.endDate}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 italic">
                                    {edu.school} — {edu.location}
                                </p>
                                {edu.description && (
                                    <p className="text-sm mt-1">
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Skills
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                        {skills.map((skill, index) => (
                            <li key={index} className="text-sm text-gray-800">
                                {skill.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Summary */}
            {summary && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Summary
                    </h3>
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                        {summary}
                    </p>
                </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Languages
                    </h3>
                    <ul className="list-disc list-inside text-sm">
                        {languages.map((lang) => (
                            <li key={lang.id}>
                                {lang.name}{" "}
                                {lang.proficiency && `– ${lang.proficiency}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Certifications
                    </h3>
                    <ul className="list-disc list-inside text-sm">
                        {certifications.map((cert) => (
                            <li key={cert.id}>{cert.title}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Awards */}
            {awards && awards.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Awards
                    </h3>
                    <ul className="list-disc list-inside text-sm">
                        {awards.map((award) => (
                            <li key={award.id}>{award.title}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Websites */}
            {websites && websites.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Websites
                    </h3>
                    <ul className="space-y-1 text-sm">
                        {websites.map((site) => (
                            <li key={site.id}>
                                <strong>{site.label}:</strong>{" "}
                                <a
                                    href={site.url}
                                    className="text-blue-600 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {site.url}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* References */}
            {references && references.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        References
                    </h3>
                    <ul className="space-y-2 text-sm">
                        {references.map((ref) => (
                            <li key={ref.id}>
                                <strong>{ref.name}</strong>
                                {ref.relationship && ` — ${ref.relationship}`}
                                {ref.contactInfo && (
                                    <div className="text-gray-600">
                                        {ref.contactInfo}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Hobbies */}
            {hobbies && hobbies.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700">
                        Hobbies
                    </h3>
                    <ul className="list-disc list-inside text-sm">
                        {hobbies.map((hobby) => (
                            <li key={hobby.id}>{hobby.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Custom Sections */}
            {customSections && customSections.length > 0 && (
                <div>
                    {customSections.map((custom) => (
                        <div key={custom.id}>
                            <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                {custom.title}
                            </h3>
                            <p className="text-sm text-gray-800 whitespace-pre-line">
                                {custom.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Elegant;