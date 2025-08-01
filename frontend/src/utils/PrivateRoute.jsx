import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from '../components/sidebar';
import Navbar from '../components/Navbar';

const PrivateRoute = () => {
   const {islogin} = useSelector((state) => state.auth);

  useEffect(() => {
    if (!islogin) {
      toast.warn('Please LogIn', { autoClose: 1700 });
    }
  }, [islogin]);

 return islogin ?
      <div className='h-screen bg-amber-200 w-full flex'>
        {/* left side */}
        <div className='w-[14%] md:w-[8%] lg:w-[16%] bg-white shadow-xl' >
          <Sidebar />
        </div>

        {/* right side */}
        <div className='w-[86%] md:w-[92%] lg:w-[84%] bg-gray-100 overflow-auto overflow-x-hidden'>
          <Navbar />
          <div className="materiale">
            <Outlet />
          </div>
        </div>

      </div>
    : <Navigate to="/login" />;
};

export default PrivateRoute;
