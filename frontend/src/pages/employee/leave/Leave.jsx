import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, TextField } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import axios from 'axios'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { CiFilter } from 'react-icons/ci'
import { toast } from 'react-toastify'
import Modalbox from '../../../components/custommodal/Modalbox'
import { GoPlus } from 'react-icons/go'
import { useSelector } from 'react-redux'
import { useCustomStyles } from '../../admin/attandence/attandencehelper'

const EmpLeave = () => {
    const init = {
        type: '',
        fromDate: null,
        toDate: null,
        reason: ''
    }
    const [inp, setinp] = useState(init);
    const [leaverequest, setleaverequest] = useState([]);
    const { leave } = useSelector((state) => state.employee);
    const [openmodal, setopenmodal] = useState(false)
    const [loading, setLoading] = useState(false)
    const changehandle = (value, field) => {
        setinp({ ...inp, [field]: value })
    }
    useEffect(() => {
        if (leave) {
            setleaverequest(leave);
        }
    }, [leave])

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(inp);
        if (!inp.fromDate) return toast.warn('From Date is required')
        const token = localStorage.getItem('emstoken');
        setLoading(true)
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

            setopenmodal(false)
            setinp(init)
            toast.success(res.data.message, { autoClose: 2000 })
        } catch (err) {
            console.error(err);
            toast.warning(err.response?.data?.message || "Error", { autoClose: 2000 })
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className='employee p-2.5'>
            {/* <h2 className="text-2xl mb-4 font-bold text-slate-800">Manage Leaves</h2> */}
            <div className='flex justify-end mb-2'>
                <div className="flex gap-1">
                    <Button variant='contained' startIcon={<GoPlus />} onClick={() => setopenmodal(true)}>Add Leave</Button>
                </div>
            </div>
            <DataTable
                customStyles={useCustomStyles()}
                columns={columns}
                data={leaverequest}
                pagination
                highlightOnHover
            />

            <Modalbox open={openmodal} onClose={() => {
                setopenmodal(false); setinp(init);
            }}>
                <div className="membermodal w-[400px]">
                    <form onSubmit={handleSubmit}>
                        <h2>Add Leave Request</h2>
                        <span className="modalcontent ">
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <FormControl required fullWidth size="small">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        label="Department"
                                        value={inp.type}
                                        onChange={(e) => changehandle(e.target.value, "type")}
                                    >
                                        <MenuItem selected value="formal">Formal</MenuItem>
                                        <MenuItem selected value="casual">Casual</MenuItem>
                                        <MenuItem selected value="sick">Sick</MenuItem>
                                    </Select>
                                </FormControl>

                                <DatePicker
                                    label="From Date"
                                    format='dd/MM/yyyy'
                                    required
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
                                    required
                                    multiline
                                    minRows={2}
                                    maxRows={5}
                                    value={inp.reason}
                                    onChange={(e) => changehandle(e.target.value, 'reason')}
                                    fullWidth
                                />
                                <div className='flex w-full justify-end gap-3'>
                                    <Button onClick={() => { setopenmodal(false); setinp(init) }} variant="outlined" >
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="contained" disabled={loading}>
                                        {loading ? 'Submitting...' : 'Apply'}
                                    </Button>
                                </div>
                            </LocalizationProvider>
                        </span>
                    </form>
                </div>
            </Modalbox>
        </div>
    )
}

export default EmpLeave;
export const columns = [
    // {
    //     name: "S.no",
    //     selector: (row) => row.sno,
    //     width:'50px'
    // },
    {
        name: "Date",
        selector: (row) => dayjs(row.fromDate).format('DD MMM, YYYY')
    },
    {
        name: "From",
        selector: (row) => dayjs(row.fromDate).format('DD MMM, YYYY')
    },
    {
        name: "TO",
        selector: (row) => dayjs(row.toDate).format('DD MMM, YYYY')
    },
    {
        name: "Reason",
        selector: (row) => row.reason
    },
    {
        name: "Status",
        selector: (row) => <span
            className={`
                  px-2 py-1 capitalize rounded-l relative overflow-hidden
                  before:absolute before:content-[''] before:w-[2px] before:h-full before:left-0
                  ${row.status === 'approved' && 'text-green-700 bg-green-100 before:bg-green-800'}
                  ${row.status === 'pending' && 'text-yellow-700 bg-yellow-100 before:bg-yellow-600'}
                  ${row.status === 'rejected' && 'text-red-700 bg-red-100 before:bg-red-800'}
               `}
        >
            {row.status}
        </span>

    },
    // {
    //     name: "Action",
    //     selector: (row) => row.action,
    //     width: '150px'
    // }
]
