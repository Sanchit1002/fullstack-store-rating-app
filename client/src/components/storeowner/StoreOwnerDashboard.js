import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaStore, FaStar, FaUsers } from 'react-icons/fa';

const StoreOwnerDashboard = () => {
  const [myStores, setMyStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyStores();
  }, []);

  const fetchMyStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/my-stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyStores(response.data);
      if (response.data.length > 0) {
        setSelectedStore(response.data[0]);
        fetchStoreRatings(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error fetching your stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRatings = async (storeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/ratings/store/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStoreRatings(response.data);
    } catch (error) {
      console.error('Error fetching store ratings:', error);
      toast.error('Error fetching store ratings');
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    fetchStoreRatings(store.id);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (myStores.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Stores</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FaStore style={{ fontSize: '48px', color: '#666', marginBottom: '20px' }} />
            <h3>No Stores Found</h3>
            <p style={{ color: '#666' }}>
              You don't have any stores assigned to you yet. Please contact an administrator to assign stores to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My Stores Dashboard</h2>
        </div>

        {/* Store Selection */}
        <div style={{ marginBottom: '30px' }}>
          <label className="form-label">Select Store:</label>
          <select
            className="form-control"
            value={selectedStore?.id || ''}
            onChange={(e) => {
              const store = myStores.find(s => s.id === parseInt(e.target.value));
              handleStoreSelect(store);
            }}
          >
            {myStores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {selectedStore && (
          <>
            {/* Store Overview */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">
                  {selectedStore.averageRating ? selectedStore.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="stat-label">Average Rating</div>
                <div style={{ marginTop: '10px' }}>
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      style={{
                        color: index < Math.round(selectedStore.averageRating || 0) ? '#ffd700' : '#ddd',
                        fontSize: '20px'
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{storeRatings.length}</div>
                <div className="stat-label">Total Ratings</div>
                <FaUsers style={{ fontSize: '24px', color: '#007bff', marginTop: '10px' }} />
              </div>
              <div className="stat-card">
                <div className="stat-number">{selectedStore.name}</div>
                <div className="stat-label">Store Name</div>
                <FaStore style={{ fontSize: '24px', color: '#28a745', marginTop: '10px' }} />
              </div>
            </div>

            {/* Store Details */}
            <div className="card" style={{ marginBottom: '30px' }}>
              <div className="card-header">
                <h3 className="card-title">Store Details</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <strong>Name:</strong> {selectedStore.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedStore.email}
                </div>
                <div>
                  <strong>Address:</strong> {selectedStore.address}
                </div>
                <div>
                  <strong>Average Rating:</strong> {selectedStore.averageRating ? selectedStore.averageRating.toFixed(1) : 'No ratings yet'}
                </div>
              </div>
            </div>

            {/* Ratings List */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">User Ratings</h3>
              </div>
              {storeRatings.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Submitted On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeRatings.map(rating => (
                        <tr key={rating.id}>
                          <td>{rating.userName}</td>
                          <td>{rating.userEmail}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span>{rating.rating}</span>
                              <div style={{ display: 'flex' }}>
                                {[...Array(5)].map((_, index) => (
                                  <FaStar
                                    key={index}
                                    style={{
                                      color: index < rating.rating ? '#ffd700' : '#ddd',
                                      fontSize: '16px'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td>{new Date(rating.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <FaStar style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }} />
                  <h4>No Ratings Yet</h4>
                  <p>This store hasn't received any ratings from users yet.</p>
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            {storeRatings.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Rating Distribution</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = storeRatings.filter(r => r.rating === stars).length;
                    const percentage = ((count / storeRatings.length) * 100).toFixed(1);
                    return (
                      <div key={stars} style={{ textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                          {[...Array(stars)].map((_, index) => (
                            <FaStar key={index} style={{ color: '#ffd700', fontSize: '20px' }} />
                          ))}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                          {count}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard; 