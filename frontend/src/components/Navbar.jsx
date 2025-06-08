import { Button } from '@mui/material'
import { setloader, setlogin, setlogout } from '../../store/user';
import './navbar.css'
import { useSelector, useDispatch } from 'react-redux';

const Navbar = () => {
 const dispatch = useDispatch();
 
    const logout = () => {
        dispatch(setlogout({
          login: false,
          user: {}
        }));
      }

    return (
        <div className='navbar'>
            <p>Welcome { }</p>
            <Button onClick={logout} variant='contained'>Logout</Button>
        </div>
    )
}

export default Navbar
