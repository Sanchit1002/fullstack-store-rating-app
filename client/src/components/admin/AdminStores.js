import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSort } from 'react-icons/fa';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });

  useEffect(() => {
    fetchStores();
    fetchUsers();
  }, []);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle the API response structure: { stores: [...] }
      const storesData = response.data.stores || response.data;
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error fetching stores');
      setStores([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle the API response structure: { users: [...] }
      const usersData = response.data.users || response.data;
      // Filter only store owners and normal users (not admins)
      const storeOwners = Array.isArray(usersData) ? usersData.filter(user => 
        user.role === 'store_owner' || user.role === 'user'
      ) : [];
      setUsers(storeOwners);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (editingStore) {
        await axios.put(`/api/admin/stores/${editingStore.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Store updated successfully!');
      } else {
        await axios.post('/api/admin/stores', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Store created successfully!');
      }
      
      setShowForm(false);
      setEditingStore(null);
      resetForm();
      fetchStores();
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error(error.response?.data?.message || 'Error saving store');
    }
  };

  const handleDelete = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/stores/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Store deleted successfully!');
      fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error(error.response?.data?.message || 'Error deleting store');
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      ownerId: ''
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedStores = (Array.isArray(stores) ? stores : [])
    .filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesOwner = !ownerFilter || store.ownerId === parseInt(ownerFilter);
      return matchesSearch && matchesOwner;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Manage Stores</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                setEditingStore(null);
                resetForm();
              }}
            >
              <FaPlus /> Add New Store
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-bar">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search by name, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto' }}
            >
              <option value="">All Owners</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stores Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Name <FaSort />
                </th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email <FaSort />
                </th>
                <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                  Address <FaSort />
                </th>
                <th>Owner</th>
                <th>Average Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStores.map(store => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>
                    {store.ownerName || 'No Owner'}
                  </td>
                  <td>
                    {store.average_rating && parseFloat(store.average_rating) > 0 ? (
                      <span>
                        {parseFloat(store.average_rating).toFixed(1)} ⭐ ({store.total_ratings || 0} ratings)
                      </span>
                    ) : (
                      <span style={{ color: '#666' }}>No ratings yet</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(store)}
                      style={{ marginRight: '5px' }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(store.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedStores.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            No stores found matching your criteria.
          </p>
        )}
      </div>

      {/* Add/Edit Store Form */}
      {showForm && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Store Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  minLength="2"
                  maxLength="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  maxLength="400"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner (Optional)</label>
                <select
                  className="form-control"
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                >
                  <option value="">No Owner</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStore(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStore ? 'Update Store' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores; 