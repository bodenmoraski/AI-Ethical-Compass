import { useState } from 'react';
import { X, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface JoinClassModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinClassModal({ onClose, onSuccess }: JoinClassModalProps) {
  const { session } = useAuth();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [joinedClass, setJoinedClass] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/student?action=join-class`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            class_code: classCode.trim().toUpperCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join class');
      }

      // Success!
      setSuccess(true);
      setJoinedClass(data.enrollment);
      
      // Close after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Error joining class:', err);
      setError(err.message || 'Failed to join class. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Join a Class</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Class Code
                </label>
                <input
                  type="text"
                  id="classCode"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider uppercase"
                  maxLength={10}
                  disabled={loading}
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter the class code provided by your teacher
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !classCode.trim()}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Joining...
                    </span>
                  ) : (
                    'Join Class'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Successfully Joined!
              </h3>
              <p className="text-gray-600">
                {joinedClass?.class_name && (
                  <>You're now enrolled in <strong>{joinedClass.class_name}</strong></>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to your classes...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

