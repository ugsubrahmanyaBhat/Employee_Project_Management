// Projects.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase/SupabaseClient";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [employeesToRemove, setEmployeesToRemove] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("Projects")
      .select("id, name, project_employee ( emp_id, Employee ( id, name ) )");

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      const formattedData = data.map((project) => ({
        ...project,
        employees: project.project_employee.map(pe => pe.Employee) || [],
      }));
      setProjects(formattedData);
    }
  }

  async function fetchEmployees() {
    const { data, error } = await supabase.from("Employee").select("id, name");

    if (error) {
      console.error("Error fetching employees:", error);
    } else {
      setEmployees(data);
    }
  }

  async function deleteProject(id) {
    await supabase.from("Projects").delete().eq("id", id);
    await supabase.from("project_employee").delete().eq("project_id", id);
    fetchProjects();
  }

  async function assignEmployees() {
    if (!selectedProject) return;

    await supabase.from("project_employee").delete().eq("project_id", selectedProject.id);
    await supabase.from("project_employee").insert(
      selectedEmployees.map(empId => ({ project_id: selectedProject.id, emp_id: empId }))
    );

    setShowAssignModal(false);
    fetchProjects();
  }

  async function removeEmployees() {
    if (!selectedProject) return;

    await supabase.from("project_employee").delete()
      .match({ project_id: selectedProject.id })
      .in("emp_id", employeesToRemove);

    setShowRemoveModal(false);
    fetchProjects();
  }

  function toggleOptions(projectId) {
    setShowOptions(showOptions === projectId ? null : projectId);
  }

  function openAssignModal(project) {
    setSelectedProject(project);
    setSelectedEmployees(project.employees.map(e => e.id));
    setShowAssignModal(true);
    setShowOptions(null);
  }

  function openEditModal(project) {
    setSelectedProject(project);
    setEditedProjectName(project.name);
    setShowEditModal(true);
    setShowOptions(null);
  }

  function openRemoveModal(project) {
    setSelectedProject(project);
    setEmployeesToRemove([]);
    setShowRemoveModal(true);
    setShowOptions(null);
  }

  async function updateProject() {
    if (!selectedProject) return;

    await supabase.from("Projects").update({ name: editedProjectName }).eq("id", selectedProject.id);
    
    setShowEditModal(false);
    fetchProjects();
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
        <Link to="/Projects/add" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center space-x-2">
          <span>➕</span>
          <span>Add Project</span>
        </Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-[#181818] p-6 rounded-2xl shadow-2xl border border-[#2d2d2d] relative hover:border-cyan-500 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
            <p className="text-gray-400 text-sm">
              Employees: {project.employees.map(e => e.name).join(", ") || 'None assigned'}
            </p>
            
            <button
              onClick={() => toggleOptions(project.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>

            {showOptions === project.id && (
              <div className="absolute right-4 top-12 bg-[#2d2d2d] shadow-xl rounded-xl p-2 w-48 z-10 border border-[#3d3d3d]">
                <button onClick={() => openAssignModal(project)} className="w-full text-left  px-4 py-3 hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>👥</span>
                  <span className="text-white">Assign</span>
                </button>
                <button onClick={() => openEditModal(project)} className="w-full text-left px-4 py-3 hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>✏️</span>
                  <span className="text-white">Edit</span>
                </button>
                <button onClick={() => openRemoveModal(project)} className="w-full text-left px-4 py-3 hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>❌</span>
                  <span className="text-white">Remove Access</span>
                </button>
                <button onClick={() => deleteProject(project.id)} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#3d3d3d] rounded-lg flex items-center space-x-2">
                  <span>🗑</span>
                  <span className="text-white">Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Assign Employees to {selectedProject?.name}</h2>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {employees.map((employee) => (
                <label key={employee.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-[#3d3d3d] rounded focus:ring-cyan-500"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...selectedEmployees, employee.id]
                        : selectedEmployees.filter(id => id !== employee.id);
                      setSelectedEmployees(updated);
                    }}
                  />
                  <span className="text-white">{employee.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={assignEmployees}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Project</h2>
            <input
              type="text"
              value={editedProjectName}
              onChange={(e) => setEditedProjectName(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Project name"
            />
            <div className="mt-8 flex gap-4">
              <button 
                onClick={updateProject}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] rounded-2xl p-8 w-full max-w-md border border-[#2d2d2d] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Remove Access from {selectedProject?.name}</h2>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {selectedProject?.employees.map((emp) => (
                <label key={emp.id} className="flex items-center space-x-3 p-3 hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-cyan-500 bg-transparent border-2 border-[#3d3d3d] rounded focus:ring-cyan-500"
                    checked={employeesToRemove.includes(emp.id)}
                    onChange={(e) => {
                      const updatedList = e.target.checked
                        ? [...employeesToRemove, emp.id]
                        : employeesToRemove.filter(id => id !== emp.id);
                      setEmployeesToRemove(updatedList);
                    }}
                  />
                  <span className="text-white">{emp.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={removeEmployees}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Remove Selected
              </button>
              <button 
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white px-6 py-3 rounded-lg transition-colors"
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