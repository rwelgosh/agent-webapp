"""
Performance and Load Testing Suite
Tests API performance, response times, and system behavior under load
"""

import pytest
import requests
import time
import threading
import statistics
import concurrent.futures
from typing import List, Dict, Tuple
import json

# Configuration
BASE_URL = "http://localhost:3000/api"
LOAD_TEST_USERS = 10
REQUEST_TIMEOUT = 30
ACCEPTABLE_RESPONSE_TIME = 2.0  # seconds

class PerformanceMetrics:
    """Collect and analyze performance metrics"""
    
    def __init__(self):
        self.response_times = []
        self.errors = []
        self.status_codes = []
        self.start_time = None
        self.end_time = None
    
    def add_result(self, response_time: float, status_code: int, error: str = None):
        """Add a test result"""
        self.response_times.append(response_time)
        self.status_codes.append(status_code)
        if error:
            self.errors.append(error)
    
    def get_statistics(self) -> Dict:
        """Calculate performance statistics"""
        if not self.response_times:
            return {}
        
        return {
            "total_requests": len(self.response_times),
            "avg_response_time": statistics.mean(self.response_times),
            "median_response_time": statistics.median(self.response_times),
            "min_response_time": min(self.response_times),
            "max_response_time": max(self.response_times),
            "95th_percentile": statistics.quantiles(self.response_times, n=20)[18] if len(self.response_times) > 20 else max(self.response_times),
            "success_rate": (len([s for s in self.status_codes if 200 <= s < 300]) / len(self.status_codes)) * 100,
            "error_count": len(self.errors),
            "total_duration": self.end_time - self.start_time if self.start_time and self.end_time else 0
        }

class TestAPIPerformance:
    """Test individual API endpoint performance"""
    
    def test_status_endpoint_performance(self):
        """Test /api/status response time"""
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        for _ in range(10):
            start = time.time()
            try:
                response = requests.get(f"{BASE_URL}/status", timeout=REQUEST_TIMEOUT)
                end = time.time()
                metrics.add_result(end - start, response.status_code)
            except Exception as e:
                end = time.time()
                metrics.add_result(end - start, 0, str(e))
        
        metrics.end_time = time.time()
        stats = metrics.get_statistics()
        
        # Performance assertions
        assert stats["avg_response_time"] < ACCEPTABLE_RESPONSE_TIME
        assert stats["success_rate"] >= 95.0
        assert stats["max_response_time"] < ACCEPTABLE_RESPONSE_TIME * 2
    
    def test_items_list_performance(self):
        """Test /api/items response time"""
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        for _ in range(10):
            start = time.time()
            try:
                response = requests.get(f"{BASE_URL}/items", timeout=REQUEST_TIMEOUT)
                end = time.time()
                metrics.add_result(end - start, response.status_code)
            except Exception as e:
                end = time.time()
                metrics.add_result(end - start, 0, str(e))
        
        metrics.end_time = time.time()
        stats = metrics.get_statistics()
        
        # Performance assertions
        assert stats["avg_response_time"] < ACCEPTABLE_RESPONSE_TIME * 2  # Allow more time for DB queries
        assert stats["success_rate"] >= 90.0
    
    def test_search_performance(self):
        """Test search endpoint performance"""
        search_queries = ["test", "item", "content", "example", "data"]
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        for query in search_queries:
            start = time.time()
            try:
                response = requests.get(f"{BASE_URL}/items/search?q={query}", timeout=REQUEST_TIMEOUT)
                end = time.time()
                metrics.add_result(end - start, response.status_code)
            except Exception as e:
                end = time.time()
                metrics.add_result(end - start, 0, str(e))
        
        metrics.end_time = time.time()
        stats = metrics.get_statistics()
        
        # Search should be reasonably fast
        assert stats["avg_response_time"] < ACCEPTABLE_RESPONSE_TIME * 3
        assert stats["success_rate"] >= 90.0

