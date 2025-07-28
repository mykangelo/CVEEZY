import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What is CVeezy?",
    answer: "CVeezy is an online resume builder that helps you create a professional, ATS-friendly resume in just minutes. You’ll get structured templates, AI writing support, and tools that help your resume get noticed by employers."
  },
  {
    question: "Do I need any designer or writing experience?",
    answer: "Not at all. CVeezy guides you through the process with easy-to-use templates and AI writing assistance, making it simple for anyone to create a standout resume."
  },
  {
    question: "What does ATS-friendly mean?",
    answer: "ATS stands for Applicant Tracking Systems. It’s software that many companies use to scan resumes before a recruiter sees them. An ATS-friendly resume is formatted so the system can read your experience correctly and pass it on to a recruiter."
  },
  {
    question: "Why do I need an ATS-friendly resume?",
    answer: "If your resume isn’t optimized for ATS, it might not reach the recruiter. CVeezy helps ensure your resume gets past ATS scans and into the hands of hiring managers."
  },
  {
    question: "Can I customize the resume templates?",
    answer: "Yes, all CVeezy templates are fully customizable! You can edit the layout, font, sections, and content to fit your personal style and the job you’re targeting."
  },
  {
    question: "Is there help available for writing my resume?",
    answer: "Absolutely. Our AI-powered suggestions, built-in keyword optimization, and ready-to-use content help you write clear, impactful descriptions tailored to the job you want. You can edit or use them as-is."
  },
  {
    question: "Can I create a cover letter too?",
    answer: "Yes. With CVeezy, you can write cover letters that match your resume’s content and the job description with just a few clicks."
  },
  {
    question: "Is CVeezy free to use?",
    answer: "You can build and customize your resume for free. If you want advanced features, you can upgrade to a paid plan."
  },
  {
    question: "Can I download my resume?",
    answer: "You can download your resume in PDF or DOCX format anytime. DOCX is best if you want to ensure full compatibility with ATS."
  },
  {
    question: "Is my data safe with CVeezy?",
    answer: "Your privacy is our priority. We use advanced technology to protect your personal information and never share your data without your permission."
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
