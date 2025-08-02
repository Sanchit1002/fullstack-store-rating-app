import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'store_owner':
        return 'Store Owner';
      case 'user':
        return 'Normal User';
      default:
        return role;
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          Store Ratings
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>
          
          {user.role === 'user' && (
            <li>
              <Link to="/stores" className="nav-link">
                Browse Stores
              </Link>
            </li>
          )}
          
          {user.role === 'admin' && (
            <>
              <li>
                <Link to="/admin" className="nav-link">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="nav-link">
                  Manage Users
                </Link>
              </li>
              <li>
                <Link to="/admin/stores" className="nav-link">
                  Manage Stores
                </Link>
              </li>
            </>
          )}
          
          {user.role === 'store_owner' && (
            <li>
              <Link to="/store-owner" className="nav-link">
                My Stores
              </Link>
            </li>
          )}
          
          <li>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
          </li>
          
          <li>
            <div className="d-flex align-items-center gap-2">
              <span className="nav-link">
                {user.name} ({getRoleDisplayName(user.role)})
              </span>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                Logout
              </button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 