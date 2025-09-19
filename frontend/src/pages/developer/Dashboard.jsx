import axios from 'axios'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useCustomStyles } from '../admin/attandence/attandencehelper'
import { BiMessageRoundedError } from 'react-icons/bi'
import dayjs from 'dayjs'
import { Button, TextField } from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { MdOutlineModeEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import Modalbox from '../../components/custommodal/Modalbox'
import { toast } from 'react-toastify'

const DeveloperDashboard = () => {

    useEffect(() => {
        fetche()
    }, [])

    const init = {
        userid: '',
        name: '',
        email: '',
        password: ''
    }
    const [users, setusers] = useState([]);
    const [passmodal, setpassmodal] = useState(false);
    const [inp, setinp] = useState(init);
    const [isedit, setisedit] = useState(false)

    const fetche = async () => {
        try {
            const token = localStorage.getItem('emstoken')
            const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}developerfetch`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // console.log('all user Query:', res.data.users);
            setusers(res.data.users)
        } catch (error) {
            console.log(error);
            toast.warn(error.response?.data?.message || 'Error', { autoClose: 3000 });
        }
    }

    const adduser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('emstoken')
            const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}User`,
                { ...inp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setpassmodal(false)
            fetche();
            toast.success(res.data.message, { autoClose: 1800 });
        } catch (error) {
            console.log(error);
            toast.warn(error.response?.data?.message || 'Error', { autoClose: 3000 });
        } finally {
            // setisload(false);
        }
    }

    const edite = (user) => {
        // console.log(user)
        setinp({
            userid: user?._id,
            name: user?.registeredName,
            email: user?.email,
        })
        setisedit(true)
        setpassmodal(true)
    }

    const deletee = (userid) => {
        swal({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const token = localStorage.getItem('emstoken')
                    const res = await axios.delete(`${import.meta.env.VITE_API_ADDRESS}User/${userid}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    fetche();
                    toast.success(res.data.message, { autoClose: 1800 });
                } catch (error) {
                    console.log(error);
                    toast.warn(error.response?.data?.message || 'Error', { autoClose: 3000 });
                }
            }
        });
    }

    const saveedit = async () => {
        // console.log(inp);
        try {
            const token = localStorage.getItem('emstoken')
            const res = await axios.put(`${import.meta.env.VITE_API_ADDRESS}User/${inp.userid}`,
                { name: inp.name, email: inp.email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setpassmodal(false)
            fetche();
            toast.success(res.data.message, { autoClose: 1800 });
        } catch (error) {
            console.log(error);
            toast.warn(error.response?.data?.message || 'Error', { autoClose: 3000 });
        }
    }

    const deploy = async (project) => {
        // console.log("hey");

        swal({
            title: `Are you sure you want to Deploy ${project}?`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (proceed) => {
            if (proceed) {
                try {
                    const token = localStorage.getItem('emstoken')
                    const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}deploy/${project}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    toast.success(res.data.message, { autoClose: 1800 });
                } catch (error) {
                    console.log(error);
                    toast.warn(error.response?.data?.message || 'Error', { autoClose: 3000 });
                }
            }
        });
    }

    const cancel = () => {
        setpassmodal(false);
        setinp(init);
        setisedit(false);
    }

    const columns = [
        {
            name: "S.No",
            selector: (row, index) => index + 1,
            width: "60px",
        },
        {
            name: "Name",
            selector: (row) => row?.registeredName ?? '',
        },
        {
            name: "Email",
            selector: (row) => row.email,
        },
        {
            name: "Date",
            selector: (row) => dayjs(row.createdAt).format("DD MMM, YY"),
        },
        {
            name: "Status",
            selector: (row) => row.stat || "-",
            width: "130px",
        },
        {
            name: "Action",
            width: "100px",
            cell: (row) => (
                <div className="flex gap-2">
                    <span
                        className="text-[18px] text-blue-500 cursor-pointer"
                        title="Edit"
                        onClick={() => edite(row)}
                    >
                        <MdOutlineModeEdit />
                    </span>
                    <span
                        className="text-[18px] text-red-500 cursor-pointer"
                        title="Delete"
                        onClick={() => deletee(row._id)}
                    >
                        <AiOutlineDelete />
                    </span>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className='my-1 flex justify-end gap-2'>
                <Button
                    variant="contained"
                    className="flex-[2] md:w-fit md:flex-none"
                    // startIcon={<GoPlus />}
                    onClick={() => deploy('accusoft')}
                >
                    Accusoft
                </Button>
                <Button
                    variant="contained"
                    className="flex-[2] md:w-fit md:flex-none"
                    // startIcon={<GoPlus />}
                    onClick={() => deploy('battlefiesta')}
                >
                    battlefiesta
                </Button>
                <Button
                    variant="contained"
                    className="flex-[2] md:w-fit md:flex-none"
                    // startIcon={<GoPlus />}
                    onClick={() => deploy('office')}
                >
                    office
                </Button>
                <Button
                    variant="contained"
                    className="flex-[2] md:w-fit md:flex-none"
                    startIcon={<GoPlus />}
                    onClick={() => setpassmodal(true)}
                >
                    Add User
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={users}
                pagination
                customStyles={useCustomStyles()}
                highlightOnHover
                noDataComponent={
                    <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
                        <BiMessageRoundedError className="text-xl" /> No records found matching your criteria.
                    </div>
                }
            />

            <Modalbox open={passmodal} onClose={() => {
                setpassmodal(false);
            }}>
                <div className="membermodal w-[500px]" >
                    <form onSubmit={adduser}>
                        <h2>Add New User</h2>
                        <span className="modalcontent ">
                            <div className='flex flex-col gap-3 w-full'>
                                <TextField fullWidth required
                                    value={inp.name}
                                    onChange={(e) => setinp({ ...inp, name: e.target.value })}
                                    label="Name" size="small"

                                />
                                <TextField fullWidth required type='email'
                                    value={inp.email}
                                    onChange={(e) => setinp({ ...inp, email: e.target.value })}
                                    label="Email" size="small"

                                />

                                {!isedit && <TextField fullWidth required type='password'
                                    value={inp.password}
                                    onChange={(e) => setinp({ ...inp, password: e.target.value })}
                                    label="Passowrd" size="small"
                                />}

                                <div>
                                    {isedit ? <Button variant="contained" sx={{ mr: 2 }} onClick={saveedit} >Save</Button>
                                        : <Button variant="contained" sx={{ mr: 2 }} type="submit" >Add User</Button>}

                                    <Button variant="outlined" onClick={cancel} sx={{ mr: 2 }} >Cancel</Button>
                                </div>
                            </div>
                        </span>
                    </form>
                </div>
            </Modalbox>
        </div>
    )
}

export default DeveloperDashboard;


