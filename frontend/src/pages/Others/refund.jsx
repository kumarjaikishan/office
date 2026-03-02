import React from "react";

const RefundAndCancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 px-6 py-20">
      <div className="max-w-4xl mx-auto">

        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Refund & Cancellation Policy
          </h1>
          <p className="text-slate-400 text-lg">
            Please read our refund and cancellation terms carefully before making a purchase.
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed">

          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Refund Policy
            </h2>
            <p className="text-slate-400">
              BattleFiesta operates under a <span className="text-white font-medium">strict no-refund policy</span>.
              Due to the digital and SaaS-based nature of our services, payments
              once processed are generally non-refundable.
            </p>
            <p className="text-slate-400 mt-4">
              Refunds may only be considered in cases where:
            </p>
            <ul className="list-disc list-inside space-y-3 mt-3 text-slate-400">
              <li>There has been a duplicate payment.</li>
              <li>A technical issue caused an unintended transaction.</li>
              <li>Refund is required by applicable law.</li>
            </ul>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. Cancellation Policy
            </h2>
            <p className="text-slate-400">
              Users may request cancellation of their subscription or membership
              at any time by contacting our support team.
            </p>
            <p className="text-slate-400 mt-4">
              However, cancellation does not entitle the user to a refund of
              previously paid fees. Access to services will continue until the
              end of the active billing cycle unless stated otherwise.
            </p>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Support & Assistance
            </h2>
            <p className="text-slate-400">
              We are committed to delivering exceptional service and support.
              If you experience any issues, please reach out to our team before
              initiating disputes or chargebacks.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-800 pt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-slate-400">
              For refund or cancellation inquiries, contact:
            </p>
            <p className="text-blue-400 font-medium mt-2">
              billing@battlefiesta.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RefundAndCancellationPolicy;