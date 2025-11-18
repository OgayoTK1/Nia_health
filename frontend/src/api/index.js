// Authentication API
import api from './axios';

export const authAPI = {
  // Patient registration
  registerPatient: async (data) => {
    const response = await api.post('/auth/register/patient', data);
    return response.data;
  },

  // Patient login
  loginPatient: async (email, password) => {
    const response = await api.post('/auth/login/patient', { email, password });
    return response.data;
  },

  // Health worker login
  loginHealthWorker: async (email, password) => {
    const response = await api.post('/auth/login/health-worker', { email, password });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email, otp, userType = 'patient') => {
    const response = await api.post('/auth/verify-otp', { email, otp, userType });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email, userType = 'patient') => {
    const response = await api.post('/auth/resend-otp', { email, userType });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },
};

// Patient API
export const patientAPI = {
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/patients/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/patients/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/patients/statistics');
    return response.data;
  },
};

// Appointment API
export const appointmentAPI = {
  create: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getMyAppointments: async (params = {}) => {
    const response = await api.get('/appointments/my-appointments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/appointments/${id}/cancel`);
    return response.data;
  },

  updateStatus: async (id, status, notes) => {
    const response = await api.patch(`/appointments/${id}/status`, { status, notes });
    return response.data;
  },

  getClinicAppointments: async (clinicId, params = {}) => {
    const response = await api.get(`/appointments/clinic/${clinicId}`, { params });
    return response.data;
  },
};

// Referral API
export const referralAPI = {
  create: async (data) => {
    const response = await api.post('/referrals', data);
    return response.data;
  },

  getMyReferrals: async (params = {}) => {
    const response = await api.get('/referrals/my-referrals', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/referrals/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, notes, follow_up_date) => {
    const response = await api.patch(`/referrals/${id}/status`, {
      status,
      notes,
      follow_up_date,
    });
    return response.data;
  },

  getClinicReferrals: async (clinicId, params = {}) => {
    const response = await api.get(`/referrals/clinic/${clinicId}`, { params });
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/referrals/all', { params });
    return response.data;
  },
};

// Clinic API
export const clinicAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/clinics', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/clinics', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/clinics/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clinics/${id}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getAnalytics: async (period = '30') => {
    const response = await api.get('/admin/dashboard/analytics', {
      params: { period },
    });
    return response.data;
  },

  getAllPatients: async (params = {}) => {
    const response = await api.get('/admin/patients', { params });
    return response.data;
  },

  getAllHealthWorkers: async (params = {}) => {
    const response = await api.get('/admin/health-workers', { params });
    return response.data;
  },

  createAlert: async (data) => {
    const response = await api.post('/admin/alerts', data);
    return response.data;
  },

  getAllAlerts: async (params = {}) => {
    const response = await api.get('/admin/alerts', { params });
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  updateUserStatus: async (userId, userType, isActive) => {
    const response = await api.patch('/admin/users/status', {
      userId,
      userType,
      isActive,
    });
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  submit: async (data) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/feedback', { params });
    return response.data;
  },

  updateStatus: async (id, status, adminResponse) => {
    const response = await api.patch(`/feedback/${id}`, { status, admin_response: adminResponse });
    return response.data;
  },
};
