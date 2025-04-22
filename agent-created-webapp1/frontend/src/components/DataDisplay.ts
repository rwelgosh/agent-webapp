// Data Display component
import { DataResponse } from '../services/DataService';

/**
 * Set up the data display component
 */
export function setupDataDisplay(): void {
  // Component setup logic if needed
  console.log('Data display component initialized');
}

/**
 * Update the data display with new data
 */
export function updateDataDisplay(data?: DataResponse['data']): void {
  if (!data) {
    console.error('No data provided to updateDataDisplay');
    return;
  }
  
  const dataContainer = document.getElementById('data-container');
  
  if (!dataContainer) {
    console.error('Data container element not found');
    return;
  }
  
  // Create HTML content based on the data
  let html = `
    <h3>${data.title || 'No Title Available'}</h3>
    <p>${data.content || 'No content available'}</p>
  `;
  
  // If there are items, display them as a list
  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
    html += '<ul class="data-items">';
    data.items.forEach(item => {
      // Check for additional properties that might be in random data
      const extraInfo = item.value !== undefined ? 
        `<span class="item-value">Value: ${item.value}</span>` : '';
      
      const activeStatus = item.isActive !== undefined ? 
        `<span class="item-status ${item.isActive ? 'active' : 'inactive'}">
          Status: ${item.isActive ? 'Active' : 'Inactive'}
        </span>` : '';
      
      html += `
        <li id="item-${item.id}" class="data-item">
          <strong>${item.name}</strong>
          ${extraInfo}
          ${activeStatus}
        </li>
      `;
    });
    html += '</ul>';
  } else {
    html += '<p>No items available</p>';
  }
  
  // Display timestamp if available
  if (data.timestamp) {
    html += `<p class="timestamp">Data timestamp: ${data.timestamp}</p>`;
  }
  
  // Display random factor if available
  if (data.randomFactor !== undefined) {
    const randomFactorValue = typeof data.randomFactor === 'string' 
      ? parseFloat(data.randomFactor).toFixed(2) 
      : data.randomFactor.toFixed(2);
    
    html += `<p class="random-factor">Random factor: ${randomFactorValue}</p>`;
  }
  
  // Update the container with the new HTML
  dataContainer.innerHTML = html;
} 