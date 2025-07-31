def validate_response_format(response_data, expected_keys):
    """
    Helper function to validate API response format
    
    Args:
        response_data (dict): The response data to validate
        expected_keys (list): List of keys that should be present
        
    Returns:
        bool: True if all expected keys are present, False otherwise
    """
    return all(key in response_data for key in expected_keys)


def create_mock_request_data(item_name="test_item", user_id=1):
    """
    Helper function to create mock request data for testing
    
    Args:
        item_name (str): Name of the test item
        user_id (int): ID of the test user
        
    Returns:
        dict: Mock request data structure
    """
    return {
        "name": item_name,
        "user_id": user_id,
        "timestamp": "2024-01-01T00:00:00Z",
        "description": f"Test description for {item_name}"
    }


def format_test_result(test_name, passed, details=None):
    """
    Helper function to format test results consistently
    
    Args:
        test_name (str): Name of the test
        passed (bool): Whether the test passed
        details (str, optional): Additional details about the test
        
    Returns:
        str: Formatted test result string
    """
    status = "PASSED" if passed else "FAILED"
    result = f"Test '{test_name}': {status}"
    if details:
        result += f" - {details}"
    return result 