import { useState, useEffect } from 'react';
import { classAPI, userAPI, pupilAPI } from '../api/axios';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pupils, setPupils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [showPupilsModal, setShowPupilsModal] = useState(null);
  const [classPupils, setClassPupils] = useState([]);
  const [availablePupils, setAvailablePupils] = useState([]);
  const [selectedPupils, setSelectedPupils] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    level: 'JSS1',
    assigned_teacher: '',
    description: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchPupils();
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

  const fetchPupils = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'pupil' });
      setPupils(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching pupils:', error);
    }
  };

  const fetchClassPupils = async (classId) => {
    try {
      const response = await classAPI.getPupils(classId);
      setClassPupils(response.data.results || response.data);
      
      // Get pupils not in this class
      const pupilsInClass = response.data.results || response.data;
      const pupilIdsInClass = pupilsInClass.map(p => p.id);
      const available = pupils.filter(p => !pupilIdsInClass.includes(p.id));
      setAvailablePupils(available);
    } catch (error) {
      console.error('Error fetching class pupils:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        console.log('📝 Updating class:', editingClass.name);
        await classAPI.updateClass(editingClass.id, formData);
        console.log('✅ Class updated successfully');
        alert('Class updated successfully!');
      } else {
        console.log('➕ Creating new class:', formData.name);
        await classAPI.createClass(formData);
        console.log('✅ Class created successfully');
        alert('Class created successfully!');
      }
      
      // Reset form
      setShowForm(false);
      setEditingClass(null);
      setFormData({
        name: '',
        level: 'JSS1',
        assigned_teacher: '',
        description: '',
      });
      
      // Immediately refresh data
      await fetchClasses();
      await fetchPupils(); // Refresh pupils too
      
    } catch (error) {
      console.error('❌ Error saving class:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.detail || 
                       JSON.stringify(error.response?.data) || 
                       'An error occurred';
      alert(`${editingClass ? 'Failed to update class' : 'Failed to create class'}\n\nError: ${errorMsg}`);
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

    console.log('🗑️ Deleting class:', className);
    
    try {
      await classAPI.deleteClass(classId);
      console.log('✅ Class deleted successfully');
      alert('Class deleted successfully!');
      
      // Immediately refresh data
      await fetchClasses();
      await fetchPupils();
      
    } catch (error) {
      console.error('❌ Error deleting class:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error ||
                       'There might be pupils or results associated with it.';
      alert(`Failed to delete class.\n\nError: ${errorMsg}`);
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

  const handleShowPupils = async (classItem) => {
    setShowPupilsModal(classItem);
    await fetchClassPupils(classItem.id);
  };

  const handleAddPupilsToClass = async () => {
    if (selectedPupils.length === 0) {
      alert('Please select at least one pupil to add');
      return;
    }

    console.log(`➕ Adding ${selectedPupils.length} pupils to class ${showPupilsModal.name}`);
    
    try {
      // Update each selected pupil's profile with the new class
      for (const pupilId of selectedPupils) {
        const pupil = pupils.find(p => p.id === pupilId);
        if (pupil && pupil.pupil_profile) {
          await pupilAPI.updateProfile(pupil.pupil_profile.id, {
            pupil_class: showPupilsModal.id
          });
        }
      }
      
      console.log('✅ Pupils added successfully');
      alert(`Successfully added ${selectedPupils.length} pupil(s) to ${showPupilsModal.name}`);
      setSelectedPupils([]);
      
      // Immediately refresh data
      await fetchClassPupils(showPupilsModal.id);
      await fetchClasses();
      await fetchPupils();
      
    } catch (error) {
      console.error('❌ Error adding pupils to class:', error);
      alert('Failed to add pupils to class. Please try again.');
    }
  };

  const handleRemovePupilFromClass = async (pupil) => {
    if (!window.confirm(`Remove ${pupil.full_name} from ${showPupilsModal.name}?`)) {
      return;
    }

    console.log(`➖ Removing pupil ${pupil.full_name} from class`);
    
    try {
      await pupilAPI.updateProfile(pupil.pupil_profile.id, {
        pupil_class: null
      });
      
      console.log('✅ Pupil removed successfully');
      alert(`${pupil.full_name} removed from class successfully`);
      
      // Immediately refresh data
      await fetchClassPupils(showPupilsModal.id);
      await fetchClasses();
      await fetchPupils();
      
    } catch (error) {
      console.error('❌ Error removing pupil from class:', error);
      alert('Failed to remove pupil from class. Please try again.');
    }
  };

  const handlePupilSelection = (pupilId) => {
    setSelectedPupils(prev => {
      if (prev.includes(pupilId)) {
        return prev.filter(id => id !== pupilId);
      } else {
        return [...prev, pupilId];
      }
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
                  <span className="font-semibold">Pupils:</span> {classItem.pupil_count || 0}
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2">
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
                  <button
                    onClick={() => handleShowPupils(classItem)}
                    className="w-full bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    Manage Pupils ({classItem.pupil_count || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pupils Management Modal */}
      {showPupilsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                Manage Pupils - {showPupilsModal.name}
              </h3>
              <button
                onClick={() => {
                  setShowPupilsModal(null);
                  setSelectedPupils([]);
                  setClassPupils([]);
                  setAvailablePupils([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Current Pupils in Class */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">
                  Current Pupils ({classPupils.length})
                </h4>
                {classPupils.length === 0 ? (
                  <p className="text-gray-500 italic">No pupils assigned to this class yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classPupils.map((pupil) => (
                      <div key={pupil.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{pupil.full_name}</p>
                          <p className="text-sm text-gray-600">ID: {pupil.username}</p>
                        </div>
                        <button
                          onClick={() => handleRemovePupilFromClass(pupil)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Pupils Section */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800">
                  Add Pupils to Class
                </h4>
                {availablePupils.length === 0 ? (
                  <p className="text-gray-500 italic">No available pupils to add.</p>
                ) : (
                  <>
                    <div className="mb-3 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Select pupils to add ({selectedPupils.length} selected)
                      </p>
                      <button
                        onClick={handleAddPupilsToClass}
                        disabled={selectedPupils.length === 0}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Add Selected Pupils
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded p-3">
                      {availablePupils.map((pupil) => (
                        <div
                          key={pupil.id}
                          className={`flex items-center p-3 border rounded cursor-pointer hover:bg-blue-50 ${
                            selectedPupils.includes(pupil.id) ? 'bg-blue-100 border-blue-500' : ''
                          }`}
                          onClick={() => handlePupilSelection(pupil.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPupils.includes(pupil.id)}
                            onChange={() => {}}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium">{pupil.full_name}</p>
                            <p className="text-sm text-gray-600">ID: {pupil.username}</p>
                            <p className="text-xs text-gray-500">
                              {pupil.pupil_profile?.pupil_class_name || 'No class assigned'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
