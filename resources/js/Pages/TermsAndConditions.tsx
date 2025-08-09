import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Logo from '@/Components/Logo';

interface TermsAndConditionsProps {
  hasPendingPayments?: boolean;
  pendingResumesCount?: number;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ 
  hasPendingPayments = false, 
  pendingResumesCount = 0 
}) => {
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
            className="text-2xl font-bold text-gray-800 font-sans hover:scale-110 hover:drop-shadow-lg  focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="p-6 sm:p-8 lg:p-10">
          <h1
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8"
          >
            Terms and Conditions
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="mb-4 ">
              CVeezy service includes a subscription that automatically renews until you cancel it. To avoid being charged you must affirmatively cancel your subscription before the end of the trial or then-current subscription period.
            </p>
            <p className="mb-4">
              PLEASE NOTE: THIS AGREEMENT CONTAINS A BINDING ARBITRATION PROVISION IN SECTION 13 THAT AFFECTS YOUR RIGHTS UNDER THIS AGREEMENT WITH RESPECT TO ALL SERVICE(S). THE ARBITRATION PROVISION REQUIRES THAT DISPUTES BE RESOLVED IN ARBITRATION ON AN INDIVIDUAL BASIS. IN ARBITRATION, THERE IS NO JUDGE OR JURY AND THERE IS LESS APPELLATE REVIEW THAN IN COURT.
            </p>
            <p>
              FURTHERMORE, THIS AGREEMENT CONTAINS DISCLAIMERS OF WARRANTIES, LIMITATIONS OF LIABILITY, AND A CLASS ACTION WAIVER.
              {/* The original text had a link to Privacy Policy here, but it's not directly part of the provided context for this specific paragraph. */}
            </p>
            <p className="mb-4">
              This Agreement also explains the consent you provide to us to contact you using the telephone numbers you provide to us upon registration, including via automated dialing or texting systems (see Section 6 for more information).
            </p>

            {/* Section 1: ACCEPTANCE OF THESE TERMS */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. ACCEPTANCE OF THESE TERMS
              </h2>
              <p>
                These Terms of Use & Service (the "Terms" or the "Agreement") are an agreement between You, as a user of the website https://cveezy.com ("Website"), and TSFF Holdings Limited, registered office 51, Agias Zonis, 23, Kotsios Court A, Limassol, 3027, Cyprus. ("CVeezy", or "we"/ "us").
              </p>
              <p>
                These Terms govern your access to and use of the Website and the associated services offered through this Website. Browsing the Website, its use or viewing the information in it constitutes the acceptance of all the terms of the Agreement. In case you do not agree with any condition of the Agreement, please immediately close the Website and stop any use of it.
              </p>
              <p>
                All terms and policies, which may be adopted or introduced by us from time to time, including but not limited to Subscription Terms, Privacy Policy and Cookie Policy constitute an integral part of this Agreement are incorporated into this Agreement by reference.
              </p>
              <p>
                We may change these Terms by posting them on this page of the Website. Changes shall automatically be effective upon posting. We may notify you specifically about some critical changes but are not obliged to do so in every case. Your use of the Website after any changes are made means that you accept such changes. After getting notice of changes of the Terms, if you do not object and opt-out of the amended Terms within fourteen (14) days, the amended version of the Terms is binding upon you.
              </p>
            </section>

            {/* Section 2: CVEEZY SERVICES */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. CVEEZY SERVICES
              </h2>
              <p>
                CVeezy allows its Users to access, fill out, edit and download various CV templates ("Service"). CVeezy does not warrant or guarantee that any CV Template is accurate, correct, complete, or reliable. CVeezy does not hold any responsibility in this regard. CVeezy shall not be liable for any loss or damage arising from your reliance on any CV Template.
              </p>
            </section>

            {/* Section 3: USER ACCOUNTS */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. USER ACCOUNTS
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3.1. Eligibility
              </h3>
              <p>
                To create an account on CVeezy, you shall be at least 18 years old (or of the reciprocal age of majority in your state or jurisdiction) and able to form legally binding contracts. We do not knowingly collect personal information from children under 18 years of age.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3.2. Registration
              </h3>
              <p>
                In the course of registration of an account, you need to provide us a valid email address, and/or other information as prompted by the registration form or as required by applicable law. We may also allow you to register by using your social network credentials.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3.3. Account Security
              </h3>
              <p>
                You are solely responsible for maintaining the confidentiality of your account, your password and for restricting access to your computer, and you will be solely responsible for all acts or omissions that occur under your account. You will immediately notify CVeezy of any unauthorized use of your password or account. You should only create one account on the Website.
              </p>
              <p>
                Unless expressly permitted in writing by CVeezy, you may not sell, rent, lease, share, or provide access to your account to anyone else, including without limitation, charging anyone for access to your account. CVeezy reserves all available legal rights and remedies to prevent its unauthorized use, including, but not limited to, technological barriers, IP mapping, and, in serious cases, directly contacting your Internet Service Provider (ISP) regarding such unauthorized use.
              </p>
              <p>
                You agree to keep your contact and billing information (including but not limited to email address) true, accurate, complete and up-to-date, and to comply with all billing procedures, including providing and maintaining accurate and lawful billing information for active CVeezy accounts.
              </p>
            </section>

            {/* Section 4: SUBSCRIPTION, PAYMENTS AND REFUNDS */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. SUBSCRIPTION, PAYMENTS AND REFUNDS
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                4.1. Payment
              </h3>
              <p>
                The access to CVeezy platform is possible on a payment basis. The fees for CVeezy services are stated on the Website. Please always check the current fees before payment.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                4.2. Subscription
              </h3>
              <p>
                The Service is offered on a subscription basis for a fee (Subscription). The subscription renews automatically until you cancel. By purchasing a trial or a Subscription, you agree that you will be charged the applicable Subscription Fee at the beginning of your subscription period and on each renewal date thereafter until you cancel, at the then-current Subscription Fee. The subscription period is either one month (a 30-day period) or one year (a 365-day period).
              </p>
              <p>
                All prices applicable to you are stated on the payment page; please always read the payment page carefully. We may charge any of the fees in a single transaction or in a number of separate transactions.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                4.3. Paid trial
              </h3>
              <p>
                We may offer a paid (for a small payment) trial for the service. If you do not cancel your trial during the 7-days trial period, you will be automatically charged the full Subscription Fee indicated on the payment page at the end of the 7-days trial period.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                4.4. Payment method
              </h3>
              <p>
                Payment will be charged to the payment method you provided at the time of purchase at the payment page (after entering your payment method details). You authorize us (or our third-party payment processor) to automatically charge the applicable Subscription Fees on each renewal date to the payment method that you provided until you cancel your Subscription.
              </p>
              <p>
                You authorize CVeezy to supply your payment details to a third-party payment provider for processing your payments. Your credit/debit card provider may charge you currency conversion fees and other charges for processing your payments.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                4.5. Cancellation
              </h3>
              <p>
                Your subscription renews automatically at the end of each subscription period until you cancel. To avoid being charged cancel your subscription before the end of the then-current period.
              </p>
              <p>
                You can cancel your Subscription by contacting our customer support team via email at help@cveezy.com.
              </p>
              <p>
                You will be responsible for all Subscription Fees (plus any applicable taxes and other charges) incurred for the then-current Subscription period. If you cancel, your right to use the Website will continue until the end of your then current subscription period and will then terminate without further charges.
              </p>
              <p>
                We may cancel your Subscription if you fail to pay for your Subscription, violate these Terms, or for any other reason in our sole discretion.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                4.6. No Refunds
              </h3>
              <p>
                The fees paid to CVeezy, including the Subscription Fee are non-refundable, unless otherwise is provided by the current legislation. If you cancel your Subscription in the middle of the Subscription period you will not receive a refund of any portion of the Subscription Fee paid for the then current Subscription period at the time of cancellation.
              </p>
              <p>
                In any case, we have a right to refuse providing you any kind of refund if you have violated any provisions of the Terms.
              </p>
              <p>
                Note for the EU residents. If you are a consumer based in the EEA or Switzerland, you have an automatic legal right to withdraw from contracts for purchases of the Service. However, when you make a purchase of a single item of digital content (such as a pdf file) you expressly agree that such content is made available to you immediately and you, therefore, lose your right of withdrawal and will not be eligible for a refund. By signing up for our Service which is not a single item of digital content and is provided on a continuous basis (such as the Subscription) you expressly request and consent to an immediate supply of such Service. Therefore, if you exercise your right of withdrawal we will deduct from your refund an amount that is in proportion to the Service provided before you communicated to us your withdrawal from the contract.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Exercise of the Right of Withdrawal.
              </h3>
              <p>
                Where you have not lost your right of withdrawal, the withdrawal period will expire 7 days after the day you enter into that contract. To exercise your right of withdrawal, you must inform us - CVeezy via email: help@cveezy.com - of your decision to withdraw from a contract by an unequivocal statement (e.g. an e-mail). You may use the model withdrawal form below, but it is not obligatory. To meet the withdrawal deadline, you need to send your communication to us saying you wish to withdraw from the contract before the withdrawal period has expired.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Model Withdrawal Form
              </h3>
              <p>
                To: CVeezy, email: help@cveezy.com
              </p>
              <p>
                I hereby give notice that I withdraw from my contract of the following service:
              </p>
              <p>
                Received on:
              </p>
              <p>
                Name:
              </p>
              <p>
                Address:
              </p>
              <p>
                Date:
              </p>
            </section>

            {/* Section 5: REPRESENTATIONS AND WARRANTIES FROM AND RESTRICTED ACTIVITIES OF USERS */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. REPRESENTATIONS AND WARRANTIES FROM AND RESTRICTED ACTIVITIES OF USERS
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                5.1. Representations and Warranties from Users
              </h3>
              <p>
                By using the Website, you represent and warrant that you
              </p>
              <ul className="list-disc ml-6">
                <li>(i) agree to be bound by the Terms,</li>
                <li>(ii) are over the age of eighteen (18) years old (or of the reciprocal age of majority in your state or jurisdiction),</li>
                <li>(iii) are neither located in a sanctioned country nor a prohibited person,</li>
                <li>(iv) have the right, authority, and capacity to enter into this Agreement and abide by all of the terms and conditions of this Agreement,</li>
                <li>(v) agree and acknowledge that by using the Website you are accepting a benefit that cannot be disgorged, and</li>
                <li>(vi) will not be engaged into any kind of activities that are prohibited.</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                5.2. Prohibited Activities of Users
              </h3>
              <p>
                This is a list of activities that we prohibit on the Website:
              </p>
              <ul className="list-disc ml-6">
                <li>a) You shall not remove any copyright, trademark, or other proprietary rights notices contained on the Website;</li>
                <li>b) You shall not interfere with or disrupt the Website or the servers or networks connected to the Website;</li>
                <li>c) You shall not forge headers or otherwise manipulate identifiers in order to disguise the origin of any information transmitted through the Website;</li>
                <li>d) You shall not "frame" or "mirror" any part of the Website, without CVeezy prior written authorization. You also shall not use metatags or code or other devices containing any reference to CVeezy or the Website in order to direct any person to any other website for any purpose;</li>
                <li>e) You shall not modify, adapt, sublicense, translate, sell, reverse engineer, decipher, decompile, or otherwise disassemble any portion of the Website or any software used on or for the Website or cause others to do so;</li>
                <li>f) You shall not attempt to interfere with, harm, steal from, or gain unauthorized access to the Website, User accounts, or the technology and equipment supporting the Website;</li>
                <li>g) You shall not use the Website in an unlawful or illegal way or commit an illegal act in relation to the Website including, without limitation, all laws associated with international money transfers;</li>
                <li>h) You shall not access or use (or attempt to access or use) the Website in any way that violates this Agreement;</li>
                <li>i) Your use of the Website shall not create liability for us or cause us to lose (in whole or in part) the services of our ISPs or other suppliers; and</li>
                <li>j) You may not resell or make any commercial use of our system or the content on the Website without CVeezy's prior written consent.</li>
              </ul>
              <p>
                Although CVeezy cannot monitor the conduct of its Users while not on the Website, it is also a violation of these Terms to use any information obtained from the Website in order to contact, advertise to, solicit, or sell to any User without their prior explicit consent or to harass, abuse, or harm another person.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                5.3. Our Rights Regarding Violations of Warranties and Restrictions by You
              </h3>
              <p>
                We may conduct an investigation regarding possible breaches by you of the requirements of these Terms. If such investigation shows or we become aware in any other way that there is a violation by you, we may deactivate your profile on the Website. In addition, we may take appropriate legal action against you due to such violation, without limitation, seeking civil, criminal, and injunctive redress.
              </p>
            </section>

            {/* Section 6: USE OF CONTACTS AND INTERACTION WITH CUSTOMER SERVICE */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. USE OF CONTACTS AND INTERACTION WITH CUSTOMER SERVICE
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                6.1. Electronic Communication
              </h3>
              <p>
                Without limiting other provisions of this Agreement (including the Privacy Policy), by using the Website, you agree to accept and consent to receiving electronic communications initiated from us regarding any issue arisen from this Agreement and Website.
              </p>
              <p>
                All information communicated on the Website is considered electronic communication. When you communicate with us through or on the Website or via other forms of electronic media, such as e-mail, you are communicating with CVeezy electronically.
              </p>
              <p>
                You agree that we may communicate electronically with you and that such communications, as well as notices, disclosures, agreements, and other communications that we provide to you electronically, are equivalent to communications in writing and shall have the same force and effect as if they were in writing and signed by the party sending the communication.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                6.2. Telephone Calls and Text Messages
              </h3>
              <p>
                Communications from CVeezy, including its agents, representatives, affiliates, or business partners, may include but are not limited to: operational communications concerning your account or use of the CVeezy Website including account verification and message notifications, updates concerning new and existing features of the Website, marketing information and promotions run by us, our agents, representatives, affiliates, or business partners, any news concerning CVeezy and any other purposes related to the Website or required to enforce these Terms.
              </p>
              <p>
                By entering your telephone number into the CVeezy website, you expressly agree to receive communications at that number as required for the purposes identified above from us, our agents, representatives, affiliates, or business partners, via e-mail, SMS or text messages, phone calls, and push notifications. You further expressly agree that these communications, including phone calls, SMS or text messages, may be generated using automated technology, such as an automatic telephone dialing system, or artificial or prerecorded voice, and even if your telephone number(s) is listed on any Do-Not-Call lists. We are not responsible for the timeliness or final delivery of the communication, as we cannot control work of the cellular telephone operator or other networks.
              </p>
              <p>
                By agreeing to receive communications from CVeezy, you also consent to the use of an electronic record to document your agreement. You may withdraw your consent to the use of the electronic record by emailing CVeezy at help@cveezy.com with "Revoke Electronic Consent" in the subject line. To view and retain a copy of this disclosure or any information regarding your enrollment in this program, you will need (i) a device (such as a computer or mobile phone) with a web browser and Internet access and (ii) either a printer or storage space on such device. For a free paper copy, or to update our records of your contact information, email CVeezy at help@cveezy.com with contact information and the address for delivery.
              </p>
              <p>
                We will use your mobile number in accordance with our Privacy Policy. You represent that for the telephone number(s) that you have provided to us, you are the current subscriber or customary user and that you have the authority to provide the consent described above to be contacted at such number(s). You agree to promptly alert us whenever you stop using a particular telephone number. Standard charges may apply to the receipt of these calls or text messages. You are responsible for those charges.
              </p>
              <p>
                You acknowledge that you are not required to consent to receive promotional texts or calls as a condition of using the Website or the services provided by non-CVeezy entities. Please note that consent is not a condition of using our Website and consent may be revoked at any time. However, opting out may impact your use of the Website.
              </p>
              <p>
                We may monitor or record telephone conversations that we have with you or anyone acting on your behalf regardless you call us or we call you. We will use the results of monitoring and recording in accordance with our Privacy Policy.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                6.3. Receipt of Special Offers and Other Communications
              </h3>
              <p>
                By accepting these Terms, you agree to receive special offers, promotional materials and other communications from CVeezy according to the terms of the Privacy Policy.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                6.4. Prohibited Conduct towards Customer Service
              </h3>
              <p>
                When communicating with our customer service representatives, you agree not to be abusive, obscene, profane, offensive, sexist, threatening, harassing, racially offensive, and behaving inappropriately anyhow.
              </p>
              <p>
                If your behavior towards any of our representatives is such as described above, we may terminate your membership and cancel your Subscription.
              </p>
            </section>

            {/* Section 7: PRIVACY */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. PRIVACY
              </h2>
              <p>
                We respect your privacy and the use and protection of your personal information. Your submission of personal information through the Website is governed by our Privacy Policy. It contains important information and disclosures relating to the collection and use of your personal information by us.
              </p>
            </section>

            {/* Section 8: SUSPENSION OR TERMINATION OF MEMBERSHIP */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. SUSPENSION OR TERMINATION OF MEMBERSHIP
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                8.1. General Grounds for Termination of Account
              </h3>
              <p>
                Customers may terminate their accounts at their sole discretion and at any time by written notice via e-mail to help@cveezy.com. Terminations typically will be effective within seven business days after our receipt of your termination notice, at which time your account will be closed and you will no longer enjoy access to your former account.
              </p>
              <p>
                We may block or terminate your use of the Website, cancel your Subscription and/or modify or discontinue any portion or all of the Website at any time, at our sole discretion, for any or no reason and without notice.
              </p>
              <p>
                For the purposes of these Terms: "Termination" means deletion of the account from the CVeezy servers and complete erasure of all data related to a User's profile. At a User's request, we may retrieve all personal data and provide it in a comprehensive and readable form. "Blocking" means temporary or permanent restriction of access to a User's profile for violation of these Terms. The decision regarding termination or blocking of the account is made each time by the CVeezy Customer Service at its sole discretion. In particular, termination of account is possible as a result of its inactivity for three months, violation of these Terms, security reasons, etc.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                8.2. Termination as a Result of Death or Disability
              </h3>
              <p>
                If a person that was the User of the Website is no longer able to use the Website by reason of death or disability, such person or his/her legal representative or legal successor may contact us regarding termination of the account.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                8.3. Blocking of IP addresses
              </h3>
              <p>
                In order to protect the integrity of the Website, CVeezy reserves the right, at any time in its sole discretion, to block Users with certain IP addresses from accessing the Website. In particular, CVeezy may block Users with IP addresses from certain jurisdictions, including, but not limited to, those that are subject to sanctions of the United Nations Security Council, included into the OFAC Sanctions List or the EU consolidated list of persons, groups and entities subject to financial sanctions.
              </p>
            </section>

            {/* Section 9: LICENSE AND COPYRIGHT POLICY */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. LICENSE AND COPYRIGHT POLICY
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                9.1. Proprietary Rights
              </h3>
              <p>
                Unless otherwise indicated, all content, information, and other materials on CVeezy (excluding Content), including, without limitation, trademarks and logos, the visual interfaces, graphics, design, compilation, information, software, computer code (including source code or object code), services, text, pictures, information, data, sound files, other files, and the selection and arrangement thereof (collectively, the "Materials") are protected by relevant intellectual property and proprietary rights and laws. All Materials are the property of CVeezy or its subsidiaries or affiliated companies and/or third-party licensors. Unless otherwise expressly stated in writing by CVeezy, by agreeing to these Terms you are granted a revocable, limited, non-exclusive, royalty-free, non-sublicensable, non-transferrable license to access and use CVeezy.
              </p>
              <p>
                CVeezy reserves all rights not expressly granted in these Terms. This license is subject to these Terms and does not permit you to engage in any of the following: (a) resale or commercial use of CVeezy or the Materials; (b) distribution, public performance or public display of any Materials; (c) copying, modifying, reverse engineering, decompiling, disassembling, attempting to derive the source code of or otherwise making any derivative uses of CVeezy or the Materials, or any portion of them; (d) use of any data mining, robots, or similar data gathering or extraction methods; (e) downloading (except page caching) of any portion of CVeezy, the Materials, or any information contained in them, except as expressly permitted on CVeezy; or (f) any use of CVeezy or the Materials except for their intended purposes. Any use of CVeezy or the Materials except as specifically authorized in these Terms, without the prior written permission of CVeezy, is strictly prohibited and may violate intellectual property rights or other laws. Unless explicitly stated in these Terms, nothing in them shall be interpreted as conferring any license to intellectual property rights, whether by estoppel, implication, or other legal principles. CVeezy can terminate this license as set out in Section 8.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                9.2. License
              </h3>
              <p>
                You grant to CVeezy and its affiliates, licensees, and successors, to the furthest extent and for the maximum duration permitted by applicable law (including in perpetuity if permitted under applicable law), a non-exclusive, unrestricted, irrevocable, perpetual, worldwide, royalty-free, fully sublicensable (through multiple tiers) license to exercise the copyright, publicity, and database rights over the Content, including the right to use, reproduce, display, edit, copy, modify, transmit, publicly perform, extract and create derivative works of, in any media now known or not currently known, with respect to any Content.
              </p>
              <p>
                You agree that any Content you post on the Website, including any materials, ideas, comments and testimonials you submit on the Website, will not be considered confidential and may be used by CVeezy, in its sole discretion, without any obligation to compensate for use of or to return any submitted materials.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                9.3. Our Actions in Cases of Intellectual Property Rights Infringement
              </h3>
              <p>
                We do not tolerate infringing activity on or through the Website anyhow.
              </p>
              <p>
                If we have any reasons to believe in good faith that Content and/or any kind of information violates intellectual property rights of a third party by being made available on or through the Website, upon notice from an intellectual property owner or his or her agent, we:
              </p>
              <ul className="list-disc ml-6">
                <li>(i) remove or disable access to material; and</li>
                <li>(ii) remove any Content uploaded to the Website by "repeat infringers".</li>
              </ul>
              <p>
                "Repeat infringer" is a User that has uploaded Content to or through the Website and about whom CVeezy has received more than two takedown notices compliant under applicable law with respect to such User Content.
              </p>
              <p>
                However, we may terminate the account of a User after receipt of a single notification of claimed infringement.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                9.4. Procedure for Reporting Claimed Infringement
              </h3>
              <p>
                If you believe that any content made available on or through the Website infringes your intellectual property right, please promptly send a written "Notification of Claimed Infringement" containing the following information to the designated agent identified below. CVeezy may share your Notification of Claimed Infringement with the User that is a possible infringer, and you consent to making such disclosure by CVeezy. Your communication must include substantially the following:
              </p>
              <ol className="list-decimal ml-6">
                <li>A physical or electronic signature of a person authorized to act on behalf of the owner of the material(s) that has/have been allegedly infringed;</li>
                <li>Identification of the material allegedly being infringed, or, if multiple materials are covered by a single notification, then a representative list of such works;</li>
                <li>Identification of the specific material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit CVeezy to locate the material on the Website;</li>
                <li>Information reasonably sufficient to permit CVeezy to contact you, such as your name, address, telephone number, and email address;</li>
                <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright or other intellectual property owner, its agent, or the law; and</li>
                <li>Under penalty of perjury, a statement that the information in the Notification of Claimed Infringement is accurate and truthful, and that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              </ol>
              <p>
                You should consult with your own lawyer and/or review applicable law regarding copyright or other intellectual property infringement to confirm your obligations to provide a valid notice of claimed infringement.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                9.5. Designated Agent Contact Information
              </h3>
              <p>
                Designated agent of CVeezy for receipt of Notifications of Claimed Infringement can be contacted at e-mail: help@cveezy.com.
              </p>
              <p>
                CVeezy reserves the right to seek damages from any party that submits a false notification in violation of the law, as provided for by applicable law.
              </p>
            </section>

            {/* Section 10: DISCLAIMER OF WARRANTIES */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. DISCLAIMER OF WARRANTIES
              </h2>
              <p>
                Except where otherwise inapplicable or prohibited by law to the fullest extent permitted by law, CVeezy services, software, and related documentation are provided "as is" and without any warranty of any kind either express or implied, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose. No information, whether oral or written, obtained by you from us through this Website shall create any warranty, representation or guarantee not expressly stated in these Terms.
              </p>
              <p>
                CVeezy expressly disclaims all warranties of any kind whether express or implied, including, any warranty that:
              </p>
              <ul className="list-disc ml-6">
                <li>(i) the Website will meet your requirements,</li>
                <li>(ii) the Website will be uninterrupted, timely, secure, or error-free,</li>
                <li>(iii) the Website and the server that makes it available are free of viruses or other harmful components</li>
                <li>(iv) the results that may be obtained from the use of the Website, including data, will be, correct, accurate, timely, or reliable,</li>
                <li>(v) the quality of any data or service available on the Website will meet your expectations, and</li>
                <li>(vi) any defects or errors in the Website will be corrected.</li>
              </ul>
            </section>

            {/* Section 11: LIMITATION OF LIABILITY */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. LIMITATION OF LIABILITY
              </h2>
              <p>
                Except where otherwise inapplicable or prohibited by law in no event shall CVeezy, its parents, subsidiaries, officers, directors, shareholders, employees, agents, joint venturers, consultants, successors or assigns be liable for any indirect, special, incidental, consequential, punitive or exemplary damages (including, but not limited to, loss of business, profits, data, use, revenue or other economic advantage), even if advised of the possibility of such damages resulting from or in connection with:
              </p>
              <ul className="list-disc ml-6">
                <li>a) the use, attempted use, or the inability to use the Website;</li>
                <li>b) reliance on information obtained through the Website, from other Users or third parties or a linked site, or User's reliance on any product or service obtained from a third party or a linked site;</li>
                <li>c) statements or conduct of any user or third party on the Website;</li>
                <li>d) unauthorized access to or alteration of your transmissions or data; or</li>
                <li>e) any other matter relating to the Website.</li>
              </ul>
              <p>
                The limitation of damages set forth above is a fundamental element of the basis of the bargain between us and you. This Website and the information would not be provided without such limitations. Even if CVeezy is found liable under any theory in no event will our liability, and the liability of our parents, subsidiaries, officers, directors, employees, and suppliers, to you or any third parties in any circumstance exceed the greater of (a) the amount of fees you pay to CVeezy in the 12 months prior to the action giving rise to liability, or (b) USD 100.
              </p>
            </section>

            {/* Section 12: INDEMNIFICATION */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. INDEMNIFICATION
              </h2>
              <p>
                To the fullest extent permitted by law you agree to indemnify and hold CVeezy, its parents, subsidiaries, officers, directors, shareholders, employees, agents, joint venturers, consultants, successors and assignees harmless from and against all losses, costs, liabilities and expenses including reasonable attorneys fees, asserted by any third-party resulting from or in any way connected with or related to your use of or conduct on the Website and/or your breach of this Agreement and/or any of your representations and warranties set forth above.
              </p>
              <p>
                CVeezy reserves the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will fully cooperate with, and fully indemnify, CVeezy in connection therewith.
              </p>
            </section>

            {/* Section 13: DISPUTE RESOLUTION BY MANDATORY BINDING ARBITRATION AND CLASS ACTION WAIVER */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. DISPUTE RESOLUTION BY MANDATORY BINDING ARBITRATION AND CLASS ACTION WAIVER
              </h2>
              <p>
                PLEASE READ THE FOLLOWING ARBITRATION AGREEMENT IN THIS SECTION 13 ("ARBITRATION AGREEMENT") CAREFULLY. IT REQUIRES YOU TO ARBITRATE DISPUTES WITH CVeezy AND LIMITS THE MANNER IN WHICH YOU CAN SEEK RELIEF FROM US.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.1. Applicability of Arbitration Agreement
              </h3>
              <p>
                This Arbitration Agreement governs any dispute between you and CVeezy (and each of our respective agents, corporate parents, subsidiaries, affiliates, predecessors in interest, successors, and assigns) including but not limited to claims arising out of or relating to any aspect of the relationship between you and CVeezy, whether based in contract, tort, statute, fraud, misrepresentation or any other legal theory; claims that arose before these Terms or any prior agreement; and claims that may arise after the termination of these Terms. However, (1) you may assert claims in small claims court if your claims qualify within the scope of your jurisdiction; and (2) you or CVeezy may seek equitable relief in court for infringement or other misuse of intellectual property rights (such as trademarks, trade dress, domain names, trade secrets, copyrights, and patents). This Arbitration Agreement shall apply, without limitation, to all claims that arose or were asserted before the effective date of these Terms or any prior version of these Terms.
              </p>
              <p>
                The relevant arbitrator shall have sole authority to determine applicability of the Arbitration Agreement in each particular case. In the event that a dispute involves both issues that are subject to arbitration and issues that are not subject to arbitration, the parties unequivocally agree that any legal proceeding regarding the issues not subject to arbitration shall be stayed pending resolution of the issues subject to arbitration.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.2. Initial Dispute Resolution
              </h3>
              <p>
                Most disputes can be resolved without resort to arbitration. If you have any dispute with CVeezy, you agree that before taking any formal action, you will contact us at help@cveezy.com, and provide a brief, written description of the dispute and your contact information. The parties agree to use their best efforts to settle any dispute, claim, question, or disagreement directly through consultation with CVeezy, and good faith negotiations will be a condition to either party initiating an arbitration.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.3. Binding Arbitration
              </h3>
              <p>
                If the parties do not reach an agreed-upon solution within a period of sixty (60) days from the time informal dispute resolution is initiated under the Initial Dispute Resolution provision above, then either party may initiate binding arbitration as the sole means to resolve claims subject to the terms set forth below. Specifically, all claims arising out of or relating to these Terms (including the Terms formation, performance, and breach), the parties relationship with each other, and/or your use of the Website will be finally settled by binding arbitration before one arbitrator administered by:
              </p>
              <ul className="list-disc ml-6">
                <li>(1) the London Court of International Arbitration ("LCIA") if you are not a U.S. resident. Disputes are subject to the most current version of the LCIA Arbitration Rules when the notice of arbitration is submitted. Information about the LCIA's rules can be found at https://www.lcia.org/Dispute_Resolution_Services/LCIA_Arbitration.aspx; or</li>
                <li>(2) JAMS if you are a U.S. resident. Disputes involving claims and counterclaims under $250,000, not inclusive of attorneys' fees and interest, shall be subject to JAMS's most current version of the Streamlined Arbitration Rules and procedures available at http://www.jamsadr.com/rules-streamlined-arbitration/; all other claims shall be subject to JAMS's most current version of the Comprehensive Arbitration Rules and Procedures, available at http://www.jamsadr.com/rules-comprehensive-arbitration/. JAMS's rules are also available at www.jamsadr.com or by calling JAMS at 800-352-5267.</li>
              </ul>
              <p>
                In each case the relevant arbitration rules will apply as modified by this Arbitration Agreement. In the event of a conflict between the applicable arbitration rules and these Terms, these Terms shall govern unless otherwise agreed by the parties and the relevant arbitrator.
              </p>
              <p>
                If the relevant administrator of arbitration is not available to arbitrate, the parties will select an alternative arbitral forum.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.4. Arbitration Proceedings
              </h3>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Initiating Arbitration.
              </h4>
              <p>
                To start an arbitration, you must follow instructions available at:
              </p>
              <ul className="list-disc ml-6">
                <li>1) https://www.lcia.org/adr-services/lcia-notes-for-parties.aspx#5.%20COMMENCING%20AN%20LCIA%20ARBITRATION for LCIA; or</li>
                <li>2) https://www.jamsadr.com/submit/ for JAMS.</li>
              </ul>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Arbitration Fees.
              </h4>
              <p>
                If you are a consumer and you initiate arbitration, the only fee required to be paid is $250 and the other part of the filing fee (if any) will be borne by us. If the arbitrator finds the arbitration initiated by you to be non-frivolous and/or not in bad faith, all other arbitration costs will be borne by CVeezy. If CVeezy initiates arbitration against you and you are a consumer, CVeezy will pay for all costs associated with the arbitration. The parties are responsible for paying their own attorneys fees unless the arbitration rules and/or applicable law provide otherwise.
              </p>
              <p>
                Should either party bring a dispute involving issues subject to arbitration in a forum other than arbitration, the court or the arbitrator shall have the authority to award reasonable costs, fees and expenses, including reasonable attorneys fees, incurred by the other party in successfully staying or dismissing, in whole or in part, such other proceeding or in otherwise enforcing compliance with this Arbitration Agreement.
              </p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Arbitrator Selection.
              </h4>
              <p>
                The arbitrator must be neutral, and you will have a reasonable opportunity to participate in the process of choosing the arbitrator.
              </p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Arbitration Hearings.
              </h4>
              <p>
                The arbitrator will conduct hearings, if any, by teleconference or videoconference (based on written and/or electronic filing of documents), rather than by personal appearances, unless the arbitrator determines upon request by you or by us that an in-person hearing is appropriate. Any in-person appearances will be held at a location which is reasonably convenient to both parties with due consideration of their ability to travel and other pertinent circumstances, provided that if you are a consumer, you have a right to an in-person hearing in your hometown area. If the parties are unable to agree on a location, such determination should be made by the administrator of arbitration or by the arbitrator.
              </p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Consumer Remedies.
              </h4>
              <p>
                If you are a consumer, remedies that would otherwise be available to you under applicable laws will remain available under this Arbitration Agreement, unless you retain the right to pursue such remedies in court as per this Agreement.
              </p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Discovery of Non-privileged Information.
              </h4>
              <p>
                As part of the arbitration, both you and we will have the opportunity for discovery of non-privileged information that is relevant to the claim.
              </p>
              <p>
                Upon either party's request, the arbitrator will issue an order requiring that confidential information of either party disclosed during the arbitration (whether in documents or orally) may not be used or disclosed except in connection with the arbitration or a proceeding to enforce the arbitration award and that any permitted filing of confidential information must be done under seal.
              </p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Communications with the Arbitrator.
              </h4>
              <p>
                Whenever communicating with the arbitrator, the parties must include each other - for example, by including the other party on a telephone conference call and copying the other party on any written submissions, such as letters or emails. To the extent practicable, conferences with the arbitrator will take place by telephone conference call or email. Ex parte communications are not permitted with any arbitrator.
              </p>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Choice of Law.
              </h4>
              <p>
                The arbitrator shall apply:
              </p>
              <ul className="list-disc ml-6">
                <li>1) if you are not a U.S. resident, the laws of England and Wales (also known as English Law), without regard to English Law's conflict of laws rules; or</li>
                <li>2) if you are a U.S. resident, Delaware law consistent with the Federal Arbitration Act and applicable statutes of limitations, and shall honor claims of privilege recognized at law.</li>
              </ul>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Arbitrator's Award.
              </h4>
              <p>
                An arbitrator's award will consist of a written statement stating the disposition of each claim. The award will also provide a concise written statement of the essential findings and conclusions on which the award is based. The arbitration award shall be final and binding on the parties. Judgment on the arbitrator's award may be entered in any court of competent jurisdiction.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.5. Class Action Waiver and Jury Trial Waiver
              </h3>
              <p>
                THE ARBITRATOR HAS NO AUTHORITY TO AWARD PUNITIVE DAMAGES. NEITHER YOU NOR CVeezy AGREES TO ANY ARBITRATION ON A CLASS BASIS, AND THE ARBITRATOR SHALL HAVE NO AUTHORITY TO PROCEED ON SUCH A BASIS. A PARTY MAY ASSERT A CLAIM OR COUNTERCLAIM ONLY IN THAT PARTY'S INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS PROCEEDING. THE ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF CLASS PROCEEDING. UNDER THE ARBITRATION AGREEMENT, ARBITRATOR SHALL NOT COMBINE OR CONSOLIDATE MORE THAN ONE PARTIES CLAIMS WITHOUT THE WRITTEN CONSENT OF ALL AFFECTED PARTIES TO AN ARBITRATION PROCEEDING.
              </p>
              <p>
                BY AGREEING TO THE ARBITRATION OF DISPUTES AS SET FORTH HEREIN, YOU AGREE THAT YOU ARE WAIVING YOUR RIGHT TO A JURY TRIAL AND LIMITING YOUR RIGHT TO APPEAL AND YOU UNDERSTAND THAT YOU ARE WAIVING YOUR RIGHTS TO OTHER AVAILABLE RESOLUTION PROCESSES, SUCH AS A COURT ACTION.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.6. Litigation of Intellectual Property and Small Claims Court Claims
              </h3>
              <p>
                Notwithstanding the parties decision to resolve all disputes through arbitration, either party may bring enforcement actions, validity determinations or claims arising from or relating to theft, piracy or unauthorized use of intellectual property in court with jurisdiction or in other relevant state authority to protect its intellectual property rights. Either party may also seek relief in a small claims court for disputes or claims within the scope of that court's jurisdiction.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.7. 30-Day Right to Opt Out
              </h3>
              <p>
                You have the right to opt out and not be bound by the arbitration and class action waiver provisions set forth above by sending electronic notice of your decision to opt out to help@cveezy.com with the subject line, 'ARBITRATION AND CLASS ACTION WAIVER OPT-OUT.' The notice must be sent within 30 days of (a) the effective date of these Terms; or (b) your first date that you used the Website that contained any versions of the Terms that substantially included this version of the Arbitration Agreement (including class action waiver), whichever is later. Otherwise, you will be bound to arbitrate disputes in accordance with the terms of these paragraphs. If you opt out of this Arbitration Agreement, CVeezy also will not be bound by it.
              </p>
              <p>
                In order to be effective, the opt out notice must include your full name and clearly indicate your intent to opt out of binding arbitration. By opting out of binding arbitration, you are agreeing to resolve disputes in accordance with Section 17.1 "Governing Law and Venue."
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.8. Severability of Arbitration Agreement
              </h3>
              <p>
                If any portion of this Arbitration Agreement is found to be unenforceable or unlawful for any reason, (a) the unenforceable or unlawful provision shall be severed from these Terms; (b) severance of the unenforceable or unlawful provision shall have no impact whatsoever on the remainder of this Arbitration Agreement or the parties ability to compel arbitration of any remaining claims on an individual basis pursuant to this Arbitration Agreement; and (c) to the extent that any claims must therefore proceed on a class, collective, consolidated, or representative basis, such claims must be litigated in court in accordance with Section 17.1 "Governing Law and Venue," and the parties agree that litigation of those claims shall be stayed pending the outcome of any individual claims in arbitration. Further, if any part of this Arbitration Agreement is found to prohibit an individual claim seeking public injunctive relief, that provision will have no effect to the extent such relief is allowed to be sought out of arbitration, and the remainder of this Arbitration Agreement will be enforceable.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                13.9. Survival
              </h3>
              <p>
                This Arbitration Agreement will survive any termination of your use of the Website.
              </p>
            </section>

            {/* Section 14: CHANGES TO THE AGREEMENT AND ITS PARTIES. NOTICES */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. CHANGES TO THE AGREEMENT AND ITS PARTIES. NOTICES
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                14.1. Changes to the Agreement
              </h3>
              <p>
                We reserve the right, at our sole discretion, to change the Agreement from time to time and at any time and without prior notice by
              </p>
              <ul className="list-disc ml-6">
                <li>a) posting the changed Agreement (or parts of it) to the Website; or</li>
                <li>b) otherwise giving you notice of the changes.</li>
              </ul>
              <p>
                The changes shall be effective upon such posting by us or upon us giving you such notice, whichever is the earlier (unless we expressly indicate otherwise). It is your responsibility to check the Website and your email account periodically for changes to these Terms and other parts of the Agreement. Your continued use of or access to the Website following the effective date of any changes to the Agreement constitutes acceptance of those changes. This Agreement may not be changed by you, unless any changes proposed by you are expressly accepted by CVeezy in writing. Any new features which are added to the Website shall also be subject to the Terms. In this clause, the terms "change" and "changed" in relation to changes to the Agreement shall be interpreted broadly and shall include any and all modifications, amendments, revisions and restatements whatsoever, including adding or removing any portions of this Agreement.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                14.2. Changes to Parties
              </h3>
              <p>
                We may assign or transfer all of our rights and obligations hereunder to any other person, whether by way of novation or otherwise, and you hereby give us consent to any such assignment and transfer. You agree that posting on this Website of a version of this Agreement indicating another person as a party to this Agreement will constitute sufficient notice to you of the transfer of our rights and obligations under the Agreement with you to that party (unless otherwise is expressly indicated).
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                14.3. Notices
              </h3>
              <p>
                Without prejudice to the provisions of the preceding clause, we may choose to notify you of changes to this Agreement by posting a notice via the Website, by sending you an email, or otherwise. If we choose to notify you about changes to this Agreement or about other matters by email, each such notification shall be effective and shall be deemed received by you immediately after being sent to the email address you have provided to us, even if:
              </p>
              <ul className="list-disc ml-6">
                <li>1) our email notification is filtered as a spam, junk, bulk, or other undesirable or low-priority message and is not displayed in your email inbox; or</li>
                <li>2) you do not actually read it for any other reason.</li>
              </ul>
              <p>
                To reduce the chance that it is so filtered, please add help@cveezy.com to your email contact book and whitelist this address as a "safe" or "approved" sender. In addition, you may wish to create a custom filter marking emails from this address as important emails for your high-priority inbox. Please contact your email service provider if you are not sure how to do any of that.
              </p>
            </section>

            {/* Section 15: TERM OF THE AGREEMENT */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. TERM OF THE AGREEMENT
              </h2>
              <p>
                This Agreement will take full force and effect when you access the Website and will remain in effect while you use the Website until your account is terminated for whatever reason. After your membership is terminated, all terms that by their nature may survive termination of this Agreement shall be deemed to survive such termination including, but not limited to, Sections 5-18. We reserve the right to take further action for our loss or the potential loss of other Users or third parties when necessary due to your breach of this Agreement, in our sole discretion.
              </p>
            </section>

            {/* Section 16: ELECTRONIC SIGNATURE */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                16. ELECTRONIC SIGNATURE
              </h2>
              <p>
                You further acknowledge and agree that by clicking on a button labeled "CONNECT NOW", "PAY", "BUY WITH GOOGLE PAY", "BUY WITH APPLE PAY", "I ACCEPT", "I AGREE" or similar links or buttons, you are submitting a legally binding electronic signature and are entering into a legally binding contract. You acknowledge that your electronic submissions constitute your agreement and intent to be bound by this Agreement.
              </p>
              <p>
                Pursuant to any applicable statutes, regulations, rules, ordinances or other laws, including without limitation the United States Electronic Signatures in Global and National Commerce Act, P.L. 106-229 (the "E-Sign Act") or other similar statutes, you hereby agree to the use of electronic signatures, contracts, orders and other records and to electronic delivery of notices, policies and records of transactions initiated or completed through the Website. Furthermore, you hereby waive any rights or requirements under any statutes, regulations, rules, ordinances or other laws in any jurisdiction which require an original signature, delivery or retention of non-electronic records, or to payments by other than electronic means.
              </p>
            </section>

            {/* Section 17: MISCELLANEOUS */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                17. MISCELLANEOUS
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                17.1. Governing Law and Venue
              </h3>
              <p>
                Except as otherwise specified herein, this Agreement shall be governed by and construed in accordance with the law of Cyprus. To the extent that any action relating to any dispute hereunder is for whatever reason not submitted to arbitration, each of the parties submits to the exclusive jurisdiction to the courts of England and Wales to settle any disputes which may arise out of or in connection with this Agreement and that accordingly the relevant proceedings must be brought in such courts. The parties irrevocably submit to the personal jurisdiction and venue of the courts of England and Wales and waive any defenses of improper venue or forum non conveniens.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                17.2. Entire Agreement. Severability
              </h3>
              <p>
                This Agreement and all other provisions referenced herein contain the entire agreement between you and CVeezy regarding the use of the Website. If any provision of this Agreement is held invalid, the remainder of this Agreement shall continue in full force and effect.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                17.3. No Waiver of Breach or Default
              </h3>
              <p>
                The failure to require performance of any provision will not affect our right to require performance at any time thereafter, nor will a waiver of any breach or default of this Agreement or any provision of this Agreement constitute a waiver of any subsequent breach or default or a waiver of the provision itself.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                17.4. Force Majeure
              </h3>
              <p>
                CVeezy shall not be responsible for any failure to perform due to unforeseen circumstances or to causes beyond our reasonable control, including but not limited to: acts of God, such as fire, flood, earthquakes, hurricanes, tropical storms or other natural disasters; war, riot, arson, embargoes, acts of civil or military authority, or terrorism; strikes, or shortages in transportation, facilities, fuel, energy, labor or materials; failure of the telecommunications or information services infrastructure; hacking, spam, or any failure of a computer, server or software, for so long as such event continues to delay CVeezy performance.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                17.5. Absence of Certain Kind of Relationship
              </h3>
              <p>
                You agree that no joint venture, partnership, employment, or agency relationship exists between you and CVeezy as a result of this Agreement or use of the Website.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                17.6. Use of Section Headers
              </h3>
              <p>
                Use of Section headers in this Agreement is for convenience only and will not have any impact on the interpretation of particular provisions.
              </p>
            </section>

            {/* Section 18: CONTACT INFORMATION */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                18. CONTACT INFORMATION
              </h2>
              <p>
                Please Contact Us with any questions regarding this Agreement.
              </p>
              <p>
                E-mail: help@cveezy.com
              </p>
              <p>
                Phone: +44 808 502 0312
              </p>
              <p>
                Attention of: Customer Support, CVeezy.
              </p>
              <p>
                All Rights Reserved.
              </p>
              <p>
                Customer Support: support@cveezy.com
              </p>
              <p>
                © 2025. TSFF Holdings Limited, Limassol, Cyprus. All rights reserved.
              </p>
            </section>
            

          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
