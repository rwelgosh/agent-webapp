// Submit Form component
import { SubmitResponse } from '../services/DataService';

/**
 * Set up the submit form component
 */
export function setupSubmitForm(): void {
  // Component setup logic if needed
  console.log('Submit form component initialized');
}

/**
 * Update the submit result display with the API response
 */
export function updateSubmitResult(response: Partial<SubmitResponse>): void {
  const submitResultElement = document.getElementById('submit-result');
  
  if (!submitResultElement) {
    console.error('Submit result element not found');
    return;
  }
  
  if (response.success) {
    submitResultElement.innerHTML = `
      <div class="success-message">
        <p>${response.message || 'Data submitted successfully!'}</p>
        ${response.item ? `<p>Item ID: ${response.item.id}</p>` : ''}
      </div>
    `;
  } else {
    submitResultElement.innerHTML = `
      <p class="error">Failed to submit data</p>
      <p>Error: ${response.error || 'Unknown error occurred'}</p>
    `;
  }
  
  // Automatically clear the message after a delay
  setTimeout(() => {
    const currentMessage = submitResultElement.innerHTML;
    if (currentMessage && currentMessage.includes(response.error || '') || 
        currentMessage.includes(response.message || '')) {
      fadeOutElement(submitResultElement);
    }
  }, 5000);
}

/**
 * Fade out an element and then clear its content
 */
function fadeOutElement(element: HTMLElement): void {
  // Add a fade-out CSS class
  element.classList.add('fade-out');
  
  // Clear the content after the animation is complete
  setTimeout(() => {
    element.innerHTML = '';
    element.classList.remove('fade-out');
  }, 500);
} 