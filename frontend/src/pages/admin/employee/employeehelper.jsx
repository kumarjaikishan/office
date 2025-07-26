import axios from "axios";
import { toast } from "react-toastify";
import { MdOutlineModeEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";
import { Avatar, Box, Typography } from "@mui/material";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaRegUser } from "react-icons/fa";

export const columns = [
    {
        name: "S.no",
        selector: (row) => row.sno,
        width:'50px'
    },
    {
        name: "Name",
        selector: (row) => row.name
    },
    {
        name: "Email",
        selector: (row) => row.email
    },
    {
        name: "Department",
        selector: (row) => row.department
    },
    {
        name: "Action",
        selector: (row) => row.action,
         width:'160px'
    }
]


export const addemployee = async ({ formData, setisload, setInp, setopenmodal, init, resetPhoto }) => {
    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}addemployee`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        toast.success(res.data.message, { autoClose: 1200 });
        setInp(init);
        resetPhoto();
        setopenmodal(false);
    } catch (error) {
        console.log(error);
        if (error.response) {
            toast.warn(error.response.data.message, { autoClose: 1200 });
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        setisload(false);
    }
};


export const employeeupdate = async ({ formData, inp,setEmployeePhoto, setisload, setInp, setopenmodal, init }) => {
    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}updateemployee`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Query:', res);
        toast.success(res.data.message, { autoClose: 1200 });
        setEmployeePhoto(null)
        setInp(init);
        setopenmodal(false);
    } catch (error) {
        console.log(error);
        if (error.response) {
            toast.warn(error.response.data.message, { autoClose: 1200 });
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        setisload(false);
    }
};
export const employeedelette = async ({ employeeId, setisload }) => {

    if (!employeeId) {
        alert('All fileds are Required');
        return;
    }

    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}deleteemployee`,
            {
                employeeId
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Query:', res);
        toast.success(res.data.message, { autoClose: 1200 });
    } catch (error) {
        console.log(error);
        if (error.response) {
            toast.warn(error.response.data.message, { autoClose: 1200 });
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        setisload(false);
    }
};

export const employeefetche = async ({navigate,setopenviewmodal,setviewEmployee, setisload, setemployeelist, deletee, edite, setdepartmentlist }) => {
    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.get(
            `${import.meta.env.VITE_API_ADDRESS}employeelist`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        // console.log('employee fetch Query:', res.data);
        let sno = 1;
        const data = await res.data.list.map((emp) => {
            return {
                id: emp._id,
                sno: sno++,
                rawname:emp.employeename,
                name: (<div className="flex items-center gap-3 ">
                    <Avatar src={emp.profileimage} alt={emp.employeename}>
                        {!emp.profileimage && <FaRegUser />}
                    </Avatar>
                    <Box>
                        <Typography variant="body2">{emp.employeename}</Typography>
                    </Box>
                </div>),
                email: emp.userid.email,
                branch: emp.branchId,
                department: emp.department,
                action: (<div className="action flex gap-2.5">
                    <span className="eye edit text-[18px] text-green-500 cursor-pointer" onClick={()=>{setviewEmployee(emp._id); setopenviewmodal(true)}} ><IoEyeOutline /></span>
                    <span className="eye edit text-[18px] text-amber-500 cursor-pointer" onClick={()=> navigate(`/admin-dashboard/performance/${emp.userid._id}`) } ><HiOutlineDocumentReport /></span>
                    <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(emp)}><MdOutlineModeEdit /></span>
                    <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(emp._id)}><AiOutlineDelete /></span>
                </div>)
            }
        })
        // console.log(res.data)
        setemployeelist(data);
        setdepartmentlist(res.data.departmentlist)

        let departmentwise = {};
        res.data.list.map((val) => {
            const depName = val.department.department;
            if (departmentwise.hasOwnProperty(depName)) {
                departmentwise[depName].push(val);
            } else {
                departmentwise[depName] = [val];
            }
        })
        // console.log("depart list wise:",departmentwise)

    } catch (error) {
        console.log(error);
        if (error.response) {
            toast.warn(error.response.data.message, { autoClose: 1200 });
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        setisload(false);
    }
};
