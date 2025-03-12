import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/authSlice";
import { useNavigate } from "react-router-dom";

export default function Signout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { session } = useSelector(state => state.auth);  // ✅ Get Redux state

    const handleSignout = async () => {
        await dispatch(logoutUser());
        navigate("/");
    };

    return (
        <div className="flex items-center space-x-4">
            <div className="text-right">
                <div className="text-sm text-gray-300">Logged in as:</div>
                <div className="text-white font-medium truncate max-w-[200px]">
                    {session?.user?.email}
                </div>
            </div>
            <button 
                onClick={handleSignout}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
            >
                Sign out
            </button>
        </div>
    );
}
