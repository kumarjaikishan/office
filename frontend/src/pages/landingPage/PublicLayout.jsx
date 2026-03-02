import LandingFooter from "../../components/footer/Footer";
import { Outlet } from "react-router-dom";
import LandingNav from "./LandingNav";

const PublicLayout = () => {
    return (
        <>
         <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

            <LandingNav />
            <Outlet />
            <LandingFooter />
            </div>
        </>
    );
};

export default PublicLayout;