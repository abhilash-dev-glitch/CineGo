import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../lib/api';

// Async thunks
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data?.data?.user || null;
    } catch (error) {
      // Return null for user when not authenticated
      return rejectWithValue(null);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await api.post('/auth/login', { email, password });
      const { data } = await api.get('/auth/me');
      return data?.data?.user || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      await api.post('/auth/register', userData);
      const { data } = await api.get('/auth/me');
      return data?.data?.user || null;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || null
      });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
    // Clear token from localStorage
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Logout error:', error);
    // Clear token even if logout request fails
    localStorage.removeItem('authToken');
  }
});

// Load initial state from localStorage if available
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading auth state from localStorage:', err);
    return undefined;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadState() || {
    user: null,
    loading: false,
    error: null,
    errors: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    // checkAuth
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.loading = false;
      state.user = action.payload; // This will be null from our updated thunk
      state.error = 'Not authenticated';
    });

    // login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errors = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
    });

    // register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.errors = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Registration failed';
      state.errors = action.payload?.errors || null;
    });

    // logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
    });
  },
});

// Middleware to save auth state to localStorage
const saveAuthState = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type.startsWith('auth/')) {
    const state = store.getState().auth;
    try {
      const serializedState = JSON.stringify({
        user: state.user,
        // Don't persist loading/error states
      });
      localStorage.setItem('authState', serializedState);
    } catch (err) {
      console.error('Error saving auth state to localStorage:', err);
    }
  }
  return result;
};

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

export { saveAuthState };
