import TextField from '@mui/material/TextField';
import { Button, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import './department.css'
import { useEffect, useState } from 'react';
import { IoIosSend } from "react-icons/io";
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import { adddepartment, columns, delette, update } from './departmenthelper';
import { useCustomStyles } from '../attandence/attandencehelper';
import { CiFilter } from 'react-icons/ci';
import { useDispatch, useSelector } from 'react-redux';
import Modalbox from '../../../components/custommodal/Modalbox';
import { MdOutlineModeEdit } from 'react-icons/md';
import { AiOutlineDelete } from 'react-icons/ai';

const Department = () => {
  const [openmodal, setopenmodal] = useState(false);
  const [isload, setisload] = useState(false);
  const [departmentlist, setdepartmentlist] = useState([]);
  const [isupdate, setisupdate] = useState(false)
  const [filterattandence, setfilterattandence] = useState([]);
  const { branch, department } = useSelector(e => e.user)
  const [filtere, setfiltere] = useState({
    branch: 'all',
    department: " ",
  })
  const isFilterActive = (
    filtere.branch !== 'all' ||
    filtere.department.trim() !== ''
  );
  const dispatch = useDispatch();


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
    if (department.length > 0) {
      let sno = 1;
      const data = department.map((dep) => {
        return {
          id: dep._id,
          sno: sno++,
          branchid: dep?.branchId?._id,
          branch: dep?.branchId?.name,
          dep_name: dep?.department,
          action: (<div className="action">
            <span className="edit" title="Edit" onClick={() => edite(dep)}><MdOutlineModeEdit /></span>
            <span className="delete" onClick={() => deletee(dep._id)}><AiOutlineDelete /></span>
          </div>)
        }
      })
      setdepartmentlist(data);
    }
  }, [department])

  const handleChange = (e, name) => {
    setInp({
      ...inp, [name]: e.target.value
    })
  }

  const adddepartcall = (e) => {
    e.preventDefault();
    adddepartment({ inp, setisload, setInp, setopenmodal, init, dispatch })
  }


  const edite = (depart) => {
    console.log("edit", depart)
    setisupdate(true);
    setInp({
      branchId: depart.branchId._id,
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
      text: 'Once deleted, All empoyee of this department deleted',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        delette({ departmentId: id, setisload, dispatch });
      }
    });
  }
  const updatee = () => {
    // console.log("updateee", inp)
    update({ inp, setisload, setInp, setopenmodal, init, dispatch })
  }

  return (
    <div className='department pt-3'>
      <div className='head flex flex-wrap gap-1'>
        <div className='flex gap-2 w-full justify-around md:w-auto'>
          <FormControl className="w-[48%] md:w-[150px]" size="small">
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
        <Button className='w-full md:w-auto' variant='contained' onClick={() => setopenmodal(true)}>Add Department</Button>
      </div>
      <div className="list">
        <DataTable
          customStyles={useCustomStyles()}
          columns={columns}
          data={isFilterActive ? filterattandence : departmentlist}
          pagination
          highlightOnHover
        />
      </div>

      <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
        <div className="membermodal w-[650px]">
          <div className='whole'>
            <div className='modalhead'>Add Department</div>
            <form onSubmit={adddepartcall}>
              <span className="modalcontent ">
                <div className='flex flex-col gap-3 w-full'>
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
                </div>
              </span>
            </form>
            <div className='modalfooter'>
              <Button size="small"
                onClick={() => {
                  setopenmodal(false); setisupdate(false); setInp(init)
                }}
                variant="outlined"> cancel</Button>
              {!isupdate && <Button
                sx={{ mr: 2 }}
                loading={isload}
                loadingPosition="end"
                endIcon={<IoIosSend />}
                onClick={adddepartcall}
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
            </div>
          </div>
        </div>
      </Modalbox>
    </div>
  )
}

export default Department
