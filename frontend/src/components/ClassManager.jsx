import { useState, useEffect } from 'react';
import { classAPI, userAPI } from '../api/axios';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 'JSS1',
    assigned_teacher: '',
    description: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'teacher' });
      setTeachers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await classAPI.updateClass(editingClass.id, formData);
        alert('Class updated successfully!');
      } else {
        await classAPI.createClass(formData);
        alert('Class created successfully!');
      }
      setShowForm(false);
      setEditingClass(null);
      setFormData({
        name: '',
        level: 'JSS1',
        assigned_teacher: '',
        description: '',
      });
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      alert(editingClass ? 'Failed to update class' : 'Failed to create class');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      level: classItem.level,
      assigned_teacher: classItem.assigned_teacher || '',
      description: classItem.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (classId, className) => {
    if (!window.confirm(`Are you sure you want to delete class "${className}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await classAPI.deleteClass(classId);
      alert('Class deleted successfully!');
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. There might be students or results associated with it.');
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingClass(null);
    setFormData({
      name: '',
      level: 'JSS1',
      assigned_teacher: '',
      description: '',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Class Management</h2>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showForm ? 'Cancel' : 'Add New Class'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingClass ? 'Edit Class' : 'Create New Class'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Class Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., JSS1A, SS2B"
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="JSS1">JSS 1</option>
                  <option value="JSS2">JSS 2</option>
                  <option value="JSS3">JSS 3</option>
                  <option value="SS1">SS 1</option>
                  <option value="SS2">SS 2</option>
                  <option value="SS3">SS 3</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Assigned Teacher</label>
                <select
                  name="assigned_teacher"
                  value={formData.assigned_teacher}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  rows="2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {editingClass ? 'Update Class' : 'Create Class'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50">
          <h3 className="text-lg font-semibold">All Classes</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No classes found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {classes.map((classItem) => (
              <div key={classItem.id} className="border rounded p-4 hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold text-blue-600 mb-2">{classItem.name}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Level:</span> {classItem.level}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Teacher:</span> {classItem.assigned_teacher_name || 'Not assigned'}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-semibold">Students:</span> {classItem.student_count || 0}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id, classItem.name)}
                    className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManager;
