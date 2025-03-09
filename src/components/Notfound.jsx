import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
            <p className="text-lg text-gray-700 mt-4">Oops! The page you're looking for doesn't exist.</p>
            <Link to="/" className="mt-6 px-4 py-2  text-white rounded">Go Home</Link>
        </div>
    );
}
