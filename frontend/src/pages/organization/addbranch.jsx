import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, MenuItem,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText, Grid
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const Addbranch = ({employee}) => {
  const [branch, setBranch] = useState({
    name: '',
    location: '',
    companyId: '',
    managerIds: [],
  });

  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('emstoken');

  // Fetch companies and users
  useEffect(() => {
    setUsers(employee)
    const fetchData = async () => {
      try {
        const [compRes, userRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_ADDRESS}companies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_ADDRESS}users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCompanies(compRes.data || []);
        setUsers(userRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [token]);

  // Form field handler
  const handleChange = (field, value) => {
    setBranch(prev => ({ ...prev, [field]: value }));
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}branch`, branch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Branch added successfully");
      setBranch({ name: '', location: '', companyId: '', managerIds: [] });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error adding branch");
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h5" gutterBottom>Add New Branch</Typography>
      <Grid container spacing={2}>
        
          <TextField
            label="Branch Name"
            fullWidth
            value={branch.name}
            onChange={e => handleChange('name', e.target.value)}
            required
            helperText="Enter the official branch name"
          />
      
          <TextField
            label="Location"
            fullWidth
            value={branch.location}
            onChange={e => handleChange('location', e.target.value)}
            helperText="City, State or Address"
          />
      
        {/* <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Company</InputLabel>
            <Select
              value={branch.companyId}
              onChange={e => handleChange('companyId', e.target.value)}
              input={<OutlinedInput label="Company" />}
            >
              {companies.map(comp => (
                <MenuItem key={comp._id} value={comp._id}>{comp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid> */}
      
          <FormControl fullWidth>
            <InputLabel>Managers</InputLabel>
            <Select
              multiple
              value={branch.managerIds}
              onChange={e => handleChange('managerIds', e.target.value)}
              input={<OutlinedInput label="Managers" />}
              renderValue={(selected) =>
                selected.map(id => users.find(user => user._id === id)?.employeename).join(', ')
              }
            >
              {users.map(user => (
                <MenuItem key={user._id} value={user._id}>
                  <Checkbox checked={branch.managerIds.includes(user._id)} />
                  <ListItemText primary={user.employeename} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
      </Grid>

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button variant="contained" onClick={handleSubmit}>
          Add Branch
        </Button>
      </Box>
    </Box>
  );
};

export default Addbranch;
