import { useState, useEffect } from 'react';
import { userAPI, classAPI, studentAPI } from '../api/axios';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    full_name: '',
    role: 'pupil',
    email: '',
    phone_number: '',
    pupil_class: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only validate password match if password fields are filled
    if (formData.password && formData.password !== formData.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    try {
      if (editingUser) {
        console.log('=== UPDATING USER ===');
        console.log('Editing user ID:', editingUser.id);
        
        // Update user - only include password if it was changed
        const updateData = {
          username: formData.username,  // Include username to avoid validation errors
          full_name: formData.full_name,
          role: formData.role,
          email: formData.email || '',  // Send empty string if not provided
          phone_number: formData.phone_number || '',  // Send empty string if not provided
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        console.log('Update data:', updateData);
        
        await userAPI.updateUser(editingUser.id, updateData);
        console.log('✅ User updated');
        
        // Immediately refresh user list
        await fetchUsers();
        
        // Update pupil profile class if current role is pupil
        if (formData.role === 'pupil') {
          console.log('Updating pupil class assignment...');
          console.log('Selected class ID:', formData.pupil_class);
          
          // Try to get or create pupil profile
          try {
            const profilesResponse = await studentAPI.getProfiles({ user: editingUser.id });
            const profiles = profilesResponse.data.results || profilesResponse.data;
            console.log('Pupil profiles found:', profiles);
            
            if (profiles && profiles.length > 0) {
              const profileId = profiles[0].id;
              const classValue = formData.pupil_class ? parseInt(formData.pupil_class) : null;
              console.log('Updating profile ID:', profileId, 'with class:', classValue);
              
              // Update existing profile
              await studentAPI.updateProfile(profileId, {
                pupil_class: classValue,
              });
              console.log('✅ Profile class updated successfully!');
            } else {
              console.warn('⚠️ No pupil profile found for user');
              alert('User updated but pupil profile not found. Contact administrator.');
            }
          } catch (profileError) {
            console.error('❌ Error updating pupil profile:', profileError);
            console.error('Profile error response:', profileError.response?.data);
            alert('User updated, but failed to update class assignment. Please try again or contact administrator.');
          }
        }
        
        // Refresh data again after profile update
        await fetchUsers();
        await fetchClasses();
        
        alert('User updated successfully!');
      } else {
        // Create user - password is required
        if (!formData.password) {
          alert('Password is required for new users');
          return;
        }
        
        // Validate that pupils must have a class
        if (formData.role === 'pupil' && !formData.pupil_class) {
          alert('Class assignment is required for pupils');
          return;
        }
        
        console.log('=== CREATING NEW USER ===');
        const userData = {
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
          email: formData.email || '',
          phone_number: formData.phone_number || '',
        };
        
        // Include pupil_class in the initial user creation for pupils
        if (formData.role === 'pupil' && formData.pupil_class) {
          userData.pupil_class = parseInt(formData.pupil_class);
        }
        
        console.log('User data being sent:', userData);
        
        try {
          const userResponse = await userAPI.createUser(userData);
          console.log('✅ User created successfully:', userResponse.data);
          alert('User created successfully!');
          
          // Immediately refresh all data
          await fetchUsers();
          await fetchClasses();
          
          // Reset form and refresh list
          setShowForm(false);
          setEditingUser(null);
          setFormData({
            username: '',
            password: '',
            confirm_password: '',
            full_name: '',
            role: 'pupil',
            email: '',
            phone_number: '',
            pupil_class: '',
          });
          // No need to call fetchUsers again, already called above
        } catch (createError) {
          console.error('❌ Error creating user:', createError);
          console.error('Error response:', createError.response?.data);
          
          // Show specific error message
          const errorData = createError.response?.data;
          let errorMessage = 'Failed to create user.\n\n';
          
          if (errorData) {
            if (typeof errorData === 'object') {
              // Handle field-specific errors
              Object.keys(errorData).forEach(key => {
                const messages = Array.isArray(errorData[key]) ? errorData[key] : [errorData[key]];
                errorMessage += `${key}: ${messages.join(', ')}\n`;
              });
            } else if (typeof errorData === 'string') {
              errorMessage += errorData;
            }
          }
          
          alert(errorMessage);
          return; // Stop execution on error
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.detail || 
                       JSON.stringify(error.response?.data) || 
                       'An error occurred';
      alert(`${editingUser ? 'Failed to update user' : 'Failed to create user'}\n\nError: ${errorMsg}`);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      confirm_password: '',
      full_name: user.full_name,
      role: user.role,
      email: user.email || '',
      phone_number: user.phone_number || '',
      pupil_class: user.pupil_profile?.pupil_class || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      confirm_password: '',
      full_name: '',
      role: 'pupil',
      email: '',
      phone_number: '',
      pupil_class: '',
    });
  };

  const handleDeactivate = async (id) => {
    try {
      await userAPI.deactivateUser(id);
      alert('User deactivated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const handleActivate = async (id) => {
    try {
      await userAPI.activateUser(id);
      alert('User activated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Failed to activate user. Please try again.');
    }
  };

  const handleDelete = async (user) => {
    // Confirmation with user details
    const confirmMessage = `⚠️ DELETE USER PERMANENTLY?\n\n` +
      `Username: ${user.username}\n` +
      `Name: ${user.full_name}\n` +
      `Role: ${user.role}\n\n` +
      `This action CANNOT be undone!\n` +
      `All associated data (results, profiles) will be deleted.\n\n` +
      `Type "DELETE" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== 'DELETE') {
      if (userInput !== null) {
        alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    console.log('🗑️ Deleting user:', user.username);
    
    try {
      await userAPI.deleteUser(user.id);
      console.log('✅ User deleted successfully');
      alert(`User "${user.full_name}" has been permanently deleted.`);
      
      // Immediately refresh the user list
      await fetchUsers();
      
      // Also refresh classes if it was a teacher
      if (user.role === 'teacher') {
        await fetchClasses();
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error ||
                       JSON.stringify(error.response?.data) || 
                       'An error occurred';
      alert(`Failed to delete user.\n\nError: ${errorMsg}\n\nThe user may have associated data that prevents deletion.`);
    }
  };

  return (
    <div className="font-serif">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-100 dark:text-gray-100">User Management</h2>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-blue-600 dark:bg-blue-600 text-white px-6 py-3 rounded-3xl font-semibold hover:bg-blue-500 dark:hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50"
        >
          {showForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 dark:border-gray-800 mb-6">
          <h3 className="text-2xl font-semibold mb-6 text-gray-100 dark:text-gray-100">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">Username (Numeric ID)</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  pattern="[0-9]+"
                  title="Username must be numeric"
                  disabled={editingUser !== null}
                />
                {editingUser && (
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">Username cannot be changed</p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="pupil">Pupil</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'pupil' && (
                <div>
                  <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">
                    Class Assignment {editingUser && '(Optional)'}
                    {!editingUser && <span className="text-red-400"> *</span>}
                  </label>
                  <select
                    name="pupil_class"
                    value={formData.pupil_class}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required={!editingUser}
                  >
                    <option value="">{!editingUser ? 'Select a Class (Required)' : 'Select a Class'}</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                    {!editingUser ? (
                      <span className="text-yellow-400 font-semibold">⚠️ Class assignment is required for new pupils</span>
                    ) : (
                      'Update class assignment if needed'
                    )}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium">
                  Confirm Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required={!editingUser}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 dark:bg-blue-600 text-white px-8 py-3 rounded-3xl font-semibold hover:bg-blue-500 dark:hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50"
            >
              {editingUser ? 'Update User' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-900/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 dark:border-gray-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium text-sm">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or username..."
              className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium text-sm">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Roles</option>
              <option value="pupil">Pupils</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium text-sm">Filter by Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl text-gray-100 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Classes</option>
              <option value="unassigned">Unassigned</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 dark:text-gray-300 mb-2 font-medium text-sm">&nbsp;</label>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setFilterClass('all');
              }}
              className="w-full px-4 py-2 bg-gray-700 dark:bg-gray-700 text-gray-100 dark:text-gray-100 rounded-xl hover:bg-gray-600 dark:hover:bg-gray-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/70 dark:bg-gray-900/70 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-800/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 dark:text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 dark:text-gray-300 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 dark:text-gray-300 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400 dark:text-gray-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    <p className="mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400 dark:text-gray-400">No users found</td>
                </tr>
              ) : (
                users
                  .filter(user => {
                    // Filter by role
                    if (filterRole !== 'all' && user.role !== filterRole) return false;
                    
                    // Filter by class
                    if (filterClass !== 'all') {
                      if (filterClass === 'unassigned') {
                        if (user.pupil_profile?.pupil_class) return false;
                      } else {
                        if (user.pupil_profile?.pupil_class !== parseInt(filterClass)) return false;
                      }
                    }
                    
                    // Filter by search term
                    if (searchTerm) {
                      const search = searchTerm.toLowerCase();
                      return (
                        user.full_name.toLowerCase().includes(search) ||
                        user.username.toLowerCase().includes(search)
                      );
                    }
                    
                    return true;
                  })
                  .map((user) => {
                  const className = user.pupil_profile?.pupil_class_name || 
                                   classes.find(c => c.id === user.pupil_profile?.pupil_class)?.name || 
                                   'N/A';
                  return (
                    <tr key={user.id} className="hover:bg-gray-800/30 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-gray-100 dark:text-gray-100 font-medium">{user.username}</td>
                      <td className="px-6 py-4 text-gray-100 dark:text-gray-100">{user.full_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          user.role === 'teacher' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'pupil' ? (
                          <span className={`text-sm font-medium ${className !== 'N/A' ? 'text-blue-400 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500'}`}>
                            {className}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-600 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300 dark:text-gray-300">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-400 dark:text-blue-400 hover:text-blue-300 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          {user.is_active ? (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="text-orange-400 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-300 text-sm font-semibold transition-colors"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="text-green-400 dark:text-green-400 hover:text-green-300 dark:hover:text-green-300 text-sm font-semibold transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-500 dark:text-red-500 hover:text-red-400 dark:hover:text-red-400 text-sm font-bold transition-colors"
                            title="Permanently delete this user"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
