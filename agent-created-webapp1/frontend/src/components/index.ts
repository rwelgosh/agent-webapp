// Components index file
import { setupDataDisplay } from './DataDisplay';
import { setupSearchResults } from './SearchResults';
import { setupSubmitForm } from './SubmitForm';

/**
 * Initialize all components
 */
export function setupComponents(): void {
  setupDataDisplay();
  setupSearchResults();
  setupSubmitForm();
} 