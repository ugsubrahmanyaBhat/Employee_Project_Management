import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabase/SupabaseClient";

// Async thunk for fetching projects
export const fetchProjectsAsync = createAsyncThunk(
  "projects/fetchProjectsAsync",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Projects")
        .select("id, name, project_employee ( emp_id, Employee ( id, name ) )");
      if (error) throw error;
      const formattedData = data.map((project) => ({
        ...project,
        employees: project.project_employee.map(pe => pe.Employee) || [],
      }));
      return formattedData;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch projects.");
    }
  }
);

// Async thunk for fetching employees
export const fetchEmployeesAsync = createAsyncThunk(
  "projects/fetchEmployeesAsync",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .select("id, name");
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch employees.");
    }
  }
);

// Async thunk for adding a project
export const addProjectAsync = createAsyncThunk(
  "projects/addProjectAsync",
  async (projectName, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Projects")
        .insert([{ name: projectName.trim() }])
        .select();
      if (error) throw error;
      return data[0]; // Return the new project
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create project.");
    }
  }
);

// Async thunk for deleting a project
export const deleteProjectAsync = createAsyncThunk(
  "projects/deleteProjectAsync",
  async (projectId, { rejectWithValue }) => {
    try {
      // First delete related records from project_employee
      const { error: relatedError } = await supabase
        .from("project_employee")
        .delete()
        .eq("project_id", projectId);
      if (relatedError) throw relatedError;
      // Then delete the project
      const { error } = await supabase
        .from("Projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete project.");
    }
  }
);

// Async thunk for updating a project
export const updateProjectAsync = createAsyncThunk(
  "projects/updateProjectAsync",
  async ({ projectId, name }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Projects")
        .update({ name: name.trim() })
        .eq("id", projectId)
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update project.");
    }
  }
);

// Async thunk for assigning employees to a project
export const assignEmployeesAsync = createAsyncThunk(
  "projects/assignEmployeesAsync",
  async ({ projectId, employeeIds }, { rejectWithValue, dispatch }) => {
    try {
      // First delete existing assignments
      const { error: deleteError } = await supabase
        .from("project_employee")
        .delete()
        .eq("project_id", projectId);
      if (deleteError) throw deleteError;
      // Then create new assignments
      if (employeeIds.length > 0) {
        const assignmentsToInsert = employeeIds.map(empId => ({
          project_id: projectId,
          emp_id: empId
        }));
        const { error: insertError } = await supabase
          .from("project_employee")
          .insert(assignmentsToInsert);
        if (insertError) throw insertError;
      }
      // Fetch updated project data
      dispatch(fetchProjectsAsync());
      return { projectId, employeeIds };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to assign employees.");
    }
  }
);

// Async thunk for removing employees from a project
export const removeEmployeesAsync = createAsyncThunk(
  "projects/removeEmployeesAsync",
  async ({ projectId, employeeIdsToRemove }, { rejectWithValue, dispatch }) => {
    try {
      const { error } = await supabase
        .from("project_employee")
        .delete()
        .match({ project_id: projectId })
        .in("emp_id", employeeIdsToRemove);
      if (error) throw error;
      // Fetch updated project data
      dispatch(fetchProjectsAsync());
      return { projectId, employeeIdsToRemove };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove employees.");
    }
  }
);

// Async thunk for searching projects
export const searchProjectsAsync = createAsyncThunk(
  "projects/searchProjectsAsync",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Projects")
        .select("id, name, project_employee ( emp_id, Employee ( id, name ) )")
        .ilike("name", `%${searchTerm}%`);
      if (error) throw error;
      const formattedData = data.map((project) => ({
        ...project,
        employees: project.project_employee.map(pe => pe.Employee) || [],
      }));
      return formattedData;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to search projects.");
    }
  }
);

