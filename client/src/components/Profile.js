import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUser, FaLock, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    address: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileForm.name || profileForm.name.length < 20) {
      newErrors.name = 'Name must be at least 20 characters long';
    } else if (profileForm.name.length > 60) {
      newErrors.name = 'Name must be at most 60 characters long';
    }

    if (!profileForm.address) {
      newErrors.address = 'Address is required';
    } else if (profileForm.address.length > 400) {
      newErrors.address = 'Address must be at most 400 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (passwordForm.newPassword.length > 16) {
      newErrors.newPassword = 'Password must be at most 16 characters long';
    } else if (!/(?=.*[A-Z])/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setLoading(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        {/* Profile Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <FaUser style={{ marginRight: '10px' }} />
              Profile Information
            </h2>
          </div>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                minLength="20"
                maxLength="60"
                required
              />
              {errors.name && <div className="alert alert-danger">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled
              />
              <small className="text-muted">Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <textarea
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                maxLength="400"
                rows="3"
                required
              />
              {errors.address && <div className="alert alert-danger">{errors.address}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                type="text"
                className="form-control"
                value={user.role.replace('_', ' ')}
                disabled
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave style={{ marginRight: '5px' }} />
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <FaLock style={{ marginRight: '10px' }} />
              Change Password
            </h2>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              {errors.currentPassword && <div className="alert alert-danger">{errors.currentPassword}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                minLength="8"
                maxLength="16"
                required
              />
              {errors.newPassword && <div className="alert alert-danger">{errors.newPassword}</div>}
              <small className="text-muted">
                Password must be 8-16 characters with at least one uppercase letter and one special character
              </small>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
              {errors.confirmPassword && <div className="alert alert-danger">{errors.confirmPassword}</div>}
            </div>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              <FaLock style={{ marginRight: '5px' }} />
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Account Information */}
      <div className="card" style={{ marginTop: '30px' }}>
        <div className="card-header">
          <h3 className="card-title">Account Information</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <strong>User ID:</strong> {user.id}
          </div>
          <div>
            <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Account Status:</strong> 
            <span className="badge badge-success" style={{ marginLeft: '10px' }}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 