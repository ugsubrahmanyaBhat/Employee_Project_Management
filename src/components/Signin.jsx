import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/authSlice";  // ✅ Import Redux action

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { error, loading, session } = useSelector(state => state.auth);  // ✅ Get Redux state

    const handleSignin = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginUser({ email, password }));
        if (result.payload) navigate("/Dashboard");  // ✅ Redirect on success
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#242424]">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-lg bg-[#2a2a2a]">
                <form onSubmit={handleSignin} className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">Sign in</h1>
                        <p className="mt-2 text-sm text-gray-300">
                            New user?{" "}
                            <Link to="/Signup" className="font-medium text-blue-400 hover:text-blue-300">
                                Sign up
                            </Link>
                        </p>
                    </div>
                    <div className="space-y-4">
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email"
                            required
                            className="w-full px-3 py-2 text-white bg-[#333] border border-gray-700 rounded-md"
                        />
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            required
                            className="w-full px-3 py-2 text-white bg-[#333] border border-gray-700 rounded-md"
                        />
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md">
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                        {error && <p className="text-red-400 text-center">{error}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}
