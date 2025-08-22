import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from '../components/sidebar';
import Navbar from '../components/Navbar';

const AdminRoutes = () => {
  const {isadmin,islogin} = useSelector((state) => state.auth);
   const user = useSelector((state) => state.user);
  const admin = islogin && (user?.profile?.role==='admin' || user?.profile?.role==='superadmin' || user?.profile?.role==='manager');
  // const admin = true;

  useEffect(() => {
    if (!admin) {
      toast.warn('Access denied. Admin authorization is required.', { autoClose: 1900 });
    }
  }, [admin]);

  return admin ?
      <div className='h-screen bg-amber-200 w-full flex'>
        {/* left side */}
        <div className='w-[14%] md:w-[8%] lg:w-[16%] bg-white shadow-xl' >
          <Sidebar />
        </div>

        {/* right side */}
        <div className='w-[86%] md:w-[92%] lg:w-[84%] bg-gray-100 overflow-auto overflow-x-hidden'>
          <Navbar />
          <div className="materiale p-1 md:p-2">
            <Outlet />
          </div>
        </div>

      </div>
    : <Navigate to="/login" />;
};

export default AdminRoutes;
