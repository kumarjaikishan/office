// features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const FirstFetch = createAsyncThunk(
    'user/fetchUserData',
    async (_, { getState }) => {
        const token = localStorage.getItem("emstoken");
        const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}firstfetch`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("firstfetch", res.data)
        return res.data;
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: null,
        department: null,
        employee: null,
        company:null,
        attandence: null,
        salary: null,
        setting: null,
        status: 'idle',
    },
    reducers: {
        userlogout(state, action) {
            localStorage.clear();
            state.profile = null;
            state.department = null;
            state.employee = null;
            state.salary = null;
        },
        updateAttendance(state, action) {
            state.attandence = action.payload;
        },
        setuser(state, action) {
            state.profile = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(FirstFetch.fulfilled, (state, action) => {
                state.profile = action.payload.user;
                state.department = action.payload.departmentlist;
                state.employee = action.payload.employee;
                state.attandence = action.payload.attendance;
                state.company = action.payload.company;
                state.setting = action.payload.companySetting;
                state.status = 'succeeded';
            })
            .addCase(FirstFetch.pending, (state) => {
                state.status = 'loading';
            });
    },
});

export const { userlogout,updateAttendance,setuser } = userSlice.actions;
export default userSlice.reducer;
