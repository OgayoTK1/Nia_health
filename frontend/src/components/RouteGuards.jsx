import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Generic auth requirement
export const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null; // Could render a spinner component
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

// Patient only
export const RequirePatient = ({ children }) => {
  const { user } = useAuth();
  if (user?.userType !== 'patient') return <Navigate to="/dashboard" replace />;
  return children;
};

// Admin only
export const RequireAdmin = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Health worker (includes admin for convenience)
export const RequireHealthWorker = ({ children }) => {
  const { user } = useAuth();
  if (!(user?.userType === 'health_worker' || user?.role === 'health_worker' || user?.role === 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default {
  RequireAuth,
  RequirePatient,
  RequireAdmin,
  RequireHealthWorker
};
