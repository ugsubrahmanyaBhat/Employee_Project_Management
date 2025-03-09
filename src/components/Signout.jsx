import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

export default function Signout() {
    const { session, signout } = useAuth();
    const navigate = useNavigate();
    
    const handleSignout = async (e) => {
        e.preventDefault();
        try {
            await signout();
            navigate('/');
        } catch (err) {
            console.log(err);
        }
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
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center space-x-1 transition-colors"
            >
                <span>Sign out</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
            </button>
        </div>
    );
}