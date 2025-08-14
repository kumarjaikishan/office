import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, MenuItem,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText, Grid,
  Avatar
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaRegUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Addbranch = ({ setopenviewmodal, employee, company, editbranch, editbranchdata }) => {
  const [branch, setBranch] = useState({
    id: '',
    name: '',
    location: '',
    companyId: '',
    managerIds: [],
  });
  const { adminManager } = useSelector((state) => state.user);

  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('emstoken');

  // Fetch companies and users
  useEffect(() => {
    // console.log(adminManager)
    setUsers(employee)
    setBranch({ ...branch, companyId: company._id })
    if (editbranch) setBranch(editbranchdata)

  }, [company, editbranch]);

  useEffect(() => {
    if (adminManager.length > 0) {
      setUsers(adminManager.filter(e => e.role == 'manager'))
    }
  }, [adminManager]);

  // Form field handler
  const handleChange = (field, value) => {
    setBranch(prev => ({ ...prev, [field]: value }));
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}addBranch`, branch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Branch added successfully");
      setopenviewmodal(false)
      setBranch({ name: '', location: '', companyId: '', managerIds: [] });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error adding branch");
    }
  };

  const edite = async () => {
    // console.log(branch)
    // return
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}editBranch`, branch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      setopenviewmodal(false)
      setBranch({ name: '', location: '', companyId: '', managerIds: [] });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error adding branch");
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h5" gutterBottom>{editbranch ? 'Edit Branch' : 'Add New Branch'} </Typography>
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

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        {editbranch ? <Button variant="contained" onClick={edite}>
          Save
        </Button> :
          <Button variant="contained" onClick={handleSubmit}>
            Add Branch
          </Button>}

      </Box>
    </Box>
  );
};

export default Addbranch;
