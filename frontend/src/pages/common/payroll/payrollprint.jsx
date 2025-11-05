import { Divider } from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import numberToWords from "../../../utils/numToWord";
import { FaCalendarAlt, FaCalendarWeek, FaUmbrellaBeach, FaBriefcase, FaUserCheck, FaUserTimes, FaUserClock } from "react-icons/fa";
import { cloudinaryUrl } from "../../../utils/imageurlsetter";


export default function PayslipPrintPage() {
  const printRef = useRef(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);
  const { company } = useSelector(e => e.user);

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
    // console.log(company)
  }, []);

  function formatRupee(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

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

        // console.log(res?.data?.payroll);
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
  const defaultProfile = 'https://res.cloudinary.com/dusxlxlvm/image/upload/v1753113610/ems/assets/employee_fi3g5p.webp'

  return (
    <div className="flex  justify-center p-1  min-h-screen">
      <div className="w-full border border-dashed max-w-6xl pb-3 print:bg-transparent bg-white rounded-lg relative">
        {/* Print Button */}
        {/* <div className="absolute top-4 right-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Print
          </button>
        </div> */}

        {/* Content to print */}
        <div ref={printRef} className="p-2 md:p-6">
          {/* company */}
          <div className="borde flex justify-between mb-2">
            <img
              // src={company.logo} 
              src={cloudinaryUrl(company.logo, {
                format: "webp",
                width: 200,
                height: 200,
              })}
              alt="" className="w-15 h-15 object-fill" />
            <div className="flex-1 text-center">
              <h2 className="text-center text-2xl font-bold mb-1">{company?.fullname || 'Update Company Full Name'}</h2>
              <h2 className="text-center text-sm  mb-1 text-gray-600">{company?.address || 'Update Company Full Address'}</h2>
            </div>
          </div>
          <div className="border-t border-gray-400"></div>

          <h3 className="text-center text-lg mb-6 font-semibold text-gray-700">Salary Slip</h3>

          {/* Employee Info with Profile */}
          <div className="grid grid-cols-5 gap-4 mb-6 capitalize text-sm items-start print:grid-cols-5">
            {/* Profile Pic */}
            <div className="col-span-1 flex justify-center">
              <img
                // src={payroll?.profileimage || defaultProfile}
                src={cloudinaryUrl(payroll?.profileimage || defaultProfile , {
                  format: "webp",
                  width: 100,
                  // height: 100,
                })}
                alt="Profile"
                className="w-20 rounded  shadow print:w-18"
              />
            </div>

            {/* Employee Details */}
            <div className="col-span-4 grid grid-cols-5 gap-y-2 gap-x-8 text-xs md:text-sm print:gap-x-4">
              {/* Left column */}
              <div className="col-span-2">
                <div className="flex">
                  <dt className="w-20 md-w-25 font-medium text-gray-600 whitespace-nowrap">Name</dt>
                  <dd className="flex-1">: {payroll?.name}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 md-w-25 font-medium text-gray-600 whitespace-nowrap">Mobile</dt>
                  <dd className="flex-1">: {payroll?.phone || 'N/A'}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 md-w-25 font-medium text-gray-600 whitespace-nowrap">Department</dt>
                  <dd className="flex-1">: {payroll?.department}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 md-w-25 font-medium text-gray-600 whitespace-nowrap">Designation</dt>
                  <dd className="flex-1">: {payroll?.designation}</dd>
                </div>
              </div>

              {/* Right column */}
              <div className="col-span-3">
                {payroll?.guardian &&
                  <div className="flex">
                    <dt className="w-18 md-w-25 font-medium text-gray-600 whitespace-nowrap ">{payroll?.guardian?.relation}</dt>
                    <dd className="flex-1">
                      : {payroll?.guardian?.name}
                    </dd>
                  </div>
                }
                <div className="flex">
                  <dt className="w-18 md-w-25 font-medium text-gray-600 whitespace-nowrap">Month</dt>
                  <dd className="flex-1">
                    : {dayjs(`${payroll?.year}-${payroll?.month}-01`).format("MM-YYYY")}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-18 md-w-25 font-medium text-gray-600 whitespace-nowrap">Email</dt>
                  <dd className="flex-1">: {payroll?.email || 'N/A'}</dd>
                </div>
                <div className="flex">
                  <dt className="w-18 md-w-25 font-medium text-gray-600 whitespace-nowrap">Address</dt>
                  <dd className="flex-1">
                    : {payroll?.address || 'N/A'}
                  </dd>
                </div>
              </div>
            </div>
          </div>


          {/* Attendance Info */}
          {/* <div className="grid grid-cols-7 gap-4 my-6 text-sm">
            <div className=" rounded-lg p-1 text-center shadow-none md:shadow-sm">
              <p className="font-semibold  text-gray-700 whitespace-nowrap">Month Days</p>
              <p className="text-blue-600 font-bold text-sm md:text-lg">{payroll?.monthDays || 0}</p>
            </div>
            <div className=" rounded-lg p-1 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700 whitespace-nowrap">Weekly offs</p>
              <p className="text-blue-600 font-bold text-sm md:text-lg">{payroll?.weekOffs}</p>
            </div>
            <div className=" rounded-lg p-1 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Holidays</p>
              <p className="text-blue-600 font-bold text-sm md:text-lg">{payroll?.holidays}</p>
            </div>
            <div className=" rounded-lg p-1 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700 whitespace-nowrap">Working Day</p>
              <p className="text-blue-600 font-bold text-sm md:text-lg">{payroll?.workingDays}</p>
            </div>

            <div className=" rounded-lg p-1 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Present</p>
              <p className="text-green-600 font-bold text-sm md:text-lg">{payroll?.present}</p>
            </div>
            <div className=" rounded-lg p-1 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Absent</p>
              <p className="text-red-600 font-bold text-sm md:text-lg">{payroll?.absent}</p>
            </div>
            <div className=" rounded-lg p-1 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Leave</p>
              <p className="text-yellow-600 font-bold text-sm md:text-lg">{payroll?.leave}</p>
            </div>
          </div> */}
          <div className="grid grid-cols-7 gap-4 my-6 text-sm">
            <div className="rounded-lg p-2 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700 whitespace-nowrap">Month Days</p>
              <p className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm md:text-lg">
                <FaCalendarAlt className="text-blue-500" /> {payroll?.monthDays || 0}
              </p>
            </div>

            <div className="rounded-lg p-2 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700 whitespace-nowrap">Weekly Offs</p>
              <p className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm md:text-lg">
                <FaCalendarWeek className="text-purple-500" /> {payroll?.weekOffs}
              </p>
            </div>

            <div className="rounded-lg p-2 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Holidays</p>
              <p className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm md:text-lg">
                <FaUmbrellaBeach className="text-orange-500" /> {payroll?.holidays}
              </p>
            </div>

            <div className="rounded-lg p-2 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700 whitespace-nowrap">Working Day</p>
              <p className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm md:text-lg">
                <FaBriefcase className="text-indigo-500" /> {payroll?.workingDays}
              </p>
            </div>

            <div className="rounded-lg p-2 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Present</p>
              <p className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm md:text-lg">
                <FaUserCheck className="text-green-500" /> {payroll?.present}
              </p>
            </div>

            <div className="rounded-lg p-2 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Absent</p>
              <p className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm md:text-lg">
                <FaUserTimes className="text-red-500" /> {payroll?.absent}
              </p>
            </div>

            <div className="rounded-lg p-2 text-center shadow-none md:shadow-sm">
              <p className="font-semibold text-gray-700">Leave</p>
              <p className="flex items-center justify-center gap-2 text-yellow-600 font-bold text-sm md:text-lg">
                <FaUserClock className="text-yellow-500" /> {payroll?.leave}
              </p>
            </div>
          </div>


          {/* Salary Tables */}
          <div className="grid grid-cols-2  md:grid-cols-2 gap-2 md:gap-6">
            {/* Earnings */}
            <div className="bg-white shadow-none md:shadow-md overflow-hidden rounded-lg border border-gray-400">
              <h4 className="font-semibold px-4 py-2 print:py-1 border-b border-gray-400 bg-gray-50  text-gray-700">Earnings</h4>
              <ul className="divide-y divide-gray-200 text-xs md:text-sm">
                <li className="flex justify-between px-4 py-1">
                  <span>Basic Salary</span>
                  <span className="font-medium">{formatRupee(payroll?.baseSalary)}</span>
                </li>

                {payroll?.allowances?.map((e, i) => (
                  <li key={i} className="flex justify-between px-4 py-1">
                    <div>
                      <span>{e.name}</span>
                      {e?.extraInfo && (
                        <p className="text-gray-500 text-[10px] md:text-[12px]">{e.extraInfo}</p>
                      )}
                    </div>
                    <span className="font-medium">{formatRupee(e.amount)}</span>
                  </li>
                ))}

                {payroll?.bonuses?.map((e, i) => (
                  <li key={i} className="flex justify-between px-4 py-1">
                    <div>
                      <span>{e.name}</span>
                      {e?.extraInfo && (
                        <p className="text-gray-500 text-[10px] md:text-[12px]">{e.extraInfo}</p>
                      )}
                    </div>
                    <span className="font-medium">{formatRupee(e.amount)}</span>
                  </li>
                ))}

                <li className="flex justify-between px-4 py-2 font-bold bg-gray-50">
                  <span>Gross Salary</span>
                  <span>
                    {formatRupee(payroll?.allowances?.reduce((acc, e) => acc + e.amount, 0) +
                      payroll?.bonuses?.reduce((acc, e) => acc + e.amount, 0) +
                      payroll?.baseSalary)}
                  </span>
                </li>
              </ul>
            </div>

            {/* Deductions */}
            <div className="bg-white shadow-none md:shadow-md overflow-hidden rounded-lg border border-gray-400">
              <h4 className="font-semibold px-4  py-2 border-b border-gray-400 bg-gray-50 text-gray-700">Deductions</h4>
              <ul className="divide-y divide-gray-200 text-xs md:text-sm">
                {payroll?.deductions?.map((d, i) => (
                  <li key={i} className="flex justify-between px-4 py-1">
                    <div>
                      <span>{d.name}</span>
                      {d?.extraInfo && (
                        <p className="text-gray-500 text-[10px] md:text-[12px]">{d.extraInfo}</p>
                      )}
                    </div>
                    <span className="font-medium">{formatRupee(d.amount)}</span>
                  </li>
                ))}

                <li className="flex justify-between px-4 py-2 font-bold bg-gray-50">
                  <span>Total Deduction</span>
                  <span>
                    {formatRupee(payroll?.deductions.reduce((acc, e) => acc + e.amount, 0))}
                  </span>
                </li>
              </ul>
            </div>
          </div>


          {/* Net Salary */}
          <div className="mt-6 text-right">
            <p className="text-xl font-bold text-green-700 border-t border-b py-2">
              Net Salary: {formatRupee(Math.floor(payroll?.netSalary))}
            </p>
            <p className="text-xs capitalize"> In Words: {numberToWords(Math.floor(payroll?.netSalary))}</p>
          </div>

        </div>
        {/* Signatures */}
        <div className="mt-15 grid grid-cols-2 gap-6 text-center text-sm">
          <div>
            <div className="border-t border-dashed border-gray-500 w-3/4 mx-auto mb-1"></div>
            <p className="text-gray-600">Employee Signature</p>
          </div>
          <div>
            <div className="border-t border-dashed border-gray-500 w-3/4 mx-auto mb-1"></div>
            <p className="text-gray-600">Authorized Signature</p>
          </div>
        </div>
        <p className="px-4 text-[10px] md:text-xs mt-4">*Note: Salary information is strictly confidential. Do not disclose these details to anyone without authorization.</p>
      </div>
    </div>
  );
}
