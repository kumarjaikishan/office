import { Table, TableHead, TableBody, TableRow, TableCell, Avatar, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const RegisterView = ({ filters }) => {
  const monthStart = dayjs(`${filters.year}-${filters.month}-01`);
  const isCurrentMonth = monthStart.isSame(dayjs(), "month");
  const monthEnd = isCurrentMonth ? dayjs() : monthStart.endOf("month");
  const totalDays = monthEnd.date();

  // Generate all days for header
  const days = Array.from({ length: totalDays }, (_, i) => monthStart.date(i + 1));

  const { employee, attandence, holidays, company, branch, department } = useSelector((e) => e.user);

  // 👉 Apply same filters as AttendanceReport
  const filteredEmployees = employee.filter((emp) => {
    if (!emp.status) return false;

    const nameMatch =
      filters.searchText.trim() === "" ||
      emp.userid?.name?.toLowerCase().includes(filters.searchText.toLowerCase());

    const deptMatch = filters.department === "all" || emp?.department?._id === filters.department;
    const branchMatch = filters.branch === "all" || emp?.branchId === filters.branch;

    return nameMatch && deptMatch && branchMatch;
  });

  // Pre-group attendance by employeeId
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
    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      if (d.isSame(monthStart, "month")) holidayDates.add(d.date());
    }
  });

  const weeklyOffDays = company?.weeklyOffs || [];

  // Helper to render cell
  const renderStatus = (empId, day) => {
    let status = attendanceByEmp[empId]?.[day] || "N/A"; // default Absent

    if (status === "present") status = "P";
    if (status === "leave") status = "L";
    if (status === "absent") status = "A";

    if (holidayDates.has(day)) status = "H";
    else {
      const weekday = monthStart.date(day).day(); // 0=Sunday
      if (weeklyOffDays.includes(weekday)) status = "W";
    }

    const colors = {
      P: "bg-green-100 text-green-900",
      A: "bg-red-100 text-red-900",
      W: "bg-blue-100 text-blue-900",
      H: "bg-purple-100 text-purple-900",
      L: "bg-orange-100 text-orange-900",
    };

    return (
      <TableCell key={day} className={`text-center font-bold text-sm ${colors[status] || ""}`}>
        {status}
      </TableCell>
    );
  };

  return (
    <div className="overflow-auto">
      <Table size="small" className="overflow-auto">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 2,
                background: "white",
                minWidth: 180,
                fontWeight: "bold",
              }}
            >
              Employee
            </TableCell>
            {days.map((d) => (
              <TableCell key={d.date()} className="text-center text-xs">
                <div>{d.format("DD")}</div>
                <div>{d.format("ddd")}</div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredEmployees.map((emp) => (
            <TableRow key={emp._id}>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                  fontWeight: 700,
                  color: "inherit",
                  background: "white",
                  minWidth: 180,
                }}
              >
                <div className="flex items-center gap-2">
                  <Avatar src={emp.profileimage} sx={{ width: 30, height: 30 }} />
                  <Typography variant="body2">{emp.userid?.name}</Typography>
                </div>
              </TableCell>
              {days.map((d) => renderStatus(emp._id, d.date()))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RegisterView;
