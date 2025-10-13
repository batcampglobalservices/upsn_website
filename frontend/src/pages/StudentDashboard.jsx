import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { resultAPI, summaryAPI, sessionAPI } from '../api/axios';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [results, setResults] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [resultsReleased, setResultsReleased] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkResultRelease();
    fetchResults();
    fetchSummaries();
  }, []);

  const checkResultRelease = async () => {
    try {
      const response = await sessionAPI.getSessions();
      const sessions = response.data.results || response.data;
      const active = sessions.find(s => s.is_active);
      
      if (active) {
        setActiveSession(active);
        
        if (active.result_release_date) {
          const releaseDate = new Date(active.result_release_date);
          const now = new Date();
          setResultsReleased(now >= releaseDate);
        } else {
          setResultsReleased(true);
        }
      }
    } catch (error) {
      console.error('Error checking result release:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await resultAPI.getMyResults();
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const fetchSummaries = async () => {
    try {
      const response = await summaryAPI.getSummaries({ student: user.id });
      setSummaries(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (summaryId) => {
    try {
      const response = await summaryAPI.downloadPDF(summaryId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Result_${user.username}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 font-serif">
      {/* Header */}
      <header className="bg-gray-900/70 dark:bg-gray-900/70 text-gray-100 dark:text-gray-100 shadow-lg border-b border-gray-800 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Student <span className="text-blue-400 dark:text-blue-400">Dashboard</span></h1>
          <div className="flex items-center gap-6">
            <span className="text-gray-300 dark:text-gray-300">Welcome, <span className="text-blue-400 dark:text-blue-400 font-semibold">{user?.full_name}</span></span>
            <button
              onClick={logout}
              className="bg-red-500/20 dark:bg-red-500/20 hover:bg-red-500/30 dark:hover:bg-red-500/30 text-red-300 dark:text-red-300 border border-red-500/30 dark:border-red-500/30 px-6 py-2 rounded-3xl font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="bg-gray-900/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 dark:border-gray-800 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-100 dark:text-gray-100">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 dark:text-gray-400 mb-1">Student ID</p>
              <p className="font-semibold text-xl text-blue-400 dark:text-blue-400">{user?.username}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-400 mb-1">Full Name</p>
              <p className="font-semibold text-xl text-gray-100 dark:text-gray-100">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-300 dark:text-gray-300">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-400 mb-1">Phone</p>
              <p className="font-semibold text-gray-300 dark:text-gray-300">{user?.phone_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Result Release Notification */}
        {!resultsReleased && activeSession && activeSession.result_release_date && (
          <div className="bg-orange-500/10 dark:bg-orange-500/10 border-l-4 border-orange-500 dark:border-orange-500 p-6 rounded-3xl shadow-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-orange-400 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-orange-300 dark:text-orange-300 mb-2">
                  🔔 Results Not Yet Released
                </h3>
                <p className="text-orange-200 dark:text-orange-200 mb-2">
                  Your results for <span className="font-semibold">{activeSession.name}</span> session will be released on:
                </p>
                <p className="text-xl font-bold text-orange-100 dark:text-orange-100">
                  {new Date(activeSession.result_release_date).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-orange-300 dark:text-orange-300 mt-2">
                  Please check back after this date to view your results.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="bg-gray-900/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-100">My Results</h2>
            {!resultsReleased && (
              <span className="bg-orange-500/20 dark:bg-orange-500/20 text-orange-300 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/30 dark:border-orange-500/30">
                🔒 Locked
              </span>
            )}
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <p className="mt-4 text-gray-400 dark:text-gray-400">Loading results...</p>
            </div>
          ) : !resultsReleased ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-600 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-300 dark:text-gray-300 mb-2">
                Results are Currently Locked
              </h3>
              <p className="text-gray-400 dark:text-gray-400">
                Your results will be available after the release date shown above.
              </p>
            </div>
          ) : summaries.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-400 text-center py-8">No results available yet.</p>
          ) : (
            <div className="space-y-4">
              {summaries.map((summary) => (
                <div key={summary.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {summary.session_name} - {summary.term} Term
                      </h3>
                      <p className="text-sm text-gray-600">
                        Class: {summary.student_class || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(summary.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Download PDF
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-600">Total Subjects</p>
                      <p className="text-lg font-bold">{summary.total_subjects}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Score</p>
                      <p className="text-lg font-bold">{summary.total_score}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Average</p>
                      <p className="text-lg font-bold">{summary.average_score.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Grade</p>
                      <p className={`text-lg font-bold ${
                        summary.overall_grade === 'A' ? 'text-green-600' :
                        summary.overall_grade === 'B' ? 'text-blue-600' :
                        summary.overall_grade === 'C' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {summary.overall_grade}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
