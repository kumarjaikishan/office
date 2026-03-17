import { ShieldCheck } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const LandingFooter = () => {
    return (
        <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-950">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-20">
                
                {/* LOGO */}
                <div className="space-y-6">
                    <div className="flex items-center text-white gap-2">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter uppercase">
                            EMS<span className="text-blue-600">.</span>
                        </span>
                    </div>
                    <p className="text-slate-400 dark:text-slate-400 text-sm">
                        Smart Employee Management System for modern enterprises.
                    </p>
                </div>

                {/* LEGAL */}
                <div>
                    <h4 className="font-extrabold mb-8 uppercase text-xs tracking-widest text-blue-600">
                        Legal
                    </h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-400">
                        <li><Link to="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
                        <li><Link to="/terms-conditions" className="hover:text-blue-600">Terms & Conditions</Link></li>
                        <li><Link to="/refund-policy" className="hover:text-blue-600">Refund Policy</Link></li>
                        <li><Link to="/cancellation-policy" className="hover:text-blue-600">Cancellation Policy</Link></li>
                    </ul>
                </div>

                {/* COMPANY */}
                <div>
                    <h4 className="font-extrabold mb-8 uppercase text-xs tracking-widest text-blue-600">
                        Company
                    </h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-400">
                        <li><Link to="/about" className="hover:text-blue-600">About</Link></li>
                        <li><Link to="/contact" className="hover:text-blue-600">Contact Us</Link></li>
                        <li><Link to="/pricing" className="hover:text-blue-600">Pricing</Link></li>
                    </ul>
                </div>

                {/* COMPLIANCE */}
                <div>
                    <h4 className="font-extrabold mb-8 uppercase text-xs tracking-widest text-blue-600">
                        Compliance
                    </h4>
                    <p className="text-sm text-slate-400">
                        Secure payments powered by trusted gateways. All transactions are encrypted.
                    </p>
                </div>
            </div>

            {/* BOTTOM */}
            <div className="max-w-7xl mx-auto pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    © {new Date().getFullYear()} EMS Global Technologies Inc.
                </p>

                {/* <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Link to="/privacy" className="hover:text-blue-600">Privacy</Link>
                    <Link to="/terms" className="hover:text-blue-600">Terms</Link>
                    <Link to="/cookies" className="hover:text-blue-600">Cookie Policy</Link>
                </div> */}
            </div>
        </footer>
    );
};

export default LandingFooter;