# Appointment Booking Feature

## Overview
The appointment booking feature allows patients to schedule healthcare appointments at registered clinics within the NiaHealth system.

## Components

### AppointmentForm Component (`src/components/AppointmentForm.jsx`)
A reusable modal form component for booking appointments with the following features:

**Props:**
- `isOpen` (boolean): Controls visibility of the form
- `onClose` (function): Callback when form is closed
- `onSubmit` (function): Callback when form is submitted with valid data
- `isLoading` (boolean): Shows loading state during submission
- `clinics` (array): List of available clinics
- `errors` (object): Form validation errors

**Features:**
- Form validation for all required fields
- Date validation (prevents past dates)
- Character limit for reason field (500 characters)
- Real-time error messages
- Loading spinner during submission
- Disabled state during submission
- Clean, accessible UI with Tailwind CSS

**Form Fields:**
1. **Clinic Selection** (required) - Dropdown of active clinics with location
2. **Appointment Date** (required) - Date picker with minimum date validation
3. **Appointment Time** (required) - Time picker
4. **Reason for Visit** (required) - Textarea with character counter

### AppointmentsPage Component (`src/pages/AppointmentsPage.jsx`)
The main appointments management page with the following features:

**Features:**
- Display list of user's appointments
- Filter and sort appointments by status
- Book new appointments
- Cancel appointments (if in scheduled/confirmed status)
- Real-time status updates
- Loading states
- Error and success notifications
- Responsive design

**Appointment Statuses:**
- `scheduled`: Initial booking status
- `confirmed`: Appointment confirmed by clinic
- `completed`: Appointment completed
- `cancelled`: Appointment cancelled by user
- `no-show`: Patient didn't show up

## How to Use

### Booking an Appointment

1. **Navigate to Appointments Page**
   - Click "Appointments" in the navigation menu
   - Or click "Book Appointment" button from the dashboard

2. **Click "Book Appointment" Button**
   - Opens the appointment booking modal

3. **Fill in the Form**
   - **Select Clinic**: Choose from available active clinics
   - **Date**: Select a future date
   - **Time**: Select appointment time
   - **Reason**: Describe your health concern (required)

4. **Submit**
   - Click "Book Appointment" button
   - Wait for confirmation

5. **Confirmation**
   - Success message appears
   - Email confirmation sent to patient
   - Appointment appears in list

### Cancelling an Appointment

1. **Go to Appointments Page**
2. **Find the Appointment**
3. **Click Cancel Button**
   - Only available for scheduled/confirmed appointments
   - Confirmation dialog appears
4. **Confirm Cancellation**
   - Appointment status changes to cancelled

## API Integration

### Create Appointment
```javascript
POST /api/appointments
Authorization: Bearer <token>

Body:
{
  "clinic_id": 1,
  "appointment_date": "2025-11-25",
  "appointment_time": "10:30",
  "reason": "General checkup"
}

Response (201):
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": 1,
    "clinic_id": 1,
    "appointment_date": "2025-11-25",
    "appointment_time": "10:30:00",
    "status": "scheduled"
  }
}
```

### Get My Appointments
```javascript
GET /api/appointments/my-appointments?page=1&limit=10
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "clinic_id": 1,
      "clinic_name": "Nairobi Community Clinic",
      "clinic_location": "Nairobi, Kibera",
      "clinic_contact": "+254712345678",
      "appointment_date": "2025-11-25",
      "appointment_time": "10:30:00",
      "reason": "General checkup",
      "status": "scheduled",
      "created_at": "2025-11-17T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Cancel Appointment
```javascript
DELETE /api/appointments/:id/cancel
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

## State Management

### Local State Variables
- `appointments`: Array of user's appointments
- `clinics`: Array of available clinics
- `loading`: Page loading state
- `showBookingForm`: Modal visibility
- `formData`: Current form values
- `formErrors`: Form validation errors
- `isSubmitting`: Form submission state
- `error`: Error message
- `success`: Success message

## Validation Rules

**Clinic ID:**
- Required field
- Must be a valid clinic ID

**Date:**
- Required field
- Must be a future date (today or later)
- Format: YYYY-MM-DD

**Time:**
- Required field
- Format: HH:MM (24-hour)

**Reason:**
- Required field
- Non-empty string
- Maximum 500 characters

## Error Handling

The component handles various error scenarios:

1. **Network Errors**: Displays error message from API response
2. **Validation Errors**: Shows field-specific error messages
3. **Clinic Loading Errors**: Displays message if clinics can't be loaded
4. **Appointment Loading Errors**: Displays message if appointments can't be loaded

## Toast Notifications

Success and error messages are displayed using the Toast component:

- **Success**: Green background, auto-dismisses after 5 seconds
- **Error**: Red background, auto-dismisses after 6 seconds
- **Manual Dismiss**: Click X button to close immediately

## Responsive Design

- **Desktop**: Full appointment list with modal form
- **Tablet**: Optimized layout with touch-friendly buttons
- **Mobile**: Stack layout with responsive form modal

## Accessibility Features

- Semantic HTML structure
- ARIA labels for form fields
- Keyboard navigation support
- Focus management in modal
- Color contrast compliant
- Error messages linked to fields

## Testing

### Manual Testing Checklist
- [ ] Load appointments page
- [ ] Click "Book Appointment" button
- [ ] Form opens correctly
- [ ] Clinic dropdown populates
- [ ] Date picker works (no past dates)
- [ ] Time picker works
- [ ] Validation errors show on empty submission
- [ ] Successful submission books appointment
- [ ] Appointment appears in list
- [ ] Cancel button works
- [ ] Success/error messages display
- [ ] Mobile responsive layout works

### Edge Cases
- Booking at minimum date
- Timezone handling
- Network errors during submission
- Multiple rapid submissions
- Cancelling already cancelled appointment
- Very long reason text

## Future Enhancements

1. **Appointment Scheduling**
   - Show available time slots per clinic
   - Prevent double-booking
   - Clinic working hours validation

2. **Reminder System**
   - Email reminders before appointment
   - SMS notifications
   - In-app notifications

3. **Rescheduling**
   - Allow users to reschedule appointments
   - Show available slots
   - Track reschedule history

4. **Advanced Filtering**
   - Filter by clinic
   - Filter by status
   - Date range filtering

5. **Calendar View**
   - Visual calendar of appointments
   - Drag-and-drop rescheduling
   - Week/month view options

## Troubleshooting

### "No clinics available"
- Ensure clinics are created and marked as active
- Check backend database for clinic records

### "Failed to book appointment"
- Check API connection
- Verify backend is running
- Check browser console for errors
- Ensure valid token in localStorage

### Form not clearing after submission
- Check handleFormSubmit callback
- Verify form reset logic
- Check browser console for errors

### Appointments not loading
- Ensure user is authenticated
- Check token validity
- Verify API endpoint is working
- Check backend logs

## Code Structure

```
frontend/src/
├── pages/
│   └── AppointmentsPage.jsx      # Main appointments page
├── components/
│   ├── AppointmentForm.jsx       # Booking form component
│   ├── Toast.jsx                 # Notification component
│   ├── Header.jsx                # Navigation header
│   └── index.js                  # Component exports
├── api/
│   └── index.js                  # API endpoints
└── contexts/
    └── AuthContext.jsx           # Authentication context
```

## Notes

- Appointments require authentication (JWT token)
- Only patients can book appointments
- Health workers can view and update appointment statuses
- Admin can manage all appointments
- Emails are sent on appointment confirmation
- All times are in local timezone
