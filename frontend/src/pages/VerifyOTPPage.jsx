import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthUser } = useAuth();
  const email = location.state?.email || localStorage.getItem('pendingVerification');
  const message = location.state?.message;
  const userType = location.state?.userType || 'patient'; // Get userType from location state

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp: otpCode,
        userType
      });

      if (response.data.success) {
        // Clear pending verification
        localStorage.removeItem('pendingVerification');
        
        // For health workers, log them in with the tokens
        if (userType === 'health-worker' && response.data.data) {
          const { accessToken, refreshToken, user } = response.data.data;
          
          // Store tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update auth context
          setAuthUser(user);
          
          setSuccess('Login successful! Redirecting to dashboard...');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // For patients, redirect to login
          setSuccess('Email verified successfully! Redirecting to login...');
          
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email verified! Please login to continue.',
                email 
              } 
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(
        error.response?.data?.message || 
        'Invalid OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const response = await api.post('/auth/resend-otp', { 
        email,
        userType: userType || 'patient'
      });

      if (response.data.success) {
        setSuccess('New OTP sent to your email!');
        setResendCooldown(60); // 60 seconds cooldown
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to resend OTP. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 text-sm">
            We&apos;ve sent a 6-digit code to
          </p>
          <p className="text-primary-600 font-semibold">{email}</p>
        </div>

        {/* Success Message */}
        {message && !error && !success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm text-center">{message}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm text-center">{success}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label htmlFor="otp-0" className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-2" role="group" aria-label="One-time password input">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  autoComplete="one-time-code"
                  aria-label={`Digit ${index + 1} of 6`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              isLoading || otp.join('').length !== 6
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
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Didn&apos;t receive the code?</p>
            {resendCooldown > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend available in <span className="font-semibold">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm disabled:text-gray-400"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          {/* Back to Register */}
          <div className="text-center pt-4 border-t">
            <Link 
              to="/register" 
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to Registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
