import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setlogin } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { setuser } from "../../store/userSlice";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Please fill in both fields");
            return;
        }

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_ADDRESS}signin`,
                { email, password }
            );

            toast.success(res.data.message, { autoClose: 1200 });
            localStorage.setItem("emstoken", res.data.token);
            dispatch(setlogin(true));
            dispatch(setuser(res.data.user));

            return navigate("/dashboard");
        } catch (error) {
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else if (error.request) {
                console.error("No response from server:", error.request);
            } else {
                console.error("Error:", error.message);
            }
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-green-200 to-white p-4">
            <div className="flex flex-col md:flex-row items-center md:items-stretch shadow-lg bg-white rounded-xl overflow-hidden w-full max-w-fit">
                {/* Left Side Image */}
                <div className="w-full md:w-[350px] h-[200px] md:h-[400px] flex-shrink-0">
                    <img
                        src="https://res.cloudinary.com/dusxlxlvm/image/upload/v1756013721/ems/assets/10782895_19199299_1_q2oxsf.svg"
                        alt="Login Illustration"
                        className="w-full h-full object-contain md:object-cover"
                    />
                </div>

                {/* Right Side Form */}
                <div className="flex items-center justify-center w-full md:w-[300px] p-6">
                    <div className="w-full">
                        <form onSubmit={handleSubmit}>
                            <Typography
                                variant="h5"
                                textAlign="center"
                                gutterBottom
                                className="mb-4"
                            >
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
