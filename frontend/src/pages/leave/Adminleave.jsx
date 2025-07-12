import { Avatar, Box, Typography } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import { AiOutlineDelete } from 'react-icons/ai';
import { MdOutlineModeEdit } from 'react-icons/md';
import Adminleavemodal from './adminleavemodal';
import { customStyles } from '../attandence/attandencehelper';
import { FaRegUser } from 'react-icons/fa';

const Adminleave = () => {
    const [leavelist, setleavelist] = useState([]);
    const [openmodal, setopenmodal] = useState(false);
    const [isload, setisload] = useState(false);
    const init = {
        leaveid: '',
        department: '',
        employeename: '',
        from: '',
        to: '',
        reason: '',
        status: ''
    }
    const [inp, setInp] = useState(init)

    useEffect(() => {
        const firstfetch = async () => {
            const token = localStorage.getItem('emstoken');
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}fetchleave`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log(res.data.leave)
                let sno = 1;
                const data = await res.data.leave.map((leave) => {
                    return {
                        id: leave._id,
                        sno: sno++,
                        name: (<div className="flex items-center gap-3 ">
                            <Avatar src={leave?.employeeId?.profileimage} alt={leave?.employeeId?.employeename}>
                                {!leave.employeeId?.profileimage && <FaRegUser />}
                            </Avatar>
                            <Box>
                                <Typography variant="body2">{leave.employeeId?.employeename}</Typography>
                                <Typography variant="body2">{leave.employeeId?.userid?.email}</Typography>
                            </Box>
                        </div>),
                        from: dayjs(leave.fromDate).format('DD MMM, YYYY'),
                        to: dayjs(leave.toDate).format('DD MMM, YYYY'),
                        reason: leave.reason,
                        status: <span className={`${leave.status == 'approved' ? 'bg-green-100 text-green-800' :
                            (leave.status == 'rejected' ? "bg-red-100 text-red-800" :
                                "bg-amber-100 text-amber-800")} px-3 py-1 rounded capitalize`}>
                            {leave.status}
                        </span>,
                        action: (<div className="flex gap-2">
                            <span className="edit" title="Edit" onClick={() => edite(leave)}><MdOutlineModeEdit /></span>
                            <span className="delete" onClick={() => deletee(leave._id)}><AiOutlineDelete /></span>
                        </div>)
                    }
                })
                setleavelist(data);
            } catch (err) {
                console.error(err);
            }
        }
        firstfetch();
    }, [])

    const handleChange = (e, field) => {
        setInp({ ...inp, [field]: e.target.value })
    }

    const deletee = () => {

    }
    const edite = (data) => {
        console.log(data)
        setInp({
            leaveid: data._id,
            department: data.employeeId.userid.email,
            employeename: data.employeeId.employeename,
            from: dayjs(data.fromDate).format('DD MMM, YYYY'),
            to: dayjs(data.toDate).format('DD MMM, YYYY'),
            reason: data.reason,
            status: data.status,
        })
        setopenmodal(true);
    }
    return (
        <>
            <div>Admin leave page</div>
            <DataTable
                customStyles={customStyles}
                columns={columns}
                data={leavelist}
                pagination
                highlightOnHover
            />
            <Adminleavemodal handleChange={handleChange} inp={inp} isload={isload} init={init} setInp={setInp} openmodal={openmodal} setopenmodal={setopenmodal} />
        </>
    )
}

export default Adminleave;

export const columns = [
    {
        name: "S.no",
        selector: (row) => row.sno,
        width: '60px'
    },
    {
        name: "Employee",
        selector: (row) => row.name,
        // width:'180px'
    },
    {
        name: "from",
        selector: (row) => row.from,
        width: '120px'
    },
    {
        name: "to",
        selector: (row) => row.to,
        width: '120px'
    },
    {
        name: "Reason",
        selector: (row) => row.reason
    },
    {
        name: "Status",
        selector: (row) => row.status,
        width: '120px',
    },
    {
        name: "Action",
        selector: (row) => row.action,
        width: '90px'
    }
]