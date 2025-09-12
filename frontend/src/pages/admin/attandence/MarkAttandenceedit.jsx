import React, { useEffect, useState } from 'react'
import Modalbox from '../../../components/custommodal/Modalbox'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete, Avatar, Box, Typography } from '@mui/material';
import { Button, OutlinedInput } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { IoIosSend } from "react-icons/io";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { useSelector } from 'react-redux';
import { FaRegUser } from "react-icons/fa";
import { CgLayoutGrid } from 'react-icons/cg';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FirstFetch } from '../../../../store/userSlice';

const MarkAttandenceedit = ({ openmodal, setisload, dispatch, isPunchIn, init, setisPunchIn, submitHandle, setopenmodal, isUpdate, isload, inp, setinp, setisUpdate }) => {

    const editattandence = async (e) => {
        e.preventDefault();

        const address = `${import.meta.env.VITE_API_ADDRESS}editattandence`;

        try {
            setisload(true);
            const token = localStorage.getItem('emstoken')
            const res = await axios.post(
                address,
                { ...inp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // console.log('add attandence Query:', res);
            toast.success(res.data.message, { autoClose: 1800 });
            setinp(init)
            setopenmodal(false)
            dispatch(FirstFetch());
            return true;
        } catch (error) {
            console.log(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 2700 });
            } else if (error.request) {
                console.error('No response from server:', error.request);
            } else {
                console.error('Error:', error.message);
            }
        } finally {
            setisload(false);
        }
    }

    useEffect(() => {
        if (!['weekly off', 'holiday', 'half day'].includes(inp.status)) {
            if (inp.punchIn || inp.punchOut) {
                setinp({ ...inp, status: 'present' })
            }
        }

    }, [inp.punchIn])

    return (
        <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
            <div className="membermodal">
                <form onSubmit={editattandence}>
                    <h2>Edit Attendance</h2>
                    <span className="modalcontent">
                        <div className='flex flex-col gap-3'>
                            <TextField fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={inp.date} label="Attandence Date" size="small" />

                            <TextField fullWidth value={inp.employeeName} label="Name" size="small" />

                            <div className='flex justify-between gap-2'>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        value={inp.punchIn}
                                        disabled={["absent", 'leave'].includes(inp.status)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',

                                            },
                                        }}
                                        onChange={(newValue) => {
                                            setinp({
                                                ...inp,
                                                punchIn: newValue
                                            })
                                        }}
                                        sx={{ width: '100%' }}
                                        label="Punch In"
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        value={inp.punchOut}
                                        disabled={["absent", 'leave'].includes(inp.status)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',

                                            },
                                        }}
                                        onChange={(newValue) => {
                                            setinp({
                                                ...inp,
                                                punchOut: newValue
                                            })
                                        }} sx={{ width: '100%' }} label="Punch Out" />
                                </LocalizationProvider>


                                <FormControl sx={{ width: '100%' }} size="small">
                                    <InputLabel id="demo-simple-select-helper-label">Status</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-helper-label"
                                        id="demo-simple-select-helper"
                                        value={inp.status}
                                        name="status"
                                        label="Status"
                                        required
                                        onChange={(e) => {
                                            setinp({
                                                ...inp,
                                                status: e.target.value
                                            });
                                        }}
                                    >
                                        <MenuItem value={'present'}>Present</MenuItem>
                                        <MenuItem value={'leave'}>Leave</MenuItem>
                                        <MenuItem value={'absent'}>Absent</MenuItem>
                                        <MenuItem value={'weekly off'}>Weekly off</MenuItem>
                                        <MenuItem value={'holiday'}>Holiday</MenuItem>
                                        <MenuItem value={'half day'}>Half Day</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            {inp.status == 'leave' &&
                                <TextField fullWidth multiline required
                                    onChange={(e) => {
                                        setinp({
                                            ...inp,
                                            leaveReason: e.target.value
                                        });
                                    }}
                                    minRows={2} value={inp.leaveReason} label="Reason" size="small" />
                            }

                            <div className='w-full flex gap-2'>
                                <Button size="small"
                                    onClick={() => {
                                        setopenmodal(false); setisUpdate(false); setinp(init)
                                    }}
                                    variant="outlined"> cancel</Button>
                                <Button
                                    loading={isload}
                                    loadingPosition="end"
                                    endIcon={<IoIosSend />}
                                    variant="contained"
                                    type="submit"
                                >
                                    Update
                                </Button>
                            </div>
                        </div>
                    </span>
                </form>
            </div>
        </Modalbox>
    )
}

export default MarkAttandenceedit
