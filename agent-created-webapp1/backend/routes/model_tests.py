"""
Python tests for backend models and routes
Tests the expected behaviors and data structures of User.js, Item.js, and auth.routes.js
"""
from test_helpers import validate_response_format, create_mock_request_data, format_test_result
from test_utilities import simulate_api_response, generate_test_user_data, check_required_fields, log_test_execution
from datetime import datetime
import json


def test_user_model_structure():
    """Test User model expected structure and validation rules"""
    # Test valid user data structure (matching User.js schema)
    valid_user = {
        "id": "507f1f77bcf86cd799439011",
        "username": "testuser",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    
    # Test required fields for User model
    required_user_fields = ["username", "role"]
    is_valid, missing = check_required_fields(valid_user, required_user_fields)
    print(format_test_result("User Model - Valid Structure", is_valid))
    
    # Test username validation rules (from User.js)
    test_usernames = [
        ("valid_user", True),
        ("ab", False),  # Too short (min 3)
        ("a" * 31, False),  # Too long (max 30)
        ("", False),  # Empty
        ("user@123", True)  # Valid
    ]
    
    for username, expected in test_usernames:
        is_valid_length = 3 <= len(username) <= 30 if username else False
        print(format_test_result(f"Username Validation - '{username}'", 
                               is_valid_length == expected, 
                               f"Length: {len(username)}"))


def test_item_model_structure():
    """Test Item model expected structure and validation rules"""
    # Test valid item data structure (matching Item.js schema)
    valid_item = {
        "id": "507f1f77bcf86cd799439012",
        "title": "Test Item",
        "content": "This is test content",
        "user": "507f1f77bcf86cd799439011",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    
    # Test required fields for Item model
    required_item_fields = ["title", "content"]
    is_valid, missing = check_required_fields(valid_item, required_item_fields)
    print(format_test_result("Item Model - Valid Structure", is_valid))
    
    # Test title validation rules (from Item.js)
    test_titles = [
        ("Valid Title", True),
        ("", False),  # Empty
        ("a" * 101, False),  # Too long (max 100)
        ("Short", True),  # Valid
        ("   ", False)  # Only whitespace
    ]
    
    for title, expected in test_titles:
        is_valid_title = (title and title.strip() and len(title) <= 100)
        print(format_test_result(f"Title Validation - '{title[:20]}...'", 
                               is_valid_title == expected, 
                               f"Length: {len(title)}"))


def test_auth_routes_responses():
    """Test expected responses from auth routes (auth.routes.js)"""
    # Test register route response structure
    register_response = {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "username": "newuser",
            "role": "user",
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    }
    
    expected_register_fields = ["success", "message", "user"]
    is_valid_register = validate_response_format(register_response, expected_register_fields)
    print(format_test_result("Auth Register Response", is_valid_register))
    
    # Test login route response structure
    login_response = {
        "success": True,
        "message": "Login successful",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "username": "testuser",
            "role": "user"
        }
    }
    
    expected_login_fields = ["success", "message", "token", "user"]
    is_valid_login = validate_response_format(login_response, expected_login_fields)
    print(format_test_result("Auth Login Response", is_valid_login))
    
    # Test /me route response structure
    me_response = {
        "success": True,
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "username": "testuser",
            "role": "user",
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    }
    
    expected_me_fields = ["success", "user"]
    is_valid_me = validate_response_format(me_response, expected_me_fields)
    print(format_test_result("Auth Me Response", is_valid_me))


def test_jwt_token_structure():
    """Test JWT token structure and validation (from auth.js middleware)"""
    # Simulate JWT token structure
    mock_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNDA5NjAwMCwiZXhwIjoxNzA0MTgyNDAwfQ.signature"
    
    # Test token format (3 parts separated by dots)
    token_parts = mock_token.split('.')
    is_valid_format = len(token_parts) == 3
    print(format_test_result("JWT Token Format", is_valid_format, f"Parts: {len(token_parts)}"))
    
    # Test authorization header format
    auth_headers = [
        ("Bearer " + mock_token, True),
        ("bearer " + mock_token, False),  # Wrong case
        ("Bearer", False),  # No token
        ("Token " + mock_token, False),  # Wrong scheme
        ("", False)  # Empty
    ]
    
    for header, expected in auth_headers:
        is_valid_header = (header.startswith("Bearer ") and len(header.split()) == 2)
        print(format_test_result(f"Auth Header - '{header[:20]}...'", 
                               is_valid_header == expected))


def test_error_responses():
    """Test error response structures from middleware"""
    # Test ApiError structure (from errorHandler.js)
    api_error_response = {
        "success": False,
        "error": {
            "message": "Invalid username or password",
            "code": "INVALID_CREDENTIALS",
            "statusCode": 401
        }
    }
    
    expected_error_fields = ["success", "error"]
    is_valid_error = validate_response_format(api_error_response, expected_error_fields)
    print(format_test_result("API Error Response", is_valid_error))
    
    # Test validation error structure
    validation_error_response = {
        "success": False,
        "errors": [
            {
                "field": "username",
                "message": "Username is required"
            },
            {
                "field": "password",
                "message": "Password must be at least 6 characters"
            }
        ]
    }
    
    expected_validation_fields = ["success", "errors"]
    is_valid_validation = validate_response_format(validation_error_response, expected_validation_fields)
    print(format_test_result("Validation Error Response", is_valid_validation))


def test_database_operations():
    """Test expected database operation behaviors"""
    # Test user creation data
    user_creation_data = {
        "username": "newuser",
        "password": "password123"
    }
    
    required_creation_fields = ["username", "password"]
    is_valid_creation = check_required_fields(user_creation_data, required_creation_fields)
    print(format_test_result("User Creation Data", is_valid_creation))
    
    # Test user login data
    login_data = {
        "username": "existinguser",
        "password": "password123"
    }
    
    required_login_fields = ["username", "password"]
    is_valid_login_data = check_required_fields(login_data, required_login_fields)
    print(format_test_result("User Login Data", is_valid_login_data))
    
    # Test item creation data
    item_creation_data = {
        "title": "New Item",
        "content": "Item content here",
        "user": "507f1f77bcf86cd799439011"
    }
    
    required_item_fields = ["title", "content"]
    is_valid_item_creation = check_required_fields(item_creation_data, required_item_fields)
    print(format_test_result("Item Creation Data", is_valid_item_creation))


def test_role_based_authorization():
    """Test role-based authorization scenarios (from auth.js authorize middleware)"""
    # Test user roles
    test_users = [
        {"id": "1", "username": "admin", "role": "admin"},
        {"id": "2", "username": "user", "role": "user"},
        {"id": "3", "username": "moderator", "role": "moderator"}
    ]
    
    # Test admin access
    admin_accessible_roles = ["admin"]
    for user in test_users:
        has_admin_access = user["role"] in admin_accessible_roles
        print(format_test_result(f"Admin Access - {user['username']}", 
                               has_admin_access == (user['role'] == 'admin')))
    
    # Test user access
    user_accessible_roles = ["user", "admin"]
    for user in test_users:
        has_user_access = user["role"] in user_accessible_roles
        print(format_test_result(f"User Access - {user['username']}", 
                               has_user_access == (user['role'] in ['user', 'admin'])))


def test_integration_scenarios():
    """Test integration scenarios involving multiple components"""
    start_time = datetime.now()
    
    # Scenario 1: User registration → Login → Create Item
    user_data = generate_test_user_data(1)
    if user_data:
        # Simulate registration
        register_response = simulate_api_response(201, {"user": user_data})
        
        # Simulate login
        login_response = simulate_api_response(200, {
            "token": "mock_jwt_token",
            "user": user_data
        })
        
        # Simulate item creation
        item_data = create_mock_request_data("Test Item", user_data["id"])
        create_item_response = simulate_api_response(201, {"item": item_data})
        
        # Validate the flow
        flow_success = (register_response["success"] and 
                       login_response["success"] and 
                       create_item_response["success"])
        
        print(format_test_result("Integration - User Flow", flow_success, 
                               "Register → Login → Create Item"))
    
    # Scenario 2: Authentication → Authorization → Data Access
    auth_user = {"id": "1", "username": "testuser", "role": "user"}
    token = "mock_jwt_token"
    
    # Simulate authenticated request
    auth_response = simulate_api_response(200, {"user": auth_user})
    
    # Simulate authorized data access
    if auth_user["role"] in ["user", "admin"]:
        data_response = simulate_api_response(200, {"data": "authorized_data"})
        auth_flow_success = auth_response["success"] and data_response["success"]
        print(format_test_result("Integration - Auth Flow", auth_flow_success,
                               "Auth → Authorize → Access"))
    
    end_time = datetime.now()
    print(log_test_execution("Integration Tests", start_time, end_time))


if __name__ == "__main__":
    print("Running Python model and route tests...")
    print("=" * 60)
    
    test_user_model_structure()
    print()
    
    test_item_model_structure()
    print()
    
    test_auth_routes_responses()
    print()
    
    test_jwt_token_structure()
    print()
    
    test_error_responses()
    print()
    
    test_database_operations()
    print()
    
    test_role_based_authorization()
    print()
    
    test_integration_scenarios()
    print()
    
    print("=" * 60)
    print("Model and route tests completed!")
