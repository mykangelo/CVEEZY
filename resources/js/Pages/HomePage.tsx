import React, { useRef, useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import FAQ from "./HomepageFAQ";
import Logo from "@/Components/Logo";
import Button from "../Components/PrimaryButton";

interface HomePageProps {
    hasPendingPayments?: boolean;
    pendingResumesCount?: number;
}

const HomePage: React.FC<HomePageProps> = ({
    hasPendingPayments = false,
    pendingResumesCount = 0,
}) => {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const templates = [
        { name: "Professional", image: "/images/templates/professional.png" },
        { name: "Classic", image: "/images/templates/classic.png" },
        { name: "Creative", image: "/images/templates/creative.jpg" },
        { name: "Minimal", image: "/images/templates/minimal.jpg" },
        { name: "Elegant", image: "/images/templates/elegant.jpg" },
        { name: "Modern", image: "/images/templates/modern.jpg" },
    ];
    const containerRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 5;
    const CARD_WIDTH = 280;
    const GAP = 24; // 6 * 4px (gap-6)

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const totalTemplates = templates.length;

    // Create extended array for seamless looping
    const getExtendedTemplates = () => {
        // Add copies at the beginning and end for seamless looping
        return [
            ...templates.slice(-ITEMS_PER_PAGE),
            ...templates,
            ...templates.slice(0, ITEMS_PER_PAGE),
        ];
    };

    const extendedTemplates = getExtendedTemplates();
    const displayIndex = currentIndex + ITEMS_PER_PAGE; // Offset for the prepended items

    const scrollToIndex = (newIndex: number, immediate = false) => {
        if (isAnimating) return;

        setIsAnimating(true);
        setCurrentIndex(newIndex);

        setTimeout(
            () => {
                setIsAnimating(false);

                // Handle seamless looping
                if (newIndex >= totalTemplates) {
                    setCurrentIndex(0);
                } else if (newIndex < 0) {
                    setCurrentIndex(totalTemplates - 1);
                }
            },
            immediate ? 0 : 300
        );
    };

    const scrollRight = () => {
        const nextIndex = currentIndex + 1;
        scrollToIndex(nextIndex);
    };

    const scrollLeft = () => {
        const nextIndex = currentIndex - 1;
        scrollToIndex(nextIndex);
    };

    const getTransformValue = () => {
        const translateX = -displayIndex * (CARD_WIDTH + GAP);
        return `translateX(${translateX}px)`;
    };

    const features = [
        {
            icon: "/images/template-icon.png",
            title: "Modern Templates",
            description:
                "Choose from 6+ professional templates for all jobs and experience levels.",
        },
        {
            icon: "/images/ats-friendly-icon.png",
            title: "ATS-Friendly Resumes",
            description:
                "Your resume will pass the software many companies use to screen applicants.",
        },
        {
            icon: "/images/pre-written-icon.png",
            title: "Pre-Written Content",
            description:
                "Use ready-made content to save time and avoid the stress of writing from scratch.",
        },
        {
            icon: "/images/ai-icon.png",
            title: "Easy with AI",
            description:
                "AI sparks ideas and helps you find the right words to highlight your skills.",
        },
        {
            icon: "/images/beat-competition-icon.png",
            title: "Beat the Competition",
            description:
                "Stand out with an impressive resume that shows off your strengths.",
        },
        {
            icon: "/images/paid-more-icon.png",
            title: "Get Paid More",
            description:
                "A strong resume opens doors. BetterCV helps you move toward better job offers.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f4faff] flex flex-col items-center font-sans px-0">
            <Head title="CVeezy | Build Your Job-Winning Resume" />

            {/* Header */}
            <header className="w-full bg-white flex items-center justify-between h-20 px-6 shadow-sm">
                <div className="flex items-center">
                    <Link href={route('home')} aria-label="Go to homepage" className="inline-flex items-center">
                        <Logo
                            size="xxl"
                            showText={false}
                            className="text-2xl font-bold text-gray-800 font-sans hover:scale-105 hover:drop-shadow-lg  focus:outline-none focus:ring-2 focus:ring-[#354eab] rounded transition"
                        />
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/contact"
                        className="border border-[#354eab] text-[#354eab] font-semibold px-5 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
                    >
                        Contact us
                    </Link>
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="bg-[#354eab] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#2d3f8f] transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-[#354eab] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#2d3f8f] transition"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="w-full flex items-center justify-center px-4 py-16 md:py-24 bg-[#eaf6fe]">
                <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto">
                    {/* Left Side */}
                    <div className="flex-1 max-w-2xl">
                        <p className="text-[#354eab] font-semibold mb-2 flex items-center text-lg">
                            <span className="inline-block w-3 h-3 bg-[#354eab] rounded-full mr-2 align-middle live-indicator"></span>
                            <span className="font-bold">50,435 Resumes
                            Created Today</span>

                        </p>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-800">
                            Create your{" "}
                            <span className="text-[#354eab]">
                                job-winning resume
                            </span>{" "}
                            in minutes
                        </h1>
                        <p className="text-gray-600 text-xl mb-8">
                            The first step to a better job? A better resume. Get
                            yours in just a few clicks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            {user && hasPendingPayments ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg
                                            className="w-5 h-5 text-yellow-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span className="text-yellow-800 font-semibold">
                                            Payment Under Review
                                        </span>
                                    </div>
                                    <p className="text-yellow-700 text-sm">
                                        You have resumes with pending payment
                                        reviews. Please wait for admin approval
                                        before creating new resumes.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Link href="/choose-template">
                                        <button className="bg-[#354eab] hover:bg-[#2d3f8f] text-white font-semibold py-3 px-8 rounded-lg shadow transition text-lg">
                                            Create New Resume
                                        </button>
                                    </Link>
                                    <Link href="/uploader">
                                        <button className="bg-white border border-[#354eab] text-[#354eab] font-semibold py-3 px-8 rounded-lg shadow hover:bg-[#e3f2fd] transition text-lg">
                                            Improve My Resume
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex gap-12 mt-2 items-center">
                            <div className="flex flex-col items-center">
                                <span className="text-[#43d19e] text-3xl font-bold">
                                    48%
                                </span>
                                <span className="block text-[#43d19e] text-lg">
                                    more likely to get hired
                                </span>
                            </div>
                            <div className="border-l border-[#dbeafe] h-8 mx-4"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[#ffc107] text-3xl font-bold">
                                    12%
                                </span>
                                <span className="block text-[#ffc107] text-lg">
                                    better pay with your next job
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Right Side */}
                    <div className="flex-1 flex justify-center items-center mt-10 md:mt-0">
                        <div className="relative w-[400px] h-[480px] bg-white rounded-2xl shadow-xl overflow-visible flex items-center justify-center group">
                            {/* Resume Template Content */}
                            <div className="w-[340px] h-[440px] bg-white rounded-xl shadow-lg p-6 relative">
                                {/* Header Section */}
                                <div className="flex items-start gap-4 mb-6">
                                    {/* Profile Photo */}
                                    <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
                                    
                                    {/* Name and Contact Placeholders */}
                                    <div className="flex-1">
                                        <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                                        <div className="w-24 h-5 bg-gray-200 rounded mb-3"></div>
                                        <div className="space-y-2">
                                            <div className="w-28 h-4 bg-gray-200 rounded"></div>
                                            <div className="w-36 h-4 bg-gray-200 rounded"></div>
                                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="w-4 h-4 bg-[#bcd6f6] rounded"></div>
                                            <div className="w-16 h-4 bg-[#bcd6f6] rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Two Column Layout */}
                                <div className="flex gap-6">
                                    {/* Left Column */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-32 h-5 bg-gray-200 rounded"></div>
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="w-full h-3 bg-gray-200 rounded"></div>
                                            <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                                            <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                                        </div>
                                        
                                        <div className="w-16 h-5 bg-gray-200 rounded mb-3"></div>
                                        <div className="space-y-2">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-[#354eab] rounded-full"></div>
                                                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Right Column */}
                                    <div className="flex-1">
                                        <div className="w-24 h-5 bg-gray-200 rounded mb-3"></div>
                                        
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="w-32 h-3 bg-gray-200 rounded mb-2"></div>
                                            <div className="space-y-1 ml-4">
                                                <div className="w-full h-3 bg-gray-200 rounded"></div>
                                                <div className="w-4/5 h-3 bg-gray-200 rounded"></div>
                                                <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="w-28 h-4 bg-gray-200 rounded"></div>
                                                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="w-32 h-3 bg-gray-200 rounded mb-2"></div>
                                            <div className="space-y-1 ml-4">
                                                <div className="w-full h-3 bg-gray-200 rounded"></div>
                                                <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                                                <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                        
                                        <div className="w-20 h-5 bg-gray-200 rounded mb-3"></div>
                                        <div className="mb-2">
                                            <div className="w-40 h-4 bg-gray-200 rounded mb-1"></div>
                                            <div className="w-36 h-3 bg-gray-200 rounded mb-1"></div>
                                            <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            

                            
                            {/* ATS Perfect Badge - Clean positioning below Professional Summary */}
                            <div className="absolute left-6 top-[280px] bg-[#e6fff4] text-[#43d19e] px-3 py-1.5 rounded-full text-xs font-bold shadow-md border border-[#43d19e]/20 flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                ATS Perfect
                            </div>
                            
                            {/* AI-powered Ideas Box - Clean positioning at bottom right */}
                            <div className="absolute right-0 bottom-0 bg-white rounded-xl shadow-2xl p-5 w-[260px] text-sm text-[#354eab] flex flex-col gap-3 border border-[#e3f2fd]">
                                <div className="font-bold mb-2 text-[#354eab] flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    AI-powered ideas:
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="inline-block w-6 h-6 rounded-full bg-[#354eab] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="text-[#354eab] leading-relaxed">
                                        Analyzed market trends to identify new growth opportunities.
                                    </span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="inline-block w-6 h-6 rounded-full bg-[#354eab] flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="text-[#354eab] leading-relaxed">
                                        Reduced operational costs by 15% through process optimization.
                                    </span>
                                </div>
                            </div>
                            
                            {/* Download Buttons - Right side */}
                            <div className="absolute -right-16 top-8 flex flex-col gap-3">
                                <div className="w-12 h-12 bg-white border-2 border-[#354eab] rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group">
                                    <img 
                                        src="/icons/pdf.png" 
                                        alt="PDF Download" 
                                        className="w-8 h-8 group-hover:scale-110 transition-transform"
                                    />
                                </div>
                                <div className="w-12 h-12 bg-white border-2 border-[#354eab] rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group">
                                    <svg className="w-6 h-6 text-[#354eab] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full bg-[#f4faff] py-20 px-6 md:px-12 font-sans">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12">
                        Why use <span className="text-[#354eab]">CVeezy's</span>{" "}
                        Resume Builder?
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
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-base leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-16   mb-10">
                        <Link href="/choose-template">
                            <button className="bg-[#354eab] hover:bg-[#2d3f8f] text-white font-semibold py-4 px-10 text-lg rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95">
                                Create My Resume
                            </button>
                        </Link>
                    </div>

                    {/* FAQ Section */}
                    <FAQ />
                </div>
            </section>

            {/* Templates Section - Enhanced with Smooth Animation */}
            <section className="w-full bg-[#f4faff] py-20 mb-10 font-sans overflow-hidden">
                <div className="bg-gradient-to-b from-slate-800 to-[#f4faff] py-12 px-4 text-center font-sans h-[700px]">
                    <h1 className="text-white text-4xl font-bold mb-4">
                        Choose your{" "}
                        <span className="text-[#354eab]">RESUME TEMPLATES</span>,
                        AI will do the rest
                    </h1>
                    <p className="text-white text-sm max-w-2xl mx-auto mb-6">
                        With CVeezy's AI resume generator, you'll get a
                        professional, typo-free, and ATS-friendly resume ready
                        in no time. Explore 40+ modern templates.
                    </p>
                    <Link href="/choose-template">
                        <button className="bg-[#354eab] hover:bg-[#2d3f8f] text-white font-semibold py-2 px-6 rounded-full shadow-md transition-colors duration-300 mb-8">
                            View All Templates
                        </button>
                    </Link>

                    <div className="relative w-full flex justify-center">
                        {/* Left Arrow */}
                        <button
                            onClick={scrollLeft}
                            disabled={isAnimating}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-700 text-white p-3 rounded-full shadow hover:bg-slate-600 z-10 opacity-60 hover:opacity-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        {/* Template Slider Container */}
                        <div
                            className="overflow-hidden"
                            style={{
                                width: `${
                                    (CARD_WIDTH + GAP) * ITEMS_PER_PAGE - GAP
                                }px`,
                            }}
                        >
                            <div
                                className="flex gap-6 transition-transform duration-500 ease-out"
                                style={{
                                    transform: getTransformValue(),
                                    width: `${
                                        extendedTemplates.length *
                                        (CARD_WIDTH + GAP)
                                    }px`,
                                }}
                                ref={containerRef}
                            >
                                {extendedTemplates.map((template, index) => (
                                    <div
                                        key={`${template.name}-${index}`}
                                        className="flex flex-col items-center flex-shrink-0 group animate-fade-in-up"
                                        style={{ 
                                            width: `${CARD_WIDTH}px`,
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        <div className="template-showcase-card w-full h-auto relative overflow-hidden group">
                                            <img
                                                src={template.image}
                                                alt={template.name}
                                                className="template-showcase-image w-full h-auto object-contain"
                                                draggable={false}
                                            />
                                            <div className="template-showcase-actions">
                                                <button className="bg-gradient-to-r from-[#354eab] to-[#4a5fc7] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-xl hover:shadow-2xl hover:from-[#4a5fc7] hover:to-[#2d3f8f] transition-all duration-300 transform hover:scale-105">
                                                    Use This Template
                                                </button>
                                            </div>
                                        </div>
                                        <div className="template-showcase-name">
                                            {template.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={scrollRight}
                            disabled={isAnimating}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-700 text-white p-3 rounded-full shadow hover:bg-slate-600 z-10 opacity-60 hover:opacity-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
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
                        It's easier with CVeezy. Build a professional,
                        job-winning resume in minutes!
                    </p>
                    <Link href="/choose-template">
                        <button
                            style={{ backgroundColor: "#354eab" }}
                            className="hover:bg-[#4a5fc7] text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-lg shadow-lg transition duration-300 text-sm md:text-base"
                        >
                            Land My Dream Job
                        </button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer
                className="w-full bg-[#1f2937] mt-8 md:mt-20 py-8 md:py-16 px-4 md:px-8"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
                <div className="max-w-7xl mx-auto text-white">
                    <div className="block md:hidden">
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-gradient-to-br from-white via-[#f8fbff] to-[#e3f2fd] rounded-2xl p-4 shadow-2xl border-2 border-[#354eab] hover:border-[#4a5fc7] transition-all duration-500 hover:shadow-[#354eab]/30 hover:scale-110 hover:rotate-1 hover:from-[#f0f8ff] hover:via-[#e8f4fd] hover:to-[#d4edff] group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#354eab]/5 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                                    <img
                                        src="/images/cveezyLOGO_C.png"
                                        alt="CVeezy Logo"
                                        className="w-16 h-16 object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-lg group-hover:brightness-110"
                                    />
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                We help job seekers stand out in the highly
                                competitive labor market with CVeezy!
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-6 justify-items-center">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">
                                    About
                                </h3>
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
                                            href="/payment-terms"
                                            className="hover:text-white transition-colors"
                                        >
                                            Payment Terms
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
                            <div className="mb-3">
                                <h3 className="text-lg font-semibold mb-2">
                                    Need Help?
                                </h3>
                                <p className="text-sm text-gray-300 mb-2">
                                    Email: help@cveezy.com
                                </p>
                            </div>
                            <div className="text-sm text-gray-300 mb-3">
                                <div className="flex items-center justify-center mb-1">
                                    <img
                                        src="/images/CerticodeLogo.jpg"
                                        alt="Certicode Logo"
                                        className="w-4 h-4 rounded mr-2 object-contain"
                                    />
                                    <p>© 2025. Certicode.</p>
                                </div>
                                <p>All rights reserved.</p>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src="/images/gcash-logo.png"
                                    alt="GCash"
                                    className="h-6 object-contain rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:grid grid-cols-3 gap-8">
                        <div className="col-span-1">
                            <div className="flex items-center mb-6">
                                <Link href={route('home')} aria-label="Go to homepage" className="inline-flex items-center">
                                    <div className="bg-gradient-to-br from-[#93c5fd] via-[#f8fbff] to-[#93c5fd] rounded-2xl p-6 shadow-2xl border-1 border-[#354eab] hover:border-[#4a5fc7] transition-all duration-500 hover:shadow-[#354eab]/30 hover:scale-110 hover:rotate-1 hover:from-[#f0f8ff] hover:via-[#93c5fd] hover:to-[#d4edff] group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#354eab]/5 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                                        <Logo
                                            size="xxl"
                                            showText={false}
                                            className=""
                                        />
                                    </div>
                                </Link>
                            </div>
                            <p className="text-gray-300 text-base leading-relaxed">
                                We Help job seekers stand out in the highly
                                competitive labor market with CVeezy!
                            </p>
                        </div>
                        <div className="col-span-1 ml-24">
                            <h3 className="text-xl font-semibold mb-4">
                                About
                            </h3>
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
                                        href="/payment-terms"
                                        className="hover:text-white transition-colors"
                                    >
                                        Payment Terms
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
                        <div className="col-span-1 ml-8">
                            <h3 className="text-xl font-semibold mb-4">
                                Need Help?
                            </h3>
                            <div className="mb-4">
                                <p className="text-base text-gray-300">
                                    Email: help@cveezy.com
                                </p>
                            </div>
                            <div className="text-base text-gray-300 mb-4">
                                <div className="flex items-center mb-1">
                                    <img
                                        src="\images\CerticodeLogo.jpg"
                                        alt="Certicode Logo"
                                        className="w-6 h-6 rounded mr-2 object-contain"
                                    />
                                    <p>© 2025. Certicode.</p>
                                </div>
                                <p>All rights reserved.</p>
                            </div>
                            <div className="flex">
                                <img
                                    src="/images/gcash-logo.png"
                                    alt="GCash"
                                    className="h-7 object-contain rounded-2xl"
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
