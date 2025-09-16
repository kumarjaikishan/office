import { Avatar, Box, Typography } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import { AiOutlineDelete } from 'react-icons/ai';
import { MdOutlineModeEdit } from 'react-icons/md';
import Adminleavemodal from './adminleavemodal';
import { useCustomStyles } from '../attandence/attandencehelper';
import { FaRegUser } from 'react-icons/fa';
import CheckPermission from '../../../utils/CheckPermission';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { BiMessageRoundedError } from 'react-icons/bi';
import { cloudinaryUrl } from '../../../utils/imageurlsetter';

const Adminleave = () => {
    const [leavelist, setleavelist] = useState([]);
    const [openmodal, setopenmodal] = useState(false);
    const [isload, setisload] = useState(false);
    const { department, branch } = useSelector((state) => state.user);
    const init = {
        leaveid: '',
        branch: '',
        employeename: '',
        from: '',
        showfrom: '',
        to: '',
        showto: '',
        reason: '',
        status: ''
    }
    const [inp, setInp] = useState(init);

    const canEdit = CheckPermission('leave', 3);
    const canDelete = CheckPermission('leave', 4);

    useEffect(() => {
        // console.log(department, branch)

        firstfetch();
    }, [])

    const handleChange = (e, field) => {
        setInp({ ...inp, [field]: e.target.value })
    }

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
            // console.log(res.data)
            let sno = 1;
            const data = await res.data.leave.map((leave) => {
                return {
                    id: leave._id,
                    sno: sno++,
                    name: (<div className="flex items-center gap-3 ">
                        <Avatar
                            // src={leave?.employeeId?.profileimage}
                            src={cloudinaryUrl(leave?.employeeId?.profileimage, {
                                format: "webp",
                                width: 100,
                                height: 100,
                            })}
                            alt={leave?.employeeId?.employeename}>
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
                        {canEdit && <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(leave)}><MdOutlineModeEdit /></span>}
                        {canDelete && <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(leave._id)}><AiOutlineDelete /></span>}
                    </div>)
                }
            })
            setleavelist(data);
        } catch (err) {
            console.error(err);
            toast.warning(err.response?.data?.message || "Error")
        }
    }

    const deletee = async (leaveid) => {
        console.log(leaveid)
        swal({
            title: "Are you sure you want to Delete this record?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (proceed) => {
            if (proceed) {
                const token = localStorage.getItem('emstoken');
                try {
                    const res = await axios.delete(`${import.meta.env.VITE_API_ADDRESS}leavehandle/${leaveid}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    firstfetch();
                    toast.success(res.data.message, { autoClose: 2000 })
                } catch (err) {
                    if (err.response) {
                        toast.warning(err.response.data.message, { autoClose: 3000 })
                    }
                    console.error(err);
                }
            }
        });

    }

    const edite = (data) => {
        // console.log(data)
        setInp({
            leaveid: data._id,
            branch: branch?.filter(e => e._id == data?.branchId)[0].name,
            employeename: data?.employeeId?.userid?.name,
            from: data.fromDate,
            to: data.toDate,
            showfrom: dayjs(data.fromDate).format('DD MMM, YYYY'),
            showto: dayjs(data.toDate).format('DD MMM, YYYY'),
            reason: data?.reason,
            status: data?.status,
        })
        setopenmodal(true);
    }

    return (
        <div>
            <DataTable
                customStyles={useCustomStyles()}
                columns={columns}
                data={leavelist}
                pagination
                highlightOnHover
                noDataComponent={
                    <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
                        <BiMessageRoundedError className="text-xl" /> No Leave Request found.
                    </div>
                }
            />
            <Adminleavemodal firstfetch={firstfetch} handleChange={handleChange} inp={inp} isload={isload} init={init} setInp={setInp} openmodal={openmodal} setopenmodal={setopenmodal} />
        </div>
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