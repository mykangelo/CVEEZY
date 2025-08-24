import Logo from '@/Components/Logo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-[#f4faff]">
            <nav className="border-b border-[#e3f2fd] bg-white shadow-lg">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between items-center">
                        {/* Left Section - Logo and Page Header */}
                        <div className="flex items-center space-x-8">
                            {/* Logo */}
                            <div className="flex shrink-0 items-center">
                                <Link href={route('home')} className="inline-flex items-center cursor-pointer group" aria-label="Go to homepage">
                                    <Logo 
                                        size="sm"
                                        text="CVeezy"
                                        imageSrc="/images/cveezyLOGO_C.png"
                                        imageAlt="CVeezy Logo"
                                        className="text-2xl font-bold text-gray-800 font-sans group-hover:scale-105 group-hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-offset-2 rounded-lg transition-all duration-200"
                                    />
                                </Link>
                            </div>

                            {/* Page Header */}
                            {header && (
                                <div className="hidden sm:flex items-center">
                                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#bcd6f6] to-transparent mx-6" aria-hidden="true" />
                                    <div className="text-gray-900 text-xl font-semibold leading-tight truncate max-w-xs">
                                        {header}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Section - User Menu */}
                        <div className="hidden sm:flex sm:items-center">
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium leading-4 text-gray-700 transition-all duration-200 ease-in-out hover:border-[#354eab] hover:bg-[#f8faff] hover:text-[#354eab] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-offset-2"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {/* User Avatar Placeholder */}
                                                    <div className="w-7 h-7 bg-gradient-to-br from-[#354eab] to-[#4a5fc7] rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    
                                                    <span className="font-semibold">{user.name}</span>
                                                </div>

                                                <svg
                                                    className="ml-3 h-4 w-4 text-gray-500 transition-transform duration-200 group-hover:text-[#354eab]"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        {/* Dashboard Link */}
                                        {user.is_admin ? (
                                            <Dropdown.Link
                                                href={route('admin.dashboard')}
                                                className="flex items-center px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#f8faff] hover:to-[#e8f2ff] transition-all duration-200 group"
                                            >
                                                <span className="font-semibold text-gray-900 group-hover:text-[#354eab] transition-colors duration-200">Admin Dashboard</span>
                                            </Dropdown.Link>
                                        ) : (
                                            <Dropdown.Link
                                                href={route('dashboard')}
                                                className="flex items-center px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#f8faff] hover:to-[#e8f2ff] transition-all duration-200 group"
                                            >
                                                <span className="font-semibold text-gray-900 group-hover:text-[#354eab] transition-colors duration-200">Dashboard</span>
                                            </Dropdown.Link>
                                        )}

                                        {/* Enhanced Divider */}
                                        <div className="mx-5 my-3">
                                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                        </div>

                                        {/* Enhanced Logout Link */}
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center px-5 py-3.5 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group mx-2 rounded-lg"
                                        >
                                            <span className="font-semibold text-red-600 group-hover:text-red-700 transition-colors duration-200">Log Out</span>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-3 text-gray-500 transition-all duration-200 ease-in-out hover:bg-[#f8faff] hover:text-[#354eab] focus:bg-[#f8faff] focus:text-[#354eab] focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-offset-2"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 px-4">
                        {/* Dashboard Link */}
                        {user.is_admin ? (
                            <ResponsiveNavLink
                                href={route('admin.dashboard')}
                                active={route().current('admin.dashboard')}
                                className="px-4 py-3.5 rounded-xl flex items-center hover:bg-gradient-to-r hover:from-[#f8faff] hover:to-[#e8f2ff] transition-all duration-200 group"
                            >
                                <span className="font-semibold text-gray-900 group-hover:text-[#354eab] transition-colors duration-200">Admin Dashboard</span>
                            </ResponsiveNavLink>
                        ) : (
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                                className="px-4 py-3.5 rounded-xl flex items-center hover:bg-gradient-to-r hover:from-[#f8faff] hover:to-[#e8f2ff] transition-all duration-200 group"
                            >
                                <span className="font-semibold text-gray-900 group-hover:text-[#354eab] transition-colors duration-200">Dashboard</span>
                            </ResponsiveNavLink>
                        )}

                        {/* Enhanced Divider */}
                        <div className="mx-2 my-3">
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        </div>

                        {/* Enhanced Logout Link */}
                        <ResponsiveNavLink
                            method="post"
                            href={route('logout')}
                            as="button"
                            className="px-4 py-3.5 rounded-xl flex items-center text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                        >
                            <span className="font-semibold group-hover:text-red-700 transition-colors duration-200">Log Out</span>
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
