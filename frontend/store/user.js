import { createSlice } from "@reduxjs/toolkit";

const islogin = createSlice({
    name:"user",
    initialState:{
        islogin:false,
        head:"LogIn",
        user:{},
        loader:false,
        isadmin:false,
    },
    reducers:{
        setlogin(state, action){
           state.islogin = action.payload.login;
           state.user = action.payload.user;
        },
        setlogout(state, action){
           state.islogin = action.payload.login;
           state.user = action.payload.user;
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
export const {setadmin,setlogin,header,setloader,setlogout}= islogin.actions;
export default islogin.reducer;