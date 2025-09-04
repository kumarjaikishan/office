import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { FirstFetch } from "../../../../store/userSlice";
import { useSelector } from "react-redux";


export const submitAttandence = async ({ isPunchIn, inp, setisload, dispatch }) => {
  //  return console.log(inp)
  setisload(false);

  const basePayload = {
    employeeId: inp.employeeId,
    date: dayjs(inp.date).toDate(),
  }

  if (inp.status == 'leave') {
    basePayload.reason = inp.reason
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

    // console.log('add attandence Query:', res);
    toast.success(res.data.message, { autoClose: 1800 });
    dispatch(FirstFetch());
    return true;
  } catch (error) {
    console.log(error);
    if (error.response) {
      toast.warn(error.response.data.message, { autoClose: 3000 });
    } else if (error.request) {
      console.error('No response from server:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    setisload(false);
  }
}

export const deleteAttandence = async ({ attandanceId, setisload, dispatch }) => {
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

    // console.log('delete attandence Query:', res);
    toast.success(res.data.message, { autoClose: 1800 });
    dispatch(FirstFetch());
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
    sortable: true,
    sortFunction: (a, b) => a.rawname.localeCompare(b.rawname),
    // width: '120px'
    id: "rawname"
  },
  {
    name: "Date",
    selector: (row) => row.date,
    sortable: true,
    width: '110px',
    id: "date"
  },
  {
    name: "Punch In",
    selector: (row) => row.punchIn || '- : -',
    // width: '150px',
  },
  {
    name: "Punch Out",
    selector: (row) => row.punchOut || '- : -',
    // width: '150px',
  },
  {
    name: "Status",
    selector: (row) => row.stat || '-',
    width: '100px'
  },
  {
    name: "Working Hours",
    selector: (row) => row.workingHours || '-',
    width: '210px'
  },
  // {
  //   name: "Remarks",
  //   selector: (row) => row.remarks || '-',
  //   // width: '130px'
  // },
  {
    name: "Action",
    selector: (row) => row.action,
    width: '80px'
  },
]


export const useCustomStyles = () => {
  const primaryColor = useSelector((state) => state.user.primaryColor) || "teal";

  return {
    headCells: {
      style: {
        backgroundColor: primaryColor,
        fontWeight: "bold",
        fontSize: "14px",
        color: "white",
        justifyContent: "flex-start",
        paddingLeft: "8px",
        paddingRight: "0px",
      },
    },
    headRow: {
      style: {
        borderBottom: "2px solid #ccc",
      },
    },
    rows: {
      style: {
        minHeight: "48px",
        borderBottom: "1px solid #eee",
      },
    },
    cells: {
      style: {
        justifyContent: "flex-start",
        paddingLeft: "8px",
        paddingRight: "0px",
      },
    },
  };
};
