import { Link } from "react-router-dom";

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div>
          <h2 className="text-white text-xl font-bold mb-4">EMS</h2>
          <p className="text-sm">
            Smart Employee Management System for modern enterprises.
            Attendance, payroll, analytics & biometric integrations.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
            <li><Link to="/cancellation-policy" className="hover:text-white">Cancellation Policy</Link></li>
          </ul>
        </div>

        {/* Compliance */}
        <div>
          <h3 className="text-white font-semibold mb-4">Compliance</h3>
          <p className="text-sm">
            Secure payments powered by trusted payment gateway providers.
            All transactions are encrypted and secure.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800 text-center py-6 text-sm">
        © {new Date().getFullYear()} EMS - Employee Management System. All rights reserved.
      </div>
    </footer>
  );
}