import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
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
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween'
import localeData from "dayjs/plugin/localeData";
dayjs.extend(localeData);
dayjs.extend(isBetween);

export default function PayrollCreatePage() {
  const { employeeId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || "");
  const [selectedEmployeedetail, setSelectedEmployeedetail] = useState(employeeId || "");
  const [attendance, setAttendance] = useState(null);
  const { department, branch, holidays, company, employee, attandence } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: "",
    allowances: [{ name: 'HRA', amount: 0 }, { name: 'DA', amount: 0 }],
    bonuses: [{ name: 'Diwali', amount: 1200 }, { name: 'Performance', amount: 1200 }],
    overtime: { hours: 0, ratePerHour: 0 },
    deductions: [],
    otherDeductions: [{ name: 'PF', amount: 1200 }, { name: 'ESI', amount: 1200 }],
    leaveDays: 0,
    absentDays: 0,
    presentDays: 0,
    paidDays: 0,
  });

  // Predefined options
  const allowanceTypes = ["HRA", "Travel", "Mobile", "Food"];
  const deductionTypes = ["PF", "Tax", "ESI"];
  const bonusTypes = ["Performance", "Festival", "Referral"];

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const [basic, setbasic] = useState({
    totalDays: 0,
    holidaysCount: 0,
    weeklyOff: 0,
    workingDays: 0,
    shortTime: 0,
    overtime: 0,
  })

  useEffect(() => {
    // console.log(employee)
    setEmployees(employee)
  }, [employee]);
  useEffect(() => {
    console.log(selectedEmployeedetail)
  }, [selectedEmployeedetail]);

  useEffect(() => {
  if (!attandence || !selectedEmployee) return;

  // ✅ get selected employee detail
  const selected = employees?.find(e => e._id === selectedEmployee);
  if (selected) setSelectedEmployeedetail(selected);

  // ✅ filter attendance for employee + month in one pass
  const monthStart = dayjs(`${form.year}-${String(form.month).padStart(2,"0")}-01`);
  const isCurrentMonth = monthStart.isSame(dayjs(), "month");
  const monthEnd = isCurrentMonth ? dayjs() : monthStart.endOf("month");
  const totalDays = monthEnd.date();

  const filteredAttendance = attandence.filter(e =>
    e.employeeId._id === selectedEmployee &&
    dayjs(e.date).isSame(monthStart, "month")
  );

  // ✅ aggregate attendance stats in one reduce pass
  const { present, absent, leaves, overtime, shorttime } = filteredAttendance.reduce(
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

  // ✅ Update form (use functional update to avoid stale form)
  setForm(prev => ({
    ...prev,
    leaveDays: leaves,
    absentDays: absent,
    presentDays: present,
    paidDays: present,
  }));

  // ✅ Weekly offs
  let weeklyOffCount = 0;
  for (let i = 1; i <= totalDays; i++) {
    const currentDate = monthStart.date(i);
    if (company?.weeklyOffs?.includes(currentDate.day())) {
      weeklyOffCount++;
    }
  }

  // ✅ Holidays
  let holidayCount = 0;
  holidays?.forEach(h => {
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

  const totalWorkingDays = totalDays - (weeklyOffCount + holidayCount);

  // ✅ Set summary state
  setbasic({
    totalDays,
    workingDays: totalWorkingDays,
    weeklyOff: weeklyOffCount,
    holidaysCount: holidayCount,
    shortTime: shorttime,
    overtime,
  });
}, [selectedEmployee, attandence, form.month, form.year, employees, company, holidays]);



  const fetchAttendance = async (id) => {
    const res = await axios.get(`/api/attendance/summary/${id}`);
    setAttendance(res.data);
    setForm((prev) => ({
      ...prev,
      leaveDays: res.data.leaveDays,
      absentDays: res.data.absentDays,
      paidDays: res.data.paidDays,
    }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, key, value) => {
    const updated = [...form[field]];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addArrayItem = (field, item) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], item] }));
  };

  const removeArrayItem = (field, index) => {
    setForm((prev) => {
      const updated = [...prev[field]];
      updated.splice(index, 1);
      return { ...prev, [field]: updated };
    });
  };

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

  const totalAllowances = useMemo(() => {
    return form?.allowances?.reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  }, [form?.allowances]); // keep it simple

  const totalBonuses = useMemo(() => {
    return form?.bonuses?.reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  }, [form?.allowances]); // keep it simple

  const totalDeductions = useMemo(() => {
    return form?.deductions?.reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  }, [form?.allowances]); // keep it simple


  return (
    <div className="max-w-full gap-4 grid grid-cols-2 mx-auto p-6 space-y-6">
      {/* Employee Selection */}
      <Card className="shadow-md col-span-2 p-4  rounded-2xl">
        <Typography variant="h6" gutterBottom>
          Select Employee
        </Typography>
        <Divider />
        <div className="grid gap-4 grid-cols-2 mt-4">
          <FormControl className="col-span-1" size="small">
            <InputLabel>Select Month</InputLabel>
            <Select
              value={form.month}
              label="Select Month"
              onChange={(e) => {
                setForm({ ...form, month: e.target.value })
              }}
            >
              <MenuItem value='' selected disabled >  Select Month </MenuItem>
              {months.map((month, ind) => (
                <MenuItem key={ind} value={ind + 1}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="col-span-1" size="small">
            <InputLabel>Select Year</InputLabel>
            <Select
              value={form.year}
              label="Select Year"
              onChange={(e) => {
                setForm({ ...form, year: e.target.value })
              }}
            >
              <MenuItem value='' selected disabled >  Select Year </MenuItem>
              {['2025', '2026'].map((year, ind) => (
                <MenuItem key={ind} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl disabled={!form.month || !form.year} className="col-span-2" size="small">
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployee}
              label="Employee"
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                fetchAttendance(e.target.value);
              }}
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

      {/* Attendance Summary */}
      {attendance && (
        <Card className="shadow-md col-span-2 rounded-2xl">
          <CardHeader title="Attendance Summary" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Total Days"
                  type="number"
                  value={basic.totalDays}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Weekly Off"
                  value={basic.weeklyOff}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Holidays"
                  value={basic.holidaysCount}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Working Days"
                  value={basic.workingDays}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Present"
                  value={form.presentDays}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Absent"
                  value={form.absentDays}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Leave"
                  value={form.leaveDays}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Salary Days"
                  value={form.paidDays}
                />
              </Grid>
            </Grid>
          </CardContent>

        </Card>
      )}

      {/* Salary Details */}
      <div className="shadow-md h-fit col-span-2 rounded-lg bg-white p-4 pt-0">
        <p className="text-xl py-2 font-semibold">Salary Detail</p>
        <Divider />
        <div className="flex flex-wrap gap-4 p-4">
          <TextField
            size="small"
            label="Basic Salary"
            value={selectedEmployeedetail?.salary}
          />
          <TextField
            label="Total Working Days"
            size="small"
            value={form.paidDays}
          />
          <TextField
            label="Per day salary"
            size="small"
            value={(selectedEmployeedetail?.salary / 31).toFixed(2)}
          />
          <TextField
            label="Overtime (In Hour)"
            size="small"
            value={basic.overtime}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  @ 345 per hour
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Total Salary"
            size="small"
            value={form.paidDays}
            onChange={(e) => handleChange("paidDays", e.target.value)}
          />
        </div>
      </div>

      {/* Allowances */}
      <div className="shadow-md h-fit col-span-1 rounded-lg bg-white p-4 pt-0">
        <p className="text-xl py-2 font-semibold">Allowances - {totalAllowances}₹ </p>

        <Divider />
        <div>
          {form && form?.allowances.map((a, i) => (
            <div className="flex gap-4 my-4" key={i}>
              <TextField
                className="flex-5"
                size="small"
                label="Allowance"
                value={a.name}
                onChange={(e) =>
                  handleArrayChange("allowances", i, "name", e.target.value)
                }
              />

              <TextField
                className="flex-5"
                size="small"
                label="Amount"
                value={a.amount}
                onChange={(e) =>
                  handleArrayChange("allowances", i, "amount", e.target.value)
                }
              />
              <div className="flex-1">
                <IconButton title="Delete this Allowance" onClick={() => removeArrayItem("allowances", i)}>
                  <MdDelete />
                </IconButton>
              </div>

            </div>
          ))}
          <Button
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("allowances", { type: "", amount: 0 })}
          >
            Add Allowance
          </Button>

        </div>
      </div>

      {/* Bonuses */}
      <div className="shadow-md h-fit col-span-1 rounded-lg bg-white p-4 pt-0">
        <p className="text-xl py-2 font-semibold">Bonuses - {totalBonuses}₹ </p>
        <Divider />
        <div>
          {form?.bonuses.map((a, i) => (
            <div className="flex gap-4 my-4" key={i}>

              <TextField
                className="flex-5"
                size="small"
                label="Bonuses"
                value={a.name}
                onChange={(e) =>
                  handleArrayChange("bonuses", i, "name", e.target.value)
                }
              />

              <TextField
                className="flex-5"
                size="small"
                label="Amount"
                value={a.amount}
                onChange={(e) =>
                  handleArrayChange("bonuses", i, "amount", e.target.value)
                }
              />
              <div className="flex-1">
                <IconButton title="Delete this bonus" onClick={() => removeArrayItem("bonuses", i)}>
                  <MdDelete />
                </IconButton>
              </div>

            </div>
          ))}
          <Button
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("bonuses", { type: "", amount: 0 })}
          >
            Add Bonuses
          </Button>

        </div>
      </div>

      {/* Deductions */}
      <div className="shadow-md h-fit col-span-1 rounded-lg bg-white p-4 pt-0">
        <p className="text-xl py-2 font-semibold">Deduction - {totalDeductions}₹ </p>
        <Divider />
        <div>
          {form?.deductions.map((a, i) => (
            <div className="flex gap-4 my-4" key={i}>

              <TextField
                className="flex-5"
                size="small"
                label="Deduction"
                value={a.name}
                onChange={(e) =>
                  handleArrayChange("deductions", i, "name", e.target.value)
                }
              />

              <TextField
                className="flex-5"
                size="small"
                label="Amount"
                value={a.amount}
                onChange={(e) =>
                  handleArrayChange("deductions", i, "amount", e.target.value)
                }
              />
              <div className="flex-1">
                <IconButton title="Delete this deduction" onClick={() => removeArrayItem("deductions", i)}>
                  <MdDelete />
                </IconButton>
              </div>

            </div>
          ))}
          <Button
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("deductions", { type: "", amount: 0 })}
          >
            Add Deduction
          </Button>

        </div>
      </div>

      {/* final */}
      <div className="shadow-md h-fit col-span-2 rounded-lg bg-white p-4 pt-0">
        <p className="text-xl py-2 font-semibold">Final Detail</p>
        <Divider />
        <div className="flex flex-col gap-1 p-4">
          <div className=" flex justify-end gap-3">
            <p>Base Salary :</p>
            <p className="w-[60px] ">₹ {selectedEmployeedetail.salary}</p>
          </div>
          <div className=" flex justify-end gap-3">
            <p>Allowances :</p>
            <p className="w-[60px] ">₹ {totalAllowances}</p>
          </div>
          <div className=" flex justify-end gap-3">
            <p>Bonus :</p>
            <p className="w-[60px] ">₹ {totalBonuses}</p>
          </div>
          <div className=" flex justify-end gap-3">
            <p>Deduction :</p>
            <p className="w-[60px] ">-₹ {totalDeductions}</p>
          </div>
          <Divider />
          <div className=" flex justify-end gap-3">
            <p>Total :</p>
            <p className="w-[60px] ">₹ {selectedEmployeedetail?.salary + totalAllowances + totalBonuses - totalDeductions}</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="h-fit col-span-2 ">
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
    </div >
  );
}
