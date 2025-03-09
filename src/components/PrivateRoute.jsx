import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const PrivateRoute = ({ children }) => {
    const { session } = useAuth(); 

    if (session === undefined) {
        return <p>Loading...</p>; // Wait until session is determined
    }

    return <div>{session ? <>{children}</> : <Navigate to="/Signup" />}</div>;
};

export default PrivateRoute;
