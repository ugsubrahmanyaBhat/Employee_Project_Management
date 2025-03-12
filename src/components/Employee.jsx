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
  clearMessages,
  setupRealtimeSubscriptions
} from "../features/employeeSlice.js";

export default function Employee() {
  const dispatch = useDispatch();
  const { 
    employees = [],
    projects = [],
    selectedEmployee,
    loading, 
    error, 
    successMessage,
    showEditForm,
    showAssignForm,
    showRemoveForm,
    realtimeConnected
  } = useSelector(state => state.employees);

  const [showOptions, setShowOptions] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Set up real-time subscriptions on component mount
  useEffect(() => {
    if (!realtimeConnected) {
      dispatch(setupRealtimeSubscriptions());
    }
  }, [dispatch, realtimeConnected]);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(searchEmployees(searchTerm));
    } else {
      dispatch(fetchEmployees());
    }
  };

  const handleEdit = (employee) => {
    dispatch(setSelectedEmployee(employee));
    dispatch(setShowEditForm(true));
    setShowOptions(null);
  };

  const handleAssign = (employee) => {
    dispatch(setSelectedEmployee(employee));
    dispatch(setShowAssignForm(true));
    setShowOptions(null);
  };

  const handleRemove = (employee) => {
    dispatch(setSelectedEmployee(employee));
    dispatch(setShowRemoveForm(true));
    setShowOptions(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      dispatch(deleteEmployee(id));
      setShowOptions(null);
    }
  };

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

      {/* Realtime Status */}
      <div className="mt-4 flex items-center">
        <div className={`h-3 w-3 rounded-full mr-2 ${realtimeConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <span className="text-sm text-gray-400">
          {realtimeConnected ? 'Realtime Connected' : 'Connecting to realtime...'}
        </span>
      </div>

      {/* Search Bar */}
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

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-[#181818] p-6 rounded-2xl shadow-2xl border border-[#2d2d2d] relative hover:border-cyan-500 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">{employee.name}</h3>
            <p className="text-gray-400 text-sm mb-4">
              Projects: {employee.projects?.map(p => p.name).join(", ") || 'None assigned'}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEdit(employee)}
                className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={() => handleAssign(employee)}
                className="text-white bg-green-500 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Assign
              </button>
              <button
                onClick={() => handleRemove(employee)}
                className="text-white bg-yellow-500 hover:bg-yellow-700 px-4 py-2 rounded-lg"
              >
                Remove
              </button>
              <button
                onClick={() => handleDelete(employee.id)}
                className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && employees.length === 0 && (
        <div className="text-center mt-8 p-6 bg-[#181818] rounded-2xl">
          <p className="text-gray-400">No employees found</p>
        </div>
      )}

      {/* Modal Forms */}
      {showEditForm && <EditEmployeeForm />}
      {showAssignForm && <AssignProjectForm />}
      {showRemoveForm && <RemoveProjectForm />}
    </div>
  );
}

// Edit Employee Form Component
function EditEmployeeForm() {
  const dispatch = useDispatch();
  const { selectedEmployee } = useSelector(state => state.employees);
  const [name, setName] = useState("");

  useEffect(() => {
    if (selectedEmployee) setName(selectedEmployee.name);
  }, [selectedEmployee]);

  const handleUpdate = () => {
    dispatch(updateEmployee({ id: selectedEmployee.id, name }));
  };

  const handleClose = () => {
    dispatch(setShowEditForm(false));
  };

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Employee</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
        />
        <div className="flex gap-4">
          <button onClick={handleUpdate} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg">
            Save
          </button>
          <button onClick={handleClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Assign Project Form Component
function AssignProjectForm() {
  const dispatch = useDispatch();
  const { selectedEmployee, projects } = useSelector(state => state.employees);
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    if (selectedEmployee?.projects) {
      setSelectedProjects(selectedEmployee.projects.map(p => p.id));
    }
  }, [selectedEmployee]);

  const handleAssign = () => {
    dispatch(assignProjects({ employeeId: selectedEmployee.id, projectIds: selectedProjects }));
  };

  const handleClose = () => {
    dispatch(setShowAssignForm(false));
  };

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Assign Projects to {selectedEmployee.name}</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {projects.map(project => (
            <label key={project.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProjects.includes(project.id)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...selectedProjects, project.id]
                    : selectedProjects.filter(id => id !== project.id);
                  setSelectedProjects(updated);
                }}
                className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-[#3d3d3d] rounded"
              />
              <span className="text-white">{project.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex gap-4">
          <button onClick={handleAssign} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg">
            Save
          </button>
          <button onClick={handleClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Remove Project Form Component
function RemoveProjectForm() {
  const dispatch = useDispatch();
  const { selectedEmployee } = useSelector(state => state.employees);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const handleRemove = () => {
    dispatch(removeProjects({ employeeId: selectedEmployee.id, projectIds: selectedProjects }));
  };

  const handleClose = () => {
    dispatch(setShowRemoveForm(false));
  };

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Remove Projects from {selectedEmployee.name}</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {selectedEmployee.projects?.map(project => (
            <label key={project.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProjects.includes(project.id)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...selectedProjects, project.id]
                    : selectedProjects.filter(id => id !== project.id);
                  setSelectedProjects(updated);
                }}
                className="w-5 h-5 text-red-500 bg-transparent border-2 border-[#3d3d3d] rounded"
              />
              <span className="text-white">{project.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex gap-4">
          <button onClick={handleRemove} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
            Remove
          </button>
          <button onClick={handleClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}