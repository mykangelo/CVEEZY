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
                "Pick from 6+ polished designs for any role and experience level.",
        },
        {
            icon: "/images/ats-friendly-icon.png",
            title: "ATS-Friendly Resumes",
            description:
                "Formatting that passes ATS scans so recruiters actually see your resume.",
        },
        {
            icon: "/images/pre-written-icon.png",
            title: "Pre-Written Content",
            description:
                "Ready‑to‑edit examples save time and beat blank‑page stress.",
        },
        {
            icon: "/images/ai-icon.png",
            title: "Easy with AI",
            description:
                "AI suggestions help you say the right things with the right keywords.",
        },
        {
            icon: "/images/beat-competition-icon.png",
            title: "Beat the Competition",
            description:
                "Stand out with a clean, professional resume that highlights your strengths.",
        },
        {
            icon: "/images/paid-more-icon.png",
            title: "Get Paid More",
            description:
                "A stronger resume leads to better opportunities and higher offers.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f4faff] flex flex-col items-center font-sans px-0">
            <Head title="CVeezy | Build Your Job-Winning Resume" />

            {/* Header */}
            <header className="w-full bg-white flex items-center justify-between h-16 sm:h-20 lg:h-24 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 shadow-sm">
                <div className="flex items-center">
                    <Link href={route('home')} aria-label="Go to homepage" className="inline-flex items-center">
                        <Logo
                            size="xxl"
                            showText={false}
                            className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 font-sans hover:scale-105 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-[#354eab] rounded transition"
                        />
                    </Link>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <Link
                        href="/contact"
                        className="border border-[#354eab] text-[#354eab] font-semibold px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-3 rounded-lg hover:bg-[#e3f2fd] transition text-sm sm:text-base"
                    >
                        Contact us
                    </Link>
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="bg-[#354eab] text-white font-semibold px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-3 rounded-lg hover:bg-[#2d3f8f] transition text-sm sm:text-base"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-[#354eab] text-white font-semibold px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-3 rounded-lg hover:bg-[#2d3f8f] transition text-sm sm:text-base"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-[#eaf6fe]">
                <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl lg:max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto">
                    {/* Left Side */}
                    <div className="flex-1 max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
                        <p className="text-[#354eab] font-semibold mb-2 flex items-center text-sm sm:text-base lg:text-lg xl:text-xl">
                            <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-[#354eab] rounded-full mr-2 align-middle live-indicator"></span>
                            <span className="font-bold">50,435 Resumes
                            Created Today</span>

                        </p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight text-gray-800">
                            Create your{" "}
                            <span className="text-[#354eab]">
                                job-winning resume
                            </span>{" "}
                            in minutes
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 lg:mb-10">
                            The first step to a better job? A better resume. Get
                            yours in just a few clicks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
                            {user && hasPendingPayments ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg
                                            className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
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
                                        <span className="text-yellow-800 font-semibold text-sm sm:text-base">
                                            Payment Under Review
                                        </span>
                                    </div>
                                    <p className="text-yellow-700 text-xs sm:text-sm lg:text-base">
                                        You have resumes with pending payment
                                        reviews. Please wait for admin approval
                                        before creating new resumes.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Link href="/choose-template">
                                        <button className="bg-[#354eab] hover:bg-[#2d3f8f] text-white font-semibold py-2 sm:py-3 lg:py-4 px-6 sm:px-8 lg:px-10 rounded-lg shadow transition text-sm sm:text-base lg:text-lg">
                                            Create New Resume
                                        </button>
                                    </Link>
                                    <Link href="/uploader">
                                        <button className="bg-white border border-[#354eab] text-[#354eab] font-semibold py-2 sm:py-3 lg:py-4 px-6 sm:px-8 lg:px-10 rounded-lg shadow hover:bg-[#e3f2fd] transition text-sm sm:text-base lg:text-lg">
                                            Improve My Resume
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex gap-6 sm:gap-8 lg:gap-12 mt-2 items-center">
                            <div className="flex flex-col items-center">
                                <span className="text-[#43d19e] text-2xl sm:text-3xl lg:text-4xl font-bold">
                                    48%
                                </span>
                                <span className="block text-[#43d19e] text-sm sm:text-base lg:text-lg text-center">
                                    more likely to get hired
                                </span>
                            </div>
                            <div className="border-l border-[#dbeafe] h-6 sm:h-8 lg:h-10 mx-2 sm:mx-4"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[#ffc107] text-2xl sm:text-3xl lg:text-4xl font-bold">
                                    12%
                                </span>
                                <span className="block text-[#ffc107] text-sm sm:text-base lg:text-lg text-center">
                                    better pay with your next job
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Right Side */}
                    <div className="flex-1 flex justify-center items-center mt-8 sm:mt-10 md:mt-0">
                        <div className="relative w-[280px] h-[340px] sm:w-[320px] sm:h-[380px] md:w-[360px] md:h-[420px] lg:w-[400px] lg:h-[480px] xl:w-[450px] xl:h-[540px] 2xl:w-[500px] 2xl:h-[600px] bg-white rounded-2xl shadow-xl overflow-visible flex items-center justify-center group">
                            {/* Resume Template Content */}
                            <div className="w-[240px] h-[300px] sm:w-[280px] sm:h-[340px] md:w-[320px] md:h-[380px] lg:w-[340px] lg:h-[440px] xl:w-[380px] xl:h-[480px] 2xl:w-[420px] 2xl:h-[540px] bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 relative">
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
            <section className="w-full bg-[#f4faff] py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 font-sans">
                <div className="max-w-6xl lg:max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto">
                    <div
                        className="relative bg-white rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] p-4 sm:p-6 lg:p-8 xl:p-12 ring-1 ring-[#eef5ff] shadow-[0_18px_50px_rgba(31,41,55,0.08)] text-center"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-800 mb-3 sm:mb-4 lg:mb-6 tracking-tight">
                        Why use <span className="text-[#354eab]">CVeezy's</span>{" "}
                        Resume Builder?
                    </h2>
                        <div className="mx-auto mb-6 sm:mb-8 lg:mb-10 h-1 sm:h-1.5 w-16 sm:w-20 lg:w-24 rounded-full bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8]"></div>

                    {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative rounded-[20px] sm:rounded-[24px] lg:rounded-[26px] p-4 sm:p-6 lg:p-8 bg-[#f7f9fc] ring-1 ring-[#e9f1ff] transition-all duration-300 hover:-translate-y-0.5"
                                style={{
                                    boxShadow:
                                        'inset 0 1px 0 rgba(255,255,255,0.6), 0 24px 50px rgba(31,41,55,0.12), 0 2px 8px rgba(31,41,55,0.06)'
                                }}
                            >
                                <div className="mx-auto mb-4 sm:mb-6 grid place-items-center h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-2xl bg-[#f2f6ff] ring-1 ring-[#e3f2fd] transition-all duration-300 group-hover:scale-105 group-hover:ring-[#bcd6f6]">
                                <img
                                    src={feature.icon}
                                    alt={`${feature.title} icon`}
                                        className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 opacity-90"
                                />
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-800 mb-2 sm:mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-[36ch] mx-auto">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                        </div>
                        {/* CTA moved outside container below */}
                    </div>

                    {/* CTA Button between sections */}
                    <div className="mt-6 sm:mt-8 lg:mt-10 mb-6 sm:mb-8 lg:mb-10 flex justify-center">
                        <Link href="/choose-template">
                            <button className="bg-[#354eab] hover:bg-[#2d3f8f] text-white font-semibold py-3 sm:py-4 lg:py-5 px-8 sm:px-10 lg:px-12 text-sm sm:text-base lg:text-lg rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95">
                                Create My Resume
                            </button>
                        </Link>
                    </div>

                    {/* FAQ Section */}
                    <FAQ />
                </div>
            </section>

            {/* Templates Section - Enhanced with Smooth Animation */}
            <section className="w-full bg-[#f4faff] py-12 sm:py-16 lg:py-20 xl:py-24 mb-6 sm:mb-8 lg:mb-10 font-sans overflow-hidden">
                <div className="relative py-8 sm:py-10 lg:py-12 xl:py-16 px-4 sm:px-6 lg:px-8 text-center font-sans h-[500px] sm:h-[600px] lg:h-[700px] xl:h-[800px] bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#f4faff]">
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(1100px 420px at 50% -200px, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)'
                        }}
                    />
                    <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">
                        Choose your{" "}
                        <span className="text-[#354eab]">RESUME TEMPLATES</span>,
                        AI will do the rest
                    </h1>
                    <p className="text-white text-xs sm:text-sm lg:text-base max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto mb-4 sm:mb-6 lg:mb-8 px-4">
                        With CVeezy's AI resume generator, you'll get a
                        professional, typo-free, and ATS-friendly resume ready
                        in no time. Explore 40+ modern templates.
                    </p>
                    <Link href="/choose-template">
                        <button className="bg-[#354eab] hover:bg-[#2d3f8f] text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 lg:px-8 rounded-full shadow-md transition-colors duration-300 mb-6 sm:mb-8 text-sm sm:text-base">
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
            <div className="relative w-full max-w-[1130px] h-[220px] sm:h-[300px] md:h-[380px] rounded-3xl shadow-xl overflow-hidden mt-[30px] bg-[#243746]">
                <img
                    src="/images/banner.webp"
                    alt="Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
                />
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[780px] h-[780px] bg-[#ffffff]/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-120px] left-[10%] w-[360px] h-[360px] bg-[#354eab]/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-140px] right-[8%] w-[360px] h-[360px] bg-[#4a5fc7]/20 rounded-full blur-[110px]" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-8 pt-[46px] sm:pt-[68px] md:pt-[98px]">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 md:mb-4 leading-tight text-white drop-shadow-md">
                        Get noticed, get hired faster
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 max-w-[90%] md:max-w-[700px] text-blue-100">
                        It's easier with CVeezy. Build a professional,
                        job-winning resume in minutes!
                    </p>
                    <Link href="/choose-template">
                        <button
                            style={{ backgroundColor: "#354eab" }}
                            className="hover:bg-[#4a5fc7] text-white font-semibold py-2 px-5 md:py-3 md:px-7 rounded-xl shadow-lg shadow-black/30 transition duration-300 text-sm md:text-base"
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
                                <div className="bg-gradient-to-br from-[#f0f8ff] via-[#e6f3ff] to-[#d1e7ff] rounded-2xl p-4 shadow-xl ring-1 ring-[#93c5fd]/60 border border-[#3b82f6]/40 hover:border-[#2563eb] transition-all duration-500 hover:shadow-[#3b82f6]/20 hover:scale-110 hover:rotate-1 group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#3b82f6]/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                                    <img
                                        src="/images/cveezyLOGO_C.png"
                                        alt="CVeezy Logo"
                                        className="w-16 h-16 object-contain transition-all duration-500 group-hover:drop-shadow-lg group-hover:brightness-110 group-hover:scale-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] p-3 flex flex-col items-center justify-center text-center [transform:rotateX(-90deg)] origin-bottom transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:[transform:rotateX(0deg)] shadow-2xl overflow-hidden">
                                        <div className="relative z-10 px-3">
                                            <h4 className="text-white text-sm font-extrabold tracking-wide mb-0">CVEEZY</h4>
                                            <p className="text-white/90 text-[9px] tracking-widest mb-2">BY CERTICODE</p>
                                            <p className="text-white/90 text-[10px] leading-tight">Create ATS‑friendly resumes in minutes with AI guidance and modern templates.</p>
                                        </div>
                                    </div>
                                    <span className="pointer-events-none absolute -inset-16 rotate-[18deg] bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-0 -translate-x-[120%] group-hover:opacity-40 group-hover:translate-x-[120%] transition-all duration-700"></span>
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
                                    <div className="bg-gradient-to-br from-[#f0f8ff] via-[#e6f3ff] to-[#d1e7ff] rounded-2xl p-6 shadow-xl ring-1 ring-[#93c5fd]/60 border border-[#3b82f6]/40 hover:border-[#2563eb] transition-all duration-500 hover:shadow-[#3b82f6]/20 hover:scale-110 hover:rotate-1 group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#3b82f6]/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
                                        <Logo
                                            size="xxl"
                                            showText={false}
                                            className="transition-all duration-500 group-hover:scale-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] p-4 flex flex-col items-center justify-center text-center [transform:rotateX(-90deg)] origin-bottom transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:[transform:rotateX(0deg)] shadow-2xl overflow-hidden">
                                            <div className="relative z-10 px-4">
                                                <h4 className="text-white text-xl font-extrabold tracking-wide mb-0">CVEEZY</h4>
                                                <p className="text-white/90 text-xs tracking-widest mb-3">BY CERTICODE</p>
                                                <p className="text-white/90 text-sm leading-tight max-w-xs mx-auto">Build polished, ATS‑friendly resumes in minutes with AI guidance and modern templates.</p>
                                            </div>
                                        </div>
                                        <span className="pointer-events-none absolute -inset-24 rotate-[18deg] bg-gradient-to-r from-white/0 via-white/35 to-white/0 opacity-0 -translate-x-[120%] group-hover:opacity-60 group-hover:translate-x-[120%] transition-all duration-700"></span>
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
