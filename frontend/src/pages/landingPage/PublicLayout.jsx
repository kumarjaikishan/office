
import { Outlet } from "react-router-dom";
import LandingNav from "./LandingNav";
import LandingFooter from "./LandingFooter";
import { useEffect, useState } from "react";

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

const PublicLayout = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);


    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    // ✅ ADD THIS
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <>
            {/* <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white"> */}
            <LandingNav isScrolled={isScrolled} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <Outlet />
            <LandingFooter />
            {/* </div> */}
        </>
    );
};

export default PublicLayout;