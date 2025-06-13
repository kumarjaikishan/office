import React from 'react'
import Modalbox from '../../components/custommodal/Modalbox'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box } from '@mui/material';
import { Button, OutlinedInput } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { IoIosSend } from "react-icons/io";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

const MarkAttandence = ({ openmodal, setopenmodal,isUpdate,isload  }) => {
    return (
        <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
            <div className="membermodal">
                <form onSubmit={""}>
                    <h2>Mark Attendance</h2>
                    <span className="modalcontent">
                        <LocalizationProvider  dateAdapter={AdapterDayjs}>
                            <DatePicker
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        
                                    },
                                }} label="Delect date" />
                        </LocalizationProvider>
                        <FormControl sx={{ width: '100%' }} required size="small">
                            <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={''}
                                name="Department"
                                label="Department"
                            // onChange={(e) => handleChange(e, 'department')}
                            >

                                {/* {departmentlist.map((list) => {
                                    return <MenuItem value={list._id}>{list.department}</MenuItem>
                                })} */}
                            </Select>
                        </FormControl>
                        <Box  sx={{width:'100%', gap:2}}>
                            <LocalizationProvider  dateAdapter={AdapterDayjs}>
                                <TimePicker sx={{width:'100%'}} label="Basic time picker" />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker sx={{width:'100%'}} label="Basic time picker" />
                            </LocalizationProvider>
                        </Box>
                        <TextField sx={{ width: '100%' }} required value={0} label="Working Hours" size="small" />
                        <FormControl sx={{ width: '100%' }} required size="small">
                            <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={''}
                                name="Department"
                                label="Department"
                            // onChange={(e) => handleChange(e, 'department')}
                            >

                                {/* {departmentlist.map((list) => {
                                    return <MenuItem value={list._id}>{list.department}</MenuItem>
                                })} */}
                            </Select>
                        </FormControl>
                        <div>
                            {!isUpdate && <Button
                                sx={{ mr: 2 }}
                                loading={isload}
                                loadingPosition="end"
                                endIcon={<IoIosSend />}
                                variant="contained"
                                type="submit"
                            >
                                Add
                            </Button>}

                            {isUpdate && <Button
                                sx={{ mr: 2 }}
                                loading={isload}
                                loadingPosition="end"
                                endIcon={<IoIosSend />}
                                variant="contained"
                                onClick={updatee}
                            >
                                Update
                            </Button>}
                            <Button size="small"
                                onClick={() => {
                                    setopenmodal(false); setisupdate(false); setInp(init)
                                }}
                                variant="outlined"> cancel</Button>
                        </div>
                    </span>
                </form>
            </div>
        </Modalbox>
    )
}

export default MarkAttandence
