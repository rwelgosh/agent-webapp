from test_helpers import validate_response_format, create_mock_request_data, format_test_result


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


if __name__ == "__main__":
    print("Running Python test suite for routes...")
    print("=" * 50)
    
    test_response_validation()
    print()
    
    test_mock_data_creation()
    print()
    
    test_integration_scenario()
    print()
    
    print("=" * 50)
    print("Test suite completed!") 