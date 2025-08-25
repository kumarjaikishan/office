import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from '../components/sidebar';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';

const ProtectedRoutes = ({ allowedRoles = [] }) => {
  const { islogin } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);

  const role = user?.profile?.role;
  const isAllowed = islogin && allowedRoles.includes(role);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    if (!isAllowed) {
      toast.warn('Access denied. You are not authorized.', { autoClose: 1900 });
    }

    // listen for screen resize
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isAllowed]);

  // Ensure sidebar is always boolean
  const sidebarOpen = Boolean(user?.sidebar);

  // Sidebar width logic
  // const sidebarWidth = isMobile
  //   ? sidebarOpen
  //     ? "w-[160px]"
  //     : "w-0"
  //   : sidebarOpen
  //     ? "w-[180px]"
  //     : "w-[70px]";

  const sidebarWidth = isMobile
    ? sidebarOpen
      ? "w-[60px]"   // 📱 mobile open → 60px
      : "w-0"        // 📱 mobile closed → 0px
    : sidebarOpen
      ? "w-[180px]"  // 💻 desktop open → 180px
      : "w-[70px]";  // 💻 desktop closed → 70px
  return isAllowed ? (
    <div className="h-screen w-full flex bg-amber-200">
      {/* Sidebar */}
      <div className={`${sidebarWidth} bg-white shadow-xl transition-all duration-300 overflow-hidden`}>
        <Sidebar />
      </div>

      {/* Right content */}
      <div className="flex-1 bg-gray-100 overflow-auto overflow-x-hidden">
        <Navbar />
        <div className="p-1 md:p-2">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoutes;
