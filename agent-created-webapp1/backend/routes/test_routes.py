from test_helpers import validate_response_format, create_mock_request_data, format_test_result
from test_utilities import simulate_api_response, generate_test_user_data, check_required_fields, log_test_execution


def test_response_validation():
    """Test that demonstrates using the response validation helper function"""
    # Test case 1: Valid response with all expected keys
    mock_response = {
        "id": 1, 
        "name": "test_item", 
        "status": "active",
        "created_at": "2024-01-01"
    }
    expected_keys = ["id", "name", "status"]
    
    result = validate_response_format(mock_response, expected_keys)
    print(format_test_result("Response Validation - Valid Keys", result))
    
    # Test case 2: Invalid response missing keys
    incomplete_response = {"id": 1, "name": "test_item"}
    expected_keys_full = ["id", "name", "status", "description"]
    
    result = validate_response_format(incomplete_response, expected_keys_full)
    print(format_test_result("Response Validation - Missing Keys", not result, "Expected failure"))


def test_mock_data_creation():
    """Test that demonstrates using the mock data creation helper"""
    # Test default parameters
    default_mock = create_mock_request_data()
    has_required_fields = all(key in default_mock for key in ["name", "user_id", "timestamp"])
    print(format_test_result("Mock Data Creation - Default", has_required_fields))
    
    # Test custom parameters
    custom_mock = create_mock_request_data("custom_item", 999)
    is_custom_correct = (custom_mock["name"] == "custom_item" and 
                        custom_mock["user_id"] == 999)
    print(format_test_result("Mock Data Creation - Custom", is_custom_correct))
    
    print(f"Custom mock data: {custom_mock}")


def test_integration_scenario():
    """Test that combines multiple helper functions"""
    # Create mock data using helper
    test_data = create_mock_request_data("integration_test", 42)
    
    # Simulate processing the data (add an ID like an API would)
    processed_data = {**test_data, "id": 1, "status": "processed"}
    
    # Validate the processed response
    required_fields = ["id", "name", "user_id", "status"]
    validation_result = validate_response_format(processed_data, required_fields)
    
    print(format_test_result("Integration Test", validation_result, 
                           "Mock creation → Processing → Validation"))


def test_api_utilities():
    """Test that demonstrates using the API utility functions"""
    # Generate test user data
    test_user = generate_test_user_data(1)
    print(format_test_result("User Data Generation", test_user is not None))
    
    # Test multiple users
    multiple_users = generate_test_user_data(3)
    has_three_users = isinstance(multiple_users, list) and len(multiple_users) == 3
    print(format_test_result("Multiple User Generation", has_three_users))
    
    # Simulate successful API response
    success_response = simulate_api_response(200, {"user": test_user})
    is_success = success_response["success"] and "data" in success_response
    print(format_test_result("API Response - Success", is_success))
    
    # Simulate error API response
    error_response = simulate_api_response(404, error_message="User not found")
    is_error = not error_response["success"] and "error" in error_response
    print(format_test_result("API Response - Error", is_error))


def test_field_validation():
    """Test field validation using utilities"""
    from datetime import datetime
    
    start_time = datetime.now()
    
    # Test complete user data
    complete_user = generate_test_user_data(1)
    required_user_fields = ["id", "username", "email", "role"]
    
    is_valid, missing = check_required_fields(complete_user, required_user_fields)
    print(format_test_result("Field Validation - Complete", is_valid))
    
    # Test incomplete data
    incomplete_data = {"id": 1, "username": "test"}
    is_invalid, missing_fields = check_required_fields(incomplete_data, required_user_fields)
    print(format_test_result("Field Validation - Incomplete", not is_invalid, f"Missing: {missing_fields}"))
    
    end_time = datetime.now()
    print(log_test_execution("Field Validation Tests", start_time, end_time))


if __name__ == "__main__":
    print("Running Python test suite for routes...")
    print("=" * 50)
    
    test_response_validation()
    print()
    
    test_mock_data_creation()
    print()
    
    test_integration_scenario()
    print()
    
    test_api_utilities()
    print()
    
    test_field_validation()
    print()
    
    print("=" * 50)
    print("Test suite completed!") 