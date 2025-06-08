import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const PrivateRoute = () => {
  const user = useSelector((state) => state.user);
  const isLogin = user.islogin;

  useEffect(() => {
    // console.log(user)
    if (!isLogin) {
      toast.warn('Please LogIn', { autoClose: 1700 });
    }
  }, [isLogin]);

  return isLogin ?
    <>
      <Outlet />
    </>
    : <Navigate to="/login" />;
};

export default PrivateRoute;
