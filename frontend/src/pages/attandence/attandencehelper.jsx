import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const handleCheckIn = async () => {
  await axios.post('/api/attendance/checkin', { employeeId });
};

const handleCheckOut = async () => {
  await axios.post('/api/attendance/checkout', { employeeId });
};

export const submitAttandence = async ({ inp, setisload }) => {
  console.log(inp)
  setisload(false);
  const payload = {
    ...inp,
    date: dayjs(inp.date).toDate(),
    punchIn: dayjs(inp.punchIn).toDate(),
    punchOut: dayjs(inp.punchOut).toDate(),
  };
  try {
    const token = localStorage.getItem('emstoken')
    const res = await axios.post(
      `${import.meta.env.VITE_API_ADDRESS}webattandence`,
      { ...payload },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('add attandence Query:', res);
    toast.success(res.data.message, { autoClose: 1800 });
    return true;
  } catch (error) {
    console.log(error);
    if (error.response) {
      toast.warn(error.response.data.message, { autoClose: 2700 });
    } else if (error.request) {
      console.error('No response from server:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    setisload(false);
  }
}

export const columns = [
  {
    name: "Name",
    selector: (row) => row.name
  },
  {
    name: "Date",
    selector: (row) => row.date
  },
  {
    name: "Punch In",
    selector: (row) => row.punchIn
  },
  {
    name: "Punch Out",
    selector: (row) => row.punchOut || '-'
  },
  {
    name: "Working Hours",
    selector: (row) => row.workingHours || '-'
  },
  {
    name: "Action",
    selector: (row) => row.action
  },
]