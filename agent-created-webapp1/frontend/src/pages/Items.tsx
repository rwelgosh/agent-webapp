import React, { useEffect, useState } from 'react';
import { DataService, Item } from '../services/DataService';
import ItemCreateForm from '../components/ItemCreateForm';

const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch items from API
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedItems = await DataService.getItems();
      setItems(fetchedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);
  
  const handleDeleteItem = async (id: number) => {
    try {
      const success = await DataService.deleteItem(id);
      
      if (success) {
        // Remove the deleted item from the state
        setItems(items.filter(item => item.id !== id));
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting item:', err);
    }
  };
  
  return (
    <div className="items-container">
      <h2>Your Items</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any items yet. Create one using the form below.</p>
        </div>
      ) : (
        <ul className="items-list">
          {items.map(item => (
            <li key={item.id} className="item-card">
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <div className="item-meta">
                <span className="item-date">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button 
                  className="btn btn-small btn-danger" 
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <div className="item-form-container">
        <ItemCreateForm onItemCreated={fetchItems} />
      </div>
    </div>
  );
};

export default Items; 