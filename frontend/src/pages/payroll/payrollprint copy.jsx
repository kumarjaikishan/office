import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { toast } from "react-toastify";

export default function PayrollPrint() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);

  // Dummy fallback payroll data
  const dummyPayroll = {
    month: "08",
    year: "2025",
    baseSalary: 30000,
    grossSalary: 40000,
    allowances: [
      { type: "HRA", amount: 8000 },
      { type: "Transport", amount: 2000 },
    ],
    bonuses: [{ type: "Performance Bonus", amount: 5000 }],
    overtime: { hours: 10, ratePerHour: 200, amount: 2000 },
    deductions: [{ type: "PF", amount: 1500 }],
    otherDeductions: [{ reason: "Late Coming", amount: 500 }],
    leaveDays: 2,
    absentDays: 1,
    paidDays: 27,
    totalDeductions: 2000,
    netSalary: 38000,
  };

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("emstoken");
        const res = await axios.get(
          `${import.meta.env.VITE_API_ADDRESS}payroll`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(res.data.payrolls);
        setPayroll(res?.data?.payrolls || dummyPayroll); // fallback to dummy
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to fetch payroll");
        toast.warn("Using dummy payroll data for testing", { autoClose: 1500 });
        setPayroll(dummyPayroll); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [id]);

  if (loading) return <p className="p-4 text-gray-500">Loading payroll...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader
          title={`Payroll for ${payroll?.month}/${payroll?.year}`}
          className="bg-gray-100 rounded-t-2xl"
        />
        <Divider />

        <CardContent>
          <Grid container spacing={2}>
            {/* Base / Gross */}
            <Grid item xs={6}>
              <Typography><strong>Base Salary:</strong> ₹{payroll?.baseSalary}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Gross Salary:</strong> ₹{payroll?.grossSalary}</Typography>
            </Grid>

            {/* Allowances */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="text-gray-600">Allowances</Typography>
              {payroll?.allowances?.map((a, i) => (
                <Typography key={i}>+ {a.type}: ₹{a.amount}</Typography>
              ))}
            </Grid>

            {/* Bonuses */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="text-gray-600">Bonuses</Typography>
              {payroll.bonuses?.length > 0 ? (
                payroll.bonuses.map((b, i) => (
                  <Typography key={i}>+ {b.type}: ₹{b.amount}</Typography>
                ))
              ) : (
                <Typography className="text-sm text-gray-500">None</Typography>
              )}
            </Grid>

            {/* Overtime */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="text-gray-600">Overtime</Typography>
              {payroll.overtime?.hours > 0 ? (
                <Typography>
                  {payroll.overtime.hours} hrs × ₹{payroll.overtime.ratePerHour} = ₹{payroll.overtime.amount}
                </Typography>
              ) : (
                <Typography className="text-sm text-gray-500">None</Typography>
              )}
            </Grid>

            {/* Deductions */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="text-gray-600">Deductions</Typography>
              {payroll.deductions?.length > 0 ? (
                payroll.deductions.map((d, i) => (
                  <Typography key={i}>- {d.type}: ₹{d.amount}</Typography>
                ))
              ) : (
                <Typography className="text-sm text-gray-500">None</Typography>
              )}
            </Grid>

            {/* Other Deductions */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="text-gray-600">Other Deductions</Typography>
              {payroll.otherDeductions?.length > 0 ? (
                payroll.otherDeductions.map((d, i) => (
                  <Typography key={i}>- {d.reason}: ₹{d.amount}</Typography>
                ))
              ) : (
                <Typography className="text-sm text-gray-500">None</Typography>
              )}
            </Grid>

            {/* Attendance */}
            <Grid item xs={4}><Typography>Leave Days: {payroll.leaveDays}</Typography></Grid>
            <Grid item xs={4}><Typography>Absent Days: {payroll.absentDays}</Typography></Grid>
            <Grid item xs={4}><Typography>Paid Days: {payroll.paidDays}</Typography></Grid>

            {/* Totals */}
            <Grid item xs={12}>
              <Divider className="my-3" />
              <Typography><strong>Total Deductions:</strong> ₹{payroll.totalDeductions}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" className="text-green-700 font-bold">
                Net Salary: ₹{payroll.netSalary}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions className="flex justify-end p-4">
          <Button variant="contained" color="primary">Generate Payslip</Button>
        </CardActions>
      </Card>
    </div>
  );
}
