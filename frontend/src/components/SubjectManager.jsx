import { useState, useEffect } from 'react';
import { subjectAPI, classAPI } from '../api/axios';

const SubjectManager = ({ initialOpenForm = false, actionTrigger }) => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    assigned_class: '',
    description: '',
  });

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (actionTrigger !== undefined) {
      setShowForm(initialOpenForm);
      if (initialOpenForm) {
        setEditingSubject(null);
        setFormData({
          name: '',
          code: '',
          assigned_class: '',
          description: '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionTrigger]);

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getSubjects();
      setSubjects(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
    try {
      if (editingSubject) {
        await subjectAPI.updateSubject(editingSubject.id, formData);
        alert('Subject updated successfully!');
      } else {
        await subjectAPI.createSubject(formData);
        alert('Subject created successfully!');
      }
      
      setShowForm(false);
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        assigned_class: '',
        description: '',
      });
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert(editingSubject ? 'Failed to update subject' : 'Failed to create subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      assigned_class: subject.assigned_class,
      description: subject.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete subject "${subjectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await subjectAPI.deleteSubject(subjectId);
      alert('Subject deleted successfully!');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject. There might be results associated with it.');
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      assigned_class: '',
      description: '',
    });
  };

  const getClassName = (classId) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.name : 'N/A';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Subject Management</h2>
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
          {showForm ? 'Cancel' : 'Add New Subject'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingSubject ? 'Edit Subject' : 'Create New Subject'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Subject Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, English"
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., MATH, ENG"
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Assigned Class</label>
                <select
                  name="assigned_class"
                  value={formData.assigned_class}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  required
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
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  rows="2"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {editingSubject ? 'Update Subject' : 'Create Subject'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50">
          <h3 className="text-lg font-semibold">All Subjects</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No subjects found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-blue-600">{subject.code}</td>
                    <td className="px-6 py-4">{subject.name}</td>
                    <td className="px-6 py-4">{getClassName(subject.assigned_class)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subject.description || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id, subject.name)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManager;
