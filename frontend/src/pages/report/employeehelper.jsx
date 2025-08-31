import axios from "axios";
import { toast } from "react-toastify";

export const columns = [
    {
        name: "S.no",
        selector: (row) => row.sno,
        width: '40px'
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
        width: '180px'
    }
]


export const addemployee = async ({ formData, dispatch, setisload, setInp, setopenmodal, init, resetPhoto }) => {
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


export const employeeupdate = async ({ formData, dispatch, setEmployeePhoto, setisload, setInp, setopenmodal, init }) => {
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

        // console.log('Query:', res);
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

export const employeedelette = async ({ employeeId, setisload, dispatch }) => {
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

        // console.log('Query:', res);
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


