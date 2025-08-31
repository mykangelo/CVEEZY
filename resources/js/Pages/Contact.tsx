import { useForm } from "@inertiajs/react";
import { Link, Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import Footer from "@/Components/Footer";
import FAQ from "./ContactsFAQ";
import Logo from "@/Components/Logo";
import SidebarMenu from "@/Components/SidebarMenu";

const supportData = [
  {
    title: "Billing Support",
    description:
      "Questions about payments or invoices? We’re here to help:",
    phone: "+44 808 502 0312",
    email: "billing@cveezy.com",
  },
  {
    title: "Help & Support",
    description:
      "General questions about CVeezy? Our team replies fast:",
    phone: "+44 808 502 0312",
    email: "help@cveezy.com",
  },
  {
    title: "Our Postal Address",
    name: "TSFF Holdings Ltd.",
    address:
      "Office 51, Agias Zonis 23, Kotsios Court A, Limassol 3027, Cyprus",
    email: "help@cveezy.com",
  },
];

interface ContactProps {
  hasPendingPayments?: boolean;
  pendingResumesCount?: number;
}

const Contact: React.FC<ContactProps> = ({ 
  hasPendingPayments = false, 
  pendingResumesCount = 0 
}) => {
  const { auth } = usePage().props as any;
  const user = auth.user;
  const [submitted, setSubmitted] = useState(false);
  const [clientErrors, setClientErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; message: boolean }>({ name: false, email: false, message: false });

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    message: "",
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  const validateField = (field: "name" | "email" | "message", value: string): string | undefined => {
    if (field === "name") {
      if (!value.trim()) return "Please enter your name.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
    }
    if (field === "email") {
      if (!value.trim()) return "Please enter your email address.";
      if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
    }
    if (field === "message") {
      if (!value.trim()) return "Please enter a message.";
      if (value.trim().length < 10) return "Message must be at least 10 characters.";
    }
    return undefined;
  };

  const validateAll = (): boolean => {
    const newErrors: { name?: string; email?: string; message?: string } = {
      name: validateField("name", data.name || ""),
      email: validateField("email", data.email || ""),
      message: validateField("message", data.message || ""),
    };
    setClientErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.message;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      // mark all as touched to show errors
      setTouched({ name: true, email: true, message: true });
      return;
    }
    post("/contact", {
      onSuccess: () => {
        reset();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-[#f4faff] font-sans">
      <Head title="CVeezy | Contact Us" />

      {/* Sidebar Menu */}
      <SidebarMenu 
        user={user}
        onResumeReviewClick={() => {}}
        onInterviewPrepClick={() => {}}
      />

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Contact Section */}
        <section className="bg-gradient-to-b from-[#f4faff] to-[#eaf6ff] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Heading */}
          <div className="text-center max-w-xl sm:max-w-2xl lg:max-w-3xl px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-800 mb-2 sm:mb-3 lg:mb-4 tracking-tight">Contact us</h2>
            <div className="mx-auto mb-3 sm:mb-4 h-1 sm:h-1.5 w-16 sm:w-20 lg:w-24 rounded-full bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8]"></div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Need help with CVeezy or have a question? Send us a message and we'll get back to you shortly.
            </p>
          </div>

          {/* Form */}
          <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl mt-4 sm:mt-6 lg:mt-8 px-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10 shadow-xl ring-1 ring-[#e8f0ff]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full">
                    <label className="block text-sm text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={data.name}
                      onChange={(e) => {
                        setData("name", e.target.value);
                        if (touched.name) setClientErrors({ ...clientErrors, name: validateField("name", e.target.value) });
                      }}
                      onBlur={(e) => {
                        setTouched((prev) => ({ ...prev, name: true }));
                        setClientErrors({ ...clientErrors, name: validateField("name", e.target.value) });
                      }}
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5fc7] ${
                        (touched.name && clientErrors.name) || errors.name ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {(touched.name && clientErrors.name) && (
                      <div className="text-red-500 text-sm mt-1">{clientErrors.name}</div>
                    )}
                    {errors.name && !clientErrors.name && (
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
                      onChange={(e) => {
                        setData("email", e.target.value);
                        if (touched.email) setClientErrors({ ...clientErrors, email: validateField("email", e.target.value) });
                      }}
                      onBlur={(e) => {
                        setTouched((prev) => ({ ...prev, email: true }));
                        setClientErrors({ ...clientErrors, email: validateField("email", e.target.value) });
                      }}
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5fc7] ${
                        (touched.email && clientErrors.email) || errors.email ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {(touched.email && clientErrors.email) && (
                      <div className="text-red-500 text-sm mt-1">{clientErrors.email}</div>
                    )}
                    {errors.email && !clientErrors.email && (
                      <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Message</label>
                  <textarea
                    placeholder="Type your message here..."
                    value={data.message}
                    onChange={(e) => {
                      setData("message", e.target.value);
                      if (touched.message) setClientErrors({ ...clientErrors, message: validateField("message", e.target.value) });
                    }}
                    onBlur={(e) => {
                      setTouched((prev) => ({ ...prev, message: true }));
                      setClientErrors({ ...clientErrors, message: validateField("message", e.target.value) });
                    }}
                    rows={5}
                    className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5fc7] resize-none ${
                      (touched.message && clientErrors.message) || errors.message ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {(touched.message && clientErrors.message) && (
                    <div className="text-red-500 text-sm mt-1">{clientErrors.message}</div>
                  )}
                  {errors.message && !clientErrors.message && (
                    <div className="text-red-500 text-sm mt-1">{errors.message}</div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] hover:from-[#4a5fc7] hover:to-[#2d3f8f] transition"
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
          </div>
        </section>

        {/* Support Section - redesigned cards */}
        <section className="w-full py-14 px-4 flex justify-center bg-gradient-to-b from-white to-[#f4faff]">
          <div className="max-w-7xl w-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-800">How can we help?</h3>
              <p className="text-gray-600">Choose the best way to reach the right team.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportData.map((item, i) => (
                <div key={i} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#e8f0ff] transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#354eab] via-[#4a5fc7] to-[#5b6fd8] rounded-t-2xl"></div>
                  <div className="mt-4" />
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{backgroundColor:'#f2f6ff',color:'#354eab'}}>
                    {i === 0 ? '📄' : i === 1 ? '⚙️' : '📨'}
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold mt-4">{item.title}</h2>
                  {item.description ? (
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                  ) : (
                    <div className="text-sm text-gray-600 space-y-2 mt-2">
                      <div>
                        <span className="font-medium">Company</span>
                        <p>{item.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Office address</span>
                        <p>{item.address}</p>
                      </div>
                    </div>
                  )}
                  {item.phone && (
                    <div className="mt-3">
                      <p className="font-medium text-gray-700">Phone number</p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span role="img" aria-label="phone">📞</span>
                        <span>{item.phone}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <p className="font-medium text-gray-700">Email address</p>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span role="img" aria-label="email">✉️</span>
                      <span>{item.email}</span>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#f2f6ff] text-[#354eab] hover:bg-[#e8f0ff] transition">Call</a>
                    )}
                    <a href={`mailto:${item.email}`} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#354eab] text-white hover:bg-[#2d3f8f] transition">Email</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <FAQ />
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
