import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        {/* Background overlay */}
                        <motion.div 
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"
                            onClick={onClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        ></motion.div>

                        {/* Modal content */}
                        <motion.div 
                            className="relative transform overflow-hidden rounded-3xl bg-white px-8 pb-8 pt-8 text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-4xl sm:p-8 border-2 border-[#354eab]/30"
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50 }}
                            transition={{ 
                                duration: 0.4,
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                        >
                    {/* Close button */}
                    <div className="absolute right-4 top-4 z-10">
                        <button
                            type="button"
                            className="rounded-full p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-offset-2 hover:scale-110"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Title and Price Section */}
                    <div className="mb-6 text-center relative z-10">
                        <div className="flex items-center justify-center space-x-4">
                            <h2 className="text-3xl font-bold text-[#354eab]">
                                Interview Preparation Guide
                            </h2>
                            <div className="bg-[#354eab]/10 text-[#354eab] px-4 py-2 rounded-xl border-2 border-[#354eab]/30 shadow-md">
                                <span className="text-lg font-bold">₱1,000</span>
                                <span className="text-sm ml-1 opacity-80">/ guide</span>
                            </div>
                        </div>
                    </div>

                    {/* Plan Description */}
                    <div className="mb-8 text-center relative z-10">
                        <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto">
                            Master your interview skills with our comprehensive guide designed by career experts and HR professionals to help you ace every interview.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="mb-8 space-y-4 relative z-10">
                        <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] border border-gray-200">
                            <div className="w-7 h-7 bg-[#354eab] rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 text-sm font-medium">100+ common interview questions with expert answers</span>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] border border-gray-200">
                            <div className="w-7 h-7 bg-[#354eab] rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 text-sm font-medium">Behavioral interview techniques and STAR method</span>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] border border-gray-200">
                            <div className="w-7 h-7 bg-[#354eab] rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 text-sm font-medium">Industry-specific interview strategies</span>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] border border-gray-200">
                            <div className="w-7 h-7 bg-[#354eab] rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 text-sm font-medium">Salary negotiation tips and templates</span>
                        </div>
                        <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] border border-gray-200">
                            <div className="w-7 h-7 bg-[#354eab] rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 text-sm font-medium">Instant digital access after purchase</span>
                        </div>
                    </div>

                    {/* Call to Action Button */}
                    <div className="text-center relative z-10">
                        <button
                            onClick={handleGetGuide}
                            className="w-full bg-[#354eab] text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-[#2d3f8f] transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#354eab]/20 shadow-xl hover:shadow-2xl border-2 border-[#354eab]/20"
                        >
                            Get the Guide
                        </button>
                    </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}