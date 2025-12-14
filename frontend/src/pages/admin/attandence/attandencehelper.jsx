import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { FirstFetch } from "../../../../store/userSlice";
import { useSelector } from "react-redux";

import { IoMdTime } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { FaRegUser } from "react-icons/fa";
import { cloudinaryUrl } from "../../../utils/imageurlsetter";
import { IoInformationCircleOutline } from "react-icons/io5";


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

export const deleteAttandence = async ({ attandanceId, setselectedRows, setisload, dispatch }) => {
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
    setselectedRows([]);
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

function getAttendanceSetting(emp, branch, company) {
  const ifdirretent = branch.find(
    (e) => e._id === emp.branchId && e.defaultsetting === false
  );

  return ifdirretent
    ? {
      attendanceRules: ifdirretent?.setting?.attendanceRules,
      workingMinutes: ifdirretent?.setting?.workingMinutes,
      weeklyOffs: ifdirretent?.setting?.weeklyOffs,
    }
    : {
      attendanceRules: company?.attendanceRules,
      workingMinutes: company?.workingMinutes,
      weeklyOffs: company?.weeklyOffs,
    };
}

export const columns = ({
  branch,
  company,
  holidaydate,
  minutesinhours,
  canEdit,
  canDelete,
  edite,
  deletee,
}) => [
    {
      name: "Name",
      selector: (row) => row?.employeeId?.userid?.name,
      sortable: true,
      style: { minWidth: "180px" },
      cell: (row) => (
        <div className="flex items-center gap-3 ">
          <Avatar
            src={cloudinaryUrl(row?.employeeId?.profileimage, {
              format: "webp",
              width: 100,
              height: 100,
            })}
            alt={row?.employeeId?.employeename}
          >
            {!row?.employeeId?.profileimage && <FaRegUser />}
          </Avatar>
          <Box>
            <p className="text-[12px] md:text-[14px] text-gray-700 font-semibold">
              {row?.employeeId?.userid?.name}
            </p>
          </Box>
        </div>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      width: "110px",
      cell: (row) => dayjs(row.date).format("DD MMM, YYYY"),
    },

    {
      name: "Punch In",
      width: '140px',
      cell: (row) => {
        if (!row.punchIn) return "- : -";

        const setting = getAttendanceSetting(row, branch, company);
        const isWeeklyOff = setting?.weeklyOffs.includes(dayjs(row.date).day());
        const isHoliday = holidaydate.includes(dayjs(row.date).format("DD/MM/YYYY"));

        const [earlyHour, earlyMinute] = setting.attendanceRules.considerEarlyEntryBefore.split(":").map(Number);
        const [lateHour, lateMinute] = setting.attendanceRules.considerLateEntryAfter.split(":").map(Number);

        const earlyThreshold = dayjs(row.punchIn).startOf("day").add(earlyHour, "hour").add(earlyMinute, "minute");
        const lateThreshold = dayjs(row.punchIn).startOf("day").add(lateHour, "hour").add(lateMinute, "minute");

        return (
          <div className="flex w-full items-center gap-1">
            <IoMdTime className="text-[16px] text-blue-700" />
            {dayjs(row.punchIn).format("hh:mm A")}
            {!isWeeklyOff && !isHoliday && (
              <>
                {dayjs(row.punchIn).isBefore(earlyThreshold) && (
                  <span className="px-2 py-1 rounded bg-sky-100 text-sky-800">Early</span>
                )}
                {dayjs(row.punchIn).isAfter(lateThreshold) && (
                  <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">Late</span>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      name: "Punch Out",
      width: '140px',
      cell: (row) => {
        if (!row.punchOut) return "- : -";

        const setting = getAttendanceSetting(row, branch, company);
        const isWeeklyOff = setting?.weeklyOffs.includes(dayjs(row.date).day());
        const isHoliday = holidaydate.includes(dayjs(row.date).format("DD/MM/YYYY"));

        const [earlyHour, earlyMinute] = setting.attendanceRules.considerEarlyExitBefore.split(":").map(Number);
        const [lateHour, lateMinute] = setting.attendanceRules.considerLateExitAfter.split(":").map(Number);

        const earlyExitThreshold = dayjs(row.punchOut).startOf("day").add(earlyHour, "hour").add(earlyMinute, "minute");
        const lateExitThreshold = dayjs(row.punchOut).startOf("day").add(lateHour, "hour").add(lateMinute, "minute");

        return (
          <div className="flex  items-center gap-1">
            <IoMdTime className="text-[16px] text-blue-700" />
            {dayjs(row.punchOut).format("hh:mm A")}
            {!isWeeklyOff && !isHoliday && (
              <>
                {dayjs(row.punchOut).isBefore(earlyExitThreshold) && (
                  <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">Early</span>
                )}
                {dayjs(row.punchOut).isAfter(lateExitThreshold) && (
                  <span className="px-2 py-1 rounded bg-sky-100 text-sky-800">Late</span>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      name: "Status",
      width: "100px",
      cell: (row) => {
        const absent = row.status === "absent";
        const leave = row.status === "leave";
        const holiday = row.status === "holiday";
        const weeklyoff = row.status === "weekly off";
        return (
          <>
            <span
              title={leave ? row?.leave?.reason : ""}
              className={`px-2 py-1 rounded
             ${absent ? "bg-red-100 text-red-800"
                  : leave ? "bg-amber-100 text-amber-800"
                    : holiday ? "bg-blue-50 text-blue-800"
                      : weeklyoff ? "bg-gray-50 text-gray-800"
                        : "bg-green-100 text-green-800"
                }`}
            >
              {row.status}
            </span>
            {leave && row?.leave?.reason &&
              <span title={row?.leave?.reason} className="ml-1 text-blue-600 text-lg font-bold"> <IoInformationCircleOutline /> </span>
            }
          </>
        );
      },
    },
    {
      name: "Working Hours",
      width: "210px",
      cell: (row) => {
        const setting = getAttendanceSetting(row, branch, company);
        const isWeeklyOff = setting?.weeklyOffs.includes(dayjs(row.date).day());
        const isHoliday = holidaydate.includes(dayjs(row.date).format("DD/MM/YYYY"));

        return row.workingMinutes ? (
          <div>
            <p>
              <span className="inline-block w-[50px]">
                {minutesinhours(row?.workingMinutes)}
              </span>
              {isWeeklyOff || isHoliday ? (
                <span className="ml-2 px-1 py-1 rounded bg-green-100 text-green-800">
                  Overtime {row.workingMinutes} min
                </span>
              ) : (
                <>
                  {row.workingMinutes < setting?.workingMinutes?.shortDayThreshold && (
                    <span className="ml-2 px-1 py-1 rounded bg-amber-100 text-amber-800">
                      Short {setting?.workingMinutes?.shortDayThreshold - row.workingMinutes} min
                    </span>
                  )}
                  {row.workingMinutes > setting?.workingMinutes?.overtimeAfterMinutes && (
                    <span className="ml-2 p-1 rounded bg-green-100 text-green-800">
                      Overtime {row.workingMinutes - setting?.workingMinutes?.overtimeAfterMinutes} min
                    </span>
                  )}
                </>
              )}
            </p>
            <p className="text-[12px] mt-1 text-gray-600">
              {isHoliday ? "(Holiday)" : isWeeklyOff ? "(Weekly Off)" : ""}
            </p>
          </div>
        ) : "-";
      },
    },
    {
      name: "Action",
      width: "80px",
      cell: (row) => (
        <div className="flex gap-2.5">
          {canEdit && (
            <span
              className="text-[18px] text-blue-500 cursor-pointer"
              title="Edit"
              onClick={() => edite(row)}
            >
              <MdOutlineModeEdit />
            </span>
          )}
          {canDelete && (
            <span
              className="text-[18px] text-red-500 cursor-pointer"
              onClick={() => deletee(row._id)}
            >
              <AiOutlineDelete />
            </span>
          )}
        </div>
      ),
    },
  ];

export const useCustomStyles = () => {
  const primaryColor = useSelector((state) => state.user.primaryColor) || "#115e59";

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
