import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthUser } = useAuth();
  const hasInitialized = useRef(false);
  
  // Get any messages passed from registration/verification (only on first render)
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    // Only initialize once
    if (!hasInitialized.current && location.state) {
      setLocationMessage(typeof location.state?.message === 'string' ? location.state.message : '');
  const email = typeof location.state?.email === 'string' ? location.state.email : '';
  setFormData(prev => ({ ...prev, email }));
      hasInitialized.current = true;
      // Clear the location state from history
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  const [userType, setUserType] = useState('patient'); // 'patient', 'health-worker' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Set success message when locationMessage changes
  useEffect(() => {
    setSuccessMessage(locationMessage);
  }, [locationMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    // Trim inputs before validation to avoid invisible whitespace issues
    const emailTrimmed = (formData.email || '').trim();
    const passwordTrimmed = (formData.password || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!passwordTrimmed) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    // Prevent double submissions
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    // Prepare trimmed payload to avoid invisible whitespace issues
    const payload = {
      email: (formData.email || '').trim(),
      password: (formData.password || '').trim()
    };

    setIsLoading(true);

    try {
      const endpoint = userType === 'patient'
        ? '/auth/login/patient'
        : userType === 'health-worker'
          ? '/auth/login/health-worker'
          : '/auth/login/admin';

      console.log('Sending login data:', payload, 'endpoint:', endpoint);

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        // Check if OTP is required (for health workers)
        if (response.data.requiresOTP) {
          setSuccessMessage('OTP sent to your email. Please verify to complete login.');
          
          // Redirect to OTP verification after 1 second
          setTimeout(() => {
            navigate('/verify-otp', { 
              state: { 
                email: formData.email,
                userType: userType,
                message: 'Please enter the OTP sent to your email.' 
              } 
            });
          }, 1000);
          return;
        }

        const { accessToken, refreshToken, user } = response.data.data;

        console.log('✅ Login successful, storing tokens...');
        
        // Store tokens and user data FIRST
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        console.log('✅ Tokens stored, redirecting to dashboard...');

        // THEN update auth context state
        setAuthUser(user);

        // Use window.location for full page reload to ensure token is available
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        // Account needs verification
        setApiError(error.response.data.message);
        
        // Redirect to OTP verification after 2 seconds
        setTimeout(() => {
          navigate('/verify-otp', { 
            state: { 
              email: formData.email,
              message: 'Please verify your account to login.' 
            } 
          });
        }, 2000);
      } else if (error.response?.status === 423) {
        // Account locked
        setApiError(
          error.response?.data?.message || 
          'Account temporarily locked due to multiple failed login attempts.'
        );
      } else {
        setApiError(
          error.response?.data?.message || 
          'Invalid email or password. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="NiaHealth Logo" className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold text-primary-600 mb-2">NiaHealth</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm text-center">{successMessage}</p>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{apiError}</p>
          </div>
        )}

        {/* User Type Selector */}
        <div className="mb-6">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                userType === 'patient'
                  ? 'bg-white text-primary-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setUserType('health-worker')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                userType === 'health-worker'
                  ? 'bg-white text-primary-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Health Worker
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                userType === 'admin'
                  ? 'bg-white text-primary-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Register Link */}
          {userType === 'patient' && (
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Register here
                </Link>
              </p>
            </div>
          )}

          {/* Health Worker Note */}
          {userType === 'health-worker' && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Health worker accounts are created by administrators.
              </p>
            </div>
          )}
        </form>

        {/* Back to Home */}
        <div className="text-center pt-6 mt-6 border-t">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
