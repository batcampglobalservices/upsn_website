import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate numeric username
    if (!/^\d+$/.test(username)) {
      setError("Username must be numeric");
      setLoading(false);
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      // Redirect based on user role
      const role = result.user.role;
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-950 dark:bg-gray-950 font-serif">
        <div className="bg-gray-900/70 dark:bg-gray-900/70 p-10 rounded-3xl shadow-lg shadow-blue-500/10 border border-gray-800 dark:border-gray-800 w-full max-w-md">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-100 dark:text-gray-100">
            School <span className="text-blue-400 dark:text-blue-400">Result System</span>
          </h2>
          <h3 className="text-xl text-center mb-8 text-gray-400 dark:text-gray-400">Login to Your Account</h3>

          {error && (
            <div className="bg-red-500/20 dark:bg-red-500/20 border border-red-500/50 dark:border-red-500/50 text-red-300 dark:text-red-300 px-4 py-3 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-gray-300 dark:text-gray-300 font-semibold mb-2"
              >
                Username (ID Number)
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your numeric ID"
                className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 text-gray-100 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div className="mb-8">
              <label
                htmlFor="password"
                className="block text-gray-300 dark:text-gray-300 font-semibold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 text-gray-100 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-3xl font-bold text-white transition-all shadow-lg ${
                loading
                  ? "bg-gray-600 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-500 hover:shadow-blue-500/50"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400 dark:text-gray-400">
            <p>Use your student/staff ID number as username</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
