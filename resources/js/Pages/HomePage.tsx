import React from "react";
import { Link, Head } from '@inertiajs/react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: "/images/template-icon.png",
      title: "Modern Templates",
      description: "Choose from 6+ professional templates for all jobs and experience levels.",
    },
    {
      icon: "/images/ats-friendly-icon.png",
      title: "ATS-Friendly Resumes",
      description: "Your resume will pass the software many companies use to screen applicants.",
    },
    {
      icon: "/images/pre-written-icon.png",
      title: "Pre-Written Content",
      description: "Use ready-made content to save time and avoid the stress of writing from scratch.",
    },
    {
      icon: "/images/ai-icon.png",
      title: "Easy with AI",
      description: "AI sparks ideas and helps you find the right words to highlight your skills.",
    },
    {
      icon: "/images/beat-competition-icon.png",
      title: "Beat the Competition",
      description: "Stand out with an impressive resume that shows off your strengths.",
    },
    {
      icon: "/images/paid-more-icon.png",
      title: "Get Paid More",
      description: "A strong resume opens doors. BetterCV helps you move toward better job offers.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col items-center font-serif px-0">
      <Head title="CVeezy | Build Your Job-Winning Resume" />

      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
        <div className="flex items-center">
          <img
            src="/images/bettercv-logo.png"
            alt="BetterCV Logo"
            className="h-8 w-8 mr-3"
          />
          <span className="text-2xl font-bold text-[#222] font-sans">CVeezy</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="border border-[#2196f3] text-[#2196f3] font-semibold px-6 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
          >
            Contact us
          </Link>
          <Link
            href="/login"
            className="bg-[#2196f3] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1976d2] transition"
          >
            Login
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="w-full flex items-center justify-center px-4 py-16 md:py-24 bg-[#eaf6fe]">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto">
          {/* Left Side */}
          <div className="flex-1 max-w-2xl">
            <p className="text-[#3bb2f6] font-semibold mb-2 flex items-center text-lg">
              <span className="inline-block w-3 h-3 bg-[#3bb2f6] rounded-full mr-2 align-middle"></span>
              <span className="font-bold">50,435</span> resumes created today
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-[#222]">
              Create your{" "}
              <span className="text-[#2196f3]">job-winning resume</span> in minutes
            </h1>
            <p className="text-[#444] text-xl mb-8">
              The first step to a better job? A better resume. Get yours in just a few
              clicks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/choose-template">
                <button className="bg-[#2196f3] hover:bg-[#1976d2] text-white font-semibold py-3 px-8 rounded-lg shadow transition text-lg">
                  Create New Resume
                </button>
              </Link>
              <Link href="/uploader">
                <button className="bg-white border border-[#2196f3] text-[#2196f3] font-semibold py-3 px-8 rounded-lg shadow hover:bg-[#e3f2fd] transition text-lg">
                  Improve My Resume
                </button>
              </Link>
            </div>
            <div className="flex gap-12 mt-2 items-center">
              <div className="flex flex-col items-center">
                <span className="text-[#43d19e] text-3xl font-bold">48%</span>
                <span className="block text-[#43d19e] text-lg">more likely to get hired</span>
              </div>
              <div className="border-l border-[#dbeafe] h-8 mx-4"></div>
              <div className="flex flex-col items-center">
                <span className="text-[#ffc107] text-3xl font-bold">12%</span>
                <span className="block text-[#ffc107] text-lg">better pay with your next job</span>
              </div>
            </div>
          </div>
          {/* Right Side */}
          <div className="flex-1 flex justify-center items-center mt-10 md:mt-0">
            <div className="relative w-[400px] h-[480px] bg-white rounded-2xl shadow-xl overflow-visible flex items-center justify-center">
              <img
                src="/images/resume-sample.png"
                alt="Resume Example"
                className="w-[340px] h-[440px] object-cover rounded-xl shadow"
              />
              {/* Color palette circles */}
              <div className="absolute left-24 top-[340px] flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#e3f2fd] border border-[#b3e0ff]"></span>
                <span className="w-5 h-5 rounded-full bg-[#bbdefb] border border-[#90caf9]"></span>
                <span className="w-5 h-5 rounded-full bg-[#90caf9] border border-[#64b5f6]"></span>
                <span className="w-5 h-5 rounded-full bg-[#2196f3] border border-[#1976d2]"></span>
              </div>
              {/* ATS Perfect badge */}
              <div className="absolute left-8 bottom-24 bg-[#e6fff4] text-[#43d19e] px-5 py-2 rounded-full text-base font-semibold shadow">
                ATS Perfect
              </div>
              {/* AI-powered ideas box */}
              <div className="absolute right-0 bottom-0 bg-white rounded-xl shadow-lg p-6 w-[280px] text-base text-[#2196f3] flex flex-col gap-2">
                <div className="font-semibold mb-2 text-[#2196f3]">AI-powered ideas:</div>
                <div className="flex items-start gap-2">
                  <span className="inline-block w-7 h-7 rounded-full bg-[#e3f2fd] flex items-center justify-center">
                    <svg width="18" height="18" fill="#2196f3"><circle cx="9" cy="9" r="9"/></svg>
                  </span>
                  <span className="text-[#2196f3]">
                    Analyzed market trends to identify new growth opportunities.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="inline-block w-7 h-7 rounded-full bg-[#e3f2fd] flex items-center justify-center">
                    <svg width="18" height="18" fill="#2196f3"><circle cx="9" cy="9" r="9"/></svg>
                  </span>
                  <span className="text-[#2196f3]">
                    Reduced operational costs by 15% through process optimization.
                  </span>
                </div>
              </div>
              {/* Decorative floating squares */}
              <div className="absolute right-8 top-8 flex flex-col gap-4">
                <span className="w-10 h-10 bg-[#e3f2fd] rounded-xl shadow"></span>
                <span className="w-10 h-10 bg-white rounded-xl shadow"></span>
              </div>
              {/* Decorative sparkles */}
              <div className="absolute right-16 top-[320px] text-[#3bb2f6] text-2xl">
                <span>✨</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-[#f4faff] py-20 px-6 md:px-12 font-serif">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#222] mb-12">
            Why use <span className="text-[#2196f3]">CVeezy's</span> Resume Builder?
          </h2>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#e3f2fd] p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
              >
                <img
                  src={feature.icon}
                  alt={`${feature.title} icon`}
                  className="w-16 h-16 mb-6 mx-auto"
                />
                <h3 className="text-2xl font-bold text-[#222] mb-3">{feature.title}</h3>
                <p className="text-[#444] text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-16">
            <Link href="/choose-template">
              <button className="bg-[#2196f3] hover:bg-[#1976d2] text-white font-semibold py-4 px-10 text-lg rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95">
                Create My Resume
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <div className="relative w-full max-w-[1130px] h-[200px] sm:h-[280px] md:h-[356.6px] bg-[#2E404A] rounded-2xl shadow-lg overflow-hidden mt-[30px]">
        <img
          src="/images/banner.webp"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 w-[150px] h-[75px] sm:w-[200px] sm:h-[100px] md:w-[300px] md:h-[150px] bg-white opacity-20 rounded-full blur-[60px] transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-8 pt-[40px] sm:pt-[60px] md:pt-[90px]">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 leading-tight text-white">
            Get noticed, get hired faster
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 max-w-[90%] md:max-w-[700px] text-white">
            It's easier with CVeezy. Build a professional, job-winning resume in minutes!
          </p>
          <Link href="/choose-template">
            <button
              style={{ backgroundColor: "#05A2FF" }}
              className="hover:bg-blue-600 text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-lg shadow-lg transition duration-300 text-sm md:text-base"
            >
              Land My Dream Job
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="w-full bg-[#2E404A] mt-8 md:mt-20 py-8 md:py-16 px-4 md:px-8"
        style={{ fontFamily: "Nunito Sans, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto text-white">
          <div className="block md:hidden">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/images/supsoft-logo.jpg"
                  alt="CVeezy Logo"
                  className="w-6 h-6 rounded mr-2 object-contain"
                />
                <span className="text-xl font-bold">CVeezy</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                We help job seekers stand out in the highly competitive labor market
                with CVeezy!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6 justify-items-center">
              <div>
                <h3 className="text-lg font-semibold mb-3">Resources</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Resume Builder
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Resume Formatting
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Resume Writing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Resume Writing Guide
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Professional Resume
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Entry-level Resume
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Student Resume
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Support</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="hover:text-white transition-colors"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-and-conditions"
                      className="hover:text-white transition-colors"
                    >
                      Terms and Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/subscription-terms"
                      className="hover:text-white transition-colors"
                    >
                      Subscription Terms
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Contact us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-300 mb-3">
                <p>© 2025. TSFF Holdings Limited,</p>
                <p>Limassol, Cyprus. All rights reserved.</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-300">Email: help@cveezy.com</p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/images/gcash-logo.png"
                  alt="Payment Methods"
                  className="h-5 object-contain"
                />
              </div>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-6">
                <img
                  src="/images/supsoft-logo.jpg"
                  alt="CVeezy Logo"
                  className="w-8 h-8 rounded mr-3 object-contain"
                />
                <span className="text-2xl font-bold">CVeezy</span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                We help job seekers stand out in the highly competitive labor market
                with CVeezy!
              </p>
            </div>
            <div className="col-span-1">
              <h3 className="text-xl font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-base text-gray-300">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Resume Builder
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Resume Formatting
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Resume Writing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Resume Writing Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Professional Resume
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Entry-level Resume
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Student Resume
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="text-xl font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-base text-gray-300">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookie-policy"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-white transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/subscription-terms"
                    className="hover:text-white transition-colors"
                  >
                    Subscription Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-1">
              <div className="text-base text-gray-300 mb-4">
                <p>© 2025. TSFF Holdings Limited,</p>
                <p>Limassol, Cyprus. All rights reserved.</p>
              </div>
              <div className="mb-4">
                <p className="text-base text-gray-300">Email: help@cveezy.com</p>
              </div>
              <div className="flex space-x-2">
                <img
                  src="/images/gcash-logo.png"
                  alt="Payment Methods"
                  className="h-6 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
