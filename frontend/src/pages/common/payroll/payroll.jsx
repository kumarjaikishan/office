import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Avatar,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { useCustomStyles } from "../../admin/attandence/attandencehelper";
import { BiEdit, BiMessageRoundedError, BiShow, BiTrash } from "react-icons/bi";
import dayjs from "dayjs";
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import CheckPermission from "../../../utils/CheckPermission";
import { setpayroll } from "../../../../store/userSlice";
import { cloudinaryUrl } from "../../../utils/imageurlsetter";

export default function PayrollPage() {
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const themes = useCustomStyles();
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({
    searchText: '',
    branch: 'all',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const { employee, branch, profile } = useSelector((state) => state.user);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('emstoken');
      const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}payroll`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayroll(res?.data?.payrolls || []);
      dispatch(setpayroll(res?.data?.payrolls || []));
    } catch (err) {
      console.error(err);
      toast.warn(err.response?.data?.message || "Failed to fetch payroll", { autoClose: 1200 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter employees based on search and branch
  const filteredEmployees = employee?.filter(emp => {
    const name = emp.userid?.name?.toLowerCase() || '';
    const branchId = emp.branchId || '';
    const nameMatch = filters.searchText.trim() === '' || name.includes(filters.searchText.toLowerCase());
    const branchMatch = filters.branch === 'all' || branchId === filters.branch;
    return nameMatch && branchMatch;
  });

  // Map payrolls for quick lookup
  const payrollMap = {};
  payroll?.forEach(p => {
    const key = `${p.employeeId?._id}-${p.month}-${p.year}`;
    payrollMap[key] = true;
  });

  // Action handlers
  const handleGenerate = (emp) => {
    navigate(`/dashboard/payroll/add`, {
      state: { employeee: emp, month: filters.month, year: filters.year }
    });
  };

  const handleView = (emp) => {
    const existingPayroll = payroll.find(p => p.employeeId?._id === emp._id && p.month === filters.month && p.year === filters.year);
    if (!existingPayroll) return toast.info("Payroll not generated yet for this period");
    navigate(`/dashboard/payroll/print/${existingPayroll._id}`);
  };

  const handleEdit = (emp) => {
    const existingPayroll = payroll.find(p => p.employeeId?._id === emp._id && p.month === filters.month && p.year === filters.year);
    if (!existingPayroll) return toast.info("Payroll not generated yet for this period");
    navigate(`/dashboard/payroll/edit/${existingPayroll._id}`);
  };

  const handleDelete = async (empId) => {
    const existingPayroll = payroll.find(p => p.employeeId?._id === empId && p.month === filters.month && p.year === filters.year);
    if (!existingPayroll) return toast.info("No payroll to delete for this period");

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
            `${import.meta.env.VITE_API_ADDRESS}payroll/${existingPayroll._id}`,
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

  const canGenerate = CheckPermission('salary', 2);
  const canView = CheckPermission('salary', 1);
  const canEdit = CheckPermission('salary', 3);
  const canDelete = CheckPermission('salary', 4);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (!employee) return <p className="p-4 text-gray-500">No employee data found</p>;

  const columns = [
    {
      name: "S.no",
      selector: (row, ind) => ind + 1,
      width: "60px",
    },
    {
      name: "Employee",
      selector: (row) => (
        <div className="flex items-center capitalize gap-3">
          <Avatar
            src={
              cloudinaryUrl(row?.profileimage, {
                format: "webp",
                width: 100,
                height: 100,
              })
            }
            alt={row?.userid?.name}
          >

          </Avatar>
          <Box>
            <Typography variant="body2">{row?.userid?.name}</Typography>
            <p className="text-[10px] text-gray-600">
              ({row?.designation || "-"})
            </p>
          </Box>
        </div>
      ),
      sortable: true,
    },
    { name: 'Email', selector: row => row.userid?.email, width: "180px", },
    {
      name: "Department",
      selector: (row) => row.department?.department || "-", // <-- get the string
      width: "120px",
    },
    {
      name: 'Actions',
      width: "450px",
      cell: (row) => {
        const key = `${row._id}-${filters.month}-${filters.year}`;
        const exists = payrollMap[key];
        return (
          <div className="flex gap-2">
            {canGenerate && (
              <Button
                size="small"
                variant="contained"
                startIcon={<BiShow />}
                disabled={exists}
                title={exists ? 'Already Generated' : 'Generate Payroll'}
                onClick={() => handleGenerate(row)}
              >
                Generate
              </Button>
            )}
            {/* {canView && ( */}
              <Button size="small" disabled={!exists} variant="outlined" startIcon={<BiShow />} onClick={() => handleView(row)}>View</Button>
            {/* )} */}
            {canEdit && (
              <Button size="small" disabled={!exists} variant="outlined" startIcon={<BiEdit />} onClick={() => handleEdit(row)}>Edit</Button>
            )}
            {canDelete && (
              <Button size="small" disabled={!exists} color="error" variant="outlined" startIcon={<BiTrash />} onClick={() => handleDelete(row._id)}>Delete</Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="w-full max-w-7xl  mx-auto p-1 md:p-4">
      <div className="flex my-3 items-center flex-wrap justify-between gap-2 mt-1 w-full">
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

          <FormControl size="small" className="w-[47%] md:w-[160px]">
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
              {profile?.role === 'manager'
                ? branch?.filter((e) => profile?.branchIds?.includes(e._id))
                  ?.map((list) => (
                    <MenuItem key={list._id} value={list._id}>{list.name}</MenuItem>
                  ))
                : branch?.map((list) => (
                  <MenuItem key={list._id} value={list._id}>{list.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Month</InputLabel>
            <Select
              label="Month"
              value={filters.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
            >
              {months.map((month, ind) => (
                <MenuItem key={ind} value={ind + 1}>{month}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Year</InputLabel>
            <Select
              label="Year"
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
            >
              {["2024", "2025", "2026"].map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <DataTable
        columns={columns}
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
  );
}
