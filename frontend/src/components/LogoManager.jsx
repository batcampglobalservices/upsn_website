import { useState, useEffect } from 'react';
import { mediaAPI } from '../api/axios';

const LogoManager = () => {
  const [currentLogo, setCurrentLogo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      setLoading(true);
      const response = await mediaAPI.getActiveLogo();
      setCurrentLogo(response.data);
    } catch (error) {
      console.error('Error fetching logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a logo image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('logo', selectedFile);
      formData.append('title', 'School Logo');
      formData.append('is_active', true);

      if (currentLogo) {
        await mediaAPI.updateLogo(currentLogo.id, formData);
      } else {
        await mediaAPI.uploadLogo(formData);
      }

      setSelectedFile(null);
      fetchLogo();
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">School Logo Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Logo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Current Logo</h3>
          {loading ? (
            <p>Loading logo...</p>
          ) : currentLogo ? (
            <div>
              <img
                src={currentLogo.logo_url || currentLogo.logo}
                alt="School Logo"
                className="w-full max-w-xs h-auto object-contain border rounded p-4"
              />
              <p className="text-sm text-gray-600 mt-2">
                Uploaded: {new Date(currentLogo.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No logo uploaded yet.</p>
          )}
        </div>

        {/* Upload New Logo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            {currentLogo ? 'Replace Logo' : 'Upload Logo'}
          </h3>
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Logo Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square image (PNG or JPG), max 2MB
              </p>
            </div>

            {selectedFile && (
              <div className="mb-4">
                <p className="text-sm text-gray-700">Selected file: {selectedFile.name}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 w-full"
            >
              {uploading ? 'Uploading...' : currentLogo ? 'Replace Logo' : 'Upload Logo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogoManager;
