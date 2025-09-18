import { columns, addemployee, employeedelette, employeeupdate } from "./employeehelper";
import TextField from '@mui/material/TextField';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, Checkbox, FormControlLabel, Grid, IconButton, OutlinedInput, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { IoIosSend } from "react-icons/io";
import Modalbox from '../../../components/custommodal/Modalbox';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { IoEyeOutline, IoSearch } from "react-icons/io5";
import InputAdornment from '@mui/material/InputAdornment';
import { GoPlus } from "react-icons/go";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiDownload } from "react-icons/fi";
import { TbPasswordUser } from "react-icons/tb";
import { CiFilter } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import EmployeeProfile from "./profile";
import { useDispatch, useSelector } from "react-redux";
import { MdClear, MdCurrencyRupee, MdExpandLess, MdOutlineModeEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { MdExpandMore } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import useImageUpload from "../../../utils/imageresizer";
import CheckPermission from "../../../utils/CheckPermission";
import { useCustomStyles } from "../attandence/attandencehelper";
import { BiMessageRoundedError } from "react-icons/bi";
import { cloudinaryUrl } from "../../../utils/imageurlsetter";

const Employe = () => {
  const [openmodal, setopenmodal] = useState(false);
  const [isload, setisload] = useState(false);
  const [employeelist, setemployeelist] = useState([]);
  const [departmentlist, setdepartmentlist] = useState([]);
  const [openviewmodal, setopenviewmodal] = useState(false);
  const [passmodal, setpassmodal] = useState(false);
  const [isupdate, setisupdate] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [employeePhoto, setEmployeePhoto] = useState(null);
  const [viewEmployee, setviewEmployee] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const { handleImage } = useImageUpload();
  const dispatch = useDispatch();
  const { department, branch, employee, profile } = useSelector(e => e.user);
  const [pass, setpass] = useState({
    userid: '',
    pass: ''
  })
  const [filters, setFilters] = useState({
    searchText: '',
    branch: 'all',
    department: 'all'
  });

  const employepic = 'https://res.cloudinary.com/dusxlxlvm/image/upload/v1753113610/ems/assets/employee_fi3g5p.webp'

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      department: 'all'
    }));
    // console.log(profile)
  }, [filters.branch]);
  let navigate = useNavigate();

  const init = {
    employeeId: '',
    branchId: '',
    department: "",
    employeeName: "",
    empId: "",
    guardian: {
      relation: 'S/o',
      name: ''
    },
    email: "",
    designation: '',
    phone: '',
    address: '',
    gender: 'male',
    bloodGroup: '',
    status: true,
    dob: '',
    Emergencyphone: '',
    maritalStatus: true,
    salary: 0,
    acHolderName: "",
    bankName: '',
    bankbranch: '',
    acnumber: '',
    ifscCode: '',
    upi: '',
    adhaar: '',
    pan: '',
    skills: [],
    achievements: [],
    education: [],
    defaultPolicies: true,
    allowances: [], // [{ name: "HRA", mode: "percentage", value: 40 }]
    bonuses: [],
    deductions: []
  };
  const [inp, setInp] = useState(init);

  useEffect(() => {
    department.length > 0 && setdepartmentlist(department.filter((dep) => dep?.branchId?._id == filters.branch))
  }, [filters.branch]);

  const handleNestedChange = (e, type, index, field) => {
    const updated = [...inp[type]];
    updated[index][field] = e.target.value;
    setInp(prev => ({ ...prev, [type]: updated }));
  };

  const addItem = (type) => {
    const emptyItem = type === 'achievements'
      ? { title: '', description: '', date: '' }
      : { degree: '', institution: '', date: '' };

    setInp(prev => ({
      ...prev,
      [type]: [...prev[type], emptyItem],
    }));
  };

  const removeItem = (type, index) => {
    const updated = inp[type].filter((_, i) => i !== index);
    setInp(prev => ({ ...prev, [type]: updated }));
  };

  const canCreate = CheckPermission('employee', 2);
  const canEdit = CheckPermission('employee', 3);
  const canDelete = CheckPermission('employee', 4);

  useEffect(() => {
    // console.log(departmentlist)
    // console.log(employee)
    if (employee?.length < 1) return;

    const data = employee?.map((emp) => {
      return {
        id: emp._id,
        rawname: emp?.userid?.name,
        empId: emp?.empId,
        name: (<div className="flex items-center capitalize gap-3 ">
          <Avatar
            src={cloudinaryUrl(emp?.profileimage, {
              format: "webp",
              width: 100,
              height: 100,
            })}
            alt={emp.employeename}>
            {!emp.profileimage && employepic}
          </Avatar>
          <Box>
            <Typography variant="body2">{emp?.userid?.name}</Typography>
            <p className="t text-[10px] text-gray-600">({emp?.designation})</p>
          </Box>
        </div>),
        phone: emp?.phone || '-',
        // email: emp?.userid?.email || '-',
        status: emp?.status,
        branch: emp?.branchId,
        department: emp?.department?.department,
        departmentid: emp?.department?._id,
        action: (<div className="action flex gap-2.5">
          <span className="eye edit text-[18px] text-green-500 cursor-pointer" title="View Profile" onClick={() => { setviewEmployee(emp._id); setopenviewmodal(true) }} ><IoEyeOutline /></span>
          <span className="eye edit text-[18px] text-amber-500 cursor-pointer" title="Attandence Report" onClick={() => navigate(`/dashboard/performance/${emp.userid._id}`)} ><HiOutlineDocumentReport /></span>
          {/* <span className="eye edit text-[18px]  text-violet-500 cursor-pointer" title="Payroll" onClick={() => navigate(`/dashboard/viewpayroll/${emp.userid._id}`)} ><MdCurrencyRupee  /></span> */}
          {canEdit && <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(emp)}><MdOutlineModeEdit /></span>}
          {canEdit && <span className="eye edit text-[18px] text-green-500 cursor-pointer" title="Reset Password" onClick={() => { setpass({ ...pass, userid: emp.userid._id }); setpassmodal(true) }} ><TbPasswordUser /> </span>}
          {canDelete && <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(emp._id)}><AiOutlineDelete /></span>}
        </div>)
      }
    })
    // console.log("bffdg",data)
    setemployeelist(data);

  }, [employee])

  const handleChange = (e, name) => {
    setInp({
      ...inp, [name]: e.target.value
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setEmployeePhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const adddepartcall = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('employeeName', inp.employeeName);
    formData.append('branchId', inp.branchId);
    formData.append('department', inp.department);
    formData.append('email', inp.email);
    formData.append('designation', inp.designation);
    formData.append('salary', inp.salary);

    if (employeePhoto) {
      let resizedfile = await handleImage(350, employeePhoto);
      formData.append('photo', resizedfile);
    }

    await addemployee({ formData, dispatch, setisload, setInp, setopenmodal, init, resetPhoto });
  };

  const updatee = async () => {
    console.log(inp)
    const formData = new FormData();
    Object.keys(inp).forEach(key => {
      const value = inp[key];

      // Handle complex types
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    if (employeePhoto) {
      let resizedfile = await handleImage(350, employeePhoto);
      formData.append('photo', resizedfile);
    }

    await employeeupdate({ formData, dispatch, setisload, setEmployeePhoto, setInp, setopenmodal, init, resetPhoto });
    setPhotoPreview(null);
    setEmployeePhoto(null)
  };

  const resetPhoto = () => {
    setPhotoPreview(null);
    setEmployeePhoto(null);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    // return console.log(pass)
    try {
      const token = localStorage.getItem('emstoken');
      const res = await axios.post(
        `${import.meta.env.VITE_API_ADDRESS}updatepassword`,
        {
          pass
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setpass({
        userid: '',
        pass: ''
      })
      setpassmodal(false);
      // console.log('Query:', res);
      toast.success(res.data.message, { autoClose: 1200 });
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.warn(error.response.data.message, { autoClose: 1200 });
      } else if (error.request) {
        console.error('No response from server:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  const edite = (employee) => {
    // console.log(employee)
    // console.log(branch)
    setisupdate(true);
    setInp({
      employeeId: employee._id,
      branchId: employee?.branchId,
      department: employee?.department?._id,
      employeeName: employee?.userid?.name,
      email: employee?.userid?.email,
      dob: employee?.dob,
      salary: employee?.salary,
      status: employee?.status,

      empId: Number(employee?.empId?.split('EMP')[1]),
      guardian: employee?.guardian,

      acHolderName: employee?.acHolderName,
      bankName: employee?.bankName,
      bankbranch: employee?.bankbranch,
      acnumber: employee?.acnumber,
      ifscCode: employee?.ifscCode,
      upi: employee?.upi,
      adhaar: employee?.adhaar,
      pan: employee?.pan,

      designation: employee?.designation,
      phone: employee?.phone,
      address: employee?.address || '',
      gender: employee?.gender || 'male',
      bloodGroup: employee?.bloodGroup,
      Emergencyphone: employee?.Emergencyphone,
      skills: employee?.skills,
      maritalStatus: employee?.maritalStatus || true,
      achievements: employee?.achievements,
      education: employee?.education,
    });
    if (employee.profileimage) {
      setPhotoPreview(employee.profileimage);
    }
    setopenmodal(true);
  };

  const deletee = (id) => {
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        employeedelette({ employeeId: id, setisload, dispatch });
      }
    });
  };

  const inputref = useRef(null);

  const filteredEmployees = employeelist?.filter(emp => {
    const name = emp.rawname?.toLowerCase() || '';
    const deptId = emp.departmentid || '';
    const branchId = emp.branch || '';

    const nameMatch = filters.searchText.trim() === '' || name.includes(filters.searchText.toLowerCase());
    const deptMatch = filters.department === 'all' || deptId === filters.department;
    const branchMatch = filters.branch === 'all' || branchId === filters.branch;

    return nameMatch && deptMatch && branchMatch;
  });

  const exportCSV = () => {
    // return console.log(filteredEmployees)
    const headers = ["S.No", "Name", "Email", "Department"];
    const rows = filteredEmployees.map((e, idx) => [
      idx + 1, e.rawname, e.email, e.department
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Employee List.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className='employee p-1'>
      {/* <h2 className="text-2xl mb-8 font-bold text-slate-800">Manage Employees</h2> */}
      <div className="flex gap-5 justify-between items-center flex-wrap">
        {/* Search + Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1 w-full md:w-fit">
          {/* Search (full on small, shrink on md+) */}
          <TextField
            size="small"
            className="md:col-span-1 md:max-w-[160px] col-span-2"
            value={filters.searchText}
            onChange={(e) => handleFilterChange("searchText", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">  <IoSearch /> </InputAdornment>
              ),
              endAdornment: filters.searchText && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleFilterChange("searchText", '')}
                    edge="end"
                    size="small"
                  >
                    <MdClear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            label="Search Employee"
          />

          {/* Branch (50% on small, shrink on md+) */}
          <FormControl
            size="small"
            className=" md:max-w-[160px] col-span-1"
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
          <FormControl
            size="small"
            className=" md:max-w-[160px] col-span-1"
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
          </FormControl>
        </div>

        {/* Buttons */}
        <div className="flex gap-1 w-full md:w-fit">
          <Button
            variant="outlined"
            className="flex-1 md:w-fit md:flex-none"
            onClick={exportCSV}
            startIcon={<FiDownload />}
          >
            Export
          </Button>

          {canCreate && (
            <Button
              variant="contained"
              className="flex-[2] md:w-fit md:flex-none"
              startIcon={<GoPlus />}
              onClick={() => setopenmodal(true)}
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>


      <div className="mt-2 capitalize">
        <DataTable
          columns={columns}
          data={filteredEmployees}
          pagination
          customStyles={useCustomStyles()}
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

      <Modalbox open={openmodal} onClose={() => {
        setopenmodal(false); setisupdate(false); setInp(init); resetPhoto();
      }}>
        <div className="membermodal w-[680px]">
          <div className="whole" >
            <form onSubmit={adddepartcall}>
              <div className="modalhead">{isupdate ? "Update Employee" : "Add Employee"}</div>
              <span className="modalcontent ">
                <div className='flex flex-col gap-3 w-full'>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={inp.branchId}
                      label="branch"
                      onChange={(e) => handleChange(e, 'branchId')}
                    >
                      {branch?.map((list) => (
                        <MenuItem key={list._id} value={list._id}>{list.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <div className="flex gap-2">
                    <FormControl disabled={!inp.branchId} fullWidth required size="small">
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={inp.department}
                        label="Department"
                        onChange={(e) => handleChange(e, 'department')}
                      >
                        {department?.filter(e => e.branchId?._id === inp.branchId).length > 0 ? (
                          department
                            .filter(e => e.branchId._id === inp.branchId)
                            .map((list) => (
                              <MenuItem key={list._id} value={list._id}>
                                {list.department}
                              </MenuItem>
                            ))
                        ) : (
                          <MenuItem disabled>No departments found</MenuItem>
                        )}

                      </Select>
                    </FormControl>
                    <FormControl disabled={!inp.branchId} fullWidth required size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={inp?.status}
                        label="Status"
                        onChange={(e) => handleChange(e, 'status')}
                      >
                        <MenuItem value={true}>Active</MenuItem>
                        <MenuItem value={false}>Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div className="flex gap-2">
                    <TextField fullWidth required value={inp.employeeName} onChange={(e) => handleChange(e, 'employeeName')} label="Name" size="small" />
                    <TextField fullWidth required value={inp.email} onChange={(e) => handleChange(e, 'email')} label="Email" size="small" />
                  </div>

                  <div className="flex gap-2">
                    <TextField fullWidth value={inp.designation} onChange={(e) => handleChange(e, 'designation')} label="Designation" size="small" />
                    <TextField fullWidth value={inp.salary} onChange={(e) => handleChange(e, 'salary')} label="Salary" size="small" />
                  </div>


                  <div className="flex gap-2">
                    {/* Employee ID with EMP prefix */}
                    <TextField
                      fullWidth
                      type="number"
                      value={inp.empId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= 3) {
                          handleChange(e, "empId");
                        }
                      }}
                      label="Employee ID"
                      size="small"
                      helperText={`ID - EMP${String(inp?.empId || '').padStart(3, '0')}`}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EMP</InputAdornment>,
                      }}
                      inputProps={{
                        maxLength: 3, // still good for text inputs
                      }}
                    />

                    {/* Guardian Name with prefix dropdown */}
                    <TextField
                      fullWidth
                      value={inp?.guardian?.name}
                      onChange={(e) =>
                        setInp((prev) => ({
                          ...prev,
                          guardian: { ...prev.guardian, name: e.target.value },
                        }))
                      }
                      label="Guardian Name"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ minWidth: 45 }}>
                            <Select
                              variant="standard"
                              disableUnderline
                              value={inp?.guardian?.relation || "S/o"}
                              onChange={(e) =>
                                setInp((prev) => ({
                                  ...prev,
                                  guardian: { ...prev.guardian, relation: e.target.value },
                                }))
                              }
                            >
                              <MenuItem value="S/o">S/o</MenuItem>
                              <MenuItem value="D/o">D/o</MenuItem>
                              <MenuItem value="H/o">H/o</MenuItem>
                              <MenuItem value="W/o">W/o</MenuItem>
                            </Select>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="w-full  flex justify-center">
                    <div className="mt-1 w-fit text-center gap-2  relative">
                      <input style={{ display: 'none' }} type="file" onChange={handlePhotoChange} ref={inputref} accept="image/*" name="" id="fileInput" />
                      {photoPreview ?
                        <img src={photoPreview} alt="Preview" className="mt-2 w-[100px] h-[100px] rounded-full object-cover" />
                        : <Avatar
                          sx={{ width: 100, height: 100 }}
                          alt={inp.employeeName} src="/static/images/avatar/1.jpg" />
                      }
                      <span onClick={() => inputref.current.click()}
                        className="absolute -bottom-1 -right-1 rounded-full bg-teal-900 text-white p-1"
                      >
                        <MdOutlineModeEdit size={18} />
                      </span>

                    </div>
                  </div>
                  {isupdate &&
                    <div className='border flex flex-col w-full shadow-lg bg-slate-50 border-dashed border-slate-400 rounded-md'>
                      <div
                        className="flex justify-between items-center cursor-pointer bg-primary text-white px-4 py-2 rounded-md"
                        onClick={() => toggleSection('personal')}
                      >
                        <span className="md:font-semibold text-[12px] md:text-sm text-left">Personal Deatils (Optional)</span>
                        {openSection === 'personal' ? (
                          <MdExpandLess className="text-xl" />
                        ) : (
                          <MdExpandMore className="text-xl" />
                        )}
                      </div>

                      <div
                        className={`
                          rounded overflow-hidden transition-all duration-300 ease-linear
                          ${openSection === 'personal' ? 'max-h-[500px] p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                      >
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                        }}>
                          <TextField fullWidth value={inp.phone} inputProps={{ maxLength: 10 }} onChange={(e) => handleChange(e, 'phone')} label="Phone" size="small" />
                          <TextField fullWidth value={inp.Emergencyphone} inputProps={{ maxLength: 10 }} onChange={(e) => handleChange(e, 'Emergencyphone')} label="Emergency/ Relative Phone" size="small" />
                          <TextField fullWidth value={inp.address} onChange={(e) => handleChange(e, 'address')} label="Address" size="small" />
                          <TextField fullWidth value={inp.bloodGroup} onChange={(e) => handleChange(e, 'bloodGroup')} label="Blood Group" size="small" />
                          <TextField fullWidth inputProps={{ maxLength: 12 }} value={inp.adhaar} onChange={(e) => handleChange(e, 'adhaar')} label="Adhaar No." size="small" />
                          <TextField fullWidth inputProps={{ maxLength: 10 }} value={inp.pan} onChange={(e) => handleChange(e, 'pan')} label="Pan No." size="small" />
                          <TextField InputLabelProps={{ shrink: true }} fullWidth value={inp.dob} type="date" onChange={(e) => handleChange(e, 'dob')} label="Date of Birth" size="small" />
                          <FormControl size="small">
                            <InputLabel>Marital Status</InputLabel>
                            <Select
                              label="maritalStatus"
                              value={inp.maritalStatus}
                              onChange={(e) => handleChange(e, 'maritalStatus')}
                            >
                              <MenuItem selected value={true}>Married</MenuItem>
                              <MenuItem selected value={false}>Unmarried</MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl size="small">
                            <InputLabel>Gender</InputLabel>
                            <Select
                              label="Gender"
                              value={inp.gender}
                              onChange={(e) => handleChange(e, 'gender')}
                            >
                              <MenuItem selected value='male'>Male</MenuItem>
                              <MenuItem selected value='female'>female</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </div>

                    </div>
                  }
                  {isupdate &&
                    <div className='border flex flex-col w-full shadow-lg bg-slate-50 border-dashed border-slate-400 rounded-md'>
                      <div
                        className="flex justify-between items-center cursor-pointer bg-primary text-white px-4 py-2 rounded-md"
                        onClick={() => toggleSection('banking')}
                      >
                        <span className="md:font-semibold text-[12px] md:text-sm text-left">Banking Details (optional)</span>
                        {openSection === 'banking' ? (
                          <MdExpandLess className="text-xl" />
                        ) : (
                          <MdExpandMore className="text-xl" />
                        )}
                      </div>

                      <div
                        className={`
                          rounded overflow-hidden transition-all duration-300 ease-linear
                          ${openSection === 'banking' ? 'max-h-[500px] p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                      >
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                        }}>
                          <TextField fullWidth value={inp.acHolderName} onChange={(e) => handleChange(e, 'acHolderName')} label="A/C Holder Name" size="small" />
                          <TextField fullWidth value={inp.bankName} onChange={(e) => handleChange(e, 'bankName')} label="Bank Name" size="small" />
                          <TextField fullWidth value={inp.bankbranch} onChange={(e) => handleChange(e, 'bankbranch')} label="Branch" size="small" />
                          <TextField fullWidth value={inp.acnumber} onChange={(e) => handleChange(e, 'acnumber')} label="A/C No." size="small" />
                          <TextField fullWidth value={inp.ifscCode} onChange={(e) => handleChange(e, 'ifscCode')} label="IFSC Code" size="small" />
                          <TextField fullWidth value={inp.upi} onChange={(e) => handleChange(e, 'upi')} label="Upi Id/No." size="small" />
                        </Box>
                      </div>

                    </div>
                  }

                  {isupdate &&
                    <div className='border flex flex-col w-full shadow-lg bg-slate-50 border-dashed border-slate-400 rounded-md'>
                      <div
                        className="flex justify-between items-center cursor-pointer bg-primary text-white px-4 py-2 rounded-md"
                        onClick={() => toggleSection('document')}
                      >
                        <span className="md:font-semibold text-[12px] md:text-sm text-left">Document & Skills (optional)</span>
                        {openSection === 'document' ? (
                          <MdExpandLess className="text-xl" />
                        ) : (
                          <MdExpandMore className="text-xl" />
                        )}
                      </div>

                      <div
                        className={`
                          rounded overflow-hidden transition-all duration-300 ease-linear flex gap-6 flex-col
                          ${openSection === 'document' ? 'max-h-[500px] p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                      >
                        <div className=" flex flex-col gap-2">
                          <Typography fontWeight="bold">Achievements</Typography>
                          {inp?.achievements?.map((ach, idx) => (
                            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 2, alignItems: 'center' }}>
                              <TextField
                                label="Title"
                                size="small"
                                value={ach.title}
                                onChange={(e) => handleNestedChange(e, 'achievements', idx, 'title')}
                              />
                              <TextField
                                label="Description"
                                size="small"
                                value={ach.description}
                                onChange={(e) => handleNestedChange(e, 'achievements', idx, 'description')}
                              />
                              <TextField
                                type="date"
                                size="small"
                                label="Date"
                                InputLabelProps={{ shrink: true }}
                                value={ach.date}
                                onChange={(e) => handleNestedChange(e, 'achievements', idx, 'date')}
                              />
                              {/* <Button color="error" onClick={() => removeItem('achievements', idx)}>Remove</Button> */}
                              <MdDeleteOutline size={24} title="Delete this" onClick={() => removeItem('achievements', idx)} />
                            </Box>
                          ))}
                          <Button onClick={() => addItem('achievements')} variant="outlined">Add Achievement</Button>
                        </div>

                        <div className=" flex flex-col gap-2">
                          <Typography fontWeight="bold">Education</Typography>
                          {inp?.education?.map((edu, idx) => (
                            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 2, alignItems: 'center' }}>
                              <TextField
                                label="Degree"
                                size="small"
                                value={edu.degree}
                                onChange={(e) => handleNestedChange(e, 'education', idx, 'degree')}
                              />
                              <TextField
                                label="Institution"
                                size="small"
                                value={edu.institution}
                                onChange={(e) => handleNestedChange(e, 'education', idx, 'institution')}
                              />
                              <TextField
                                type="date"
                                size="small"
                                label="Date"
                                InputLabelProps={{ shrink: true }}
                                value={edu.date}
                                onChange={(e) => handleNestedChange(e, 'education', idx, 'date')}
                              />
                              {/* <Button color="error" onClick={() => removeItem('education', idx)}>Remove</Button> */}
                              <MdDeleteOutline size={24} title="Delete this" onClick={() => removeItem('education', idx)} />
                            </Box>
                          ))}
                          <Button onClick={() => addItem('education')} variant="outlined">Add Education</Button>
                        </div>
                      </div>

                    </div>
                  }

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inp.defaultPolicies}
                        onChange={e => setInp(prev => ({ ...prev, defaultPolicies: !inp.defaultPolicies }))}
                      />
                    }
                    label="Override Payroll Policies"
                    sx={{ mt: 2 }}
                  />

                  {isupdate && inp.defaultPolicies &&
                    <div className='border flex flex-col w-full shadow-lg bg-slate-50 border-dashed border-slate-400 rounded-md'>
                      <div
                        className="flex justify-between items-center cursor-pointer bg-primary text-white px-4 py-2 rounded-md"
                        onClick={() => toggleSection('policy')}
                      >
                        <span className="md:font-semibold text-[12px] md:text-sm text-left">Payroll Policies</span>
                        {openSection === 'policy' ? (
                          <MdExpandLess className="text-xl" />
                        ) : (
                          <MdExpandMore className="text-xl" />
                        )}
                      </div>

                      <div
                        className={`
                          rounded overflow-hidden transition-all duration-300 ease-linear flex gap-6 flex-col
                          ${openSection === 'policy' ? 'max-h-[500px] p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                      >
                        <div className="flex flex-col gap-3">
                          {['allowances', 'bonuses', 'deductions'].map((type) => {
                            // fallback to [] if not defined
                            const policies = inp?.[type] || [];

                            return (
                              <Grid item xs={12} md={4} key={type}>
                                <Typography variant="h6" className="capitalize">{type}</Typography>
                                {policies.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 mb-2">
                                    <TextField
                                      label="Name"
                                      size="small"
                                      value={item.name}
                                      onChange={(e) => {
                                        const updated = policies.map((policy, i) =>
                                          i === idx ? { ...policy, name: e.target.value } : policy
                                        );
                                        setInp({
                                          ...inp,
                                         
                                            [type]: updated
                                          
                                        });
                                      }}
                                    />
                                    <Select
                                      size="small"
                                      className="w-[120px]"
                                      value={item.type}
                                      onChange={(e) => {
                                        const updated = policies.map((policy, i) =>
                                          i === idx ? { ...policy, type: e.target.value } : policy
                                        );
                                        setInp({
                                          ...inp,
                                         
                                            [type]: updated
                                          
                                        });
                                      }}
                                    >
                                      <MenuItem value="amount">Amount</MenuItem>
                                      <MenuItem value="percentage">%</MenuItem>
                                    </Select>
                                    <TextField
                                      label={item.type === 'amount' ? '₹' : '%'}
                                      type="number"
                                      size="small"
                                      value={item.value}
                                      onChange={(e) => {
                                        const updated = policies.map((policy, i) =>
                                          i === idx ? { ...policy, value: Number(e.target.value) } : policy
                                        );
                                        setInp({
                                          ...inp,
                                        
                                            [type]: updated
                                         
                                        });
                                      }}
                                    />
                                    <AiOutlineDelete
                                      className="text-red-500 cursor-pointer text-lg"
                                      onClick={() => {
                                        const updated = policies.filter((_, i) => i !== idx);
                                        setInp({
                                          ...inp,
                                        
                                            [type]: updated
                                         
                                        });
                                      }}
                                    />
                                  </div>
                                ))}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    setInp({
                                      ...inp,
                                    
                                        [type]: [
                                          ...policies,
                                          { name: '', type: 'amount', value: 0 }
                                        ]
                                      
                                    })
                                  }
                                >
                                  + Add {type.slice(0, -1)}
                                </Button>
                              </Grid>
                            );
                          })}
                        </div>
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <Button variant="contained"
                          // onClick={handleSubmit}
                          >
                            Save Policies
                          </Button>
                        </Box>
                      </div>

                    </div>
                  }


                </div>
              </span>

              <div className="modalfooter">
                <Button size="small" onClick={() => {
                  setopenmodal(false); setisupdate(false); setInp(init); resetPhoto();
                }} variant="outlined">Cancel</Button>
                {!isupdate ? (
                  <Button sx={{ mr: 2 }} loading={isload} loadingPosition="end" endIcon={<IoIosSend />} variant="contained" type="submit" >
                    Add
                  </Button>
                ) : (
                  <Button sx={{ mr: 2 }} loading={isload} loadingPosition="end" endIcon={<IoIosSend />} variant="contained" onClick={updatee}>
                    Update
                  </Button>
                )}

              </div>
            </form>
          </div>
        </div>
      </Modalbox>

      <Modalbox open={openviewmodal} onClose={() => {
        setopenviewmodal(false);
      }}>
        <div className="membermodal w-[690px]" >
          <EmployeeProfile viewEmployee={viewEmployee} />
        </div>
      </Modalbox>

      <Modalbox open={passmodal} onClose={() => {
        setpassmodal(false);
      }}>
        <div className="membermodal w-[350px]" >
          <form onSubmit={updatePassword}>
            <h2>Reset Passowrd</h2>
            <div className="modalcontent flex  flex-col gap-3">
              <TextField fullWidth required value={pass.pass} onChange={(e) => setpass({ ...pass, pass: e.target.value })} label="Passowrd" size="small" />
              <Button variant="contained" sx={{ mt: 2 }} type="submit" >Reset Password</Button>
            </div>
          </form>
        </div>
      </Modalbox>
    </div>
  );
};

export default Employe;
