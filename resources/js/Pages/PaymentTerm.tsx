import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from "@/Components/Logo";

interface PaymentTermProps {
  hasPendingPayments?: boolean;
  pendingResumesCount?: number;
}

const PaymentTerm: React.FC<PaymentTermProps> = ({ 
  hasPendingPayments = false, 
  pendingResumesCount = 0 
}) => {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Head title="CVeezy | Payment Terms" />

      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-8 py-6 shadow-sm">
        <div className="flex items-center">
          <Logo
            size="sm"
            text="CVeezy"
            imageSrc="/images/CveezyLOGO.png"
            imageAlt="CVeezy Logo"
            className="text-2xl font-bold text-gray-800 font-sans hover:scale-110 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
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
          {user && hasPendingPayments ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs">
              <div className="flex items-center gap-1 mb-1">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-yellow-800 font-semibold">Payment Pending</span>
              </div>
              <p className="text-yellow-700 text-xs">
                Wait for admin approval
              </p>
            </div>
          ) : (
            <Link
              href="/choose-template"
              className="bg-[#05A2FF] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#2196f3] transition"
            >
              Create my resume
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-16 md:py-24">
        <div className="max-w-3xl w-full mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Payment Terms
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              This Payment Terms outlines the terms and conditions for payments made to CVeezy in exchange for access to downloadable resume files. By proceeding with payment through GCash, users agree to be bound by the provisions set forth in this Policy.
            </p>
          </div>

          {/* Sections */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. One-Time Payment Per Resume</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              CVeezy operates on a <strong>pay-per-use</strong> basis. Users are required to make a <strong>one-time payment</strong> for each resume they wish to download.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>No subscriptions, recurring charges, or trial periods.</li>
              <li>Successful payments unlock immediate access to downloadable resume files.</li>
            </ul>
            <p className="font-semibold text-gray-700 mt-6">Sample Pricing (subject to change):</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>₱99 per resume</li>
              <li>Pricing may vary by template design or added services.</li>
            </ul>
            <p className="font-semibold text-gray-700 mt-6">
              Users must review the total payment at checkout before confirming.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Payment Method - GCash</h2>
            <p className="text-gray-700 mb-4">
              Payments are accepted <strong>exclusively via GCash</strong>, a trusted mobile payment platform in the Philippines.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Users must enter a valid GCash number and complete payment through GCash.</li>
              <li>Access to the resume is granted upon payment confirmation.</li>
              <li>Users must ensure sufficient funds are available in their GCash account.</li>
            </ul>
            <p className="text-gray-700 font-semibold mt-6">
              <strong>CVeezy does not store or access GCash credentials</strong> or other sensitive data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Access and Delivery</h2>
            <p className="text-gray-700 mb-4">Upon confirmed payment:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Instant access to the resume download is provided.</li>
              <li>Users may redownload files via the account dashboard.</li>
              <li>Each purchase covers access to a <strong>single resume</strong> only.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Policy</h2>
            <p className="text-gray-700 mb-4">
              All payments are <strong>final and non-refundable</strong>, unless required by law.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>No refunds for user errors (e.g., typos or incorrect selections).</li>
              <li>Technical issues must be reported within <strong>48 hours</strong> with proof of payment.</li>
              <li>CVeezy may reject refund requests involving misuse or terms violations.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Customer Support</h2>
            <p className="text-gray-700 mb-4">
              For inquiries, contact our support team at:
              <a href="mailto:help@cveezy.com" className="text-blue-500 underline"> help@cveezy.com</a>
            </p>
            <p className="text-gray-700 mb-4">Include the following in your email:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Full name</li>
              <li>GCash number used</li>
              <li>Transaction date and amount</li>
              <li>Issue description</li>
              <li>Screenshot of payment confirmation (if applicable)</li>
            </ul>
            <p className="text-gray-700 mt-4">Our team aims to respond promptly and resolve valid concerns swiftly.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentTerm;
