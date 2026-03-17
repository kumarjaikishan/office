import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';

const ProtectedRoutes = ({ allowedRoles = [] }) => {
  const { islogin } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);

  const role = user?.profile?.role;

  const isAuthenticated = islogin;
  const isAuthorized = allowedRoles.includes(role);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    // ✅ Only show toast if logged in but not authorized
    if (isAuthenticated && !isAuthorized) {
      toast.warn('Access denied. You are not authorized.', { autoClose: 1900 });
    }

    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isAuthenticated, isAuthorized]);

  // Sidebar logic
  const sidebarOpen = Boolean(user?.sidebar);
  const extended = Boolean(user?.extendedonMobile);

  const sidebarWidth = isMobile
    ? sidebarOpen
      ? extended ? 'w-[160px]' : "w-[60px]"
      : "w-0"
    : sidebarOpen
      ? "w-[180px]"
      : "w-[70px]";

  // ❌ Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but wrong role → go home (or dashboard)
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed
  return (
    <div className="h-screen w-full flex bg-amber-200">
      <div className={`${sidebarWidth} no-print bg-white shadow-xl transition-all duration-300 overflow-hidden`}>
        <Sidebar />
      </div>

      <div className="flex-1 bg-gray-100 overflow-auto overflow-x-hidden">
        <Navbar />
        <div className="p-1 md:p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoutes;