import React from "react";
import { Link, Head } from "@inertiajs/react";
import Footer from "@/Components/Footer";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans">
      <Head title="CVeezy | Privacy Policy" />
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
            href="/login"
            className="border border-[#2196f3] text-[#2196f3] font-semibold px-6 py-2 rounded-lg hover:bg-[#e3f2fd] transition"
          >
            Login
          </Link>
          <Link
            href="/choose-template"
            className="bg-[#05A2FF] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#2196f3] transition"
          >
            Create my resume
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-16 md:py-24">
        <div className="max-w-3xl w-full mx-auto">
          <h1
            className="text-5xl md:text-6xl font-bold text-center mb-10"
            style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
          >
            Privacy Policy
          </h1>
          <div
            className="text-[#0A3370] text-lg leading-relaxed mb-12"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            <p className="mb-4">
              This Privacy Policy (the “Policy”) governs your use of https://cveezy.com (the “Website”). This Policy explains how CVeezy handles certain information, including your personal information, when you visit, use or anyhow interact with the Service. It also describes certain legal rights you may have, subject to applicable law, and how you can exercise them. By accessing, using the Service, submitting your personal information to us or otherwise interacting with CVeezy you agree to any processing and transfer of your personal information in accordance with this Policy. Please be sure to carefully read the entirety of this Policy when using the Service.
            </p>
            <p className="mb-4">
              For the purposes of this Policy, “personal information” and/or "personal data" refers to data about identified or identifiable individuals (such as their name, mobile phone number, email address etc.); it may also include, where required by applicable law, the scope of the definition provided therein, e.g., as per the: 1) relevant U.S. federal or state legislation; and/or 2) the European Union's law.
            </p>
            <p>
              Check CVeezy Terms of Use & Service (the “Terms”) for the meaning of defined words (those with capital letters) not explicitly defined in the Policy.
            </p>
          </div>
          <h2
            className="text-4xl font-bold mb-8"
            style={{ fontFamily: "Roboto Serif, serif", color: "#2E404A" }}
          >
            1. Personal data controller
          </h2>
          <div
            className="text-[#0A3370] text-lg leading-relaxed mb-12"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            <p>
              TSFF Holdings Limited, registered office 51, Agias Zonis, 23, Kotsios Court A, Limassol, 3027, Cyprus will be the controller of your personal data.
            </p>
          </div>

          {/* Section 2 */}
          <section className="mb-10">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E204A" }}
            >
              2. What categories of personal data do we collect?
            </h2>

            <p
              className="leading-relaxed mb-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
            >
              We collect data you make available to us voluntarily (for example, email address, phone number, name, date of birth). We also collect data automatically when you use the Website (for example, your IP address, device type).
            </p>

            <div className="mb-6">
              <h3
                className="text-xl font-semibold mb-4"
                style={{ fontFamily: "Roboto Serif, serif", color: "#2E204A" }}
              >
                2.1. Data you provide to us
              </h3>

              <p
                className="leading-relaxed mb-4"
                style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
              >
                You provide us data about yourself when you register for and/or use the Website, for example, when you create a user profile ("Profile"), respond to our emails, or report a problem. The data that you provide to us includes:
              </p>

              <p
                className="leading-relaxed"
                style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
              >
                <span className="font-semibold">Profile data and other materials you post on the Website.</span> This includes your name, username, date of birth, email address and phone number. You may also provide us additional data on your Profile. This may include, but is not limited to: your gender and age, other personal characteristics and demographic data, any ideas, comments, testimonials you share and post, as well as images, photographs and videos. By providing this information you agree and understand that this data may be publicly available (unless otherwise explicitly stated in a particular case). Please do not provide personal data to your profile that you would not want to be publicly available.
              </p>
            </div>

            <div className="mb-6">
              <h3
                className="text-xl font-semibold mb-4"
                style={{ fontFamily: "Roboto Serif, serif", color: "#2E204A" }}
              >
                2.2. Data we collect automatically:
              </h3>
              <p
                className="leading-relaxed mb-4"
                style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
              >
                <span className="font-semibold">Data about how you found us.</span> We collect data about your referring URL (that is, the place on the Web where you were when you tapped on our ad).
              </p>
              <p
                className="leading-relaxed mb-4"
                style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
              >
                <span className="font-semibold">Cookies and other similar technologies.</span> As further described in our Cookie Policy, our Website use cookies that record data about the use of our website to distinguish you from other users. You can control cookies through your browser settings.
              </p>
              <p
                className="leading-relaxed mb-4"
                style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
              >
                <span className="font-semibold">Browser and Device data.</span> We collect data from or about the devices from which you access the Website, depending on the permissions you've granted. We may associate the data we collect from your different devices, which helps us provide consistent services across your devices Examples of such data include: language settings, IP address, location, time zone, type and model of a device, device settings, operating system, Internet service provider, mobile carrier, hardware ID, and Facebook ID. We also collect your Apple Identifier for Advertising (<span className="font-semibold">"IDFA"</span>) or Google Advertising ID (<span className="font-semibold">"AAID"</span>) (depending on the operating system of your device). You can typically reset these numbers through the settings of your device's operating system (but we do not control this).
              </p>
              <p
                className="leading-relaxed mb-4"
                style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
              >
                <span className="font-semibold">Transaction data.</span> When you make payments through the Website, you need to provide financial account data, such as your credit card number, to our third-party service providers. We do not collect or store full credit card number data, though we may receive credit card-related data and data about the transaction, including: date, time and amount of the transaction, and the type of payment method used.
              </p>
              <p
                className="leading-relaxed mb-4"
                style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
              >
                <span className="font-semibold">Usage data.</span> We record how you interact with our Website. For example, we log the features, and content you interact with, how often and long you use the Website, what sections you use, and other interactions.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E204A" }}
            >
              3. For what purposes do we process your personal data?
            </h2>
            <p
              className="leading-relaxed mb-4"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
            >
              We process your personal data:
            </p>
            <ul
              className="space-y-6"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to provide services to you
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ This includes enabling you to use the Website in a seamless manner and preventing or addressing Website errors or technical issues. For example, we use your data to authenticate you and authorize access to our Website.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to research and analyze your use of the Website
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ This helps us to better understand our business, analyze our operations, maintain, improve, innovate, plan, design, and develop the Website and our new products. We conduct surveys, research, and test features in development. We analyze the data we have to evaluate our Website, and conduct audits and troubleshooting activities to improve our Website content and layouts. As a consequence, we often decide how to improve the Website based on the results obtained from this processing. For example, if we discover that users do not often use certain section of the Website, we may focus on improving this section.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to customize the Website for you
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ We select the payment processor available to you; we may also use your data to determine your eligibility for promotions, sweepstakes, and contests.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to process your payments
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ We provide paid products and/or services within the Website. For this purpose, we use third-party services for payment processing (for example, payment processors). As a result of this processing, you will be able to make a payment for paid features of the Website.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to enforce the Terms and to prevent, detect, investigate, and resolve disputes and/or remediate malicious activities, fraud, other cybercrimes, take legally-required actions, or make sure you are a real person and avoid the creation of fake accounts
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ We use personal data to enforce our agreements and contractual commitments, to detect, prevent, and combat fraud. As a result of such processing, we may share your information with others, including law enforcement agencies (in particular, if a dispute arises in connection with the Terms).
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to communicate with you regarding your use of our Website
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ We may communicate with you, for example, by email or directly on the Website, including through push notifications.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to show and/or send you marketing communications
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ We process your personal data for our marketing campaigns. We may add your email address to our marketing list. As a result, you will receive information about our Website, features, offers, promotions, contests, and events or provide other news or information about third party services that may be of interest to you. You can opt out of advertisement and/or commercial emails by clicking here: unsubscribe.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to provide you customer service and support
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ As a result of such processing, we will send you messages about the availability of our Website security, payment transactions, status of your orders, legal notices, or other Website-related information
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to personalize our ads
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ We and our partners use your personal data to tailor ads and possibly even show them to you at the relevant time.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#2E204A" }}>
                  • to comply with legal obligations
                </h3>
                <ul className="ml-6" style={{ listStyle: "none" }}>
                  <li className="leading-relaxed">
                    ◦ We may process, use, or share your data when the law requires it, in particular, if a law enforcement agency requests your data by available legal means.
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "Roboto Serif, serif", color: "#2E204A" }}
            >
              4. Legal basis for data processing
            </h2>
            <p
              className="leading-relaxed mb-4"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370" }}
            >
              The laws in some jurisdictions require providing information with respect to the legal grounds for the usage and/or disclosure of personal information. To the extent those laws apply, our legal grounds are as follows:
            </p>

            <ul
              className="space-y-4"
              style={{ fontFamily: "Nunito, sans-serif", color: "#0A3370", listStyle: "none" }}
            >
              <li>
                <p className="leading-relaxed">
                  <span className="font-semibold">A. Consent</span>
                </p>
                <p className="ml-4 mt-2">
                  We collect data about your referring URL (that is, the place on the Web where you were when you tapped on our ad).
                </p>
              </li>

              <li>
                <p className="leading-relaxed">
                  <span className="font-semibold">B. To perform our contract with you.</span>
                </p>
                <p className="ml-4 mt-2">
                  We process your personal information on this basis in order to:
                </p>
                <ul className="ml-8 mt-2" style={{ listStyle: "none" }}>
                  <li>• provide the services;</li>
                  <li>• customize your experience;</li>
                  <li>• communicate with you regarding your use of the Service;</li>
                  <li>• manage your account;</li>
                  <li>• provide you customer service and support;</li>
                  <li>• process your payments.</li>
                </ul>
              </li>

              <li>
                <p className="leading-relaxed">
                  <span className="font-semibold">C. Legal compliance.</span>
                </p>
                <p className="ml-4 mt-2">
                  We may need to use and disclose personal information in certain ways to comply with our legal obligations.
                </p>
              </li>

              <li>
                <p className="leading-relaxed">
                  <span className="font-semibold">D. Legal obligations</span>
                </p>
                <p className="ml-4 mt-2">
                  For our (or others) legitimate interests unless those interests are overridden by your interests or fundamental rights and freedoms that require protection of personal data:
                </p>
                <ul className="ml-8 mt-2" style={{ listStyle: "none" }}>
                  <li>• to communicate with you regarding your use of our Service;</li>
                  <li>• to research and analyze your use of the Service;</li>
                  <li>• to send you marketing communications;</li>
                  <li>• to personalize our ads;</li>
                  <li>• to enforce our Terms of Service and to prevent and counteract fraud.</li>
                </ul>
              </li>
            </ul>
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

export default PrivacyPolicy; 