import React from 'react'
import Modalbox from '../../../components/custommodal/Modalbox';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { IoIosSend } from 'react-icons/io';
import axios from 'axios';
import { toast } from 'react-toastify';

const Adminleavemodal = ({ firstfetch, inp, openmodal, isload, handleChange, setopenmodal, setInp, init }) => {

    const adddepartcall = async (e) => {
        e.preventDefault();
        // console.log(inp);
        // return
        const token = localStorage.getItem('emstoken');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}leavehandle`, {
                ...inp
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            firstfetch();
            setopenmodal(false);
            setInp(init);
            toast.success(res.data.message, { autoClose: 2000 })
        } catch (err) {
            if (err.response) {
                toast.warning(err.response.data.message, { autoClose: 3000 })
            }
            console.error(err);
        }
    }

    return (
        <Modalbox open={openmodal} onClose={() => {
            setopenmodal(false); setInp(init);
        }}>
            <div className="membermodal w-[600px]">
                <form onSubmit={adddepartcall}>
                    <div className='modalhead'> Leave Management</div>
                    <span className="modalcontent ">
                        <div className='flex flex-col gap-3 w-full'>
                            <div className='flex  gap-2 justify-between'>
                                <TextField fullWidth value={inp.branch} label="Branch" size="small" />
                                <TextField fullWidth value={inp.employeename} label="Name" size="small" />
                            </div>

                            <div className='flex  gap-2 justify-between'>
                                <TextField fullWidth value={inp.showfrom} label="From" size="small" />
                                <TextField fullWidth value={inp.showto} label="To" size="small" />
                            </div>
                            <TextField fullWidth multiline minRows={2} value={inp.reason} onChange={(e) => handleChange(e, 'reason')} label="Reason" size="small" />

                            <FormControl fullWidth required size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={inp.status}
                                    label="Status"
                                    onChange={(e) => handleChange(e, 'status')}
                                >
                                    <MenuItem value={'approved'}>Approve</MenuItem>
                                    <MenuItem value={'rejected'}>Reject</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </span>
                    <div className='modalfooter'>
                        <Button size="small" onClick={() => {
                            setopenmodal(false); setInp(init);
                        }} variant="outlined">Cancel</Button>

                        <Button sx={{ mr: 2 }} loading={isload} loadingPosition="end" endIcon={<IoIosSend />} variant="contained" type="submit">
                            Update
                        </Button>
                    </div>
                </form>
            </div>
        </Modalbox>
    )
}

export default Adminleavemodal