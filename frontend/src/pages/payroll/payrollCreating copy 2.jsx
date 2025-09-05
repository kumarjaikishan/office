import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Button,
  Grid,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { AiOutlinePlus } from "react-icons/ai";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(localeData);
dayjs.extend(isBetween);

export default function PayrollCreatePage() {
  const { employeeId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || "");
  const [selectedEmployeedetail, setSelectedEmployeedetail] = useState(null);

  const { holidays, company, employee, attandence } = useSelector(
    (state) => state.user
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    calculationBasis: "monthDays", // ✅ new: monthDays | workingDays
    allowances: [{ name: "HRA", amount: 0 }],
    bonuses: [{ name: "Performance", amount: 0 }],
    deductions: [{ name: "Tax", amount: 0 }],
    leaveDays: 0,
    absentDays: 0,
    presentDays: 0,
    paidDays: 0,
    adjustPaidLeave: false, // ✅ toggle for paid leave adjustment
  });

  const [basic, setBasic] = useState({
    totalDays: 0,
    holidaysCount: 0,
    weeklyOff: 0,
    workingDays: 0,
    overtime: 0,
  });

  // Assume each employee has a paid leave balance (mock if not in DB)
  const availablePaidLeaves = selectedEmployeedetail?.leaveBalance || 3;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Load employees
  useEffect(() => {
    setEmployees(employee || []);
  }, [employee]);

  // Compute attendance
  useEffect(() => {
    if (!attandence || !selectedEmployee) return;

    const selected = employees.find((e) => e._id === selectedEmployee);
    setSelectedEmployeedetail(selected);

    const monthStart = dayjs(`${form.year}-${String(form.month).padStart(2, "0")}-01`);
    const isCurrentMonth = monthStart.isSame(dayjs(), "month");
    const monthEnd = isCurrentMonth ? dayjs() : monthStart.endOf("month");
    const totalDays = monthEnd.date();

    const filteredAttendance = attandence.filter(
      (e) =>
        e.employeeId._id === selectedEmployee &&
        dayjs(e.date).isSame(monthStart, "month")
    );

    const { present, absent, leaves, overtime } = filteredAttendance.reduce(
      (acc, atten) => {
        if (atten.status === "present") acc.present++;
        if (atten.status === "absent") acc.absent++;
        if (atten.status === "leave") acc.leaves++;
        if (company?.workingMinutes?.fullDay > atten.workingMinutes) {
          acc.overtime += company.workingMinutes.fullDay - atten.workingMinutes;
        }
        return acc;
      },
      { present: 0, absent: 0, leaves: 0, overtime: 0 }
    );

    setForm((prev) => ({
      ...prev,
      leaveDays: leaves,
      absentDays: absent,
      presentDays: present,
      paidDays: present,
    }));

    // Weekly offs
    let weeklyOffCount = 0;
    for (let i = 1; i <= totalDays; i++) {
      const currentDate = monthStart.date(i);
      if (company?.weeklyOffs?.includes(currentDate.day())) {
        weeklyOffCount++;
      }
    }

    // Holidays
    let holidayCount = 0;
    holidays?.forEach((h) => {
      const holidayStart = dayjs(h.fromDate);
      const holidayEnd = dayjs(h.toDate);
      for (let i = 1; i <= totalDays; i++) {
        const currentDate = monthStart.date(i);
        if (isCurrentMonth && currentDate.isAfter(dayjs(), "day")) break;
        if (currentDate.isBetween(holidayStart, holidayEnd, "day", "[]")) {
          holidayCount++;
        }
      }
    });

    setBasic({
      totalDays,
      workingDays: totalDays - (weeklyOffCount + holidayCount),
      weeklyOff: weeklyOffCount,
      holidaysCount: holidayCount,
      overtime,
    });
  }, [selectedEmployee, attandence, form.month, form.year, employees, company, holidays]);

  // Salary calculations
  const perDaySalary = useMemo(() => {
    if (!selectedEmployeedetail?.salary) return 0;
    const divisor =
      form.calculationBasis === "workingDays"
        ? basic.workingDays || 1
        : basic.totalDays || 1;
    return selectedEmployeedetail.salary / divisor;
  }, [selectedEmployeedetail, basic, form.calculationBasis]);

  // ✅ Leave deduction logic
  const effectiveLeaveDays = useMemo(() => {
    if (form.adjustPaidLeave) {
      // Leaves covered by available paid leaves
      return Math.max(form.leaveDays - availablePaidLeaves, 0);
    }
    return form.leaveDays;
  }, [form.leaveDays, form.adjustPaidLeave, availablePaidLeaves]);

  const leaveDeduction = useMemo(() => {
    return effectiveLeaveDays * perDaySalary;
  }, [effectiveLeaveDays, perDaySalary]);

  const overtimePay = useMemo(() => {
    const rate = 345; // or from company config
    return (basic.overtime / 60) * rate; // assuming overtime is in minutes
  }, [basic.overtime]);

  const totalAllowances = useMemo(
    () => form.allowances.reduce((acc, e) => acc + Number(e.amount), 0),
    [form.allowances]
  );

  const totalBonuses = useMemo(
    () => form.bonuses.reduce((acc, e) => acc + Number(e.amount), 0),
    [form.bonuses]
  );

  const totalDeductions = useMemo(
    () => form.deductions.reduce((acc, e) => acc + Number(e.amount), 0) + leaveDeduction,
    [form.deductions, leaveDeduction]
  );

  const grossSalary = useMemo(() => {
    return (
      (perDaySalary * form.paidDays || 0) +
      totalAllowances +
      totalBonuses +
      overtimePay
    );
  }, [perDaySalary, form.paidDays, totalAllowances, totalBonuses, overtimePay]);

  const netSalary = useMemo(() => {
    return grossSalary - totalDeductions;
  }, [grossSalary, totalDeductions]);

  const handleArrayChange = (field, index, key, value) => {
    const updated = [...form[field]];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addArrayItem = (field, item) =>
    setForm((prev) => ({ ...prev, [field]: [...prev[field], item] }));

  const removeArrayItem = (field, index) =>
    setForm((prev) => {
      const updated = [...prev[field]];
      updated.splice(index, 1);
      return { ...prev, [field]: updated };
    });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.post("/api/payroll/create", {
        employeeId: selectedEmployee,
        ...form,
        netSalary,
      });

      setSuccess("Payroll created successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full gap-4 grid grid-cols-2 mx-auto p-6 space-y-6">
      {/* Employee Selection */}
      <Card className="shadow-md col-span-2 p-4 rounded-2xl">
        <Typography variant="h6" gutterBottom>
          Select Employee
        </Typography>
        <Divider />
        <div className="grid gap-4 grid-cols-2 mt-4">
          <FormControl size="small">
            <InputLabel>Month</InputLabel>
            <Select
              value={form.month}
              onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}
            >
              {months.map((month, ind) => (
                <MenuItem key={ind} value={ind + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Year</InputLabel>
            <Select
              value={form.year}
              onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
            >
              {["2024", "2025", "2026"].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Calc. Basis</InputLabel>
            <Select
              value={form.calculationBasis}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, calculationBasis: e.target.value }))
              }
            >
              <MenuItem value="monthDays">Month Days</MenuItem>
              <MenuItem value="workingDays">Working Days</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            disabled={!form.month || !form.year}
            className="col-span-1"
            size="small"
          >
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  <div className="flex items-center gap-2">
                    <Avatar src={emp.profileimage} sx={{ width: 24, height: 24 }} />
                    {emp.userid?.name}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Card>

      {/* Paid Leave Info */}
      <Card className="shadow-md col-span-2 p-4 rounded-2xl">
        <Typography variant="h6">Paid Leave</Typography>
        <Divider />
        <div className="flex items-center justify-between mt-3">
          <p>Available Paid Leaves: {availablePaidLeaves}</p>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.adjustPaidLeave}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, adjustPaidLeave: e.target.checked }))
                }
              />
            }
            label="Adjust Paid Leaves"
          />
        </div>
      </Card>

      {/* Salary Summary */}
      <Card className="shadow-md col-span-2 p-4 rounded-2xl">
        <Typography variant="h6">Salary Summary</Typography>
        <Divider />
        <div className="flex flex-col gap-2 text-right mt-3">
          <p>Per Day Salary: ₹{perDaySalary.toFixed(2)}</p>
          <p>Leave Deduction: -₹{leaveDeduction.toFixed(2)}</p>
          <p>Overtime Pay: +₹{overtimePay.toFixed(2)}</p>
          <p>Allowances: +₹{totalAllowances}</p>
          <p>Bonuses: +₹{totalBonuses}</p>
          <p>Deductions: -₹{totalDeductions.toFixed(2)}</p>
          <Divider />
          <p className="font-bold text-lg">Net Salary: ₹{netSalary.toFixed(2)}</p>
        </div>
      </Card>

      {/* Submit */}
      <div className="col-span-2">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || !selectedEmployee}
        >
          {loading ? "Saving..." : "Save Payroll"}
        </Button>
      </div>

      {success && <p className="text-green-600 mt-2">{success}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
