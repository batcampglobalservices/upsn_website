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
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-gray-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Subject Management
            </h2>
            <p className="text-sm text-gray-400 mt-1">Create and manage subjects for your school</p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                handleCancelEdit();
              } else {
                setShowForm(true);
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            {showForm ? '✕ Cancel' : '+ Add New Subject'}
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {editingSubject ? 'Edit Subject' : 'Create New Subject'}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {editingSubject ? 'Update subject information' : 'Fill in the details to create a new subject'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Subject Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, English"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-100 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Subject Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., MATH, ENG"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-100 placeholder-gray-500 uppercase"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Assigned Class <span className="text-red-400">*</span>
                </label>
                <select
                  name="assigned_class"
                  value={formData.assigned_class}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-100"
                  required
                >
                  <option value="" className="bg-gray-800">Select Class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id} className="bg-gray-800">
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Description <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-100 placeholder-gray-500 resize-none"
                  rows="3"
                  placeholder="Optional description about the subject"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-800">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
                >
                  {editingSubject ? '✓ Update Subject' : '+ Create Subject'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-semibold transition-all border border-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subjects List */}
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-gray-100">All Subjects</h3>
          <p className="text-sm text-gray-400 mt-1">
            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} registered
          </p>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400 text-lg font-semibold">No subjects found</p>
            <p className="text-gray-500 mt-2">Create your first subject to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800/50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subject Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-100 font-semibold">{subject.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {getClassName(subject.assigned_class)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                      {subject.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-semibold transition-all border border-blue-500/30 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id, subject.name)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-semibold transition-all border border-red-500/30 text-sm"
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
