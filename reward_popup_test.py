#!/usr/bin/env python3
"""
Enhanced Reward Popup Configuration System Testing
Testing granular control per category and homepage functionality
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://ecdf3874-a58e-4344-ae7b-5c55ecddd09d.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "TechKwiz2025!"

class RewardPopupConfigTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        self.category_ids = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "success": success,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def admin_login(self):
        """Login as admin and get JWT token"""
        try:
            response = self.session.post(f"{BACKEND_URL}/admin/login", json={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                self.admin_token = response.json()["access_token"]
                self.session.headers.update({"Authorization": f"Bearer {self.admin_token}"})
                self.log_test("Admin Authentication", True, f"Successfully logged in as {ADMIN_USERNAME}")
                return True
            else:
                self.log_test("Admin Authentication", False, f"Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Authentication", False, f"Login error: {str(e)}")
            return False
    
    def get_categories(self):
        """Get available categories for testing"""
        try:
            response = self.session.get(f"{BACKEND_URL}/quiz/categories")
            if response.status_code == 200:
                categories = response.json()
                self.category_ids = [cat["id"] for cat in categories[:2]]  # Get first 2 categories for testing
                self.log_test("Get Categories for Testing", True, f"Retrieved {len(categories)} categories, using {len(self.category_ids)} for testing")
                return True
            else:
                self.log_test("Get Categories for Testing", False, f"Failed to get categories: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Categories for Testing", False, f"Error getting categories: {str(e)}")
            return False
    
    def test_get_all_rewarded_configs(self):
        """Test GET /api/admin/rewarded-config - should return list of all configurations"""
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/rewarded-config")
            
            if response.status_code == 200:
                configs = response.json()
                if isinstance(configs, list):
                    self.log_test("GET All Rewarded Configs", True, f"Retrieved {len(configs)} configurations")
                    
                    # Verify structure of configs
                    for config in configs:
                        required_fields = ["id", "category_id", "category_name", "trigger_after_questions", "coin_reward", "is_active", "show_on_insufficient_coins", "show_during_quiz"]
                        missing_fields = [field for field in required_fields if field not in config]
                        if missing_fields:
                            self.log_test("Config Structure Validation", False, f"Missing fields: {missing_fields}")
                            return False
                    
                    self.log_test("Config Structure Validation", True, "All configs have required fields")
                    return True
                else:
                    self.log_test("GET All Rewarded Configs", False, "Response is not a list")
                    return False
            else:
                self.log_test("GET All Rewarded Configs", False, f"Request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET All Rewarded Configs", False, f"Error: {str(e)}")
            return False
    
    def test_get_homepage_config(self):
        """Test GET /api/admin/rewarded-config/homepage - should return homepage config"""
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/rewarded-config/homepage")
            
            if response.status_code == 200:
                config = response.json()
                
                # Verify it's homepage config
                if config.get("category_id") is None and config.get("category_name") == "Homepage":
                    # Verify default coin_reward is 100 (updated from 200)
                    if config.get("coin_reward") == 100:
                        self.log_test("GET Homepage Config", True, f"Homepage config retrieved with coin_reward=100")
                        
                        # Verify other expected values (may have been modified by previous tests)
                        expected_defaults = {
                            "is_active": True,
                            "show_on_insufficient_coins": True,
                            "show_during_quiz": True
                        }
                        
                        for field, expected_value in expected_defaults.items():
                            if config.get(field) != expected_value:
                                self.log_test("Homepage Config Defaults", False, f"Expected {field}={expected_value}, got {config.get(field)}")
                                return False
                        
                        # trigger_after_questions can vary (default is 5, but may be modified)
                        trigger_value = config.get("trigger_after_questions")
                        if isinstance(trigger_value, int) and trigger_value > 0:
                            self.log_test("Homepage Config Defaults", True, f"All critical default values correct (trigger_after_questions={trigger_value})")
                        else:
                            self.log_test("Homepage Config Defaults", False, f"Invalid trigger_after_questions value: {trigger_value}")
                            return False
                        
                        return True
                    else:
                        self.log_test("GET Homepage Config", False, f"Expected coin_reward=100, got {config.get('coin_reward')}")
                        return False
                else:
                    self.log_test("GET Homepage Config", False, f"Invalid homepage config: category_id={config.get('category_id')}, category_name={config.get('category_name')}")
                    return False
            else:
                self.log_test("GET Homepage Config", False, f"Request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET Homepage Config", False, f"Error: {str(e)}")
            return False
    
    def test_get_category_config(self):
        """Test GET /api/admin/rewarded-config/{category_id} - should return category-specific config"""
        if not self.category_ids:
            self.log_test("GET Category Config", False, "No category IDs available for testing")
            return False
        
        try:
            category_id = self.category_ids[0]
            response = self.session.get(f"{BACKEND_URL}/admin/rewarded-config/{category_id}")
            
            if response.status_code == 200:
                config = response.json()
                
                # Verify it's category-specific config
                if config.get("category_id") == category_id:
                    # Verify coin_reward is a positive integer (default should be 100, but may be modified)
                    coin_reward = config.get("coin_reward")
                    if isinstance(coin_reward, int) and coin_reward > 0:
                        self.log_test("GET Category Config", True, f"Category config retrieved for {category_id} with coin_reward={coin_reward}")
                        return True
                    else:
                        self.log_test("GET Category Config", False, f"Invalid coin_reward value: {coin_reward}")
                        return False
                else:
                    self.log_test("GET Category Config", False, f"Invalid category config: expected category_id={category_id}, got {config.get('category_id')}")
                    return False
            else:
                self.log_test("GET Category Config", False, f"Request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET Category Config", False, f"Error: {str(e)}")
            return False
    
    def test_update_homepage_config(self):
        """Test PUT /api/admin/rewarded-config/homepage - should update homepage config"""
        try:
            # First get current config to restore later
            get_response = self.session.get(f"{BACKEND_URL}/admin/rewarded-config/homepage")
            if get_response.status_code != 200:
                self.log_test("PUT Homepage Config", False, "Could not get current config")
                return False
            
            original_config = get_response.json()
            
            update_data = {
                "trigger_after_questions": 3,
                "coin_reward": 150,
                "is_active": True,
                "show_on_insufficient_coins": False,
                "show_during_quiz": True
            }
            
            response = self.session.put(f"{BACKEND_URL}/admin/rewarded-config/homepage", json=update_data)
            
            if response.status_code == 200:
                config = response.json()
                
                # Verify updates were applied
                for field, expected_value in update_data.items():
                    if config.get(field) != expected_value:
                        self.log_test("PUT Homepage Config", False, f"Update failed: expected {field}={expected_value}, got {config.get(field)}")
                        return False
                
                # Verify it's still homepage config
                if config.get("category_id") is None and config.get("category_name") == "Homepage":
                    # Restore original config for other tests
                    restore_data = {
                        "trigger_after_questions": original_config.get("trigger_after_questions", 5),
                        "coin_reward": 100,  # Reset to expected default
                        "is_active": original_config.get("is_active", True),
                        "show_on_insufficient_coins": original_config.get("show_on_insufficient_coins", True),
                        "show_during_quiz": original_config.get("show_during_quiz", True)
                    }
                    self.session.put(f"{BACKEND_URL}/admin/rewarded-config/homepage", json=restore_data)
                    
                    self.log_test("PUT Homepage Config", True, "Homepage config updated successfully")
                    return True
                else:
                    self.log_test("PUT Homepage Config", False, "Config identity changed after update")
                    return False
            else:
                self.log_test("PUT Homepage Config", False, f"Request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("PUT Homepage Config", False, f"Error: {str(e)}")
            return False
    
    def test_update_category_config(self):
        """Test PUT /api/admin/rewarded-config/{category_id} - should update category config"""
        if not self.category_ids:
            self.log_test("PUT Category Config", False, "No category IDs available for testing")
            return False
        
        try:
            category_id = self.category_ids[0]
            update_data = {
                "trigger_after_questions": 7,
                "coin_reward": 200,
                "is_active": False,
                "show_on_insufficient_coins": True,
                "show_during_quiz": False
            }
            
            response = self.session.put(f"{BACKEND_URL}/admin/rewarded-config/{category_id}", json=update_data)
            
            if response.status_code == 200:
                config = response.json()
                
                # Verify updates were applied
                for field, expected_value in update_data.items():
                    if config.get(field) != expected_value:
                        self.log_test("PUT Category Config", False, f"Update failed: expected {field}={expected_value}, got {config.get(field)}")
                        return False
                
                # Verify it's still the correct category config
                if config.get("category_id") == category_id:
                    self.log_test("PUT Category Config", True, f"Category config updated successfully for {category_id}")
                    return True
                else:
                    self.log_test("PUT Category Config", False, "Config identity changed after update")
                    return False
            else:
                self.log_test("PUT Category Config", False, f"Request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("PUT Category Config", False, f"Error: {str(e)}")
            return False
    
    def test_public_homepage_config(self):
        """Test GET /api/quiz/rewarded-config - should return homepage config (public API)"""
        try:
            # Remove admin auth for public API test
            headers = self.session.headers.copy()
            if "Authorization" in self.session.headers:
                del self.session.headers["Authorization"]
            
            response = self.session.get(f"{BACKEND_URL}/quiz/rewarded-config")
            
            # Restore admin auth
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                config = response.json()
                
                # Verify it's homepage config
                if config.get("category_id") is None:
                    self.log_test("Public Homepage Config API", True, "Public homepage config API working")
                    return True
                else:
                    self.log_test("Public Homepage Config API", False, f"Expected homepage config (category_id=None), got category_id={config.get('category_id')}")
                    return False
            else:
                self.log_test("Public Homepage Config API", False, f"Request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Public Homepage Config API", False, f"Error: {str(e)}")
            return False
    
    def test_public_category_config(self):
        """Test GET /api/quiz/rewarded-config/{category_id} - should return category-specific config (public API)"""
        if not self.category_ids:
            self.log_test("Public Category Config API", False, "No category IDs available for testing")
            return False
        
        try:
            category_id = self.category_ids[0]
            
            # Remove admin auth for public API test
            headers = self.session.headers.copy()
            if "Authorization" in self.session.headers:
                del self.session.headers["Authorization"]
            
            response = self.session.get(f"{BACKEND_URL}/quiz/rewarded-config/{category_id}")
            
            # Restore admin auth
            self.session.headers.update(headers)
            
            if response.status_code == 200:
                config = response.json()
                
                # Verify it's category-specific config
                if config.get("category_id") == category_id:
                    self.log_test("Public Category Config API", True, f"Public category config API working for {category_id}")
                    return True
                else:
                    self.log_test("Public Category Config API", False, f"Expected category_id={category_id}, got {config.get('category_id')}")
                    return False
            else:
                self.log_test("Public Category Config API", False, f"Request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Public Category Config API", False, f"Error: {str(e)}")
            return False
    
    def test_database_structure(self):
        """Verify the RewardedPopupConfig model supports all required fields"""
        try:
            # Get a config to verify structure
            response = self.session.get(f"{BACKEND_URL}/admin/rewarded-config/homepage")
            
            if response.status_code == 200:
                config = response.json()
                
                # Check all required fields are present
                required_fields = [
                    "id", "category_id", "category_name", "trigger_after_questions", 
                    "coin_reward", "is_active", "show_on_insufficient_coins", 
                    "show_during_quiz", "created_at", "updated_at"
                ]
                
                missing_fields = [field for field in required_fields if field not in config]
                
                if not missing_fields:
                    # Verify field types and values
                    validations = [
                        (config.get("category_id") is None, "Homepage should have category_id=None"),
                        (isinstance(config.get("trigger_after_questions"), int), "trigger_after_questions should be int"),
                        (isinstance(config.get("coin_reward"), int), "coin_reward should be int"),
                        (isinstance(config.get("is_active"), bool), "is_active should be bool"),
                        (isinstance(config.get("show_on_insufficient_coins"), bool), "show_on_insufficient_coins should be bool"),
                        (isinstance(config.get("show_during_quiz"), bool), "show_during_quiz should be bool"),
                    ]
                    
                    failed_validations = [msg for valid, msg in validations if not valid]
                    
                    if not failed_validations:
                        self.log_test("Database Structure Validation", True, "All required fields present with correct types")
                        return True
                    else:
                        self.log_test("Database Structure Validation", False, f"Field validation failed: {failed_validations}")
                        return False
                else:
                    self.log_test("Database Structure Validation", False, f"Missing required fields: {missing_fields}")
                    return False
            else:
                self.log_test("Database Structure Validation", False, f"Could not retrieve config for validation: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Database Structure Validation", False, f"Error: {str(e)}")
            return False
    
    def test_multiple_category_configs(self):
        """Test that multiple category configs can be created and managed independently"""
        if len(self.category_ids) < 2:
            self.log_test("Multiple Category Configs", False, "Need at least 2 categories for testing")
            return False
        
        try:
            # Update configs for two different categories with different values
            category1_id = self.category_ids[0]
            category2_id = self.category_ids[1]
            
            config1_data = {
                "trigger_after_questions": 4,
                "coin_reward": 120,
                "is_active": True,
                "show_on_insufficient_coins": True,
                "show_during_quiz": False
            }
            
            config2_data = {
                "trigger_after_questions": 8,
                "coin_reward": 180,
                "is_active": False,
                "show_on_insufficient_coins": False,
                "show_during_quiz": True
            }
            
            # Update first category
            response1 = self.session.put(f"{BACKEND_URL}/admin/rewarded-config/{category1_id}", json=config1_data)
            if response1.status_code != 200:
                self.log_test("Multiple Category Configs", False, f"Failed to update category1: {response1.status_code}")
                return False
            
            # Update second category
            response2 = self.session.put(f"{BACKEND_URL}/admin/rewarded-config/{category2_id}", json=config2_data)
            if response2.status_code != 200:
                self.log_test("Multiple Category Configs", False, f"Failed to update category2: {response2.status_code}")
                return False
            
            # Verify both configs are independent
            get_response1 = self.session.get(f"{BACKEND_URL}/admin/rewarded-config/{category1_id}")
            get_response2 = self.session.get(f"{BACKEND_URL}/admin/rewarded-config/{category2_id}")
            
            if get_response1.status_code == 200 and get_response2.status_code == 200:
                config1 = get_response1.json()
                config2 = get_response2.json()
                
                # Verify configs are different and correct
                if (config1.get("coin_reward") == 120 and config2.get("coin_reward") == 180 and
                    config1.get("trigger_after_questions") == 4 and config2.get("trigger_after_questions") == 8):
                    self.log_test("Multiple Category Configs", True, "Multiple category configs working independently")
                    return True
                else:
                    self.log_test("Multiple Category Configs", False, "Configs not updated correctly or not independent")
                    return False
            else:
                self.log_test("Multiple Category Configs", False, "Failed to retrieve updated configs")
                return False
                
        except Exception as e:
            self.log_test("Multiple Category Configs", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests for enhanced reward popup configuration system"""
        print("🎯 ENHANCED REWARD POPUP CONFIGURATION SYSTEM TESTING")
        print("=" * 60)
        
        # Authentication
        if not self.admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Get categories for testing
        if not self.get_categories():
            print("❌ Cannot proceed without categories")
            return False
        
        # Test all functionality
        tests = [
            self.test_get_all_rewarded_configs,
            self.test_get_homepage_config,
            self.test_get_category_config,
            self.test_update_homepage_config,
            self.test_update_category_config,
            self.test_public_homepage_config,
            self.test_public_category_config,
            self.test_database_structure,
            self.test_multiple_category_configs
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            if test():
                passed_tests += 1
        
        # Print summary
        print("\n" + "=" * 60)
        print("🎯 ENHANCED REWARD POPUP CONFIGURATION TESTING SUMMARY")
        print("=" * 60)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
        
        if success_rate == 100:
            print("🎉 ALL TESTS PASSED - Enhanced reward popup configuration system is fully functional!")
        elif success_rate >= 80:
            print("⚠️  MOSTLY WORKING - Some minor issues detected")
        else:
            print("❌ CRITICAL ISSUES - Major functionality problems detected")
        
        # Print detailed results
        print("\nDetailed Results:")
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
        
        return success_rate == 100

def main():
    """Main test execution"""
    tester = RewardPopupConfigTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ Enhanced reward popup configuration system testing completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Enhanced reward popup configuration system testing failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()