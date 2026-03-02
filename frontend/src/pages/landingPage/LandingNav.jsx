import { Link } from "react-router-dom"

const LandingNav = () => {
    return (
        <>
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold tracking-wide">EMS</h1>

                <div className="space-x-6 hidden md:flex text-sm">
                    <a href="#features" className="hover:text-blue-400 transition">
                        Features
                    </a>
                    <a href="#analytics" className="hover:text-blue-400 transition">
                        Analytics
                    </a>
                    <a href="#contact" className="hover:text-blue-400 transition">
                        Contact
                    </a>
                </div>

                <Link to="/">
                    <button className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-2xl font-medium">
                        Get Started
                    </button>
                </Link>
            </nav>
        </>
    )
}

export default LandingNav
