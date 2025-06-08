import { configureStore } from "@reduxjs/toolkit";
import user from "./user";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { combineReducers } from "@reduxjs/toolkit";

const persistConfig = {
    key: "EMS",
    version: 1,
    storage: storage
}

const reducer = combineReducers({
    user: user,
})

const persistedReducer = persistReducer(persistConfig, reducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export default store;