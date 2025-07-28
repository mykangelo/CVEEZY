import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gray-100 text-sm text-gray-600 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-center md:text-left">
        © 2025. TSFF Holdings Limited, Limassol, Cyprus. All rights reserved.
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <a href="#" className="hover:underline">Terms & Conditions</a>
        <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
        <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
        <a href="/contact" className="hover:underline">Contact us</a>
      </div>
    </div>
  </footer>
);

export default Footer; 