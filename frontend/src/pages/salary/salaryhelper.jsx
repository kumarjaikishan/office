import axios from "axios";
import { toast } from "react-toastify";
import { MdDelete, MdEdit } from "react-icons/md";

export const employeefetche = async ({ setisload,deletee,edite }) => {
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

        // console.log('employee fetch Query:', res);
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