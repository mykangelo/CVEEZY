import React from 'react';
import Logo from './Logo';

const Header: React.FC = () => (
  <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm mb-10">
    <div className="flex items-center">
      <Logo 
            size="sm"
            text="CVeezy"
            imageSrc="/images/supsoft-logo.jpg"
            imageAlt="CVeezy Logo"
            className="text-2xl font-bold text-[#222] font-sans hover:scale-110 hover:drop-shadow-lg  focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
          />
    </div>
  </header>
);

export default Header;
