document.addEventListener('DOMContentLoaded', function() {
    // Get reference to elements
    const dataContainer = document.getElementById('data-container');
    const searchForm = document.getElementById('search-form');
    const searchResults = document.getElementById('search-results');
    const submitForm = document.getElementById('submit-form');
    const submitResult = document.getElementById('submit-result');
    const fetchDataBtn = document.getElementById('fetch-data-btn');
    const fetchRandomBtn = document.getElementById('fetch-random-btn');
    
    // Call function to fetch regular data on initial load
    fetchDataFromBackend('/api/data');
    
    // Add event listeners for data buttons
    fetchDataBtn.addEventListener('click', function() {
        fetchDataFromBackend('/api/data');
    });
    
    fetchRandomBtn.addEventListener('click', function() {
        fetchDataFromBackend('/api/random');
    });
    
    // Add event listener for search form
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const searchQuery = document.getElementById('search-query').value.trim();
        if (searchQuery) {
            searchData(searchQuery);
        }
    });
    
    // Add event listener for submit form
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('item-title').value.trim();
        const content = document.getElementById('item-content').value.trim();
        
        if (title && content) {
            submitData({title, content});
        } else {
            submitResult.innerHTML = '<p class="error">Please fill in all fields</p>';
        }
    });
    
    /**
     * Submits data to the backend API
     * 
     * @param {Object} formData - The form data to submit
     * 
     * Expected request format:
     * {
     *    "title": "Item Title",
     *    "content": "Item Content"
     * }
     * 
     * Expected response format:
     * {
     *    "success": true,
     *    "message": "Data saved successfully",
     *    "item": {
     *        "id": 123,
     *        "title": "Item Title",
     *        "content": "Item Content",
     *        "createdAt": "2023-07-15T10:30:45Z"
     *    }
     * }
     */
    function submitData(formData) {
        // Show loading state
        submitResult.innerHTML = '<p class="loading">Submitting data...</p>';
        
        // API endpoint URL
        const apiUrl = '/api/submit';
        
        // Submit data to the backend
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                // Check if response is ok
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Check if data has the expected format
                if (!data || !data.success) {
                    throw new Error('Received invalid data format from server');
                }
                
                // Display success message
                submitResult.innerHTML = `
                    <div class="success-message">
                        <p>${data.message}</p>
                        <p>Item ID: ${data.item.id}</p>
                    </div>
                `;
                
                // Clear the form
                submitForm.reset();
                
                // Refresh the data display to show the new item
                fetchDataFromBackend('/api/data');
            })
            .catch(error => {
                // Handle any errors
                console.error('Error submitting data:', error);
                submitResult.innerHTML = `
                    <p class="error">Failed to submit data</p>
                    <p>Error: ${error.message}</p>
                `;
            });
    }
    
    /**
     * Searches for data using the backend API
     * 
     * @param {string} query - The search query
     * 
     * Expected response format:
     * {
     *    "success": true,
     *    "results": [
     *        { "id": 1, "title": "Result 1", "description": "Description 1" },
     *        { "id": 2, "title": "Result 2", "description": "Description 2" },
     *        ...
     *    ]
     * }
     */
    function searchData(query) {
        // Show loading state
        searchResults.innerHTML = '<p class="loading">Searching...</p>';
        
        // API endpoint URL with query parameter
        const apiUrl = `/api/search?q=${encodeURIComponent(query)}`;
        
        // Fetch search results from the backend
        fetch(apiUrl)
            .then(response => {
                // Check if response is ok
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Check if data has the expected format
                if (!data || !data.success || !data.results) {
                    throw new Error('Received invalid data format from server');
                }
                
                // Display the search results
                displaySearchResults(data.results, query);
            })
            .catch(error => {
                // Handle any errors
                console.error('Error searching data:', error);
                searchResults.innerHTML = `
                    <p class="error">Failed to search</p>
                    <p>Error: ${error.message}</p>
                `;
            });
    }
    
    /**
     * Displays search results
     * @param {Array} results - The search results array
     * @param {string} query - The search query
     */
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `<p>No results found for "${query}"</p>`;
            return;
        }
        
        let html = `<h3>Search results for "${query}":</h3><ul class="results-list">`;
        
        results.forEach(result => {
            html += `
                <li class="result-item">
                    <h4>${result.title}</h4>
                    <p>${result.description}</p>
                </li>
            `;
        });
        
        html += '</ul>';
        searchResults.innerHTML = html;
    }
    
    /**
     * Fetches data from the backend API
     * 
     * @param {string} endpoint - The API endpoint to fetch data from (/api/data or /api/random)
     * 
     * Expected response format:
     * {
     *    "success": true,
     *    "data": {
     *        "title": "Sample Title",
     *        "content": "Sample content text",
     *        "items": [
     *            { "id": 1, "name": "Item 1" },
     *            { "id": 2, "name": "Item 2" },
     *            ...
     *        ]
     *    }
     * }
     */
    function fetchDataFromBackend(endpoint = '/api/data') {
        // Show loading state
        dataContainer.innerHTML = '<p class="loading">Loading data from server...</p>';
        
        // API endpoint URL
        const apiUrl = endpoint;
        
        // Fetch data from the backend
        fetch(apiUrl)
            .then(response => {
                // Check if response is ok (status in the range 200-299)
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Check if data has the expected format
                if (!data || !data.success || !data.data) {
                    throw new Error('Received invalid data format from server');
                }
                
                // Display the data
                displayData(data.data);
            })
            .catch(error => {
                // Handle any errors
                console.error('Error fetching data:', error);
                dataContainer.innerHTML = `
                    <p class="error">Failed to load data from server</p>
                    <p>Error: ${error.message}</p>
                    <button id="retry-button" class="btn">Retry</button>
                `;
                
                // Add retry functionality
                document.getElementById('retry-button').addEventListener('click', () => fetchDataFromBackend(endpoint));
            });
    }
    
    /**
     * Displays data received from the backend in the data container
     * @param {Object} data - The data object from the API response
     */
    function displayData(data) {
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
            html += `<p class="random-factor">Random factor: ${data.randomFactor.toFixed(2)}</p>`;
        }
        
        // Update the container with the new HTML
        dataContainer.innerHTML = html;
    }
});
