import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Globe, 
  ArrowRight, 
  Menu, 
  X, 
  Clock, 
  Lock, 
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Clock className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">Attendly<span className="text-indigo-600">Pro</span></span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Benefits</a>
              <button className="text-sm font-semibold text-slate-700 hover:text-indigo-600">Login</button>
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4">
            <a href="#features" className="block text-slate-600">Features</a>
            <a href="#how-it-works" className="block text-slate-600">How It Works</a>
            <button className="w-full text-left font-semibold">Login</button>
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg">Get Started</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full">
              Enterprise Attendance Management
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
              Manage your workforce <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">with precision.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              A scalable, multi-tenant platform featuring RBAC/ABAC security, real-time analytics, and seamless HR integration. Built for modern enterprises.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                Request Demo <ArrowRight size={20} />
              </button>
              <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                View Features
              </button>
            </div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div 
            className="mt-16 relative mx-auto max-w-5xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <div className="rounded-xl overflow-hidden border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 hidden lg:block bg-white p-4 rounded-xl shadow-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="text-green-600 w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-medium">System Status</p>
                  <p className="text-sm font-bold text-slate-800">99.9% Uptime Verified</p>
                </div>
              </div>
            </div>
          </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Powerful Features for Modern Teams</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to manage attendance, access, and reporting in one unified interface.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-indigo-600" />}
              title="Attendance Tracking"
              desc="Real-time check-ins, geo-fencing, and automated timesheets with high accuracy."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-indigo-600" />}
              title="RBAC & ABAC Security"
              desc="Fine-grained access control based on roles and attributes for enterprise security."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
              title="Advanced Analytics"
              desc="Comprehensive reports on employee productivity and attendance trends."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-indigo-600" />}
              title="Multi-Tenant Support"
              desc="Manage multiple organizations or branches under a single master dashboard."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
              title="Secure JWT Auth"
              desc="Industry-standard authentication and encrypted data storage for peace of mind."
            />
            <FeatureCard 
              icon={<LayoutDashboard className="w-6 h-6 text-indigo-600" />}
              title="HR Dashboard"
              desc="A dedicated workspace for HR teams to manage leaves, shifts, and requests."
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">Deploy in minutes, <br />Scale for years.</h2>
              <div className="space-y-8">
                <Step number="01" title="Register Organization" desc="Create your workspace and configure multi-tenant settings tailored to your company structure." />
                <Step number="02" title="Onboard Employees" desc="Bulk upload employees or invite them via email. Assign specific roles and attributes." />
                <Step number="03" title="Track & Monitor" desc="Employees log time via web or mobile. HR monitors real-time dashboards." />
                <Step number="04" title="Automated Reports" desc="Export payroll-ready reports and performance analytics with one click." />
              </div>
            </div>
            <div className="lg:w-1/2 bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 opacity-10 uppercase font-black text-9xl">Work</div>
               <h3 className="text-2xl font-bold mb-6">Admin Quick View</h3>
               <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center justify-between border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full" />
                        <div className="h-4 w-24 bg-white/30 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-green-400/40 rounded-full" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">Why Global HR Teams Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Benefit title="80%" desc="Reduction in Manual Data Entry" />
            <Benefit title="100%" desc="Compliance with Labor Laws" />
            <Benefit title="24/7" desc="Real-time Cloud Visibility" />
            <Benefit title="Zero" desc="Hidden Infrastructure Costs" />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2rem] p-8 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 relative z-10">Start Managing Attendance Smarter</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
            Join 500+ companies streamlining their workforce management with our MERN-powered solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all">
              Get Started for Free
            </button>
            <button className="bg-transparent border border-slate-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-indigo-600 w-6 h-6" />
                <span className="text-xl font-bold text-slate-800">AttendlyPro</span>
              </div>
              <p className="text-slate-500 max-w-xs leading-relaxed">
                Modernizing workforce management with secure, scalable, and intuitive attendance solutions for the digital age.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-slate-800">Product</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-slate-800">Company</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-slate-800">Contact</h4>
              <p className="text-sm text-slate-500 mb-2">support@attendly.pro</p>
              <div className="flex gap-4 mt-4">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} AttendlyPro SaaS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
  >
    <div className="mb-4 bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm border border-slate-100">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm lg:text-base">{desc}</p>
  </motion.div>
);

const Step = ({ number, title, desc }) => (
  <div className="flex gap-6">
    <div className="flex-shrink-0 w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-indigo-600 shadow-sm">
      {number}
    </div>
    <div>
      <h4 className="text-lg font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-slate-500 text-sm lg:text-base leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Benefit = ({ title, desc }) => (
  <div className="p-6">
    <div className="text-4xl font-extrabold text-indigo-600 mb-2">{title}</div>
    <div className="text-slate-600 font-medium">{desc}</div>
  </div>
);

export default LandingPage;