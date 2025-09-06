import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";

export default function PayslipPrintPage() {
  const printRef = useRef(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,   // ✅ v3 uses contentRef
    documentTitle: "Payroll Slip",
    removeAfterPrint: true,
  });

  // Dummy employee data
  const employee = {
    name: "John Doe",
    designation: "Software Engineer",
    department: "IT",
    month: "August 2025",
    profilePic: "https://i.pravatar.cc/100",
    earnings: [
      { head: "Basic", amount: 30000 },
      { head: "HRA", amount: 8000 },
      { head: "Transport", amount: 2000 },
      { head: "Medical Allowance", amount: 1500 },
    ],
    deductions: [
      { head: "PF Employee", amount: 2000 },
      { head: "ESI Employee", amount: 500 },
      { head: "Tax", amount: 2500 },
    ],
  };

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("emstoken");
        const res = await axios.get(
          `${import.meta.env.VITE_API_ADDRESS}payroll/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(res.data);
        setPayroll(res?.data?.payroll || employee); // fallback to dummy
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to fetch payroll");
        toast.warn("Using dummy payroll data for testing", { autoClose: 1500 });
        setPayroll(employee); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [id]);

  // Calculate totals
  const gross = employee.earnings.reduce((acc, e) => acc + e.amount, 0);
  const totalDeduction = employee.deductions.reduce((acc, d) => acc + d.amount, 0);
  const netSalary = gross - totalDeduction;

  return (
    <div className="flex justify-center p-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6 relative">
        {/* Print Button */}
        <div className="absolute top-4 right-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Print
          </button>
        </div>

        {/* Content to print */}
        <div ref={printRef} className="p-6">
          {/* Header */}
          <h2 className="text-center text-2xl font-bold mb-1">Company Name</h2>
          <h3 className="text-center text-lg mb-6 text-gray-600">Salary Slip</h3>

          {/* Employee Info with Profile */}
          <div className="grid grid-cols-4 gap-4 mb-6 text-sm items-center">
            {/* Profile Pic */}
            <div className="col-span-1 flex justify-center">
              <img
                src={employee.profilePic}
                alt="Profile"
                className="w-20 h-20 rounded-full border shadow"
              />
            </div>

            {/* Employee Details */}
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <p><strong>Employee Name:</strong> {employee.name}</p>
              <p><strong>Designation:</strong> {employee.designation}</p>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Month:</strong> {employee.month}</p>
            </div>
          </div>

          {/* Salary Tables */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Earnings</h4>
              <table className="w-full text-sm border">
                <tbody>
                  {employee.earnings.map((e, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{e.head}</td>
                      <td className="border px-2 py-1 text-right">₹{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="border px-2 py-1">Gross Salary</td>
                    <td className="border px-2 py-1 text-right">₹{gross.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Deductions</h4>
              <table className="w-full text-sm border">
                <tbody>
                  {employee.deductions.map((d, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{d.head}</td>
                      <td className="border px-2 py-1 text-right">₹{d.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="border px-2 py-1">Total Deduction</td>
                    <td className="border px-2 py-1 text-right">₹{totalDeduction.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary */}
          <div className="mt-6 text-right">
            <p className="text-lg font-bold text-green-700">
              Net Salary: ₹{netSalary.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
