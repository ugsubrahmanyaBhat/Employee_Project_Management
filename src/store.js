import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";  // ✅ Persistent storage
import employeeReducer from "./features/employeeSlice";
import projectReducer from "./features/projectSlice";
import authReducer from "./features/authSlice";

// Persist config for auth state
const authPersistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    projects: projectReducer,
    auth: persistedAuthReducer,  // ✅ Use persisted auth reducer
  },
});

export const persistor = persistStore(store);
