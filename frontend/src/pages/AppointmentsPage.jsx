import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentAPI, clinicAPI } from '../api';
import { AppointmentForm, Toast } from '../components';
import ConfirmModal from '../components/ConfirmModal';
import { Calendar, Clock, MapPin, ArrowLeft, Plus } from 'lucide-react';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  // Booking form state handled inside AppointmentForm component
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, clinicsRes] = await Promise.all([
        appointmentAPI.getMyAppointments(),
        clinicAPI.getAll({ is_active: true })
      ]);
      setAppointments(appointmentsRes.data || []);
      setClinics(clinicsRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // handleSubmit removed; using handleFormSubmit instead

  const handleFormSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      setIsSubmitting(true);
      await appointmentAPI.create(data);
      setSuccess('✓ Appointment booked successfully! Check your email for confirmation.');
      setShowBookingForm(false);
      setTimeout(() => loadData(), 500);
    } catch (err) {
      console.error('Appointment booking error:', err);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = (id) => {
    setCancelId(id);
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    setError('');
    setSuccess('');
    try {
      await appointmentAPI.cancel(cancelId);
      setSuccess('Appointment cancelled successfully');
      setCancelId(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelModalClose = () => {
    setCancelId(null);
    setCancelLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-primary-600">My Appointments</h1>
                <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
              </div>
            </div>
            <button
              onClick={() => setShowBookingForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Book Appointment
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        <div className="space-y-3 mb-6">
          {error && (
            <Toast
              message={error}
              type="error"
              duration={6000}
              onClose={() => setError('')}
            />
          )}
          {success && (
            <Toast
              message={success}
              type="success"
              duration={5000}
              onClose={() => setSuccess('')}
            />
          )}
        </div>

        {/* Booking Form Modal */}
        <AppointmentForm
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
          clinics={clinics}
        />

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-600 mb-6">Book your first appointment to get started</p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {appointment.clinic_name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{appointment.clinic_location}</span>
                      </div>
                      {appointment.reason && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Reason:</span> {appointment.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancelClick(appointment.id)}
                      className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={cancelLoading && cancelId === appointment.id}
                      title={cancelLoading && cancelId === appointment.id ? 'Cancelling...' : 'Cancel Appointment'}
                    >
                      {cancelLoading && cancelId === appointment.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <ConfirmModal
          isOpen={!!cancelId}
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment? This action cannot be undone."
          onConfirm={handleCancelConfirm}
          onCancel={handleCancelModalClose}
          loading={cancelLoading}
        />
      </main>
    </div>
  );
};

export default AppointmentsPage;
