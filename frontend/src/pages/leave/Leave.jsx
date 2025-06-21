import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, TextField } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import axios from 'axios'
import React, { useState } from 'react'
import { CiFilter } from 'react-icons/ci'
import { toast } from 'react-toastify'

const Leave = () => {
    const init = {
        type: '',
        fromDate: null,
        toDate: null,
        reason: ''
    }
    const [inp, setinp] = useState(init);
    const changehandle = (value, field) => {
        setinp({ ...inp, [field]: value })
    }
    const handleSubmit = async () => {
        console.log(inp);
         const token = localStorage.getItem('emstoken');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}addleave`, {
                ...inp
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success(res.data.message, { autoClose: 2000 })
        } catch (err) {
            console.error(err);
            alert("Error saving holiday");
        }
    }
    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box className="flex flex-col gap-4 p-4 bg-white shadow rounded w-full max-w-md">
                    <FormControl  size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                            label="Department"
                            value={inp.type}
                            onChange={(e) => changehandle(e.target.value, "type")}
                        >
                            <MenuItem selected value="formal">Formal</MenuItem>
                            <MenuItem selected value="casual">Casual</MenuItem>
                            <MenuItem selected value="sick">Sick</MenuItem>
                            {/* {departmentlist.map((list) => (
                                <MenuItem key={list._id} value={list._id}>{list.department}</MenuItem>
                            ))} */}
                        </Select>
                    </FormControl>

                    <DatePicker
                        label="From Date"
                        format='dd/MM/yyyy'
                        value={inp.fromDate}
                        onChange={(newValue) => changehandle(newValue, 'fromDate')}
                        slotProps={{ textField: { fullWidth: true } }}
                    />

                    <DatePicker
                        format='dd/MM/yyyy'
                        label="To Date"
                        value={inp.toDate}
                        onChange={(newValue) => changehandle(newValue, 'toDate')}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                    <TextField
                        label="Reason"
                        value={inp.reason}
                        onChange={(e) => changehandle(e.target.value, 'reason')}
                        fullWidth
                    />
                    <Button variant="contained" onClick={handleSubmit}>
                        Apply
                    </Button>
                </Box>
            </LocalizationProvider>
        </>
    )
}

export default Leave
