import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

const GalleryModal = ({ isOpen, onClose, program, onUpdate }) => {
  const [gallery, setGallery] = useState(program.gallery || []);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    display_order: gallery.length + 1
  });

  if (!isOpen || !program) return null;

  const handleAddImage = async (e) => {
    e.preventDefault();
    
    if (!formData.image_url.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.addGalleryImage(program.id, {
        image_url: formData.image_url,
        caption: formData.caption,
        display_order: formData.display_order
      });

      if (response.success) {
        setGallery([...gallery, response.data]);
        setFormData({
          image_url: '',
          caption: '',
          display_order: gallery.length + 2
        });
        toast.success('Image added successfully');
      }
    } catch (error) {
      console.error('Add image error:', error);
      toast.error('Failed to add image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setLoading(true);
      const response = await adminAPI.removeGalleryImage(imageId);

      if (response.success) {
        setGallery(gallery.filter(img => img.id !== imageId));
        toast.success('Image deleted successfully');
      }
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Program Gallery</h2>
            <p className="text-sm text-gray-500 mt-1">{program.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add Image Form */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Gallery Image</h3>
            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Image description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaPlus size={16} />
                Add Image
              </button>
            </form>
          </div>

          {/* Gallery Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gallery Images ({gallery.length})
            </h3>
            
            {gallery.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <FaImage className="text-gray-400 text-4xl mx-auto mb-3" />
                <p className="text-gray-500">No images in gallery yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((image) => (
                  <div key={image.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group">
                    <div className="relative">
                      <img
                        src={image.image_url}
                        alt={image.caption}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={loading}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.caption || 'No caption'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order: {image.display_order}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
