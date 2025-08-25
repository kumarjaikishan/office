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
        // console.log("firstfetch", res.data)
        return res.data;
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: null,
        department: null,
        adminManager: null,
        employee: null,
        company:null,
        holidays:null,
        branch:null,
        attandence: null,
        ledger: null,
        salary: null,
        status: 'idle',
        sidebar: false,
        extendedonMobile: false,
        primaryColor: '#115e59',
    },
    reducers: {
        userlogout(state, action) {
            localStorage.clear();
            state.profile = null;
            state.department = null;
            state.adminManager = null;
            state.employee = null;
            state.company = null;
            state.holidays = null;
            state.branch = null;
            state.attandence = null;
            state.ledger = null;
            state.salary = null;
        },
        updateAttendance(state, action) {
            state.attandence = action.payload;
        },
        setuser(state, action) {
            state.profile = action.payload;
        },
        tooglesidebar(state, action) {
            state.sidebar = !state.sidebar;
        },
        setPrimaryColor(state, action) {
            state.primaryColor = action.payload;
        },
        toogleextendedonMobile(state, action) {
            state.extendedonMobile = !state.extendedonMobile;
        },
        
    },
    extraReducers: (builder) => {
        builder
            .addCase(FirstFetch.fulfilled, (state, action) => {
                state.profile = action.payload?.user;
                state.department = action.payload?.departmentlist;
                state.adminManager = action.payload?.adminManager;
                state.employee = action.payload?.employee;
                state.attandence = action.payload?.attendance;
                state.company = action.payload?.company;
                state.branch = action.payload?.branch;
                state.holidays = action.payload?.holidays;
                state.ledger = action.payload?.ledger;
                state.status = 'succeeded';
            })
            .addCase(FirstFetch.pending, (state) => {
                state.status = 'loading';
            });
    },
});

export const { userlogout,updateAttendance,setPrimaryColor,setuser,tooglesidebar,toogleextendedonMobile } = userSlice.actions;
export default userSlice.reducer;
