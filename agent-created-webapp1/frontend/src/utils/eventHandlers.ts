// Event handlers for the application
import { DataService, SubmitRequest } from '../services/DataService';
import { updateDataDisplay } from '../components/DataDisplay';
import { updateSearchResults } from '../components/SearchResults';
import { updateSubmitResult } from '../components/SubmitForm';

/**
 * Set up all event listeners for the application
 */
export function setupEventListeners(dataService: DataService): void {
  setupDataButtons(dataService);
  setupSearchForm(dataService);
  setupSubmitForm(dataService);
}

/**
 * Set up event listeners for data fetching buttons
 */
function setupDataButtons(dataService: DataService): void {
  const fetchDataBtn = document.getElementById('fetch-data-btn');
  const fetchRandomBtn = document.getElementById('fetch-random-btn');
  
  if (fetchDataBtn) {
    fetchDataBtn.addEventListener('click', () => {
      handleDataFetch(dataService, '/api/data');
    });
  }
  
  if (fetchRandomBtn) {
    fetchRandomBtn.addEventListener('click', () => {
      handleDataFetch(dataService, '/api/random');
    });
  }
}

/**
 * Set up event listener for the search form
 */
function setupSearchForm(dataService: DataService): void {
  const searchForm = document.getElementById('search-form') as HTMLFormElement;
  
  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const searchInput = document.getElementById('search-query') as HTMLInputElement;
      const query = searchInput?.value.trim() || '';
      
      if (query) {
        handleSearch(dataService, query);
      }
    });
  }
}

/**
 * Set up event listener for the submit form
 */
function setupSubmitForm(dataService: DataService): void {
  const submitForm = document.getElementById('submit-form') as HTMLFormElement;
  
  if (submitForm) {
    submitForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const titleInput = document.getElementById('item-title') as HTMLInputElement;
      const contentInput = document.getElementById('item-content') as HTMLTextAreaElement;
      
      const title = titleInput?.value.trim() || '';
      const content = contentInput?.value.trim() || '';
      
      if (title && content) {
        handleSubmit(dataService, { title, content });
      } else {
        updateSubmitResult({
          success: false,
          error: 'Please fill in all fields'
        });
      }
    });
  }
}

/**
 * Handle data fetching
 */
async function handleDataFetch(dataService: DataService, endpoint: string): Promise<void> {
  try {
    const dataContainer = document.getElementById('data-container');
    
    if (dataContainer) {
      dataContainer.innerHTML = '<p class="loading">Loading data from server...</p>';
      
      const response = await dataService.fetchData(endpoint);
      updateDataDisplay(response.data);
    }
  } catch (error) {
    const dataContainer = document.getElementById('data-container');
    
    if (dataContainer) {
      dataContainer.innerHTML = `
        <p class="error">Failed to load data from server</p>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
        <button id="retry-button" class="btn">Retry</button>
      `;
      
      // Add retry functionality
      const retryButton = document.getElementById('retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => handleDataFetch(dataService, endpoint));
      }
    }
  }
}

/**
 * Handle search form submission
 */
async function handleSearch(dataService: DataService, query: string): Promise<void> {
  try {
    const searchResults = document.getElementById('search-results');
    
    if (searchResults) {
      searchResults.innerHTML = '<p class="loading">Searching...</p>';
      
      const response = await dataService.searchData(query);
      updateSearchResults(response.results, query);
    }
  } catch (error) {
    const searchResults = document.getElementById('search-results');
    
    if (searchResults) {
      searchResults.innerHTML = `
        <p class="error">Failed to search</p>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
      `;
    }
  }
}

/**
 * Handle submit form submission
 */
async function handleSubmit(dataService: DataService, formData: SubmitRequest): Promise<void> {
  try {
    const submitResult = document.getElementById('submit-result');
    
    if (submitResult) {
      submitResult.innerHTML = '<p class="loading">Submitting data...</p>';
      
      const response = await dataService.submitData(formData);
      
      updateSubmitResult(response);
      
      // Clear the form on success
      if (response.success) {
        const submitForm = document.getElementById('submit-form') as HTMLFormElement;
        if (submitForm) {
          submitForm.reset();
        }
        
        // Refresh the data display
        await handleDataFetch(dataService, '/api/data');
      }
    }
  } catch (error) {
    updateSubmitResult({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 