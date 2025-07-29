import React, { useState } from "react";
import { Link, Head, router } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

// Template list
const templates: number[] = [1, 2, 3, 4, 5, 6];

// Template image map
const templateImages: Record<number, string> = {
  1: "/images/templates/template1.png",
  2: "/images/templates/template2.png",
  3: "/images/templates/template3.jpg",
  4: "/images/templates/template4.jpg",
  5: "/images/templates/template5.jpg",
  6: "/images/templates/template6.jpg",
};

// Card size constants (change these to resize cards)
const CARD_WIDTH = 480;
const CARD_HEIGHT = 640;
const IMAGE_WIDTH = CARD_WIDTH - 40;
const IMAGE_HEIGHT = CARD_HEIGHT - 70;

const ChooseTemplate: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<"all" | "favorite">("all");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (templateId: number) => {
    setFavorites((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const visibleTemplates = currentTab === "all" ? templates : favorites;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Head title="CVeezy | Choose Resume Template" />

      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Logo
            size="sm"
            text="CVeezy"
            imageSrc="/images/supsoft-logo.jpg"
            imageAlt="CVeezy Logo"
            className="text-2xl font-bold text-[#222] font-sans hover:scale-110 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="border border-[#2196f3] text-[#2196f3] font-semibold px-6 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
          >
            Contact us
          </Link>
          <Link
            href="/login"
            className="bg-[#2196f3] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1976d2] transition"
          >
            Login
          </Link>
        </div>
      </header>

      <Link
        href="/dashboard"
        className="mt-8 ml-10 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>

      {/* Headline and Description */}
      <div className="flex flex-col items-center text-center mt-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2B2D42] mb-2">
          {currentTab === "all"
            ? "Job-winning templates for you"
            : "Your favorite templates"}
        </h2>
        <p className="text-lg text-[#4A4A4A]">
          {currentTab === "all"
            ? "Simple to use and ready in minutes resume templates — give it a try for free now!"
            : "These templates bring out the best in you!"}
        </p>
        {currentTab === "all" && (
          <button
            type="button"
            className="mt-2 text-[#2196f3] text-sm underline hover:text-[#1976d2]"
            onClick={() => router.visit("/")}
          >
            Choose later
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-8 mt-12 text-base">
        <button
          onClick={() => setCurrentTab("all")}
          className={`pb-1 px-2 font-semibold transition border-b-2 ${
            currentTab === "all"
              ? "border-[#2196f3] text-[#2196f3]"
              : "border-transparent text-gray-500"
          }`}
        >
          All Templates
        </button>
        <button
          onClick={() => setCurrentTab("favorite")}
          className={`pb-1 px-2 font-semibold transition border-b-2 ${
            currentTab === "favorite"
              ? "border-[#2196f3] text-[#2196f3]"
              : "border-transparent text-gray-500"
          }`}
        >
          Favorite Templates
        </button>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20 px-20 py-12 place-items-center">
        {visibleTemplates.length === 0 ? (
          <p className="text-lg text-gray-400 mt-8 col-span-full">
            {currentTab === "favorite"
              ? "You have no favorite templates yet."
              : "No templates found."}
          </p>
        ) : (
          visibleTemplates.map((num) => (
            <div
              key={num}
              onClick={() => router.visit("/choose-resume-maker")}
              className="relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer shadow hover:shadow-lg transition-transform duration-200 hover:scale-105 group"
              style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}
            >
              <img
                src={templateImages[num]}
                alt={`Template ${num}`}
                className="object-cover rounded-md mb-2"
                style={{ width: `${IMAGE_WIDTH}px`, height: `${IMAGE_HEIGHT}px`, marginTop: "20px" }}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-opacity-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="bg-[#2196f3] text-white px-4 py-2 rounded font-semibold text-sm shadow hover:bg-[#3073aa]">
                  Use This Template
                </span>
              </div>

              {/* Favorite Icon */}
              <span
                onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                  e.stopPropagation();
                  toggleFavorite(num);
                }}
                className={`absolute top-2 right-2 text-2xl select-none transition-colors z-10 ${
                  favorites.includes(num) ? "text-red-500" : "text-gray-300"
                }`}
                role="button"
                aria-label={favorites.includes(num) ? "Remove from favorites" : "Add to favorites"}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFavorite(num);
                  }
                }}
              >
                ♥
              </span>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ChooseTemplate;
