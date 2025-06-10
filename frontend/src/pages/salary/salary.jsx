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
import { employeefetche } from './salaryhelper';

const Salary = () => {
    const [isload, setisload] = useState(false);
    const [openmodal, setopenmodal] = useState(false);
    const [isupdate, setisupdate] = useState(false);
    const [departlist, setdepartlist] = useState([])

    useEffect(() => {
        firstcall();
    }, [])

    const firstcall = async () => {
        const retu = await employeefetche({ setisload, edite, deletee });
        let departmentwise = {};
        retu.map((val) => {
            const depName = val.department.department;
            if (departmentwise.hasOwnProperty(depName)) {
                departmentwise[depName].push(val);
            } else {
                departmentwise[depName] = [val];
            }
        })
        console.log("depart list wise:", departmentwise)
        setdepartlist(departmentwise);


        for (const [key, value] of Object.entries(departmentwise)) {
            console.log(`${key}`);
        }
    }
    const init = {
        employeeId: '',
        employeeName: "",
        dob: "",
        salary: "",
        department: "",
        description: ''
    }
    const [inp, setInp] = useState(init);

    const adddepartcall = () => {

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

    return (
        <div>
            <h2>Salary Management</h2>
            <div className='head'>
                <TextField size='small' id="outlined-basic" label="Search Department" variant="standard" />
                <Button variant='contained' onClick={() => setopenmodal(true)}>Add Salary</Button>
            </div>
            <div className="list">
                {/* <DataTable
                    columns={columns}
                    data={employeelist}
                    pagination
                    highlightOnHover
                /> */}
            </div>
            <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
                <div className="membermodal">
                    <form onSubmit={adddepartcall}>
                        <h2>Add Salary</h2>
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

                                    {/* {departlist.map((list) => {
                                        return <MenuItem value={list._id}>{list}</MenuItem>
                                    })} */}

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

export default Salary
