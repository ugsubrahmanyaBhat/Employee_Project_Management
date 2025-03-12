import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabase/SupabaseClient";

// Load session from localStorage (if exists)
const savedSession = JSON.parse(localStorage.getItem("authSession")) || null;

// Async action to check session
export const checkSession = createAsyncThunk("auth/checkSession", async () => {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
});

// Async action for signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ email, password }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return rejectWithValue(error.message);
    localStorage.setItem("authSession", JSON.stringify(data.session));  // ✅ Save session
    return data.session || null;
  }
);

// Async action for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return rejectWithValue(error.message);
    localStorage.setItem("authSession", JSON.stringify(data.session));  // ✅ Save session
    return data.session || null;
  }
);

// Async action for logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("authSession");  // ✅ Remove session on logout
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    session: savedSession,  // ✅ Load session from storage
    loading: false,
    error: null,
  },
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.session = null;
      });
  },
});

export default authSlice.reducer;
