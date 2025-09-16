import React, { useEffect, useState } from 'react'
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
import Modalbox from '../../../components/custommodal/Modalbox';
import dayjs from 'dayjs';
import { cloudinaryUrl } from '../../../utils/imageurlsetter';

const MarkAttandence = ({ openmodal, isPunchIn, init, setisPunchIn, submitHandle, setopenmodal, isUpdate, isload, inp, setinp, setisUpdate }) => {

    const { department, employee } = useSelector((state) => state.user);

    useEffect(() => {
        // console.log("employee:", employee)
    }, [department]);


    return (
        <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
            <div className="membermodal w-[500px]">
                <form onSubmit={submitHandle}>
                    <h2>Mark Attendance</h2>
                    <span className="modalcontent">
                        <div className='flex flex-col gap-3'>
                            <FormControl sx={{ width: '100%' }} size="small">
                                <InputLabel id="demo-simple-select-helper-label">Action</InputLabel>
                                <Select
                                    labelId="demo-simple-select-helper-label"
                                    id="demo-simple-select-helper"
                                    value={isPunchIn}
                                    label="Action"
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
                                    maxDate={dayjs()}
                                />
                            </LocalizationProvider>

                            <Autocomplete
                                size="small"
                                fullWidth
                                value={employee?.find(emp => emp._id === inp.employeeId) || null}
                                options={employee.filter(e => e.status !== false) || []}
                                getOptionLabel={(option) => option.userid.name} // still needed for filtering
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
                                        <Box key={option._id} // pass key directly
                                            component="li"
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                            {...rest} // spread the rest
                                        >
                                            <Avatar
                                                // src={option.profileimage} 
                                                src={cloudinaryUrl(option.profileimage, {
                                                    format: "webp",
                                                    width: 100,
                                                    height: 100,
                                                })}
                                                alt={option.userid.name}>
                                                {!option.profileimage && <FaRegUser />}
                                            </Avatar>
                                            <Box className=' capitalize'>
                                                <Typography variant="body2">{option.userid.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {(option.designation)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                }}

                                renderInput={(params) => (
                                    <TextField {...params} label="Select Employee" required />
                                )}
                            />

                            <div className='flex gap-2 justify-between'>
                                {isPunchIn ?
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            disabled={["absent", 'leave'].includes(inp.status)}
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
                                    </FormControl>}
                            </div>
                            {inp.status == 'leave' &&
                                <TextField fullWidth required multiline
                                    onChange={(e) => {
                                        setinp({
                                            ...inp,
                                            reason: e.target.value
                                        });
                                    }}
                                    minRows={2} value={inp.reason} label="Reason" size="small" />
                            }

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
                            </div>
                        </div>
                    </span>
                </form>
            </div>
        </Modalbox>
    )
}

export default MarkAttandence
