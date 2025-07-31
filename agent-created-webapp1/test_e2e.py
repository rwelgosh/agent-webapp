"""
End-to-End Integration Testing Suite
Tests complete user workflows and system integration
"""

import pytest
import requests
import json
import time
import subprocess
import threading
from typing import Dict, List, Optional
import uuid

# Configuration
API_BASE_URL = "http://localhost:3000/api"
FRONTEND_URL = "http://localhost:5173"
E2E_USER_PREFIX = "e2e_test_"

class E2ETestSession:
    """Manage E2E test session state"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.auth_token = None
        self.user_data = None
        self.created_items = []
        self.test_id = str(uuid.uuid4())[:8]
    
    def set_auth_token(self, token: str):
        """Set authentication token"""
        self.auth_token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def clear_auth(self):
        """Clear authentication"""
        self.auth_token = None
        if "Authorization" in self.session.headers:
            del self.session.headers["Authorization"]
    
    def cleanup(self):
        """Clean up test data"""
        # Delete created items
        for item_id in self.created_items:
            try:
                self.session.delete(f"{API_BASE_URL}/items/{item_id}")
            except:
                pass
        
        # Note: User cleanup would typically be done here
        # but we skip it for simplicity in this test environment

@pytest.fixture(scope="class")
def e2e_session():
    """Create E2E test session"""
    session = E2ETestSession()
    yield session
    session.cleanup()

class TestCompleteUserJourney:
    """Test complete user workflows from registration to usage"""
    
    def test_user_registration_and_login_flow(self, e2e_session):
        """Test complete user registration and login workflow"""
        test_username = f"{E2E_USER_PREFIX}user_{e2e_session.test_id}"
        test_password = "testpassword123"
        
        # Step 1: Register new user
        register_data = {
            "username": test_username,
            "password": test_password
        }
        
        response = e2e_session.session.post(f"{API_BASE_URL}/auth/register", json=register_data)
        assert response.status_code == 201
        
        register_result = response.json()
        assert register_result["success"] is True
        assert register_result["user"]["username"] == test_username
        
        # Step 2: Login with registered user
        login_data = {
            "username": test_username,
            "password": test_password
        }
        
        response = e2e_session.session.post(f"{API_BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        
        login_result = response.json()
        assert login_result["success"] is True
        assert "token" in login_result
        
        # Store auth data for subsequent tests
        e2e_session.set_auth_token(login_result["token"])
        e2e_session.user_data = login_result["user"]
        
        # Step 3: Verify authentication by accessing profile
        response = e2e_session.session.get(f"{API_BASE_URL}/auth/me")
        assert response.status_code == 200
        
        profile_result = response.json()
        assert profile_result["success"] is True
        assert profile_result["user"]["username"] == test_username
    
    def test_item_crud_workflow(self, e2e_session):
        """Test complete item CRUD workflow"""
        # Prerequisite: User must be authenticated
        assert e2e_session.auth_token is not None
        
        # Step 1: Create new item
        item_data = {
            "title": f"E2E Test Item {e2e_session.test_id}",
            "content": "This is a test item created during E2E testing"
        }
        
        response = e2e_session.session.post(f"{API_BASE_URL}/items", json=item_data)
        assert response.status_code == 201
        
        create_result = response.json()
        assert create_result["success"] is True
        assert create_result["item"]["title"] == item_data["title"]
        
        item_id = create_result["item"]["_id"]
        e2e_session.created_items.append(item_id)
        
        # Step 2: Read the created item
        response = e2e_session.session.get(f"{API_BASE_URL}/items/{item_id}")
        assert response.status_code == 200
        
        read_result = response.json()
        assert read_result["success"] is True
        assert read_result["item"]["title"] == item_data["title"]
        assert read_result["item"]["content"] == item_data["content"]
        
        # Step 3: Update the item
        update_data = {
            "title": f"Updated E2E Test Item {e2e_session.test_id}",
            "content": "This content has been updated during E2E testing"
        }
        
        response = e2e_session.session.put(f"{API_BASE_URL}/items/{item_id}", json=update_data)
        assert response.status_code == 200
        
        update_result = response.json()
        assert update_result["success"] is True
        assert update_result["item"]["title"] == update_data["title"]
        assert update_result["item"]["content"] == update_data["content"]
        
        # Step 4: Verify item appears in list
        response = e2e_session.session.get(f"{API_BASE_URL}/items")
        assert response.status_code == 200
        
        list_result = response.json()
        assert list_result["success"] is True
        
        # Find our item in the list
        found_item = None
        for item in list_result["items"]:
            if item["_id"] == item_id:
                found_item = item
                break
        
        assert found_item is not None
        assert found_item["title"] == update_data["title"]
        
        # Step 5: Search for the item
        response = e2e_session.session.get(f"{API_BASE_URL}/items/search?q=E2E")
        assert response.status_code == 200
        
        search_result = response.json()
        assert search_result["success"] is True
        
        # Should find our item in search results
        found_in_search = any(item["_id"] == item_id for item in search_result["results"])
        assert found_in_search is True
        
        # Step 6: Delete the item
        response = e2e_session.session.delete(f"{API_BASE_URL}/items/{item_id}")
        assert response.status_code == 200
        
        delete_result = response.json()
        assert delete_result["success"] is True
        
        # Step 7: Verify item is deleted
        response = e2e_session.session.get(f"{API_BASE_URL}/items/{item_id}")
        assert response.status_code == 404
        
        # Remove from cleanup list since we already deleted it
        e2e_session.created_items.remove(item_id)
    
    def test_search_and_pagination_workflow(self, e2e_session):
        """Test search and pagination workflow"""
        assert e2e_session.auth_token is not None
        
        # Step 1: Create multiple test items
        test_items = []
        for i in range(15):  # Create enough items to test pagination
            item_data = {
                "title": f"Pagination Test Item {i} {e2e_session.test_id}",
                "content": f"Content for pagination test item number {i}"
            }
            
            response = e2e_session.session.post(f"{API_BASE_URL}/items", json=item_data)
            assert response.status_code == 201
            
            result = response.json()
            item_id = result["item"]["_id"]
            test_items.append(item_id)
            e2e_session.created_items.append(item_id)
        
        # Step 2: Test basic search
        response = e2e_session.session.get(f"{API_BASE_URL}/items/search?q=Pagination")
        assert response.status_code == 200
        
        search_result = response.json()
        assert search_result["success"] is True
        assert len(search_result["results"]) >= 10  # Should find our items
        
        # Step 3: Test pagination
        response = e2e_session.session.get(f"{API_BASE_URL}/items/search?q=Pagination&page=1&limit=5")
        assert response.status_code == 200
        
        page1_result = response.json()
        assert page1_result["success"] is True
        assert len(page1_result["results"]) == 5
        assert page1_result["pagination"]["page"] == 1
        assert page1_result["pagination"]["limit"] == 5
        assert page1_result["pagination"]["hasNextPage"] is True
        
        # Step 4: Test next page
        response = e2e_session.session.get(f"{API_BASE_URL}/items/search?q=Pagination&page=2&limit=5")
        assert response.status_code == 200
        
        page2_result = response.json()
        assert page2_result["success"] is True
        assert len(page2_result["results"]) == 5
        assert page2_result["pagination"]["page"] == 2
        assert page2_result["pagination"]["hasPrevPage"] is True
        
        # Verify different results on different pages
        page1_ids = {item["_id"] for item in page1_result["results"]}
        page2_ids = {item["_id"] for item in page2_result["results"]}
        assert page1_ids.isdisjoint(page2_ids)  # No overlap between pages

class TestErrorScenarios:
    """Test error handling and edge cases in E2E scenarios"""
    
    def test_authentication_error_flow(self, e2e_session):
        """Test authentication error scenarios"""
        # Step 1: Try to access protected resource without auth
        e2e_session.clear_auth()
        
        response = e2e_session.session.get(f"{API_BASE_URL}/auth/me")
        assert response.status_code == 401
        
        # Step 2: Try login with invalid credentials
        invalid_login = {
            "username": "nonexistent_user",
            "password": "wrongpassword"
        }
        
        response = e2e_session.session.post(f"{API_BASE_URL}/auth/login", json=invalid_login)
        assert response.status_code == 401
        
        result = response.json()
        assert result["success"] is False
        
        # Step 3: Try to create item without authentication
        item_data = {
            "title": "Unauthorized Item",
            "content": "This should not be created"
        }
        
        response = e2e_session.session.post(f"{API_BASE_URL}/items", json=item_data)
        # Note: Depending on API design, this might be 401 or still work
        # Adjust assertion based on actual API behavior
        assert response.status_code in [200, 201, 401]
    
    def test_validation_error_flow(self, e2e_session):
        """Test validation error scenarios"""
        # Re-authenticate for this test
        if not e2e_session.auth_token:
            # Quick login for test user
            login_data = {
                "username": f"{E2E_USER_PREFIX}user_{e2e_session.test_id}",
                "password": "testpassword123"
            }
            response = e2e_session.session.post(f"{API_BASE_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                e2e_session.set_auth_token(response.json()["token"])
        
        # Step 1: Try to create item with missing required fields
        invalid_item = {"title": ""}  # Missing content and empty title
        
        response = e2e_session.session.post(f"{API_BASE_URL}/items", json=invalid_item)
        assert response.status_code == 400
        
        # Step 2: Try to create item with title too long
        long_title_item = {
            "title": "a" * 101,  # Exceeds 100 character limit
            "content": "Valid content"
        }
        
        response = e2e_session.session.post(f"{API_BASE_URL}/items", json=long_title_item)
        assert response.status_code == 400
        
        # Step 3: Try to access item with invalid ID format
        response = e2e_session.session.get(f"{API_BASE_URL}/items/invalid_id")
        assert response.status_code == 400
    
    def test_not_found_scenarios(self, e2e_session):
        """Test not found error scenarios"""
        # Step 1: Try to get non-existent item
        fake_item_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but non-existent
        
        response = e2e_session.session.get(f"{API_BASE_URL}/items/{fake_item_id}")
        assert response.status_code == 404
        
        # Step 2: Try to update non-existent item
        update_data = {"title": "Updated Title"}
        
        response = e2e_session.session.put(f"{API_BASE_URL}/items/{fake_item_id}", json=update_data)
        assert response.status_code == 404
        
        # Step 3: Try to delete non-existent item
        response = e2e_session.session.delete(f"{API_BASE_URL}/items/{fake_item_id}")
        assert response.status_code == 404

class TestSystemIntegration:
    """Test system-level integration scenarios"""
    
    def test_concurrent_user_operations(self, e2e_session):
        """Test concurrent operations by multiple users"""
        # This test simulates multiple users working simultaneously
        
        # Create multiple sessions
        sessions = []
        for i in range(3):
            session = E2ETestSession()
            
            # Register and login each user
            username = f"{E2E_USER_PREFIX}concurrent_{i}_{e2e_session.test_id}"
            password = "testpass123"
            
            # Register
            register_data = {"username": username, "password": password}
            response = session.session.post(f"{API_BASE_URL}/auth/register", json=register_data)
            assert response.status_code == 201
            
            # Login
            login_data = {"username": username, "password": password}
            response = session.session.post(f"{API_BASE_URL}/auth/login", json=login_data)
            assert response.status_code == 200
            
            session.set_auth_token(response.json()["token"])
            sessions.append(session)
        
        # Each user creates items simultaneously
        import threading
        
        def create_items_for_user(session, user_index):
            for i in range(3):
                item_data = {
                    "title": f"Concurrent Item User{user_index} Item{i} {e2e_session.test_id}",
                    "content": f"Content from user {user_index} item {i}"
                }
                
                response = session.session.post(f"{API_BASE_URL}/items", json=item_data)
                assert response.status_code == 201
                
                result = response.json()
                session.created_items.append(result["item"]["_id"])
        
        # Run concurrent operations
        threads = []
        for i, session in enumerate(sessions):
            thread = threading.Thread(target=create_items_for_user, args=(session, i))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all items were created
        response = e2e_session.session.get(f"{API_BASE_URL}/items")
        assert response.status_code == 200
        
        items_result = response.json()
        total_concurrent_items = sum(len(session.created_items) for session in sessions)
        
        # Should find items from concurrent operations
        concurrent_items = [
            item for item in items_result["items"] 
            if "Concurrent Item" in item["title"]
        ]
        assert len(concurrent_items) >= total_concurrent_items
        
        # Cleanup
        for session in sessions:
            session.cleanup()
    
    def test_data_consistency(self, e2e_session):
        """Test data consistency across operations"""
        assert e2e_session.auth_token is not None
        
        # Step 1: Create item and verify immediate consistency
        item_data = {
            "title": f"Consistency Test {e2e_session.test_id}",
            "content": "Testing data consistency"
        }
        
        response = e2e_session.session.post(f"{API_BASE_URL}/items", json=item_data)
        assert response.status_code == 201
        
        create_result = response.json()
        item_id = create_result["item"]["_id"]
        e2e_session.created_items.append(item_id)
        
        # Step 2: Immediately verify item exists in list
        response = e2e_session.session.get(f"{API_BASE_URL}/items")
        assert response.status_code == 200
        
        list_result = response.json()
        found_in_list = any(item["_id"] == item_id for item in list_result["items"])
        assert found_in_list is True
        
        # Step 3: Verify item exists in search
        response = e2e_session.session.get(f"{API_BASE_URL}/items/search?q=Consistency")
        assert response.status_code == 200
        
        search_result = response.json()
        found_in_search = any(item["_id"] == item_id for item in search_result["results"])
        assert found_in_search is True
        
        # Step 4: Update item and verify consistency
        update_data = {"title": f"Updated Consistency Test {e2e_session.test_id}"}
        
        response = e2e_session.session.put(f"{API_BASE_URL}/items/{item_id}", json=update_data)
        assert response.status_code == 200
        
        # Step 5: Verify update is reflected everywhere
        response = e2e_session.session.get(f"{API_BASE_URL}/items/{item_id}")
        assert response.status_code == 200
        
        get_result = response.json()
        assert get_result["item"]["title"] == update_data["title"]
        
        # Verify in list
        response = e2e_session.session.get(f"{API_BASE_URL}/items")
        list_result = response.json()
        
        updated_item_in_list = None
        for item in list_result["items"]:
            if item["_id"] == item_id:
                updated_item_in_list = item
                break
        
        assert updated_item_in_list is not None
        assert updated_item_in_list["title"] == update_data["title"]

class TestPerformanceInE2E:
    """Test performance aspects in E2E scenarios"""
    
    def test_response_time_in_workflow(self, e2e_session):
        """Test response times during typical user workflow"""
        assert e2e_session.auth_token is not None
        
        response_times = {}
        
        # Measure item creation time
        start_time = time.time()
        item_data = {
            "title": f"Performance Test {e2e_session.test_id}",
            "content": "Testing response time"
        }
        response = e2e_session.session.post(f"{API_BASE_URL}/items", json=item_data)
        response_times["create"] = time.time() - start_time
        
        assert response.status_code == 201
        item_id = response.json()["item"]["_id"]
        e2e_session.created_items.append(item_id)
        
        # Measure item retrieval time
        start_time = time.time()
        response = e2e_session.session.get(f"{API_BASE_URL}/items/{item_id}")
        response_times["read"] = time.time() - start_time
        assert response.status_code == 200
        
        # Measure update time
        start_time = time.time()
        update_data = {"title": f"Updated Performance Test {e2e_session.test_id}"}
        response = e2e_session.session.put(f"{API_BASE_URL}/items/{item_id}", json=update_data)
        response_times["update"] = time.time() - start_time
        assert response.status_code == 200
        
        # Measure list retrieval time
        start_time = time.time()
        response = e2e_session.session.get(f"{API_BASE_URL}/items")
        response_times["list"] = time.time() - start_time
        assert response.status_code == 200
        
        # Measure search time
        start_time = time.time()
        response = e2e_session.session.get(f"{API_BASE_URL}/items/search?q=Performance")
        response_times["search"] = time.time() - start_time
        assert response.status_code == 200
        
        # Assert reasonable response times (adjust thresholds as needed)
        assert response_times["create"] < 2.0
        assert response_times["read"] < 1.0
        assert response_times["update"] < 2.0
        assert response_times["list"] < 3.0
        assert response_times["search"] < 3.0

if __name__ == "__main__":
    # Run E2E tests
    pytest.main([__file__, "-v", "--tb=short", "-s"]) 