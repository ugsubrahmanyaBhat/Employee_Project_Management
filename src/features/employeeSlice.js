// employeeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabase/SupabaseClient";

// Set up real-time subscriptions
export const setupRealtimeSubscriptions = createAsyncThunk(
  "employee/setupRealtimeSubscriptions",
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
      .channel('project-employee-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'project_employee' 
      }, (payload) => {
        console.log('Project-Employee relation change received:', payload);
        
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
  "employee/fetchEmployeeWithProjects",
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

// Fetch all employees
export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (_, { rejectWithValue }) => {
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
        `);

      if (error) throw error;
      
      const formattedData = data.map((employee) => ({
        ...employee,
        projects: employee.project_employee.map(pe => pe.Projects) || [],
      }));
      
      return formattedData;
    } catch (error) {
      return rejectWithValue("Failed to fetch employees");
    }
  }
);

// Fetch all projects
export const fetchProjects = createAsyncThunk(
  "employee/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("Projects").select("id, name");
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue("Failed to fetch projects");
    }
  }
);

// Add employee
export const addEmployee = createAsyncThunk(
  "employee/addEmployee",
  async (employeeName, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .insert([{ name: employeeName.trim() }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add employee");
    }
  }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      // First delete from project_employee table
      const { error: relationError } = await supabase
        .from("project_employee")
        .delete()
        .eq("emp_id", id);
      
      if (relationError) throw relationError;
      
      // Then delete the employee
      const { error } = await supabase
        .from("Employee")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete employee");
    }
  }
);

// Update employee
export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("Employee")
        .update({ name })
        .eq("id", id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update employee");
    }
  }
);

// Assign projects to employee
export const assignProjects = createAsyncThunk(
  "employee/assignProjects",
  async ({ employeeId, projectIds }, { rejectWithValue }) => {
    try {
      // First delete existing assignments
      const { error: deleteError } = await supabase
        .from("project_employee")
        .delete()
        .eq("emp_id", employeeId);
      
      if (deleteError) throw deleteError;
      
      // Then insert new assignments if there are any
      if (projectIds.length > 0) {
        const { error: insertError } = await supabase
          .from("project_employee")
          .insert(
            projectIds.map(projectId => ({
              emp_id: employeeId,
              project_id: projectId
            }))
          );
        
        if (insertError) throw insertError;
      }
      
      // Return updated employee with projects
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
      return rejectWithValue(error.message || "Failed to assign projects");
    }
  }
);

// Remove projects from employee
export const removeProjects = createAsyncThunk(
  "employee/removeProjects",
  async ({ employeeId, projectIds }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("project_employee")
        .delete()
        .in("project_id", projectIds)
        .eq("emp_id", employeeId);
      
      if (error) throw error;
      
      // Return updated employee with projects
      const { data, error: fetchError } = await supabase
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
      
      if (fetchError) throw fetchError;
      
      return {
        ...data,
        projects: data.project_employee.map(pe => pe.Projects) || [],
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove projects");
    }
  }
);

// Search employees
export const searchEmployees = createAsyncThunk(
  "employee/searchEmployees",
  async (searchTerm, { rejectWithValue }) => {
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
        .ilike("name", `%${searchTerm}%`);
      
      if (error) throw error;
      
      const formattedData = data.map((employee) => ({
        ...employee,
        projects: employee.project_employee.map(pe => pe.Projects) || [],
      }));
      
      return formattedData;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to search employees");
    }
  }
);

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    employees: [],
    projects: [],
    selectedEmployee: null,
    loading: false,
    error: null,
    successMessage: "",
    showEditForm: false,
    showAssignForm: false,
    showRemoveForm: false,
    realtimeSubscriptions: null,
    realtimeConnected: false,
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = "";
      state.error = null;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setShowEditForm: (state, action) => {
      state.showEditForm = action.payload;
    },
    setShowAssignForm: (state, action) => {
      state.showAssignForm = action.payload;
    },
    setShowRemoveForm: (state, action) => {
      state.showRemoveForm = action.payload;
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
          ? { ...emp, name: action.payload.name } 
          : emp
      );
      state.successMessage = `Employee "${action.payload.name}" updated by another user!`;
    },
    handleEmployeeDeleted: (state, action) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
      state.successMessage = "An employee was deleted by another user!";
    },
  },
  extraReducers: (builder) => {
    builder
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
        
        // If this is the selected employee, update that too
        if (state.selectedEmployee && state.selectedEmployee.id === action.payload.id) {
          state.selectedEmployee = action.payload;
        }
        
        state.successMessage = `Project assignments for "${action.payload.name}" were updated by another user!`;
      })
      
      // Handle fetchEmployees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle addEmployee
      .addCase(addEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.loading = false;
        // With real-time, this will be handled by the subscription
        state.successMessage = `Employee "${action.payload.name}" added successfully!`;
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle deleteEmployee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        // With real-time, this will be handled by the subscription
        state.successMessage = "Employee deleted successfully!";
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle updateEmployee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        // With real-time, this will be handled by the subscription
        state.successMessage = `Employee "${action.payload.name}" updated successfully!`;
        state.showEditForm = false;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle assignProjects
      .addCase(assignProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignProjects.fulfilled, (state, action) => {
        state.loading = false;
        // With real-time, this will be handled by the subscription
        state.successMessage = "Projects assigned successfully!";
        state.showAssignForm = false;
      })
      .addCase(assignProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle removeProjects
      .addCase(removeProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProjects.fulfilled, (state, action) => {
        state.loading = false;
        // With real-time, this will be handled by the subscription
        state.successMessage = "Projects removed successfully!";
        state.showRemoveForm = false;
      })
      .addCase(removeProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle searchEmployees
      .addCase(searchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(searchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearMessages,
  setSelectedEmployee,
  setShowEditForm,
  setShowAssignForm,
  setShowRemoveForm,
  handleEmployeeInserted,
  handleEmployeeUpdated,
  handleEmployeeDeleted
} = employeeSlice.actions;

export default employeeSlice.reducer;