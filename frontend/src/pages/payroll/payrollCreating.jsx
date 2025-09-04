import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";

export default function PayrollCreatePage() {
  const { employeeId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || "");
  const [attendance, setAttendance] = useState(null);
  const { department, branch, employee, attandence } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    baseSalary: "",
    allowances: [{ name: 'HRA', amount: 0 }, { name: 'DA', amount: 0 }],
    bonuses: [{ name: 'Diwali', amount: 1200 }, { name: 'Performance', amount: 1200 }],
    overtime: { hours: 0, ratePerHour: 0 },
    deductions: [],
    otherDeductions: [{ name: 'PF', amount: 1200 }, { name: 'ESI', amount: 1200 }],
    leaveDays: 0,
    absentDays: 0,
    paidDays: 0,
  });

  // Predefined options
  const allowanceTypes = ["HRA", "Travel", "Mobile", "Food"];
  const deductionTypes = ["PF", "Tax", "ESI"];
  const bonusTypes = ["Performance", "Festival", "Referral"];

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    // console.log(employee)
    setEmployees(employee)
  }, [employee]);

  useEffect(() => {
    if (!attandence || !selectedEmployee) return;

    let currentEmployeeAttendance = attandence.filter(e => e.employeeId._id == selectedEmployee)
    console.log(currentEmployeeAttendance)
  }, [selectedEmployee, attandence]);

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
                <MenuItem key={ind} value={ind}>
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
                  value={form.leaveDays}
                  onChange={(e) => handleChange("leaveDays", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Weekly Off"
                  type="number"
                  value={form.leaveDays}
                  onChange={(e) => handleChange("leaveDays", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Holidays"
                  type="number"
                  value={form.absentDays}
                  onChange={(e) => handleChange("absentDays", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Working Days"
                  type="number"
                  value={form.paidDays}
                  onChange={(e) => handleChange("paidDays", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Present"
                  type="number"
                  value={form.paidDays}
                  onChange={(e) => handleChange("paidDays", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Absent"
                  type="number"
                  value={form.paidDays}
                  onChange={(e) => handleChange("paidDays", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Leave"
                  type="number"
                  value={form.paidDays}
                  onChange={(e) => handleChange("paidDays", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Salary Days"
                  type="number"
                  value={form.paidDays}
                  onChange={(e) => handleChange("paidDays", e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>

        </Card>
      )}

      {/* Salary Details */}
      <Card className="shadow-md col-span-2 rounded-2xl">
        <CardHeader title="Salary & Components" />
        <Divider />
        <div className="flex flex-wrap gap-4 p-4">
          <TextField
            label="Basic Salary"
            type="number"
            value={form.paidDays}
            onChange={(e) => handleChange("paidDays", e.target.value)}
          />
          <TextField
            label="Total Working Days"
            type="number"
            value={form.paidDays}
            onChange={(e) => handleChange("paidDays", e.target.value)}
          />
          <TextField
            label="Per day salary"
            type="number"
            value={form.paidDays}
            onChange={(e) => handleChange("paidDays", e.target.value)}
          />
          <TextField
            label="Overtime"
            type="number"
            value={form.paidDays}
            onChange={(e) => handleChange("paidDays", e.target.value)}
          />
          <TextField
            label="Total Salary"
            type="number"
            value={form.paidDays}
            onChange={(e) => handleChange("paidDays", e.target.value)}
          />
        </div>
      </Card>

      {/* Allowances */}
      <Card className="shadow-md h-fit col-span-1 rounded-2xl">
        <CardHeader title="Allowances" />
        <Divider />
        <CardContent>
          {form?.allowances.map((a, i) => (
            <div className="flex gap-4 my-4" key={i}>

              <TextField
                className="flex-5"
                size="small"
                label="Allowance"
                value={a.name}
                onChange={(e) =>
                  handleArrayChange("allowances", i, "amount", e.target.value)
                }
              />

              <TextField
                className="flex-5"
                size="small"
                label="Amount"
                type="number"
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
          <div className="flex gap-4 my-4" >

            <div className="flex-5 text-xl font-bold text-end">
              Total :
            </div>
            <TextField
              className="flex-5"
              size="small"
              label="Total"
              type="number"
              value={12000}

            />
            <div className="flex-1">

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bonuses */}
      <Card className="shadow-md h-fit col-span-1 rounded-2xl">
        <CardHeader title="Bonuses" />
        <Divider />
        <CardContent>
          {form?.bonuses.map((a, i) => (
            <div className="flex gap-4 my-4" key={i}>

              <TextField
                className="flex-5"
                size="small"
                label="Allowance"
                value={a.name}
                onChange={(e) =>
                  handleArrayChange("allowances", i, "amount", e.target.value)
                }
              />

              <TextField
                className="flex-5"
                size="small"
                label="Amount"
                type="number"
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
          <div className="flex gap-4 my-4" >

            <div className="flex-5 text-xl font-bold text-end">
              Total :
            </div>
            <TextField
              className="flex-5"
              size="small"
              label="Total"
              type="number"
              value={12000}

            />
            <div className="flex-1">

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card className="shadow-md h-fit col-span-1 rounded-2xl">
        <CardHeader title="Deduction" />
        <Divider />
        <CardContent>
          {form?.deductions.map((a, i) => (
            <div className="flex gap-4 my-4" key={i}>

              <TextField
                className="flex-5"
                size="small"
                label="Allowance"
                value={a.name}
                onChange={(e) =>
                  handleArrayChange("allowances", i, "amount", e.target.value)
                }
              />

              <TextField
                className="flex-5"
                size="small"
                label="Amount"
                type="number"
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
          <div className="flex gap-4 my-4" >

            <div className="flex-5 text-xl font-bold text-end">
              Total :
            </div>
            <TextField
              className="flex-5"
              size="small"
              label="Total"
              type="number"
              value={12000}

            />
            <div className="flex-1">

            </div>
          </div>
        </CardContent>
      </Card>

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
