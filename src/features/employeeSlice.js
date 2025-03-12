import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabase/SupabaseClient";

// Async thunk for fetching employees
export const fetchEmployeesAsync = createAsyncThunk(
  "employees/fetchEmployeesAsync",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .select("id, name, project_employee ( project_id, Projects ( id, name ) )");
      if (error) throw error;
      const formattedData = data.map((employee) => ({
        ...employee,
        projects: employee.project_employee.map(pe => pe.Projects) || [],
      }));
      return formattedData;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch employees.");
    }
  }
);

// Async thunk for fetching projects
export const fetchProjectsAsync = createAsyncThunk(
  "employees/fetchProjectsAsync",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Projects")
        .select("id, name");
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch projects.");
    }
  }
);

// Async thunk for adding an employee
export const addEmployeeAsync = createAsyncThunk(
  "employees/addEmployeeAsync",
  async (employeeName, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .insert([{ name: employeeName.trim() }])
        .select();
      if (error) throw error;
      return data[0]; // Return the new employee
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create employee.");
    }
  }
);

// Async thunk for deleting an employee
export const deleteEmployeeAsync = createAsyncThunk(
  "employees/deleteEmployeeAsync",
  async (employeeId, { rejectWithValue }) => {
    try {
      // First delete related records from project_employee
      const { error: relatedError } = await supabase
        .from("project_employee")
        .delete()
        .eq("emp_id", employeeId);
      if (relatedError) throw relatedError;
      // Then delete the employee
      const { error } = await supabase
        .from("Employee")
        .delete()
        .eq("id", employeeId);
      if (error) throw error;
      return employeeId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete employee.");
    }
  }
);

// Async thunk for updating an employee
export const updateEmployeeAsync = createAsyncThunk(
  "employees/updateEmployeeAsync",
  async ({ employeeId, name }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .update({ name: name.trim() })
        .eq("id", employeeId)
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update employee.");
    }
  }
);

// Async thunk for assigning projects to an employee
export const assignProjectsAsync = createAsyncThunk(
  "employees/assignProjectsAsync",
  async ({ employeeId, projectIds }, { rejectWithValue, dispatch }) => {
    try {
      // First delete existing assignments
      const { error: deleteError } = await supabase
        .from("project_employee")
        .delete()
        .eq("emp_id", employeeId);
      if (deleteError) throw deleteError;
      // Then create new assignments
      if (projectIds.length > 0) {
        const assignmentsToInsert = projectIds.map(projectId => ({
          emp_id: employeeId,
          project_id: projectId
        }));
        const { error: insertError } = await supabase
          .from("project_employee")
          .insert(assignmentsToInsert);
        if (insertError) throw insertError;
      }
      // Fetch updated employee data
      dispatch(fetchEmployeesAsync());
      return { employeeId, projectIds };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to assign projects.");
    }
  }
);

// Async thunk for removing projects from an employee
export const removeProjectsAsync = createAsyncThunk(
  "employees/removeProjectsAsync",
  async ({ employeeId, projectIdsToRemove }, { rejectWithValue, dispatch }) => {
    try {
      const { error } = await supabase
        .from("project_employee")
        .delete()
        .match({ emp_id: employeeId })
        .in("project_id", projectIdsToRemove);
      if (error) throw error;
      // Fetch updated employee data
      dispatch(fetchEmployeesAsync());
      return { employeeId, projectIdsToRemove };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove projects.");
    }
  }
);

// Async thunk for searching employees
export const searchEmployeesAsync = createAsyncThunk(
  "employees/searchEmployeesAsync",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .select("id, name, project_employee ( project_id, Projects ( id, name ) )")
        .ilike("name", `%${searchTerm}%`);
      if (error) throw error;
      const formattedData = data.map((employee) => ({
        ...employee,
        projects: employee.project_employee.map(pe => pe.Projects) || [],
      }));
      return formattedData;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to search employees.");
    }
  }
);

