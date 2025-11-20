import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { referralAPI } from '../api';
import { FileText, MapPin, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import ReferralForm from '../components/ReferralForm';

const ReferralsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReferralForm, setShowReferralForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Block patients from accessing referrals page
    if (user?.userType === 'patient') {
      navigate('/dashboard');
      return;
    }
    loadReferrals();
  }, [isAuthenticated, user, navigate]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await referralAPI.getMyReferrals();
      setReferrals(response.data || []);
    } catch (err) {
      console.error('Error loading referrals:', err);
      setError('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyIcon = (urgency) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    return icons[urgency] || '🔵';
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              <ArrowLeft className="inline-block mr-2" /> Back
            </button>
            <h1 className="text-3xl font-bold text-primary-600">My Referrals</h1>
            <button
              className="btn btn-primary ml-auto"
              onClick={() => setShowReferralForm(true)}
            >
              + Refer Patient
            </button>
          </div>
        </div>
      </header>
      {showReferralForm && (
        <ReferralForm
          onClose={() => setShowReferralForm(false)}
          onSuccess={loadReferrals}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {referrals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No referrals yet</h3>
            <p className="text-gray-600">
              Medical referrals from your healthcare provider will appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {referrals.map((referral) => (
              <div key={referral.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(referral.urgency)}`}>
                        {getUrgencyIcon(referral.urgency)} {referral.urgency?.toUpperCase()} PRIORITY
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {referral.hospital_name}
                    </h3>
                    
                    <div className="space-y-3">
                      {referral.hospital_location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{referral.hospital_location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Referred on: {new Date(referral.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>

                      <div className="flex items-start gap-2 text-gray-600">
                        <FileText className="w-4 h-4 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-700">Referring Clinic:</p>
                          <p>{referral.clinic_name}</p>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="mb-2">
                          <p className="font-semibold text-gray-700 mb-1">Reason for Referral:</p>
                          <p className="text-gray-600">{referral.reason}</p>
                        </div>
                        
                        {referral.diagnosis && (
                          <div className="mt-3">
                            <p className="font-semibold text-gray-700 mb-1">Diagnosis:</p>
                            <p className="text-gray-600">{referral.diagnosis}</p>
                          </div>
                        )}

                        {referral.notes && (
                          <div className="mt-3">
                            <p className="font-semibold text-gray-700 mb-1">Additional Notes:</p>
                            <p className="text-gray-600">{referral.notes}</p>
                          </div>
                        )}

                        {referral.follow_up_date && (
                          <div className="mt-3">
                            <p className="font-semibold text-gray-700 mb-1">Follow-up Date:</p>
                            <p className="text-gray-600">
                              {new Date(referral.follow_up_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {referral.created_by_name && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-500">
                            Referred by: <span className="font-semibold">{referral.created_by_name}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Important Notice for High/Critical Urgency */}
                  {(referral.urgency === 'high' || referral.urgency === 'critical') && referral.status === 'pending' && (
                    <div className="lg:w-64">
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-900 mb-1">Urgent Action Required</p>
                            <p className="text-xs text-red-700">
                              Please contact {referral.hospital_name} immediately to schedule your appointment.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReferralsPage;
