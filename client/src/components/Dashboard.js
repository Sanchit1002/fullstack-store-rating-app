import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'store_owner':
        return 'Store Owner';
      case 'user':
        return 'Normal User';
      default:
        return role;
    }
  };

  const getWelcomeMessage = (role) => {
    switch (role) {
      case 'admin':
        return 'Welcome to the Admin Dashboard. You can manage users, stores, and view system statistics.';
      case 'store_owner':
        return 'Welcome to your Store Owner Dashboard. View your stores and their ratings.';
      case 'user':
        return 'Welcome to the Store Ratings Platform. Browse stores and submit your ratings.';
      default:
        return 'Welcome to the Store Ratings Platform.';
    }
  };

  const getQuickActions = (role) => {
    switch (role) {
      case 'admin':
        return [
          { title: 'Manage Users', description: 'Add, edit, and delete users', link: '/admin/users' },
          { title: 'Manage Stores', description: 'Add, edit, and delete stores', link: '/admin/stores' },
          { title: 'View Statistics', description: 'View system dashboard', link: '/admin' }
        ];
      case 'store_owner':
        return [
          { title: 'My Stores', description: 'View your stores and ratings', link: '/store-owner' },
          { title: 'Browse All Stores', description: 'View all stores on the platform', link: '/stores' }
        ];
      case 'user':
        return [
          { title: 'Browse Stores', description: 'View and rate stores', link: '/stores' },
          { title: 'My Ratings', description: 'View your submitted ratings', link: '/profile' }
        ];
      default:
        return [];
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Dashboard</h1>
        </div>
        
        <div className="alert alert-success">
          <h3>Welcome, {user.name}!</h3>
          <p><strong>Role:</strong> {getRoleDisplayName(user.role)}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address}</p>
        </div>

        <div className="alert alert-info">
          <p>{getWelcomeMessage(user.role)}</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="stores-grid">
            {getQuickActions(user.role).map((action, index) => (
              <div key={index} className="store-card">
                <div className="card-header">
                  <h4>{action.title}</h4>
                </div>
                <div className="card-body">
                  <p>{action.description}</p>
                  <a href={action.link} className="btn btn-primary">
                    Go to {action.title}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {user.role === 'user' && (
          <div className="card mt-3">
            <div className="card-header">
              <h3>Getting Started</h3>
            </div>
            <div>
              <h4>How to use the platform:</h4>
              <ol>
                <li>Browse stores using the "Browse Stores" link above</li>
                <li>Search for stores by name or address</li>
                <li>Click on a store to view details</li>
                <li>Submit your rating (1-5 stars) for stores you've visited</li>
                <li>Update your ratings anytime</li>
                <li>View your profile to see all your submitted ratings</li>
              </ol>
            </div>
          </div>
        )}

        {user.role === 'store_owner' && (
          <div className="card mt-3">
            <div className="card-header">
              <h3>Store Owner Features</h3>
            </div>
            <div>
              <h4>What you can do:</h4>
              <ul>
                <li>View all your registered stores</li>
                <li>See the average rating for each store</li>
                <li>View detailed ratings and feedback</li>
                <li>Monitor store performance</li>
                <li>Update your profile information</li>
              </ul>
            </div>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="card mt-3">
            <div className="card-header">
              <h3>Administrator Features</h3>
            </div>
            <div>
              <h4>What you can do:</h4>
              <ul>
                <li>View system statistics and dashboard</li>
                <li>Add, edit, and delete users</li>
                <li>Add, edit, and delete stores</li>
                <li>Assign store owners to stores</li>
                <li>View all ratings and manage the platform</li>
                <li>Filter and sort all data</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 