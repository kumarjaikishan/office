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
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isBetween from "dayjs/plugin/isBetween";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(localeData);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

export default function PayrollCreatePage() {
  const { employeeId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || "");
  const [selectedEmployeedetail, setSelectedEmployeedetail] = useState(null);
  const [perminuteRate, setminuteRate] = useState(0)
  const [holidaydate, setholidaydate] = useState([]);
  const [perdDyRate, setPerDayRate] = useState(0)

  const { holidays, company, employee, attandence } = useSelector(
    (state) => state.user
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  function formatRupee(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

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
    shortmin: 0,
  });

  const [options, setOptions] = useState({
    addOvertime: false,
    deductShortTime: false,
    deductAbsent: false,
    adjustLeave: false,
    adjustedLeaveCount: 0, // how many leaves user wants to adjust
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

  useEffect(() => {
    if (!selectedEmployeedetail || !basic?.totalDays || !company?.workingMinutes) return;

    let divisor =
      form.calculationBasis === "monthDays"
        ? basic.totalDays
        : basic.totalDays - (basic.holidaysCount + basic.weeklyOff) || 1;

    const perDay = selectedEmployeedetail.salary / divisor;
    const perMinute = perDay / company.workingMinutes.fullDay;

    // console.log(selectedEmployeedetail.salary, divisor, perMinute)

    setminuteRate(perMinute.toFixed(2));
    setPerDayRate(perDay.toFixed(2));
  }, [form.calculationBasis, basic, selectedEmployeedetail, company]);

  const overtimePay = useMemo(() => {
    const rate = 345; // or from company config
    return (basic.overtime / 60) * rate; // assuming overtime is in minutes
  }, [basic.overtime]);


  useEffect(() => {
    if (!holidays) return;
    // console.log(holidays)

    const dateObjects = [];
    holidays.forEach(holiday => {
      let current = dayjs(holiday.fromDate);
      const end = holiday.toDate ? dayjs(holiday.toDate) : current;

      while (current.isSameOrBefore(end, 'day')) {
        dateObjects.push(current.format('DD/MM/YYYY'));
        current = current.add(1, 'day');
      }

    });
    setholidaydate(dateObjects);
  }, [holidays]);

  // Compute attendance
  useEffect(() => {
    if (!attandence || !selectedEmployee) return;

    const selected = employees.find((e) => e._id === selectedEmployee);
    setSelectedEmployeedetail(selected);

    const monthStart = dayjs(`${form.year}-${String(form.month).padStart(2, "0")}-01`);
    const isCurrentMonth = monthStart.isSame(dayjs(), "month");
    const monthEnd = monthStart.endOf("month");
    const totalDays = monthEnd.date();


    const filteredAttendance = attandence.filter(
      (e) =>
        e.employeeId._id === selectedEmployee &&
        dayjs(e.date).isSame(monthStart, "month")
    );

    const { present, absent, leaves, overtime, shortmin } = filteredAttendance.reduce(
      (acc, atten) => {
        if (atten.status === "present") acc.present++;
        if (atten.status === "absent") acc.absent++;
        if (atten.status === "leave") acc.leaves++;

        const dateStr = dayjs(atten.date).format("DD/MM/YYYY");
        const { workingMinutes } = atten;
        const day = dayjs(atten.date).startOf("day").day();

        const isHoliday = holidaydate.includes(dateStr);
        const isWeeklyOff = company?.weeklyOffs.includes(day);

        if (isHoliday || isWeeklyOff) {
          acc.overtime += workingMinutes;
        } else if (atten.status === "present") {
          if (workingMinutes < company?.workingMinutes?.fullDay) {
            acc.shortmin += company.workingMinutes.fullDay - workingMinutes;
          } else if (workingMinutes > company?.workingMinutes?.fullDay) {
            acc.overtime += workingMinutes - company.workingMinutes.fullDay;
          }
        }
        return acc;
      },
      { present: 0, absent: 0, leaves: 0, overtime: 0, shortmin: 0 }
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
      // monthDays,
      totalDays,
      workingDays: totalDays - (weeklyOffCount + holidayCount),
      weeklyOff: weeklyOffCount,
      holidaysCount: holidayCount,
      overtime,
      shortmin,
    });
  }, [selectedEmployee, attandence, form.month, form.year, employees, company, holidays]);

  // Salary calculations
  const perDaySalary = useMemo(() => {
    if (!selectedEmployeedetail?.salary) return 0;
    const divisor =
      form.calculationBasis === "workingDays"
        ? basic.workingDays || 1
        : basic.totalDays || 1;
    let hey = selectedEmployeedetail.salary / divisor;
    console.log(hey)
    return hey
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
    [form.deductions, leaveDeduction]
  );

  const grossSalary = useMemo(() => {
    return (
      // perDaySalary * form.paidDays || 0) +
      selectedEmployeedetail?.salary +
      totalAllowances +
      totalBonuses -
      totalDeductions
    );
  }, [perDaySalary, form.paidDays, totalAllowances, totalDeductions, totalBonuses, overtimePay]);

  const tax = useMemo(() => {
    let taxrate = 10;
    return (
      ((grossSalary * taxrate) / 100).toFixed(2)
    );
  }, [grossSalary]);

  const netSalary = useMemo(() => {
    return grossSalary - tax;
  }, [grossSalary, tax]);
  // const netSalary = useMemo(() => {
  //   return selectedEmployeedetail?.salary - totalDeductions;
  // }, [grossSalary, totalDeductions]);

  const handleArrayChange = (field, index, key, value) => {
    const updated = [...form[field]];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  useEffect(() => {
    let updatedBonuses = [...form.bonuses];
    let updatedDeductions = [...form.deductions];

    // OVERTIME
    updatedBonuses = updatedBonuses.filter(b => b.name !== "Overtime");
    if (options.addOvertime && overtimePay > 0) {
      const OvertTimeBonus = basic.overtime * perminuteRate;
      updatedBonuses.push({ name: "Overtime", amount: OvertTimeBonus.toFixed(2) });
    }

    // SHORT TIME
    updatedDeductions = updatedDeductions.filter(d => d.name !== "Short Time");
    if (options.deductShortTime && basic.shortmin > 0) {
      const shortTimeDeduction = basic.shortmin * perminuteRate;
      updatedDeductions.push({ name: "Short Time", amount: shortTimeDeduction.toFixed(2) });
    }

    // ABSENT
    updatedDeductions = updatedDeductions.filter(d => d.name !== "Absent");
    if (options.deductAbsent && form.absentDays > 0) {
      updatedDeductions.push({ name: "Absent", amount: (form.absentDays * perDaySalary).toFixed(2) });
    }

    // LEAVE ADJUSTMENT
    updatedDeductions = updatedDeductions.filter(
      d => d.name !== "Paid Leave Adjustment" && d.name !== "Unpaid Leave"
    );
    if (options.adjustLeave && form.leaveDays > 0) {
      const adjusted = Math.min(options.adjustedLeaveCount, availablePaidLeaves, form.leaveDays);
      const unadjusted = form.leaveDays - adjusted;

      if (adjusted > 0) {
        updatedDeductions.push({ name: "Paid Leave Adjustment", amount: 0 });
      }
      if (unadjusted > 0) {
        updatedDeductions.push({ name: "Unpaid Leave", amount: (unadjusted * perDaySalary).toFixed(2) });
      }
    }

    setForm(prev => ({ ...prev, bonuses: updatedBonuses, deductions: updatedDeductions }));
  }, [options, overtimePay, perDaySalary, form.leaveDays, form.absentDays, basic.shortmin]);


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
    <div className="max-w-full gap-4 grid grid-cols-2 mx-auto p-6 space-y-1">
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
            label="Month"
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
              label="year"
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
              label="Calc. Basis"
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
            <InputLabel>Select Employee</InputLabel>
            <Select
              label="Select Employee"
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
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 p-4 rounded-2xl">
          <Typography variant="h6">Adjustments</Typography>
          <Divider />
          <div className="flex flex-col gap-2 mt-4">
            {basic?.overtime ?
              <FormControlLabel
                control={<Checkbox checked={options.addOvertime} onChange={(e) => setOptions(p => ({ ...p, addOvertime: e.target.checked }))} />}
                label="Add Overtime as Bonus"
              /> : ''
            }

            {basic?.shortmin ?
              <FormControlLabel
                control={<Checkbox checked={options.deductShortTime} onChange={(e) => setOptions(p => ({ ...p, deductShortTime: e.target.checked }))} />}
                label="Deduct Short Time"
              /> : ''
            }

            {form?.absentDays ?
              <FormControlLabel
                control={<Checkbox checked={options.deductAbsent} onChange={(e) => setOptions(p => ({ ...p, deductAbsent: e.target.checked }))} />}
                label="Deduct Absent Days"
              /> : ''
            }

            <div className="flex items-center gap-4">
              <FormControlLabel
                control={<Checkbox checked={options.adjustLeave} onChange={(e) => setOptions(p => ({ ...p, adjustLeave: e.target.checked }))} />}
                label="Adjust Paid Leaves"
              />
              {options.adjustLeave && (
                <TextField
                  type="number"
                  size="small"
                  label="Adjust Count"
                  inputProps={{ min: 0, max: form.leaveDays }}
                  value={options.adjustedLeaveCount}
                  onChange={(e) => setOptions(p => ({ ...p, adjustedLeaveCount: Number(e.target.value) }))}
                />
              )}
            </div>
          </div>
        </Card>}

      {/* Attendance Summary */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 p-4 rounded-2xl">
          <Typography variant="h6">Attendance Summary</Typography>
          <Divider />
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 mt-4 text-sm">
              {/* <p>Total Days: {basic.totalDays}</p> */}
              <TextField
                size="small"
                label="Total Days"
                value={basic.totalDays}
              />
              <TextField
                size="small"
                label="Holidays"
                value={basic.holidaysCount}
              />
              <TextField
                size="small"
                label="Weekly Offs"
                value={basic.weeklyOff}
              />
              <TextField
                size="small"
                label="Working Days"
                value={basic.workingDays}
              />
              <TextField
                size="small"
                label="Present Days"
                value={form.presentDays || 0}
              />
              <TextField
                size="small"
                label="Leave Days"
                value={form.leaveDays || 0} //{perDaySalary}
              />
              <TextField
                size="small"
                label="Absent Days"
                value={form.absentDays || 0} //{perDaySalary}
              />
            </div>
            <Divider />
            <div className="flex gap-2">
              <TextField
                size="small"
                label="OverTime Minutes"
                value={basic.overtime || 0}
              />
              <TextField
                size="small"
                label="ShortTime Minutes"
                value={basic.shortmin || 0}
              />
              <TextField
                size="small"
                label="Per day Salary"
                value={formatRupee(perDaySalary)}
                helperText="For Leave/Absent Calculations"
              />
              <TextField
                size="small"
                label="Per minute Salary"
                value={formatRupee(perminuteRate)}
                helperText="For OverTime/ShortTime Calculations"
              />

              {/* <p>Overtime (minutes): {basic.overtime} min @{perminuteRate}</p>
              <p>ShortTime (minutes): {basic.shortmin} min @{perminuteRate}</p> */}
            </div>
          </div>
        </Card>}

      {/* Allowances */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-1 p-4 rounded-2xl">
          <div className="flex justify-between">
            <Typography variant="h6">Allowances</Typography>
            <Typography variant="h6">{formatRupee(totalAllowances)}</Typography>
          </div>
          <Divider />
          {form.allowances.map((allowance, index) => (
            <div key={index} className="flex gap-2 items-center mt-4">
              <TextField
                size="small"
                label="Name"
                value={allowance.name}
                onChange={(e) => handleArrayChange("allowances", index, "name", e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Amount"
                value={allowance.amount}
                onChange={(e) => handleArrayChange("allowances", index, "amount", e.target.value)}
              />
              <IconButton onClick={() => removeArrayItem("allowances", index)}>
                <MdDelete />
              </IconButton>
            </div>
          ))}
          <Button
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("allowances", { name: "", amount: 0 })}
            className="mt-2"
          >
            Add Allowance
          </Button>
        </Card>}

      {/* Bonuses */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-1 p-4 rounded-2xl">
          <div className="flex justify-between">
            <Typography variant="h6">Bonuses</Typography>
            <Typography variant="h6">{formatRupee(totalBonuses)}</Typography>
          </div>
          <Divider />
          {form.bonuses.map((bonus, index) => (
            <div key={index} className="flex gap-2 items-center mt-4">
              <TextField
                size="small"
                label="Name"
                value={bonus.name}
                onChange={(e) => handleArrayChange("bonuses", index, "name", e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Amount"
                value={bonus.amount}
                onChange={(e) => handleArrayChange("bonuses", index, "amount", e.target.value)}
              />
              <IconButton onClick={() => removeArrayItem("bonuses", index)}>
                <MdDelete />
              </IconButton>
            </div>
          ))}
          <Button
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("bonuses", { name: "", amount: 0 })}
            className="mt-2"
          >
            Add Bonus
          </Button>
        </Card>}

      {/* Deductions */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-1 p-4 rounded-2xl">
          <div className="flex justify-between">
            <Typography variant="h6">Deductions</Typography>
            <Typography variant="h6">{formatRupee(totalDeductions)}</Typography>
          </div>
          <Divider />
          {form.deductions.map((deduction, index) => (
            <div key={index} className="flex gap-2 items-center mt-4">
              <TextField
                size="small"
                label="Name"
                value={deduction.name}
                onChange={(e) => handleArrayChange("deductions", index, "name", e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Amount"
                value={deduction.amount}
                onChange={(e) => handleArrayChange("deductions", index, "amount", e.target.value)}
              />
              <IconButton onClick={() => removeArrayItem("deductions", index)}>
                <MdDelete />
              </IconButton>
            </div>
          ))}
          <Button
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("deductions", { name: "", amount: 0 })}
            className="mt-2"
          >
            Add Deduction
          </Button>
         </Card>}

      {/* Salary Summary */}
      {/* <Card className="shadow-md col-span-1 p-4 rounded-2xl">
        <Typography variant="h6">Salary Summary</Typography>
        <Divider />
        <div className="flex flex-col gap-2 mt-3 text-sm">
          <p>Per Day Salary ({form.calculationBasis}): ₹{perDaySalary.toFixed(2)}</p>
          <p>Paid Days: {form.paidDays}</p>
          <p>Gross Salary: ₹{grossSalary.toFixed(2)}</p>
          <p>Overtime Pay: +₹{overtimePay.toFixed(2)}</p>
          <p>Leave Deduction: -₹{leaveDeduction.toFixed(2)}</p>
          <p>Other Deductions: -₹{form.deductions.reduce((a, e) => a + Number(e.amount), 0)}</p>
          <Divider />
          <p className="font-bold text-lg">Net Salary: ₹{netSalary.toFixed(2)}</p>
        </div>
      </Card> */}

      {/* Salary Summary */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-1 p-4 rounded-2xl">
          <Typography variant="h6">Salary Summary</Typography>
          <Divider />
          <div className="flex flex-col gap-2 text-right mt-3">
            <div className=" flex justify-end">
              <div>Base Salary :</div>
              {/* <div className="w-[100px] font-semibold">₹{selectedEmployeedetail?.salary || 0}</div> */}
              <div className="w-[100px] font-semibold">{formatRupee(selectedEmployeedetail?.salary || 0)}</div>
            </div>
            <div className=" flex justify-end">
              <div>Allowances :</div>
              <div className="w-[100px] font-semibold">+{formatRupee(totalAllowances)}</div>
            </div>
            <div className=" flex justify-end">
              <div>Bonuses :</div>
              <div className="w-[100px] font-semibold">+{formatRupee(totalBonuses)}</div>
            </div>
            <div className=" flex justify-end">
              <div>Deductions :</div>
              <div className="w-[100px] font-semibold">-{formatRupee(totalDeductions)} </div>
            </div>

            <Divider />
            <div className=" flex justify-end font-bold">
              <div>Gross Salary :</div>
              <div className="w-[100px]">{formatRupee(grossSalary)}</div>
            </div>
            <div className=" flex justify-end">
              <div>Tax :</div>
              <div className="w-[100px]">{formatRupee(tax)}</div>
            </div>
            <Divider />
            <div className=" flex justify-end font-bold">
              <div>Net Salary :</div>
              <div className="w-[100px]">{formatRupee(netSalary)}</div>
            </div>
          </div>
        </Card>
      }

      {/* Submit */}
      {selectedEmployeedetail &&
        <div className="col-span-2">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !selectedEmployee}
          >
            {loading ? "Saving..." : "Save Payroll"}
          </Button>
        </div>}

      {success && <p className="text-green-600 mt-2">{success}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
