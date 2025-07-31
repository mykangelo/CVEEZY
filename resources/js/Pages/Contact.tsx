import { useForm } from "@inertiajs/react";
import { Link, Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import Footer from "@/Components/Footer";
import FAQ from "./ContactsFAQ";
import Logo from "@/Components/Logo";

const supportData = [
  {
    title: "Billing support",
    description:
      "If you have any questions regarding payment, feel free to contact us:",
    phone: "+44 808 502 0312",
    email: "billing@cveezy.com",
  },
  {
    title: "Customer Help",
    description:
      "If you have any questions regarding our service, feel free to contact us:",
    phone: "+44 808 502 0312",
    email: "help@cveezy.com",
  },
  {
    title: "Our postal address",
    name: "TSFF Holdings Limited",
    address:
      "Office 51, Agias Zonis, 23, Kotsios Court A, Limassol, 3027, Cyprus",
    email: "help@cveezy.com",
  },
];

const Contact: React.FC = () => {
  const { auth } = usePage().props as any;
  const user = auth.user;
  const [submitted, setSubmitted] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/contact", {
      onSuccess: () => {
        reset();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4faff] font-sans">
      <Head title="CVeezy | Contact Us" />

      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
        <div className="flex items-center">
          <Logo 
            size="sm"
            text="CVeezy"
            imageSrc="/images/supsoft-logo.jpg"
            imageAlt="CVeezy Logo"
            className="text-2xl font-bold text-[#222] font-sans hover:scale-110 hover:drop-shadow-lg  focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
          />
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="border border-[#2196f3] text-[#2196f3] font-semibold px-6 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="border border-[#2196f3] text-[#2196f3] font-semibold px-6 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
            >
              Login
            </Link>
          )}
          <Link
            href="/choose-template"
            className="bg-[#2196f3] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1976d2] transition"
          >
            Create my resume
          </Link>
        </div>
      </header>

      {/* Contact Section */}
      <section className="bg-[#eaf6ff] flex-1 flex flex-col items-center justify-center p-8 gap-6">
        {/* Heading */}
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Contact us</h2>
          <p className="text-gray-600 text-base">
            If you need assistance with our service or have any questions,
            don't hesitate to get in touch with us.
          </p>
        </div>

        {/* Form and Illustration */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 w-full max-w-6xl mt-6">
          {/* Form */}
          <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full">
                  <label className="block text-sm text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm text-gray-700 mb-1">
                    Email address*
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Type your message here..."
                  value={data.message}
                  onChange={(e) => setData("message", e.target.value)}
                  rows={5}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {errors.message && (
                  <div className="text-red-500 text-sm mt-1">{errors.message}</div>
                )}
              </div>
              <button
                type="submit"
                disabled={processing}
                className="bg-[#2196f3] text-white w-full py-3 rounded-md font-semibold hover:bg-[#1976d2] transition"
              >
                Submit
              </button>
              {submitted && (
                <div className="text-green-600 text-center font-semibold mt-2">
                  Thank you! Your message has been submitted.
                </div>
              )}
            </form>
          </div>

          {/* Illustration */}
          <div className="hidden md:block w-full max-w-md">
            <img
              src="/images/ContactUsImg"
              alt="Contact Illustration"
              className="w-full"
              style={{ minHeight: 200 }}
            />
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="bg-[#f8fafc] w-full py-10 px-4 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl">
          {supportData.map((item, i) => (
            <div
              key={i}
              className="border border-dashed border-[#2196f3] rounded-lg p-6 bg-blue-50 space-y-4"
            >
              <div className="w-12 h-12 bg-[#2196f3] rounded-full flex items-center justify-center text-white text-xl">
                {i === 0 ? "📄" : i === 1 ? "⚙️" : "📨"}
              </div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              {item.description ? (
                <p className="text-sm text-gray-700">{item.description}</p>
              ) : (
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="font-medium">Name</span>
                    <p>{item.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Address</span>
                    <p>{item.address}</p>
                  </div>
                </div>
              )}
              {item.phone && (
                <div>
                  <p className="font-medium">Via phone:</p>
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="phone">📞</span>
                    <span>{item.phone}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="font-medium">Via email:</p>
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="email">✉️</span>
                  <span>{item.email}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="bg-[#2196f3] text-white px-4 py-2 rounded hover:bg-[#1976d2] transition"
                  >
                    Call us
                  </a>
                )}
                <a
                  href={`mailto:${item.email}`}
                  className="bg-[#2196f3] text-white px-4 py-2 rounded hover:bg-[#1976d2] transition"
                >
                  Email us
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
      <FAQ />
      <Footer />
    </div>
  );
};

export default Contact;
