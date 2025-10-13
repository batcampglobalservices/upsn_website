import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { classAPI, resultAPI, sessionAPI } from '../api/axios';
import ScoreEntry from '../components/ScoreEntry';
import SubjectManager from '../components/SubjectManager';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      const teacherClasses = response.data.results || response.data;
      setClasses(teacherClasses);
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]);
        fetchStudents(teacherClasses[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await classAPI.getStudents(classId);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleClassChange = (classItem) => {
    setSelectedClass(classItem);
    fetchStudents(classItem.id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.full_name}</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <p>Loading...</p>
        ) : classes.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-600">No classes assigned to you yet.</p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('classes')}
                  className={`flex-1 px-6 py-4 text-center font-semibold ${
                    activeTab === 'classes'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  My Classes
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`flex-1 px-6 py-4 text-center font-semibold ${
                    activeTab === 'subjects'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Manage Subjects
                </button>
                <button
                  onClick={() => setActiveTab('scores')}
                  className={`flex-1 px-6 py-4 text-center font-semibold ${
                    activeTab === 'scores'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Enter Test Scores
                </button>
              </div>
            </div>

            {/* Classes Tab */}
            {activeTab === 'classes' && (
              <>
                {/* Class Selection */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h2 className="text-2xl font-bold mb-4">My Classes</h2>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((classItem) => (
                      <button
                        key={classItem.id}
                        onClick={() => handleClassChange(classItem)}
                        className={`px-4 py-2 rounded ${
                          selectedClass?.id === classItem.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {classItem.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Class Details */}
                {selectedClass && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">
                      {selectedClass.name} - Students
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Total Students: {students.length}
                    </p>

                    {students.length === 0 ? (
                      <p className="text-gray-600">No students in this class yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Student ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Full Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Admission Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Guardian
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {students.map((student) => (
                              <tr key={student.id}>
                                <td className="px-6 py-4">{student.user?.username}</td>
                                <td className="px-6 py-4">{student.user?.full_name}</td>
                                <td className="px-6 py-4">{student.admission_number || 'N/A'}</td>
                                <td className="px-6 py-4">{student.guardian_name || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Subject Management Tab */}
            {activeTab === 'subjects' && <SubjectManager />}

            {/* Score Entry Tab */}
            {activeTab === 'scores' && <ScoreEntry />}
          </>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
