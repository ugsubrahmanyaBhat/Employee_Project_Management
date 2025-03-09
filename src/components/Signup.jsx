import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');
    const { session, SignupNewuser } = useAuth();
    const navigate = useNavigate();
    console.log(session);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await SignupNewuser(email, password);
            if (result.success) {
                navigate('/Signin');
            } else {
                setError(result.error); // Set error message
            }
        } catch (err) {
            setError(err.message); // Display error properly
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#242424]">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-lg bg-[#2a2a2a]">
                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">Sign up</h1>
                        <p className="mt-2 text-sm text-gray-300">
                            Already have an account?{" "}
                            <Link to="/Signin" className="font-medium text-blue-400 hover:text-blue-300">
                                Sign in
                            </Link>
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <input
                                onChange={(e) => { setEmail(e.target.value) }}
                                type="email"
                                placeholder="Email"
                                required
                                className="w-full px-3 py-2 text-white bg-[#333333] border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                onChange={(e) => { setPassword(e.target.value) }}
                                type="password"
                                placeholder="Password"
                                required
                                className="w-full px-3 py-2 text-white bg-[#333333] border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 text-white font-medium bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing up..." : "Sign up"}
                        </button>
                        {error && <p className="text-red-400 text-center pt-2">{error}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}