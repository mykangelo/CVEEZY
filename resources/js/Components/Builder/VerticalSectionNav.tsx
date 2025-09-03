import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';

type Section = {
  id: string;
  label: string;
  icon: React.ReactNode;
  isCompleted: boolean;
};

interface VerticalSectionNavProps {
  currentSection: string;
  sections: Section[];
  onSectionChange: (sectionId: string) => void;
}

export const VerticalSectionNav: React.FC<VerticalSectionNavProps> = ({
  currentSection,
  sections,
  onSectionChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const NavList = (
    <LayoutGroup id="sidebar-nav">
    <nav className="flex-1 py-3">
      <div className="px-2 h-full flex flex-col">
        {sections.map((section) => {
          const isActive = currentSection === section.id;
          return (
            <div key={`wrap-${section.id}`} className="flex-1 flex items-center justify-center">
            <button
              key={section.id}
              onClick={() => {
                onSectionChange(section.id);
                setIsOpen(false);
              }}
              aria-current={isActive ? 'page' : undefined}
              title={section.label}
              className={`relative w-full flex items-center justify-center px-2 py-1.5 rounded-xl transition-all group
                ${isActive ? 'bg-transparent' : 'text-white/85 hover:text-white'}
              `}
            >
              <motion.span
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center justify-center rounded-full w-12 h-12 md:w-14 md:h-14 transition-all
                ${isActive ? 'text-[#354eab]' : 'text-white/85 group-hover:text-white'}
              `}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-circle"
                    className="absolute inset-0 m-1 md:m-1.5 rounded-full bg-white shadow-md"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <span className="w-6 h-6 md:w-7 md:h-7 relative z-10">{section.icon}</span>
              </motion.span>
              <span className="sr-only">{section.label}</span>
            </button>
            </div>
          );
        })}
      </div>
    </nav>
    </LayoutGroup>
  );

  return (
    <>
      {/* Mobile: toggle button */}
      <div className="md:hidden p-3">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-700 text-white shadow hover:bg-blue-800 active:scale-[0.98] transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Sections
        </button>
      </div>

      {/* Desktop Sidebar - icon only, fixed width to avoid layout shifts */}
      <aside className="hidden md:flex flex-col items-center w-17 flex-none shrink-0 bg-[#354eab] text-white border-r border-white/10 rounded-l-3xl m-0 shadow-2xl overflow-hidden h-full">
        {NavList}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#0b2a4a] text-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-base font-semibold">Sections</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10"
              >
                Close
              </button>
            </div>
            {NavList}
          </div>
        </div>
      )}
    </>
  );
};

export default VerticalSectionNav;


