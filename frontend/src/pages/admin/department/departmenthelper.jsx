import axios from "axios";
import { toast } from "react-toastify";
import { MdOutlineModeEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";

export const columns = [
    {
        name: "S.no",
        selector: (row) => row.sno,
        width:'40px'
    },
    {
        name: "Branch",
        selector: (row) => row.branch
    },
    {
        name: "Department",
        selector: (row) => row.dep_name
    },
    {
        name: "Action",
        selector: (row) => row.action,
         width:'80px'
    }
]
export const adddepartment = async ({inp,setisload,setInp,setopenmodal,init}) => {
    console.log(inp);
    const {branchId, department, description } = inp;

    if (!department) {
        alert('Please fill in both fields');
        return;
    }

    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}adddepartment`,
            {
                department,branchId,
                description
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Query:', res);
        toast.success(res.data.message, { autoClose: 1200 });
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
export const update = async ({inp,setisload,setInp,setopenmodal,init}) => {

    const {departmentId, department, description } = inp;

    if (!department || !departmentId) {
        alert('All fileds are Required');
        return;
    }

    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}updatedepartment`,
            {
               departmentId, department, description
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Query:', res);
        toast.success(res.data.message, { autoClose: 1200 });
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
export const delette = async ({departmentId,setisload}) => {

    if (!departmentId) {
        alert('All fileds are Required');
        return;
    }

    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}deletedepartment`,
            {
               departmentId
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


