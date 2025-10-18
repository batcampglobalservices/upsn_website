import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { classAPI } from '../api/axios';
import ScoreEntry from '../components/ScoreEntry';
import SubjectManager from '../components/SubjectManager';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [pupils, setPupils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPupils, setLoadingPupils] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await classAPI.getClasses();
        const teacherClasses = response.data?.results || response.data || [];
        setClasses(teacherClasses);
        if (teacherClasses.length > 0) {
          const first = teacherClasses[0];
          setSelectedClass(first);
          await fetchPupils(first.id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const fetchPupils = async (classId) => {
    setLoadingPupils(true);
    try {
      const response = await classAPI.getPupils(classId);
      const list = response.data?.results || response.data || [];
      setPupils(list);
    } catch (error) {
      console.error('Error fetching pupils:', error);
      setPupils([]);
    } finally {
      setLoadingPupils(false);
    }
  };

  const handleClassChange = async (cls) => {
    setSelectedClass(cls);
    await fetchPupils(cls.id);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Teacher <span className="text-blue-400">Dashboard</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 hidden sm:inline">
              Welcome, <span className="text-blue-400 font-semibold">{user?.full_name}</span>
            </span>
            <button
              onClick={logout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-4 py-2 rounded-xl transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-800 text-center">
            <p className="text-gray-400">No classes assigned to you yet.</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-900/70 rounded-2xl border border-gray-800 mb-6 overflow-hidden">
              <div className="flex border-b border-gray-800">
                <button
                  onClick={() => setActiveTab('classes')}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                    activeTab === 'classes'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-blue-400'
                  }`}
                >
                  My Classes
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                    activeTab === 'subjects'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-blue-400'
                  }`}
                >
                  Manage Subjects
                </button>
                <button
                  onClick={() => setActiveTab('scores')}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                    activeTab === 'scores'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-blue-400'
                  }`}
                >
                  Enter Test Scores
                </button>
              </div>
            </div>

            {activeTab === 'classes' && (
              <>
                <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-800 mb-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-100">My Classes</h2>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => handleClassChange(cls)}
                        className={`px-4 py-2 rounded-2xl border transition-all ${
                          selectedClass?.id === cls.id
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedClass && (
                  <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-800">
                    <h2 className="text-2xl font-bold mb-4 text-gray-100">
                      {selectedClass.name} - Pupils
                    </h2>
                    <p className="text-gray-400 mb-4">Total Pupils: {pupils.length}</p>

                    {loadingPupils ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
                        <p className="mt-3 text-gray-400">Loading pupils...</p>
                      </div>
                    ) : pupils.length === 0 ? (
                      <p className="text-gray-400">No pupils in this class yet.</p>
                    ) : (
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="min-w-full">
                          <thead className="bg-gray-800/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Username</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Full Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Admission No.</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Guardian</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {pupils.map((p) => (
                              <tr key={p.id}>
                                <td className="px-6 py-4 text-gray-300">{p.user?.username}</td>
                                <td className="px-6 py-4 text-gray-300">{p.user?.full_name}</td>
                                <td className="px-6 py-4 text-gray-300">{p.admission_number || 'N/A'}</td>
                                <td className="px-6 py-4 text-gray-300">{p.guardian_name || 'N/A'}</td>
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

            {activeTab === 'subjects' && <SubjectManager />}
            {activeTab === 'scores' && <ScoreEntry />}
          </>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
