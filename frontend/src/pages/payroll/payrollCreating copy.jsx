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
    allowances: [{ name: "HRA", amount: 0 }],
    bonuses: [{ name: "Performance", amount: 0 }],
    deductions: [{ name: "Tax", amount: 0 }],
    leaveDays: 0,
    absentDays: 0,
    presentDays: 0,
    paidDays: 0,
  });

  const [basic, setBasic] = useState({
    totalDays: 0,
    holidaysCount: 0,
    weeklyOff: 0,
    workingDays: 0,
    shortTime: 0,
    overtime: 0,
  });

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  // Load employees from redux
  useEffect(() => {
    setEmployees(employee || []);
  }, [employee]);

  // Compute attendance when employee or month/year changes
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

    const { present, absent, leaves, overtime, shorttime } =
      filteredAttendance.reduce(
        (acc, atten) => {
          if (atten.status === "present") acc.present++;
          if (atten.status === "absent") acc.absent++;
          if (atten.status === "leave") acc.leaves++;
          acc.shorttime += atten.shortMinutes || 0;

          if (company?.workingMinutes?.fullDay > atten.workingMinutes) {
            acc.overtime += company.workingMinutes.fullDay - atten.workingMinutes;
          }
          return acc;
        },
        { present: 0, absent: 0, leaves: 0, overtime: 0, shorttime: 0 }
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
      shortTime: shorttime,
      overtime,
    });
  }, [selectedEmployee, attandence, form.month, form.year, employees, company, holidays]);

  // Change handlers
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      });

      setSuccess("Payroll created successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payroll");
    } finally {
      setLoading(false);
    }
  };

  // Salary calculations
  const totalAllowances = useMemo(
    () => form.allowances.reduce((acc, e) => acc + Number(e.amount), 0),
    [form.allowances]
  );

  const totalBonuses = useMemo(
    () => form.bonuses.reduce((acc, e) => acc + Number(e.amount), 0),
    [form.bonuses]
  );

  const totalDeductions = useMemo(
    () => form.deductions.reduce((acc, e) => acc + Number(e.amount), 0),
    [form.deductions]
  );

  const perDaySalary = useMemo(() => {
    if (!selectedEmployeedetail?.salary) return 0;
    return selectedEmployeedetail.salary / basic.totalDays || 0;
  }, [selectedEmployeedetail, basic.totalDays]);

  const grossSalary = useMemo(() => {
    return (
      (perDaySalary * form.paidDays || 0) +
      totalAllowances +
      totalBonuses
    );
  }, [perDaySalary, form.paidDays, totalAllowances, totalBonuses]);

  const netSalary = useMemo(() => {
    return (grossSalary - totalDeductions).toFixed(2);
  }, [grossSalary, totalDeductions]);

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
            <InputLabel>Select Month</InputLabel>
            <Select
              value={form.month}
              onChange={(e) => handleChange("month", e.target.value)}
            >
              {months.map((month, ind) => (
                <MenuItem key={ind} value={ind + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Select Year</InputLabel>
            <Select
              value={form.year}
              onChange={(e) => handleChange("year", e.target.value)}
            >
              {["2024", "2025", "2026"].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            disabled={!form.month || !form.year}
            className="col-span-2"
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
                    <Avatar
                      src={emp.profileimage}
                      sx={{ width: 24, height: 24 }}
                    />
                    {emp.userid?.name}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Card>

      {/* Attendance Summary */}
      {selectedEmployeedetail && (
        <Card className="shadow-md col-span-2 rounded-2xl">
          <CardHeader title="Attendance Summary" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField fullWidth label="Total Days" value={basic.totalDays} />
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth label="Working Days" value={basic.workingDays} />
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth label="Absent" value={form.absentDays} />
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth label="Leave" value={form.leaveDays} />
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth label="Present" value={form.presentDays} />
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth label="Salary Days" value={form.paidDays} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Salary Details */}
      <div className="shadow-md col-span-2 rounded-lg bg-white p-4">
        <p className="text-xl py-2 font-semibold">Salary Details</p>
        <Divider />
        <div className="flex flex-wrap gap-4 p-4">
          <TextField size="small" label="Basic Salary" value={selectedEmployeedetail?.salary || 0} />
          <TextField size="small" label="Per Day Salary" value={perDaySalary.toFixed(2)} />
          <TextField size="small" label="Paid Days" value={form.paidDays} />
          <TextField
            size="small"
            label="Overtime (Hours)"
            value={basic.overtime}
            InputProps={{
              endAdornment: <InputAdornment position="end">@ ₹345/hr</InputAdornment>,
            }}
          />
        </div>
      </div>

      {/* Allowances */}
      <ArrayField
        title="Allowances"
        items={form.allowances}
        onAdd={() => addArrayItem("allowances", { name: "", amount: 0 })}
        onChange={handleArrayChange}
        onRemove={removeArrayItem}
        field="allowances"
        total={totalAllowances}
      />

      {/* Bonuses */}
      <ArrayField
        title="Bonuses"
        items={form.bonuses}
        onAdd={() => addArrayItem("bonuses", { name: "", amount: 0 })}
        onChange={handleArrayChange}
        onRemove={removeArrayItem}
        field="bonuses"
        total={totalBonuses}
      />

      {/* Deductions */}
      <ArrayField
        title="Deductions"
        items={form.deductions}
        onAdd={() => addArrayItem("deductions", { name: "", amount: 0 })}
        onChange={handleArrayChange}
        onRemove={removeArrayItem}
        field="deductions"
        total={totalDeductions}
      />

      {/* Final */}
      <div className="shadow-md h-fit col-span-2 rounded-lg bg-white p-4">
        <p className="text-xl py-2 font-semibold">Final Summary</p>
        <Divider />
        <div className="flex flex-col gap-2 p-4 text-right">
          <p>Base Salary : ₹{selectedEmployeedetail?.salary || 0}</p>
          <p>Allowances : ₹{totalAllowances}</p>
          <p>Bonuses : ₹{totalBonuses}</p>
          <p>Deductions : -₹{totalDeductions}</p>
          <Divider />
          <p className="font-bold text-lg">Net Salary : ₹{netSalary}</p>
        </div>
      </div>

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

// ✅ Reusable component for Allowances / Bonuses / Deductions
function ArrayField({ title, items, onAdd, onChange, onRemove, field, total }) {
  return (
    <div className="shadow-md h-fit col-span-1 rounded-lg bg-white p-4">
      <p className="text-xl py-2 font-semibold">
        {title} - ₹{total}
      </p>
      <Divider />
      <div>
        {items.map((a, i) => (
          <div className="flex gap-4 my-4" key={i}>
            <TextField
              className="flex-5"
              size="small"
              label={title}
              value={a.name}
              onChange={(e) => onChange(field, i, "name", e.target.value)}
            />
            <TextField
              className="flex-5"
              size="small"
              label="Amount"
              type="number"
              value={a.amount}
              onChange={(e) => onChange(field, i, "amount", e.target.value)}
            />
            <IconButton onClick={() => onRemove(field, i)}>
              <MdDelete />
            </IconButton>
          </div>
        ))}
        <Button startIcon={<AiOutlinePlus />} onClick={onAdd}>
          Add {title}
        </Button>
      </div>
    </div>
  );
}
