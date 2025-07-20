import TextField from '@mui/material/TextField';
import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import './salary.css'
import { IoIosSend } from "react-icons/io";
import Modalbox from '../../components/custommodal/Modalbox';
import swal from 'sweetalert';
import DataTable from 'react-data-table-component';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { addsalary, columns, employeefetche, salaryfetch } from './salaryhelper';

const Salary = () => {
    const [isload, setisload] = useState(false);
    const [openmodal, setopenmodal] = useState(false);
    const [isupdate, setisupdate] = useState(false);
    const [departlist, setdepartlist] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [employeeList, setEmployeeList] = useState([]);
    const [salarylist, setsalarylist] = useState([])
    const init = {
        employeeId: '',
        basicSalary: "",
        allowance: "",
        deductions: "",
        netSalary: 0,
        payDate: '',
        description: '',
        department: ''
    }
    const [inp, setInp] = useState(init);

    useEffect(() => {
        firstcall();
        secondcall();
    }, [])

    const secondcall = async () => {
        let retu = await salaryfetch({ setisload,edite, deletee });
        console.log(retu)
        setsalarylist(retu);
    }

    const firstcall = async () => {
        const retu = await employeefetche({ setisload });

        let checking = [];
        retu.forEach((val) => {
            let existing = checking.find(few => few.departmentid === val.department._id);

            if (existing) {
                existing.employee.push({
                    id: val._id,
                    name: val.employeename
                });
            } else {
                let hey = {
                    departmentid: val.department._id,
                    departmentname: val.department.department,
                    employee: [{
                        id: val._id,
                        name: val.employeename
                    }]
                };
                checking.push(hey);
            }
        });

        // console.log("checking", checking);
        setdepartlist(checking);
    };

    useEffect(() => {
        // console.log(selectedDepartment)
        if (selectedDepartment) {
            let fin = departlist.find((jai) => jai.departmentid == selectedDepartment);
            setEmployeeList(fin.employee)
        }
    }, [selectedDepartment, departlist]);


    const adddepartcall = async (e) => {
        e.preventDefault();
        console.log(inp)
        let kya = await addsalary({ inp, setisload });
        if (kya) setopenmodal(false);
    }

    const edite = (employee) => {
        console.log("eplyee edit", employee)
        // setisupdate(true);
        // setInp({
        //     employeeId: employee._id,
        //     dob: employee.dob,
        //     department: employee.department._id,
        //     description: employee.description
        // })
        // setopenmodal(true);
    }

    const deletee = (id) => {
       return console.log("delete", id);
        
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

    const handleChange = (e, field) => {
        const value = e.target.value;
        const updatedInp = {
            ...inp,
            [field]: value
        };


        const basic = parseFloat(field === 'basicSalary' ? value : updatedInp.basicSalary) || 0;
        const allowance = parseFloat(field === 'allowance' ? value : updatedInp.allowance) || 0;
        const deductions = parseFloat(field === 'deductions' ? value : updatedInp.deductions) || 0;

        updatedInp.netSalary = (basic + allowance - deductions).toFixed(2);
        setInp(updatedInp);
    };

    return (
        <div className='salary'>
            <h2>Salary Management</h2>
            <div className='head'>
                <TextField size='small' id="outlined-basic" label="Search Department" variant="standard" />
                <Button variant='contained' onClick={() => setopenmodal(true)}>Add Salary</Button>
            </div>
            <div className="list">
                <DataTable
                    columns={columns}
                    data={salarylist}
                    pagination
                    highlightOnHover
                />
            </div>
            <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
                <div className="membermodal">
                    <form onSubmit={adddepartcall}>
                        <h2>Add Salary</h2>
                        <span className="modalcontent">
                            <FormControl sx={{ width: '98%' }} required size="small">
                                <InputLabel id="department-label">Department</InputLabel>
                                <Select
                                    labelId="department-label"
                                    id="department-select"
                                    value={inp.department}
                                    name="Department"
                                    label="Department"
                                    onChange={(e) => { handleChange(e, 'department'); setSelectedDepartment(e.target.value) }}
                                >
                                    <MenuItem disabled key='' value=''>
                                        Select Department
                                    </MenuItem>
                                    {departlist?.map((deptName) => (
                                        <MenuItem key={deptName.departmentid} value={deptName.departmentid}>
                                            {deptName.departmentname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ width: '98%' }} required size="small">
                                <InputLabel id="employee-label">Employee</InputLabel>
                                <Select
                                    labelId="employee-label"
                                    id="employee-select"
                                    value={inp.employeeId}
                                    name="Employee"
                                    label="Employee"
                                    onChange={(e) => handleChange(e, 'employeeId')}
                                >
                                    <MenuItem disabled key='' value=''>Select Employee</MenuItem>
                                    {employeeList?.map((emp) => (
                                        <MenuItem key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Stack direction="row" spacing={2} sx={{ width: '98%' }} >
                                <TextField sx={{ width: '50%' }} required value={inp.basicSalary} type='number' onChange={(e) => handleChange(e, 'basicSalary')} label="basicSalary" size="small" />
                                <TextField sx={{ width: '50%' }} required value={inp.allowance} type='number' onChange={(e) => handleChange(e, 'allowance')} label="allowance" size="small" />
                            </Stack>
                            <Stack direction="row" spacing={2} sx={{ width: '98%' }} >
                                <TextField sx={{ width: '50%' }} required value={inp.deductions} type='number' onChange={(e) => handleChange(e, 'deductions')} label="deductions" size="small" />
                                <TextField sx={{ width: '50%' }} required
                                    value={inp.netSalary}
                                    label="netSalary" size="small" />
                            </Stack>
                            <TextField sx={{ width: '98%' }} required value={inp.payDate} onChange={(e) => handleChange(e, 'payDate')} label="payDate" size="small" />
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
