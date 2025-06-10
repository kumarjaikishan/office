import { columns, addemployee, employeedelette, employeefetche, employeeupdate } from "./employeehelper";
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { IoIosSend } from "react-icons/io";
import Modalbox from '../../components/custommodal/Modalbox';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';



const Employe = () => {

  const [openmodal, setopenmodal] = useState(false);
  const [isload, setisload] = useState(false);
  const [employeelist, setemployeelist] = useState([]);
  const [departmentlist, setdepartmentlist] = useState([]);
  const [isupdate, setisupdate] = useState(false)
  const init = {
    employeeId: '',
    employeeName: "",
    dob: "",
    salary: "",
    department: "",
    description: ''
  }
  const [inp, setInp] = useState(init);
  useEffect(() => {
    employeefetche({ setisload, setemployeelist, edite, deletee, setdepartmentlist });
  }, [])

  const handleChange = (e, name) => {
    setInp({
      ...inp, [name]: e.target.value
    })
  }

  const adddepartcall = (e) => {
     e.preventDefault();
    addemployee({ inp, setisload, setInp, setopenmodal, init })
  }


  const edite = (employee) => {
    console.log("eplyee edit", employee)
    setisupdate(true);
    setInp({
      employeeId: employee._id,
      employeeName: employee.employeename,
      dob: employee.dob,
      department: employee.department._id,
      description: employee.description
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
        employeedelette({ employeeId: id, setisload });
      } else {

      }
    });
  }
  
  const updatee = () => {
    console.log("updateee", inp)
    employeeupdate({ inp, setisload, setInp, setopenmodal, init })
  }

  return (
    <div className='department'>
      <h2>Manage Employees</h2>
      <div className='head'>
        <TextField size='small' id="outlined-basic" label="Search Department" variant="standard" />
        <Button variant='contained' onClick={() => setopenmodal(true)}>Add Employee</Button>
      </div>
      <div className="list">
        <DataTable
          columns={columns}
          data={employeelist}
          pagination
          highlightOnHover
        />
      </div>

      <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
        <div className="membermodal">
          <form onSubmit={adddepartcall}>
            <h2>Add Employee</h2>
            <span className="modalcontent">
              <TextField sx={{ width: '98%' }} required value={inp.employeeName} onChange={(e) => handleChange(e, 'employeeName')} label="Name" size="small" />
              <FormControl sx={{ width: '98%' }} required size="small">
                <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={inp.department}
                  name="Department"
                  label="Department"
                  onChange={(e) => handleChange(e, 'department')}
                >

                  {departmentlist.map((list) => {
                    return <MenuItem value={list._id}>{list.department}</MenuItem>
                  })}
                </Select>
              </FormControl>
              <TextField sx={{ width: '98%' }} required value={inp.dob} onChange={(e) => handleChange(e, 'dob')} label="D.O.B" size="small" />
              <TextField sx={{ width: '98%' }} required value={inp.salary} onChange={(e) => handleChange(e, 'salary')} label="salary" size="small" />
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

export default Employe;
