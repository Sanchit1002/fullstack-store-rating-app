import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUsers, FaStore, FaStar, FaChartBar } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error fetching dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Admin Dashboard</h2>
        </div>

        {/* Statistics Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
            <FaUsers style={{ fontSize: '24px', color: '#007bff', marginTop: '10px' }} />
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalStores}</div>
            <div className="stat-label">Total Stores</div>
            <FaStore style={{ fontSize: '24px', color: '#28a745', marginTop: '10px' }} />
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalRatings}</div>
            <div className="stat-label">Total Ratings</div>
            <FaStar style={{ fontSize: '24px', color: '#ffc107', marginTop: '10px' }} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <h4>Manage Users</h4>
              </div>
              <p>Add, edit, and delete users. Manage user roles and permissions.</p>
              <a href="/admin/users" className="btn btn-primary">
                Go to User Management
              </a>
            </div>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <h4>Manage Stores</h4>
              </div>
              <p>Add, edit, and delete stores. Assign store owners to stores.</p>
              <a href="/admin/stores" className="btn btn-primary">
                Go to Store Management
              </a>
            </div>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <h4>System Analytics</h4>
              </div>
              <p>View detailed analytics and system performance metrics.</p>
              <a href="/admin/analytics" className="btn btn-primary">
                View Analytics
              </a>
            </div>
          </div>
        </div>


        {/* Recent Activity */}
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <FaChartBar style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }} />
            <h4>Activity Tracking</h4>
            <p>Recent activity tracking will be implemented in future versions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 