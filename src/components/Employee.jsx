// Employee.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchEmployees, 
  fetchProjects, 
  deleteEmployee,
  updateEmployee,
  assignProjects,
  removeProjects,
  setSelectedEmployee,
  setShowEditForm,
  setShowAssignForm,
  setShowRemoveForm,
  searchEmployees,
  clearMessages
} from  "../features/employeeSlice.js";

export default function Employee() {
  const dispatch = useDispatch();
  const { 
    employees, 
    projects, 
    selectedEmployee, 
    loading, 
    error, 
    successMessage,
    showEditForm,
    showAssignForm,
    showRemoveForm
  } = useSelector(state => state.employees);
  const [showOptions, setShowOptions] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    // Clear messages after 3 seconds
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  function handleSearch(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(searchEmployees(searchTerm));
    } else {
      dispatch(fetchEmployees());
    }
  }

  function handleEdit(employee) {
    dispatch(setSelectedEmployee(employee));
    dispatch(setShowEditForm(true));
    setShowOptions(null);
  }

  function handleAssign(employee) {
    dispatch(setSelectedEmployee(employee));
    dispatch(setShowAssignForm(true));
    setShowOptions(null);
  }

  function handleRemove(employee) {
    dispatch(setSelectedEmployee(employee));
    dispatch(setShowRemoveForm(true));
    setShowOptions(null);
  }

  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      dispatch(deleteEmployee(id));
      setShowOptions(null);
    }
  }

  function toggleOptions(employeeId) {
    setShowOptions(showOptions === employeeId ? null : employeeId);
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      <nav className="flex justify-between bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white rounded-xl shadow-xl">
        <Link to="/Dashboard" className="hover:opacity-80 transition-opacity flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Home</span>
        </Link>
        <Link to="/Employees/add" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center space-x-2">
          <span>➕</span>
          <span>Add Employee</span>
        </Link>
      </nav>

      {/* Search bar */}
      <div className="mt-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                dispatch(fetchEmployees());
              }}
              className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Status messages */}
      {(successMessage || error) && (
        <div className={`mt-4 p-3 rounded-lg ${successMessage ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {successMessage || error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {/* Employees grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-[#181818] p-6 rounded-2xl shadow-2xl border border-[#2d2d2d] relative hover:border-cyan-500 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">{employee.name}</h3>
            <p className="text-gray-400 text-sm">
              Projects: {employee.projects.map(p => p.name).join(", ") || 'None assigned'}
            </p>
            
            <button
              onClick={() => toggleOptions(employee.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>

            {showOptions === employee.id && (
              <div className="absolute right-4 top-12 bg-[#2d2d2d] shadow-xl rounded-xl p-2 w-48 z-10 border border-[#3d3d3d]">
                <button onClick={() => handleEdit(employee)} className="w-full text-left px-4 py-3 text-white hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>✏️</span>
                  <span>Edit</span>
                </button>
                <button onClick={() => handleAssign(employee)} className="w-full text-left text-white px-4 py-3 hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>📌</span>
                  <span>Assign</span>
                </button>
                <button onClick={() => handleRemove(employee)} className="w-full text-left text-white px-4 py-3 hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>❌</span>
                  <span>Remove Access</span>
                </button>
                <button onClick={() => handleDelete(employee.id)} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>🗑</span>
                  <span className="text-white">Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No employees found message */}
      {!loading && employees.length === 0 && (
        <div className="text-center mt-8 p-6 bg-[#181818] rounded-2xl">
          <p className="text-gray-400">No employees found</p>
        </div>
      )}

      {/* Forms */}
      {showEditForm && <EditEmployeeForm />}
      {showAssignForm && <AssignProjectForm />}
      {showRemoveForm && <RemoveProjectForm />}
    </div>
  );
}

function AssignProjectForm() {
  const dispatch = useDispatch();
  const { selectedEmployee, projects } = useSelector(state => state.employees);
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    if (selectedEmployee?.projects) {
      setSelectedProjects(selectedEmployee.projects.map(p => p.id));
    }
  }, [selectedEmployee]);

  function handleAssignProjects() {
    dispatch(assignProjects({
      employeeId: selectedEmployee.id,
      projectIds: selectedProjects
    }));
  }

  function handleClose() {
    dispatch(setShowAssignForm(false));
  }

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Assign Projects to {selectedEmployee?.name}</h2>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {projects.map((project) => (
            <label key={project.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-[#3d3d3d] rounded focus:ring-cyan-500"
                checked={selectedProjects.includes(project.id)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...selectedProjects, project.id]
                    : selectedProjects.filter(id => id !== project.id);
                  setSelectedProjects(updated);
                }}
              />
              <span className="text-white">{project.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleAssignProjects}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Save Changes
          </button>
          <button 
            onClick={handleClose}
            className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function RemoveProjectForm() {
  const dispatch = useDispatch();
  const { selectedEmployee } = useSelector(state => state.employees);
  const [selectedProjects, setSelectedProjects] = useState([]);

  function handleRemoveProjects() {
    dispatch(removeProjects({
      employeeId: selectedEmployee.id,
      projectIds: selectedProjects
    }));
  }

  function handleClose() {
    dispatch(setShowRemoveForm(false));
  }

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Remove Projects from {selectedEmployee?.name}</h2>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {selectedEmployee?.projects.map((project) => (
            <label key={project.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-[#3d3d3d] rounded focus:ring-cyan-500"
                checked={selectedProjects.includes(project.id)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...selectedProjects, project.id]
                    : selectedProjects.filter(id => id !== project.id);
                  setSelectedProjects(updated);
                }}
              />
              <span className="text-white">{project.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleRemoveProjects}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Remove Selected
          </button>
          <button 
            onClick={handleClose}
            className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function EditEmployeeForm() {
  const dispatch = useDispatch();
  const { selectedEmployee } = useSelector(state => state.employees);
  const [name, setName] = useState("");

  useEffect(() => {
    if (selectedEmployee) {
      setName(selectedEmployee.name);
    }
  }, [selectedEmployee]);

  function handleUpdateEmployee() {
    dispatch(updateEmployee({
      id: selectedEmployee.id,
      name
    }));
  }

  function handleClose() {
    dispatch(setShowEditForm(false));
  }

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Employee</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Employee name"
        />
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleUpdateEmployee}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Save Changes
          </button>
          <button 
            onClick={handleClose}
            className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}