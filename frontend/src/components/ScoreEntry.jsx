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
  const [selectedTerm, setSelectedTerm] = useState('first');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setStudents([]); // Reset students when class changes
      setResults([]); // Reset results when class changes
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSession && selectedClass && selectedSubject && selectedTerm && students.length > 0) {
      fetchResults();
    }
  }, [selectedSession, selectedClass, selectedSubject, selectedTerm, students]);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getSessions();
      console.log('Sessions response:', response.data);
      setSessions(response.data.results || response.data);
      // Auto-select active session
      const activeSessions = (response.data.results || response.data).filter(s => s.is_active);
      if (activeSessions.length > 0) {
        setSelectedSession(activeSessions[0].id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      console.log('Classes response:', response.data);
      setClasses(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getSubjects();
      console.log('Subjects response:', response.data);
      setSubjects(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await classAPI.getStudents(selectedClass);
      console.log('Students response:', response.data);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to fetch students: ' + (error.response?.data?.detail || error.message));
      setStudents([]); // Reset students on error
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      console.log('Fetching results with params:', {
        session: selectedSession,
        pupil__pupil_profile__pupil_class: selectedClass,
        subject: selectedSubject,
        term: selectedTerm,
      });
      const response = await resultAPI.getResults({
        session: selectedSession,
        pupil__pupil_profile__pupil_class: selectedClass,
        subject: selectedSubject,
        term: selectedTerm,
      });
      console.log('Results response:', response.data);
      const existingResults = response.data.results || response.data;
      
      // Create a map of existing results by pupil ID
      const resultsMap = {};
      existingResults.forEach(result => {
        resultsMap[result.pupil] = result;  // Backend uses 'pupil' not 'student'
      });

      // Initialize results for all students (pupils)
      // Filter out pupils without valid user accounts
      const skippedPupils = [];
      const initialResults = students
        .filter(student => {
          if (!student.user || !student.user.id) {
            console.warn(`⚠️ Skipping pupil without valid user account:`, student);
            skippedPupils.push(student.admission_number || 'Unknown');
            return false;
          }
          return true;
        })
        .map(student => {
          // Backend Result.pupil expects CustomUser ID, not PupilProfile ID
          const existing = resultsMap[student.user.id];
          return {
            id: existing?.id || null,
            student: student.user.id,  // CRITICAL: Must be User ID, not PupilProfile ID!
            student_name: student.user.full_name || 'Unknown',
            admission_number: student.admission_number || 'N/A',
            test_score: existing?.test_score || '',
            exam_score: existing?.exam_score || '',
            total: existing?.total || 0,
            grade: existing?.grade || '',
            comment: existing?.teacher_comment || '',  // Backend uses 'teacher_comment'
          };
        });

      // Notify user if some pupils were skipped
      if (skippedPupils.length > 0) {
        alert(`⚠️ Warning: ${skippedPupils.length} pupil(s) were skipped because they don't have user accounts yet.\n\nAdmission numbers: ${skippedPupils.join(', ')}\n\nPlease contact admin to create user accounts for these pupils.`);
      }

      console.log('Initialized results:', initialResults);
      setResults(initialResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      console.error('Error details:', error.response?.data);
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
    if (!selectedSession || !selectedClass || !selectedSubject || !selectedTerm) {
      alert('Please select session, class, subject, and term');
      return;
    }

    // Count how many scores will be saved
    const scoresToSave = results.filter(r => r.test_score || r.exam_score).length;
    if (scoresToSave === 0) {
      alert('Please enter at least one score before saving');
      return;
    }

    if (!confirm(`Save scores for ${scoresToSave} student(s)?`)) {
      return;
    }

    setSaving(true);
    let savedCount = 0;
    let errorCount = 0;

    try {
      const savePromises = results.map(async (result) => {
        // Only save if there are scores entered
        if (result.test_score || result.exam_score) {
          // Validate we have a valid pupil ID (User ID, not PupilProfile ID)
          if (!result.student) {
            console.error(`❌ Missing pupil ID for ${result.student_name}`);
            errorCount++;
            return;
          }

          const data = {
            pupil: result.student,  // Backend expects 'pupil' field with User ID
            session: selectedSession,
            subject: selectedSubject,
            term: selectedTerm,
            test_score: parseFloat(result.test_score) || 0,
            exam_score: parseFloat(result.exam_score) || 0,
            teacher_comment: result.comment || '',
          };

          console.log('💾 Saving data for pupil:', result.student_name, data);

          try {
            if (result.id) {
              // Update existing result
              console.log('📝 Updating result ID:', result.id);
              await resultAPI.updateResult(result.id, data);
              console.log('✅ Result updated successfully');
            } else {
              // Create new result
              console.log('➕ Creating new result');
              const response = await resultAPI.createResult(data);
              console.log('✅ Result created successfully:', response.data);
            }
            savedCount++;
          } catch (err) {
            console.error(`❌ Error saving result for pupil ${result.student_name}:`, err);
            console.error('Error response:', err.response?.data);
            console.error('📋 DETAILED ERROR:', JSON.stringify(err.response?.data, null, 2));
            console.error('📋 Request data that failed:', JSON.stringify(data, null, 2));
            errorCount++;
            throw err;
          }
        }
      });

      await Promise.all(savePromises.filter(Boolean));
      
      console.log(`✅ Save complete: ${savedCount} saved, ${errorCount} errors`);
      
      // Immediately refresh the results to show updated data
      await fetchResults();
      
      alert(`✅ Successfully saved ${savedCount} score(s)!\n\nResults are now visible to pupils and summaries have been generated.`);
    } catch (error) {
      console.error('❌ Error saving scores:', error);
      
      // Show detailed error information
      if (error.response?.data) {
        const errorData = JSON.stringify(error.response.data, null, 2);
        console.error('🚨 BACKEND ERROR DETAILS:', errorData);
        alert(`❌ Failed to save scores!\n\nBackend Error:\n${errorData}\n\nCheck console for full details.`);
      } else if (errorCount > 0) {
        alert(`⚠️ Saved ${savedCount} score(s), but ${errorCount} failed.\n\nPlease check the console for details and try again.`);
      } else {
        alert('❌ Failed to save scores. Please check your internet connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-700/50 backdrop-blur-xl">
      <h2 className="text-3xl font-serif font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Test Score Entry
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Academic Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          <label className="block text-gray-300 mb-2 font-semibold">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          <label className="block text-gray-300 mb-2 font-semibold">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      {selectedSession && selectedTerm && selectedClass && selectedSubject && (
        <>
          {loadingStudents || loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="mt-2 text-gray-300">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-300 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
              <p className="font-semibold">No students found in this class</p>
              <p className="text-sm mt-2">Please assign students to this class first from the User Management section.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Loading students data...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mb-4 rounded-2xl border border-gray-700/50">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        Admission No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        Test Score (30)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        Exam Score (70)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        Total (100)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {results.map((result, index) => (
                      <tr key={result.student} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-gray-300">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-300">{result.admission_number}</td>
                        <td className="px-4 py-3 font-medium text-gray-100">{result.student_name}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.01"
                            value={result.test_score}
                            onChange={(e) =>
                              handleScoreChange(result.student, 'test_score', e.target.value)
                            }
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="70"
                            step="0.01"
                            value={result.exam_score}
                            onChange={(e) =>
                              handleScoreChange(result.student, 'exam_score', e.target.value)
                            }
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-400">
                          {result.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                              result.grade === 'A'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : result.grade === 'B'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : result.grade === 'C'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : result.grade === 'D'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : result.grade === 'F'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}
                          >
                            {result.grade || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={result.comment}
                            onChange={(e) =>
                              handleScoreChange(result.student, 'comment', e.target.value)
                            }
                            className="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-400">
                  Grades are auto-calculated: A (70+), B (60-69), C (50-59), D (45-49), F (&lt;45)
                </p>
                <button
                  onClick={handleSaveScores}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save All Scores'
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {!selectedSession && !selectedClass && !selectedSubject && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Please select session, class, and subject to begin</p>
        </div>
      )}
    </div>
  );
};

export default ScoreEntry;
