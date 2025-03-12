import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
    const { session } = useSelector(state => state.auth);

    if (session === undefined) {
        return <p>Loading...</p>; // Wait until session is determined
    }

    return session ? <>{children}</> : <Navigate to="/Signin" />;
};

export default PrivateRoute;
