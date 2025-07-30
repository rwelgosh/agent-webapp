import pytest
import requests
import json
import time
from typing import Dict, Optional

# Test configuration
BASE_URL = "http://localhost:3000/api"
TEST_USERNAME = "testuser_" + str(int(time.time()))
TEST_PASSWORD = "testpassword123"

class TestConfig:
    """Test configuration and shared state"""
    auth_token: Optional[str] = None
    user_id: Optional[str] = None
    test_item_id: Optional[str] = None

@pytest.fixture(scope="session")
def api_client():
    """Create a session for API requests"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="session")
def auth_setup(api_client):
    """Register and login a test user for authenticated tests"""
    # Register test user
    register_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    response = api_client.post(f"{BASE_URL}/auth/register", json=register_data)
    assert response.status_code == 201
    
    # Login to get token
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    response = api_client.post(f"{BASE_URL}/auth/login", json=login_data)
    assert response.status_code == 200
    
    data = response.json()
    TestConfig.auth_token = data["token"]
    TestConfig.user_id = data["user"]["id"]
    
    # Set authorization header for subsequent requests
    api_client.headers.update({"Authorization": f"Bearer {TestConfig.auth_token}"})
    
    yield TestConfig.auth_token
    
    # Cleanup - This would normally delete the test user but we'll skip for simplicity

class TestStatusEndpoints:
    """Test status and utility endpoints"""
    
    def test_server_status(self, api_client):
        """Test GET /api/status"""
        response = api_client.get(f"{BASE_URL}/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "status" in data["data"]
        assert "time" in data["data"]
        assert "uptime" in data["data"]
        assert data["data"]["status"] == "online"
    
    def test_echo_endpoint(self, api_client):
        """Test POST /api/echo"""
        test_data = {"message": "hello world", "number": 42}
        
        response = api_client.post(f"{BASE_URL}/echo", json=test_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["message"] == "hello world"
        assert data["data"]["number"] == 42
        assert data["data"]["echoed"] is True
        assert "timestamp" in data["data"]
    
    def test_echo_empty_body(self, api_client):
        """Test POST /api/echo with empty body should fail"""
        response = api_client.post(f"{BASE_URL}/echo", json={})
        
        assert response.status_code == 400
    
    def test_dummy_data(self, api_client):
        """Test GET /api/data"""
        response = api_client.get(f"{BASE_URL}/data")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "title" in data["data"]
        assert "content" in data["data"]
        assert "items" in data["data"]
        assert len(data["data"]["items"]) == 3
    
    def test_random_data(self, api_client):
        """Test GET /api/random"""
        response = api_client.get(f"{BASE_URL}/random")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "title" in data["data"]
        assert "content" in data["data"]
        assert "items" in data["data"]
        assert "timestamp" in data["data"]
        assert "randomFactor" in data["data"]
        assert 1 <= len(data["data"]["items"]) <= 5

class TestAuthenticationEndpoints:
    """Test authentication related endpoints"""
    
    def test_user_registration_success(self, api_client):
        """Test successful user registration"""
        unique_username = f"newuser_{int(time.time())}"
        register_data = {
            "username": unique_username,
            "password": "password123"
        }
        
        response = api_client.post(f"{BASE_URL}/auth/register", json=register_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "User registered successfully"
        assert data["user"]["username"] == unique_username
        assert "password" not in data["user"]  # Password should not be returned
    
    def test_user_registration_duplicate_username(self, api_client):
        """Test registration with duplicate username"""
        register_data = {
            "username": TEST_USERNAME,  # Should already exist from auth_setup
            "password": "password123"
        }
        
        response = api_client.post(f"{BASE_URL}/auth/register", json=register_data)
        
        assert response.status_code == 400
    
    def test_user_registration_invalid_data(self, api_client):
        """Test registration with invalid data"""
        # Missing username
        response = api_client.post(f"{BASE_URL}/auth/register", json={"password": "test123"})
        assert response.status_code == 400
        
        # Missing password
        response = api_client.post(f"{BASE_URL}/auth/register", json={"username": "testuser"})
        assert response.status_code == 400
        
        # Password too short
        response = api_client.post(f"{BASE_URL}/auth/register", json={
            "username": "testuser2", 
            "password": "123"
        })
        assert response.status_code == 400
    
    def test_user_login_success(self, api_client):
        """Test successful login"""
        login_data = {
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        }
        
        response = api_client.post(f"{BASE_URL}/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Login successful"
        assert "token" in data
        assert data["user"]["username"] == TEST_USERNAME
        assert "password" not in data["user"]
    
    def test_user_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        # Wrong password
        login_data = {
            "username": TEST_USERNAME,
            "password": "wrongpassword"
        }
        
        response = api_client.post(f"{BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 401
        
        # Non-existent user
        login_data = {
            "username": "nonexistentuser",
            "password": "password123"
        }
        
        response = api_client.post(f"{BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 401
    
    def test_get_user_profile(self, api_client, auth_setup):
        """Test GET /api/auth/me with valid token"""
        response = api_client.get(f"{BASE_URL}/auth/me")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["username"] == TEST_USERNAME
        assert data["user"]["id"] == TestConfig.user_id
    
    def test_get_user_profile_no_token(self, api_client):
        """Test GET /api/auth/me without token"""
        # Temporarily remove auth header
        headers = api_client.headers.copy()
        if "Authorization" in api_client.headers:
            del api_client.headers["Authorization"]
        
        response = api_client.get(f"{BASE_URL}/auth/me")
        assert response.status_code == 401
        
        # Restore headers
        api_client.headers.update(headers)

class TestItemEndpoints:
    """Test item CRUD operations"""
    
    def test_create_item_success(self, api_client, auth_setup):
        """Test successful item creation"""
        item_data = {
            "title": "Test Item",
            "content": "This is a test item content"
        }
        
        response = api_client.post(f"{BASE_URL}/items", json=item_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Item created successfully"
        assert data["item"]["title"] == "Test Item"
        assert data["item"]["content"] == "This is a test item content"
        
        # Store item ID for other tests
        TestConfig.test_item_id = data["item"]["_id"]
    
    def test_create_item_invalid_data(self, api_client, auth_setup):
        """Test item creation with invalid data"""
        # Missing title
        response = api_client.post(f"{BASE_URL}/items", json={"content": "test content"})
        assert response.status_code == 400
        
        # Missing content
        response = api_client.post(f"{BASE_URL}/items", json={"title": "test title"})
        assert response.status_code == 400
        
        # Title too long (over 100 characters)
        long_title = "a" * 101
        response = api_client.post(f"{BASE_URL}/items", json={
            "title": long_title,
            "content": "test content"
        })
        assert response.status_code == 400
    
    def test_get_all_items(self, api_client):
        """Test GET /api/items"""
        response = api_client.get(f"{BASE_URL}/items")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "items" in data
        assert isinstance(data["items"], list)
    
    def test_get_item_by_id(self, api_client, auth_setup):
        """Test GET /api/items/:id"""
        if not TestConfig.test_item_id:
            pytest.skip("No test item available")
        
        response = api_client.get(f"{BASE_URL}/items/{TestConfig.test_item_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["item"]["_id"] == TestConfig.test_item_id
    
    def test_get_item_invalid_id(self, api_client):
        """Test GET /api/items/:id with invalid ID"""
        response = api_client.get(f"{BASE_URL}/items/invalid_id")
        assert response.status_code == 400
        
        # Valid ObjectId format but non-existent
        response = api_client.get(f"{BASE_URL}/items/507f1f77bcf86cd799439011")
        assert response.status_code == 404
    
    def test_update_item(self, api_client, auth_setup):
        """Test PUT /api/items/:id"""
        if not TestConfig.test_item_id:
            pytest.skip("No test item available")
        
        update_data = {
            "title": "Updated Test Item",
            "content": "Updated content"
        }
        
        response = api_client.put(f"{BASE_URL}/items/{TestConfig.test_item_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Item updated successfully"
        assert data["item"]["title"] == "Updated Test Item"
        assert data["item"]["content"] == "Updated content"
    
    def test_update_item_partial(self, api_client, auth_setup):
        """Test partial update of item"""
        if not TestConfig.test_item_id:
            pytest.skip("No test item available")
        
        update_data = {"title": "Partially Updated Title"}
        
        response = api_client.put(f"{BASE_URL}/items/{TestConfig.test_item_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["item"]["title"] == "Partially Updated Title"
    
    def test_search_items(self, api_client):
        """Test GET /api/items/search"""
        # Search without query
        response = api_client.get(f"{BASE_URL}/items/search")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "results" in data
        assert "pagination" in data
        
        # Search with query
        response = api_client.get(f"{BASE_URL}/items/search?q=test")
        assert response.status_code == 200
        
        # Search with pagination
        response = api_client.get(f"{BASE_URL}/items/search?page=1&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["limit"] == 5
    
    def test_search_items_invalid_params(self, api_client):
        """Test search with invalid parameters"""
        # Invalid page
        response = api_client.get(f"{BASE_URL}/items/search?page=0")
        assert response.status_code == 400
        
        # Invalid limit
        response = api_client.get(f"{BASE_URL}/items/search?limit=100")
        assert response.status_code == 400
    
    def test_delete_item(self, api_client, auth_setup):
        """Test DELETE /api/items/:id"""
        if not TestConfig.test_item_id:
            pytest.skip("No test item available")
        
        response = api_client.delete(f"{BASE_URL}/items/{TestConfig.test_item_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "deleted successfully" in data["message"]
        
        # Verify item is deleted
        response = api_client.get(f"{BASE_URL}/items/{TestConfig.test_item_id}")
        assert response.status_code == 404
    
    def test_delete_item_invalid_id(self, api_client, auth_setup):
        """Test DELETE /api/items/:id with invalid ID"""
        response = api_client.delete(f"{BASE_URL}/items/invalid_id")
        assert response.status_code == 400
        
        # Valid ObjectId format but non-existent
        response = api_client.delete(f"{BASE_URL}/items/507f1f77bcf86cd799439011")
        assert response.status_code == 404

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_invalid_json(self, api_client):
        """Test endpoints with invalid JSON"""
        headers = {"Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/echo", data="invalid json", headers=headers)
        assert response.status_code == 400
    
    def test_missing_content_type(self, api_client):
        """Test endpoints with missing content type"""
        headers = {}
        data = json.dumps({"test": "data"})
        response = requests.post(f"{BASE_URL}/echo", data=data, headers=headers)
        # Should still work or return appropriate error
        assert response.status_code in [200, 400]
    
    def test_nonexistent_endpoint(self, api_client):
        """Test accessing non-existent endpoints"""
        response = api_client.get(f"{BASE_URL}/nonexistent")
        assert response.status_code == 404

if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
