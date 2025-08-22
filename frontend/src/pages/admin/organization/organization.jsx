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
import { useSelector } from 'react-redux';
import { addCompany } from './helper';
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import Department from '../department/Department';
import { FaRegUser } from 'react-icons/fa';
import { AiFillAmazonCircle } from "react-icons/ai";
import { CgLayoutGrid } from 'react-icons/cg';
import SuperAdminDashboard from './admin';

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
    const [editbranchdata, seteditbranchdata] = useState(null);
    const [companyinp, setcompany] = useState({
        name: '',
        industry: '',
        officeTime: { in: '10:00', out: '18:00', breakMinutes: 30 },
        gracePeriod: { lateEntryMinutes: 10, earlyExitMinutes: 10 },
        workingMinutes: {
            fullDay: 480,
            halfDay: 270,
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

    const { employee, company, branch, profile } = useSelector((state) => state.user);

    const toggleSection = (section) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    useEffect(() => {
        console.log(profile)
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
        console.log(id)
        seteditbranch(true);
        const dffg = { ...id, managerIds: id?.managerIds?.map((id) => id._id) };
        seteditbranchdata(dffg);
        setopenviewmodal(true);
    }

    return (
        <div className="w-full  mx-auto mt-1 p-1 md:p-6 bg-white rounded-xl shadow-md space-y-6">
            {/* Company Info */}
            {profile?.role == 'superadmin' &&
                <div>
                    <div
                        className="flex justify-between items-center cursor-pointer bg-blue-100 px-4 py-2 rounded-md"
                        onClick={() => toggleSection('company')}
                    >
                        <span className="font-semibold text-lg text-left">Company Info</span>
                        {openSection === 'company' ? (
                            <MdExpandLess className="text-xl" />
                        ) : (
                            <MdExpandMore className="text-xl" />
                        )}
                    </div>

                    {openSection === 'company' && (
                        <div className="p-4 rounded flex flex-col md:flex-row items-center border-blue-300 border-2 border-dashed mt-2 space-y-4">
                            <div className="relative flex items-center mx-auto">
                                <div className="relative w-30 h-30 mx-auto">
                                    <img
                                        src={companyinp?.logo || <AiFillAmazonCircle />}
                                        alt="Company Logo"
                                        className="w-full h-full object-fill rounded-2xl border-2 border-dashed border-blue-300"
                                    />
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('_id', companyinp._id);
                                            formData.append('logo', file);

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
                                <div>
                                    <label className="block">Company Name</label>
                                    <input
                                        type="text"
                                        onChange={(e) => setcompany({ ...companyinp, name: e.target.value })}
                                        value={companyinp.name}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block">Industry</label>
                                    <input
                                        type="text"
                                        onChange={(e) => setcompany({ ...companyinp, industry: e.target.value })}
                                        value={companyinp.industry}
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
                    )}
                </div>}

            {(profile?.role == 'superadmin' || profile?.role == 'admin') &&
            <div>
                <div
                    className="flex justify-between items-center cursor-pointer bg-green-100 px-4 py-2 rounded-md"
                    onClick={() => toggleSection('branches')}
                >
                    <span className="font-semibold text-lg text-left">Branches</span>
                    {openSection === 'branches' ? (
                        <MdExpandLess className="text-xl" />
                    ) : (
                        <MdExpandMore className="text-xl" />
                    )}
                </div>
                {openSection === 'branches' && (
                    <div className="p-1 md:p-4 rounded overflow-auto  border-green-300 border-2 border-dashed mt-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-medium">Branch List</h3>
                            <button
                                onClick={() => setopenviewmodal(true)}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                + Add Branch
                            </button>
                        </div>

                        <table className="w-full text-sm border">
                            <thead className="bg-green-200">
                                <tr>
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Location</th>
                                    <th className="p-2 border">Manager(s)</th>
                                    <th className="p-2 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branch &&
                                    branch.map((bran, ind) => {
                                        return (
                                            <tr key={ind}>
                                                <td className="p-2 border">{bran.name}</td>
                                                <td className="p-2 border">{bran.location}</td>

                                                <td className="p-2 border capitalize">
                                                    <div className="flex flex-col gap-2">
                                                        {bran?.managerIds?.map((manager, idx) => (
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
                                                </td>

                                                <td className="p-2 border">
                                                    <button
                                                        onClick={() => handleEditBranch(bran)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                                {!branch && <div>No branch Found</div>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>}

            <div>
                <div
                    className="flex justify-between items-center cursor-pointer bg-teal-100 px-4 py-2 rounded-md"
                    onClick={() => toggleSection('department')}
                >
                    <span className="font-semibold text-lg text-left">Department</span>
                    {openSection === 'department' ? (
                        <MdExpandLess className="text-xl" />
                    ) : (
                        <MdExpandMore className="text-xl" />
                    )}
                </div>
                {openSection === 'department' && (
                    <div className="p-1 rounded  border-teal-300 border-2 border-dashed mt-2 space-y-4">
                        <Department />
                    </div>
                )}
            </div>

            {profile?.role == 'superadmin' &&
            <div>
                <div
                    className="flex justify-between items-center cursor-pointer bg-teal-100 px-4 py-2 rounded-md"
                    onClick={() => toggleSection('admin')}
                >
                    <span className="font-semibold text-lg text-left">Admin</span>
                    {openSection === 'admin' ? (
                        <MdExpandLess className="text-xl" />
                    ) : (
                        <MdExpandMore className="text-xl" />
                    )}
                </div>
                {openSection === 'admin' && (
                    <div className="p-1 rounded  border-teal-300 border-2 border-dashed mt-2 ">
                        <SuperAdminDashboard />
                    </div>
                )}
            </div>}

            <div>
                <div
                    className="flex justify-between items-center cursor-pointer bg-yellow-100 px-4 py-2 rounded-md"
                    onClick={() => toggleSection('attendance')}
                >
                    <span className="font-semibold text-lg text-left"> Attendance Rules</span>
                    {openSection === 'attendance' ? (
                        <MdExpandLess className="text-xl" />
                    ) : (
                        <MdExpandMore className="text-xl" />
                    )}
                </div>
                {(openSection === 'attendance' && company) && (
                    <Box className=" border-yellow-300  border-2 border-dashed rounded mt-1 p-2 ">

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
                    </Box>
                )}
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
