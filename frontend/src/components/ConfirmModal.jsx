// React import not required with new JSX transform

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
