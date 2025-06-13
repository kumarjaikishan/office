import { Button } from '@mui/material'
import { setloader, setlogin, setlogout } from '../../store/user';
// import './navbar.css'
import { useSelector, useDispatch } from 'react-redux';
import { CiBullhorn } from "react-icons/ci";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(setlogout({
      login: false,
      user: {}
    }));
  }

  return (
    <div className='navbar w-full bg-white flex items-center justify-between px-4 py-2'>
      <p>page { }</p>

      <div className='flex  gap-6 items-center px-2 text-grey'>
        <span className='bg-amber-200 w-7 h-7 rounded-full flex items-center justify-center relative cursor-pointer'>
          <CiBullhorn />
          <span className='absolute -top-2 -right-2 bg-purple-800 text-white
        rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold'>
            1</span>
        </span>
        <div className='flex flex-col items-end px-1'>
          <span className='text-xs  font-medium leading-4'>jaikishan kumar</span>
          <p className='text-[10px] text-gray-500 text-right'>admin</p>
        </div>
        <span className='w-[36px] h-[36px] flex items-center justify-center'>
          <FaUser className=' flex justify-center text-2xl' />
        </span>
      </div>
    </div>
  )
}

export default Navbar
