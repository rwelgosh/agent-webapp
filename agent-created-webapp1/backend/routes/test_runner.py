"""
Comprehensive test runner for all Python tests
Runs all test files and provides a summary of results
"""
import sys
import os
from datetime import datetime
from test_helpers import format_test_result
from test_utilities import log_test_execution


def run_test_file(test_file, test_name):
    """Run a specific test file and capture results"""
    print(f"\n{'='*20} {test_name} {'='*20}")
    
    try:
        # Import and run the test file
        if test_file == "test_routes.py":
            from test_routes import (
                test_response_validation,
                test_mock_data_creation,
                test_integration_scenario,
                test_api_utilities,
                test_field_validation
            )
            
            test_response_validation()
            test_mock_data_creation()
            test_integration_scenario()
            test_api_utilities()
            test_field_validation()
            
        elif test_file == "model_tests.py":
            from model_tests import (
                test_user_model_structure,
                test_item_model_structure,
                test_auth_routes_responses,
                test_jwt_token_structure,
                test_error_responses,
                test_database_operations,
                test_role_based_authorization,
                test_integration_scenarios
            )
            
            test_user_model_structure()
            test_item_model_structure()
            test_auth_routes_responses()
            test_jwt_token_structure()
            test_error_responses()
            test_database_operations()
            test_role_based_authorization()
            test_integration_scenarios()
            
        elif test_file == "frontend_integration_tests.py":
            from frontend_integration_tests import (
                test_api_service_structure,
                test_auth_context_behavior,
                test_form_validation_scenarios,
                test_data_display_components,
                test_socket_service_integration,
                test_routing_behavior,
                test_error_handling_scenarios,
                test_user_experience_flows,
                test_performance_scenarios,
                test_integration_workflows
            )
            
            test_api_service_structure()
            test_auth_context_behavior()
            test_form_validation_scenarios()
            test_data_display_components()
            test_socket_service_integration()
            test_routing_behavior()
            test_error_handling_scenarios()
            test_user_experience_flows()
            test_performance_scenarios()
            test_integration_workflows()
        
        return True, f"{test_name} completed successfully"
        
    except Exception as e:
        return False, f"{test_name} failed: {str(e)}"


def run_all_tests():
    """Run all test files and provide summary"""
    start_time = datetime.now()
    
    print("🚀 Starting Comprehensive Test Suite")
    print("=" * 60)
    
    # Define test files to run
    test_files = [
        ("test_routes.py", "Core Route Tests"),
        ("model_tests.py", "Model & Route Integration Tests"),
        ("frontend_integration_tests.py", "Frontend Integration Tests")
    ]
    
    results = []
    total_tests = 0
    passed_tests = 0
    
    for test_file, test_name in test_files:
        if os.path.exists(test_file):
            success, message = run_test_file(test_file, test_name)
            results.append({
                "file": test_file,
                "name": test_name,
                "success": success,
                "message": message
            })
            
            if success:
                passed_tests += 1
            total_tests += 1
        else:
            results.append({
                "file": test_file,
                "name": test_name,
                "success": False,
                "message": f"Test file {test_file} not found"
            })
            total_tests += 1
    
    end_time = datetime.now()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    for result in results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status} {result['name']}: {result['message']}")
    
    print(f"\n📈 Overall Results:")
    print(f"   Total Test Files: {total_tests}")
    print(f"   Passed: {passed_tests}")
    print(f"   Failed: {total_tests - passed_tests}")
    print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "   Success Rate: 0%")
    
    print(f"\n⏱️  Total Execution Time: {log_test_execution('Complete Test Suite', start_time, end_time)}")
    
    # Return overall success
    return passed_tests == total_tests


def run_specific_test_category(category):
    """Run tests for a specific category"""
    categories = {
        "routes": ("test_routes.py", "Core Route Tests"),
        "models": ("model_tests.py", "Model & Route Integration Tests"),
        "frontend": ("frontend_integration_tests.py", "Frontend Integration Tests")
    }
    
    if category not in categories:
        print(f"❌ Unknown test category: {category}")
        print(f"Available categories: {', '.join(categories.keys())}")
        return False
    
    test_file, test_name = categories[category]
    success, message = run_test_file(test_file, test_name)
    
    print(f"\n📊 {test_name} Results:")
    print(f"   Status: {'✅ PASS' if success else '❌ FAIL'}")
    print(f"   Message: {message}")
    
    return success


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run specific category
        category = sys.argv[1].lower()
        run_specific_test_category(category)
    else:
        # Run all tests
        success = run_all_tests()
        sys.exit(0 if success else 1)
