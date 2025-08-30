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

export default function PayrollPage() {
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        const res = await axios.post("/api/payroll/process", {
          employeeId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        });
        setPayroll(res.data.payroll);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [employeeId]);

//   if (loading) return <p className="p-4 text-gray-500">Calculating payroll...</p>;
//   if (error) return <p className="p-4 text-red-500">{error}</p>;
//   if (!payroll) return <p className="p-4 text-gray-500">No payroll data found</p>;

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
              <Typography variant="body1">
                <strong>Base Salary:</strong> ₹{payroll.baseSalary}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Gross Salary:</strong> ₹{payroll.grossSalary}
              </Typography>
            </Grid>

            {/* Allowances */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="text-gray-600">Allowances</Typography>
              {payroll.allowances.map((a, i) => (
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
              {payroll.deductions.length > 0 ? (
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
