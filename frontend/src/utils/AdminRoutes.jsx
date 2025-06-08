import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from '../components/sidebar';
import Navbar from '../components/Navbar';

const AdminRoutes = () => {
  const user = useSelector((state) => state.user);
  const admin = user.islogin && user.user.role == 'admin';

  useEffect(() => {
    console.log(user)
    if (!admin) {
      toast.warn('Access denied. Admin authorization is required.', { autoClose: 1900 });
    }
  }, [admin]);

  return admin ?
    <>
      <Sidebar />
      <Navbar />
      <div className="material">
        <Outlet />
      </div>
    </>
    : <Navigate to="/login" />;
};

export default AdminRoutes;
