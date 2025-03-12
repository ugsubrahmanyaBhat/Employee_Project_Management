import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addEmployeeAsync, resetMessages, setupRealtimeSubscriptions } from "../../features/employeeSlice.js";

export default function Add() {
  const [employeeName, setEmployeeName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux store
  const { loading, error, successMessage, realtimeConnected } = useSelector((state) => state.employees);

  // Ensure realtime is connected
  useEffect(() => {
    if (!realtimeConnected) {
      dispatch(setupRealtimeSubscriptions());
    }
  }, [dispatch, realtimeConnected]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(resetMessages());
        navigate("/Employees"); 
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch, navigate]);

  const handleAddEmployee = () => {
    if (!employeeName.trim()) return;
    dispatch(addEmployeeAsync(employeeName));
    setEmployeeName("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#20232A] to-[#282C34] p-6">
      <h2 className="text-3xl font-bold text-white mb-6">👤 Add Employee</h2>

      {/* Realtime Status Indicator */}
      <div className="mb-4 flex items-center">
        <div className={`h-3 w-3 rounded-full mr-2 ${realtimeConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <span className="text-sm text-gray-400">
          {realtimeConnected ? 'Realtime Connected' : 'Connecting to realtime...'}
        </span>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">⚠️ {error}</div>}
        {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded-lg">✅ {successMessage}</div>}

        <input
          type="text"
          placeholder="Enter employee name..."
          className="w-full p-3 text-lg text-gray-900 border rounded-lg"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
        />

        <button
          onClick={handleAddEmployee}
          className="w-full bg-[#61dafb] text-gray-900 font-semibold py-3 rounded-lg shadow-md"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Employee"}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/Employees")}
            className="w-1/2 bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-md"
          >
            ⬅️ Employees
          </button>
          
          <button
            onClick={() => navigate("/Dashboard")}
            className="w-1/2 bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-md"
          >
            🏠 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
