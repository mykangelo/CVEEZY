import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Logo from './Logo';
import Dropdown from '@/Components/Dropdown';

interface HeaderProps {
  showDropdown?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showDropdown = false }) => {
  const user = usePage().props.auth.user;

  return (
    <header className="w-full bg-white flex items-center justify-between h-14 px-6 shadow-sm">
      <div className="flex items-center">
        <Link href={route('home')} aria-label="Go to homepage" className="inline-flex items-center">
          <Logo 
            size="sm"
            showText={false}
            className="text-2xl font-bold text-[#222] font-sans hover:scale-105 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
          />
        </Link>
      </div>
      
      {showDropdown && (
        <div className="flex items-center">
          <div className="relative">
            <Dropdown>
              <Dropdown.Trigger>
                <span className="inline-flex rounded-md">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                  >
                    {user.name}

                    <svg
                      className="-me-0.5 ms-2 h-4 w-4"
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

              <Dropdown.Content contentClasses="py-2 bg-white">
                <Dropdown.Link href={route('profile.edit')} className="px-4 py-2">
                  Profile Settings
                </Dropdown.Link>
                <div className="mx-4 my-2 h-px bg-gray-200"></div>
                <Dropdown.Link href={route('logout')} method="post" as="button" className="px-4 py-2">
                  Log Out
                </Dropdown.Link>
              </Dropdown.Content>
            </Dropdown>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
