import React from 'react'
import Modalbox from '../../../components/custommodal/Modalbox';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { IoIosSend } from 'react-icons/io';
import axios from 'axios';
import { toast } from 'react-toastify';

const Adminleavemodal = ({ firstfetch,inp, openmodal, isload, handleChange, setopenmodal, setInp, init }) => {
   
    const adddepartcall = async (e) => {
        e.preventDefault();
        // console.log(inp);
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
            if(err.response){
                  toast.warning(err.response.data.message, { autoClose: 3000 })
            }
            console.error(err);
        }
    }

    return (
        <Modalbox open={openmodal} onClose={() => {
            setopenmodal(false); setInp(init);
        }}>
            <div className="membermodal">
                <form onSubmit={adddepartcall}>
                    <h2>Leave Management</h2>
                    <span className="modalcontent ">
                        <Box sx={{ width: '100%', gap: 2 }}>
                            <TextField fullWidth value={inp.branch} label="Branch" size="small" />
                            <TextField fullWidth value={inp.employeename} label="Name" size="small" />
                        </Box>

                        <Box sx={{ width: '100%', gap: 2 }}>
                            <TextField fullWidth value={inp.from} label="From" size="small" />
                            <TextField fullWidth value={inp.to} label="To" size="small" />
                        </Box>
                        <TextField fullWidth multiline minRows={2} value={inp.reason} onChange={(e) => handleChange(e, 'reason')} label="Reason" size="small" />

                        <FormControl fullWidth required size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={inp.status}
                                label="Status"
                                onChange={(e) => handleChange(e, 'status')}
                            >
                                <MenuItem value={'pending'}>Pending</MenuItem>
                                <MenuItem value={'approved'}>Approve</MenuItem>
                                <MenuItem value={'rejected'}>Reject</MenuItem>

                            </Select>
                        </FormControl>

                        <div className="mt-2">

                            <Button sx={{ mr: 2 }} loading={isload} loadingPosition="end" endIcon={<IoIosSend />} variant="contained" type="submit">
                                Update
                            </Button>

                            <Button size="small" onClick={() => {
                                setopenmodal(false); setInp(init);
                            }} variant="outlined">Cancel</Button>
                        </div>
                    </span>
                </form>
            </div>
        </Modalbox>
    )
}

export default Adminleavemodal