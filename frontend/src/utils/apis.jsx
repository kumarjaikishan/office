export const employeefetche = async ({ deletee,edite }) => {
    const token = localStorage.getItem('emstoken');

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
                action: (<div className="action flex gap-2.5">
                    <span className="eye edit text-[18px] text-green-500 cursor-pointer" ><IoEyeOutline /></span>
                    <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(emp)}><MdOutlineModeEdit /></span>
                    <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(emp._id)}><AiOutlineDelete /></span>
                </div>)
            }
        })
        // console.log(res.data.list)
       

    } catch (error) {
        console.log(error);
        if (error.response) {
            toast.warn(error.response.data.message, { autoClose: 1200 });
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Error:', error.message);
        }
    } 
};