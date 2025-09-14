import { Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RegisterView = ({ filters, theme, setcsvcall, csvcall }) => {
  const monthStart = dayjs(`${filters.year}-${filters.month}-01`);
  const isCurrentMonth = monthStart.isSame(dayjs(), "month");
  const monthEnd = isCurrentMonth ? dayjs() : monthStart.endOf("month");
  const totalDays = monthEnd.date();
  const [employeeleavesadjusted, setemployeeleavesadjusted] = useState([])

  // Generate all days for header
  const days = Array.from({ length: totalDays }, (_, i) =>
    monthStart.date(i + 1)
  );

  const { employee, attandence, holidays, company, leaveBalance } = useSelector((e) => e.user);

  useEffect(() => {
    if (!csvcall) return;
    exportCSV2();
    setcsvcall(false);
  }, [csvcall])

  useEffect(() => {

    // console.log(leaveBalance)
    const selectedPeriod = dayjs(`${filters.year}-${filters.month}-01`);
    const thisMonthLeaves = leaveBalance.filter((e) => {
      if (e.type !== "debit" || !e.period) return false;

      // parse "8-2025" into dayjs
      const [m, y] = e.period.split("-");
      const periodDate = dayjs(`${y}-${m}-01`, "YYYY-M-DD");

      return periodDate.isSame(selectedPeriod, "month");
    });

    // console.log(thisMonthLeaves)
    setemployeeleavesadjusted(thisMonthLeaves)
  }, [filters])

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

  let navigate = useNavigate();

  // Pre-group attendance
  const attendanceByEmp = {};
  attandence
    ?.filter((a) => dayjs(a.date).isSame(monthStart, "month"))
    .forEach((a) => {
      const empId = a.employeeId._id;
      if (!attendanceByEmp[empId]) attendanceByEmp[empId] = {};
      attendanceByEmp[empId][dayjs(a.date).date()] = a.status;
    });
  // console.log(attendanceByEmp)

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

    const colors = theme
      ? {
        P: "bg-green-200 text-green-900",
        A: "bg-red-200 text-red-900",
        // L: "bg-orange-200 text-orange-900",
        L: "bg-red-200 text-red-900",
        W: "bg-gray-200 text-gray-900",
        H: "bg-blue-200 text-blue-900",
      }
      : {
        P: "bg-green-900 text-green-100",
        A: "bg-red-900 text-red-100",
        // L: "bg-orange-500 text-orange-100",
        L: "bg-red-500 text-red-100",
        W: "bg-gray-900 text-gray-100",
        H: "bg-blue-900 text-blue-100",
      };

    return (
      <td key={day} className="w-9 h-9 text-center">
        <div
          className={`${status == "-" || !theme ? "" : "border border-dashed"
            } w-7 h-7 
         flex items-center justify-center mx-auto font-semibold
         rounded  ${colors[status] || ""}`}
        >
          {status}
        </div>
      </td>
    );
  };

  // Helper for counting totals per employee
  const getEmployeeTotals = (empId) => {
    const totals = { P: 0, A: 0, L: 0, W: 0, H: 0, LA: 0, NW: 0 };

    days.forEach((d) => {
      let status = attendanceByEmp[empId]?.[d.date()] || "-";

      if (holidayDates.has(d.date())) {
        status = "H";
      } else {
        const weekday = monthStart.date(d.date()).day();
        if (weeklyOffDays.includes(weekday)) status = "W";
      }

      if (status === "present") status = "P";
      if (status === "leave") status = "L";
      if (status === "absent") status = "A";

      if (totals[status] !== undefined) {
        totals[status]++;
      }
    });

    const totalAdjustedLeaves = employeeleavesadjusted
      .filter(e => e.employeeId?._id === empId)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    totals.LA += totalAdjustedLeaves;
    totals.NW = totals.P + totals.W + totals.H + totals.LA

    return totals;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const exportCSV2 = () => {
    // Month-Year title row (e.g. April-2025)
    const titleRow = [`Attendance Register - ${dayjs(`${filters.year}-${filters.month}-01`).format("MMMM-YYYY")}`];

    // CSV Headers: Employee Name + Each day + Totals
    const headers = [
      "Employee",
      ...days.map((d) => d.format("DD")),
      "Present",
      "Absent",
      "Leave",
      "Weekly Off",
      "Holiday",
      "Leave Adjusted",
      "Net Payable Days",
    ];

    // Rows per employee
    const rows = filteredEmployees.map((emp) => {
      const totals = getEmployeeTotals(emp._id);

      const dailyStatus = days.map((d) => {
        let status = attendanceByEmp[emp._id]?.[d.date()] || "-";

        if (holidayDates.has(d.date())) {
          status = "H";
        } else {
          const weekday = monthStart.date(d.date()).day();
          if (weeklyOffDays.includes(weekday)) status = "W";
        }

        if (status === "present") status = "P";
        if (status === "leave") status = "L";
        if (status === "absent") status = "A";

        return status;
      });

      return [
        emp?.userid?.name || "Unknown",
        ...dailyStatus,
        totals.P,
        totals.A,
        totals.L,
        totals.W,
        totals.H,
        totals.LA,
        totals.NW,
      ];
    });

    // Combine rows: title row, empty spacer row, headers, then data
    const csv = [titleRow, headers, ...rows].map((r) => r.join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance Register ${dayjs(`${filters.year}-${filters.month}-01`).format("MMMM-YYYY")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const defaultEmployeePic = 'https://res.cloudinary.com/dusxlxlvm/image/upload/v1753113610/ems/assets/employee_fi3g5p.webp'

  return (
    <div className="overflow-auto">
      {(filteredEmployees?.length < 1 || Object.keys(attendanceByEmp).length === 0) && <p className="text-center font-semibold text-xl" colSpan={days.length + 6}>No Record Found</p>}
      {filteredEmployees?.length > 0 && Object.keys(attendanceByEmp).length !== 0 &&
        <table className="border-collapse text-xs">
          <thead>
            <tr className=" border-t border-gray-400 text-gray-500">
              {/* <tr className=" border-t border-gray-400 bg-gray-700 text-gray-100"> */}
              <th className="sticky left-0 bg-white font-bold min-w-[180px] text-left">
                Employee
              </th>
              {days.map((d) => (
                <th key={d.date()} className="w-9 border border-gray-400 min-w-[35px] text-center">
                  <div>{d.format("DD")}</div>
                  <div>{d.format("ddd")}</div>
                </th>
              ))}
              <th title="Present" className="px-2 border-r border-gray-500 text-green-800">P</th>
              <th title="Absent" className="px-2 border-r border-gray-500 text-red-800">A</th>
              <th title="Leave" className="px-2 border-r border-gray-500 text-orange-600">L</th>
              <th title="Weekly Off" className="px-2 border-r border-gray-500 text-gray-800">W</th>
              <th title="Holiday" className="px-2 border-r border-gray-500 text-blue-800">H</th>
              <th title="Holiday" className="px-2 border-r border-gray-500 text-blue-800">LA</th>
              <th title="Holiday" className="px-2 border-r border-gray-500 text-blue-800">NP</th>
              <th title="Holiday" className="px-2 border-r ">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees?.map((emp) => {
              const totals = getEmployeeTotals(emp._id); // ✅ calculate inside loop
              return (
                <tr key={emp._id} className="border-y border-gray-300">
                  <td className="sticky py-1 left-0 bg-white min-w-[150px] font-semibold">
                    <div className="flex items-center gap-2">
                      <img
                        src={emp?.profileimage || defaultEmployeePic}
                        onError={(e) => { e.target.src = defaultEmployeePic }}
                        alt={emp?.userid?.name || "Employee"}
                        className="w-8 h-8 rounded-full"
                      />

                      <div>
                        <p className="text-gray-800" >{emp?.userid?.name}</p>
                        <p className="text-[10px] text-gray-600">
                          ({emp?.designation})
                        </p>
                      </div>
                    </div>
                  </td>
                  {days.map((d) => renderStatus(emp._id, d.date()))}

                  {/* Totals */}
                  <td className="text-center font-bold text-green-800">{totals.P}</td>
                  <td className="text-center font-bold text-red-800">{totals.A}</td>
                  <td className="text-center font-bold text-orange-600">{totals.L}</td>
                  <td className="text-center font-bold text-gray-800" >{totals.W}</td>
                  <td className="text-center font-bold text-blue-800">{totals.H}</td>
                  <td className="text-center font-bold text-blue-800">{totals.LA}</td>
                  <td className="text-center font-bold text-blue-800">{totals.NW}</td>
                  <td className=" border-r border-gray-300">
                    <div className="action flex justify-center gap-2">
                      <span className="text-[18px] text-amber-500 cursor-pointer" title="Attandence Report" onClick={() => navigate(`/dashboard/performance/${emp.userid._id}`)} ><HiOutlineDocumentReport /></span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={days.length + 6} className="py-4">
                <div className="flex flex-wrap gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-green-200 border border-green-600 rounded"></span>
                    <span>P = Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-red-200 border border-red-600 rounded"></span>
                    <span>A = Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-orange-200 border border-orange-600 rounded"></span>
                    <span>L = Leave</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-gray-200 border border-gray-600 rounded"></span>
                    <span>W = Weekly Off</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-blue-200 border border-blue-600 rounded"></span>
                    <span>H = Holiday</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-blue-200 border border-blue-600 rounded"></span>
                    <span>LA = Leave Availed/Adjusted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-blue-200 border border-blue-600 rounded"></span>
                    <span>NP = Net Payable Days</span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>}
    </div>
  );
};

export default RegisterView;
