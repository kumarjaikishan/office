import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";

export const columns = [
    {
        name: "S.no",
        selector: (row) => row.sno
    },
    {
        name: "Department",
        selector: (row) => row.dep_name
    },
    {
        name: "Action",
        selector: (row) => row.action
    }
]
export const adddepartment = async ({inp,setisload,setInp,setopenmodal}) => {
    console.log(inp);
    const { department, description } = inp;

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
                department,
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
export const update = async ({inp,setisload,setInp,setopenmodal}) => {

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

export const fetche = async ({ setisload, setdepartmentlist,deletee,edite }) => {
    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.get(
            `${import.meta.env.VITE_API_ADDRESS}departmentlist`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        // console.log('Query:', res);
        let sno = 1;
        const data = await res.data.list.map((dep) => {
            return {
                id: dep._id,
                sno: sno++,
                dep_name: dep.department,
                action: (<div className="action">
                    <span className="edit" title="Edit" onClick={() => edite(dep)}><MdEdit /></span>
                    <span className="delete" onClick={() => deletee(dep._id)}><MdDelete /></span>
                </div>)
            }
        })
        console.log(res.data.list)
        setdepartmentlist(data);

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
