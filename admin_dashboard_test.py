#!/usr/bin/env python3
"""
Comprehensive Admin Dashboard Backend Testing Suite
Tests all admin dashboard features including authentication, quiz management, and configuration.
"""

import requests
import json
import sys
import os
from datetime import datetime
import time
import random

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

class AdminDashboardTester:
    def __init__(self):
        self.backend_url = get_backend_url()
        if not self.backend_url:
            raise Exception("Could not get backend URL from frontend/.env")
        
        self.api_base = f"{self.backend_url}/api"
        self.results = []
        self.admin_token = None
        self.test_data = {}
        
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
    
    def get_auth_headers(self):
        """Get authorization headers with admin token"""
        if not self.admin_token:
            return {}
        return {"Authorization": f"Bearer {self.admin_token}"}
    
    # 1. ADMIN AUTHENTICATION SYSTEM TESTS
    def test_admin_setup(self):
        """Test admin setup endpoint - should create first admin user"""
        try:
            admin_data = {
                "username": "admin_user",
                "password": "SecurePassword123!"
            }
            
            response = requests.post(
                f"{self.api_base}/admin/setup",
                json=admin_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'username', 'created_at']
                
                if all(field in data for field in required_fields):
                    if data['username'] == admin_data['username']:
                        self.test_data['admin_credentials'] = admin_data
                        self.log_result("Admin Setup", True, "Admin user created successfully")
                        return True
                    else:
                        self.log_result("Admin Setup", False, "Username mismatch in response")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Admin Setup", False, f"Missing fields in response: {missing}")
                    return False
            else:
                self.log_result("Admin Setup", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Setup", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test admin login - should return JWT token"""
        try:
            if 'admin_credentials' not in self.test_data:
                self.log_result("Admin Login", False, "No admin credentials available from setup")
                return False
            
            response = requests.post(
                f"{self.api_base}/admin/login",
                json=self.test_data['admin_credentials'],
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'access_token' in data and 'token_type' in data:
                    if data['token_type'] == 'bearer' and data['access_token']:
                        self.admin_token = data['access_token']
                        self.log_result("Admin Login", True, "JWT token received successfully")
                        return True
                    else:
                        self.log_result("Admin Login", False, "Invalid token format")
                        return False
                else:
                    self.log_result("Admin Login", False, "Missing token fields in response")
                    return False
            else:
                self.log_result("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_token_verification(self):
        """Test token verification - should validate JWT tokens"""
        try:
            if not self.admin_token:
                self.log_result("Token Verification", False, "No admin token available")
                return False
            
            response = requests.get(
                f"{self.api_base}/admin/verify",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('valid') == True and 'username' in data:
                    expected_username = self.test_data['admin_credentials']['username']
                    if data['username'] == expected_username:
                        self.log_result("Token Verification", True, "Token verification working correctly")
                        return True
                    else:
                        self.log_result("Token Verification", False, "Username mismatch in verification")
                        return False
                else:
                    self.log_result("Token Verification", False, "Invalid verification response")
                    return False
            else:
                self.log_result("Token Verification", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Token Verification", False, f"Request failed: {str(e)}")
            return False
    
    # 2. QUIZ MANAGEMENT APIS TESTS
    def test_get_categories(self):
        """Test get categories - should return quiz categories from database"""
        try:
            response = requests.get(
                f"{self.api_base}/admin/categories",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.test_data['categories'] = data
                    self.log_result("Get Categories", True, f"Retrieved {len(data)} categories")
                    return True
                else:
                    self.log_result("Get Categories", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("Get Categories", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Categories", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_category(self):
        """Test create category - CRUD operation"""
        try:
            category_data = {
                "name": "Test Technology",
                "icon": "💻",
                "color": "#3B82F6",
                "description": "Test category for technology questions",
                "subcategories": ["Programming", "AI", "Web Development"],
                "entry_fee": 100,
                "prize_pool": 1000
            }
            
            response = requests.post(
                f"{self.api_base}/admin/categories",
                json=category_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'name', 'icon', 'color', 'created_at']
                
                if all(field in data for field in required_fields):
                    if data['name'] == category_data['name']:
                        self.test_data['created_category'] = data
                        self.log_result("Create Category", True, "Category created successfully")
                        return True
                    else:
                        self.log_result("Create Category", False, "Category name mismatch")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Create Category", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_result("Create Category", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Category", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_questions(self):
        """Test get questions - should return questions with filtering"""
        try:
            response = requests.get(
                f"{self.api_base}/admin/questions",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.test_data['questions'] = data
                    self.log_result("Get Questions", True, f"Retrieved {len(data)} questions")
                    return True
                else:
                    self.log_result("Get Questions", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("Get Questions", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Questions", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_question(self):
        """Test create question - CRUD operation"""
        try:
            if 'created_category' not in self.test_data:
                self.log_result("Create Question", False, "No category available for question")
                return False
            
            question_data = {
                "question": "What is the primary programming language used for web development?",
                "options": ["Python", "JavaScript", "Java", "C++"],
                "correct_answer": 1,
                "difficulty": "beginner",
                "fun_fact": "JavaScript was created in just 10 days by Brendan Eich in 1995.",
                "category": self.test_data['created_category']['id'],
                "subcategory": "Web Development"
            }
            
            response = requests.post(
                f"{self.api_base}/admin/questions",
                json=question_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'question', 'options', 'correct_answer', 'created_at']
                
                if all(field in data for field in required_fields):
                    if data['question'] == question_data['question']:
                        self.test_data['created_question'] = data
                        self.log_result("Create Question", True, "Question created successfully")
                        return True
                    else:
                        self.log_result("Create Question", False, "Question text mismatch")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Create Question", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_result("Create Question", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Question", False, f"Request failed: {str(e)}")
            return False
    
    # 3. PUBLIC QUIZ APIS TESTS
    def test_public_quiz_categories(self):
        """Test /api/quiz/categories - should return categories for public use"""
        try:
            response = requests.get(
                f"{self.api_base}/quiz/categories",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_result("Public Quiz Categories", True, f"Retrieved {len(data)} public categories")
                    return True
                else:
                    self.log_result("Public Quiz Categories", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("Public Quiz Categories", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Public Quiz Categories", False, f"Request failed: {str(e)}")
            return False
    
    def test_public_quiz_questions(self):
        """Test /api/quiz/questions/{category_id} - should return random questions for a category"""
        try:
            if 'created_category' not in self.test_data:
                self.log_result("Public Quiz Questions", False, "No category available for testing")
                return False
            
            category_id = self.test_data['created_category']['id']
            response = requests.get(
                f"{self.api_base}/quiz/questions/{category_id}?count=5",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_result("Public Quiz Questions", True, f"Retrieved {len(data)} questions for category")
                    return True
                else:
                    self.log_result("Public Quiz Questions", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("Public Quiz Questions", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Public Quiz Questions", False, f"Request failed: {str(e)}")
            return False
    
    def test_public_rewarded_config(self):
        """Test /api/quiz/rewarded-config - should return rewarded popup configuration"""
        try:
            response = requests.get(
                f"{self.api_base}/quiz/rewarded-config",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'trigger_after_questions', 'coin_reward', 'is_active']
                
                if all(field in data for field in required_fields):
                    self.log_result("Public Rewarded Config", True, "Rewarded popup config retrieved successfully")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Public Rewarded Config", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_result("Public Rewarded Config", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Public Rewarded Config", False, f"Request failed: {str(e)}")
            return False
    
    # 4. CONFIGURATION MANAGEMENT TESTS
    def test_script_injection_management(self):
        """Test script injection endpoints"""
        try:
            # Create a script injection
            script_data = {
                "name": "Google Analytics Test",
                "script_code": "<script>console.log('GA Test Script');</script>",
                "placement": "header",
                "is_active": True
            }
            
            response = requests.post(
                f"{self.api_base}/admin/scripts",
                json=script_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'name', 'script_code', 'placement']
                
                if all(field in data for field in required_fields):
                    self.test_data['created_script'] = data
                    self.log_result("Script Injection Management", True, "Script injection created successfully")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Script Injection Management", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_result("Script Injection Management", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Script Injection Management", False, f"Request failed: {str(e)}")
            return False
    
    def test_ad_slot_management(self):
        """Test ad slot management endpoints"""
        try:
            # Create an ad slot
            ad_slot_data = {
                "name": "Header Banner Ad",
                "ad_unit_id": "ca-pub-1234567890123456/1234567890",
                "ad_code": "<div>AdSense Code Here</div>",
                "placement": "header",
                "ad_type": "adsense",
                "is_active": True
            }
            
            response = requests.post(
                f"{self.api_base}/admin/ad-slots",
                json=ad_slot_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'name', 'ad_unit_id', 'placement', 'ad_type']
                
                if all(field in data for field in required_fields):
                    self.test_data['created_ad_slot'] = data
                    self.log_result("Ad Slot Management", True, "Ad slot created successfully")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Ad Slot Management", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_result("Ad Slot Management", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Ad Slot Management", False, f"Request failed: {str(e)}")
            return False
    
    def test_rewarded_popup_configuration(self):
        """Test rewarded popup configuration management"""
        try:
            # Update rewarded popup config
            config_data = {
                "trigger_after_questions": 3,
                "coin_reward": 150,
                "is_active": True,
                "show_on_insufficient_coins": True,
                "show_during_quiz": True
            }
            
            response = requests.put(
                f"{self.api_base}/admin/rewarded-config",
                json=config_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'trigger_after_questions', 'coin_reward', 'is_active']
                
                if all(field in data for field in required_fields):
                    if data['trigger_after_questions'] == config_data['trigger_after_questions']:
                        self.log_result("Rewarded Popup Config", True, "Rewarded popup config updated successfully")
                        return True
                    else:
                        self.log_result("Rewarded Popup Config", False, "Config values not updated correctly")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Rewarded Popup Config", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_result("Rewarded Popup Config", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Rewarded Popup Config", False, f"Request failed: {str(e)}")
            return False
    
    # 5. DATA EXPORT/BACKUP TESTS
    def test_quiz_data_export(self):
        """Test /api/admin/export/quiz-data - should export all quiz data"""
        try:
            response = requests.get(
                f"{self.api_base}/admin/export/quiz-data",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['categories', 'questions', 'export_date']
                
                if all(field in data for field in required_fields):
                    if isinstance(data['categories'], list) and isinstance(data['questions'], list):
                        self.log_result("Quiz Data Export", True, f"Exported {len(data['categories'])} categories and {len(data['questions'])} questions")
                        return True
                    else:
                        self.log_result("Quiz Data Export", False, "Invalid data structure in export")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Quiz Data Export", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_result("Quiz Data Export", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Quiz Data Export", False, f"Request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all admin dashboard tests"""
        print(f"🚀 Starting Comprehensive Admin Dashboard Backend Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 80)
        
        tests = [
            # Authentication System
            ("Admin Authentication", [
                self.test_admin_setup,
                self.test_admin_login,
                self.test_admin_token_verification,
            ]),
            
            # Quiz Management
            ("Quiz Management", [
                self.test_get_categories,
                self.test_create_category,
                self.test_get_questions,
                self.test_create_question,
            ]),
            
            # Public APIs
            ("Public Quiz APIs", [
                self.test_public_quiz_categories,
                self.test_public_quiz_questions,
                self.test_public_rewarded_config,
            ]),
            
            # Configuration Management
            ("Configuration Management", [
                self.test_script_injection_management,
                self.test_ad_slot_management,
                self.test_rewarded_popup_configuration,
            ]),
            
            # Data Export
            ("Data Export/Backup", [
                self.test_quiz_data_export,
            ]),
        ]
        
        total_passed = 0
        total_failed = 0
        
        for section_name, section_tests in tests:
            print(f"\n🔍 Testing {section_name}")
            print("-" * 50)
            
            section_passed = 0
            section_failed = 0
            
            for test in section_tests:
                try:
                    result = test()
                    if result:
                        section_passed += 1
                        total_passed += 1
                    else:
                        section_failed += 1
                        total_failed += 1
                except Exception as e:
                    print(f"❌ FAIL: {test.__name__} - Exception: {str(e)}")
                    section_failed += 1
                    total_failed += 1
                
                print("-" * 30)
            
            print(f"📊 {section_name} Summary: ✅ {section_passed} passed, ❌ {section_failed} failed")
        
        print(f"\n🎯 FINAL TEST SUMMARY:")
        print(f"✅ Total Passed: {total_passed}")
        print(f"❌ Total Failed: {total_failed}")
        print(f"📈 Success Rate: {total_passed/(total_passed+total_failed)*100:.1f}%")
        
        return total_passed, total_failed, self.results

def main():
    try:
        tester = AdminDashboardTester()
        passed, failed, results = tester.run_all_tests()
        
        # Return appropriate exit code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()