import React from "react";
import { motion } from "framer-motion";
import {
    FiUsers,
    FiShield,
    FiBarChart2,
    FiClock,
    FiDollarSign,
    FiUserCheck,
} from "react-icons/fi";
import Footer from "../../components/footer/Footer";
import { Link } from "react-router-dom";

export default function EMSLandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                        Smart Employee Management System
                    </h2>

                    <p className="text-lg text-slate-300 mb-8">
                        A multi-tenant MERN stack solution to manage employee attendance,
                        salary calculation, biometric integrations, and real-time
                        reporting — built for modern organizations.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-blue-600 hover:bg-blue-700 transition px-8 py-4 rounded-2xl text-lg font-medium">
                            Live Demo
                        </button>

                        <button className="border border-slate-600 hover:border-blue-500 hover:text-blue-400 transition px-8 py-4 rounded-2xl text-lg font-medium">
                            Documentation
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-700"
                >
                    <div className="grid grid-cols-2 gap-6">
                        <StatCard
                            icon={<FiUsers size={28} />}
                            title="Multi-Tenant"
                            desc="Manage multiple organizations seamlessly."
                        />
                        <StatCard
                            icon={<FiShield size={28} />}
                            title="RBAC & ABAC"
                            desc="Advanced access control for secure management."
                        />
                        <StatCard
                            icon={<FiUserCheck size={28} />}
                            title="Biometric Sync"
                            desc="Live biometric device integration."
                        />
                        <StatCard
                            icon={<FiBarChart2 size={28} />}
                            title="Real-Time Analytics"
                            desc="Live dashboards & attendance insights."
                        />
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div class="text-center max-w-3xl mx-auto mb-16 reveal">
                        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to manage your workforce</h2>
                        <p class="text-slate-400">Automate tedious HR tasks, track time accurately, and generate payroll seamlessly with our all-in-one suite.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<FiClock size={30} />}
                            title="Attendance Tracking"
                            desc=" Accurate clock-ins across devices. Supports shifts, overtime, and leave management with automated approval workflows."
                        />
                        <FeatureCard
                            icon={<FiDollarSign size={30} />}
                            title="Salary Calculation"
                            desc=" Dynamic payroll engine tied directly to attendance. Handles taxes, deductions, bonuses, and generates compliant payslips instantly."
                        />
                        <FeatureCard
                            icon={<FiBarChart2 size={30} />}
                            title="Advanced Reporting"
                            desc=" Exportable multi-format reports for management. Get actionable insights into absenteeism, departmental costs, and workforce efficiency."
                        />
                    </div>
                </div>
            </section>


            <section id="highlights" class="py-24 relative">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">


                        <div class="group relative overflow-hidden rounded-3xl bg-slate-800/30 border border-white/5 p-8 hover:bg-slate-800/50 transition-colors reveal">
                            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg class="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z"></path></svg>
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-2 relative z-10">Multi-Tenant Architecture</h3>
                            <p class="text-slate-400 mb-6 relative z-10 max-w-sm">Manage multiple organizations or subsidiaries from a single MERN stack instance with isolated databases and configurations.</p>
                            <div class="flex gap-2 relative z-10">
                                <span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">MongoDB</span>
                                <span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">Express</span>
                                <span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">React</span>
                                <span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">Node.js</span>
                            </div>
                        </div>


                        <div class="group relative overflow-hidden rounded-3xl bg-slate-800/30 border border-white/5 p-8 hover:bg-slate-800/50 transition-colors reveal delay-100">
                            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg class="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-2 relative z-10">RBAC & ABAC Security</h3>
                            <p class="text-slate-400 mb-6 relative z-10 max-w-sm">Enterprise-grade security. Define granular access based on user roles (Admin, HR, Employee) and specific attributes (Location, Department).</p>
                            <a href="#" class="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 relative z-10">
                                View Security Docs <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </a>
                        </div>


                        <div class="group relative overflow-hidden rounded-3xl bg-slate-800/30 border border-white/5 p-8 hover:bg-slate-800/50 transition-colors reveal">
                            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg class="w-24 h-24 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
                            </div>
                            <h3 class="text-2xl font-bold text-white mb-2 relative z-10">Live Biometric Sync</h3>
                            <p class="text-slate-400 relative z-10 max-w-sm">Hardware agnostic. Connect fingerprint scanners and facial recognition devices directly via secure APIs for real-time punch data.</p>
                        </div>


                        <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-500/20 p-8 hover:border-blue-500/40 transition-colors reveal delay-100">
                            <h3 class="text-2xl font-bold text-white mb-2 relative z-10">Real-Time Analytics</h3>
                            <p class="text-slate-400 mb-6 relative z-10 max-w-sm">Live dashboards built with WebSockets. Monitor employee presence, track live working hours, and predict overtime costs instantly.</p>


                            <div class="flex items-end gap-2 h-12 relative z-10 mt-4">
                                <div class="w-8 bg-blue-500/40 rounded-t-sm h-1/3 animate-pulse-slow"></div>
                                <div class="w-8 bg-blue-500/60 rounded-t-sm h-2/3 animate-pulse-slow delay-100"></div>
                                <div class="w-8 bg-indigo-500/80 rounded-t-sm h-full animate-pulse-slow delay-200"></div>
                                <div class="w-8 bg-blue-500/50 rounded-t-sm h-1/2 animate-pulse-slow delay-300"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* Analytics Section */}
            <section id="analytics" className="py-24">
                <div className="max-w-5xl mx-auto text-center px-6 md:px-8">
                    <h3 className="text-3xl md:text-4xl font-bold mb-6">
                        Live Dashboard & Insights
                    </h3>

                    <p className="text-slate-300 text-lg mb-12">
                        Monitor employee presence, absenteeism trends, payroll summaries,
                        and biometric logs — all in real-time with dynamic visualizations.
                    </p>

                    <div className="bg-slate-900 rounded-2xl p-12 border border-slate-700 shadow-xl">
                        <p className="text-slate-400">Dashboard Preview Placeholder</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-center px-6">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Modernize Your Workforce?
                </h3>

                <p className="mb-8 text-lg">
                    Start managing attendance smarter today.
                </p>
                <Link to="/">
                    <button className="rounded-2xl px-10 py-5 text-lg bg-white text-black font-semibold hover:bg-slate-200 transition">
                        Get Started Now
                    </button>
                </Link>

            </section>

        </div>
    );
}

function StatCard({ icon, title, desc }) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/10 transition">
            <div className="mb-4 text-blue-400">{icon}</div>
            <h4 className="text-xl font-semibold mb-2">{title}</h4>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -6 }}
            className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl transition"
        >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400">{icon}</div>
            <h4 className="text-2xl font-semibold mb-4">{title}</h4>
            <p className="text-slate-400">{desc}</p>
        </motion.div>
    );
}