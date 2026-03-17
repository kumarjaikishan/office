import React, { useEffect, useRef, useState } from 'react';
import {
    CheckCircle2,
    ShieldCheck,
    Zap,
    Users,
    BarChart3,
    Building2,
    Globe,
    Briefcase,
    Layers,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

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

const EMSPricing = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        }
    }, []);

 const handlePayment = async (plan) => {
    if (plan.price === "Custom") {
        toast.info("Please contact sales for enterprise plan");
        return;
    }

    setIsProcessing(true);

    try {
        // 🔹 Create order
        const res = await fetch(`${import.meta.env.VITE_API_ADDRESS}create-order`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("emstoken")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                plan: plan.name.includes("STARTUP") ? "STARTUP" : "PRO"
            })
        });

        const order = await res.json();

        console.log("🧾 ORDER CREATED:", order);

        if (!order?.id) {
            throw new Error("Order creation failed");
        }

        const options = {
            key: 'rzp_test_24l81VEe4kldIm',
            amount: order.amount,
            currency: "INR",
            name: "EMS Pro Solutions",
            description: plan.name,
            order_id: order.id,

            // ✅ SUCCESS
            handler: async function (response) {
                console.log("✅ PAYMENT SUCCESS:", response);

                try {
                    const verifyRes = await fetch(`${import.meta.env.VITE_API_ADDRESS}verify-payment`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(response),
                    });

                    const data = await verifyRes.json();

                    console.log("🔐 VERIFY RESPONSE:", data);

                    if (data.success) {
                        toast.success("Payment Successful 🎉");
                    } else {
                        toast.error("Verification Failed ❌");
                    }
                } catch (err) {
                    console.error("❌ VERIFY ERROR:", err);
                    toast.error("Server verification failed");
                }

                setIsProcessing(false);
            },

            // 🚫 CANCEL
            modal: {
                ondismiss: function () {
                    console.log("🚫 USER CANCELLED PAYMENT");
                    toast.info("Payment Cancelled");
                    setIsProcessing(false);
                }
            },

            prefill: {
                name: "Client Name",
                email: "admin@company.com",
            },

            theme: {
                color: "#f97316",
            },
        };

        const rzp = new window.Razorpay(options);

        // ❌ FAILURE
        rzp.on("payment.failed", function (response) {
            console.error("❌ PAYMENT FAILED:", response.error);

            toast.error(
                response.error.description || "Payment Failed ❌"
            );

            setIsProcessing(false);
        });

        rzp.open();

    } catch (err) {
        console.error("❌ PAYMENT INIT ERROR:", err);
        toast.error("Something went wrong while initiating payment");
        setIsProcessing(false);
    }
};

        const pricingPlans = [
        {
            name: "STARTUP HUB",
            price: "₹2",
            duration: "/MO",
            features: [
                "Up to 25 Employees",
                "Basic Attendance Tracking",
                "Automated Leave Management",
                "Digital Document Storage",
                "Mobile App Access"
            ],
            isPopular: false,
            icon: <Building2 size={18} />
        },
        {
            name: "BUSINESS PRO",
            price: "₹3",
            duration: "/MO",
            features: [
                "Unlimited Employees",
                "Advanced Payroll Engine",
                "Performance Analytics",
                "Biometric Integration",
                "Custom Approval Workflows",
                "Priority Support"
            ],
            isPopular: true,
            tag: "MOST DEPLOYED",
            icon: <Layers size={18} />
        },
        {
            name: "ENTERPRISE",
            price: "Custom",
            duration: "",
            features: [
                "Global Multi-Office Sync",
                "Dedicated Account Manager",
                "Full API Access",
                "Custom Feature Development",
                "White-labeling Options",
                "SLA Guarantees"
            ],
            isPopular: false,
            icon: <Globe size={18} />
        }
    ];

    return (
        <section className="py-24 px-6 bg-black text-white relative overflow-hidden min-h-screen flex items-center font-sans">
            {/* Background Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                <div className="text-center mb-20">
                    <Reveal>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
                            <ShieldCheck size={14} /> Enterprise-Grade Security
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic leading-none">
                            SCALE YOUR <span className="text-orange-500">OPERATIONS</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                            Deploy the ultimate workforce infrastructure. Engineered for precision management,
                            data-driven insights, and seamless employee experiences.
                            <span className="block mt-2 font-medium text-gray-300">Choose the engine that drives your growth.</span>
                        </p>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {pricingPlans.map((plan, i) => (
                        <Reveal key={i} className={`delay-${i * 150}`}>
                            <div className={`relative h-full p-10 rounded-[2.5rem] border transition-all duration-500 group flex flex-col ${plan.isPopular
                                ? 'bg-[#0a0a0a] border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.1)] scale-105 z-10'
                                : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                                }`}>

                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg whitespace-nowrap">
                                        {plan.tag}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center border ${plan.isPopular ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' : 'bg-neutral-800 border-neutral-700 text-gray-400'
                                        }`}>
                                        {plan.icon}
                                    </div>
                                    <p className={`text-xs font-bold tracking-[0.2em] uppercase mb-4 ${plan.isPopular ? 'text-orange-500' : 'text-gray-500'}`}>
                                        {plan.name}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black tracking-tighter">
                                            {plan.price}
                                        </span>
                                        {plan.duration && (
                                            <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">
                                                {plan.duration}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-5 mb-12 flex-grow">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-4 text-sm">
                                            <div className={`mt-0.5 rounded-full p-0.5 border ${plan.isPopular ? 'border-orange-500/50 text-orange-500' : 'border-neutral-700 text-neutral-600'
                                                }`}>
                                                <CheckCircle2 size={12} strokeWidth={3} />
                                            </div>
                                            <span className={`${plan.isPopular ? 'text-gray-200' : 'text-gray-400'} font-medium`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePayment(plan)}
                                    disabled={isProcessing}
                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${plan.isPopular
                                        ? 'bg-orange-500 text-black hover:bg-orange-400 shadow-[0_10px_30px_rgba(249,115,22,0.2)]'
                                        : 'bg-neutral-800/80 border border-neutral-700 text-white hover:bg-neutral-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    {isProcessing ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        plan.price === "Custom" ? "Contact Solutions" : "Upgrade Now"
                                    )}
                                </button>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal className="mt-24">
                    <div className="p-8 md:p-12 rounded-[3rem] bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Need a tailored office solution?</h3>
                            <p className="text-gray-400">Our consultants can build a custom workspace environment for your specific needs.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-neutral-800 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="Expert" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <p className="font-bold">24/7 Support</p>
                                <p className="text-blue-400">Join 500+ Companies</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

export default function Membership() {
    return <EMSPricing />;
}