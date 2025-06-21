import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Typography, MenuItem,
    Grid, FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
];

const defaultSettings = {
    companyName: 'Goodnature',
    officeTime: { in: '10:00', out: '18:00', breakMinutes: 30 },
    gracePeriod: { lateEntryMinutes: 10, earlyExitMinutes: 10 },
    workingMinutes: {
        fullDay: 540,
        halfDay: 270,
        shortDayThreshold: 360,
        overtimeAfterMinutes: 540
    },
    weeklyOffs: [0],
    attendanceRules: {
        considerEarlyEntryBefore: '10:00',
        considerLateEntryAfter: '10:40',
        considerEarlyExitBefore: '18:00',
        considerLateExitAfter: '18:30'
    }
};

const CompanySettingForm = () => {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const token = localStorage.getItem('emstoken')
        axios.get(`${import.meta.env.VITE_API_ADDRESS}getsetting`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                console.log(res.data)
                const data = res.data || {};
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    officeTime: { ...prev.officeTime, ...(data.officeTime || {}) },
                    gracePeriod: { ...prev.gracePeriod, ...(data.gracePeriod || {}) },
                    workingMinutes: { ...prev.workingMinutes, ...(data.workingMinutes || {}) },
                    attendanceRules: { ...prev.attendanceRules, ...(data.attendanceRules || {}) },
                }));
            })
            .catch(() => {
                console.warn("Failed to load settings.");
            });
    }, []);

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        //    return console.log(settings);
        try {
            const token = localStorage.getItem('emstoken')
            const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}setsetting`,
                { ...settings },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('set setting Query:', res);
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
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
            <Typography variant="h5" gutterBottom>Company Settings</Typography>

            <Grid container spacing={2}>

                <TextField fullWidth label="Company Name"
                    value={settings.companyName}
                    onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                />


                <TextField label="Office Time In" fullWidth type="time"
                    value={settings.officeTime.in}
                    onChange={e => handleChange('officeTime', 'in', e.target.value)}
                />


                <TextField label="Office Time Out" fullWidth type="time"
                    value={settings.officeTime.out}
                    onChange={e => handleChange('officeTime', 'out', e.target.value)}
                />

                <TextField label="Break Minutes" fullWidth type="number"
                    value={settings.officeTime.breakMinutes}
                    onChange={e => handleChange('officeTime', 'breakMinutes', Number(e.target.value))}
                />

                {/* Grace Period */}

                <TextField label="Late Entry Grace (min)" fullWidth type="number"
                    value={settings.gracePeriod.lateEntryMinutes}
                    onChange={e => handleChange('gracePeriod', 'lateEntryMinutes', Number(e.target.value))}
                />

                <TextField label="Early Exit Grace (min)" fullWidth type="number"
                    value={settings.gracePeriod.earlyExitMinutes}
                    onChange={e => handleChange('gracePeriod', 'earlyExitMinutes', Number(e.target.value))}
                />

                <TextField label="Full Day Minutes" fullWidth type="number"
                    value={settings.workingMinutes.fullDay}
                    onChange={e => handleChange('workingMinutes', 'fullDay', Number(e.target.value))}
                />

                <TextField label="Half Day Minutes" fullWidth type="number"
                    value={settings.workingMinutes.halfDay}
                    onChange={e => handleChange('workingMinutes', 'halfDay', Number(e.target.value))}
                />

                <TextField label="Short Day Threshold" fullWidth type="number"
                    value={settings.workingMinutes.shortDayThreshold}
                    onChange={e => handleChange('workingMinutes', 'shortDayThreshold', Number(e.target.value))}
                />

                <TextField label="Overtime After Minutes" fullWidth type="number"
                    value={settings.workingMinutes.overtimeAfterMinutes}
                    onChange={e => handleChange('workingMinutes', 'overtimeAfterMinutes', Number(e.target.value))}
                />

                <FormControl fullWidth>
                    <InputLabel>Weekly Offs</InputLabel>
                    <Select
                        multiple
                        value={settings.weeklyOffs}
                        onChange={e => setSettings({ ...settings, weeklyOffs: e.target.value })}
                        input={<OutlinedInput label="Weekly Offs" />}
                        renderValue={(selected) =>
                            selected.map(v => weekdays.find(w => w.value === v)?.label).join(', ')
                        }
                    >
                        {weekdays.map(day => (
                            <MenuItem key={day.value} value={day.value}>
                                <Checkbox checked={settings.weeklyOffs.includes(day.value)} />
                                <ListItemText primary={day.label} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>


                {/* Attendance Rules */}
                {Object.entries(settings.attendanceRules).map(([key, value]) => (

                    <TextField
                        key={key}
                        fullWidth
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        type="time"
                        value={value}
                        onChange={e => handleChange('attendanceRules', key, e.target.value)}
                    />

                ))}
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'right' }}>
                <Button variant="contained" onClick={handleSubmit}>
                    Update Settings
                </Button>
            </Box>
        </Box>
    );
};

export default CompanySettingForm;
