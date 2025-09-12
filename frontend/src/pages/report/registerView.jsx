import { Typography } from "@mui/material";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const RegisterView = ({ filters, theme }) => {
  const monthStart = dayjs(`${filters.year}-${filters.month}-01`);
  const isCurrentMonth = monthStart.isSame(dayjs(), "month");
  const monthEnd = isCurrentMonth ? dayjs() : monthStart.endOf("month");
  const totalDays = monthEnd.date();

  // Generate all days for header
  const days = Array.from({ length: totalDays }, (_, i) =>
    monthStart.date(i + 1)
  );

  const { employee, attandence, holidays, company } = useSelector(
    (e) => e.user
  );

  // 👉 Apply same filters
  const filteredEmployees = employee.filter((emp) => {
    if (!emp.status) return false;

    const nameMatch =
      filters.searchText.trim() === "" ||
      emp.userid?.name
        ?.toLowerCase()
        .includes(filters.searchText.toLowerCase());

    const deptMatch =
      filters.department === "all" ||
      emp?.department?._id === filters.department;
    const branchMatch =
      filters.branch === "all" || emp?.branchId === filters.branch;

    return nameMatch && deptMatch && branchMatch;
  });

  // Pre-group attendance
  const attendanceByEmp = {};
  attandence
    ?.filter((a) => dayjs(a.date).isSame(monthStart, "month"))
    .forEach((a) => {
      const empId = a.employeeId._id;
      if (!attendanceByEmp[empId]) attendanceByEmp[empId] = {};
      attendanceByEmp[empId][dayjs(a.date).date()] = a.status;
    });

  // Holidays + Weekly Offs
  const holidayDates = new Set();
  holidays?.forEach((h) => {
    const start = dayjs(h.fromDate);
    const end = dayjs(h.toDate);
    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, "day");
      d = d.add(1, "day")
    ) {
      if (d.isSame(monthStart, "month")) holidayDates.add(d.date());
    }
  });

  const weeklyOffDays = company?.weeklyOffs || [];

  // Helper for status
  const renderStatus = (empId, day) => {
    let status = attendanceByEmp[empId]?.[day] || "-";

    if (status === "present") status = "P";
    if (status === "leave") status = "L";
    if (status === "absent") status = "A";

    if (holidayDates.has(day)) status = "H";
    else {
      const weekday = monthStart.date(day).day(); // 0=Sunday
      if (weeklyOffDays.includes(weekday)) status = "W";
    }


    const colors = theme ? {
      P: "bg-green-200 text-green-900",
      A: "bg-red-200 text-red-900",
      W: "bg-gray-200 text-gray-900",
      H: "bg-blue-200 text-blue-900",
      L: "bg-amber-200 text-amber-900",
    } : {
      P: "bg-green-900 text-green-100",
      A: "bg-red-900 text-red-100",
      W: "bg-gray-900 text-gray-100",
      H: "bg-blue-900 text-blue-100",
      L: "bg-orange-500 text-orange-100",
    }

    return (
      <td key={day}
        className=" w-9 h-9 text-center"
      >
        <div className={`${status == '-' || !theme ? '' : 'border border-dashed'}  w-7 h-7 
         flex items-center justify-center mx-auto font-semibold
         rounded  ${colors[status] || ""}`}>
          {status}
        </div>
      </td>
    );
  };

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th
              className="sticky left-0 bg-white font-bold min-w-[180px] text-left"
            >
              Employee
            </th>
            {days.map((d) => (
              <th
                key={d.date()}
                className=" w-9 min-w-[35px] text-center"
              >
                <div>{d.format("DD")}</div>
                <div>{d.format("ddd")}</div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map((emp) => (
            <tr key={emp._id} className=" border-y border-gray-300">
              <td
                className="sticky py-1 left-0 bg-white min-w-[150px] font-semibold"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={emp.profileimage}
                    alt={emp.userid?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p >{emp?.userid?.name}</p>
                    <p className="text-[10px] text-gray-600">({emp?.designation})</p>
                  </div>
                </div>
              </td>
              {days.map((d) => renderStatus(emp._id, d.date()))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegisterView;
