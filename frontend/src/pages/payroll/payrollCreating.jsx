import React, { useState } from "react";
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
} from "@mui/material";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";



export default function PayrollCreatePage() {
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Payroll state
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: "",
    allowances: [],
    bonuses: [],
    overtime: { hours: 0, ratePerHour: 0 },
    deductions: [],
    otherDeductions: [],
    leaveDays: 0,
    absentDays: 0,
    paidDays: 0,
  });

  // Handle input changes
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle array changes (allowances, deductions etc.)
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

  // Submit payroll
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await axios.post("/api/payroll/create", {
        employeeId,
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
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader title="Create Payroll" className="bg-gray-100" />
        <Divider />

        <CardContent>
          <Grid container spacing={2}>
            {/* Base Salary */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Salary"
                type="number"
                value={form.baseSalary}
                onChange={(e) => handleChange("baseSalary", e.target.value)}
              />
            </Grid>

            {/* Attendance */}
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Leave Days"
                type="number"
                value={form.leaveDays}
                onChange={(e) => handleChange("leaveDays", e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Absent Days"
                type="number"
                value={form.absentDays}
                onChange={(e) => handleChange("absentDays", e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Paid Days"
                type="number"
                value={form.paidDays}
                onChange={(e) => handleChange("paidDays", e.target.value)}
              />
            </Grid>

            {/* Allowances */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Allowances</Typography>
              {form.allowances.map((a, i) => (
                <Grid container spacing={1} key={i} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Type"
                      value={a.type}
                      onChange={(e) =>
                        handleArrayChange("allowances", i, "type", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={a.amount}
                      onChange={(e) =>
                        handleArrayChange("allowances", i, "amount", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => removeArrayItem("allowances", i)}>
                      <AiOutlineMinus />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AiOutlinePlus />}
                onClick={() => addArrayItem("allowances", { type: "", amount: 0 })}
              >
                Add Allowance
              </Button>
            </Grid>

            {/* Bonuses */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Bonuses</Typography>
              {form.bonuses.map((b, i) => (
                <Grid container spacing={1} key={i} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Type"
                      value={b.type}
                      onChange={(e) =>
                        handleArrayChange("bonuses", i, "type", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={b.amount}
                      onChange={(e) =>
                        handleArrayChange("bonuses", i, "amount", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => removeArrayItem("bonuses", i)}>
                      <AiOutlineMinus />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AiOutlinePlus />}
                onClick={() => addArrayItem("bonuses", { type: "", amount: 0 })}
              >
                Add Bonus
              </Button>
            </Grid>

            {/* Overtime */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Overtime Hours"
                type="number"
                value={form.overtime.hours}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    overtime: { ...prev.overtime, hours: e.target.value },
                  }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Overtime Rate"
                type="number"
                value={form.overtime.ratePerHour}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    overtime: { ...prev.overtime, ratePerHour: e.target.value },
                  }))
                }
              />
            </Grid>

            {/* Deductions */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Deductions</Typography>
              {form.deductions.map((d, i) => (
                <Grid container spacing={1} key={i} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Type"
                      value={d.type}
                      onChange={(e) =>
                        handleArrayChange("deductions", i, "type", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={d.amount}
                      onChange={(e) =>
                        handleArrayChange("deductions", i, "amount", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => removeArrayItem("deductions", i)}>
                      <AiOutlineMinus />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AiOutlinePlus />}
                onClick={() => addArrayItem("deductions", { type: "", amount: 0 })}
              >
                Add Deduction
              </Button>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions className="flex justify-end p-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Payroll"}
          </Button>
        </CardActions>
      </Card>

      {/* Feedback messages */}
      {success && <p className="text-green-600 mt-2">{success}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
