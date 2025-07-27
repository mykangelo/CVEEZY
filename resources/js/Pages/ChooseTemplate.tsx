import React, { useState } from "react";
import { Link, Head, router } from "@inertiajs/react";
import Footer from "@/Components/Footer";

const templates: number[] = [1, 2, 3, 4, 5];

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
        <div className="flex items-center">
          <img
            src="/images/bettercv-logo.png"
            alt="CVeezy Logo"
            className="h-8 w-8 mr-3"
          />
          <Link href="/" className="text-2xl font-bold text-[#222] font-sans hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition">
            CVeezy
          </Link>
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
      <div className="flex justify-center flex-wrap gap-6 px-4 py-12 flex-grow">
        {visibleTemplates.length === 0 ? (
          <p className="text-lg text-gray-400 mt-8">
            {currentTab === "favorite"
              ? "You have no favorite templates yet."
              : "No templates found."}
          </p>
        ) : (
          visibleTemplates.map((num) => (
            <div
              key={num}
              onClick={() => router.visit("/choose-resume-maker")}
              className="relative w-44 h-60 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center font-medium cursor-pointer shadow hover:shadow-lg transition-transform duration-200 hover:scale-105"
            >
              {/* Placeholder for template preview */}
              <div className="w-36 h-44 bg-[#f4faff] rounded-md mb-2 flex items-center justify-center text-2xl text-gray-400">
                Template {num}
              </div>
              {/* Heart Icon */}
              <span
                onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                  e.stopPropagation();
                  toggleFavorite(num);
                }}
                className={`absolute top-2 right-2 text-xl select-none transition-colors ${
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