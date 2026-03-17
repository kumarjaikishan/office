import { Moon, ShieldCheck, Sun } from 'lucide-react'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const LandingNav = ({ isScrolled, toggleTheme, isDarkMode }) => {
      const user = useSelector((state) => state.user);
      useEffect(()=>{
    //    console.log(user)
      },[])

    return (
        <>
            {/* <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800' : 'py-6 bg-transparent'}`}> */}
            <nav className={`fixed w-full  z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link to='/'>
                        <div className="flex items-center gap-2 group cursor-pointer">


                            <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                                <ShieldCheck className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight uppercase">EMS<span className="text-blue-600">.</span></span>
                        </div>
                    </Link>

                    {/* right side */}
                    {/* right side */}
                    <div className="flex items-center gap-4">
                        <div className="hidden px-2 pr-4 border-r border-indigo-50 md:flex items-center text-white gap-8 font-medium">
                            <Link
                                className="hover:text-blue-600 transition-colors"
                                to="/pricing"
                            >
                                Pricing
                            </Link>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? (
                                <Sun size={20} className="text-yellow-400" />
                            ) : (
                                <Moon size={20} className="text-slate-600" />
                            )}
                        </button>

                        {/* 🔐 Auth UI */}
                        {!user ? (
                            <Link to="/login">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md active:scale-95">
                                    Sign In
                                </button>
                            </Link>
                        ) : (
                             <Link to="/dashboard">
                            <div className="flex items-center gap-3 cursor-pointer group">
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold uppercase">
                                    {user?.profile?.name?.charAt(0)}
                                </div>

                                {/* Name */}
                                <span className="hidden md:block font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition">
                                    {user?.profile?.name}
                                </span>
                            </div>
                            </Link>
                        )}
                    </div>
                </div>
            </nav >
        </>
    )
}

export default LandingNav
