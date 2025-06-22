import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";


export const submitAttandence = async ({ isPunchIn, inp, setisload }) => {
  // console.log(inp)
  setisload(false);

  const basePayload = {
    employeeId: inp.employeeId,
    departmentId: inp.departmentId,
    date: dayjs(inp.date).toDate(),
  }

  const payload = isPunchIn
    ? {
      ...basePayload,
      ...(inp.punchIn ? { punchIn: dayjs(inp.punchIn).toDate() } : {}),
      status: inp.status,
    }
    : {
      ...basePayload,
      ...(inp.punchOut ? { punchOut: dayjs(inp.punchOut).toDate() } : {}),
    };

  const address = isPunchIn ? `${import.meta.env.VITE_API_ADDRESS}checkin` : `${import.meta.env.VITE_API_ADDRESS}checkout`

  try {
    const token = localStorage.getItem('emstoken')
    const res = await axios.post(
      address,
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

export const deleteAttandence = async ({ attandanceId, setisload }) => {
  if (!attandanceId) return toast.warning('Attandance Id is needed');
  const address = `${import.meta.env.VITE_API_ADDRESS}deleteattandence`

  try {
    const token = localStorage.getItem('emstoken')
    const res = await axios.post(
      address,
      { attandanceId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('delete attandence Query:', res);
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
    selector: (row) => row.name,
    // width: '120px'
  },
  {
    name: "Date",
    selector: (row) => row.date,
    sortable: true,
    width: '110px'
  },
  {
    name: "Punch In",
    selector: (row) => row.punchIn || '- : -'
  },
  {
    name: "Punch Out",
    selector: (row) => row.punchOut || '-'
  },
  {
    name: "Status",
    selector: (row) => row.stat || '-',
    width: '130px'
  },
  {
    name: "Working Hours",
    selector: (row) => row.workingHours || '-',
    // width: '130px'
  },
  {
    name: "Action",
    selector: (row) => row.action,
    width: '80px'
  },
]

export const customStyles = {
  headCells: {
    style: {
      backgroundColor: 'teal', // header background
      fontWeight: 'bold',         // font weight
      fontSize: '14px',
      color: 'white',             // header cell height
      padding: '0px 5px',
    },
  },
  headRow: {
    style: {
    },
  },
  rows: {
    style: {
      minHeight: '48px',          // height of each row
    },
  },
};