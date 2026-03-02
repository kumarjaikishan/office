import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 px-6 py-20">
      <div className="max-w-4xl mx-auto">

        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Terms & Conditions
          </h1>
          <p className="text-slate-400 text-lg">
            Please read these terms carefully before using the Employee Management System (EMS).
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed">

          {/* Introduction */}
          <section>
            <p>
              Welcome to{" "}
              <span className="text-white font-semibold">
                Employee Management System (EMS)
              </span>.
              By accessing or using our platform, you agree to comply with
              and be bound by these Terms and Conditions. If you do not agree,
              please do not use our services.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Account Registration & Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li>
                You must provide accurate and complete organizational and user information.
              </li>
              <li>
                Account administrators are responsible for managing user access and permissions.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of login credentials.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. Acceptable Use
            </h2>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li>
                EMS must be used only for lawful workforce management purposes.
              </li>
              <li>
                You may not attempt to disrupt, hack, or misuse the system.
              </li>
              <li>
                Misuse of biometric or payroll data is strictly prohibited.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Data Ownership
            </h2>
            <p className="text-slate-400">
              Organizations retain ownership of their employee and operational data.
              EMS acts as a data processor and provides secure infrastructure
              to store and manage that data within a multi-tenant architecture.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Biometric & Payroll Data
            </h2>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li>
                Biometric integrations must comply with applicable local data protection laws.
              </li>
              <li>
                Payroll calculations are automated based on configured rules;
                organizations are responsible for verifying payroll outputs.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Subscription & Payments
            </h2>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li>
                EMS may operate on a subscription-based pricing model.
              </li>
              <li>
                Payments made for subscriptions are subject to our Refund & Cancellation Policy.
              </li>
              <li>
                Failure to make timely payments may result in suspension of services.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-slate-400">
              All software, branding, design elements, and proprietary
              technology related to EMS remain the intellectual property
              of EMS. Unauthorized copying or redistribution is prohibited.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Limitation of Liability
            </h2>
            <ul className="list-disc list-inside space-y-3 text-slate-400">
              <li>
                EMS is provided "as is" without warranties of uninterrupted operation.
              </li>
              <li>
                We are not liable for indirect or consequential damages
                arising from system use, downtime, or data inaccuracies.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Termination
            </h2>
            <p className="text-slate-400">
              We reserve the right to suspend or terminate accounts
              that violate these Terms and Conditions.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-slate-400">
              These Terms may be updated periodically. Continued use of EMS
              after updates implies acceptance of the revised terms.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-slate-400">
              For legal inquiries regarding these Terms:
            </p>
            <p className="text-blue-400 font-medium mt-2">
              legal@emsplatform.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;