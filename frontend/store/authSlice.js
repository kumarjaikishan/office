import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        islogin:false,
        head:"LogIn",
        loader:false,
        isadmin:false,
    },
    reducers:{
        setlogin(state, action){
           state.islogin = action.payload.login;
        },
        setlogout(state, action){
           state.islogin = action.payload.login;
           localStorage.removeItem('emstoken');
        },
        header(state, action){
           state.head = action.payload;
        },
        setloader(state, action){
           state.loader = action.payload;
        },
        setadmin(state, action){
           state.isadmin = action.payload;
        }
    }

})
export const {setadmin,setlogin,header,setloader,setlogout}= authSlice.actions;
export default authSlice.reducer;