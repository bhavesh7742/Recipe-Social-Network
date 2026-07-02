import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create configured Axios instance for requests
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.success) {
            setUser(res.data.user);
          } else {
            // Failed verification
            logout();
          }
        } catch (err) {
          console.error('Failed to load user session:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);

  // Register user
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { username, email, password });
      if (res.data && res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Request password reset PIN
  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      return {
        success: true,
        message: res.data.message,
        resetCode: res.data.resetCode // Propagated for testing in mock env
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Password reset request failed'
      };
    }
  };

  // Reset password using PIN
  const resetPassword = async (resetCode, password) => {
    try {
      const res = await api.post('/auth/resetpassword', { resetCode, password });
      return {
        success: true,
        message: res.data.message
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Password reset failed'
      };
    }
  };

  // Update profile details
  const updateProfile = async (bio, profilePicture) => {
    try {
      const res = await api.put('/users/profile', { bio, profilePicture });
      if (res.data && res.data.success) {
        setUser((prev) => ({
          ...prev,
          bio: res.data.user.bio,
          profilePicture: res.data.user.profilePicture
        }));
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Profile update failed'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
