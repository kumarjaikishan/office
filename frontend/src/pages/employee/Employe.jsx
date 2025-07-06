import { columns, addemployee, employeedelette, employeefetche, employeeupdate } from "./employeehelper";
import TextField from '@mui/material/TextField';
import { Box, Button, OutlinedInput } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { IoIosSend } from "react-icons/io";
import Modalbox from '../../components/custommodal/Modalbox';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { IoSearch } from "react-icons/io5";
import InputAdornment from '@mui/material/InputAdornment';
import { GoPlus } from "react-icons/go";
import { BsUpload } from "react-icons/bs";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";
import { FiDownload } from "react-icons/fi";
import { CiFilter } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import EmployeeProfile from "../profile/profile";
import { useSelector } from "react-redux";

const Employe = () => {
  const [openmodal, setopenmodal] = useState(false);
  const [isload, setisload] = useState(false);
  const [employeelist, setemployeelist] = useState([]);
  const [departmentlist, setdepartmentlist] = useState([]);
  const [openviewmodal, setopenviewmodal] = useState(false);
  const [isupdate, setisupdate] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [employeePhoto, setEmployeePhoto] = useState(null);
  const [viewEmployee, setviewEmployee] = useState(null);
  const { department, branch } = useSelector(e => e.user)
  const [filters, setFilters] = useState({
    searchText: '',
    branch: 'all',
    department: 'all'
  });
  let navigate = useNavigate();

  const init = {
    employeeId: '',
    branchId: '',
    department: "",
    employeeName: "",
    email: "",
    username: '',
    password: '',
  };
  const [inp, setInp] = useState(init);

  useEffect(() => {
    employeefetche({ navigate, setviewEmployee, setopenviewmodal, setisload, setemployeelist, edite, deletee, setdepartmentlist });
  }, []);

  useEffect(() => {
    // console.log(departmentlist)
    // console.log(employeelist)
  }, [departmentlist,employeelist])

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
    Object.keys(inp).forEach(key => {
      formData.append(key, inp[key]);
    });
    if (employeePhoto) formData.append('photo', employeePhoto);

    await addemployee({ formData, setisload, setInp, setopenmodal, init, resetPhoto });
  };

  const updatee = async () => {
    const formData = new FormData();
    Object.keys(inp).forEach(key => {
      formData.append(key, inp[key]);
    });
    if (employeePhoto) formData.append('photo', employeePhoto);

    await employeeupdate({ formData, setisload, setInp, setopenmodal, init, resetPhoto });
  };

  const resetPhoto = () => {
    setPhotoPreview(null);
    setEmployeePhoto(null);
  };

  const edite = (employee) => {
    setisupdate(true);
    setInp({
      employeeId: employee._id,
      employeeName: employee.employeename,
      dob: employee.dob,
      salary: employee.salary,
      department: employee.department._id,
      description: employee.description
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

  const filteredEmployees = employeelist.filter(emp => {
    const name = emp.rawname?.toLowerCase() || '';
    const deptId = emp.department?._id || '';
    const branchId = emp.department?._id || '';

    const nameMatch = filters.searchText.trim() === '' || name.includes(filters.searchText.toLowerCase());
    const deptMatch = filters.department === 'all' || deptId === filters.department;
    const branchMatch = filters.department === 'all' || deptId === filters.department;

    return nameMatch && deptMatch;
  });



  return (
    <div className='employee p-2.5'>
      <h2 className="text-2xl mb-8 font-bold text-slate-800">Manage Employees</h2>
      <div className='flex justify-between'>
        <div className="flex gap-1">
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
              {branch.map((list) => (
                <MenuItem key={list._id} value={list._id}>{list.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: '160px' }} size="small">
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
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

          <FormControl sx={{ width: '160px' }} size="small">
            <InputLabel>Status</InputLabel>
            <Select label="Status" value="">
              <MenuItem value="">Active</MenuItem>
            </Select>
          </FormControl>
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
                  {branch.map((list) => (
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
                  {department.filter(e => e.branchId._id == inp.branchId).map((list) => (
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

              <div className="mt-1 gap-2 flex items-center">
                {!photoPreview && <div className="chooseFile w-[250px] h-[90px] rounded flex flex-col justify-center
                items-center gap-2 cursor-pointer border-teal-700 text-teal-700 border-2 border-dashed " onClick={() => inputref.current.click()}>
                  <input style={{ display: 'none' }} type="file" onChange={handlePhotoChange} ref={inputref} accept="image/*" name="" id="fileInput" />
                  <BsUpload className="text-2xl" />
                  Upload
                </div>}
                {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />}
                {photoPreview && <Button color="warning" onClick={resetPhoto} startIcon={<GrPowerReset />} size="small" sx={{ height: '30px' }} variant="outlined">Reset</Button>}
              </div>

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
    </div>
  );
};

export default Employe;
