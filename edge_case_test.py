#!/usr/bin/env python3
"""
Additional Edge Case Tests for Admin Dashboard
Tests authentication edge cases and error handling.
"""

import requests
import json
import sys
import os
from datetime import datetime

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

class EdgeCaseTester:
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
    
    def test_duplicate_admin_setup(self):
        """Test that duplicate admin setup is prevented"""
        try:
            admin_data = {
                "username": "duplicate_admin",
                "password": "SecurePassword123!"
            }
            
            response = requests.post(
                f"{self.api_base}/admin/setup",
                json=admin_data,
                timeout=10
            )
            
            # Should fail since admin already exists
            if response.status_code == 400:
                data = response.json()
                if "already exists" in data.get('detail', '').lower():
                    self.log_result("Duplicate Admin Prevention", True, "Correctly prevented duplicate admin creation")
                    return True
                else:
                    self.log_result("Duplicate Admin Prevention", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_result("Duplicate Admin Prevention", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Duplicate Admin Prevention", False, f"Request failed: {str(e)}")
            return False
    
    def test_invalid_login_credentials(self):
        """Test login with invalid credentials"""
        try:
            invalid_data = {
                "username": "nonexistent_user",
                "password": "wrong_password"
            }
            
            response = requests.post(
                f"{self.api_base}/admin/login",
                json=invalid_data,
                timeout=10
            )
            
            # Should fail with 401
            if response.status_code == 401:
                data = response.json()
                if "incorrect" in data.get('detail', '').lower():
                    self.log_result("Invalid Login Prevention", True, "Correctly rejected invalid credentials")
                    return True
                else:
                    self.log_result("Invalid Login Prevention", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_result("Invalid Login Prevention", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Invalid Login Prevention", False, f"Request failed: {str(e)}")
            return False
    
    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        try:
            response = requests.get(
                f"{self.api_base}/admin/categories",
                timeout=10
            )
            
            # Should fail with 401 or 403
            if response.status_code in [401, 403]:
                self.log_result("Unauthorized Access Prevention", True, "Correctly blocked unauthorized access")
                return True
            else:
                self.log_result("Unauthorized Access Prevention", False, f"Expected 401/403, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Unauthorized Access Prevention", False, f"Request failed: {str(e)}")
            return False
    
    def test_invalid_token_access(self):
        """Test accessing protected endpoints with invalid token"""
        try:
            headers = {"Authorization": "Bearer invalid_token_here"}
            response = requests.get(
                f"{self.api_base}/admin/categories",
                headers=headers,
                timeout=10
            )
            
            # Should fail with 401
            if response.status_code == 401:
                self.log_result("Invalid Token Prevention", True, "Correctly rejected invalid token")
                return True
            else:
                self.log_result("Invalid Token Prevention", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Invalid Token Prevention", False, f"Request failed: {str(e)}")
            return False
    
    def test_nonexistent_category_questions(self):
        """Test getting questions for nonexistent category"""
        try:
            fake_category_id = "nonexistent-category-id-12345"
            response = requests.get(
                f"{self.api_base}/quiz/questions/{fake_category_id}",
                timeout=10
            )
            
            # Should return 404 or empty list
            if response.status_code == 404:
                self.log_result("Nonexistent Category Handling", True, "Correctly handled nonexistent category")
                return True
            elif response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) == 0:
                    self.log_result("Nonexistent Category Handling", True, "Returned empty list for nonexistent category")
                    return True
                else:
                    self.log_result("Nonexistent Category Handling", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_result("Nonexistent Category Handling", False, f"Unexpected status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Nonexistent Category Handling", False, f"Request failed: {str(e)}")
            return False
    
    def run_edge_case_tests(self):
        """Run all edge case tests"""
        print(f"🔍 Running Edge Case Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 60)
        
        tests = [
            self.test_duplicate_admin_setup,
            self.test_invalid_login_credentials,
            self.test_unauthorized_access,
            self.test_invalid_token_access,
            self.test_nonexistent_category_questions,
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
        
        print(f"\n📊 Edge Case Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        return passed, failed, self.results

def main():
    try:
        tester = EdgeCaseTester()
        passed, failed, results = tester.run_edge_case_tests()
        
        # Return appropriate exit code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()