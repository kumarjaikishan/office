import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, MenuItem,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox,
  ListItemText, Grid, Avatar, FormControlLabel
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaRegUser } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { FirstFetch } from '../../../../store/userSlice';

const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const Addbranch = ({ setopenviewmodal, employee, company, editbranch, editbranchdata }) => {

  const init = {
    id: '',
    name: '',
    location: '',
    companyId: '',
    managerIds: [],
    defaultsetting: true,
    setting: {
      officeTime: { in: '10:00', out: '18:00', breakMinutes: 30 },
      gracePeriod: { lateEntryMinutes: 10, earlyExitMinutes: 10 },
      workingMinutes: { fullDay: 480, halfDay: 240, shortDayThreshold: 360, overtimeAfterMinutes: 540 },
      weeklyOffs: [0],
      attendanceRules: {
        considerEarlyEntryBefore: '09:50',
        considerLateEntryAfter: '10:10',
        considerEarlyExitBefore: '17:50',
        considerLateExitAfter: '18:15'
      }
    }
  }
  const [branch, setBranch] = useState(init);
  const dispatch = useDispatch();

  const { adminManager } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('emstoken');

  // Fetch companies and users
  useEffect(() => {
    // console.log(editbranchdata)
    setUsers(employee)
    setBranch(prev => ({ ...prev, companyId: company._id }))
    // if (editbranch) setBranch(editbranchdata)
    if (editbranch) setBranch(prev => ({ ...prev, ...editbranchdata }))
  }, [company, editbranch]);

  useEffect(() => {
    if (adminManager.length > 0) {
      setUsers(adminManager.filter(e => e.role === 'manager'))
    }
  }, [adminManager]);

  const cancele = () => {
    setopenviewmodal(false)
    setBranch(init)
  }

  // Field handler
  const handleFieldChange = (field, value) => {
    setBranch(prev => ({ ...prev, [field]: value }));
  };

  // Nested handler (for setting fields)
  const handleSettingChange = (section, key, value) => {
    setBranch(prev => ({
      ...prev,
      setting: {
        ...prev.setting,
        [section]: { ...prev.setting[section], [key]: value }
      }
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    // return console.log(branch)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}addBranch`, branch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      setopenviewmodal(false)
      dispatch(FirstFetch());
      cancele();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error adding branch");
    }
  };

  const edite = async () => {
    // return console.log(branch)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}editBranch`, branch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      dispatch(FirstFetch());
      setopenviewmodal(false)
      cancele();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error editing branch");
    }
  };

  return (
    <div className='whole'>
      <div className='modalhead'>{editbranch ? 'Edit Branch' : 'Add New Branch'}</div>
      <span className="modalcontent">
        <Grid container spacing={2}>
          <TextField
            label="Branch Name"
            fullWidth
            size='small'
            value={branch.name}
            onChange={e => handleFieldChange('name', e.target.value)}
            required
            helperText="Enter the official branch name"
          />

          <TextField
            label="Location"
            fullWidth
            size='small'
            value={branch.location}
            onChange={e => handleFieldChange('location', e.target.value)}
            helperText="City, State or Address"
          />

          <FormControl size='small' fullWidth>
            <InputLabel>Managers</InputLabel>
            <Select
              multiple
              value={branch.managerIds}
              onChange={e => handleFieldChange('managerIds', e.target.value)}
              input={<OutlinedInput label="Managers" />}
              renderValue={(selected) =>
                selected.map(id => users.find(user => user._id === id)?.name).join(', ')
              }
            >
              {users?.map(user => (
                <MenuItem key={user._id} value={user?._id}>
                  <Checkbox checked={branch?.managerIds?.includes(user._id)} />
                  <Avatar src={user?.profileImage} alt={user?.name}>
                    {!user.profileImage && <FaRegUser />}
                  </Avatar>
                  <ListItemText className='ml-2 capitalize' primary={user?.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Attendance Override */}
        <FormControlLabel
          control={
            <Checkbox
              checked={!branch.defaultsetting}
              onChange={e => setBranch(prev => ({ ...prev, defaultsetting: !e.target.checked }))}
            />
          }
          label="Override company default attendance settings"
          sx={{ mt: 2 }}
        />

        {!branch.defaultsetting && (
          <div className="border-yellow-300 border-2 grid grid-cols-2 gap-3 border-dashed rounded mt-3 p-3">
            <Grid container spacing={2}>
              <TextField
                label="Office Time In"
                type="time"
                fullWidth
                size='small'
                value={branch.setting.officeTime.in}
                InputLabelProps={{ shrink: true }}
                onChange={e => handleSettingChange('officeTime', 'in', e.target.value)}
                helperText="Time when office hours begin"
              />

              <TextField
                label="Office Time Out"
                type="time"
                fullWidth
                size='small'
                value={branch.setting.officeTime.out}
                InputLabelProps={{ shrink: true }}
                onChange={e => handleSettingChange('officeTime', 'out', e.target.value)}
                helperText="Time when office hours end"
              />

              <TextField
                label="Break Minutes"
                fullWidth
                type="number"
                size='small'
                value={branch.setting.officeTime.breakMinutes}
                onChange={e => handleSettingChange('officeTime', 'breakMinutes', Number(e.target.value))}
                helperText="Total break time allowed during the day"
              />

              <TextField
                label="Full Day Minutes"
                fullWidth
                type="number"
                size='small'
                value={branch.setting.workingMinutes.fullDay}
                onChange={e => handleSettingChange('workingMinutes', 'fullDay', Number(e.target.value))}
                helperText="Total working minutes required for a full day"
              />

              <TextField
                label="Half Day Minutes"
                fullWidth
                type="number"
                size='small'
                value={branch.setting.workingMinutes.halfDay}
                onChange={e => handleSettingChange('workingMinutes', 'halfDay', Number(e.target.value))}
                helperText="Minimum minutes required for marking a half-day"
              />

              <TextField
                label="Short Day Threshold (min)"
                fullWidth
                type="number"
                size='small'
                value={branch.setting.workingMinutes.shortDayThreshold}
                onChange={e => handleSettingChange('workingMinutes', 'shortDayThreshold', Number(e.target.value))}
                helperText="Below this time is considered a short day"
              />

              <TextField
                label="Overtime After Minutes"
                fullWidth
                type="number"
                size='small'
                value={branch.setting.workingMinutes.overtimeAfterMinutes}
                onChange={e => handleSettingChange('workingMinutes', 'overtimeAfterMinutes', Number(e.target.value))}
                helperText="Time after which overtime calculation begins"
              />

              <FormControl size='small' fullWidth>
                <InputLabel>Weekly Offs</InputLabel>
                <Select
                  multiple
                  value={branch.setting.weeklyOffs}
                  onChange={e =>
                    setBranch(prev => ({
                      ...prev,
                      setting: { ...prev.setting, weeklyOffs: e.target.value }
                    }))
                  }
                  input={<OutlinedInput label="Weekly Offs" />}
                  renderValue={(selected) =>
                    selected.map(v => weekdays.find(w => w.value === v)?.label).join(', ')
                  }
                >
                  {weekdays.map(day => (
                    <MenuItem key={day.value} value={day.value}>
                      <Checkbox checked={branch.setting.weeklyOffs.includes(day.value)} />
                      <ListItemText primary={day.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {Object.entries(branch.setting.attendanceRules).map(([key, value]) => {
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
                    size='small'
                    label={label}
                    type="time"
                    value={value}
                    onChange={e =>
                      setBranch(prev => ({
                        ...prev,
                        setting: {
                          ...prev.setting,
                          attendanceRules: { ...prev.setting.attendanceRules, [key]: e.target.value }
                        }
                      }))
                    }
                    helperText={helperMap[key]}
                  />
                );
              })}
            </Grid>
          </div>
        )}
      </span>
      <div className='modalfooter'>
          <Button variant="outlined" onClick={cancele}>
            Cancel
          </Button>
          {editbranch ? (
            <Button variant="contained" onClick={edite}>
              Save
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmit}>
              Add Branch
            </Button>
          )}
        </div>
    </div>
  );
};

export default Addbranch;
