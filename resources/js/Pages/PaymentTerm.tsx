import React from "react";
import { Link, Head } from "@inertiajs/react";
import Footer from "@/Components/Footer";

const PaymentTerm: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans">
      <Head title="CVeezy | Payment Terms" />
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-16 md:py-24">
        <div className="max-w-3xl w-full mx-auto">
          <h1
            className="text-5xl md:text-6xl font-bold text-center mb-10"
            style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
          >
            Payment Policy
          </h1>
          <div
            className="text-[#0A3370] text-lg leading-relaxed mb-12"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            <p className="mb-4">
              This Payment Policy outlines the terms and conditions for payments made to CVeezy in exchange for access to downloadable resume files. By proceeding with payment through GCash, users agree to be bound by the provisions set forth in this Policy.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
            >
              1. One-Time Payment Per Resume
            </h2>

            <p className="text-[#0A3370] leading-relaxed mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              CVeezy operates on a <span className="font-semibold">pay-per-use</span> basis. Users are required to make a <span className="font-semibold">one-time payment</span> for each resume they wish to download.            
            </p>

            <ul
              className="space-y-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li>
                <h3 className="font-medium ml-6" style={{ color: "#0A3370" }}>
                  • There are no subscriptions, no recurring charges, and no trial periods.
                </h3>
                <h3 className="font-medium ml-6" style={{ color: "#0A3370" }}>
                  • Upon successful payment, the user will gain immediate access to download the selected resume in a printable and shareable format (e.g., PDF).
                </h3>
              </li>
            </ul>
            <p className="font-semibold mb-6 mt-6 " style={{ color: "#0A3370" }}>
              Sample Pricing (subject to change):
            </p>

            <ul
              className="space-y-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li>
                <h3 className="font-medium ml-6" style={{ color: "#0A3370" }}>
                  • ₱99 per resume
                </h3>
                <h3 className="font-medium ml-6" style={{ color: "#0A3370" }}>
                  • Pricing may vary depending on the design selected or any additional value-added services.
                </h3>
              </li>
            </ul>

            <p className="font-semibold mb-6 mt-6 " style={{ color: "#0A3370" }}>
              Users are advised to review the total payment amount displayed at checkout before confirming payment.
            </p>

          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
            >
              2. Payment Method - GCash
            </h2>

            <p className="text-[#0A3370] leading-relaxed mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              CVeezy currently accepts payments <span className="font-semibold">exclusively through GCash</span>, a secure and widely used mobile payment platform in the Philippines.
            </p>

            <ul
              className="space-y-6 font-medium ml-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li >
                <h3>
                  • Users must provide a valid <span className="font-semibold">GCash number</span> and complete the transaction through the GCash payment gateway.
                </h3>
                <h3>
                  • Once the payment is confirmed, the corresponding resume download will be unlocked automatically.
                </h3>
                <h3>
                  • It is the user's responsibility to ensure sufficient funds and transaction capability in their GCash account at the time of purchase.
                </h3>
              </li>
            </ul>
            <p className="font-semibold mb-6 mt-6 " style={{ color: "#0A3370" }}>
              <span className="font-semibold">CVeezy does not store or have access to your GCash credentials</span> or any other sensitive payment data.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
            >
              3. Access and Delivery
            </h2>

            <p className="text-[#0A3370] leading-relaxed mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              Upon successful confirmation of payment:
            </p>
            <ul
              className="space-y-6 font-medium ml-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li >
                <h3>
                  • Users will be granted immediate access to download the purchased resume.
                </h3>
                <h3>
                  • The resume file may be downloaded once or multiple times from the user's account dashboard, subject to reasonable use policies.
                </h3>
                <h3>
                  • Each resume purchase covers access to a <span className="font-semibold">single resume file</span> only. Any modifications, new resume versions, or additional documents (e.g., cover letters) will require a separate purchase.
                </h3>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
            >
              4. Refund Policy
            </h2>

            <p className="text-[#0A3370] leading-relaxed mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              All payments made to CVeezy are considered <span className="font-semibold">final and non-refundable</span>, except where required by applicable consumer protection laws.
            </p>

            <ul
              className="space-y-6 font-medium ml-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li >
                <h3>
                  • Refunds will not be issued for user errors (e.g., typographical mistakes, incorrect content).
                </h3>
                <h3>
                  • In the event of a <span className="font-semibold">technical issue</span> (such as payment processed but resume not delivered), users must contact customer support within <span className="font-semibold">48 hours</span> of the transaction, providing proof of payment and relevant details.
                </h3>
                <h3>
                  • CVeezy reserves the right to refuse refund requests if misuse of the service or violation of terms is identified.
                </h3>
              </li>
            </ul>

          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
            >
              5. Customer Support

            </h2>

            <p className="text-[#0A3370] leading-relaxed"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              For any inquiries regarding payments, access issues, or download errors, users may contact our support team at:&nbsp;
              <span className="text-[#03adfc] leading-relaxed underline">help@cveezy.com </span>
            </p>

            <p className="text-[#0A3370] leading-relaxed mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              Please include the following details in your email:
            </p>

            <ul
              className="space-y-6 font-medium ml-6 mb-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li >
                <h3>• Full name</h3>
                <h3>• GCash number used</h3>
                <h3>• Transaction date and amount</h3>
                <h3>• Description of the issue</h3>
                <h3>• Screenshot of the payment confirmation (if applicable)</h3>
              </li>
            </ul>
            <p className="text-[#0A3370] leading-relaxed mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              Our support team is committed to responding promptly and resolving any valid concerns as quickly as possible.
            </p>

          </section>

          {/* Back to Home button */}
          {/* Removed as per request */}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PaymentTerm; 