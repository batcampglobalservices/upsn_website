import { useState, useEffect } from 'react';
import { mediaAPI } from '../api/axios';

const CarouselManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    order: 0,
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await mediaAPI.getCarouselImages();
      setImages(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select an image');
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append('image', selectedFile);
      data.append('title', formData.title);
      data.append('caption', formData.caption);
      data.append('order', formData.order);
      data.append('is_active', formData.is_active);

      await mediaAPI.createCarouselImage(data);
      
      // Reset form
      setFormData({ title: '', caption: '', order: 0, is_active: true });
      setSelectedFile(null);
      fetchImages();
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await mediaAPI.deleteCarouselImage(id);
      fetchImages();
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Carousel Image Management</h2>

      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Upload New Image</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Caption</label>
            <textarea
              name="caption"
              value={formData.caption}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-gray-700">Active</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Image List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Carousel Images</h3>
        {loading ? (
          <p>Loading images...</p>
        ) : images.length === 0 ? (
          <p className="text-gray-600">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded p-4">
                <img
                  src={image.image_url || image.image}
                  alt={image.title}
                  className="w-full h-48 object-cover rounded mb-2"
                />
                <h4 className="font-semibold">{image.title}</h4>
                <p className="text-sm text-gray-600">{image.caption}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Order: {image.order} | {image.is_active ? 'Active' : 'Inactive'}
                </p>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="mt-2 bg-red-500 text-white px-4 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarouselManager;
