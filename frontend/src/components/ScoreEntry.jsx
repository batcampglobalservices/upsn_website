import { useState, useEffect } from 'react';
import { resultAPI, sessionAPI, classAPI, subjectAPI } from '../api/axios';

const ScoreEntry = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSession && selectedClass && selectedSubject) {
      fetchResults();
    }
  }, [selectedSession, selectedClass, selectedSubject]);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getSessions();
      setSessions(response.data.results || response.data);
      // Auto-select active session
      const activeSessions = (response.data.results || response.data).filter(s => s.is_active);
      if (activeSessions.length > 0) {
        setSelectedSession(activeSessions[0].id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getSubjects();
      setSubjects(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await classAPI.getStudents(selectedClass);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await resultAPI.getResults({
        academic_session: selectedSession,
        class_id: selectedClass,
        subject: selectedSubject,
      });
      const existingResults = response.data.results || response.data;
      
      // Create a map of existing results by student ID
      const resultsMap = {};
      existingResults.forEach(result => {
        resultsMap[result.student] = result;
      });

      // Initialize results for all students
      const initialResults = students.map(student => {
        const existing = resultsMap[student.id];
        return {
          id: existing?.id || null,
          student: student.id,
          student_name: student.user?.full_name || 'Unknown',
          admission_number: student.admission_number || 'N/A',
          test_score: existing?.test_score || '',
          exam_score: existing?.exam_score || '',
          total: existing?.total || 0,
          grade: existing?.grade || '',
          comment: existing?.comment || '',
        };
      });

      setResults(initialResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId, field, value) => {
    setResults(prevResults =>
      prevResults.map(result => {
        if (result.student === studentId) {
          const updated = { ...result, [field]: value };
          // Auto-calculate total
          if (field === 'test_score' || field === 'exam_score') {
            const test = parseFloat(updated.test_score) || 0;
            const exam = parseFloat(updated.exam_score) || 0;
            updated.total = test + exam;
          }
          return updated;
        }
        return result;
      })
    );
  };

  const handleSaveScores = async () => {
    if (!selectedSession || !selectedClass || !selectedSubject) {
      alert('Please select session, class, and subject');
      return;
    }

    setSaving(true);
    try {
      const savePromises = results.map(async (result) => {
        // Only save if there are scores entered
        if (result.test_score || result.exam_score) {
          const data = {
            student: result.student,
            academic_session: selectedSession,
            subject: selectedSubject,
            test_score: parseFloat(result.test_score) || 0,
            exam_score: parseFloat(result.exam_score) || 0,
            comment: result.comment || '',
          };

          if (result.id) {
            // Update existing result
            return resultAPI.updateResult(result.id, data);
          } else {
            // Create new result
            return resultAPI.createResult(data);
          }
        }
      });

      await Promise.all(savePromises.filter(Boolean));
      alert('Scores saved successfully!');
      fetchResults(); // Refresh to get updated data with grades
    } catch (error) {
      console.error('Error saving scores:', error);
      alert('Failed to save some scores. Please check and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Test Score Entry</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Academic Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select Session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} {session.is_active && '(Active)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            disabled={!selectedClass}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Entry Table */}
      {selectedSession && selectedClass && selectedSubject && (
        <>
          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No students found in this class
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        Admission No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        Test Score (40)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        Exam Score (60)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        Total (100)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={result.student} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border">{index + 1}</td>
                        <td className="px-4 py-3 border">{result.admission_number}</td>
                        <td className="px-4 py-3 border font-medium">{result.student_name}</td>
                        <td className="px-4 py-3 border">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            step="0.01"
                            value={result.test_score}
                            onChange={(e) =>
                              handleScoreChange(result.student, 'test_score', e.target.value)
                            }
                            className="w-20 px-2 py-1 border rounded"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 border">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            step="0.01"
                            value={result.exam_score}
                            onChange={(e) =>
                              handleScoreChange(result.student, 'exam_score', e.target.value)
                            }
                            className="w-20 px-2 py-1 border rounded"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 border font-semibold">
                          {result.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 border">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              result.grade === 'A'
                                ? 'bg-green-100 text-green-800'
                                : result.grade === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : result.grade === 'C'
                                ? 'bg-yellow-100 text-yellow-800'
                                : result.grade === 'D'
                                ? 'bg-orange-100 text-orange-800'
                                : result.grade === 'F'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {result.grade || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 border">
                          <input
                            type="text"
                            value={result.comment}
                            onChange={(e) =>
                              handleScoreChange(result.student, 'comment', e.target.value)
                            }
                            className="w-32 px-2 py-1 border rounded text-sm"
                            placeholder="Optional"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Grades are auto-calculated: A (70+), B (60-69), C (50-59), D (45-49), F (&lt;45)
                </p>
                <button
                  onClick={handleSaveScores}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save All Scores'}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {!selectedSession && !selectedClass && !selectedSubject && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Please select session, class, and subject to begin</p>
        </div>
      )}
    </div>
  );
};

export default ScoreEntry;
