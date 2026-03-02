import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 px-6 py-20">
      <div className="max-w-4xl mx-auto">

        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-lg">
            This Privacy Policy explains how Employee Management System (EMS)
            collects, uses, and protects your information.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-base leading-relaxed">

          {/* Introduction */}
          <section>
            <p>
              At <span className="text-white font-semibold">Employee Management System (EMS)</span>,
              we are committed to protecting the privacy and security of our users.
              This policy outlines how we collect, use, and safeguard personal
              and organizational data within our platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Information We Collect
            </h2>
            <ul className="space-y-3 list-disc list-inside text-slate-400">
              <li>
                <strong className="text-white">Personal Information:</strong>{" "}
                Name, email address, contact details, job role, and employment-related data.
              </li>
              <li>
                <strong className="text-white">Attendance & Payroll Data:</strong>{" "}
                Check-in/out logs, working hours, overtime records, salary components,
                deductions, and payroll calculations.
              </li>
              <li>
                <strong className="text-white">Biometric Data:</strong>{" "}
                Biometric identifiers processed through integrated hardware devices
                (such as fingerprint systems), where applicable and authorized.
              </li>
              <li>
                <strong className="text-white">Usage Data:</strong>{" "}
                Platform activity logs, IP addresses, browser type, and device information
                to improve system performance and security.
              </li>
            </ul>
          </section>

          {/* How We Use */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              How We Use Your Information
            </h2>
            <ul className="space-y-3 list-disc list-inside text-slate-400">
              <li>
                To manage employee records, attendance tracking, and payroll processing.
              </li>
              <li>
                To enforce role-based and attribute-based access control (RBAC & ABAC).
              </li>
              <li>
                To generate analytics, reports, and workforce insights.
              </li>
              <li>
                To maintain platform security and prevent unauthorized access.
              </li>
              <li>
                To provide customer support and service updates.
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Data Security
            </h2>
            <ul className="space-y-3 list-disc list-inside text-slate-400">
              <li>
                We implement industry-standard encryption and secure authentication mechanisms.
              </li>
              <li>
                Data is isolated in a multi-tenant architecture to ensure organizational separation.
              </li>
              <li>
                Regular monitoring and audits are conducted to maintain system integrity.
              </li>
            </ul>
          </section>

          {/* Third Party */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Third-Party Services
            </h2>
            <p className="text-slate-400">
              EMS may integrate with third-party services such as biometric device providers
              or payment gateways. We do not sell or share personal data with third parties
              except where required to deliver services or comply with legal obligations.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Data Retention
            </h2>
            <p className="text-slate-400">
              We retain organizational and employee data for as long as the account
              remains active or as required by applicable laws and compliance standards.
            </p>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Changes to This Policy
            </h2>
            <p className="text-slate-400">
              We may update this Privacy Policy periodically to reflect changes
              in our practices or legal requirements. Continued use of EMS
              indicates acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-slate-400">
              If you have any questions regarding this Privacy Policy, please contact:
            </p>
            <p className="text-blue-400 font-medium mt-2">
              privacy@emsplatform.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;