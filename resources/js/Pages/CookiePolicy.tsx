import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Footer from '@/Components/Footer';
import Logo from '@/Components/Logo'; // Adjust path as needed

const CookiePolicy: React.FC = () => {
  const { auth } = usePage().props as any;
  const user = auth.user;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            className="bg-[#05A2FF] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#2196f3] transition"
          >
            Create my resume
          </Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="p-6 sm:p-8 lg:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Cookie Policy
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-lg leading-relaxed">
              This Cookie Policy ("Policy") explains what cookies are, what types of cookies are placed on your device when you visit <strong>CVeezy</strong>, and how we use them. It also applies to similar technologies, such as web beacons or SDKs.
            </p>
            
            <p>
              This Policy does not explain how we handle your personal data. To learn more about our data practices, please see our <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link>.
            </p>

            {/* Section 1 */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. What are cookies
              </h2>
              <p className="mb-4">
                Cookies are small text files stored on your browser or device when you visit a website. They often include an anonymous unique identifier and may collect information such as browser type, pages visited, and user preferences.
              </p>
              <p className="mb-4">There are different types of cookies:</p>
              
              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.1 Session Cookies</h3>
                  <p>These expire when you close your browser. We use them to provide core website functionality and understand your use within a single session.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.2 Persistent Cookies</h3>
                  <p>These remain on your device even after closing the browser. They're used for remembering your preferences and improving your experience over time.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.3 First-party Cookies</h3>
                  <p>These are set directly by us (CVeezy) to enable features like login, language settings, or website performance tracking.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.4 Third-party Cookies</h3>
                  <p>These are set by third-party services we may use for analytics, support, security, or advertising. We do not control these cookies and recommend reviewing those providers' policies.</p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Similar technologies
              </h2>
              
              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.1 Web Beacons</h3>
                  <p>These are small graphics or "pixel tags" used to monitor website traffic or track whether emails have been opened.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.2 SDKs</h3>
                  <p>Software Development Kits are used primarily in mobile apps and function similarly to cookies to collect information about usage and behavior.</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                <p className="text-sm italic text-blue-800">
                  <strong>Note:</strong> These technologies may be used depending on features added in the future (e.g., AI chat, analytics, ads).
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Why we use cookies
              </h2>
              <p className="mb-4">We use cookies and related technologies to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Help you navigate and use CVeezy efficiently</li>
                <li>Improve the performance and reliability of our website</li>
                <li>Understand how users interact with our platform</li>
                <li>Provide a personalized and secure experience</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Categories of cookies we may use
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Authentication</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Remember your login or session info</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Security</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Help detect and prevent fraud or abuse</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Analytics</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Understand how our site is used and improve functionality</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Preferences</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Remember your language, theme, or UI settings</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Advertising <em>(if applicable)</em></td>
                      <td className="px-4 py-3 text-sm text-gray-700">Deliver relevant ads and avoid repetition</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Managing cookies
              </h2>
              <p className="mb-4">
                You can manage or disable cookies in your browser settings. Please note that disabling cookies may affect the functionality of some parts of our website.
              </p>
              <p className="mb-4">For more help managing cookies, visit:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Cookies We Use <em>(To Be Updated Later)</em>
              </h2>
              <p className="mb-4">
                Below is an example of cookies we may use. This list will be updated as development continues.
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                        Cookie Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">csrf_token</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Security</td>
                      <td className="px-4 py-3 text-sm text-gray-700">First-party</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">session_id</td>
                      <td className="px-4 py-3 text-sm text-gray-700">User login</td>
                      <td className="px-4 py-3 text-sm text-gray-700">First-party</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">_ga / _gid</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Google Analytics (if used)</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Third-party</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">ai_tracking_id</td>
                      <td className="px-4 py-3 text-sm text-gray-700">AI session or user input (if used)</td>
                      <td className="px-4 py-3 text-sm text-gray-700">First/Third-party</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">cloudflare_id</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Security and performance (if using Cloudflare)</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Third-party</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Final note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="mb-4">
                We will update this Cookie Policy as we add new services or features that require cookies or similar tracking technologies.
              </p>
              <p>
                If you have any questions, please contact us at <a href="mailto:contact@cveezy.com" className="text-blue-600 hover:text-blue-800 underline">help@cveezy.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;