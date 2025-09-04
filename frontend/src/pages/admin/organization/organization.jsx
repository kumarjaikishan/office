import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Typography, MenuItem,
    Grid, FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText,
    Avatar
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modalbox from '../../../components/custommodal/Modalbox';
import Addbranch from './addbranch';
import { useDispatch, useSelector } from 'react-redux';
import { addCompany } from './helper';
import { MdExpandLess, MdExpandMore, MdOutlineModeEdit } from "react-icons/md";
import Department from '../department/Department';
import { FaRegUser } from 'react-icons/fa';
import { AiFillAmazonCircle, AiOutlineDelete } from "react-icons/ai";
import useImageUpload from "../../../utils/imageresizer";
import SuperAdminDashboard from './admin';
import { FirstFetch } from '../../../../store/userSlice';
import DataTable from 'react-data-table-component';
import { useCustomStyles } from '../attandence/attandencehelper';

const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
];


export default function OrganizationSettings() {
    const [openSection, setOpenSection] = useState(null);
    const [editbranch, seteditbranch] = useState(false);
    const [openviewmodal, setopenviewmodal] = useState(false);
    const [isload, setisload] = useState(false);
    const { handleImage } = useImageUpload();
    const [editbranchdata, seteditbranchdata] = useState(null);
    const [companyinp, setcompany] = useState({
        name: '',
        address: '',
        contact: '',
        officeTime: { in: '10:00', out: '18:00', breakMinutes: 30 },
        gracePeriod: { lateEntryMinutes: 10, earlyExitMinutes: 10 },
        workingMinutes: {
            fullDay: 480,
            halfDay: 240,
            shortDayThreshold: 360,
            overtimeAfterMinutes: 490
        },
        weeklyOffs: [0],
        attendanceRules: {
            considerEarlyEntryBefore: '09:50',
            considerLateEntryAfter: '10:10',
            considerEarlyExitBefore: '17:50',
            considerLateExitAfter: '18:15'
        }
    })

    const dispatch = useDispatch();
    const { employee, company, branch, profile } = useSelector((state) => state.user);

    const toggleSection = (section) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    useEffect(() => {
        // console.log(branch)
        if (company) {
            setcompany(company)
        }
    }, [company]);

    const handleChange = (section, field, value) => {
        setcompany(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        // return console.log(companyinp)
        try {
            setisload(true);
            const token = localStorage.getItem('emstoken');
            const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}updateCompany`,
                { ...companyinp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            dispatch(FirstFetch());
            toast.success(res.data.message, { autoClose: 1800 });
        } catch (error) {
            console.log(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 2700 });
            } else if (error.request) {
                console.error('No response from server:', error.request);
            } else {
                console.error('Error:', error.message);
            }
        } finally {
            setisload(false);
        }
    };
    const setemployee = () => {

    }
    const handleEditBranch = (id) => {
        // console.log(id)
        seteditbranch(true);
        const dffg = { ...id, managerIds: id?.managerIds?.map((id) => id._id) };
        seteditbranchdata(dffg);
        setopenviewmodal(true);
    }
    const styles = useCustomStyles();

    return (
        <div className="w-full mx-auto mt-1 p-1 py-2 md:p-6 bg-white rounded-xl shadow-md space-y-3 md:space-y-6">
            {/* Company Info */}
            {profile?.role == 'superadmin' &&
                <div className=' shadow-lg border bg-blue-50 border-dashed border-blue-400 rounded-md'>
                    <div
                        className="flex justify-between items-center cursor-pointer  bg-blue-200 px-4 py-2 rounded-md"
                        onClick={() => toggleSection('company')}
                    >
                        <span className="font-semibold text-[16px] md:text-lg text-left">Company Info</span>
                        {openSection === 'company' ? (
                            <MdExpandLess className="text-xl" />
                        ) : (
                            <MdExpandMore className="text-xl" />
                        )}
                    </div>

                    <div
                        className={`
                          rounded overflow-hidden transition-all duration-300 
                          ${openSection === 'company' ? 'max-h-fit p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                    >
                        <div className="p-4 rounded flex flex-col md:flex-row items-center  mt-2 space-y-4">
                            <div className="relative flex items-center mx-auto">
                                <div className="relative w-30 h-30 mx-auto">
                                    {companyinp?.logo ? (
                                        <img
                                            src={companyinp.logo}
                                            alt="Company Logo"
                                            className="w-full h-full object-fill rounded-full border-2 border-dashed border-blue-300"
                                        />
                                    ) : (
                                        <AiFillAmazonCircle className="w-full h-full text-blue-400 rounded-full border-2 border-dashed border-blue-300" />
                                    )}
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const optimisedLogo = await handleImage(200, file);
                                            const formData = new FormData();
                                            formData.append('_id', companyinp._id);
                                            formData.append('logo', optimisedLogo);

                                            try {
                                                console.log('api calling')
                                                setisload(true);
                                                const token = localStorage.getItem('emstoken');
                                                const res = await axios.post(
                                                    `${import.meta.env.VITE_API_ADDRESS}updateCompany`, // replace with your actual upload route
                                                    formData,
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                            'Content-Type': 'multipart/form-data'
                                                        }
                                                    }
                                                );

                                                const uploadedUrl = res.data.logoUrl; // assumes backend returns { logoUrl: '...' }

                                                setcompany((prev) => ({ ...prev, logo: uploadedUrl }));
                                                toast.success("Logo uploaded successfully!");
                                            } catch (error) {
                                                console.error(error);
                                                toast.error("Failed to upload logo.");
                                            } finally {
                                                setisload(false);
                                            }
                                        }}
                                        className="hidden"
                                    />

                                    <label
                                        htmlFor="logo-upload"
                                        className="absolute w-8 h-8 text-center bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 cursor-pointer shadow-md"
                                    >
                                        ✎
                                    </label>
                                </div>
                            </div>

                            <div className="w-full md:w-[70%] flex flex-col gap-3">
                                <div className='flex flex-wrap gap-2'>
                                    <div className='w-full md:flex-1'>
                                        <label className="block">Company Name</label>
                                        <input
                                            type="text"
                                            onChange={(e) => setcompany({ ...companyinp, name: e.target.value })}
                                            value={companyinp?.name}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                    </div>

                                    <div className='w-full md:flex-1'>
                                        <label className="block">Contact</label>
                                        <input
                                            type="text"
                                            onChange={(e) => setcompany({ ...companyinp, contact: e.target.value })}
                                            value={companyinp?.contact}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div >
                                    <label className="block">Address</label>
                                    <input
                                        type="text"
                                        onChange={(e) => setcompany({ ...companyinp, address: e.target.value })}
                                        value={companyinp?.address}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>

                                {company ? (
                                    <Button variant="contained" loading={isload} onClick={handleSubmit}>
                                        Save Changes
                                    </Button>
                                ) : (

                                    <Button loading={isload} variant="contained" onClick={() => addCompany({ companyinp, setisload })}>
                                        + Create Company
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            }

            {(profile?.role == 'superadmin' || profile?.role == 'admin') &&
                <div className='border shadow-lg bg-green-50 border-dashed border-green-400 rounded-md'>
                    <div
                        className="flex justify-between items-center cursor-pointer bg-green-200 px-4 py-2 rounded-md"
                        onClick={() => toggleSection('branches')}
                    >
                        <span className="font-semibold text-[16px] md:text-lg text-left">Branches</span>
                        {openSection === 'branches' ? (
                            <MdExpandLess className="text-xl" />
                        ) : (
                            <MdExpandMore className="text-xl" />
                        )}
                    </div>

                    <div
                        className={`
                          rounded space-y-1 overflow-hidden transition-all duration-300
                          ${openSection === 'branches' ? 'max-h-fit p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                    >
                        <div className="flex justify-end items-center">
                            <Button
                                variant="contained"
                                onClick={() => setopenviewmodal(true)}
                            >
                                + Add Branch
                            </Button>
                        </div>

                        <DataTable
                            customStyles={styles}
                            columns={[
                                {
                                    name: "Name",
                                    selector: row => row.name,
                                    sortable: true
                                },
                                {
                                    name: "Location",
                                    selector: row => row.location,
                                    sortable: true
                                },
                                {
                                    name: "Manager(s)",
                                    cell: row => (
                                        <div className="flex flex-col gap-2">
                                            {row?.managerIds?.map((manager, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                    onClick={() => setemployee(manager.userid)}
                                                >
                                                    <Avatar src={manager?.profileImage} alt={manager.name}>
                                                        {!manager?.profileImage && <FaRegUser />}
                                                    </Avatar>
                                                    <span>{manager.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                },
                                {
                                    name: "Actions",
                                    width: "120px",
                                    cell: row => (
                                        <div className="action flex gap-2.5">
                                            <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => handleEditBranch(row)}><MdOutlineModeEdit /></span>
                                            <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => handleEditBranch(row)}><AiOutlineDelete /></span>
                                        </div>
                                    )
                                },
                            ]}
                            data={branch || []}
                            pagination
                            highlightOnHover
                            noDataComponent="No branches found"
                        />
                    </div>

                </div>
            }


            <div className='border shadow-lg bg-teal-50 border-dashed border-teal-400 rounded-md'>
                <div
                    className="flex justify-between items-center cursor-pointer bg-teal-200 px-4 py-2 rounded-md"
                    onClick={() => toggleSection('department')}
                >
                    <span className="font-semibold text-[16px] md:text-lg text-left">Department</span>
                    {openSection === 'department' ? (
                        <MdExpandLess className="text-xl" />
                    ) : (
                        <MdExpandMore className="text-xl" />
                    )}
                </div>

                <div
                    className={`
                          rounded overflow-hidden transition-all duration-300
                          ${openSection === 'department' ? 'max-h-fit p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                >
                    <Department />
                </div>

            </div>

            {profile?.role == 'superadmin' &&
                <div className='border shadow-lg bg-slate-50 border-dashed border-slate-400 rounded-md'>
                    <div
                        className="flex justify-between items-center cursor-pointer bg-slate-200 px-4 py-2 rounded-md"
                        onClick={() => toggleSection('admin')}
                    >
                        <span className="font-semibold text-[16px] md:text-lg text-left">Admin/Manager</span>
                        {openSection === 'admin' ? (
                            <MdExpandLess className="text-xl" />
                        ) : (
                            <MdExpandMore className="text-xl" />
                        )}
                    </div>

                    <div
                        className={`
                          rounded overflow-hidden transition-all duration-300 
                          ${openSection === 'admin' ? 'max-h-fit p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                    >
                        <SuperAdminDashboard />
                    </div>

                </div>
            }

            <div className='border shadow-lg bg-yellow-50 border-dashed border-yellow-400 rounded-md'>
                <div
                    className="flex justify-between items-center cursor-pointer bg-yellow-200 px-4 py-2 rounded-md"
                    onClick={() => toggleSection('attendance')}
                >
                    <span className="font-semibold text-[16px] md:text-lg text-left"> Attendance Rules</span>
                    {openSection === 'attendance' ? (
                        <MdExpandLess className="text-xl" />
                    ) : (
                        <MdExpandMore className="text-xl" />
                    )}
                </div>

                <div
                    className={`
                          rounded overflow-hidden transition-all duration-300 
                          ${openSection === 'attendance' ? 'max-h-fit p-2 my-2' : 'max-h-0 p-0 my-0'}
                        `}
                >
                    <Box className="mt-1 p-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                        <TextField
                            label="Office Time In"
                            fullWidth
                            type="time"
                            value={companyinp.officeTime.in}
                            onChange={e => handleChange('officeTime', 'in', e.target.value)}
                            helperText="Time when office hours begin"
                        />

                        <TextField
                            label="Office Time Out"
                            fullWidth
                            type="time"
                            value={companyinp.officeTime.out}
                            onChange={e => handleChange('officeTime', 'out', e.target.value)}
                            helperText="Time when office hours end"
                        />

                        <TextField
                            label="Break Minutes"
                            fullWidth
                            type="number"
                            value={companyinp.officeTime.breakMinutes}
                            onChange={e => handleChange('officeTime', 'breakMinutes', Number(e.target.value))}
                            helperText="Total break time allowed during the day"
                        />

                        {/* <TextField
                                label="Late Entry Grace (min)"
                                fullWidth
                                type="number"
                                value={companyinp.gracePeriod.lateEntryMinutes}
                                onChange={e => handleChange('gracePeriod', 'lateEntryMinutes', Number(e.target.value))}
                                helperText="Allowed delay after office start time"
                            />

                            <TextField
                                label="Early Exit Grace (min)"
                                fullWidth
                                type="number"
                                value={companyinp.gracePeriod.earlyExitMinutes}
                                onChange={e => handleChange('gracePeriod', 'earlyExitMinutes', Number(e.target.value))}
                                helperText="Allowed early leave before office end time"
                            /> */}

                        <TextField
                            label="Full Day Minutes"
                            fullWidth
                            type="number"
                            value={companyinp.workingMinutes.fullDay}
                            onChange={e => handleChange('workingMinutes', 'fullDay', Number(e.target.value))}
                            helperText="Total working minutes required for a full day"
                        />

                        <TextField
                            label="Half Day Minutes"
                            fullWidth
                            type="number"
                            value={companyinp.workingMinutes.halfDay}
                            onChange={e => handleChange('workingMinutes', 'halfDay', Number(e.target.value))}
                            helperText="Minimum minutes required for marking a half-day"
                        />

                        <TextField
                            label="Short Day Threshold (min)"
                            fullWidth
                            type="number"
                            value={companyinp.workingMinutes.shortDayThreshold}
                            onChange={e => handleChange('workingMinutes', 'shortDayThreshold', Number(e.target.value))}
                            helperText="Below this time is considered a short day"
                        />

                        <TextField
                            label="Overtime After Minutes"
                            fullWidth
                            type="number"
                            value={companyinp.workingMinutes.overtimeAfterMinutes}
                            onChange={e => handleChange('workingMinutes', 'overtimeAfterMinutes', Number(e.target.value))}
                            helperText="Time after which overtime calculation begins"
                        />

                        <FormControl fullWidth>
                            <InputLabel>Weekly Offs</InputLabel>
                            <Select
                                multiple
                                value={companyinp.weeklyOffs}
                                onChange={e => setcompany({ ...companyinp, weeklyOffs: e.target.value })}
                                input={<OutlinedInput label="Weekly Offs" />}
                                renderValue={(selected) =>
                                    selected.map(v => weekdays.find(w => w.value === v)?.label).join(', ')
                                }
                            >
                                {weekdays.map(day => (
                                    <MenuItem key={day.value} value={day.value}>
                                        <Checkbox checked={companyinp.weeklyOffs.includes(day.value)} />
                                        <ListItemText primary={day.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {Object.entries(companyinp.attendanceRules).map(([key, value]) => {
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                            const helperMap = {
                                considerEarlyEntryBefore: 'Considered early if punched before this time',
                                considerLateEntryAfter: 'Considered late if punched after this time',
                                considerEarlyExitBefore: 'Considered early exit if leaving before this time',
                                considerLateExitAfter: 'Considered late exit if leaving after this time',
                            };

                            return (
                                <TextField
                                    key={key}
                                    fullWidth
                                    label={label}
                                    type="time"
                                    value={value}
                                    onChange={e => handleChange('attendanceRules', key, e.target.value)}
                                    helperText={helperMap[key]}
                                />
                            );
                        })}
                    </Box>

                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Button variant="contained" onClick={handleSubmit}>
                            Update Settings
                        </Button>
                    </Box>
                </div>

            </div>

            <Modalbox open={openviewmodal} onClose={() => {
                setopenviewmodal(false);
                seteditbranchdata(null);
                seteditbranch(false)
            }}>
                <div className="membermodal" >
                    <Addbranch setopenviewmodal={setopenviewmodal} editbranchdata={editbranchdata} editbranch={editbranch} company={company} employee={employee} />
                </div>
            </Modalbox>
        </div>
    );
}
