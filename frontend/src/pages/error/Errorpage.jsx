import React, { useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import './Errorpage.css';
import { useSelector, useDispatch } from 'react-redux';
import { header } from '../store/login';
import { Button } from '@mui/material';

export const Errorpage = () => {
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const log = useSelector((state) => state.login);

    useEffect(() => {
        if (!log.islogin) {
            return navigate('/login');
        }
        dispatch(header("Not Found"))
    }, [])
    const handleback = ()=>{
        console.log("back")
        navigate(-1);
    }
    return (
        <div className="errore">
            <div className="container">
                <div className="img">
                    <img src="https://res.cloudinary.com/dusxlxlvm/image/upload/v1720767933/accusoft/assets/404_page_1_kjlifa.svg" alt="404_page_Image" />
                    {/* <img src='https://cdn.dribbble.com/users/722246/screenshots/3066818/404-page.gif' alt="" /> */}
                </div>
                {/* <h1>404 </h1>
                <h2>Page Not Found</h2> */}
                <p>Sorry, the page you are looking for does not exist. If you believe there's an issue, feel free to report it, and we'll look into it</p>
                <div className="btns">
                    <NavLink to="/" className='btn linke'>Return Home</NavLink>
                    <Button variant='outlined' onClick={handleback} >Go Back</Button>
                    {/* <NavLink to="/contact" className='btn linke'>Report Problem</NavLink> */}
                </div>
            </div>
        </div>
    );
};
