import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import swal from 'sweetalert';
import { setlogin } from '../../store/authSlice';
import { userlogout } from '../../store/userSlice';

const Logout = () => {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem("emstoken");
    dispatch(userlogout());
    dispatch(setlogin(false));
    return navigate('/login');
  }, [])

  return null;
}

export default Logout