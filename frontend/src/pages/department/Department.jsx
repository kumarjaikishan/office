import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import './department.css'
import { useEffect, useState } from 'react';
import { IoIosSend } from "react-icons/io";
import Modalbox from '../../components/custommodal/Modalbox';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import { adddepartment, columns, delette, fetche, update } from './departmenthelper';
import { customStyles } from '../attandence/attandencehelper';

const Department = () => {
  const [openmodal, setopenmodal] = useState(false);
  const [isload, setisload] = useState(false);
  const [departmentlist, setdepartmentlist] = useState([]);
  const [isupdate, setisupdate] = useState(false)
  const init = {
    departmentId: '',
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
    adddepartment({ inp, setisload, setInp, setopenmodal,init })
  }


  const edite = (depart) => {
    console.log("edit", depart)
    setisupdate(true);
    setInp({
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
                delette({departmentId:id,setisload});
            } else {

            }
        });
  }
  const updatee=()=>{
    console.log("updateee",inp)
    update({inp,setisload,setInp,setopenmodal,init})
  }

  return (
    <div className='department'>
      <h2>Manage Departments</h2>
      <div className='head'>
        <TextField size='small' id="outlined-basic" variant="outlined" label="Search Department" />
        <Button variant='contained' onClick={() => setopenmodal(true)}>Add Department</Button>
      </div>
      <div className="list">
        <DataTable
         customStyles={customStyles}
          columns={columns}
          data={departmentlist}
          pagination
          highlightOnHover
        />
      </div>

      <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
        <div className="membermodal">
          <form onSubmit={adddepartcall}>
            <h2>Add Department</h2>
            <span className="modalcontent">
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
                    setopenmodal(false); setisupdate(false);setInp(init)
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
