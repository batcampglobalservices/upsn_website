import { useState, useEffect } from 'react';
import { resultAPI, sessionAPI, classAPI, subjectAPI, summaryAPI } from '../api/axios';

const ResultManager = () => {
  const [results, setResults] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'summaries'
  
  // Filters
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (viewMode === 'individual') {
      fetchResults();
    } else {
      fetchSummaries();
    }
  }, [selectedSession, selectedTerm, selectedClass, selectedSubject, viewMode]);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getSessions();
      setSessions(response.data.results || response.data);
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

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSession) params.session = selectedSession;
      if (selectedTerm) params.term = selectedTerm;
      if (selectedClass) params.pupil__pupil_profile__pupil_class = selectedClass;
      if (selectedSubject) params.subject = selectedSubject;

      const response = await resultAPI.getResults(params);
      setResults(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSession) params.session = selectedSession;
      if (selectedTerm) params.term = selectedTerm;

      const response = await summaryAPI.getSummaries(params);
      setSummaries(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (id) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      await resultAPI.deleteResult(id);
      alert('✅ Result deleted successfully');
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('❌ Failed to delete result');
    }
  };

  const handleDownloadPDF = async (summaryId) => {
    try {
      const response = await summaryAPI.downloadPDF(summaryId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `result_${summaryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-700/50 backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Results Management
        </h2>
        <p className="text-gray-400 mt-2">View and manage all student results</p>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setViewMode('individual')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            viewMode === 'individual'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📝 Individual Results
        </button>
        <button
          onClick={() => setViewMode('summaries')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            viewMode === 'summaries'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📊 Result Summaries
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-gray-300 mb-2 font-semibold">Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">All Sessions</option>
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
            <option value="">All Terms</option>
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>

        {viewMode === 'individual' && (
          <>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Classes</option>
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
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-gray-400">Loading results...</p>
        </div>
      ) : viewMode === 'individual' ? (
        /* Individual Results View */
        results.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <p className="text-lg">No results found</p>
            <p className="text-sm mt-2">Try adjusting the filters above</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-700/50">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Session/Term</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Test (30)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Exam (70)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-100 font-medium">{result.student_name}</td>
                    <td className="px-4 py-3 text-gray-300">{result.student_class || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300">{result.subject_name}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {result.session_name}<br/>
                      <span className="text-gray-500">{result.term} term</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{result.test_score}</td>
                    <td className="px-4 py-3 text-gray-300">{result.exam_score}</td>
                    <td className="px-4 py-3 text-blue-400 font-semibold">{result.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        result.grade === 'A' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        result.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        result.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        result.grade === 'D' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteResult(result.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Result"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="bg-gray-800/50 px-4 py-3 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm">
                Showing {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )
      ) : (
        /* Summaries View */
        summaries.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <p className="text-lg">No summaries found</p>
            <p className="text-sm mt-2">Summaries are generated automatically when results are saved</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((summary) => (
              <div key={summary.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">{summary.student_name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{summary.student_class || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    summary.overall_grade === 'A' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    summary.overall_grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    summary.overall_grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    summary.overall_grade === 'D' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    Grade: {summary.overall_grade}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-400">{summary.session_name} - {summary.term} Term</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-700/30 p-3 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase">Subjects</p>
                    <p className="text-xl font-bold text-gray-100 mt-1">{summary.total_subjects}</p>
                  </div>
                  <div className="bg-gray-700/30 p-3 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase">Average</p>
                    <p className="text-xl font-bold text-purple-400 mt-1">{summary.average_score.toFixed(1)}%</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadPDF(summary.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all"
                >
                  📄 Download PDF
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ResultManager;
