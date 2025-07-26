#!/usr/bin/env python3
"""
Backend Testing Suite for Frontend-Supporting Components
Tests the FastAPI backend that supports the frontend features.
"""

import requests
import json
import sys
import os
from datetime import datetime
import time

# Get backend URL from frontend environment
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

class BackendTester:
    def __init__(self):
        self.backend_url = get_backend_url()
        if not self.backend_url:
            raise Exception("Could not get backend URL from frontend/.env")
        
        self.api_base = f"{self.backend_url}/api"
        self.results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_backend_health(self):
        """Test if backend service is responding"""
        try:
            response = requests.get(f"{self.api_base}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Hello World':
                    self.log_result("Backend Health Check", True, "Backend API is responding correctly")
                    return True
                else:
                    self.log_result("Backend Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_result("Backend Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_result("Backend Health Check", False, f"Connection failed: {str(e)}")
            return False
    
    def test_cors_configuration(self):
        """Test CORS headers for frontend integration"""
        try:
            # Test CORS with a GET request (OPTIONS not supported by FastAPI by default)
            response = requests.get(
                f"{self.api_base}/", 
                headers={'Origin': 'https://example.com'},
                timeout=10
            )
            headers = response.headers
            
            # Check for essential CORS headers
            if 'access-control-allow-origin' in headers:
                origin = headers.get('access-control-allow-origin')
                if origin == '*' or 'example.com' in origin:
                    self.log_result("CORS Configuration", True, f"CORS properly configured with origin: {origin}")
                    return True
                else:
                    self.log_result("CORS Configuration", False, f"Unexpected CORS origin: {origin}")
                    return False
            else:
                self.log_result("CORS Configuration", False, "Missing Access-Control-Allow-Origin header")
                return False
        except Exception as e:
            self.log_result("CORS Configuration", False, f"CORS test failed: {str(e)}")
            return False
    
    def test_status_api_post(self):
        """Test POST /api/status endpoint"""
        try:
            test_data = {
                "client_name": "test_frontend_client"
            }
            
            response = requests.post(
                f"{self.api_base}/status",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'client_name', 'timestamp']
                
                if all(field in data for field in required_fields):
                    if data['client_name'] == test_data['client_name']:
                        self.log_result("Status API POST", True, "Status creation working correctly")
                        return True, data['id']
                    else:
                        self.log_result("Status API POST", False, "Client name mismatch in response")
                        return False, None
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Status API POST", False, f"Missing fields in response: {missing}")
                    return False, None
            else:
                self.log_result("Status API POST", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_result("Status API POST", False, f"Request failed: {str(e)}")
            return False, None
    
    def test_status_api_get(self):
        """Test GET /api/status endpoint"""
        try:
            response = requests.get(f"{self.api_base}/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check structure of first item
                        first_item = data[0]
                        required_fields = ['id', 'client_name', 'timestamp']
                        
                        if all(field in first_item for field in required_fields):
                            self.log_result("Status API GET", True, f"Retrieved {len(data)} status records")
                            return True
                        else:
                            missing = [f for f in required_fields if f not in first_item]
                            self.log_result("Status API GET", False, f"Invalid record structure, missing: {missing}")
                            return False
                    else:
                        self.log_result("Status API GET", True, "Empty status list (valid response)")
                        return True
                else:
                    self.log_result("Status API GET", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("Status API GET", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Status API GET", False, f"Request failed: {str(e)}")
            return False
    
    def test_api_route_prefix(self):
        """Test that API routes are properly prefixed with /api"""
        try:
            # Test that root serves frontend (Next.js)
            root_response = requests.get(f"{self.backend_url}/", timeout=10)
            
            # Test that /api/ serves backend API
            api_response = requests.get(f"{self.api_base}/", timeout=10)
            
            if api_response.status_code == 200:
                api_data = api_response.json()
                
                # Root should serve HTML (frontend), API should serve JSON
                if (root_response.status_code == 200 and 
                    'text/html' in root_response.headers.get('content-type', '') and
                    api_data.get('message') == 'Hello World'):
                    
                    self.log_result("API Route Prefix", True, "API routes properly prefixed - frontend at /, API at /api")
                    return True
                else:
                    self.log_result("API Route Prefix", False, "Route separation not working correctly")
                    return False
            else:
                self.log_result("API Route Prefix", False, "API endpoint not responding")
                return False
                
        except Exception as e:
            self.log_result("API Route Prefix", False, f"Prefix test failed: {str(e)}")
            return False
    
    def test_mongodb_connection(self):
        """Test MongoDB connectivity through API operations"""
        try:
            # Create a test record
            test_data = {"client_name": "mongodb_test_client"}
            
            post_response = requests.post(
                f"{self.api_base}/status",
                json=test_data,
                timeout=10
            )
            
            if post_response.status_code != 200:
                self.log_result("MongoDB Connection", False, "Failed to create test record")
                return False
            
            # Retrieve records to verify persistence
            get_response = requests.get(f"{self.api_base}/status", timeout=10)
            
            if get_response.status_code == 200:
                records = get_response.json()
                test_record_found = any(
                    record.get('client_name') == 'mongodb_test_client' 
                    for record in records
                )
                
                if test_record_found:
                    self.log_result("MongoDB Connection", True, "Data persistence working correctly")
                    return True
                else:
                    self.log_result("MongoDB Connection", False, "Test record not found in database")
                    return False
            else:
                self.log_result("MongoDB Connection", False, "Failed to retrieve records")
                return False
                
        except Exception as e:
            self.log_result("MongoDB Connection", False, f"Database test failed: {str(e)}")
            return False
    
    def test_environment_configuration(self):
        """Test environment variable configuration"""
        try:
            # Check if backend can access required environment variables
            backend_env_path = '/app/backend/.env'
            frontend_env_path = '/app/frontend/.env'
            
            # Verify backend .env exists and has required variables
            if not os.path.exists(backend_env_path):
                self.log_result("Environment Config", False, "Backend .env file missing")
                return False
            
            with open(backend_env_path, 'r') as f:
                backend_env = f.read()
                
            required_backend_vars = ['MONGO_URL', 'DB_NAME']
            missing_vars = []
            
            for var in required_backend_vars:
                if f"{var}=" not in backend_env:
                    missing_vars.append(var)
            
            if missing_vars:
                self.log_result("Environment Config", False, f"Missing backend env vars: {missing_vars}")
                return False
            
            # Verify frontend .env has backend URL
            if not os.path.exists(frontend_env_path):
                self.log_result("Environment Config", False, "Frontend .env file missing")
                return False
                
            with open(frontend_env_path, 'r') as f:
                frontend_env = f.read()
                
            if 'REACT_APP_BACKEND_URL=' not in frontend_env:
                self.log_result("Environment Config", False, "Frontend missing REACT_APP_BACKEND_URL")
                return False
            
            self.log_result("Environment Config", True, "All required environment variables present")
            return True
            
        except Exception as e:
            self.log_result("Environment Config", False, f"Environment check failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend Tests for Frontend Support")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 60)
        
        tests = [
            self.test_environment_configuration,
            self.test_backend_health,
            self.test_cors_configuration,
            self.test_api_route_prefix,
            self.test_status_api_post,
            self.test_status_api_get,
            self.test_mongodb_connection,
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                result = test()
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Exception: {str(e)}")
                failed += 1
            
            print("-" * 40)
        
        print(f"\n📊 Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        return passed, failed, self.results

def main():
    try:
        tester = BackendTester()
        passed, failed, results = tester.run_all_tests()
        
        # Return appropriate exit code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()