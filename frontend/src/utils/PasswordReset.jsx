import { useParams, useNavigate } from 'react-router-dom';
import { FaSave } from "react-icons/fa";
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { toast } from "react-toastify";

const PasswordReset = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [inp, setinp] = useState({ pass: '', cpass: '' });
    const [isloading, setloading] = useState(false);

    const handlechange = (e) => {
        const { name, value } = e.target;
        setinp({ ...inp, [name]: value });
    };

    const handlesubmit = async (e) => {
        e.preventDefault();
        try {
            setloading(true);
            const rese = await fetch(`${import.meta.env.VITE_API_ADDRESS}setpassword?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: inp.pass })
            });
            const resuke = await rese.json();
            setloading(false);
            if (!rese.ok) {
                return toast.warn(resuke.message, { autoClose: 2100 });
            }
            toast.success(resuke.message, { autoClose: 1600 });
            navigate('/logout');
        } catch (error) {
            toast.warn(error.message, { autoClose: 2100 });
            setloading(false);
        }
    };

    return (
        <div className="w-full p-2 md:p-4 h-[calc(100vh-64px)] bg-white grid place-items-center">
            <div className=" w-full md:w-[300px] rounded-xl overflow-hidden shadow-md">
                <h2 className="w-full h-10 leading-10 tracking-wide text-white pl-3 bg-teal-600">
                    Reset Password
                </h2>
                <form
                    onSubmit={handlesubmit}
                    className="w-full flex flex-col items-center p-4"
                >
                    <TextField
                        required
                        type='password'
                        name="pass"
                        onChange={handlechange}
                        value={inp.pass}
                        sx={{ width: '98%', mt: 2, mb: 2 }}
                        label="Password"
                        variant="outlined"
                    />
                    <TextField
                        required
                        name="cpass"
                        onChange={handlechange}
                        value={inp.cpass}
                        error={inp.cpass.length ? inp.pass !== inp.cpass : false}
                        helperText={inp.cpass.length ? inp.pass !== inp.cpass ? "Password must be same" : "" :''}
                        sx={{ width: '98%', mt: 2, mb: 2 }}
                        label="Confirm Password"
                        variant="outlined"
                    />
                    <LoadingButton
                        loading={isloading}
                        disabled={inp.pass !== inp.cpass || !inp.pass.length}
                        loadingPosition="start"
                        sx={{ width: '98%', mt: 2, mb: 2 }}
                        startIcon={<FaSave />}
                        variant="outlined"
                        type="submit"
                    >
                        Change Password
                    </LoadingButton>
                </form>
            </div>
        </div>
    );
};

export default PasswordReset;
