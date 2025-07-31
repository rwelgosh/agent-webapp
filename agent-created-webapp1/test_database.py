"""
Database Testing Suite
Tests MongoDB operations, data integrity, and database performance
"""

import pytest
import requests
import json
import time
from typing import Dict, List, Optional
import uuid

# Configuration
API_BASE_URL = "http://localhost:3000/api"
DB_TEST_PREFIX = "db_test_"

class TestDatabaseOperations:
    """Test database CRUD operations and data integrity"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for database tests"""
        test_user = f"{DB_TEST_PREFIX}user_{uuid.uuid4().hex[:8]}"
        register_data = {"username": test_user, "password": "testpass123"}
        
        response = requests.post(f"{API_BASE_URL}/auth/register", json=register_data)
        assert response.status_code == 201
        
        login_data = {"username": test_user, "password": "testpass123"}
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        
        return response.json()["token"]
    
    def test_data_persistence(self, auth_token):
        """Test that data persists correctly in database"""
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        
        # Create item
        item_data = {
            "title": f"Persistence Test {uuid.uuid4().hex[:8]}",
            "content": "Testing data persistence in MongoDB"
        }
        
        response = requests.post(f"{API_BASE_URL}/items", json=item_data, headers=headers)
        assert response.status_code == 201
        
        created_item = response.json()["item"]
        item_id = created_item["_id"]
        
        # Verify item exists immediately
        response = requests.get(f"{API_BASE_URL}/items/{item_id}", headers=headers)
        assert response.status_code == 200
        
        retrieved_item = response.json()["item"]
        assert retrieved_item["title"] == item_data["title"]
        assert retrieved_item["content"] == item_data["content"]
        
        # Cleanup
        requests.delete(f"{API_BASE_URL}/items/{item_id}", headers=headers)
    
    def test_objectid_validation(self, auth_token):
        """Test MongoDB ObjectId validation"""
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        
        # Test invalid ObjectId formats
        invalid_ids = ["invalid", "123", "507f1f77bcf86cd79943901g"]
        
        for invalid_id in invalid_ids:
            response = requests.get(f"{API_BASE_URL}/items/{invalid_id}", headers=headers)
            assert response.status_code == 400
        
        # Test valid ObjectId format (non-existent)
        valid_id = "507f1f77bcf86cd799439011"
        response = requests.get(f"{API_BASE_URL}/items/{valid_id}", headers=headers)
        assert response.status_code == 404

class TestDatabasePerformance:
    """Test database performance and optimization"""
    
    @pytest.fixture(scope="class")
    def auth_token_perf(self):
        """Get authentication token for performance tests"""
        test_user = f"{DB_TEST_PREFIX}perf_{uuid.uuid4().hex[:8]}"
        register_data = {"username": test_user, "password": "testpass123"}
        
        response = requests.post(f"{API_BASE_URL}/auth/register", json=register_data)
        assert response.status_code == 201
        
        login_data = {"username": test_user, "password": "testpass123"}
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        
        return response.json()["token"]
    
    def test_large_dataset_query_performance(self, auth_token_perf):
        """Test query performance with larger datasets"""
        headers = {"Authorization": f"Bearer {auth_token_perf}", "Content-Type": "application/json"}
        
        # Create test dataset
        created_items = []
        batch_size = 10  # Reasonable size for testing
        
        for i in range(batch_size):
            item_data = {
                "title": f"Performance Test Item {i} {uuid.uuid4().hex[:8]}",
                "content": f"Content for performance testing item number {i}"
            }
            
            response = requests.post(f"{API_BASE_URL}/items", json=item_data, headers=headers)
            if response.status_code == 201:
                created_items.append(response.json()["item"]["_id"])
        
        # Test query performance
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/items", headers=headers)
        query_time = time.time() - start_time
        
        assert response.status_code == 200
        assert query_time < 3.0  # Should complete within 3 seconds
        
        # Cleanup
        for item_id in created_items:
            requests.delete(f"{API_BASE_URL}/items/{item_id}", headers=headers)

class TestDataConsistency:
    """Test data consistency and transaction-like behavior"""
    
    @pytest.fixture(scope="class")
    def auth_token_consistency(self):
        """Get authentication token for consistency tests"""
        test_user = f"{DB_TEST_PREFIX}consistency_{uuid.uuid4().hex[:8]}"
        register_data = {"username": test_user, "password": "testpass123"}
        
        response = requests.post(f"{API_BASE_URL}/auth/register", json=register_data)
        assert response.status_code == 201
        
        login_data = {"username": test_user, "password": "testpass123"}
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        assert response.status_code == 200
        
        return response.json()["token"]
    
    def test_update_consistency(self, auth_token_consistency):
        """Test update operation consistency"""
        headers = {"Authorization": f"Bearer {auth_token_consistency}", "Content-Type": "application/json"}
        
        # Create item
        original_data = {
            "title": "Original Title",
            "content": "Original content for consistency testing"
        }
        
        response = requests.post(f"{API_BASE_URL}/items", json=original_data, headers=headers)
        assert response.status_code == 201
        
        item_id = response.json()["item"]["_id"]
        
        # Update item
        update_data = {
            "title": "Updated Title",
            "content": "Updated content for consistency testing"
        }
        
        response = requests.put(f"{API_BASE_URL}/items/{item_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        
        updated_item = response.json()["item"]
        assert updated_item["title"] == update_data["title"]
        assert updated_item["content"] == update_data["content"]
        
        # Verify update is immediately visible
        response = requests.get(f"{API_BASE_URL}/items/{item_id}", headers=headers)
        assert response.status_code == 200
        
        retrieved_item = response.json()["item"]
        assert retrieved_item["title"] == update_data["title"]
        
        # Cleanup
        requests.delete(f"{API_BASE_URL}/items/{item_id}", headers=headers)

if __name__ == "__main__":
    # Run database tests
    pytest.main([__file__, "-v", "--tb=short", "-s"]) 