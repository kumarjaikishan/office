import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    Clock,
    CreditCard,
    BookOpen,
    Lock,
    Key,
    ChevronRight,
    CheckCircle2,
    Smartphone,
    LayoutDashboard,
    Database,
    ArrowRight,
    TrendingUp,
    Globe,
    Award,
    Briefcase,
    Star,
    Zap
} from 'lucide-react';

// Custom Hook for Scroll Animations
const useScrollReveal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => setIsVisible(entry.isIntersecting));
        }, { threshold: 0.1 });

        const current = domRef.current;
        if (current) observer.observe(current);
        return () => {
            if (current) observer.unobserve(current);
        };
    }, []);

    return [domRef, isVisible];
};

// Animation Component Wrapper
const Reveal = ({ children, className = "" }) => {
    const [ref, isVisible] = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                } ${className}`}
        >
            {children}
        </div>
    );
};

// Component for Text-Only Count-Up Animation
const Counter = ({ value, isVisible }) => {
    const [count, setCount] = useState(0);
    const target = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const suffix = value.replace(/[0-9]/g, '');

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16); // ~60fps

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isVisible, target]);

    return <span>{count}{suffix}</span>;
};

const LandingPage = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const stats = [
        { label: "Companies Joined", value: "100+", icon: <Briefcase className="w-5 h-5" /> },
        { label: "Employees Registered", value: "2000+", icon: <Users className="w-5 h-5" /> },
        { label: "System Uptime", value: "99.99%", icon: <Globe className="w-5 h-5" /> },
        { label: "Payroll Processed", value: "12M+", icon: <TrendingUp className="w-5 h-5" /> }
    ];

    const features = [
        {
            title: "Attendance Tracking",
            description: "Real-time clock-in/out with geofencing and biometric integration options.",
            icon: <Clock className="w-6 h-6 text-blue-500" />
        },
        {
            title: "Payroll Automation",
            description: "Automated salary calculations, tax deductions, and one-click payslip generation.",
            icon: <CreditCard className="w-6 h-6 text-emerald-500" />
        },
        {
            title: "Advance & Ledger",
            description: "Seamlessly manage employee advances and maintain detailed financial ledgers.",
            icon: <BookOpen className="w-6 h-6 text-purple-500" />
        },
        {
            title: "Employee Self-Service",
            description: "Dedicated portal for employees to view their specific attendance and salary history.",
            icon: <Users className="w-6 h-6 text-orange-500" />
        }
    ];

    const securitySpecs = [
        {
            title: "JWT Authentication",
            desc: "State-of-the-art JSON Web Tokens for secure, stateless session management."
        },
        {
            title: "RBAC (Role-Based)",
            desc: "Granular access controls based on organizational hierarchy (Admin, Manager, Employee)."
        },
        {
            title: "ABAC (Attribute-Based)",
            desc: "Context-aware permissions. Employees can only access their specific records based on identity attributes."
        }
    ];

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>


            <section className="relative pt-32 lg:pt-48 pb-20 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <Reveal className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-100 dark:border-blue-800">
                            <Award size={16} /> Secure Employee Management System
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                            Next-Gen EMS <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                                For Modern Teams.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                            Automate attendance, payroll, and financial ledgers. A secure platform where employees track their own growth through dedicated self-service portals.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 flex items-center gap-2 transition-all hover:-translate-y-1">
                                Start Free Trial <ChevronRight size={20} />
                            </button>
                            <button className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                                Watch Demo
                            </button>
                        </div>
                    </Reveal>

                    <Reveal className="relative group">
                        <div className="relative z-10 bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 transform rotate-2 group-hover:rotate-0 transition-transform duration-700">
                            <div className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] overflow-hidden aspect-[4/3] relative">
                                <svg viewBox="0 0 800 600" className="w-full h-full fill-none">
                                    <rect x="0" y="0" width="800" height="60" fill="currentColor" className="text-slate-100 dark:text-slate-900" />
                                    <circle cx="30" cy="30" r="10" fill="#3b82f6" />
                                    <rect x="60" y="25" width="100" height="10" rx="5" fill="#e2e8f0" />
                                    <rect x="0" y="60" width="180" height="540" fill="currentColor" className="text-slate-50 dark:text-slate-900/50" />
                                    {[120, 160, 200, 240].map(y => (
                                        <rect key={y} x="20" y={y} width="140" height="12" rx="6" fill="#cbd5e1" opacity="0.3" />
                                    ))}
                                    <rect x="210" y="90" width="260" height="140" rx="16" fill="white" className="shadow-sm dark:fill-slate-800" stroke="#e2e8f0" strokeWidth="1" />
                                    <rect x="230" y="110" width="40" height="40" rx="10" fill="#dcfce7" />
                                    <rect x="285" y="115" width="120" height="10" rx="5" fill="#94a3b8" />
                                    <rect x="285" y="135" width="80" height="15" rx="5" fill="#10b981" />
                                    <rect x="500" y="90" width="260" height="140" rx="16" fill="white" className="shadow-sm dark:fill-slate-800" stroke="#e2e8f0" strokeWidth="1" />
                                    <rect x="520" y="110" width="40" height="40" rx="10" fill="#dbeafe" />
                                    <rect x="575" y="115" width="120" height="10" rx="5" fill="#94a3b8" />
                                    <rect x="575" y="135" width="80" height="15" rx="5" fill="#3b82f6" />
                                    <path d="M210 500 L210 300 Q210 280 230 280 L730 280 Q750 280 750 300 L750 500 Q750 520 730 520 L230 520 Q210 520 210 500" fill="white" className="dark:fill-slate-800" stroke="#e2e8f0" />
                                    <path d="M250 480 L350 420 L450 450 L550 350 L650 380 L720 320" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="250" cy="480" r="5" fill="#3b82f6" />
                                    <circle cx="720" cy="320" r="5" fill="#3b82f6" />
                                </svg>
                                <div className="absolute top-10 right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-blue-500/20 animate-bounce flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500">Payroll Success</p>
                                        <p className="text-xs font-bold">$28k Released</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -z-10 -bottom-10 -right-10 w-full h-full bg-blue-600/10 rounded-full blur-3xl scale-110"></div>
                    </Reveal>
                </div>
            </section>


            <section id="features" className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <Reveal>
                            <h2 className="text-4xl font-bold mb-4">Powerful Employee Operations</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                                Everything you need to run your organization's backend operations in one integrated, secure environment.
                            </p>
                        </Reveal>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <Reveal key={i} className={`delay-${i * 100}`}>
                                <div className="h-full p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-xl transition-all group">
                                    <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform w-fit">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.description}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portal Section */}
            <section id="portal" className="py-24 px-6 bg-slate-50 dark:bg-slate-950/30">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <Reveal className="flex-1 space-y-6">
                        <h2 className="text-4xl font-bold">Self-Service Transparency</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                            Build trust with your workforce. Give every employee a unique ID and password to access their personal records without calling HR.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 pt-4">
                            {['Attendance Logs', 'Salary History', 'Personal Ledgers', 'Advance Requests'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                    <span className="font-semibold text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal className="flex-1 w-full max-w-md relative">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-8 text-white shadow-2xl relative z-10 border-4 border-white dark:border-slate-800">
                            <div className="flex justify-between items-center mb-10">
                                <Smartphone size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Secure Portal</span>
                            </div>
                            <div className="space-y-6">
                                <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                    <p className="text-xs opacity-80 mb-1">Your Total Attendance (March)</p>
                                    <p className="text-3xl font-bold italic tracking-tight">22 / 26 Days</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-3/4 rounded-full"></div>
                                    </div>
                                    <p className="text-[10px] text-center opacity-70 italic">85% Present this month</p>
                                </div>
                                <button className="w-full py-4 bg-white text-blue-700 font-extrabold rounded-2xl text-sm shadow-lg shadow-blue-900/40 hover:scale-[1.02] transition-transform active:scale-95">
                                    View Full Salary Ledger
                                </button>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/30 rounded-full blur-[100px] -z-10"></div>
                    </Reveal>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 -skew-x-12 transform origin-top translate-x-1/4"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <Reveal className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest mb-4">
                                <Lock size={18} /> Enterprise Grade Security
                            </div>
                            <h2 className="text-5xl font-bold leading-tight tracking-tight">Backend fortified <br />with JWT & ABAC.</h2>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-3xl flex items-center gap-6">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                                    <Key className="text-blue-400" />
                                </div>
                                <span className="text-[10px] font-bold opacity-60">JWT</span>
                            </div>
                            <div className="w-[1px] h-12 bg-white/10"></div>
                            <div className="text-center">
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                                    <LayoutDashboard className="text-blue-400" />
                                </div>
                                <span className="text-[10px] font-bold opacity-60">RBAC</span>
                            </div>
                            <div className="w-[1px] h-12 bg-white/10"></div>
                            <div className="text-center">
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                                    <Database className="text-blue-400" />
                                </div>
                                <span className="text-[10px] font-bold opacity-60">ABAC</span>
                            </div>
                        </div>
                    </Reveal>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {securitySpecs.map((spec, i) => (
                            <Reveal key={i} className={`delay-${i * 150}`}>
                                <div className="group p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/50 transition-all duration-500">
                                    <div className="w-12 h-12 bg-blue-600/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="text-blue-400" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{spec.title}</h3>
                                    <p className="text-slate-400 leading-relaxed italic">"{spec.desc}"</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal className="mt-24 p-12 bg-gradient-to-br from-blue-900/60 via-indigo-900/60 to-slate-900 rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
                        <div className="text-center md:text-left space-y-2">
                            <p className="text-2xl font-bold mb-2">Ready to secure your business operations?</p>
                            <p className="text-slate-400 font-medium">Join 100+ top-tier companies using our infrastructure daily.</p>
                        </div>
                        <button className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-colors shadow-xl flex items-center gap-3">
                            Book Your Demo <ArrowRight size={22} />
                        </button>
                    </Reveal>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="pb-24 mt-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, i) => {
                            const [statRef, isVisible] = useScrollReveal();
                            return (
                                <div
                                    key={i}
                                    ref={statRef}
                                    className={`text-center p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/20">
                                        {stat.icon}
                                    </div>
                                    <h3 className="text-4xl font-bold mb-2 tracking-tight">
                                        <Counter value={stat.value} isVisible={isVisible} />
                                    </h3>
                                    <p className="text-neutral-500 font-medium tracking-wide uppercase text-xs">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;