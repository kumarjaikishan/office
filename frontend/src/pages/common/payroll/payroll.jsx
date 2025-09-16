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
  TextField,
  InputAdornment,
  Select,
  OutlinedInput,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { useCustomStyles } from "../../admin/attandence/attandencehelper";
import { BiMessageRoundedError } from "react-icons/bi";
import dayjs from "dayjs";
import { payrollColumns } from "./payrollhelper";
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { useSelector } from "react-redux";

export default function PayrollPage() {
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);
  let navigate = useNavigate();
  const themes = useCustomStyles()
  const [filters, setFilters] = useState({
    searchText: '',
    branch: 'all',
    department: 'all'
  });
    const {  employee, leaveBalance, branch, department } = useSelector((state) => state.user);
  

  useEffect(() => {
    fetchPayroll();
  }, []);

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

  const handleView = (row) => {
    // console.log("Viewing", row);
    navigate(`/dashboard/payroll/print/${row._id}`)
  };

  const handleEdit = (row) => {
    // console.log("Editing", row);
    navigate(`/dashboard/payroll/edit/${row._id}`)
  };
     const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

  const filteredEmployees = payroll?.filter(emp => {
    const name = emp.employeeId?.userid?.name?.toLowerCase() || '';
    const branchId = emp.branchId || '';
    // const deptId = emp.departmentid || '';

    const nameMatch = filters.searchText.trim() === '' || name.includes(filters.searchText.toLowerCase());
    const branchMatch = filters.branch === 'all' || branchId === filters.branch;
    // const deptMatch = filters.department === 'all' || deptId === filters.department;

    return nameMatch && branchMatch;
  });

  const handleDelete = async (id) => {
    swal({
      title: `Are you sure you want to Delete?`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (proceed) => {
      if (proceed) {
        try {
          setLoading(true);
          setError(null);

          const token = localStorage.getItem("emstoken");
          const res = await axios.delete(
            `${import.meta.env.VITE_API_ADDRESS}payroll/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          toast.success(res.data.message || 'Successfull deleted')
          fetchPayroll();
        } catch (error) {
          console.error(error);
          setError(error.response?.data?.message || "Failed to fetch payroll");
          toast.warn("Using dummy payroll data for testing", { autoClose: 1500 });
          setPayroll(employee); // fallback
        } finally {
          setLoading(false);
        }
      }
    });

  };

  //   if (loading) return <p className="p-4 text-gray-500">Calculating payroll...</p>;
  //   if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!payroll) return <p className="p-4 text-gray-500">No payroll data found</p>;

  return (
    <div className="w-full mx-auto p-1 md:p-4">

      <div className="flex my-3 items-center flex-wrap justify-between gap-2 mt-1 w-full">
        {/* Search (full on small, shrink on md+) */}
        <div className="flex flex-wrap gap-3 justify-between w-full md:w-fit">
          <TextField
            size="small"
            className="w-[100%] md:w-[160px]"
            value={filters.searchText}
            onChange={(e) => handleFilterChange("searchText", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoSearch />
                </InputAdornment>
              ),
            }}
            label="Search Employee"
          />

          {/* Branch (50% on small, shrink on md+) */}
          <FormControl
            size="small"
            className="w-[47%] md:w-[160px]"
          >
            <InputLabel>Branch</InputLabel>
            <Select
              label="Branch"
              value={filters.branch}
              input={
                <OutlinedInput
                  startAdornment={
                    <InputAdornment position="start">
                      <CiFilter fontSize="small" />
                    </InputAdornment>
                  }
                  label="Branch"
                />
              }
              onChange={(e) => handleFilterChange("branch", e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              {branch?.map((list) => (
                <MenuItem key={list._id} value={list._id}>
                  {list.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department (50% on small, shrink on md+) */}
          {/* <FormControl
                              size="small"
                              className="w-[47%] md:w-[160px]"
                          >
                              <InputLabel>Department</InputLabel>
                              <Select
                                  label="Department"
                                  disabled={filters.branch === "all"}
                                  value={filters.department}
                                  input={
                                      <OutlinedInput
                                          startAdornment={
                                              <InputAdornment position="start">
                                                  <CiFilter fontSize="small" />
                                              </InputAdornment>
                                          }
                                          label="Department"
                                      />
                                  }
                                  onChange={(e) =>
                                      handleFilterChange("department", e.target.value)
                                  }
                              >
                                  <MenuItem value="all">All</MenuItem>
                                  {departmentlist.length > 0 ? (
                                      departmentlist.map((list) => (
                                          <MenuItem key={list._id} value={list._id}>
                                              {list.department}
                                          </MenuItem>
                                      ))
                                  ) : (
                                      <MenuItem disabled>No departments found</MenuItem>
                                  )}
                              </Select>
                          </FormControl> */}
        </div>
        <div className="w-full md:w-fit">
          <Button size="small"
            className="w-full md:w-fit"
            onClick={() => {
              navigate('/dashboard/payroll/add')
            }}
            variant="contained"> Add Payroll

          </Button>
        </div>
      </div>
      <div>
        <DataTable
          columns={payrollColumns(handleView, handleEdit, handleDelete)}
          data={filteredEmployees}
          pagination
          customStyles={themes}
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