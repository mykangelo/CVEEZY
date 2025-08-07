import React from 'react';
import {
  ResumeData,
  Language,
  Certification,
  Award,
  Website,
  Reference,
  Hobby,
  CustomSection,
} from '@/types/resume';

type Props = {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
};

// Explicitly map each subsection to its item type
type SectionItemTypes = {
  languages: Language;
  certifications: Certification;
  awards: Award;
  websites: Website;
  references: Reference;
  hobbies: Hobby;
  customSections: CustomSection;
};

function addEntry<K extends keyof SectionItemTypes>(
  resumeData: ResumeData,
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>,
  key: K,
  newItem: SectionItemTypes[K]
) {
  const currentArray = (resumeData[key] || []) as SectionItemTypes[K][];
  setResumeData((prev) => ({
    ...prev,
    [key]: [...currentArray, newItem],
  }));
}

function removeEntry<K extends keyof SectionItemTypes>(
  resumeData: ResumeData,
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>,
  key: K,
  index: number
) {
  const currentArray = (resumeData[key] || []) as SectionItemTypes[K][];
  setResumeData((prev) => ({
    ...prev,
    [key]: currentArray.filter((_, i) => i !== index),
  }));
}

const AdditionalSection: React.FC<Props> = ({ resumeData, setResumeData }) => {
  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Additional Sections</h2>

      {/* Languages */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Languages</h3>
        {(resumeData.languages || []).map((lang, index) => (
          <div key={lang.id} className="flex gap-4 mb-2">
            <input
              className="border p-2 rounded w-1/2"
              placeholder="Language"
              value={lang.name}
              onChange={(e) => {
                const updated = [...(resumeData.languages || [])];
                updated[index].name = e.target.value;
                setResumeData({ ...resumeData, languages: updated });
              }}
            />
            <input
              className="border p-2 rounded w-1/2"
              placeholder="Proficiency"
              value={lang.proficiency || ''}
              onChange={(e) => {
                const updated = [...(resumeData.languages || [])];
                updated[index].proficiency = e.target.value;
                setResumeData({ ...resumeData, languages: updated });
              }}
            />
            <button
              type="button"
              className="text-red-600 text-sm underline"
              onClick={() => removeEntry(resumeData, setResumeData, 'languages', index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() =>
            addEntry(resumeData, setResumeData, 'languages', {
              id: Date.now(),
              name: '',
              proficiency: '',
            })
          }
        >
          + Add Language
        </button>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Certifications</h3>
        {(resumeData.certifications || []).map((cert, index) => (
          <div key={cert.id} className="flex gap-4 mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Certification Title"
              value={cert.title}
              onChange={(e) => {
                const updated = [...(resumeData.certifications || [])];
                updated[index].title = e.target.value;
                setResumeData({ ...resumeData, certifications: updated });
              }}
            />
            <button
              type="button"
              className="text-red-600 text-sm underline"
              onClick={() => removeEntry(resumeData, setResumeData, 'certifications', index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() =>
            addEntry(resumeData, setResumeData, 'certifications', {
              id: Date.now(),
              title: '',
            })
          }
        >
          + Add Certification
        </button>
      </div>

      {/* Awards */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Awards</h3>
        {(resumeData.awards || []).map((award, index) => (
          <div key={award.id} className="flex gap-4 mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Award Title"
              value={award.title}
              onChange={(e) => {
                const updated = [...(resumeData.awards || [])];
                updated[index].title = e.target.value;
                setResumeData({ ...resumeData, awards: updated });
              }}
            />
            <button
              type="button"
              className="text-red-600 text-sm underline"
              onClick={() => removeEntry(resumeData, setResumeData, 'awards', index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() =>
            addEntry(resumeData, setResumeData, 'awards', {
              id: Date.now(),
              title: '',
            })
          }
        >
          + Add Award
        </button>
      </div>

      {/* Websites */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Websites</h3>
        {(resumeData.websites || []).map((site, index) => (
          <div key={site.id} className="flex gap-4 mb-2">
            <input
              className="border p-2 rounded w-1/2"
              placeholder="Label (e.g., GitHub)"
              value={site.label}
              onChange={(e) => {
                const updated = [...(resumeData.websites || [])];
                updated[index].label = e.target.value;
                setResumeData({ ...resumeData, websites: updated });
              }}
            />
            <input
              className="border p-2 rounded w-1/2"
              placeholder="URL"
              value={site.url}
              onChange={(e) => {
                const updated = [...(resumeData.websites || [])];
                updated[index].url = e.target.value;
                setResumeData({ ...resumeData, websites: updated });
              }}
            />
            <button
              type="button"
              className="text-red-600 text-sm underline"
              onClick={() => removeEntry(resumeData, setResumeData, 'websites', index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() =>
            addEntry(resumeData, setResumeData, 'websites', {
              id: Date.now(),
              label: '',
              url: '',
            })
          }
        >
          + Add Website
        </button>
      </div>

      {/* References */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">References</h3>
        {(resumeData.references || []).map((ref, index) => (
          <div key={ref.id} className="flex flex-col md:flex-row gap-4 mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Name"
              value={ref.name}
              onChange={(e) => {
                const updated = [...(resumeData.references || [])];
                updated[index].name = e.target.value;
                setResumeData({ ...resumeData, references: updated });
              }}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Relationship"
              value={ref.relationship || ''}
              onChange={(e) => {
                const updated = [...(resumeData.references || [])];
                updated[index].relationship = e.target.value;
                setResumeData({ ...resumeData, references: updated });
              }}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Contact Info"
              value={ref.contactInfo || ''}
              onChange={(e) => {
                const updated = [...(resumeData.references || [])];
                updated[index].contactInfo = e.target.value;
                setResumeData({ ...resumeData, references: updated });
              }}
            />
            <button
              type="button"
              className="text-red-600 text-sm underline"
              onClick={() => removeEntry(resumeData, setResumeData, 'references', index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() =>
            addEntry(resumeData, setResumeData, 'references', {
              id: Date.now(),
              name: '',
              relationship: '',
              contactInfo: '',
            })
          }
        >
          + Add Reference
        </button>
      </div>

      {/* Hobbies */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Hobbies</h3>
        {(resumeData.hobbies || []).map((hobby, index) => (
          <div key={hobby.id} className="flex gap-4 mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Hobby"
              value={hobby.name}
              onChange={(e) => {
                const updated = [...(resumeData.hobbies || [])];
                updated[index].name = e.target.value;
                setResumeData({ ...resumeData, hobbies: updated });
              }}
            />
            <button
              type="button"
              className="text-red-600 text-sm underline"
              onClick={() => removeEntry(resumeData, setResumeData, 'hobbies', index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() =>
            addEntry(resumeData, setResumeData, 'hobbies', {
              id: Date.now(),
              name: '',
            })
          }
        >
          + Add Hobby
        </button>
      </div>

      {/* Custom Sections */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Custom Sections</h3>
        {(resumeData.customSections || []).map((custom, index) => (
          <div key={custom.id} className="space-y-2 mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Section Title"
              value={custom.title}
              onChange={(e) => {
                const updated = [...(resumeData.customSections || [])];
                updated[index].title = e.target.value;
                setResumeData({ ...resumeData, customSections: updated });
              }}
            />
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Content"
              rows={3}
              value={custom.content}
              onChange={(e) => {
                const updated = [...(resumeData.customSections || [])];
                updated[index].content = e.target.value;
                setResumeData({ ...resumeData, customSections: updated });
              }}
            />
            <div className="text-right">
              <button
                type="button"
                className="text-red-600 text-sm underline"
                onClick={() => removeEntry(resumeData, setResumeData, 'customSections', index)}
              >
                Remove Custom Section
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() =>
            addEntry(resumeData, setResumeData, 'customSections', {
              id: Date.now(),
              title: '',
              content: '',
            })
          }
        >
          + Add Custom Section
        </button>
      </div>
    </div>
  );
};

export default AdditionalSection;