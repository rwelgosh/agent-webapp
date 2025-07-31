import json
from datetime import datetime


def simulate_api_response(status_code=200, data=None, error_message=None):
    """
    Simulate an API response structure
    
    Args:
        status_code (int): HTTP status code
        data (dict): Response data payload
        error_message (str): Error message if applicable
        
    Returns:
        dict: Simulated API response
    """
    response = {
        "status_code": status_code,
        "timestamp": datetime.now().isoformat(),
        "success": 200 <= status_code < 300
    }
    
    if error_message:
        response["error"] = error_message
    if data:
        response["data"] = data
        
    return response


def generate_test_user_data(user_count=1):
    """
    Generate test user data for testing
    
    Args:
        user_count (int): Number of test users to generate
        
    Returns:
        list: List of test user dictionaries
    """
    users = []
    for i in range(user_count):
        user = {
            "id": i + 1,
            "username": f"testuser{i + 1}",
            "email": f"testuser{i + 1}@example.com",
            "role": "user" if i % 2 == 0 else "admin",
            "active": True
        }
        users.append(user)
    
    return users if user_count > 1 else users[0] if users else None


def check_required_fields(data, required_fields):
    """
    Check if all required fields are present and not None/empty
    
    Args:
        data (dict): Data to check
        required_fields (list): List of required field names
        
    Returns:
        tuple: (is_valid, missing_fields)
    """
    missing_fields = []
    
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            missing_fields.append(field)
    
    return len(missing_fields) == 0, missing_fields


def log_test_execution(test_name, start_time=None, end_time=None):
    """
    Log test execution details
    
    Args:
        test_name (str): Name of the test
        start_time (datetime): Test start time
        end_time (datetime): Test end time
        
    Returns:
        str: Formatted log message
    """
    if start_time and end_time:
        duration = (end_time - start_time).total_seconds()
        return f"Test '{test_name}' executed in {duration:.3f} seconds"
    else:
        return f"Test '{test_name}' logged at {datetime.now().isoformat()}" 