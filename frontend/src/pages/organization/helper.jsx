import axios from "axios";
import { toast } from "react-toastify";

export const addCompany = async ({ companyinp }) => {
    const token = localStorage.getItem('emstoken');
    // setisload(true);

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}addcompany`,
            { name: companyinp.name, industry: companyinp.industry },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Query:', res);
        toast.success(res.data.message, { autoClose: 1200 });

        // setopenmodal(false);
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
        // setisload(false);
    }
};