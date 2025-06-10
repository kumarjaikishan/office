import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";

export const columns = [
    {
        name: "S.no",
        selector: (row) => row.sno
    },
    {
        name: "Image",
        selector: (row) => row.photo
    },
    {
        name: "Name",
        selector: (row) => row.name
    },
    {
        name: "DOB",
        selector: (row) => row.dob
    },
    {
        name: "Department",
        selector: (row) => row.department.department
    },
    {
        name: "Action",
        selector: (row) => row.action
    }
]
export const addemployee = async ({inp,setisload,setInp,setopenmodal,init}) => {
    console.log(inp);
    const { employeeName, dob ,department,description,salary} = inp;

    if (!department || !employeeName || !dob) {
        alert('Please fill all fields');
        return;
    }

    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}addemployee`,
            {
               employeeName, dob ,department,description,salary
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
export const employeeupdate = async ({inp,setisload,setInp,setopenmodal,init}) => {

    const {employeeId, employeeName, dob,department,description } = inp;

    if (!department || !employeeId ) {
        alert('All fileds are Required');
        return;
    }

    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}updateemployee`,
            {
              employeeId, employeeName, dob,department,description
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
export const employeedelette = async ({employeeId,setisload}) => {

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

export const employeefetche = async ({ setisload, setemployeelist,deletee,edite,setdepartmentlist }) => {
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

        console.log('employee fetch Query:', res);
        let sno = 1;
        const data = await res.data.list.map((emp) => {
            return {
                id: emp._id,
                sno: sno++,
                photo: emp.profileimage,
                name: emp.employeename,
                dob: emp.dob,
                department: emp.department,
                action: (<div className="action">
                    <span className="edit" title="Edit" onClick={() => edite(emp)}><MdEdit /></span>
                    <span className="delete" onClick={() => deletee(emp._id)}><MdDelete /></span>
                </div>)
            }
        })
        console.log(res.data.list)
        setemployeelist(data);
        setdepartmentlist(res.data.departmentlist)

        let departmentwise={};
        res.data.list.map((val)=>{
            const depName =val.department.department;
            if(departmentwise.hasOwnProperty(depName)){
                 departmentwise[depName].push(val);
            }else{
                departmentwise[depName]=[val];
            }
        })
        console.log("depart list wise:",departmentwise)

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
