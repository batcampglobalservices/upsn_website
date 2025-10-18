import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import PupilDashboard from './PupilDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Please login to continue</div>
      </div>
    );
  }

  // Render dashboard based on user role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'teacher') {
    return <TeacherDashboard />;
  } else if (user.role === 'pupil') {
    return <PupilDashboard />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Invalid user role</div>
    </div>
  );
};

export default Dashboard;
