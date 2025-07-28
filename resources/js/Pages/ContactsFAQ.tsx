// FAQ.tsx

import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How can I use CVeezy for free?",
    answer: "You can start using CVeezy for free by signing up. This allows you to create and edit your resume using our templates. Once your resume is ready, you can download it for free in .txt format. For additional features and the ability to download your resume in PDF or Word format, consider purchasing a subscription."
  },
  {
    question: "Can I customize my resume template?",
    answer: "Yes, you can fully customize your resume template. Adjust the layout, fonts, colors, and sections to match your personal style and the requirements of the job you're applying for."
  },
  {
    question: "How can I download my resume in PDF or Word?",
    answer: "Once you've completed your resume, simply click on the download button and choose either PDF or Word format. Your resume will be ready to save and send to potential employers."
  },
  {
    question: "How do I cancel or downgrade my account?",
    answer: "To cancel or downgrade your account, go to your account settings and click on the Subscription tab. From there, you can choose to cancel your current plan or switch to a lower-tier plan."
  },
  {
    question: "Should I make a different CV for every job application?",
    answer: "Yes, it’s recommended to tailor your CV for each job application. Customize your resume to highlight the skills and experiences most relevant to the specific job, increasing your chances of getting noticed by recruiters."
  },
  {
    question: "What should I include in my resume to make it stand out?",
    answer: "To make your resume stand out, include clear and concise bullet points, quantify your achievements, use action verbs, and tailor your resume to the job description. A clean, professional design of our templates also helps catch the recruiter's eye."
  },
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-gray-300 pb-4 mb-4">
          <div 
            className="flex justify-between items-center cursor-pointer" 
            onClick={() => toggleFAQ(index)}
          >
            <h3 className="text-xl font-semibold">
              {faq.question}
            </h3>
            <span className="text-xl">{activeIndex === index ? '-' : '+'}</span>
          </div>
          {activeIndex === index && (
            <p className="text-gray-600 mt-2">
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQ;
