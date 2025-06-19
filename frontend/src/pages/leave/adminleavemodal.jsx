import React from 'react'
import Modalbox from '../../components/custommodal/Modalbox';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { IoIosSend } from 'react-icons/io';

const Adminleavemodal = ({ inp, openmodal, isload, handleChange, setopenmodal, setInp, init }) => {
    const adddepartcall = (e) => {
        e.preventDefault();
console.log(inp)
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
                            <TextField fullWidth value={inp.department} label="Department" size="small" />
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
                                <MenuItem value={'approve'}>Approve</MenuItem>
                                <MenuItem value={'reject'}>Reject</MenuItem>

                            </Select>
                        </FormControl>

                        <div className="mt-2">

                            <Button sx={{ mr: 2 }} loading={isload} loadingPosition="end" endIcon={<IoIosSend />} variant="contained" type="submit">
                                Add
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