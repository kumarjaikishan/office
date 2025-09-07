import React, { useEffect, useState } from "react";
import { useNavigate, useNavigation, useParams } from "react-router-dom";
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
import DataTable from "react-data-table-component";
import { useCustomStyles } from "../admin/attandence/attandencehelper";
import { BiMessageRoundedError } from "react-icons/bi";
import dayjs from "dayjs";
import { payrollColumns } from "./payrollhelper";

export default function PayrollPage() {
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);
  let navigate = useNavigate();

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('emstoken');
        const res = await axios.get(
          `${import.meta.env.VITE_API_ADDRESS}payroll`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        // console.log(res.data.payrolls)
        setPayroll(res?.data?.payrolls)

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
    fetchPayroll();
  }, []);

  const handleView = (row) => {
    // console.log("Viewing", row);
    navigate(`/dashboard/payroll/print/${row._id}`)
  };

  const handleEdit = (row) => {
    // console.log("Editing", row);
     navigate(`/dashboard/payroll/edit/${row._id}`)
  };

  const handleDelete = (row) => {
    // console.log("Deleting", row);
  };
  //   if (loading) return <p className="p-4 text-gray-500">Calculating payroll...</p>;
  //   if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!payroll) return <p className="p-4 text-gray-500">No payroll data found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button size="small"
        onClick={() => {
         navigate('/dashboard/payroll/add')
        }}
        variant="outlined"> Add Payroll</Button>
      <div>
        <DataTable
          columns={payrollColumns(handleView, handleEdit, handleDelete)}
          data={payroll}
          pagination
          // customStyles={useCustomStyles()}
          highlightOnHover
          paginationPerPage={20}
          paginationRowsPerPageOptions={[20, 50, 100, 300]}
          noDataComponent={
            <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
              <BiMessageRoundedError className="text-xl" /> No Employee records found.
            </div>
          }
        />
      </div>
    </div>
  );
}
