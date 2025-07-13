import TextField from '@mui/material/TextField';
import { Button, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import './department.css'
import { useEffect, useState } from 'react';
import { IoIosSend } from "react-icons/io";
import Modalbox from '../../components/custommodal/Modalbox';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import { adddepartment, columns, delette, fetche, update } from './departmenthelper';
import { customStyles } from '../attandence/attandencehelper';
import { CiFilter } from 'react-icons/ci';
import { useSelector } from 'react-redux';

const Department = () => {
  const [openmodal, setopenmodal] = useState(false);
  const [isload, setisload] = useState(false);
  const [departmentlist, setdepartmentlist] = useState([]);
  const [isupdate, setisupdate] = useState(false)
  const [filterattandence, setfilterattandence] = useState([]);
  const { branch } = useSelector(e => e.user)
  const [filtere, setfiltere] = useState({
    branch: 'all',
    department: " ",
  })
  const isFilterActive = (
    filtere.branch !== 'all' ||
    filtere.department.trim() !== ''
  );

  useEffect(() => {
    if (!departmentlist || departmentlist.length === 0) return;

    const filtered = departmentlist.filter(dep => {
      const matchBranch =
        filtere.branch === 'all' || dep.branchid === filtere.branch;

      const matchDepartment =
        filtere.department.trim() === '' ||
        dep.dep_name?.toLowerCase().includes(filtere.department.trim().toLowerCase());

      return matchBranch && matchDepartment;
    });

    setfilterattandence(filtered);
  }, [filtere, departmentlist]);


  const init = {
    departmentId: '',
    branchId: '',
    department: "",
    description: ''
  }
  const [inp, setInp] = useState(init);
  useEffect(() => {
    fetche({ setisload, setdepartmentlist, edite, deletee });
  }, [])

  const handleChange = (e, name) => {
    setInp({
      ...inp, [name]: e.target.value
    })
  }

  const adddepartcall = (e) => {
    e.preventDefault();
    adddepartment({ inp, setisload, setInp, setopenmodal, init })
  }


  const edite = (depart) => {
    console.log("edit", depart)
    setisupdate(true);
    setInp({
      branchId:depart.branchId._id ,
      departmentId: depart._id,
      department: depart.department,
      description: depart.description
    })
    setopenmodal(true);
  }

  const deletee = (id) => {
    console.log("delete", id);
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        delette({ departmentId: id, setisload });
      } else {

      }
    });
  }
  const updatee = () => {
    console.log("updateee", inp)
    update({ inp, setisload, setInp, setopenmodal, init })
  }

  return (
    <div className='department'>
      {/* <h2>Manage Departments</h2> */}
      <div className='head'>
        <div className='flex gap-2'>
          <FormControl  size="small">
            <InputLabel id="demo-simple-select-helper-label">Branch</InputLabel>
            <Select
              value={filtere.branch}
              onChange={(e) => setfiltere({ ...filtere, branch: e.target.value })}
              input={
                <OutlinedInput
                  startAdornment={
                    <InputAdornment position="start">
                      <CiFilter fontSize="small" />
                    </InputAdornment>
                  }
                  label="branch"
                />
              }
            // onChange={(e) => setfiltere({ ...filtere, departmente: e.target.value })}
            >
              <MenuItem selected value={'all'}>All</MenuItem>
              {branch?.map((val) => {
                return <MenuItem key={val._id} value={val._id}>{val.name}</MenuItem>
              })}
            </Select>
          </FormControl>
          <TextField size='small' id="outlined-basic"
            value={filtere.department}
            onChange={(e) => setfiltere({ ...filtere, department: e.target.value })}
            variant="outlined" label="Search Department" />
        </div>
        <Button variant='contained' onClick={() => setopenmodal(true)}>Add Department</Button>
      </div>
      <div className="list">
        <DataTable
          customStyles={customStyles}
          columns={columns}
          data={isFilterActive ? filterattandence : departmentlist}
          pagination
          highlightOnHover
        />
      </div>

      <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
        <div className="membermodal">
          <form onSubmit={adddepartcall}>
            <h2>Add Department</h2>
            <span className="modalcontent">
              <FormControl sx={{ width: '98%' }} size="small">
                <InputLabel id="demo-simple-select-helper-label">Branch</InputLabel>
                <Select
                  value={inp.branchId}
                  label="branch"
                  onChange={(e) => handleChange(e, 'branchId')}
                >
                  {branch?.map((val) => {
                    return <MenuItem key={val._id} value={val._id}>{val.name}</MenuItem>
                  })}
                </Select>
              </FormControl>
              <TextField sx={{ width: '98%' }} required value={inp.department} onChange={(e) => handleChange(e, 'department')} label="Department" size="small" />
              <TextField multiline rows={4} onChange={(e) => handleChange(e, 'description')} value={inp.description} sx={{ width: '98%' }} label="Description" size="small" />
              <div>
                {!isupdate && <Button
                  sx={{ mr: 2 }}
                  loading={isload}
                  loadingPosition="end"
                  endIcon={<IoIosSend />}
                  variant="contained"
                  type="submit"
                >
                  Add
                </Button>}

                {isupdate && <Button
                  sx={{ mr: 2 }}
                  loading={isload}
                  loadingPosition="end"
                  endIcon={<IoIosSend />}
                  variant="contained"
                  onClick={updatee}
                >
                  Update
                </Button>}
                <Button size="small"
                  onClick={() => {
                    setopenmodal(false); setisupdate(false); setInp(init)
                  }}
                  variant="outlined"> cancel</Button>
              </div>
            </span>
          </form>
        </div>
      </Modalbox>
    </div>
  )
}

export default Department
