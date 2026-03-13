import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Profile component for user profile management
 * Allows users to view and update their profile information
 */
const Profile = () => {
  const [user, setUser] = useState({
    email: '',
    is_active: true,
    is_superuser: false,
    created_at: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          throw new Error('Failed to fetch profile');
        }
      } catch (err) {
        setError('Error fetching profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  /**
   * Handles form input changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission to update profile
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        setSuccess('Profile updated successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Update failed');
      }
    } catch (err) {
      setError(err.message || 'Error updating profile');
    }
  };

  if (loading) {
    return <div className="profile">Loading...</div>;
  }

  return (
    <div className="profile">
      <h2>User Profile</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="created_at">Member Since:</label>
          <input
            type="text"
            id="created_at"
            name="created_at"
            value={new Date(user.created_at).toLocaleDateString()}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={user.is_active}
              onChange={(e) => setUser({...user, is_active: e.target.checked})}
              disabled
            />
            Active Account
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="is_superuser"
              checked={user.is_superuser}
              onChange={(e) => setUser({...user, is_superuser: e.target.checked})}
              disabled
            />
            Administrator
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;