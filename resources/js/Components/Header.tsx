import React from 'react';
import { Link } from '@inertiajs/react';

const Header: React.FC = () => (
  <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
    <div className="flex items-center">
      {/* Logo placeholder */}
      <div className="h-8 w-8 mr-3 bg-gray-300 rounded flex items-center justify-center">
        <span className="text-xs text-gray-500">Logo</span>
      </div>
      <Link href="/" className="text-2xl font-bold text-[#222] font-sans hover:text-[#2196f3] transition-colors">
        CVeezy
      </Link>
    </div>
  </header>
);

export default Header; 