import React, { useState } from 'react';
import { Transition } from '@headlessui/react';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface TabbedLayoutProps {
    tabs: Tab[];
    defaultTab?: string;
    className?: string;
}

export default function TabbedLayout({ tabs, defaultTab, className = '' }: TabbedLayoutProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    const indicatorPosition = activeTabIndex >= 0 ? activeTabIndex * 130 : 0;

    return (
        <div className={`w-full ${className}`}>
            {/* Tab Container - Centered and Proper Size */}
            <div className="flex justify-center mb-10">
                <div className="relative flex flex-row items-start p-0.5 bg-gray-200 rounded-lg shadow-lg">
                    {/* Indicator - Website Primary Color with Enhanced Gradient */}
                    <div 
                        className="absolute bg-gradient-to-br from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] border border-[#354eab] shadow-lg rounded-md transition-all duration-400 ease-out z-10"
                        style={{ 
                            width: '130px',
                            height: '28px',
                            left: `${indicatorPosition + 2}px` 
                        }}
                    />
                    
                    {/* Tab Labels - Proper Size and Fitting */}
                    {tabs.map((tab, index) => (
                        <div key={tab.id} className="relative z-20">
                            <input
                                type="radio"
                                name="profile-tab"
                                id={tab.id}
                                className="absolute opacity-0 cursor-pointer"
                                style={{ width: '130px', height: '28px' }}
                                checked={activeTab === tab.id}
                                onChange={() => setActiveTab(tab.id)}
                            />
                            <label
                                htmlFor={tab.id}
                                className={`flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-300 ${
                                    activeTab === tab.id 
                                        ? 'text-white' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                style={{ width: '130px', height: '28px' }}
                            >
                                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                                {tab.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tab Content - Better Spacing with Slower Transitions */}
            <div className="min-h-[600px] px-4">
                {tabs.map((tab) => (
                    <div key={tab.id} className="w-full">
                        <Transition
                            show={activeTab === tab.id}
                            enter="transition ease-out duration-500"
                            enterFrom="opacity-0 transform translate-y-6"
                            enterTo="opacity-100 transform translate-y-0"
                            leave="transition ease-in duration-400"
                            leaveFrom="opacity-100 transform translate-y-0"
                            leaveTo="opacity-0 transform translate-y-6"
                        >
                            <div className="w-full">
                                {tab.content}
                            </div>
                        </Transition>
                    </div>
                ))}
            </div>
        </div>
    );
}
