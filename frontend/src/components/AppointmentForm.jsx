import { useState } from 'react';
import { X } from 'lucide-react';

const AppointmentForm = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  clinics
}) => {
  const [formData, setFormData] = useState({
    clinic_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });

  const [localErrors, setLocalErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clinic_id) {
      newErrors.clinic_id = 'Please select a clinic';
    }
    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Please select a date';
    }
    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Please select a time';
    }
    if (!formData.reason || formData.reason.trim() === '') {
      newErrors.reason = 'Please provide a reason for your visit';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
    
    // Reset form after successful submission
    setFormData({
      clinic_id: '',
      appointment_date: '',
      appointment_time: '',
      reason: ''
    });
    setLocalErrors({});
  };

  const handleClose = () => {
    setFormData({
      clinic_id: '',
      appointment_date: '',
      appointment_time: '',
      reason: ''
    });
    setLocalErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (localErrors[field]) {
      setLocalErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-600 mt-1">Schedule a visit to a clinic</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Clinic Selection */}
          <div>
            <label htmlFor="clinic_id" className="block text-sm font-medium text-gray-700 mb-2">
              Select Clinic <span className="text-red-500">*</span>
            </label>
            <select
              id="clinic_id"
              name="clinic_id"
              value={formData.clinic_id}
              onChange={(e) => handleInputChange('clinic_id', e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                localErrors.clinic_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose a clinic...</option>
              {clinics && clinics.length > 0 ? (
                clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name} - {clinic.location}
                  </option>
                ))
              ) : (
                <option disabled>No clinics available</option>
              )}
            </select>
            {localErrors.clinic_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block">⚠</span>
                {localErrors.clinic_id}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="appointment_date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={(e) => handleInputChange('appointment_date', e.target.value)}
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                localErrors.appointment_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {localErrors.appointment_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block">⚠</span>
                {localErrors.appointment_date}
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="appointment_time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={(e) => handleInputChange('appointment_time', e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                localErrors.appointment_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {localErrors.appointment_time && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block">⚠</span>
                {localErrors.appointment_time}
              </p>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              disabled={isLoading}
              placeholder="Describe your health concern, symptoms, or reason for visiting the clinic..."
              rows="4"
              maxLength="500"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                localErrors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {localErrors.reason && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block">⚠</span>
                {localErrors.reason}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length}/500 characters
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors ${
                isLoading ? 'cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Booking...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Book Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
