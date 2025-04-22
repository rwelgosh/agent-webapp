// Search Results component
import { SearchResponse } from '../services/DataService';

/**
 * Set up the search results component
 */
export function setupSearchResults(): void {
  // Component setup logic if needed
  console.log('Search results component initialized');
}

/**
 * Update the search results display with new data
 */
export function updateSearchResults(
  results: SearchResponse['results'], 
  query: string
): void {
  const searchResultsElement = document.getElementById('search-results');
  
  if (!searchResultsElement) {
    console.error('Search results element not found');
    return;
  }
  
  if (!results || results.length === 0) {
    searchResultsElement.innerHTML = `<p>No results found for "${query}"</p>`;
    return;
  }
  
  let html = `<h3>Search results for "${query}":</h3><ul class="results-list">`;
  
  results.forEach(result => {
    html += `
      <li class="result-item" data-id="${result.id}">
        <h4>${result.title}</h4>
        <p>${result.description}</p>
      </li>
    `;
  });
  
  html += '</ul>';
  
  // Update the HTML content
  searchResultsElement.innerHTML = html;
  
  // Add event listeners for result items if needed
  addResultItemEventListeners();
}

/**
 * Add event listeners to search result items
 */
function addResultItemEventListeners(): void {
  const resultItems = document.querySelectorAll('.result-item');
  
  resultItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      console.log(`Result item clicked: ${id}`);
      // Add any additional functionality here, like showing details
    });
  });
} 