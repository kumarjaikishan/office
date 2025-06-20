import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setloader, setlogin, setadmin } from '../../store/authSlice';
import { useNavigate, useLocation } from "react-router-dom";
import { setuser } from '../../store/userSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    let navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert('Please fill in both fields');
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}signin`, {
                email,
                password
            });

            console.log('Login success:', res.data);
            toast.success(res.data.message, { autoClose: 1200 });
            localStorage.setItem('emstoken', res.data.token)
            dispatch(setlogin(true));
            dispatch(setuser(res.data.user));

            if (res.data.user.role == "admin") {
                dispatch(setadmin(true));
                return navigate('/admin-dashboard');
            }
            //  dispatch(setadmin(false));
            return navigate('/employe-dashboard');

        } catch (error) {
            console.log(error)
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else if (error.request) {
                console.error('No response from server:', error.request);
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, #d0f0c0 50%, #ffffff 50%)',
            }}
        >
            <Paper
                elevation={3}
                sx={{ padding: 4, width: 320, borderRadius: 2 }}
            >
                <form onSubmit={handleSubmit}>
                    <Typography variant="h5" textAlign="center" gutterBottom>
                        Login
                    </Typography>

                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        required
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        required
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        Login
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;
