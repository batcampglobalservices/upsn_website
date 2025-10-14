import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFetchData } from '../hooks/useData';
import CarouselManager from '../components/CarouselManager';
import LogoManager from '../components/LogoManager';
import UserManager from '../components/UserManager';
import ClassManager from '../components/ClassManager';
import SubjectManager from '../components/SubjectManager';
import ResultReleaseManager from '../components/ResultReleaseManager';
import SessionManager from '../components/SessionManager';
import ResultManager from '../components/ResultManager';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'sessions', label: 'Sessions', icon: '📅' },
    { id: 'results', label: 'Results', icon: '📝' },
    { id: 'carousel', label: 'Carousel', icon: '🖼️' },
    { id: 'logo', label: 'Logo', icon: '🎨' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection />;
      case 'users':
        return <UserManager />;
      case 'classes':
        return <ClassManager />;
      case 'subjects':
        return <SubjectManager />;
      case 'sessions':
        return <SessionManager />;
      case 'results':
        return <ResultManager />;
      case 'carousel':
        return <CarouselManager />;
      case 'logo':
        return <LogoManager />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 font-serif flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 shadow-2xl`}>
        
        {/* Logo/Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl font-bold text-white">📚</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">UPSN</h2>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800/50 bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 shadow-lg shadow-blue-500/10 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-red-400 hover:bg-red-500/10 transition-all border border-red-500/30 hover:border-red-500/50"
          >
            <span className="text-2xl">🚪</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-gray-900/70 backdrop-blur-xl border-b border-gray-800/50 shadow-xl sticky top-0 z-40">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Welcome back, <span className="text-blue-400 font-semibold">{user?.full_name}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-950/50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Overview Section
const OverviewSection = () => {
  const { data: users, loading: loadingUsers } = useFetchData('/users/');
  const { data: classes, loading: loadingClasses } = useFetchData('/classes/');
  const { data: subjects, loading: loadingSubjects } = useFetchData('/subjects/');
  const { data: results, loading: loadingResults } = useFetchData('/results/');
  const { data: sessions, loading: loadingSessions } = useFetchData('/sessions/');

  // Count users by role - safely handle both array and paginated responses
  const usersList = Array.isArray(users) ? users : (users?.results || []);
  const studentCount = usersList.filter(u => u.role === 'student').length;
  const teacherCount = usersList.filter(u => u.role === 'teacher').length;
  const adminCount = usersList.filter(u => u.role === 'admin').length;

  // Safely handle array or paginated response for all data
  const classesList = Array.isArray(classes) ? classes : (classes?.results || []);
  const subjectsList = Array.isArray(subjects) ? subjects : (subjects?.results || []);
  const sessionsList = Array.isArray(sessions) ? sessions : (sessions?.results || []);

  const stats = [
    { 
      label: 'Total Students', 
      value: studentCount, 
      color: 'from-blue-500 to-cyan-500',
      icon: '👨‍🎓',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Total Teachers', 
      value: teacherCount, 
      color: 'from-green-500 to-emerald-500',
      icon: '👨‍🏫',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Total Admins', 
      value: adminCount, 
      color: 'from-purple-500 to-pink-500',
      icon: '👨‍💼',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Total Classes', 
      value: classesList.length, 
      color: 'from-orange-500 to-red-500',
      icon: '🏫',
      bgColor: 'bg-orange-500/10'
    },
    { 
      label: 'Total Subjects', 
      value: subjectsList.length, 
      color: 'from-pink-500 to-rose-500',
      icon: '📚',
      bgColor: 'bg-pink-500/10'
    },
    { 
      label: 'Academic Sessions', 
      value: sessionsList.length, 
      color: 'from-indigo-500 to-blue-500',
      icon: '📅',
      bgColor: 'bg-indigo-500/10'
    },
  ];

  const isLoading = loadingUsers || loadingClasses || loadingSubjects || loadingResults || loadingSessions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Dashboard Overview
        </h2>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden bg-gray-900/70 backdrop-blur-sm p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-800/50 hover:border-gray-700/50"
              >
                <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
                    <p className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Session Info */}
          {sessionsList.length > 0 && (
            <div className="bg-gray-900/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-800/50">
              <h3 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
                <span>📅</span> Active Academic Session
              </h3>
              {(() => {
                const activeSession = sessionsList.find(s => s.is_active);
                if (activeSession) {
                  return (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                          <p className="text-sm text-gray-400 mb-1">Session Name</p>
                          <p className="text-xl font-semibold text-gray-100">{activeSession.name}</p>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                          <p className="text-sm text-gray-400 mb-1">Current Term</p>
                          <p className="text-xl font-semibold text-gray-100 capitalize">{activeSession.current_term}</p>
                        </div>
                      </div>
                      
                      {activeSession.result_release_date && (
                        <div className="mt-4 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/30">
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">📅</div>
                            <div className="flex-1">
                              <p className="font-semibold text-blue-400 text-lg mb-2">Result Release Date</p>
                              <p className="text-gray-300 text-lg">
                                {new Date(activeSession.result_release_date).toLocaleString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {new Date() >= new Date(activeSession.result_release_date) ? (
                                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                  <span>✅</span>
                                  <span className="font-semibold">Results are now released!</span>
                                </div>
                              ) : (
                                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                                  <span>🔒</span>
                                  <span className="font-semibold">Results are locked until release date</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-400 text-lg">No active session found</p>
                    <p className="text-gray-500 text-sm mt-2">Create an academic session to get started</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 rounded-3xl shadow-xl border border-gray-800/50">
            <h3 className="text-2xl font-semibold mb-6 text-gray-100 flex items-center gap-3">
              <span>⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Add User', icon: '👤' },
                { label: 'Add Class', icon: '🏫' },
                { label: 'Add Subject', icon: '📚' },
                { label: 'Set Release Date', icon: '📅' }
              ].map((action, idx) => (
                <button 
                  key={idx}
                  className="group bg-gray-800/50 hover:bg-gray-800 px-6 py-4 rounded-2xl font-medium transition-all border border-gray-700/50 hover:border-gray-600 hover:scale-105"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                  <div className="text-sm text-gray-300">{action.label}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
