/**
 * Tests for Classic resume component
 *
 * Framework/Libraries:
 * - React Testing Library with Jest/Vitest matchers (jest-dom)
 *
 * These tests assert conditional rendering and content formatting behavior:
 * - Contact section shown only when any contact info is present
 * - Location info formatting and separators with email/phone
 * - Summary rendering
 * - Skills rendering including experience-level bullets when showExperienceLevel is true
 * - Experiences, Education, Hobbies, Websites, References sections
 * - Additional Information: Languages, Certifications, Awards subsections
 * - Custom Sections rendering
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Classic from "../Classic";

type ResumeData = Parameters<typeof Classic>[0]["resumeData"];

function buildResumeData(overrides: Partial<ResumeData> = {}): ResumeData {
  const base: ResumeData = {
    contact: {
      firstName: "",
      lastName: "",
      desiredJobTitle: "",
      address: "",
      city: "",
      country: "",
      postCode: "",
      email: "",
      phone: "",
    },
    summary: "",
    skills: [],
    experiences: [],
    education: [],
    languages: [],
    certifications: [],
    awards: [],
    websites: [],
    references: [],
    hobbies: [],
    customSections: [],
    showExperienceLevel: false,
  } as unknown as ResumeData;

  return { ...base, ...overrides };
}

describe("Classic resume component", () => {
  describe("Contact section", () => {
    test("does not render contact section when all contact fields are empty", () => {
      const data = buildResumeData();
      render(<Classic resumeData={data} />);
      // Name heading should not be present
      expect(
        screen.queryByRole("heading", { level: 2 })
      ).not.toBeInTheDocument();
    });

    test("renders name when firstName or lastName exists", () => {
      const data = buildResumeData({
        contact: {
          firstName: "Ada",
          lastName: "Lovelace",
          desiredJobTitle: "",
          address: "",
          city: "",
          country: "",
          postCode: "",
          email: "",
          phone: "",
        } as any,
      });
      render(<Classic resumeData={data} />);
      expect(
        screen.getByRole("heading", { name: /ada lovelace/i, level: 2 })
      ).toBeInTheDocument();
    });

    test("renders desired job title when provided", () => {
      const data = buildResumeData({
        contact: {
          firstName: "Ada",
          lastName: "Lovelace",
          desiredJobTitle: "Software Engineer",
          address: "",
          city: "",
          country: "",
          postCode: "",
          email: "",
          phone: "",
        } as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    });

    test("renders location info as comma-separated and separators before email/phone", () => {
      const data = buildResumeData({
        contact: {
          firstName: "Ada",
          lastName: "Lovelace",
          desiredJobTitle: "",
          address: "123 Main St",
          city: "London",
          country: "UK",
          postCode: "NW1",
          email: "ada@example.com",
          phone: "+44 123456",
        } as any,
      });
      render(<Classic resumeData={data} />);
      // Location
      expect(
        screen.getByText("123 Main St, London, UK, NW1")
      ).toBeInTheDocument();
      // Email and phone visible
      expect(screen.getByText("ada@example.com")).toBeInTheDocument();
      expect(screen.getByText("+44 123456")).toBeInTheDocument();
      // The separators are spans with text "|", which will be present twice (between location/email and email/phone)
      const separators = screen.getAllByText("|");
      expect(separators.length).toBe(2);
    });

    test("renders only email without extra separators when no location info", () => {
      const data = buildResumeData({
        contact: {
          firstName: "Ada",
          lastName: "Lovelace",
          desiredJobTitle: "",
          address: "",
          city: "",
          country: "",
          postCode: "",
          email: "ada@example.com",
          phone: "",
        } as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("ada@example.com")).toBeInTheDocument();
      // No pipes rendered because there's no location and no phone
      expect(screen.queryByText("|")).not.toBeInTheDocument();
    });
  });

  describe("Summary", () => {
    test("renders summary text when provided", () => {
      const data = buildResumeData({ summary: "Seasoned developer\nWith a focus on quality." as any });
      render(<Classic resumeData={data} />);
      expect(
        screen.getByText(/seasoned developer/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/focus on quality/i)).toBeInTheDocument();
    });

    test("does not render summary container when summary is empty", () => {
      const data = buildResumeData({ summary: "" as any });
      render(<Classic resumeData={data} />);
      // We can't directly target container, but the summary text shouldn't exist.
      expect(
        screen.queryByText(/.+/, { selector: "p.text-sm.text-gray-800.whitespace-pre-line.-mt-2" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Skills", () => {
    test("renders skill names", () => {
      const data = buildResumeData({
        skills: [
          { name: "JavaScript", level: "Expert" },
          { name: "React", level: "Experienced" },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("AREA OF EXPERTISE")).toBeInTheDocument();
      expect(screen.getByText("JavaScript")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    test("renders 5 bullet dots with correct number filled based on level when showExperienceLevel is true", () => {
      const data = buildResumeData({
        showExperienceLevel: true,
        skills: [{ name: "JavaScript", level: "Expert" }] as any,
      });
      const { container } = render(<Classic resumeData={data} />);
      // Expect 5 dots to exist; filled dots have class 'bg-black', unfilled 'bg-gray-300'
      const bullets = container.querySelectorAll("div.flex.items-center.gap-0\\.5 > div");
      expect(bullets.length).toBe(5);
      const filled = Array.from(bullets).filter((b) =>
        b.className.includes("bg-black")
      );
      const unfilled = Array.from(bullets).filter((b) =>
        b.className.includes("bg-gray-300")
      );
      expect(filled.length).toBe(5);
      expect(unfilled.length).toBe(0);
    });

    test("defaults to 1 filled dot with invalid/unknown level", () => {
      const data = buildResumeData({
        showExperienceLevel: true,
        skills: [{ name: "TS", level: "Unknown" }] as any,
      });
      const { container } = render(<Classic resumeData={data} />);
      const bullets = container.querySelectorAll("div.flex.items-center.gap-0\\.5 > div");
      const filled = Array.from(bullets).filter((b) =>
        b.className.includes("bg-black")
      );
      const unfilled = Array.from(bullets).filter((b) =>
        b.className.includes("bg-gray-300")
      );
      expect(filled.length).toBe(1);
      expect(unfilled.length).toBe(4);
    });

    test("does not render bullets when showExperienceLevel is false or name is empty", () => {
      // showExperienceLevel false
      const data1 = buildResumeData({
        showExperienceLevel: false,
        skills: [{ name: "Go", level: "Experienced" }] as any,
      });
      const { container: c1 } = render(<Classic resumeData={data1} />);
      expect(
        c1.querySelector("div.flex.items-center.gap-0\\.5")
      ).not.toBeInTheDocument();

      // Empty name => trim() false
      const data2 = buildResumeData({
        showExperienceLevel: true,
        skills: [{ name: "   ", level: "Experienced" }] as any,
      });
      const { container: c2 } = render(<Classic resumeData={data2} />);
      expect(
        c2.querySelector("div.flex.items-center.gap-0\\.5")
      ).not.toBeInTheDocument();
    });
  });

  describe("Experiences", () => {
    test("renders experience entries with job title, dates, company, location, and optional description", () => {
      const data = buildResumeData({
        experiences: [
          {
            id: "e1",
            jobTitle: "Senior Dev",
            startDate: "Jan 2020",
            endDate: "Dec 2022",
            company: "Tech Co",
            location: "Remote",
            description: "Built APIs",
          },
          {
            id: "e2",
            jobTitle: "Engineer",
            startDate: "Jan 2019",
            endDate: "Dec 2019",
            company: "Other Co",
            location: "NYC",
            description: "",
          },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("PROFESSIONAL EXPERIENCE")).toBeInTheDocument();
      expect(screen.getByText("Senior Dev")).toBeInTheDocument();
      expect(screen.getByText("Jan 2020 - Dec 2022")).toBeInTheDocument();
      expect(screen.getByText(/Tech Co — Remote/)).toBeInTheDocument();
      expect(screen.getByText("Built APIs")).toBeInTheDocument();

      expect(screen.getByText("Engineer")).toBeInTheDocument();
      expect(screen.getByText("Jan 2019 - Dec 2019")).toBeInTheDocument();
      expect(screen.getByText(/Other Co — NYC/)).toBeInTheDocument();
      // No description list item for the second
      expect(screen.queryByText((_, el) => el?.tagName === "LI" && el.textContent === "")).not.toBeInTheDocument();
    });

    test("does not render section when no experiences", () => {
      const data = buildResumeData({ experiences: [] as any });
      render(<Classic resumeData={data} />);
      expect(
        screen.queryByText("PROFESSIONAL EXPERIENCE")
      ).not.toBeInTheDocument();
    });
  });

  describe("Education", () => {
    test("renders education entries and optional description", () => {
      const data = buildResumeData({
        education: [
          {
            id: "ed1",
            degree: "B.Sc. CS",
            startDate: "2015",
            endDate: "2019",
            school: "Uni",
            location: "City",
            description: "Graduated with honors",
          },
          {
            id: "ed2",
            degree: "M.Sc. CS",
            startDate: "2020",
            endDate: "2022",
            school: "Uni 2",
            location: "City 2",
          },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("EDUCATION")).toBeInTheDocument();
      expect(screen.getByText("B.Sc. CS")).toBeInTheDocument();
      expect(screen.getByText("2015 - 2019")).toBeInTheDocument();
      expect(screen.getByText(/Uni — City/)).toBeInTheDocument();
      expect(screen.getByText("Graduated with honors")).toBeInTheDocument();

      expect(screen.getByText("M.Sc. CS")).toBeInTheDocument();
      expect(screen.getByText("2020 - 2022")).toBeInTheDocument();
      expect(screen.getByText(/Uni 2 — City 2/)).toBeInTheDocument();
      // No blank description LI
      expect(screen.queryByText((_, el) => el?.tagName === "LI" && el.textContent === "")).not.toBeInTheDocument();
    });

    test("does not render section when no education entries", () => {
      const data = buildResumeData({ education: [] as any });
      render(<Classic resumeData={data} />);
      expect(screen.queryByText("EDUCATION")).not.toBeInTheDocument();
    });
  });

  describe("Hobbies", () => {
    test("renders hobbies list", () => {
      const data = buildResumeData({
        hobbies: [
          { id: "h1", name: "Reading" },
          { id: "h2", name: "Hiking" },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("HOBBIES")).toBeInTheDocument();
      expect(screen.getByText("Reading")).toBeInTheDocument();
      expect(screen.getByText("Hiking")).toBeInTheDocument();
    });

    test("does not render section when no hobbies", () => {
      const data = buildResumeData({ hobbies: [] as any });
      render(<Classic resumeData={data} />);
      expect(screen.queryByText("HOBBIES")).not.toBeInTheDocument();
    });
  });

  describe("Websites", () => {
    test("renders websites as links with label and URL", () => {
      const data = buildResumeData({
        websites: [
          { id: "w1", label: "GitHub", url: "https://github.com/ada" },
          { id: "w2", label: "Portfolio", url: "https://ada.dev" },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("WEBSITES")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "https://github.com/ada" })).toHaveAttribute(
        "href",
        "https://github.com/ada"
      );
      expect(screen.getByText(/GitHub:/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "https://ada.dev" })).toHaveAttribute(
        "href",
        "https://ada.dev"
      );
    });

    test("does not render section when no websites", () => {
      const data = buildResumeData({ websites: [] as any });
      render(<Classic resumeData={data} />);
      expect(screen.queryByText("WEBSITES")).not.toBeInTheDocument();
    });
  });

  describe("References", () => {
    test("renders references with optional relationship and contactInfo", () => {
      const data = buildResumeData({
        references: [
          {
            id: "r1",
            name: "Grace Hopper",
            relationship: "Manager",
            contactInfo: "grace@example.com",
          },
          { id: "r2", name: "Alan Turing" }, // No optional fields
        ] as any,
      });
      render(<Classic resumeData={data} />);

      expect(screen.getByText("REFERENCES")).toBeInTheDocument();
      expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
      expect(screen.getByText(/Manager/)).toBeInTheDocument();
      expect(screen.getByText(/grace@example.com/)).toBeInTheDocument();

      expect(screen.getByText("Alan Turing")).toBeInTheDocument();
      // Ensure no accidental '—' or '|' when fields are missing
      // Note: The component concatenates strings; this is a heuristic check
      const alanItem = screen.getByText("Alan Turing").closest("li");
      expect(alanItem?.textContent).toBe("Alan Turing");
    });

    test("does not render section when no references", () => {
      const data = buildResumeData({ references: [] as any });
      render(<Classic resumeData={data} />);
      expect(screen.queryByText("REFERENCES")).not.toBeInTheDocument();
    });
  });

  describe("Additional Information", () => {
    test("renders languages list with proficiency and commas", () => {
      const data = buildResumeData({
        languages: [
          { id: "l1", name: "English", proficiency: "Native" },
          { id: "l2", name: "Spanish", proficiency: "" },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("ADDITIONAL INFORMATION")).toBeInTheDocument();
      expect(screen.getByText(/Languages:/)).toBeInTheDocument();
      expect(screen.getByText(/English – Native, Spanish/)).toBeInTheDocument();
    });

    test("renders certifications and awards lists with proper comma separation", () => {
      const data = buildResumeData({
        certifications: [
          { id: "c1", title: "AWS Certified" },
          { id: "c2", title: "GCP Certified" },
        ] as any,
        awards: [
          { id: "a1", title: "Employee of the Year" },
          { id: "a2", title: "Top Innovator" },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("ADDITIONAL INFORMATION")).toBeInTheDocument();
      expect(screen.getByText(/Certification:/)).toBeInTheDocument();
      expect(screen.getByText(/AWS Certified, GCP Certified/)).toBeInTheDocument();
      expect(screen.getByText(/Awards:/)).toBeInTheDocument();
      expect(screen.getByText(/Employee of the Year, Top Innovator/)).toBeInTheDocument();
    });

    test("does not render Additional Information heading when languages/certifications/awards are all empty", () => {
      const data = buildResumeData({
        languages: [] as any,
        certifications: [] as any,
        awards: [] as any,
      });
      render(<Classic resumeData={data} />);
      expect(
        screen.queryByText("ADDITIONAL INFORMATION")
      ).not.toBeInTheDocument();
    });
  });

  describe("Custom Sections", () => {
    test("renders multiple custom sections with title and content", () => {
      const data = buildResumeData({
        customSections: [
          { id: "cs1", title: "Volunteer Work", content: "Food bank helper" },
          { id: "cs2", title: "Open Source", content: "Maintainer of X" },
        ] as any,
      });
      render(<Classic resumeData={data} />);
      expect(screen.getByText("Volunteer Work")).toBeInTheDocument();
      expect(screen.getByText("Food bank helper")).toBeInTheDocument();
      expect(screen.getByText("Open Source")).toBeInTheDocument();
      expect(screen.getByText("Maintainer of X")).toBeInTheDocument();
    });

    test("does not render when empty", () => {
      const data = buildResumeData({ customSections: [] as any });
      render(<Classic resumeData={data} />);
      // No specific heading to check, ensure not crashing and no obvious content
      expect(screen.queryByText("Volunteer Work")).not.toBeInTheDocument();
    });
  });
});