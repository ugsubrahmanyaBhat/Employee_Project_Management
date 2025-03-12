import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectsAsync } from "../features/projectSlice";
import {
    fetchEmployeesAsync,
    deleteEmployeeAsync,
    updateEmployeeAsync,
    assignProjectsAsync,
    removeProjectsAsync,
    searchEmployeesAsync,
    resetMessages,
    resetSearch,
    setupRealtimeSubscriptions
} from "../features/employeeSlice";

export default function Employee() {
    const dispatch = useDispatch();
    const {
        employees,
        loading,
        error,
        successMessage,
        searchResults,
        isSearching,
        realtimeConnected
    } = useSelector(state => state.employees);
    const { projects } = useSelector(state => state.projects);
    
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showOptions, setShowOptions] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        selected: [],
        removeSelected: []
    });

    useEffect(() => {
        dispatch(fetchEmployeesAsync());
        dispatch(fetchProjectsAsync());
        dispatch(setupRealtimeSubscriptions());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => dispatch(resetMessages()), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            dispatch(searchEmployeesAsync(value));
        } else {
            dispatch(resetSearch());
        }
    };

    const displayEmployees = searchTerm.trim() ? searchResults : employees;

    return (
        <div className="p-6 bg-[#0f0f0f] min-h-screen">
            <nav className="flex justify-between bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white rounded-xl shadow-xl">
                <Link to="/Dashboard" className="hover:opacity-80 transition-opacity flex items-center space-x-2">
                    <span>🏠</span>
                    <span>Home</span>
                </Link>
                <Link to="/Employees/add" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center space-x-2">
                    <span>➕</span>
                    <span>Add Employee</span>
                </Link>
            </nav>

            <div className="mt-4 flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${realtimeConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-400">
                    {realtimeConnected ? 'Realtime Connected' : 'Connecting to realtime...'}
                </span>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
                <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                dispatch(resetSearch());
                            }}
                            className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Status Messages */}
            {(successMessage || error) && (
                <div className={`mt-4 p-3 rounded-lg ${successMessage ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {successMessage || error}
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="mt-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}

            {/* Employee List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {displayEmployees.map(employee => (
                    <div key={employee.id} className="bg-[#181818] p-6 rounded-2xl shadow-2xl border border-[#2d2d2d] relative hover:border-cyan-500 transition-all">
                        <h3 className="text-xl font-bold text-white mb-2">{employee.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Projects: {employee.projects?.map(p => p.name).join(", ") || 'None assigned'}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    setSelectedEmployee(employee);
                                    setFormData({...formData, name: employee.name});
                                    setShowEditModal(true);
                                }}
                                className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-lg"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedEmployee(employee);
                                    setFormData({...formData, selected: employee.projects?.map(p => p.id) || []});
                                    setShowAssignModal(true);
                                }}
                                className="text-white bg-green-500 hover:bg-green-700 px-4 py-2 rounded-lg"
                            >
                                Assign
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedEmployee(employee);
                                    setShowRemoveModal(true);
                                }}
                                className="text-white bg-yellow-500 hover:bg-yellow-700 px-4 py-2 rounded-lg"
                            >
                                Remove
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this employee?")) {
                                        dispatch(deleteEmployeeAsync(employee.id));
                                    }
                                }}
                                className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && displayEmployees.length === 0 && (
                <div className="text-center mt-8 p-6 bg-[#181818] rounded-2xl">
                    <p className="text-gray-400">
                        {searchTerm ? "No matching employees found" : "No employees available"}
                    </p>
                </div>
            )}

            {/* Edit Employee Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Edit Employee</h2>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    dispatch(updateEmployeeAsync({
                                        employeeId: selectedEmployee.id,
                                        name: formData.name
                                    }));
                                    setShowEditModal(false);
                                }}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Projects Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Assign Projects to {selectedEmployee?.name}</h2>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {projects.map(project => (
                                <label key={project.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.selected.includes(project.id)}
                                        onChange={(e) => {
                                            const updated = e.target.checked
                                                ? [...formData.selected, project.id]
                                                : formData.selected.filter(id => id !== project.id);
                                            setFormData({...formData, selected: updated});
                                        }}
                                        className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-[#3d3d3d] rounded"
                                    />
                                    <span className="text-white">{project.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={() => {
                                    dispatch(assignProjectsAsync({
                                        employeeId: selectedEmployee.id,
                                        projectIds: formData.selected
                                    }));
                                    setShowAssignModal(false);
                                }}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Projects Modal */}
            {showRemoveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d3d] shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Remove Projects from {selectedEmployee?.name}</h2>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedEmployee?.projects?.map(project => (
                                <label key={project.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.removeSelected.includes(project.id)}
                                        onChange={(e) => {
                                            const updated = e.target.checked
                                                ? [...formData.removeSelected, project.id]
                                                : formData.removeSelected.filter(id => id !== project.id);
                                            setFormData({...formData, removeSelected: updated});
                                        }}
                                        className="w-5 h-5 text-red-500 bg-transparent border-2 border-[#3d3d3d] rounded"
                                    />
                                    <span className="text-white">{project.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={() => {
                                    dispatch(removeProjectsAsync({
                                        employeeId: selectedEmployee.id,
                                        projectIdsToRemove: formData.removeSelected
                                    }));
                                    setShowRemoveModal(false);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                            >
                                Remove
                            </button>
                            <button
                                onClick={() => setShowRemoveModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}