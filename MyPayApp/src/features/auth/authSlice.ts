import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // Mock login - replace with actual API call
    if (credentials.email === 'user@example.com' && credentials.password === 'password') {
      const authToken = {
        id: 'token-1',
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };

      // Store token securely
      await Keychain.setInternetCredentials(
        'auth-token',
        'auth-token',
        JSON.stringify(authToken)
      );

      return {
        token: authToken.token,
        user: {
          id: 'user-1',
          email: credentials.email,
          name: 'John Doe',
        },
      };
    }
    throw new Error('Invalid credentials');
  }
);

export const authenticateWithBiometrics = createAsyncThunk(
  'auth/authenticateWithBiometrics',
  async () => {
    // Mock biometric login - replace with actual biometric authentication
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'John Doe',
    };

    return {
      token: 'mock-biometric-token',
      user,
    };
  }
);

export const enableBiometrics = createAsyncThunk(
  'auth/enableBiometrics',
  async () => {
    // Mock enabling biometrics - replace with actual biometric setup
    return true;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Clear stored token
    await Keychain.resetInternetCredentials('auth-token');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setBiometricEnabled: (state, action) => {
      state.biometricEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Biometric login
      .addCase(authenticateWithBiometrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateWithBiometrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(authenticateWithBiometrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Biometric login failed';
      })
      // Enable biometrics
      .addCase(enableBiometrics.fulfilled, (state, action) => {
        state.biometricEnabled = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.biometricEnabled = false;
      });
  },
});

export const { clearError, setBiometricEnabled } = authSlice.actions;
export default authSlice.reducer;
