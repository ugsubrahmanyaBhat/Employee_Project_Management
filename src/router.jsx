import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./components/Dashboard";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import PrivateRoute from './components/PrivateRoute';
import Employee from './components/Employee';
import Projects from './components/Projects';
import NotFound from "./components/Notfound";
import Add from './pages/Employee/add'
import P_Add from "./pages/Projects/p_add";


export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/Signin", element: <Signin /> },
    { path: "/Signup", element: <Signup /> },
    {
        path: "/Dashboard",
        element: (
            <PrivateRoute>
                <Dashboard />
            </PrivateRoute>),
    },
    {
        path: "/Projects",
        element: (
            <PrivateRoute>
                <Projects />
            </PrivateRoute>),
    },
    {
        path: "/Projects/add",
        element: (
            <PrivateRoute>
                <P_Add />
            </PrivateRoute>),
    },

    {
        path: "/Employees",
        element: (
            <PrivateRoute>
                <Employee />
            </PrivateRoute>),
    },
    {
        path: "/Employees/add",
        element: (
            <PrivateRoute>
                <Add />
            </PrivateRoute>),
    },
    { path: "*", element: <NotFound /> },
],{ basename: "/" });