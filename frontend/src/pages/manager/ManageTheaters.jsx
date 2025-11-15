import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../lib/api';
import { toast } from '../../lib/toast';
import { FiHome, FiMapPin, FiPhone, FiMail, FiEdit, FiUpload, FiLoader, FiX, FiGrid } from 'react-icons/fi';

export default function ManageTheaters() {
  const { myTheaters, setMyTheaters } = useOutletContext();
  const [editingTheater, setEditingTheater] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenModal = (theater) => {
    setEditingTheater(theater);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTheater(null);
  };

  const handleLogoUpload = async (theaterId, file) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post(`/theaters/${theaterId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { logo, logoPublicId } = response.data.data;
      
      // Update theater in state
      setMyTheaters((prev) =>
        prev.map((t) => t._id === theaterId ? { ...t, logo, logoPublicId } : t)
      );
      
      // Update editing theater if modal is open
      if (editingTheater?._id === theaterId) {
        setEditingTheater((prev) => ({ ...prev, logo, logoPublicId }));
      }
      
      toast.success('Logo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error('Logo upload failed', err.response?.data?.message || err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!myTheaters || myTheaters.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
        <FiHome className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Theaters Assigned</h2>
        <p className="text-white/70">
          You are not currently assigned to manage any theaters. Please contact an admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">My Theaters</h2>
        <p className="text-sm text-gray-400">Manage your assigned theaters</p>
      </div>

      {/* Theater Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myTheaters.map((theater) => (
          <TheaterCard
            key={theater._id}
            theater={theater}
            onEdit={() => handleOpenModal(theater)}
            onLogoUpload={(file) => handleLogoUpload(theater._id, file)}
            isUploading={isUploading}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingTheater && (
        <EditTheaterModal
          theater={editingTheater}
          onClose={handleCloseModal}
          onUpdate={(updatedTheater) => {
            setMyTheaters((prev) =>
              prev.map((t) => (t._id === updatedTheater._id ? updatedTheater : t))
            );
            handleCloseModal();
          }}
          onLogoUpload={(file) => handleLogoUpload(editingTheater._id, file)}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}

// Theater Card Component
function TheaterCard({ theater, onEdit, onLogoUpload, isUploading }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-brand/50 transition-all duration-300 group">
      {/* Logo Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {theater.logo ? (
          <img 
            src={theater.logo} 
            alt={theater.name}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <FiHome className="w-20 h-20 text-gray-600" />
        )}
        
        {/* Logo Upload Overlay */}
        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
          <div className="text-center">
            {isUploading ? (
              <FiLoader className="w-8 h-8 text-white animate-spin mx-auto" />
            ) : (
              <>
                <FiUpload className="w-8 h-8 text-white mx-auto mb-2" />
                <span className="text-white text-sm font-medium">Change Logo</span>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => onLogoUpload(e.target.files[0])}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Theater Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3">{theater.name}</h3>
        
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center">
            <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{theater.city}</span>
          </div>
          
          {theater.contact?.phone && (
            <div className="flex items-center">
              <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{theater.contact.phone}</span>
            </div>
          )}
          
          {theater.contact?.email && (
            <div className="flex items-center">
              <FiMail className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{theater.contact.email}</span>
            </div>
          )}
          
          {theater.screens && theater.screens.length > 0 && (
            <div className="flex items-center">
              <FiGrid className="w-4 h-4 mr-2 text-gray-400" />
              <span>{theater.screens.length} Screen{theater.screens.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Facilities */}
        {theater.facilities && theater.facilities.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {theater.facilities.slice(0, 3).map((facility, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-brand/20 text-brand text-xs rounded-full"
                >
                  {facility}
                </span>
              ))}
              {theater.facilities.length > 3 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  +{theater.facilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg transition-colors"
        >
          <FiEdit className="w-4 h-4 mr-2" />
          Edit Theater
        </button>
      </div>
    </div>
  );
}

// Edit Theater Modal
function EditTheaterModal({ theater, onClose, onUpdate, onLogoUpload, isUploading }) {
  const [formData, setFormData] = useState({
    name: theater.name || '',
    city: theater.city || '',
    facilities: theater.facilities?.join(', ') || '',
    contactPhone: theater.contact?.phone || '',
    contactEmail: theater.contact?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        facilities: formData.facilities.split(',').map((f) => f.trim()).filter(Boolean),
        contact: {
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
      };

      const res = await api.patch(`/theaters/${theater._id}`, payload);
      onUpdate(res.data.data.theater);
      toast.success('Theater details updated!');
    } catch (err) {
      toast.error('Update failed', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-700 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Edit Theater</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theater Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {theater.logo ? (
                    <img 
                      src={theater.logo} 
                      alt="Theater Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <FiHome className="w-12 h-12 text-gray-600" />
                  )}
                </div>
                <label className="relative cursor-pointer flex items-center px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                  {isUploading ? (
                    <FiLoader className="animate-spin w-5 h-5 mr-2" />
                  ) : (
                    <FiUpload className="w-5 h-5 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : 'Change Logo'}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => onLogoUpload(e.target.files[0])}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">Upload a logo for your theater (recommended: square image)</p>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Theater Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Phone</label>
                <input
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Facilities (comma-separated)</label>
                <input
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="e.g. Parking, 3D, IMAX, Food Court"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
