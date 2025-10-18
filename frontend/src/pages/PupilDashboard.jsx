import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { resultAPI, summaryAPI, sessionAPI } from '../api/axios';

const PupilDashboard = () => {
  const { user, logout } = useAuth();
  const [results, setResults] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [resultsReleased, setResultsReleased] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    console.log('=== PUPIL DASHBOARD MOUNT ===');
    console.log('User object:', user);
    console.log('User role:', user?.role);
    console.log('User ID:', user?.id);
    
    if (!user) {
      console.warn('⚠️ User not loaded yet');
      return;
    }
    
    if (user.role !== 'pupil') {
      console.error('❌ ERROR: User is not a pupil! Role:', user.role);
      setError('Access denied. This page is only for pupils.');
      setLoading(false);
      return;
    }
    
    console.log('✅ User loaded and is a pupil');
    initializeDashboard();
  }, [user]);

  const initializeDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Initializing dashboard...');
      await checkResultRelease();
      await fetchAllData();
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      setError('Failed to load dashboard. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const checkResultRelease = async () => {
    try {
      console.log('=== CHECKING RESULT RELEASE STATUS ===');
      const response = await sessionAPI.getSessions();
      console.log('Sessions API response:', response.data);
      
  const sessionsData = response.data.results || response.data;
      console.log('Sessions array:', sessionsData);
      setSessions(sessionsData);
      
      const active = sessionsData.find(s => s.is_active);
      console.log('Active session found:', active);
      
      if (active) {
        setActiveSession(active);
        
        if (active.results_unlocked) {
          console.log('✅ Results manually unlocked by admin');
          setResultsReleased(true);
        } else if (active.result_release_date) {
          const releaseDate = new Date(active.result_release_date);
          const now = new Date();
          const isReleased = now >= releaseDate;
          console.log('📅 Result release check:', {
            releaseDate: releaseDate.toISOString(),
            now: now.toISOString(),
            isReleased: isReleased ? '✅ RELEASED' : '🔒 LOCKED',
            sessionName: active.name
          });
          setResultsReleased(isReleased);
          
          if (!isReleased) {
            console.warn('⚠️ Results are locked until:', releaseDate.toLocaleString());
          }
        } else {
          console.log('✅ No release date set - results available immediately');
          setResultsReleased(true);
        }
      } else {
        console.log('⚠️ No active session found - allowing results to show');
        setResultsReleased(true);
      }
    } catch (error) {
      console.error('❌ ERROR checking result release:', error);
      console.error('Error details:', error.response?.data);
      // Don't block results if we can't check release status
      console.log('⚠️ Defaulting to released due to error');
      setResultsReleased(true);
    }
  };

  const fetchAllData = async () => {
    try {
      console.log('Fetching all data...');
      await Promise.all([fetchResults(), fetchSummaries()]);
      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const fetchResults = async () => {
    try {
      console.log('=== FETCHING PUPIL RESULTS ===');
      console.log('User info:', { 
        id: user?.id, 
        username: user?.username, 
        role: user?.role,
        full_name: user?.full_name 
      });
      
      const response = await resultAPI.getMyResults();
      console.log('Results API Response:', response);
      console.log('Results response.data:', response.data);
      console.log('Results response.status:', response.status);
      
      const resultsData = response.data.results || response.data;
      console.log('Parsed results array:', resultsData);
      console.log('Results count:', Array.isArray(resultsData) ? resultsData.length : 'Not an array');
      
      if (Array.isArray(resultsData) && resultsData.length > 0) {
        console.log('First result sample:', resultsData[0]);
      } else {
        console.warn('⚠️ No results found or data is not an array');
      }
      
      setResults(Array.isArray(resultsData) ? resultsData : []);
      
      return resultsData;
    } catch (error) {
      console.error('❌ ERROR FETCHING RESULTS:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      setResults([]);
      throw error;
    }
  };

  const fetchSummaries = async () => {
    try {
      console.log('=== FETCHING SUMMARIES ===');
      console.log('Fetching summaries for user ID:', user?.id);
      
      const response = await summaryAPI.getSummaries({ pupil: user?.id });
      console.log('Summaries API Response:', response);
      console.log('Summaries response.data:', response.data);
      console.log('Summaries response.status:', response.status);
      
      const summariesData = response.data.results || response.data;
      console.log('Parsed summaries array:', summariesData);
      console.log('Summaries count:', Array.isArray(summariesData) ? summariesData.length : 'Not an array');
      
      if (Array.isArray(summariesData) && summariesData.length > 0) {
        console.log('First summary sample:', summariesData[0]);
      } else {
        console.warn('⚠️ No summaries found or data is not an array');
      }
      
      setSummaries(Array.isArray(summariesData) ? summariesData : []);
      
      return summariesData;
    } catch (error) {
      console.error('❌ ERROR FETCHING SUMMARIES:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      setSummaries([]);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      console.log('Manual refresh triggered');
      await checkResultRelease();
      await fetchAllData();
      alert('✅ Results refreshed successfully!');
    } catch (err) {
      console.error('Refresh error:', err);
      alert('⚠️ Failed to refresh results. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadPDF = async (summaryId, sessionName, term) => {
    try {
      console.log('Downloading PDF for summary:', summaryId);
      const response = await summaryAPI.downloadPDF(summaryId);
      console.log('PDF download response:', response);
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `Result_${user?.username}_${sessionName}_${term}.pdf`.replace(/\s+/g, '_');
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF downloaded successfully');
      alert('✅ PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      console.error('Error details:', error.response?.data);
      alert('⚠️ Failed to download PDF. Please try again or contact your teacher.');
    }
  };

  // Filter results by session and term
  const getFilteredResults = () => {
    let filtered = results;
    
    if (selectedSession !== 'all') {
      filtered = filtered.filter(r => r.session === parseInt(selectedSession));
    }
    
    if (selectedTerm !== 'all') {
      filtered = filtered.filter(r => r.term === selectedTerm);
    }
    
    return filtered;
  };

  // Filter summaries by session and term
  const getFilteredSummaries = () => {
    let filtered = summaries;
    
    if (selectedSession !== 'all') {
      filtered = filtered.filter(s => s.session === parseInt(selectedSession));
    }
    
    if (selectedTerm !== 'all') {
      filtered = filtered.filter(s => s.term === selectedTerm);
    }
    
    return filtered;
  };

  const filteredResults = getFilteredResults();
  const filteredSummaries = getFilteredSummaries();

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 font-serif">
      {/* Header */}
      <header className="bg-gray-900/70 dark:bg-gray-900/70 text-gray-100 dark:text-gray-100 shadow-lg border-b border-gray-800 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Pupil <span className="text-blue-400 dark:text-blue-400">Dashboard</span></h1>
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
              <p className="text-gray-400 dark:text-gray-400 mb-1">Pupil ID</p>
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

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-6 rounded-3xl shadow-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-300 mb-2">⚠️ Error</h3>
                <p className="text-red-200">{error}</p>
                <button
                  onClick={initializeDashboard}
                  className="mt-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-xl text-sm font-semibold border border-red-500/30 transition-all"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info (Remove after fixing) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-500/10 border border-blue-500 p-4 rounded-2xl mb-6 text-xs">
            <div className="text-blue-300 font-bold mb-2">🔧 DEBUG INFO (Development Only)</div>
            <div className="text-blue-200 space-y-1">
              <div>User ID: {user?.id || 'Not loaded'}</div>
              <div>User Role: {user?.role || 'Not loaded'}</div>
              <div>Results Released: {resultsReleased ? '✅ YES' : '🔒 NO'}</div>
              <div>Results Count: {results.length}</div>
              <div>Summaries Count: {summaries.length}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Error: {error || 'None'}</div>
              <div>Active Session: {activeSession?.name || 'None'}</div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="bg-gray-900/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-100">My Results</h2>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="bg-gray-800 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sessions</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="bg-gray-800 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Terms</option>
                <option value="first">First Term</option>
                <option value="second">Second Term</option>
                <option value="third">Third Term</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
              </button>
              
              {!resultsReleased && (
                <span className="bg-orange-500/20 dark:bg-orange-500/20 text-orange-300 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/30 dark:border-orange-500/30">
                  🔒 Locked
                </span>
              )}
            </div>
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
          ) : summaries.length === 0 && results.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-600 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 dark:text-gray-400 text-lg font-semibold">No results available yet.</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Results will appear here once your teachers upload your scores.</p>
              <button
                onClick={handleRefresh}
                className="mt-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-6 py-3 rounded-xl font-semibold border border-blue-500/30 transition-all"
              >
                Check for New Results
              </button>
            </div>
          ) : filteredResults.length === 0 && filteredSummaries.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-600 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-400 dark:text-gray-400 text-lg font-semibold">No results found for selected filters.</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try changing the session or term filter.</p>
              <button
                onClick={() => {
                  setSelectedSession('all');
                  setSelectedTerm('all');
                }}
                className="mt-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-6 py-3 rounded-xl font-semibold border border-blue-500/30 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics Summary */}
              {filteredResults.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 p-4 rounded-2xl border border-blue-500/30">
                    <p className="text-xs text-blue-300 uppercase font-semibold">Total Subjects</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{filteredResults.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 p-4 rounded-2xl border border-green-500/30">
                    <p className="text-xs text-green-300 uppercase font-semibold">Average Score</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      {(filteredResults.reduce((sum, r) => sum + r.total, 0) / filteredResults.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 p-4 rounded-2xl border border-purple-500/30">
                    <p className="text-xs text-purple-300 uppercase font-semibold">Highest Score</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">
                      {Math.max(...filteredResults.map(r => r.total))}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 p-4 rounded-2xl border border-orange-500/30">
                    <p className="text-xs text-orange-300 uppercase font-semibold">Lowest Score</p>
                    <p className="text-3xl font-bold text-orange-400 mt-2">
                      {Math.min(...filteredResults.map(r => r.total))}
                    </p>
                  </div>
                </div>
              )}

              {/* Individual Results by Subject */}
              {filteredResults.length > 0 && (
                <div className="bg-gray-800/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-700 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100 mb-4 flex items-center gap-2">
                    📚 Subject Results 
                    <span className="text-sm text-gray-400 font-normal">({filteredResults.length} subject{filteredResults.length !== 1 ? 's' : ''})</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-700/50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 dark:text-blue-400 uppercase">Subject</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 dark:text-blue-400 uppercase">Session</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 dark:text-blue-400 uppercase">Term</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 dark:text-blue-400 uppercase">Test (30)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 dark:text-blue-400 uppercase">Exam (70)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 dark:text-blue-400 uppercase">Total (100)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-400 dark:text-blue-400 uppercase">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50 dark:divide-gray-700/50">
                        {filteredResults.map((result) => (
                          <tr key={result.id} className="hover:bg-gray-700/30 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3 text-gray-100 dark:text-gray-100 font-medium">{result.subject_name || 'Unknown'}</td>
                            <td className="px-4 py-3 text-gray-300 dark:text-gray-300 text-sm">{result.session_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-300 dark:text-gray-300 text-sm capitalize">{result.term || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-300 dark:text-gray-300">{result.test_score ?? 0}</td>
                            <td className="px-4 py-3 text-gray-300 dark:text-gray-300">{result.exam_score ?? 0}</td>
                            <td className="px-4 py-3 text-blue-400 dark:text-blue-400 font-bold text-lg">{result.total ?? 0}</td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                result.grade === 'A' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                result.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                result.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                result.grade === 'D' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {result.grade || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Result Summaries */}
              {filteredSummaries.length > 0 && (
                <div className="bg-gray-800/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-700 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100 mb-4 flex items-center gap-2">
                    📊 Overall Performance Summaries
                    <span className="text-sm text-gray-400 font-normal">({filteredSummaries.length} summary{filteredSummaries.length !== 1 ? 'ies' : ''})</span>
                  </h3>
                  <div className="space-y-4">
                    {filteredSummaries.map((summary) => (
                      <div key={summary.id} className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 p-6 rounded-2xl border border-gray-600 dark:border-gray-600 hover:border-blue-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-100 dark:text-gray-100">
                              {summary.session_name || 'Unknown Session'} - <span className="capitalize">{summary.term || 'N/A'}</span> Term
                            </h4>
                            <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
                              Class: {summary.pupil_class || 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadPDF(summary.id, summary.session_name, summary.term)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all"
                          >
                            📄 Download PDF
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          <div className="bg-gray-900/50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-400 dark:text-gray-400 uppercase">Total Subjects</p>
                            <p className="text-2xl font-bold text-gray-100 dark:text-gray-100 mt-1">{summary.total_subjects || 0}</p>
                          </div>
                          <div className="bg-gray-900/50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-400 dark:text-gray-400 uppercase">Total Score</p>
                            <p className="text-2xl font-bold text-blue-400 dark:text-blue-400 mt-1">{summary.total_score || 0}</p>
                          </div>
                          <div className="bg-gray-900/50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-400 dark:text-gray-400 uppercase">Average</p>
                            <p className="text-2xl font-bold text-purple-400 dark:text-purple-400 mt-1">
                              {summary.average_score ? summary.average_score.toFixed(2) : '0.00'}%
                            </p>
                          </div>
                          <div className="bg-gray-900/50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <p className="text-xs text-gray-400 dark:text-gray-400 uppercase">Grade</p>
                            <p className={`text-2xl font-bold mt-1 ${
                              summary.overall_grade === 'A' ? 'text-green-400 dark:text-green-400' :
                              summary.overall_grade === 'B' ? 'text-blue-400 dark:text-blue-400' :
                              summary.overall_grade === 'C' ? 'text-yellow-400 dark:text-yellow-400' :
                              summary.overall_grade === 'D' ? 'text-orange-400 dark:text-orange-400' :
                              'text-red-400 dark:text-red-400'
                            }`}>
                              {summary.overall_grade || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PupilDashboard;