// Async thunk for setting up real-time subscriptions
export const setupRealtimeSubscriptions = createAsyncThunk(
  "projects/setupRealtimeSubscriptions",
  async (_, { dispatch }) => {
    // Subscribe to Projects table changes
    const projectSubscription = supabase
      .channel('project-changes')
      .on('postgres_changes', {
        event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'Projects'
      }, (payload) => {
        console.log('Project change received:', payload);
        // Handle the different event types
        if (payload.eventType === 'INSERT') {
          dispatch(handleProjectInserted(payload.new));
        } else if (payload.eventType === 'UPDATE') {
          dispatch(handleProjectUpdated(payload.new));
        } else if (payload.eventType === 'DELETE') {
          dispatch(handleProjectDeleted(payload.old.id));
        }
      })
      .subscribe();

    // Subscribe to project_employee table changes
    const projectEmployeeSubscription = supabase
      .channel('project-employee-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_employee'
      }, (payload) => {
        console.log('Project-Employee relation change received:', payload);
        // When project assignments change, fetch the updated project data
        if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
          dispatch(fetchProjectWithEmployees(payload.new?.project_id || payload.old?.project_id));
        }
      })
      .subscribe();

    // Return the subscriptions so they can be unsubscribed later if needed
    return { projectSubscription, projectEmployeeSubscription };
  }
);

// Fetch a single project with employees (used for real-time updates)
export const fetchProjectWithEmployees = createAsyncThunk(
  "projects/fetchProjectWithEmployees",
  async (projectId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Projects")
        .select(`
          id,
          name,
          project_employee (
            emp_id,
            Employee ( id, name )
          )
        `)
        .eq("id", projectId)
        .single();
      if (error) throw error;
      return {
        ...data,
        employees: data.project_employee.map(pe => pe.Employee) || [],
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch project with employees");
    }
  }
);

const initialState = {
  projects: [],
  employees: [],
  loading: false,
  error: null,
  successMessage: "",
  searchResults: [],
  isSearching: false,
  realtimeSubscriptions: null,
  realtimeConnected: false
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    resetMessages: (state) => {
      state.successMessage = "";
      state.error = null;
    },
    resetSearch: (state) => {
      state.searchResults = [];
      state.isSearching = false;
    },
    handleProjectInserted: (state, action) => {
      // Check if project already exists to avoid duplicates
      const projectExists = state.projects.some(proj => proj.id === action.payload.id);
      if (!projectExists) {
        state.projects.push({
          ...action.payload,
          employees: []
        });
        state.successMessage = `Project "${action.payload.name}" added by another user!`;
      }
    },
    handleProjectUpdated: (state, action) => {
      state.projects = state.projects.map(proj =>
        proj.id === action.payload.id
          ? { ...action.payload, employees: proj.employees }
          : proj
      );
      state.successMessage = `Project "${action.payload.name}" updated by another user!`;
    },
    handleProjectDeleted: (state, action) => {
      state.projects = state.projects.filter(proj => proj.id !== action.payload);
      state.successMessage = "A project was deleted by another user!";
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects cases
      .addCase(fetchProjectsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjectsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch employees cases
      .addCase(fetchEmployeesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployeesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add project cases
      .addCase(addProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(addProjectAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.successMessage = `Project "${action.payload.name}" created successfully!`;
      })
      .addCase(addProjectAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete project cases
      .addCase(deleteProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project.id !== action.payload);
        state.successMessage = "Project deleted successfully!";
      })
      .addCase(deleteProjectAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update project cases
      .addCase(updateProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updateProjectAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(project => project.id === action.payload.id);
        if (index !== -1) {
          // Preserve employees array when updating
          const employees = state.projects[index].employees;
          state.projects[index] = { ...action.payload, employees };
        }
        state.successMessage = `Project "${action.payload.name}" updated successfully!`;
      })
      .addCase(updateProjectAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign employees cases
      .addCase(assignEmployeesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(assignEmployeesAsync.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Employees assigned successfully!";
      })
      .addCase(assignEmployeesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove employees cases
      .addCase(removeEmployeesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(removeEmployeesAsync.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Employees removed successfully!";
      })
      .addCase(removeEmployeesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search projects cases
      .addCase(searchProjectsAsync.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchProjectsAsync.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProjectsAsync.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      // Handle real-time subscriptions
      .addCase(setupRealtimeSubscriptions.fulfilled, (state, action) => {
        state.realtimeSubscriptions = action.payload;
        state.realtimeConnected = true;
      })
      // Handle fetchProjectWithEmployees (for real-time updates)
      .addCase(fetchProjectWithEmployees.fulfilled, (state, action) => {
        // Update the project in the state
        state.projects = state.projects.map(proj =>
          proj.id === action.payload.id ? action.payload : proj
        );
        state.successMessage = `Project assignments for "${action.payload.name}" were updated by another user!`;
      });
  }
});

export const { resetMessages, resetSearch } = projectSlice.actions;
export default projectSlice.reducer;