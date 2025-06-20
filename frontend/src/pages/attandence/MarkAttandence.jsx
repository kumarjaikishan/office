import React, { useEffect, useState } from 'react'
import Modalbox from '../../components/custommodal/Modalbox'
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

const MarkAttandence = ({ openmodal, isPunchIn, init, setisPunchIn, submitHandle, setopenmodal, isUpdate, isload, inp, setinp, setisUpdate }) => {

    const { department, employee } = useSelector((state) => state.user);

    useEffect(() => {
        // console.log("department:", department)
    }, [department]);


    return (
        <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
            <div className="membermodal">
                <form onSubmit={submitHandle}>
                    <h2>Mark Attendance</h2>
                    <span className="modalcontent">
                        <FormControl sx={{ width: '100%' }} size="small">
                            <InputLabel id="demo-simple-select-helper-label">Action</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={isPunchIn}
                                name="status"
                                label="Status"
                                required
                                onChange={(e) => {
                                    setisPunchIn(e.target.value)
                                }}
                            >
                                <MenuItem value={true}>Punch In</MenuItem>
                                <MenuItem value={false}>Punch Out</MenuItem>
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                slotProps={{
                                    textField: {
                                        size: 'small',

                                    },
                                }}
                                onChange={(newValue) => {
                                    setinp({
                                        ...inp, ['date']: newValue
                                    })
                                }}
                                format="DD-MM-YYYY"
                                value={inp?.date}
                                sx={{ width: '100%' }}
                                label="Select date"
                            />
                        </LocalizationProvider>

                        <Autocomplete
                            size="small"
                            fullWidth
                            value={employee?.find(emp => emp._id === inp.employeeId) || null}
                            options={employee || []}
                            getOptionLabel={(option) => option.employeename} // still needed for filtering
                            onChange={(event, newValue) => {
                                // console.log(newValue)
                                setinp({
                                    ...inp,
                                    employeeId: newValue._id,
                                })
                            }}
                            renderOption={(props, option) => {
                                const { key, ...rest } = props; // destructure key out

                                return (
                                    <Box
                                        key={key} // pass key directly
                                        component="li"
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                        {...rest} // spread the rest
                                    >
                                        <Avatar src={option.image} alt={option.employeename}>
                                            {!option.image && <FaRegUser />}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2">{option.employeename}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                DOB: {option.dob}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            }}

                            renderInput={(params) => (
                                <TextField {...params} label="Select Employee" required />
                            )}
                        />

                        <Box sx={{ width: '100%', gap: 2 }}>
                            {isPunchIn ?
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        value={inp.punchIn}
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
                                </LocalizationProvider> :
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        value={inp.punchOut}
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
                            }
                            {isPunchIn && 
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
                                    <MenuItem value={'absent'}>Absent</MenuItem>
                                    <MenuItem value={'half day'}>Half Day</MenuItem>
                                </Select>
                            </FormControl>}
                        </Box>

                        <div className='w-full flex gap-2'>
                            <Button size="small"
                                onClick={() => {
                                    setopenmodal(false); setisUpdate(false); setinp(init)
                                }}
                                variant="outlined"> cancel</Button>
                            {!isUpdate && <Button

                                loading={isload}
                                loadingPosition="end"
                                endIcon={<IoIosSend />}
                                variant="contained"
                                type="submit"
                            >
                                Add
                            </Button>}

                            {isUpdate && <Button

                                loading={isload}
                                loadingPosition="end"
                                endIcon={<IoIosSend />}
                                variant="contained"
                                onClick={updatee}
                            >
                                Update
                            </Button>}

                        </div>
                    </span>
                </form>
            </div>
        </Modalbox>
    )
}

export default MarkAttandence