class TestLoadTesting:
    """Load testing with concurrent users"""
    
    def make_request(self, endpoint: str, method: str = "GET", data: Dict = None) -> Tuple[float, int, str]:
        """Make a single request and return timing info"""
        start = time.time()
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=REQUEST_TIMEOUT)
            elif method == "POST":
                response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=REQUEST_TIMEOUT)
            
            end = time.time()
            return end - start, response.status_code, ""
        except Exception as e:
            end = time.time()
            return end - start, 0, str(e)
    
    def test_concurrent_status_requests(self):
        """Test concurrent requests to status endpoint"""
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        def worker():
            response_time, status_code, error = self.make_request("/status")
            return response_time, status_code, error
        
        # Use ThreadPoolExecutor for concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=LOAD_TEST_USERS) as executor:
            futures = [executor.submit(worker) for _ in range(50)]  # 50 concurrent requests
            
            for future in concurrent.futures.as_completed(futures):
                response_time, status_code, error = future.result()
                metrics.add_result(response_time, status_code, error)
        
        metrics.end_time = time.time()
        stats = metrics.get_statistics()
        
        # Under load assertions
        assert stats["success_rate"] >= 85.0  # Allow some failures under load
        assert stats["avg_response_time"] < ACCEPTABLE_RESPONSE_TIME * 3
        assert len(metrics.errors) < 5  # Max 5 errors out of 50 requests
    
    def test_concurrent_items_requests(self):
        """Test concurrent requests to items endpoint"""
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        def worker():
            response_time, status_code, error = self.make_request("/items")
            return response_time, status_code, error
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=LOAD_TEST_USERS) as executor:
            futures = [executor.submit(worker) for _ in range(30)]
            
            for future in concurrent.futures.as_completed(futures):
                response_time, status_code, error = future.result()
                metrics.add_result(response_time, status_code, error)
        
        metrics.end_time = time.time()
        stats = metrics.get_statistics()
        
        # Database operations under load
        assert stats["success_rate"] >= 80.0
        assert stats["95th_percentile"] < ACCEPTABLE_RESPONSE_TIME * 5
    
    def test_mixed_load_scenario(self):
        """Test mixed load with different endpoints"""
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        endpoints = ["/status", "/items", "/data", "/random"]
        
        def worker(endpoint):
            response_time, status_code, error = self.make_request(endpoint)
            return response_time, status_code, error
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=LOAD_TEST_USERS) as executor:
            futures = []
            
            # Create mixed workload
            for _ in range(40):
                endpoint = endpoints[_ % len(endpoints)]
                futures.append(executor.submit(worker, endpoint))
            
            for future in concurrent.futures.as_completed(futures):
                response_time, status_code, error = future.result()
                metrics.add_result(response_time, status_code, error)
        
        metrics.end_time = time.time()
        stats = metrics.get_statistics()
        
        # Mixed load should handle variety well
        assert stats["success_rate"] >= 85.0
        assert stats["total_requests"] == 40

