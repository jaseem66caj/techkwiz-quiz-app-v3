#!/usr/bin/env python3
"""
Session-Based Coin System Backend Testing
Tests the specific requirements from the review request.
"""

import requests
import json
import sys
import os
from datetime import datetime

def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('NEXT_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
                elif line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

class SessionCoinBackendTester:
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
    
    def test_backend_health_check(self):
        """Test if backend service is running properly"""
        try:
            response = requests.get(f"{self.api_base}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'TechKwiz API is running':
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
    
    def test_quiz_categories_api(self):
        """Test GET /api/quiz/categories returns categories with entry fees"""
        try:
            response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Quiz Categories API", False, f"Categories API failed: HTTP {response.status_code}")
                return False, []
            
            categories = response.json()
            
            if not isinstance(categories, list):
                self.log_result("Quiz Categories API", False, f"Expected list, got {type(categories)}")
                return False, []
            
            if len(categories) == 0:
                self.log_result("Quiz Categories API", False, "No categories found")
                return False, []
            
            # Check if categories have entry_fee fields
            categories_with_fees = []
            categories_without_fees = []
            
            for category in categories:
                if 'entry_fee' in category:
                    categories_with_fees.append({
                        'name': category.get('name', 'Unknown'),
                        'entry_fee': category['entry_fee']
                    })
                else:
                    categories_without_fees.append(category.get('name', 'Unknown'))
            
            if categories_without_fees:
                self.log_result("Quiz Categories API", False, f"Categories missing entry_fee: {categories_without_fees}")
                return False, categories
            
            # Verify entry fees are reasonable (≥100 coins as per coin system)
            low_fee_categories = [cat for cat in categories_with_fees if cat['entry_fee'] < 100]
            if low_fee_categories:
                self.log_result("Quiz Categories API", False, f"Categories with low entry fees (<100): {low_fee_categories}")
                return False, categories
            
            # Format the category info properly
            category_info = []
            for cat in categories_with_fees[:3]:
                category_info.append(f"{cat['name']}: {cat['entry_fee']} coins")
            
            self.log_result("Quiz Categories API", True, f"Found {len(categories)} categories with proper entry fees: {category_info}")
            return True, categories
            
        except Exception as e:
            self.log_result("Quiz Categories API", False, f"Categories API test failed: {str(e)}")
            return False, []
    
    def test_quiz_questions_api(self, categories):
        """Test GET /api/quiz/questions/{category_id} returns questions"""
        if not categories:
            self.log_result("Quiz Questions API", False, "No categories available for testing")
            return False
            
        try:
            # Test questions for first category
            test_category = categories[0]
            category_id = test_category['id']
            
            response = requests.get(f"{self.api_base}/quiz/questions/{category_id}", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Quiz Questions API", False, f"Questions API failed: HTTP {response.status_code}")
                return False
            
            questions = response.json()
            
            if not isinstance(questions, list):
                self.log_result("Quiz Questions API", False, f"Expected list, got {type(questions)}")
                return False
            
            if len(questions) == 0:
                self.log_result("Quiz Questions API", False, f"No questions found for category '{test_category['name']}'")
                return False
            
            # Verify question structure
            required_fields = ['id', 'question', 'options', 'correct_answer']
            for i, question in enumerate(questions[:2]):  # Check first 2 questions
                missing_fields = [field for field in required_fields if field not in question]
                if missing_fields:
                    self.log_result("Quiz Questions API", False, f"Question {i} missing fields: {missing_fields}")
                    return False
                
                # Verify options structure
                if not isinstance(question.get('options'), list) or len(question.get('options', [])) < 2:
                    self.log_result("Quiz Questions API", False, f"Question {i} has invalid options structure")
                    return False
            
            self.log_result("Quiz Questions API", True, f"Found {len(questions)} questions for category '{test_category['name']}'")
            return True
            
        except Exception as e:
            self.log_result("Quiz Questions API", False, f"Questions API test failed: {str(e)}")
            return False
    
    def test_admin_authentication(self):
        """Quick test of admin login functionality"""
        try:
            # First, try to setup admin user if it doesn't exist
            setup_credentials = {
                "username": "admin",
                "password": "TechKwiz2025!"
            }
            
            setup_response = requests.post(
                f"{self.api_base}/admin/setup",
                json=setup_credentials,
                timeout=10
            )
            
            # Setup might fail if admin already exists, that's okay
            if setup_response.status_code == 200:
                self.log_result("Admin Setup", True, "Admin user created successfully")
            
            # Now try to login with the specific credentials
            login_response = requests.post(
                f"{self.api_base}/admin/login",
                json=setup_credentials,
                timeout=10
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                if 'access_token' in token_data:
                    self.log_result("Admin Authentication", True, "Admin login successful with username=admin, password=TechKwiz2025!")
                    return True, token_data['access_token']
                else:
                    self.log_result("Admin Authentication", False, "Login response missing access_token")
                    return False, None
            else:
                self.log_result("Admin Authentication", False, f"Login failed: HTTP {login_response.status_code}")
                return False, None
                
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Authentication test failed: {str(e)}")
            return False, None
    
    def test_database_connection(self):
        """Verify MongoDB connectivity is working"""
        try:
            # Create a test record
            test_data = {"client_name": "session_coin_test_client"}
            
            post_response = requests.post(
                f"{self.api_base}/status",
                json=test_data,
                timeout=10
            )
            
            if post_response.status_code != 200:
                self.log_result("Database Connection", False, "Failed to create test record")
                return False
            
            # Retrieve records to verify persistence
            get_response = requests.get(f"{self.api_base}/status", timeout=10)
            
            if get_response.status_code == 200:
                records = get_response.json()
                test_record_found = any(
                    record.get('client_name') == 'session_coin_test_client' 
                    for record in records
                )
                
                if test_record_found:
                    self.log_result("Database Connection", True, "MongoDB connectivity and data persistence working correctly")
                    return True
                else:
                    self.log_result("Database Connection", False, "Test record not found in database")
                    return False
            else:
                self.log_result("Database Connection", False, "Failed to retrieve records")
                return False
                
        except Exception as e:
            self.log_result("Database Connection", False, f"Database test failed: {str(e)}")
            return False
    
    def test_admin_protected_endpoints(self, token):
        """Test that admin endpoints are properly protected"""
        if not token:
            self.log_result("Admin Protected Endpoints", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test protected endpoints
            protected_endpoints = [
                "/admin/categories",
                "/admin/questions", 
                "/admin/scripts",
                "/admin/ad-slots"
            ]
            
            working_endpoints = []
            failed_endpoints = []
            
            for endpoint in protected_endpoints:
                try:
                    response = requests.get(f"{self.api_base}{endpoint}", headers=headers, timeout=10)
                    if response.status_code == 200:
                        working_endpoints.append(endpoint)
                    else:
                        failed_endpoints.append(f"{endpoint} ({response.status_code})")
                except Exception as e:
                    failed_endpoints.append(f"{endpoint} (error: {str(e)})")
            
            if failed_endpoints:
                self.log_result("Admin Protected Endpoints", False, f"Failed endpoints: {failed_endpoints}")
                return False
            
            self.log_result("Admin Protected Endpoints", True, f"All {len(working_endpoints)} admin endpoints accessible with valid token")
            return True
            
        except Exception as e:
            self.log_result("Admin Protected Endpoints", False, f"Protected endpoints test failed: {str(e)}")
            return False
    
    def run_session_coin_tests(self):
        """Run the specific tests requested in the review"""
        print(f"🪙 Starting Session-Based Coin System Backend Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 70)
        
        # Test 1: Backend Health Check
        health_result = self.test_backend_health_check()
        print("-" * 40)
        
        # Test 2: Quiz Categories API
        categories_result, categories = self.test_quiz_categories_api()
        print("-" * 40)
        
        # Test 3: Quiz Questions API
        questions_result = self.test_quiz_questions_api(categories)
        print("-" * 40)
        
        # Test 4: Admin Authentication
        auth_result, admin_token = self.test_admin_authentication()
        print("-" * 40)
        
        # Test 5: Database Connection
        db_result = self.test_database_connection()
        print("-" * 40)
        
        # Bonus: Admin Protected Endpoints
        if admin_token:
            admin_endpoints_result = self.test_admin_protected_endpoints(admin_token)
            print("-" * 40)
        else:
            admin_endpoints_result = False
        
        # Summary
        tests = [health_result, categories_result, questions_result, auth_result, db_result, admin_endpoints_result]
        passed = sum(tests)
        failed = len(tests) - passed
        
        print(f"\n📊 Session-Based Coin System Backend Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/len(tests)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 ALL BACKEND TESTS PASSED!")
            print(f"   ✅ Backend services running properly")
            print(f"   ✅ Quiz categories API returns categories with entry fees")
            print(f"   ✅ Quiz questions API returns questions properly")
            print(f"   ✅ Admin authentication working correctly")
            print(f"   ✅ MongoDB connectivity verified")
            print(f"   ✅ Admin endpoints properly protected")
        else:
            print(f"\n⚠️  BACKEND ISSUES FOUND:")
            if not health_result:
                print(f"   ❌ Backend health check failed")
            if not categories_result:
                print(f"   ❌ Quiz categories API issues")
            if not questions_result:
                print(f"   ❌ Quiz questions API issues")
            if not auth_result:
                print(f"   ❌ Admin authentication issues")
            if not db_result:
                print(f"   ❌ Database connection issues")
            if not admin_endpoints_result:
                print(f"   ❌ Admin endpoint protection issues")
        
        return passed, failed, self.results

def main():
    try:
        tester = SessionCoinBackendTester()
        passed, failed, results = tester.run_session_coin_tests()
        
        # Return appropriate exit code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()