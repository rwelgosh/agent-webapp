import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';

interface ProfileFormData {
  username: string;
  email: string;
}

const Profile: React.FC = () => {
  const { state } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: state.user?.username || '',
    email: state.user?.email || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, we would make an API call to update the profile
      // For now, just simulate success
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage({
        text: 'Profile updated successfully!',
        type: 'success'
      });
      
      setIsEditing(false);
      
      // Clear message after a delay
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({
        text: 'Failed to update profile',
        type: 'error'
      });
    }
  };
  
  if (!state.user) {
    return (
      <div className="profile-container">
        <h2>Profile</h2>
        <p>You must be logged in to view your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn">Save Changes</button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="profile-field">
            <strong>Username:</strong> {state.user.username}
          </div>
          <div className="profile-field">
            <strong>Email:</strong> {state.user.email}
          </div>
          <div className="profile-field">
            <strong>User ID:</strong> {state.user.id}
          </div>
          
          <button 
            className="btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile; 