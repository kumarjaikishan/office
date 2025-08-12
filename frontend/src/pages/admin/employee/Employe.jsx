import { columns, addemployee, employeedelette, employeefetche, employeeupdate } from "./employeehelper";
import TextField from '@mui/material/TextField';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, OutlinedInput, Typography } from '@mui/material';
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
import { BsUpload } from "react-icons/bs";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";
import { FiDownload } from "react-icons/fi";
import { TbPasswordUser } from "react-icons/tb";
import { CiFilter } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import EmployeeProfile from "./profile";
import { useSelector } from "react-redux";
import { MdOutlineModeEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { MdExpandMore } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import { FaRegUser } from "react-icons/fa";
import useImageUpload from "../../../utils/imageresizer";

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
  const { handleImage } = useImageUpload();
  const { department, branch, employee } = useSelector(e => e.user);
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
  }, [filters.branch]);
  let navigate = useNavigate();

  const init = {
    employeeId: '',
    branchId: '',
    department: "",
    employeeName: "",
    email: "",
    username: '',
    designation: '',
    password: '',
    phone: '',
    address: '',
    gender: 'male',
    bloodGroup: '',
    dob: '',
    Emergencyphone: '',
    skills: [],
    maritalStatus: true,
    salary: 0,
    achievements: [

    ],
    education: [

    ],
  };
  const [inp, setInp] = useState(init);

  useEffect(() => {
    department > 0 && setdepartmentlist(department.filter((dep) => dep.branchId._id == filters.branch))
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


  useEffect(() => {
    // console.log(departmentlist)
    // console.log(employee)
    if (employee?.length < 1) return;

    let sno = 1;
    const data = employee?.map((emp) => {
      return {
        id: emp._id,
        sno: sno++,
        rawname: emp.userid.name,
        name: (<div className="flex items-center gap-3 ">
          <Avatar src={emp.profileimage || employepic} alt={emp.employeename}>
            {!emp.profileimage && employepic}
          </Avatar>
          <Box>
            <Typography variant="body2">{emp.userid.name}</Typography>
          </Box>
        </div>),
        email: emp.userid.email,
        branch: emp.branchId,
        department: emp.department.department,
        departmentid: emp.department._id,
        action: (<div className="action flex gap-2.5">
          <span className="eye edit text-[18px] text-green-500 cursor-pointer" title="View Profile" onClick={() => { setviewEmployee(emp._id); setopenviewmodal(true) }} ><IoEyeOutline /></span>
          <span className="eye edit text-[18px] text-amber-500 cursor-pointer" title="Attandence Report" onClick={() => navigate(`/admin-dashboard/performance/${emp.userid._id}`)} ><HiOutlineDocumentReport /></span>
          <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(emp)}><MdOutlineModeEdit /></span>
          <span className="eye edit text-[18px] text-green-500 cursor-pointer" title="Reset Password" onClick={() => { setpass({ ...pass, userid: emp.userid._id }); setpassmodal(true) }} ><TbPasswordUser /> </span>
          <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(emp._id)}><AiOutlineDelete /></span>
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
    formData.append('username', inp.username);
    formData.append('email', inp.email);
    formData.append('password', inp.password);
    formData.append('designation', inp.designation);
    formData.append('salary', inp.salary);

    if (employeePhoto) {
      let resizedfile = await handleImage(600, employeePhoto);
      formData.append('photo', resizedfile);
    }

    await addemployee({ formData, setisload, setInp, setopenmodal, init, resetPhoto });
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
      let resizedfile = await handleImage(600, employeePhoto);
      formData.append('photo', resizedfile);
    }


    await employeeupdate({ formData, setisload, setEmployeePhoto, setInp, setopenmodal, init, resetPhoto });
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
      console.log('Query:', res);
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
    setisupdate(true);
    setInp({
      employeeId: employee._id,
      branchId: employee.branchId,
      department: employee.department._id,
      employeeName: employee?.userid?.name,
      email: employee?.userid?.email,
      username: employee?.userid?.name,
      dob: employee?.dob,
      salary: employee?.salary,

      password: 'employee@123',

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
        employeedelette({ employeeId: id, setisload });
      }
    });
  };

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: 'teal',
        fontWeight: 'bold',
        fontSize: '14px',
        color: 'white',
        padding: '0px 5px',
      },
    },
    rows: {
      style: {
        minHeight: '48px',
      },
    },
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



  return (
    <div className='employee p-2.5'>
      <h2 className="text-2xl mb-8 font-bold text-slate-800">Manage Employees</h2>
      <div className='flex gap-5 justify-between flex-wrap'>
        <div className="flex gap-2 md:gap-1 flex-wrap">
          <TextField
            size='small'
            sx={{ width: '160px' }}
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><IoSearch /></InputAdornment>,
            }}
            label="Search Employee"
          />

          <FormControl sx={{ width: '160px' }} size="small">
            <InputLabel>Branch</InputLabel>
            <Select
              label="Department"
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
              onChange={(e) => handleFilterChange('branch', e.target.value)}
            >
              <MenuItem selected value="all">All</MenuItem>
              {branch?.map((list) => (
                <MenuItem key={list._id} value={list._id}>{list.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: '160px' }} size="small">
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              disabled={filters.branch == 'all'}
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
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <MenuItem selected value="all">All</MenuItem>
              {departmentlist.map((list) => (
                <MenuItem key={list._id} value={list._id}>{list.department}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* <FormControl sx={{ width: '160px' }} size="small">
            <InputLabel>Status</InputLabel>
            <Select label="Status" value="">
              <MenuItem value="">Active</MenuItem>
            </Select>
          </FormControl> */}
        </div>
        <div className="flex gap-1">
          <Button variant='outlined' startIcon={<FiDownload />}>Export</Button>
          <Button variant='contained' startIcon={<GoPlus />} onClick={() => setopenmodal(true)}>Add Employee</Button>
        </div>
      </div>

      <div className="mt-2">
        <DataTable
          columns={columns}
          // data={employeelist}
          data={filteredEmployees}
          pagination
          selectableRows
          customStyles={customStyles}
          highlightOnHover
        />
      </div>

      <Modalbox open={openmodal} onClose={() => {
        setopenmodal(false); setisupdate(false); setInp(init); resetPhoto();
      }}>
        <div className="membermodal">
          <form onSubmit={adddepartcall}>
            <h2>{isupdate ? "Update Employee" : "Add Employee"}</h2>
            <span className="modalcontent ">
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
              <FormControl disabled={!inp.branchId} fullWidth required size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={inp.department}
                  label="Department"
                  onChange={(e) => handleChange(e, 'department')}
                >
                  {department?.filter(e => e.branchId._id == inp.branchId).map((list) => (
                    <MenuItem key={list._id} value={list._id}>{list.department}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ width: '100%', gap: 2 }}>
                <TextField fullWidth required value={inp.employeeName} onChange={(e) => handleChange(e, 'employeeName')} label="Name" size="small" />
                <TextField fullWidth required value={inp.email} onChange={(e) => handleChange(e, 'email')} label="email" size="small" />
              </Box>
              <Box sx={{ width: '100%', gap: 2 }}>
                <TextField fullWidth required value={inp.username} onChange={(e) => handleChange(e, 'username')} label="username" size="small" />
                <TextField fullWidth value={inp.password} onChange={(e) => handleChange(e, 'password')} label="password" size="small" />
              </Box>
              <Box sx={{ width: '100%', gap: 2 }}>
                <TextField fullWidth value={inp.designation} onChange={(e) => handleChange(e, 'designation')} label="Designation" size="small" />
              </Box>
              <Box sx={{ width: '100%', gap: 2 }}>
                <TextField fullWidth value={inp.salary} onChange={(e) => handleChange(e, 'salary')} label="salary" size="small" />
              </Box>

              {/* <div className="mt-1 gap-2 flex items-center">
                {!photoPreview && <div className="chooseFile w-[250px] h-[90px] rounded flex flex-col justify-center
                items-center gap-2 cursor-pointer border-teal-700 text-teal-700 border-2 border-dashed " onClick={() => inputref.current.click()}>
                  <input style={{ display: 'none' }} type="file" onChange={handlePhotoChange} ref={inputref} accept="image/*" name="" id="fileInput" />
                  <BsUpload className="text-2xl" />
                  Upload
                </div>}
                {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />}
               {photoPreview && <Button color="warning" onClick={resetPhoto} startIcon={<GrPowerReset />} size="small" sx={{ height: '30px' }} variant="outlined">Reset</Button>}
              </div> */}
              <div className="mt-1 gap-2 flex items-center relative">
                <input style={{ display: 'none' }} type="file" onChange={handlePhotoChange} ref={inputref} accept="image/*" name="" id="fileInput" />

                {/* { <Avatar
                    sx={{ width: 100, height: 100 }}
                    alt={inp.employeeName} src={photoPreview} />} */}
                {photoPreview ?
                  <img src={photoPreview} alt="Preview" className="mt-2 w-[100px] h-[100px] rounded-full object-cover" />
                  : <Avatar
                    sx={{ width: 100, height: 100 }}
                    alt={inp.employeeName} src="/static/images/avatar/1.jpg" />}
                <span onClick={() => inputref.current.click()}
                  className="absolute -bottom-1 -right-1 rounded-full bg-teal-900 text-white p-1"
                >
                  <MdOutlineModeEdit size={18} />
                </span>
              </div>

              {isupdate &&
                <Accordion sx={{ width: '100%' }} className="flex flex-col">
                  <AccordionSummary expandIcon={<MdExpandMore />}>
                    <Typography variant="subtitle1">Personal Details (optional)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 2,
                    }}>
                      <TextField fullWidth value={inp.phone} onChange={(e) => handleChange(e, 'phone')} label="Phone" size="small" />
                      <TextField fullWidth value={inp.Emergencyphone} onChange={(e) => handleChange(e, 'Emergencyphone')} label="Emergencyphone" size="small" />
                      <TextField fullWidth value={inp.address} onChange={(e) => handleChange(e, 'address')} label="Address" size="small" />
                      <TextField fullWidth value={inp.bloodGroup} onChange={(e) => handleChange(e, 'bloodGroup')} label="Blood Group" size="small" />
                      <TextField fullWidth value={inp.dob} type="date" onChange={(e) => handleChange(e, 'dob')} label="Date of Birth" size="small" />
                      <FormControl size="small">
                        <InputLabel>maritalStatus</InputLabel>
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
                  </AccordionDetails>
                </Accordion>
              }

              {isupdate &&
                <Accordion sx={{ width: '100%' }} className="flex flex-col">
                  <AccordionSummary expandIcon={<MdExpandMore />}>
                    <Typography variant="subtitle1">Document & Skills (optional)</Typography>
                  </AccordionSummary>

                  <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Skills and Degree */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2,
                      }}
                    >
                      {/* <TextField fullWidth value={inp.skills} onChange={(e) => {
                       let prev = inp.skills;
                       prev
                    }}
                      helperText="Use commas to separate multiple skills"
                      label="Skills" size="small" /> */}
                    </Box>

                    {/* Achievements Section */}
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

                    {/* Education Section */}
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
                  </AccordionDetails>
                </Accordion>
              }

              <div className="mt-2">
                {!isupdate ? (
                  <Button sx={{ mr: 2 }} loading={isload} loadingPosition="end" endIcon={<IoIosSend />} variant="contained" type="submit">
                    Add
                  </Button>
                ) : (
                  <Button sx={{ mr: 2 }} loading={isload} loadingPosition="end" endIcon={<IoIosSend />} variant="contained" onClick={updatee}>
                    Update
                  </Button>
                )}
                <Button size="small" onClick={() => {
                  setopenmodal(false); setisupdate(false); setInp(init); resetPhoto();
                }} variant="outlined">Cancel</Button>
              </div>
            </span>
          </form>
        </div>
      </Modalbox>

      <Modalbox open={openviewmodal} onClose={() => {
        setopenviewmodal(false);
      }}>
        <div className="membermodal" >
          <EmployeeProfile viewEmployee={viewEmployee} />
        </div>
      </Modalbox>
      
      <Modalbox open={passmodal} onClose={() => {
        setpassmodal(false);
      }}>
        <div className="membermodal" >
          <form onSubmit={updatePassword}>
            <h2>Reset Passowrd</h2>
            <span className="modalcontent ">
              <TextField fullWidth required value={pass.pass} onChange={(e) => setpass({ ...pass, pass: e.target.value })} label="Passowrd" size="small" />
              <Button variant="contained" sx={{ mr: 2 }} type="submit" >Reset Password</Button>
            </span>
          </form>
        </div>
      </Modalbox>
    </div>
  );
};

export default Employe;
