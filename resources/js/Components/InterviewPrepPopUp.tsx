import { useState } from "react";

interface InterviewPrepPopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InterviewPrepPopUp({ isOpen, onClose }: InterviewPrepPopUpProps) {
    if (!isOpen) return null;

    const handleGetGuide = () => {
        // Implement your guide purchase/download logic here
        console.log('Getting interview guide');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-auto relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 w-8 h-8 flex items-center justify-center"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="px-7 py-5">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <h2 className="text-[32px] font-bold text-[#2E404A] mb-4 leading-tight font-['Roboto_Serif']">
                            Land Your Dream Job with Our Ultimate<br />
                            <span className="bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent">
                                Interview Guide
                            </span>
                            !
                        </h2>


                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <span className="text-gray-700">
                                More than <span className="border border-blue-600 text-blue-600 px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    100,000
                                </span> job seekers have nailed their interviews using our all-in-one guide.
                            </span>
                        </div>
                        <p className="text-gray-700 font-medium">
                            Get everything you need to pass with confidence and secure the job you desire!
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Left side - Features */}
                        <div className="flex-1">
                            {/* Price badge */}
                            <div className="inline-block bg-pink-100 text-pink-600 px-4 py-2 rounded-full mb-4">
                                <span className="text-lg font-bold">For only $8.95</span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <img 
                                        src="/images/Star.jpg" 
                                        alt="Star" 
                                        className="flex-shrink-0 w-6 h-6 rounded-full"
                                    />
                                    <p className="text-gray-700 leading-relaxed">
                                        Get answers to over <span className="font-semibold">100 common interview questions</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <img 
                                        src="/images/Star.jpg" 
                                        alt="Star" 
                                        className="flex-shrink-0 w-6 h-6 rounded-full"
                                    />
                                    <p className="text-gray-700 leading-relaxed">
                                        Improve your <span className="font-semibold">soft skills</span> and avoid common mistakes
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <img 
                                        src="/images/Star.jpg" 
                                        alt="Star" 
                                        className="flex-shrink-0 w-6 h-6 rounded-full"
                                    />
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold">Save time</span> with a quick and easy preparation plan
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <img 
                                        src="/images/Star.jpg" 
                                        alt="Star" 
                                        className="flex-shrink-0 w-6 h-6 rounded-full"
                                    />
                                    <p className="text-gray-700 leading-relaxed">
                                        Feel <span className="font-semibold">confident</span> and <span className="font-semibold">stress-free</span> for your interview
                                    </p>
                                </div>
                            </div>

                            {/* Get Guide Button */}
                            <button
                                onClick={handleGetGuide}
                                className="w-full bg-[#354eab] hover:bg-[#4a5fc7] text-white font-bold py-3 px-6 rounded-2xl transition-colors duration-200 text-lg mt-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Get the Guide Now
                            </button>
                        </div>

                        {/* Right side - Illustration */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <img 
                                    src="/images/InterviewPrep.jpg" 
                                    alt="Interview preparation illustration" 
                                    className="w-full h-auto rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}