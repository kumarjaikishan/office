import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";

export const columns = [
    {
        name: "S.no",
        selector: (row) => row.sno
    },
    {
        name: "Employee",
        selector: (row) => row.employeeId
    },
    {
        name: "Department",
        selector: (row) => row.department
    },
    {
        name: "Salary",
        selector: (row) => row.netSalary
    },
    {
        name: "Pay date",
        selector: (row) => row.payDate
    },
    {
        name: "Action",
        selector: (row) => row.action
    }
]

export const employeefetche = async ({ setisload }) => {
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
        return res.data.list;

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

export const salaryfetch = async ({ setisload, deletee, edite }) => {
    const token = localStorage.getItem('emstoken');
    setisload(true);

    try {
        const res = await axios.get(
            `${import.meta.env.VITE_API_ADDRESS}salaryfetch`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log(res.data)
        let sno = 1;
        const data = await res.data.salary.map((emp) => {
            return {
                id: emp._id,
                sno: sno++,
                employeeId: emp.employeeId.employeename,
                department:emp.employeeId.department.department ,
                netSalary: emp.netSalary,
                payDate: emp.payDate,
                action: (<div className="action">
                    <span className="edit" title="Edit" onClick={() => edite(emp)}><MdEdit /></span>
                    <span className="delete" onClick={() => deletee(emp._id)}><MdDelete /></span>
                </div>)
            }
        })
        return data;

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

export const addsalary = async ({ inp, setisload }) => {
    const token = localStorage.getItem('emstoken');
    setisload(true);
    const { employeeId, basicSalary, allowance, deductions, netSalary, payDate, department, description } = inp
    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}addsalary`,
            {
                employeeId, basicSalary, allowance, deductions, netSalary, payDate, department, description
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log(res)
        toast.success(res.data.message, { autoClose: 1200 });
        setisload(false);
        return true;
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