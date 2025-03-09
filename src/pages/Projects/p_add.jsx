import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/SupabaseClient"; 

export default function P_Add() {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAddProject = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!projectName.trim()) {
      setErrorMessage("Project name cannot be empty!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("Projects")
        .insert([{ name: projectName.trim() }])
        .select();

      if (error) {
        throw error;
      }

      setSuccessMessage(`Project "${data[0].name}" created successfully!`);
      setProjectName("");
      setTimeout(() => navigate("/Projects"), 2000);
    } catch (error) {
      console.error("Add project error:", error);
      setErrorMessage(error.message || "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#20232A] to-[#282C34] p-6">
      <h2 className="text-3xl font-bold text-white mb-6">➕ Add Project</h2>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        {errorMessage && (
          <div 
            className="p-3 bg-red-100 text-red-700 rounded-lg"
            role="alert"
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div 
            className="p-3 bg-green-100 text-green-700 rounded-lg"
            role="status"
          >
            ✅ {successMessage}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter project name..."
          className="w-full p-3 text-lg text-gray-900 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value);
            setErrorMessage("");
          }}
          aria-label="Project name"
        />

        <button
          onClick={handleAddProject}
          className="w-full bg-[#61dafb] text-gray-900 font-semibold py-3 rounded-lg shadow-md hover:bg-[#4fc3f7] transition disabled:opacity-50"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Creating..." : "Add Project"}
        </button>

        <button
          onClick={() => navigate("/Dashboard")}
          className="w-full bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-gray-800 transition"
        >
          ⬅️ Go to Dashboard
        </button>
      </div>
    </div>
  );
}