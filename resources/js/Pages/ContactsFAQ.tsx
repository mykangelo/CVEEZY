// FAQ.tsx

import React, { useState } from 'react';
import { Transition } from '@headlessui/react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I use CVeezy for free?",
    answer: "Sign up and start building right away. You can edit and download a .txt version for free. PDF/DOCX downloads and pro features are available on a paid plan."
  },
  {
    question: "Can I customize templates?",
    answer: "Yes. Change layout, sections, fonts, and colors to match your style and the role."
  },
  {
    question: "How do I download a PDF or DOCX?",
    answer: "Click Download and choose PDF or DOCX. Your file will be ready to save and send."
  },
  {
    question: "How do I cancel or downgrade?",
    answer: "Go to Account Settings → Subscription. From there you can cancel or switch plans."
  },
  {
    question: "Should I tailor my resume for each job?",
    answer: "Yes. Emphasize the skills and results most relevant to the posting to boost your chances."
  },
  {
    question: "What makes a resume stand out?",
    answer: "Clear bullets, measurable results, action verbs, role‑specific keywords, and a clean, professional layout."
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
          <div key={index} className="group py-2">
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
                <svg className={`h-4 w-4 transition-transform duration-300 ${activeIndex === index ? 'rotate-45' : ''}`} viewBox="0 0 20 20" fill="currentColor">
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
