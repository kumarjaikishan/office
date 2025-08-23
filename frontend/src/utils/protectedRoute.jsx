import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from '../components/sidebar';
import Navbar from '../components/Navbar';

const ProtectedRoutes = ({ allowedRoles = [] }) => {
  const { islogin } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);

  const role = user?.profile?.role;
  const isAllowed = islogin && allowedRoles.includes(role);

  useEffect(() => {
    // console.log(user)
    if (!isAllowed) {
      toast.warn('Access denied. You are not authorized.', { autoClose: 1900 });
    }
  }, [isAllowed]);

  return isAllowed ? (
    <div className="h-screen bg-amber-200 w-full flex">
      {/* left side */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] bg-white shadow-xl">
        <Sidebar />
      </div>

      {/* right side */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] bg-gray-100 overflow-auto overflow-x-hidden">
        <Navbar />
        <div className="materiale p-1 md:p-2">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoutes;