class TestStressTesting:
    """Stress testing to find breaking points"""
    
    def test_gradual_load_increase(self):
        """Gradually increase load to find limits"""
        load_levels = [5, 10, 20, 30]
        results = {}
        
        for load_level in load_levels:
            metrics = PerformanceMetrics()
            metrics.start_time = time.time()
            
            def worker():
                response_time, status_code, error = self.make_request("/status")
                return response_time, status_code, error
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=load_level) as executor:
                futures = [executor.submit(worker) for _ in range(load_level * 2)]
                
                for future in concurrent.futures.as_completed(futures):
                    response_time, status_code, error = future.result()
                    metrics.add_result(response_time, status_code, error)
            
            metrics.end_time = time.time()
            results[load_level] = metrics.get_statistics()
        
        # Analyze degradation
        for i, load_level in enumerate(load_levels):
            stats = results[load_level]
            
            # At minimum load, should perform well
            if load_level == load_levels[0]:
                assert stats["success_rate"] >= 95.0
                assert stats["avg_response_time"] < ACCEPTABLE_RESPONSE_TIME
            
            # Should maintain reasonable performance even under stress
            assert stats["success_rate"] >= 70.0  # Some degradation acceptable
    
    def test_sustained_load(self):
        """Test sustained load over time"""
        duration_seconds = 30
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        def worker():
            while time.time() - metrics.start_time < duration_seconds:
                response_time, status_code, error = self.make_request("/status")
                metrics.add_result(response_time, status_code, error)
                time.sleep(0.1)  # Small delay between requests
        
        # Run multiple workers for sustained load
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=worker)
            thread.start()
            threads.append(thread)
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        metrics.end_time = time.time()
        stats = metrics.get_statistics()
        
        # Sustained load assertions
        assert stats["total_requests"] > 50  # Should handle many requests
        assert stats["success_rate"] >= 80.0
        assert stats["total_duration"] >= duration_seconds * 0.9  # Within 10% of target

class TestMemoryAndResource:
    """Test resource usage patterns"""
    
    def test_memory_leak_detection(self):
        """Detect potential memory leaks through repeated requests"""
        baseline_times = []
        later_times = []
        
        # Get baseline performance
        for _ in range(10):
            start = time.time()
            response = requests.get(f"{BASE_URL}/status")
            end = time.time()
            baseline_times.append(end - start)
            time.sleep(0.1)
        
        # Make many requests to potentially trigger memory issues
        for _ in range(100):
            requests.get(f"{BASE_URL}/status")
        
        # Test performance after heavy usage
        for _ in range(10):
            start = time.time()
            response = requests.get(f"{BASE_URL}/status")
            end = time.time()
            later_times.append(end - start)
            time.sleep(0.1)
        
        baseline_avg = statistics.mean(baseline_times)
        later_avg = statistics.mean(later_times)
        
        # Performance shouldn't degrade significantly
        degradation_ratio = later_avg / baseline_avg
        assert degradation_ratio < 2.0  # No more than 2x slower
        
        # Response times should still be reasonable
        assert later_avg < ACCEPTABLE_RESPONSE_TIME * 2

class TestCachePerformance:
    """Test caching behavior and performance"""
    
    def test_repeated_requests_performance(self):
        """Test if repeated requests benefit from caching"""
        first_request_times = []
        repeated_request_times = []
        
        # First requests (potentially cache misses)
        for _ in range(5):
            start = time.time()
            response = requests.get(f"{BASE_URL}/data")
            end = time.time()
            first_request_times.append(end - start)
            time.sleep(0.1)
        
        # Repeated requests (potentially cache hits)
        for _ in range(5):
            start = time.time()
            response = requests.get(f"{BASE_URL}/data")
            end = time.time()
            repeated_request_times.append(end - start)
            time.sleep(0.1)
        
        first_avg = statistics.mean(first_request_times)
        repeated_avg = statistics.mean(repeated_request_times)
        
        # Both should be reasonably fast
        assert first_avg < ACCEPTABLE_RESPONSE_TIME * 2
        assert repeated_avg < ACCEPTABLE_RESPONSE_TIME * 2
        
        # Optionally test if caching improves performance
        # (This would depend on actual caching implementation)
        # assert repeated_avg <= first_avg * 1.1  # Allow some variance

def make_request(endpoint: str, method: str = "GET", data: Dict = None) -> Tuple[float, int, str]:
    """Helper function for making requests"""
    start = time.time()
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=REQUEST_TIMEOUT)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=REQUEST_TIMEOUT)
        
        end = time.time()
        return end - start, response.status_code, ""
    except Exception as e:
        end = time.time()
        return end - start, 0, str(e)

if __name__ == "__main__":
    # Run performance tests
    pytest.main([__file__, "-v", "--tb=short", "-s"]) 