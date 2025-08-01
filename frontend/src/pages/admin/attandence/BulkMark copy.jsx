import React, { useEffect, useState } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete, Avatar, Box, Checkbox, Typography } from '@mui/material';
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
import Modalbox from '../../../components/custommodal/Modalbox';

const BulkMark = ({ openmodal, isPunchIn, init, setisPunchIn, submitHandle, setopenmodal, isUpdate, isload, inp, setinp, setisUpdate }) => {

    const { department, employee } = useSelector((state) => state.user);
    const [checkedemployee, setcheckedemployee] = useState([]);

    useEffect(() => {
        // console.log("department:", department)
    }, [department]);

    const handleCheckbox = (e) => {
        const value = e.target.value;
        const isAlreadyChecked = checkedemployee.includes(value);

        if (isAlreadyChecked) {
            setcheckedemployee(checkedemployee.filter((item) => item !== value));
        } else {
            setcheckedemployee([...checkedemployee, value]);
        }
    };
    const submitHandlee = (e) => {
        e.preventDefault();
        console.log(checkedemployee)
    }
    const handleallselect = (e) => {
        if (e.target.checked) {
            setcheckedemployee(employee.map(e => e._id))
        } else {
            setcheckedemployee([])
        }
    }

    return (
        <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
            <div className="membermodal">
                <form onSubmit={submitHandlee}>
                    <h2>Bulk Mark Attendance</h2>
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

                        <Box sx={{ width: '100%',  gap: 0, display: 'flex', flexDirection: 'column' }}>
                            <div className='w-full  flex justify-between'>
                                <Typography>Select Employee</Typography>
                                <span className='flex gap-1'>
                                    <input
                                        type="checkbox"
                                        onChange={handleallselect}
                                    /> <label>Select All</label>
                                </span>
                            </div>
                            <div className='flex max-h-[200px] overflow-y-auto pt-1 pl-1 flex-col border border-gray-400 w-full rounded' >
                                {employee?.map((val,ind) => {
                                    return <div key={ind} className='m-0 p-0 gap-1 flex items-center'>
                                        <input
                                            type="checkbox"
                                            value={val._id}
                                            checked={checkedemployee.includes(val._id)}
                                            onChange={handleCheckbox}
                                        />
                                        <span>{val.userid.name}</span>
                                    </div>
                                })}
                            </div>
                        </Box>

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
                                        <MenuItem value={true}>Present</MenuItem>
                                        <MenuItem value={false}>Absent</MenuItem>
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

export default BulkMark
