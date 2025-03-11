import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./features/employeeSlice";
import projectReducer from "./features/projectSlice";

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    projects:projectReducer,
  },
});
