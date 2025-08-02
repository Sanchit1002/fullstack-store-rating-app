import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RatingStars from '../RatingStars';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`/api/stores?${params}`);
      setStores(response.data.stores);
    } catch (error) {
      toast.error('Failed to fetch stores');
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/ratings/${storeId}`, { rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Rating submitted successfully!');
      fetchStores(); // Refresh to get updated ratings
    } catch (error) {
      toast.error('Failed to submit rating');
      console.error('Error submitting rating:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <div className="loading">Loading stores...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Browse Stores</h1>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search stores by name or address..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">Sort by:</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="address">Address</option>
              <option value="average_rating">Rating</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Order:</label>
            <select
              className="filter-select"
              value={sortOrder}
              onChange={handleSortOrderChange}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="alert alert-warning">
            No stores found. {search && 'Try adjusting your search criteria.'}
          </div>
        ) : (
          <div className="stores-grid">
            {stores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="card-header">
                  <h3>{store.name}</h3>
                </div>
                
                <div className="card-body">
                  <div className="store-info">
                    <p><strong>Email:</strong> {store.email}</p>
                    <p><strong>Address:</strong> {store.address}</p>
                    <p><strong>Average Rating:</strong> {store.average_rating} / 5</p>
                    <p><strong>Total Ratings:</strong> {store.total_ratings}</p>
                    {store.user_rating && (
                      <p><strong>Your Rating:</strong> {store.user_rating} / 5</p>
                    )}
                  </div>

                  <RatingStars
                    storeId={store.id}
                    userRating={store.user_rating}
                    onRatingChange={(rating) => handleRatingSubmit(store.id, rating)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores; 