import React, { useState, FormEvent } from 'react';
import { DataService } from '../services/DataService';

interface ItemCreateFormProps {
  onItemCreated?: () => void;
}

const ItemCreateForm: React.FC<ItemCreateFormProps> = ({ onItemCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create the item via API
      await DataService.createItem({ title, content });
      
      // Reset the form
      setTitle('');
      setContent('');
      setSuccess('Item created successfully!');
      
      // Notify parent component (if callback provided)
      if (onItemCreated) {
        onItemCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      console.error('Error creating item:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="item-form">
      <h3>Create New Item</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="Enter item title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            placeholder="Enter item content"
            rows={4}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
};

export default ItemCreateForm; 