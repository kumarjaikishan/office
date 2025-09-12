import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import numberToWords from "../../utils/numToWord";
import { toast } from "react-toastify";

dayjs.extend(localeData);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

export default function PayrollCreatePage() {
  const { employeeId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || "");
  const [selectedEmployeedetail, setSelectedEmployeedetail] = useState(null);
  const [perminuteRate, setminuteRate] = useState(0)
  const [perDayRate, setPerDayRate] = useState(0)
  const [holidaydate, setholidaydate] = useState([]);
  const [taxrate, settaxrate] = useState(0);
  const [employeeleavebal, setemployeeleavebal] = useState(0);
  const [previousAdvance, setpreviousAdvance] = useState(0);


  const { holidays, company, employee, attandence, leaveBalance, advance } = useSelector(
    (state) => state.user
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedEmployeedetail || !leaveBalance) return;

    const latest = leaveBalance
      .filter(e => e.employeeId?._id?.toString() === selectedEmployeedetail._id?.toString())
      .slice() // clone so sort doesn’t mutate original
      .sort((a, b) => new Date(b.date) - new Date(a.date))?.[0];

    // console.log("Latest Leave Balance:", latest);
    setemployeeleavebal(latest?.balance || 0)
  }, [leaveBalance, selectedEmployeedetail]);

  useEffect(() => {
    if (!selectedEmployeedetail || !advance) return;

    const latest = advance
      .filter(e => e.employeeId?._id?.toString() === selectedEmployeedetail._id?.toString())
      .slice() // clone so sort doesn’t mutate original
      .sort((a, b) => new Date(b.date) - new Date(a.date))?.[0];

    // console.log("Latest advance Balance:", latest);
    setpreviousAdvance(latest?.balance)
  }, [advance, selectedEmployeedetail]);


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
    allowances: [{ name: "HRA", amount: 0, extraInfo: '', inputDisabled: false }],
    bonuses: [{ name: "Performance", amount: 0, extraInfo: '', inputDisabled: false }],
    deductions: [{ name: "PF", amount: 0, extraInfo: '', inputDisabled: false }],
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

  const optionsinit = {
    addOvertime: false,
    deductShortTime: false,
    deductAbsent: false,
    adjustLeave: false,
    adjustAdvance: false,
    adjustedLeaveCount: 0, // how many leaves user wants to adjust
    adjustedAdvance: 0, // how many leaves user wants to adjust
  }

  const [options, setOptions] = useState(optionsinit);


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
        ? basic.totalDays || 1
        : basic.totalDays - (basic.holidaysCount + basic.weeklyOff) || 1;

    const perDay = selectedEmployeedetail.salary / divisor;
    const perMinute = perDay / company.workingMinutes.fullDay;

    // console.log(selectedEmployeedetail.salary, divisor, perMinute)

    setminuteRate(perMinute.toFixed(2));
    setPerDayRate(perDay.toFixed(2));
  }, [form.calculationBasis, basic, selectedEmployeedetail, company]);


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
    setOptions(optionsinit)
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
          if (workingMinutes < company?.workingMinutes?.shortDayThreshold) {
            acc.shortmin += company.workingMinutes.shortDayThreshold - workingMinutes;
          } else if (workingMinutes > company?.workingMinutes?.overtimeAfterMinutes) {
            acc.overtime += workingMinutes - company.workingMinutes.overtimeAfterMinutes;
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


  // ✅ Leave deduction logic
  const effectiveLeaveDays = useMemo(() => {
    if (form.adjustPaidLeave) {
      // Leaves covered by available paid leaves
      return Math.max(form.leaveDays - employeeleavebal, 0);
    }
    return form.leaveDays;
  }, [form.leaveDays, form.adjustPaidLeave, employeeleavebal]);

  const leaveDeduction = useMemo(() => {
    return effectiveLeaveDays * perDayRate;
  }, [effectiveLeaveDays, perDayRate]);

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
      // perDayRate * form.paidDays || 0) +
      selectedEmployeedetail?.salary +
      totalAllowances +
      totalBonuses
    );
  }, [perDayRate, form.paidDays, totalAllowances, totalBonuses]);

  const tax = useMemo(() => {
    return (
      ((grossSalary * taxrate) / 100).toFixed(2)
    );
  }, [grossSalary, taxrate]);

  const minutesinhours = useCallback((minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour}h ${minute}m`;
  }, []);

  const netSalary = useMemo(() => {
    // return grossSalary - tax;
    // return Math.floor(grossSalary - tax);
    return Math.floor(grossSalary - totalDeductions);
  }, [grossSalary, totalDeductions]);

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
    if (options.addOvertime) {
      const OvertTimeBonus = basic.overtime * perminuteRate;
      updatedBonuses.push({
        name: "Overtime", amount: OvertTimeBonus.toFixed(2),
        extraInfo: `${basic.overtime} Min @ ₹${perminuteRate} per min.`,
        inputDisabled: true
      });
    }

    // SHORT TIME
    updatedDeductions = updatedDeductions.filter(d => d.name !== "Short Time");
    if (options.deductShortTime && basic.shortmin > 0) {
      const shortTimeDeduction = basic.shortmin * perminuteRate;
      updatedDeductions.push({
        name: "Short Time", amount: shortTimeDeduction.toFixed(2),
        extraInfo: `${basic.shortmin} min @ ₹${perminuteRate} per min.`,
        inputDisabled: true
      });
    }

    // ABSENT
    updatedDeductions = updatedDeductions.filter(d => d.name !== "Absent");
    if (options.deductAbsent && form.absentDays > 0) {
      updatedDeductions.push({
        name: "Absent", amount: (form.absentDays * perDayRate).toFixed(2),
        extraInfo: `${form.absentDays} Absent @ ₹${perDayRate} per day`,
        inputDisabled: true
      });
    }

    // Advance
    updatedDeductions = updatedDeductions.filter(d => d.name !== "Advance");
    if (options.adjustAdvance && previousAdvance > 0) {
      let remainigadvance = previousAdvance - options.adjustedAdvance;
      updatedDeductions.push({
        name: "Advance", amount: (options.adjustedAdvance).toFixed(2),
        extraInfo: `Adjusted :${options.adjustedAdvance},  Remaining :${remainigadvance}`,
        inputDisabled: true
      });
    }

    // LEAVE ADJUSTMENT
    updatedDeductions = updatedDeductions.filter(
      d => d.name !== "Paid Leave Adjustment" && d.name !== "Unpaid Leave"
    );
    if (options.adjustLeave && form.leaveDays > 0) {
      const adjusted = Math.min(options.adjustedLeaveCount, employeeleavebal, form.leaveDays);
      const unadjusted = form.leaveDays - adjusted;

      if (adjusted > 0) {
        updatedDeductions.push({
          name: "Paid Leave Adjustment", amount: 0,
          extraInfo: `${adjusted} Leaves adjusted, Remaining Leaves: ${employeeleavebal - adjusted}`,
          inputDisabled: true
        });
      }
      if (unadjusted > 0) {
        updatedDeductions.push({
          name: "Unpaid Leave", amount: (unadjusted * perDayRate).toFixed(2),
          extraInfo: `${unadjusted} leaves @ ${perDayRate}`,
          inputDisabled: true
        });
      }
    }
    // console.log(updatedDeductions)

    setForm(prev => ({ ...prev, bonuses: updatedBonuses, deductions: updatedDeductions }));
  }, [options, perDayRate, form.leaveDays, form.absentDays, basic.shortmin]);


  const addArrayItem = (field, item) =>
    setForm((prev) => ({ ...prev, [field]: [...prev[field], item] }));

  const removeArrayItem = (field, index) =>
    setForm((prev) => {
      const updated = [...prev[field]];
      updated.splice(index, 1);
      return { ...prev, [field]: updated };
    });

  const handleSubmit = async () => {
    // console.log(basic)
    // console.log(form)
    // console.log(options)
    // console.log(selectedEmployeedetail)
    // return
    // return toast.info('This service is not Enabled Yet')
    const fields = {
      employeeId: selectedEmployeedetail._id,
      calculationBasis: form.calculationBasis,
      options,
      basic,
      month: form.month,
      year: form.year,
      present: form.presentDays,
      leave: form.leaveDays,
      absent: form.absentDays,
      allowances: form.allowances,
      bonuses: form.bonuses,
      deductions: form.deductions,
      taxRate: taxrate,
      name: selectedEmployeedetail?.userid?.name,
    }
    // console.log(fields)
    // return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('emstoken');
      const res = await axios.post(
        `${import.meta.env.VITE_API_ADDRESS}payroll`,
        { ...fields },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(res)
      toast.success(res.data.message)
      setSuccess("Payroll created successfully!");

    } catch (error) {
      console.log(error);
      if (error.response) {
        setError(error.response?.data?.message || "Failed to create payroll");
        toast.warn(error.response.data.message, { autoClose: 1200 });
      } else if (error.request) {
        console.error('No response from server:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full gap-4 grid grid-cols-2 mx-auto p-0 md:p-6 space-y-1">
      {/* Employee Selection */}
      <Card className="shadow-md col-span-2 p-1 md:p-4 rounded-2xl">
        <Typography variant="h6" gutterBottom>
          Select Employee
        </Typography>
        <Divider />
        <div className="grid gap-2 md:gap-4 grid-cols-2 mt-4 space-y-1">
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

      {/* Attendance Summary */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 p-1 md:p-4 rounded-2xl">
          <Typography variant="h6">Attendance Summary</Typography>
          <Divider />
          <div className="flex flex-col  gap-3">
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm md:flex md:flex-wrap">
              {/* <p>Total Days: {basic.totalDays}</p> */}
              <TextField
                className="m max-w-full md:max-w-[120px]"
                size="small"
                label="Total Days"
                value={basic.totalDays}
              />
              <TextField
                className="m max-w-full md:max-w-[120px]"
                size="small"
                label="Holidays"
                value={basic.holidaysCount}
              />
              <TextField
                size="small"
                className="m max-w-full md:max-w-[120px]"
                label="Weekly Offs"
                value={basic.weeklyOff}
              />
              <TextField
                size="small"
                className="m max-w-full md:max-w-[120px]"
                label="Working Days"
                value={basic.workingDays}
              />
              <TextField
                size="small"
                className="m max-w-full md:max-w-[120px]"
                label="Present Days"
                value={form.presentDays || 0}
              />
              <TextField
                className="m max-w-full md:max-w-[120px]"
                size="small"
                label="Leave Days"
                value={form.leaveDays || 0} //{perDayRate}
              />
              <TextField
                className="m max-w-full md:max-w-[120px]"
                size="small"
                label="Absent Days"
                value={form.absentDays || 0} //{perDayRate}
              />
            </div>
            <Divider />
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm md:flex md:flex-wrap">
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
                value={formatRupee(perDayRate)}
                helperText="For Leave/ Absent Calculations"
              />
              <TextField
                size="small"
                label="Per minute Salary"
                value={formatRupee(perminuteRate)}
                helperText="For OverTime/ ShortTime Calculations"
              />

              {/* <p>Overtime (minutes): {basic.overtime} min @{perminuteRate}</p>
              <p>ShortTime (minutes): {basic.shortmin} min @{perminuteRate}</p> */}
            </div>
          </div>
        </Card>}

      {/* Adjustments */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 p-1 md:p-4 rounded-2xl">
          <Typography variant="h6">Adjustments</Typography>
          <Divider />
          <div className="flex flex-col gap-2 mt-4">
            {basic?.overtime ?
              <FormControlLabel
                // className="border"
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

            {form?.leaveDays ?
              <div className="flex items-center flex-wrap md:border-none md:shadow-none border border-slate-300 shadow rounded md:p-0 p-1 gap-4">
                <FormControlLabel
                  control={<Checkbox checked={options.adjustLeave} onChange={(e) => setOptions(p => ({ ...p, adjustLeave: e.target.checked }))} />}
                  label="Adjust Paid Leaves"
                />
                <p className="w-full md:w-fit">Available Paid leaves: {employeeleavebal}</p>
                {options.adjustLeave && (
                  <TextField
                    type="number"
                    size="small"
                    className="w-full md:w-[120px]"
                    label="Adjust Count"
                    inputProps={{
                      min: 0,
                      max: Math.min(employeeleavebal, form.leaveDays),
                    }}
                    value={options.adjustedLeaveCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const max = Math.min(employeeleavebal, form.leaveDays);

                      setOptions((p) => ({
                        ...p,
                        adjustedLeaveCount: Math.max(0, Math.min(val, max)), // clamp between 0 and max
                      }));
                    }}
                  />

                )}
              </div> : ''
            }

            {previousAdvance > 0 ?
              <div className="flex items-center flex-wrap md:border-none md:shadow-none border border-slate-300 shadow rounded md:p-0 p-1 gap-4">
                <FormControlLabel
                  control={<Checkbox checked={options.adjustAdvance} onChange={(e) => setOptions(p => ({ ...p, adjustAdvance: e.target.checked }))} />}
                  label="Adjust Advance"
                />
                <p className="w-full md:w-fit">Advance: {previousAdvance}</p>
                {options.adjustAdvance && (
                  <TextField
                    type="number"
                    size="small"
                    className="w-full md:w-[120px]"
                    label="Adjust Advance"
                    inputProps={{
                      min: 0,
                      max: previousAdvance,
                    }}
                    value={options.adjustedAdvance}
                    onChange={(e) => {
                      const val = Number(e.target.value);

                      // Enforce min and max
                      if (val < 0) {
                        setOptions(p => ({ ...p, adjustedAdvance: 0 }));
                      } else if (val > previousAdvance) {
                        setOptions(p => ({ ...p, adjustedAdvance: previousAdvance }));
                      } else {
                        setOptions(p => ({ ...p, adjustedAdvance: val }));
                      }
                    }}
                  />

                )}
              </div> : ''
            }
          </div>
        </Card>}

      {/* Allowances */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 md:col-span-1 p-1 md:p-4 space-y-2 rounded-2xl">
          <div className="flex justify-between">
            <Typography variant="h6">Allowances</Typography>
            <Typography variant="h6">{formatRupee(totalAllowances)}</Typography>
          </div>
          <Divider />
          {form.allowances.map((allowance, index) => (
            <div key={index} className="flex gap-2 items-start mt-4">
              <TextField
                size="small"
                label="Name"
                className="flex-5"
                value={allowance.name}
                onChange={(e) => handleArrayChange("allowances", index, "name", e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Amount"
                className="flex-2"
                InputProps={{
                  readOnly: allowance.inputDisabled || false,
                }}
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
            variant="outlined"
            onClick={() => addArrayItem("allowances", { name: "", amount: 0, extraInfo: '', inputDisabled: false })}
            className="mt-2 flex-1"
          >
            Add Allowance
          </Button>
        </Card>}

      {/* Bonuses */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 md:col-span-1 p-1 md:p-4 space-y-2 rounded-2xl">
          <div className="flex justify-between">
            <Typography variant="h6">Bonuses</Typography>
            <Typography variant="h6">{formatRupee(totalBonuses)}</Typography>
          </div>
          <Divider />
          {form.bonuses.map((bonus, index) => (
            <div key={index} className="flex gap-2 items-start mt-4">
              <TextField
                size="small"
                label="Name"
                className="flex-5"
                value={bonus.name}
                helperText={bonus.extraInfo ?? ''}
                onChange={(e) => handleArrayChange("bonuses", index, "name", e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label="Amount"
                InputProps={{
                  readOnly: bonus.inputDisabled || false,
                }}
                className="flex-2"
                value={bonus.amount}
                onChange={(e) => handleArrayChange("bonuses", index, "amount", e.target.value)}
              />
              <IconButton className="flex-1" onClick={() => removeArrayItem("bonuses", index)}>
                <MdDelete />
              </IconButton>
            </div>
          ))}
          <Button
            variant="outlined"
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("bonuses", { name: "", amount: 0, extraInfo: '', inputDisabled: false })}
            className="mt-2"
          >
            Add Bonus
          </Button>
        </Card>}

      {/* Deductions */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 md:col-span-1 p-1 md:p-4 space-y-2 rounded-2xl">
          <div className="flex justify-between">
            <Typography variant="h6">Deductions</Typography>
            <Typography variant="h6">{formatRupee(totalDeductions)}</Typography>
          </div>
          <Divider />
          {form.deductions.map((deduction, index) => (
            <div key={index} className="flex gap-2 items-start mt-4">
              <TextField
                size="small"
                label="Deduction"
                className="flex-5"
                value={deduction.name}
                helperText={deduction.extraInfo ?? ''}
                onChange={(e) => handleArrayChange("deductions", index, "name", e.target.value)}
              />
              <TextField
                size="small"
                type="number"
                className="flex-2"
                label="Amount"
                // disabled={deduction.inputDisabled || false}
                InputProps={{
                  readOnly: deduction.inputDisabled || false,
                }}
                readon
                value={deduction.amount}
                onChange={(e) => handleArrayChange("deductions", index, "amount", e.target.value)}
              />
              <IconButton className="flex-1" onClick={() => removeArrayItem("deductions", index)}>
                <MdDelete />
              </IconButton>
            </div>
          ))}
          <Button
            variant="outlined"
            startIcon={<AiOutlinePlus />}
            onClick={() => addArrayItem("deductions", { name: "", amount: 0, extraInfo: '', inputDisabled: false })}
            className="mt-2"
          >
            Add Deduction
          </Button>
        </Card>}

      {/* Salary Summary */}
      {selectedEmployeedetail &&
        <Card className="shadow-md col-span-2 md:col-span-1 p-4 rounded-2xl">
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
            {/* <div className=" flex justify-end">
              <div>Deductions :</div>
              <div className="w-[100px] font-semibold">-{formatRupee(totalDeductions)} </div>
            </div> */}

            <Divider />
            <div className=" flex justify-end font-bold">
              <div>Gross Salary :</div>
              <div className="w-[100px]">{formatRupee(grossSalary)}</div>
            </div>
            {/* <div className=" flex justify-end items-center">
              <div className="flex items-center">
                Tax :
                <div className="flex items-center border mx-1 rounded px-2 w-[80px] h-6 text-sm">
                  <input
                    type="text"
                    value={taxrate}
                    // onChange={(e) => settaxrate(e.target.value)}
                    onChange={(e) => {
                      let val = e.target.value;

                      // Allow only digits
                      if (!/^\d*$/.test(val)) return;

                      // Convert to number (or empty string if blank)
                      let num = val === "" ? "" : Number(val);

                      // Clamp between 0–100
                      if (num > 100) num = 100;

                      settaxrate(num);
                    }}
                    className="w-full outline-none"
                    placeholder="0"
                  />
                  <span className="ml-1">%</span>
                </div> :
              </div>
              <div className="w-[100px]">{formatRupee(tax)}</div>
            </div> */}
            <div className=" flex justify-end">
              <div>Deductions :</div>
              <div className="w-[100px] font-semibold">-{formatRupee(totalDeductions)} </div>
            </div>

            <Divider />

            <div className=" flex justify-end font-bold">
              <div> Net Salary </div>
              <div className="w-[100px]">{formatRupee(netSalary)}</div>
            </div>
            <div className="capitalize text-xs"> In Words:- {numberToWords(netSalary)} </div>
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
