import React, { useState } from 'react';
import { Transition } from '@headlessui/react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What is CVeezy?",
    answer: "CVeezy is a resume builder that helps you craft a polished, ATS‑ready resume in minutes. Choose a template, add your details, and let our smart tools highlight your strengths."
  },
  {
    question: "Do I need design or writing experience?",
    answer: "No. Our guided editor and AI suggestions make it simple for anyone to build a great‑looking resume—no design skills required."
  },
  {
    question: "What does ATS-friendly mean?",
    answer: "ATS (Applicant Tracking System) software scans resumes before recruiters do. An ATS‑friendly resume uses clean formatting and keywords so your information is read correctly."
  },
  {
    question: "Why should my resume be ATS‑friendly?",
    answer: "If the ATS can’t parse your resume, it may never reach a human. CVeezy’s templates and guidance help you pass scans and get seen by recruiters."
  },
  {
    question: "Can I customize the resume templates?",
    answer: "Absolutely. Adjust layout, sections, fonts, and content to match your style and the role you’re targeting."
  },
  {
    question: "Is there help available for writing my resume?",
    answer: "Yes. AI prompts, keyword tips, and ready‑to‑edit examples help you write clear, impactful bullet points tailored to the job."
  },
  {
    question: "Can I create a cover letter too?",
    answer: "Yes. Create a matching cover letter in the same editor, aligned with your resume and the job description."
  },
  {
    question: "Is CVeezy free to use?",
    answer: "You can build and customize for free. Upgrade anytime for advanced features and downloads."
  },
  {
    question: "Can I download my resume?",
    answer: "Yes. Export your resume as PDF or DOCX. DOCX offers the best compatibility for ATS and editing."
  },
  {
    question: "Is my data safe with CVeezy?",
    answer: "We take privacy seriously. Your information is protected and never shared without your consent."
  },
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 text-gray-800">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 text-center tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8]"></div>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
        Quick answers to the most common questions about using CVeezy.
      </p>

      <div className="divide-y divide-[#e3f2fd]">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="group py-2"
          >
            <button
              type="button"
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between gap-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#354eab]"
              aria-expanded={activeIndex === index}
              aria-controls={`faq-panel-${index}`}
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 group-hover:text-[#354eab] transition-colors">
                {faq.question}
              </h3>
              <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full border transition-all duration-300 ${activeIndex === index ? 'bg-[#354eab] text-white border-[#354eab]' : 'text-gray-500 border-gray-300 group-hover:text-[#354eab] group-hover:border-[#bcd6f6]'}`}>
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${activeIndex === index ? 'rotate-45' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
            <Transition
              show={activeIndex === index}
              enter="transition-all ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1 max-h-0"
              enterTo="opacity-100 translate-y-0 max-h-48"
              leave="transition-all ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 max-h-48"
              leaveTo="opacity-0 -translate-y-1 max-h-0"
            >
              <div id={`faq-panel-${index}`} className="pb-5 pt-0 text-gray-600 leading-relaxed text-base md:text-lg">
                {faq.answer}
              </div>
            </Transition>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
