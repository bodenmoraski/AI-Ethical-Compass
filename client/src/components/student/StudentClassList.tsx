import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Plus, Users, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import JoinClassModal from './JoinClassModal';

interface EnrolledClass {
  id: number;
  name: string;
  subject: string;
  grade_level: string;
  class_code: string;
  teacher_name: string;
  enrollment_date: string;
  student_count?: number;
}

export default function StudentClassList() {
  const { user, session } = useAuth();
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = session?.access_token;
      
      const response = await fetch('/api/student?action=classes', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchClasses();
    }
  }, [user, session]);

  const handleClassJoined = () => {
    // Refresh the class list
    fetchClasses();
    setShowJoinModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
          <p className="text-gray-600 mt-1">
            {classes.length} {classes.length === 1 ? 'class' : 'classes'} enrolled
          </p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Join Class
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && classes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Classes Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Join your first class using a class code from your teacher
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Join a Class
          </button>
        </div>
      )}

      {/* Class Grid */}
      {classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <JoinClassModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleClassJoined}
        />
      )}
    </div>
  );
}

function ClassCard({ classItem }: { classItem: EnrolledClass }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Class Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <h3 className="text-white font-semibold text-lg truncate">
          {classItem.name}
        </h3>
        <p className="text-blue-100 text-sm mt-1">{classItem.subject}</p>
      </div>

      {/* Class Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Users className="w-4 h-4" />
          <span>{classItem.teacher_name || 'Teacher'}</span>
        </div>

        {classItem.grade_level && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <BookOpen className="w-4 h-4" />
            <span>{classItem.grade_level}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            Joined{' '}
            {new Date(classItem.enrollment_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Class Code */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Class Code</span>
            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {classItem.class_code}
            </code>
          </div>
        </div>

        {/* View Class Button → student assignments for this enrollment */}
        <button
          type="button"
          onClick={() => navigate('/assignments')}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Assignments
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
