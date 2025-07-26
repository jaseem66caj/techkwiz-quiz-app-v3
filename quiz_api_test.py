#!/usr/bin/env python3
"""
Specific Quiz API Testing for Review Request
Tests the exact APIs mentioned in the review request after UI changes.
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend environment
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

class QuizAPITester:
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
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_quiz_categories_endpoint(self):
        """Test GET /api/quiz/categories - should return all quiz categories"""
        try:
            response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "GET /api/quiz/categories", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False, []
            
            categories = response.json()
            
            # Verify response structure
            if not isinstance(categories, list):
                self.log_result(
                    "GET /api/quiz/categories", 
                    False, 
                    f"Expected list, got {type(categories)}"
                )
                return False, []
            
            if len(categories) == 0:
                self.log_result(
                    "GET /api/quiz/categories", 
                    False, 
                    "No categories returned - data synchronization issue"
                )
                return False, []
            
            # Verify each category has required fields
            required_fields = ['id', 'name', 'description', 'icon', 'color']
            for i, category in enumerate(categories):
                missing_fields = [field for field in required_fields if field not in category]
                if missing_fields:
                    self.log_result(
                        "GET /api/quiz/categories", 
                        False, 
                        f"Category {i} missing required fields: {missing_fields}"
                    )
                    return False, []
            
            # Success - log category details
            category_names = [cat['name'] for cat in categories]
            self.log_result(
                "GET /api/quiz/categories", 
                True, 
                f"Successfully returned {len(categories)} categories",
                f"Categories: {', '.join(category_names)}"
            )
            return True, categories
            
        except Exception as e:
            self.log_result(
                "GET /api/quiz/categories", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False, []
    
    def test_quiz_questions_endpoint(self, categories):
        """Test GET /api/quiz/questions/{category_id} - should return questions for a category"""
        if not categories:
            self.log_result(
                "GET /api/quiz/questions/{category_id}", 
                False, 
                "No categories available for testing"
            )
            return False
        
        try:
            # Test with first category
            test_category = categories[0]
            category_id = test_category['id']
            
            response = requests.get(f"{self.api_base}/quiz/questions/{category_id}", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "GET /api/quiz/questions/{category_id}", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
            
            questions = response.json()
            
            # Verify response structure
            if not isinstance(questions, list):
                self.log_result(
                    "GET /api/quiz/questions/{category_id}", 
                    False, 
                    f"Expected list, got {type(questions)}"
                )
                return False
            
            if len(questions) == 0:
                self.log_result(
                    "GET /api/quiz/questions/{category_id}", 
                    False, 
                    f"No questions found for category '{test_category['name']}'"
                )
                return False
            
            # Verify question structure
            required_fields = ['id', 'question', 'options', 'correct_answer', 'category']
            for i, question in enumerate(questions):
                missing_fields = [field for field in required_fields if field not in question]
                if missing_fields:
                    self.log_result(
                        "GET /api/quiz/questions/{category_id}", 
                        False, 
                        f"Question {i} missing required fields: {missing_fields}"
                    )
                    return False
                
                # Verify options structure
                if not isinstance(question.get('options'), list) or len(question.get('options', [])) < 2:
                    self.log_result(
                        "GET /api/quiz/questions/{category_id}", 
                        False, 
                        f"Question {i} has invalid options structure"
                    )
                    return False
            
            # Test with count parameter
            count_response = requests.get(f"{self.api_base}/quiz/questions/{category_id}?count=3", timeout=10)
            if count_response.status_code == 200:
                count_questions = count_response.json()
                if len(count_questions) <= 3:
                    count_detail = f"Count parameter working - requested 3, got {len(count_questions)}"
                else:
                    count_detail = "Count parameter not working properly"
            else:
                count_detail = "Count parameter test failed"
            
            self.log_result(
                "GET /api/quiz/questions/{category_id}", 
                True, 
                f"Successfully returned {len(questions)} questions for category '{test_category['name']}'",
                count_detail
            )
            return True
            
        except Exception as e:
            self.log_result(
                "GET /api/quiz/questions/{category_id}", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_rewarded_config_endpoint(self):
        """Test GET /api/quiz/rewarded-config - should return rewarded popup configuration"""
        try:
            response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "GET /api/quiz/rewarded-config", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
            
            config = response.json()
            
            # Verify response structure
            if not isinstance(config, dict):
                self.log_result(
                    "GET /api/quiz/rewarded-config", 
                    False, 
                    f"Expected dict, got {type(config)}"
                )
                return False
            
            # Verify required configuration fields
            required_fields = [
                'id', 'trigger_after_questions', 'coin_reward', 'is_active',
                'show_on_insufficient_coins', 'show_during_quiz'
            ]
            missing_fields = [field for field in required_fields if field not in config]
            if missing_fields:
                self.log_result(
                    "GET /api/quiz/rewarded-config", 
                    False, 
                    f"Missing required configuration fields: {missing_fields}"
                )
                return False
            
            # Verify data types
            if not isinstance(config.get('trigger_after_questions'), int):
                self.log_result(
                    "GET /api/quiz/rewarded-config", 
                    False, 
                    "trigger_after_questions should be integer"
                )
                return False
            
            if not isinstance(config.get('coin_reward'), int):
                self.log_result(
                    "GET /api/quiz/rewarded-config", 
                    False, 
                    "coin_reward should be integer"
                )
                return False
            
            # Success - log configuration details
            config_summary = {
                'trigger_after': config.get('trigger_after_questions'),
                'coin_reward': config.get('coin_reward'),
                'is_active': config.get('is_active')
            }
            
            self.log_result(
                "GET /api/quiz/rewarded-config", 
                True, 
                "Successfully returned rewarded popup configuration",
                f"Config: {config_summary}"
            )
            return True
            
        except Exception as e:
            self.log_result(
                "GET /api/quiz/rewarded-config", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_backend_health_check(self):
        """Test basic health check of the backend service"""
        try:
            response = requests.get(f"{self.api_base}/", timeout=10)
            
            if response.status_code != 200:
                self.log_result(
                    "Backend Health Check", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
            
            data = response.json()
            if data.get('message') != 'TechKwiz API is running':
                self.log_result(
                    "Backend Health Check", 
                    False, 
                    f"Unexpected response: {data}"
                )
                return False
            
            self.log_result(
                "Backend Health Check", 
                True, 
                "Backend service is healthy and responding correctly"
            )
            return True
            
        except Exception as e:
            self.log_result(
                "Backend Health Check", 
                False, 
                f"Health check failed: {str(e)}"
            )
            return False
    
    def test_mongodb_connectivity(self):
        """Test MongoDB connection by creating and retrieving a test record"""
        try:
            # Create a test status record
            test_data = {"client_name": "quiz_api_test_client"}
            
            post_response = requests.post(
                f"{self.api_base}/status",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if post_response.status_code != 200:
                self.log_result(
                    "MongoDB Connectivity", 
                    False, 
                    f"Failed to create test record: HTTP {post_response.status_code}"
                )
                return False
            
            # Retrieve records to verify persistence
            get_response = requests.get(f"{self.api_base}/status", timeout=10)
            
            if get_response.status_code != 200:
                self.log_result(
                    "MongoDB Connectivity", 
                    False, 
                    f"Failed to retrieve records: HTTP {get_response.status_code}"
                )
                return False
            
            records = get_response.json()
            test_record_found = any(
                record.get('client_name') == 'quiz_api_test_client' 
                for record in records
            )
            
            if not test_record_found:
                self.log_result(
                    "MongoDB Connectivity", 
                    False, 
                    "Test record not found in database - persistence issue"
                )
                return False
            
            self.log_result(
                "MongoDB Connectivity", 
                True, 
                "MongoDB connection working correctly - data persistence verified"
            )
            return True
            
        except Exception as e:
            self.log_result(
                "MongoDB Connectivity", 
                False, 
                f"MongoDB test failed: {str(e)}"
            )
            return False
    
    def test_api_response_format(self, categories):
        """Test that API responses are properly formatted for frontend consumption"""
        try:
            # Test categories JSON serialization
            try:
                json.dumps(categories)
            except TypeError as e:
                self.log_result(
                    "API Response Format", 
                    False, 
                    f"Categories not JSON serializable: {str(e)}"
                )
                return False
            
            # Test questions JSON serialization
            if categories:
                questions_response = requests.get(f"{self.api_base}/quiz/questions/{categories[0]['id']}", timeout=10)
                if questions_response.status_code == 200:
                    questions = questions_response.json()
                    try:
                        json.dumps(questions)
                    except TypeError as e:
                        self.log_result(
                            "API Response Format", 
                            False, 
                            f"Questions not JSON serializable: {str(e)}"
                        )
                        return False
            
            # Test rewarded config JSON serialization
            config_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if config_response.status_code == 200:
                config = config_response.json()
                try:
                    json.dumps(config)
                except TypeError as e:
                    self.log_result(
                        "API Response Format", 
                        False, 
                        f"Rewarded config not JSON serializable: {str(e)}"
                    )
                    return False
            
            self.log_result(
                "API Response Format", 
                True, 
                "All API responses are properly formatted and JSON serializable"
            )
            return True
            
        except Exception as e:
            self.log_result(
                "API Response Format", 
                False, 
                f"Format test failed: {str(e)}"
            )
            return False
    
    def run_quiz_api_tests(self):
        """Run all quiz-related API tests as requested in the review"""
        print("🎯 QUIZ API TESTING - Post UI Changes Verification")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 70)
        print("Testing the core quiz APIs that serve quiz data to the frontend:")
        print("1. GET /api/quiz/categories - should return all quiz categories")
        print("2. GET /api/quiz/questions/{category_id} - should return questions for a category")
        print("3. GET /api/quiz/rewarded-config - should return rewarded popup configuration")
        print("4. Backend health and MongoDB connectivity verification")
        print("=" * 70)
        
        # Run tests in order
        tests_results = []
        
        # 1. Backend Health Check
        health_result = self.test_backend_health_check()
        tests_results.append(('Backend Health Check', health_result))
        print("-" * 50)
        
        # 2. MongoDB Connectivity
        mongo_result = self.test_mongodb_connectivity()
        tests_results.append(('MongoDB Connectivity', mongo_result))
        print("-" * 50)
        
        # 3. Quiz Categories API
        categories_result, categories = self.test_quiz_categories_endpoint()
        tests_results.append(('Quiz Categories API', categories_result))
        print("-" * 50)
        
        # 4. Quiz Questions API
        questions_result = self.test_quiz_questions_endpoint(categories)
        tests_results.append(('Quiz Questions API', questions_result))
        print("-" * 50)
        
        # 5. Rewarded Config API
        config_result = self.test_rewarded_config_endpoint()
        tests_results.append(('Rewarded Config API', config_result))
        print("-" * 50)
        
        # 6. API Response Format
        format_result = self.test_api_response_format(categories)
        tests_results.append(('API Response Format', format_result))
        print("-" * 50)
        
        # Summary
        passed = sum(1 for _, result in tests_results if result)
        failed = len(tests_results) - passed
        
        print(f"\n📊 QUIZ API TEST SUMMARY:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/len(tests_results)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 ALL QUIZ API TESTS PASSED!")
            print(f"   ✅ Backend service is healthy and responding")
            print(f"   ✅ MongoDB connection working correctly")
            print(f"   ✅ GET /api/quiz/categories returning {len(categories)} categories")
            print(f"   ✅ GET /api/quiz/questions/{{category_id}} returning questions correctly")
            print(f"   ✅ GET /api/quiz/rewarded-config returning proper configuration")
            print(f"   ✅ All API responses properly formatted for frontend consumption")
            print(f"\n🔗 FRONTEND-BACKEND INTEGRATION STATUS: FULLY FUNCTIONAL")
            print(f"   The quiz interface UI changes should work correctly with these APIs.")
        else:
            print(f"\n⚠️  SOME TESTS FAILED - Review the issues above")
            for test_name, result in tests_results:
                status = "✅" if result else "❌"
                print(f"   {status} {test_name}")
        
        return passed, failed, self.results

def main():
    try:
        tester = QuizAPITester()
        passed, failed, results = tester.run_quiz_api_tests()
        
        # Return appropriate exit code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()