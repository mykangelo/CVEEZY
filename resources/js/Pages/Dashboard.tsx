import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Resume } from "@/types/resume";
import Logo from "@/Components/Logo";
import Dropdown from "@/Components/Dropdown";

interface DashboardProps {
    resumes?: Resume[];
}

export default function Dashboard({ resumes = [] }: DashboardProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    // Mock data for demonstration (replace with real data from backend)
    const mockResumes: Resume[] = resumes.length > 0 ? resumes : [
        {
            id: 1,
            name: "Resume_1",
            creation_date: "17.07.2025",
            updated_at: "2025-07-17T00:00:00Z",
            status: "completed",
            user_id: user?.id || 1
        }
    ];

    const [selectedResumes, setSelectedResumes] = useState<number[]>([]);

    const handleSelectResume = (resumeId: number) => {
        setSelectedResumes(prev => 
            prev.includes(resumeId) 
                ? prev.filter(id => id !== resumeId)
                : [...prev, resumeId]
        );
    };

    const handleDeleteSelected = () => {
        if (selectedResumes.length === 0) return;
        
        // Implement delete functionality
        console.log("Deleting resumes:", selectedResumes);
        setSelectedResumes([]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="CVeezy - My Dashboard" />

            {/* Custom Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left: Logo */}
                        <div className="flex items-center">
                            <Logo 
                                size="sm"
                                text="CVeezy"
                                imageSrc="/images/supsoft-logo.jpg"
                                imageAlt="CVeezy Logo"
                                className="text-2xl font-bold text-[#222] font-sans hover:scale-110 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
                            />
                        </div>

                        {/* Center: Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link 
                                href="/dashboard" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Resume Review
                            </Link>
                            <Link 
                                href="/interview-preparation" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Interview Preparation
                            </Link>
                        </nav>

                        {/* Right: Message Icon + User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* Message Icon */}
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                                            <span className="font-medium">{user?.email || 'USER@EXAMPLE.COM'}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content>
                                        <Dropdown.Link href="/profile">
                                            My Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link 
                                            href="/logout" 
                                            method="post" 
                                            as="button"
                                        >
                                            Log out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Welcome Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {user?.name || 'User'}!
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Ready to build your next great resume?
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/choose-template"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create a New Resume</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* My Recent Resumes Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">My Recent Resumes</h2>
                            {selectedResumes.length > 0 && (
                                <button
                                    onClick={handleDeleteSelected}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete Selected ({selectedResumes.length})</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {mockResumes.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first professional resume.</p>
                            <Link
                                href="/choose-template"
                                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                Create Your First Resume
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedResumes.length === mockResumes.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedResumes(mockResumes.map(r => r.id));
                                                    } else {
                                                        setSelectedResumes([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Creation Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockResumes.map((resume) => (
                                        <tr key={resume.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={selectedResumes.includes(resume.id)}
                                                    onChange={() => handleSelectResume(resume.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {resume.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Template {resume.template_id || 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {resume.creation_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    resume.status === 'completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : resume.status === 'draft'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Link
                                                    href={`/builder?resume=${resume.id}`}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span>Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        // Implement download functionality
                                                        console.log('Downloading resume:', resume.id);
                                                    }}
                                                    className="text-green-600 hover:text-green-900 inline-flex items-center space-x-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Download</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Interview Guide Promotion Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-center">
                        {/* Content */}
                        <div className="flex-1 p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                Get Ready to Impress: Your <span className="text-blue-600">Interview Guide</span> is Here!
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Receive a guide created by <span className="font-semibold">top recruiters</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Learn to make an impressive <span className="font-semibold">self-introduction</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Master key <span className="font-semibold">interview techniques</span>
                                    </p>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700">
                                        Gain <span className="font-semibold">the confidence</span> to secure your dream job
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // Implement interview guide functionality
                                    console.log('Getting interview guide');
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center space-x-2"
                            >
                                <span>Get it Now</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Illustration */}
                        <div className="flex-1 lg:flex-none lg:w-80 p-8">
                            <div className="relative">
                                {/* Mock illustration - replace with actual interview guide illustration */}
                                <div className="bg-white rounded-lg shadow-lg p-6 transform rotate-3">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                        <div className="h-8 bg-blue-100 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                                <div className="absolute -top-2 -left-2 bg-yellow-300 rounded-lg shadow-lg p-4 transform -rotate-6">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold">💡</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-300 rounded-lg shadow-lg p-4 transform rotate-12">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