// Async thunk for setting up real-time subscriptions
export const setupRealtimeSubscriptions = createAsyncThunk(
  "employees/setupRealtimeSubscriptions",
  async (_, { dispatch }) => {
    // Subscribe to Employee table changes
    const employeeSubscription = supabase
      .channel('employee-changes')
      .on('postgres_changes', {
        event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'Employee'
      }, (payload) => {
        console.log('Employee change received:', payload);
        // Handle the different event types
        if (payload.eventType === 'INSERT') {
          dispatch(handleEmployeeInserted(payload.new));
        } else if (payload.eventType === 'UPDATE') {
          dispatch(handleEmployeeUpdated(payload.new));
        } else if (payload.eventType === 'DELETE') {
          dispatch(handleEmployeeDeleted(payload.old.id));
        }
      })
      .subscribe();

    // Subscribe to project_employee table changes
    const projectEmployeeSubscription = supabase
      .channel('employee-project-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_employee'
      }, (payload) => {
        console.log('Employee-Project relation change received:', payload);
        // When project assignments change, fetch the updated employee data
        if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
          dispatch(fetchEmployeeWithProjects(payload.new?.emp_id || payload.old?.emp_id));
        }
      })
      .subscribe();

    // Return the subscriptions so they can be unsubscribed later if needed
    return { employeeSubscription, projectEmployeeSubscription };
  }
);

// Fetch a single employee with projects (used for real-time updates)
export const fetchEmployeeWithProjects = createAsyncThunk(
  "employees/fetchEmployeeWithProjects",
  async (employeeId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .select(`
          id,
          name,
          project_employee (
            project_id,
            Projects ( id, name )
          )
        `)
        .eq("id", employeeId)
        .single();
      if (error) throw error;
      return {
        ...data,
        projects: data.project_employee.map(pe => pe.Projects) || [],
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch employee with projects");
    }
  }
);

const initialState = {
  employees: [],
  projects: [],
  loading: false,
  error: null,
  successMessage: "",
  searchResults: [],
  isSearching: false,
  realtimeSubscriptions: null,
  realtimeConnected: false
};

const employeeSlice = createSlice({
  name: "employees",
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
    handleEmployeeInserted: (state, action) => {
      // Check if employee already exists to avoid duplicates
      const employeeExists = state.employees.some(emp => emp.id === action.payload.id);
      if (!employeeExists) {
        state.employees.push({
          ...action.payload,
          projects: []
        });
        state.successMessage = `Employee "${action.payload.name}" added by another user!`;
      }
    },
    handleEmployeeUpdated: (state, action) => {
      state.employees = state.employees.map(emp =>
        emp.id === action.payload.id
          ? { ...action.payload, projects: emp.projects }
          : emp
      );
      state.successMessage = `Employee "${action.payload.name}" updated by another user!`;
    },
    handleEmployeeDeleted: (state, action) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
      state.successMessage = "An employee was deleted by another user!";
    }
  },
  extraReducers: (builder) => {
    builder
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
      // Add employee cases
      .addCase(addEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(addEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.push(action.payload);
        state.successMessage = `Employee "${action.payload.name}" created successfully!`;
      })
      .addCase(addEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete employee cases
      .addCase(deleteEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(employee => employee.id !== action.payload);
        state.successMessage = "Employee deleted successfully!";
      })
      .addCase(deleteEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update employee cases
      .addCase(updateEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(employee => employee.id === action.payload.id);
        if (index !== -1) {
          // Preserve projects array when updating
          const projects = state.employees[index].projects;
          state.employees[index] = { ...action.payload, projects };
        }
        state.successMessage = `Employee "${action.payload.name}" updated successfully!`;
      })
      .addCase(updateEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign projects cases
      .addCase(assignProjectsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(assignProjectsAsync.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Projects assigned successfully!";
      })
      .addCase(assignProjectsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove projects cases
      .addCase(removeProjectsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(removeProjectsAsync.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Projects removed successfully!";
      })
      .addCase(removeProjectsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search employees cases
      .addCase(searchEmployeesAsync.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchEmployeesAsync.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchEmployeesAsync.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      // Handle real-time subscriptions
      .addCase(setupRealtimeSubscriptions.fulfilled, (state, action) => {
        state.realtimeSubscriptions = action.payload;
        state.realtimeConnected = true;
      })
      // Handle fetchEmployeeWithProjects (for real-time updates)
      .addCase(fetchEmployeeWithProjects.fulfilled, (state, action) => {
        // Update the employee in the state
        state.employees = state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        );
        state.successMessage = `Employee assignments for "${action.payload.name}" were updated by another user!`;
      });
  }
});

export const { resetMessages, resetSearch } = employeeSlice.actions;
export default employeeSlice.reducer;