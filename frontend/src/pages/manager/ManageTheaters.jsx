import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../lib/api';
import { toast } from '../../lib/toast';

export default function ManageTheaters() {
  // Get data from the parent ManagerDashboard layout
  const { myTheaters, setMyTheaters } = useOutletContext();

  if (!myTheaters || myTheaters.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No Theaters Assigned</h2>
        <p className="text-white/70">
          You are not currently assigned to manage any theaters. Please contact an admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {myTheaters.map((theater) => (
        <TheaterEditForm
          key={theater._id}
          theater={theater}
          onUpdate={(updatedTheater) => {
            // Update the theater in the parent state
            setMyTheaters((prev) =>
              prev.map((t) => (t._id === updatedTheater._id ? updatedTheater : t))
            );
          }}
        />
      ))}
    </div>
  );
}

// Sub-component for the edit form
function TheaterEditForm({ theater, onUpdate }) {
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

      // The backend route is protected by `checkTheaterAccess` middleware
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
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-xl p-6"
    >
      <h3 className="text-xl font-semibold mb-4">{theater.name}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Theater Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">City</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contact Phone</label>
          <input
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Facilities (comma-separated)</label>
          <input
            name="facilities"
            value={formData.facilities}
            onChange={handleInputChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            placeholder="e.g. Parking, 3D, IMAX"
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-brand hover:bg-brand-dark transition text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}