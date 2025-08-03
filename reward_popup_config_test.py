#!/usr/bin/env python3
"""
Reward Popup Configuration System Testing
Tests the reward popup configuration system to identify why frontend changes aren't reflecting backend configuration changes.
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
                if line.startswith('NEXT_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
                elif line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

class RewardPopupConfigTester:
    def __init__(self):
        self.backend_url = get_backend_url()
        if not self.backend_url:
            raise Exception("Could not get backend URL from frontend/.env")
        
        self.api_base = f"{self.backend_url}/api"
        self.results = []
        self.admin_token = None
        
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
    
    def admin_login(self):
        """Login as admin to get authentication token"""
        try:
            # First try to setup admin if needed
            setup_credentials = {
                "username": "admin",
                "password": "TechKwiz2025!"
            }
            
            setup_response = requests.post(
                f"{self.api_base}/admin/setup",
                json=setup_credentials,
                timeout=10
            )
            
            # Login with admin credentials
            login_response = requests.post(
                f"{self.api_base}/admin/login",
                json=setup_credentials,
                timeout=10
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                if 'access_token' in token_data:
                    self.admin_token = token_data['access_token']
                    self.log_result("Admin Login", True, "Successfully logged in as admin")
                    return True
            
            self.log_result("Admin Login", False, f"Login failed: {login_response.status_code}")
            return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Login failed: {str(e)}")
            return False
    
    def test_current_configuration_check(self):
        """Test 1: Check current homepage configuration via both APIs"""
        try:
            # Test GET /api/quiz/rewarded-config (public API)
            public_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            
            if public_response.status_code != 200:
                self.log_result("Public Config API", False, f"Public API failed: {public_response.status_code}")
                return False, None
            
            public_config = public_response.json()
            self.log_result("Public Config API", True, f"Public API returned config with coin_reward: {public_config.get('coin_reward', 'N/A')}")
            
            # Test GET /api/admin/rewarded-config/homepage (admin API)
            if not self.admin_token:
                self.log_result("Admin Config API", False, "No admin token available")
                return False, public_config
            
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            admin_response = requests.get(
                f"{self.api_base}/admin/rewarded-config/homepage",
                headers=headers,
                timeout=10
            )
            
            if admin_response.status_code != 200:
                self.log_result("Admin Config API", False, f"Admin API failed: {admin_response.status_code}")
                return False, public_config
            
            admin_config = admin_response.json()
            self.log_result("Admin Config API", True, f"Admin API returned config with coin_reward: {admin_config.get('coin_reward', 'N/A')}")
            
            # Compare configurations
            if public_config.get('coin_reward') == admin_config.get('coin_reward'):
                self.log_result("Config Consistency", True, "Public and admin APIs return consistent coin_reward values")
            else:
                self.log_result("Config Consistency", False, f"Mismatch: Public={public_config.get('coin_reward')}, Admin={admin_config.get('coin_reward')}")
            
            return True, public_config
            
        except Exception as e:
            self.log_result("Current Configuration Check", False, f"Configuration check failed: {str(e)}")
            return False, None
    
    def test_admin_configuration_update(self, initial_config):
        """Test 2: Update homepage configuration with different values"""
        if not self.admin_token:
            self.log_result("Admin Configuration Update", False, "No admin token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            # Update configuration with new values
            update_data = {
                "coin_reward": 150,  # Change from default 100
                "is_active": True,
                "show_during_quiz": True,
                "show_on_insufficient_coins": True,
                "trigger_after_questions": 2
            }
            
            update_response = requests.put(
                f"{self.api_base}/admin/rewarded-config/homepage",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if update_response.status_code != 200:
                self.log_result("Admin Configuration Update", False, f"Update failed: {update_response.status_code} - {update_response.text}")
                return False
            
            updated_config = update_response.json()
            
            # Verify the update was applied
            if updated_config.get('coin_reward') == 150:
                self.log_result("Admin Configuration Update", True, f"Successfully updated coin_reward to 150")
            else:
                self.log_result("Admin Configuration Update", False, f"Update not applied correctly: got {updated_config.get('coin_reward')}")
                return False
            
            # Verify other fields
            for key, expected_value in update_data.items():
                actual_value = updated_config.get(key)
                if actual_value != expected_value:
                    self.log_result("Field Update Verification", False, f"Field {key}: expected {expected_value}, got {actual_value}")
                    return False
            
            self.log_result("Field Update Verification", True, "All fields updated correctly")
            return True
            
        except Exception as e:
            self.log_result("Admin Configuration Update", False, f"Update test failed: {str(e)}")
            return False
    
    def test_verification_after_update(self):
        """Test 3: Verify changes are reflected in public API"""
        try:
            # Wait a moment for any caching to clear
            time.sleep(1)
            
            # Check public API again
            public_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            
            if public_response.status_code != 200:
                self.log_result("Post-Update Public API", False, f"Public API failed: {public_response.status_code}")
                return False
            
            public_config = public_response.json()
            
            # Verify the updated coin_reward (150) is now returned by public API
            if public_config.get('coin_reward') == 150:
                self.log_result("Post-Update Verification", True, "Public API now returns updated coin_reward (150)")
            else:
                self.log_result("Post-Update Verification", False, f"Public API still returns old coin_reward: {public_config.get('coin_reward')}")
                return False
            
            # Check admin API for consistency
            if self.admin_token:
                headers = {'Authorization': f'Bearer {self.admin_token}'}
                admin_response = requests.get(
                    f"{self.api_base}/admin/rewarded-config/homepage",
                    headers=headers,
                    timeout=10
                )
                
                if admin_response.status_code == 200:
                    admin_config = admin_response.json()
                    if admin_config.get('coin_reward') == public_config.get('coin_reward'):
                        self.log_result("Post-Update Consistency", True, "Admin and public APIs remain consistent after update")
                    else:
                        self.log_result("Post-Update Consistency", False, f"APIs inconsistent: Admin={admin_config.get('coin_reward')}, Public={public_config.get('coin_reward')}")
                        return False
            
            return True
            
        except Exception as e:
            self.log_result("Post-Update Verification", False, f"Verification failed: {str(e)}")
            return False
    
    def test_multiple_configuration_changes(self):
        """Test 4: Test multiple configuration changes and persistence"""
        if not self.admin_token:
            self.log_result("Multiple Configuration Changes", False, "No admin token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            # Test 1: Update coin_reward to 200
            update_1 = {"coin_reward": 200}
            response_1 = requests.put(
                f"{self.api_base}/admin/rewarded-config/homepage",
                json=update_1,
                headers=headers,
                timeout=10
            )
            
            if response_1.status_code != 200:
                self.log_result("Multiple Changes - Update 1", False, f"First update failed: {response_1.status_code}")
                return False
            
            # Verify first change
            time.sleep(0.5)
            verify_1 = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if verify_1.status_code == 200 and verify_1.json().get('coin_reward') == 200:
                self.log_result("Multiple Changes - Update 1", True, "Successfully updated coin_reward to 200")
            else:
                self.log_result("Multiple Changes - Update 1", False, f"First update not reflected: {verify_1.json().get('coin_reward') if verify_1.status_code == 200 else 'API failed'}")
                return False
            
            # Test 2: Update is_active to false
            update_2 = {"is_active": False}
            response_2 = requests.put(
                f"{self.api_base}/admin/rewarded-config/homepage",
                json=update_2,
                headers=headers,
                timeout=10
            )
            
            if response_2.status_code != 200:
                self.log_result("Multiple Changes - Update 2", False, f"Second update failed: {response_2.status_code}")
                return False
            
            # Verify second change
            time.sleep(0.5)
            verify_2 = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if verify_2.status_code == 200:
                config_2 = verify_2.json()
                if config_2.get('is_active') == False and config_2.get('coin_reward') == 200:
                    self.log_result("Multiple Changes - Update 2", True, "Successfully updated is_active to false while preserving coin_reward")
                else:
                    self.log_result("Multiple Changes - Update 2", False, f"Second update issue: is_active={config_2.get('is_active')}, coin_reward={config_2.get('coin_reward')}")
                    return False
            else:
                self.log_result("Multiple Changes - Update 2", False, "Public API failed after second update")
                return False
            
            # Test 3: Update multiple fields at once
            update_3 = {
                "coin_reward": 175,
                "is_active": True,
                "trigger_after_questions": 5,
                "show_on_insufficient_coins": False
            }
            response_3 = requests.put(
                f"{self.api_base}/admin/rewarded-config/homepage",
                json=update_3,
                headers=headers,
                timeout=10
            )
            
            if response_3.status_code != 200:
                self.log_result("Multiple Changes - Update 3", False, f"Third update failed: {response_3.status_code}")
                return False
            
            # Verify third change
            time.sleep(0.5)
            verify_3 = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if verify_3.status_code == 200:
                config_3 = verify_3.json()
                all_correct = True
                for key, expected_value in update_3.items():
                    if config_3.get(key) != expected_value:
                        self.log_result("Multiple Changes - Update 3", False, f"Field {key}: expected {expected_value}, got {config_3.get(key)}")
                        all_correct = False
                        break
                
                if all_correct:
                    self.log_result("Multiple Changes - Update 3", True, "Successfully updated multiple fields simultaneously")
                else:
                    return False
            else:
                self.log_result("Multiple Changes - Update 3", False, "Public API failed after third update")
                return False
            
            self.log_result("Multiple Configuration Changes", True, "All configuration changes persisted correctly")
            return True
            
        except Exception as e:
            self.log_result("Multiple Configuration Changes", False, f"Multiple changes test failed: {str(e)}")
            return False
    
    def test_caching_issues(self):
        """Test 5: Check for potential caching issues"""
        try:
            # Make multiple rapid requests to see if responses are consistent
            responses = []
            for i in range(5):
                response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
                if response.status_code == 200:
                    responses.append(response.json().get('coin_reward'))
                else:
                    self.log_result("Caching Issues Test", False, f"Request {i+1} failed: {response.status_code}")
                    return False
                time.sleep(0.1)  # Small delay between requests
            
            # Check if all responses are identical
            if len(set(responses)) == 1:
                self.log_result("Caching Issues Test", True, f"All 5 rapid requests returned consistent coin_reward: {responses[0]}")
            else:
                self.log_result("Caching Issues Test", False, f"Inconsistent responses detected: {responses}")
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Caching Issues Test", False, f"Caching test failed: {str(e)}")
            return False
    
    def test_database_persistence(self):
        """Test 6: Verify changes persist across requests (database persistence)"""
        if not self.admin_token:
            self.log_result("Database Persistence", False, "No admin token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            
            # Set a unique value
            unique_value = 123
            update_data = {"coin_reward": unique_value}
            
            update_response = requests.put(
                f"{self.api_base}/admin/rewarded-config/homepage",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if update_response.status_code != 200:
                self.log_result("Database Persistence", False, f"Update failed: {update_response.status_code}")
                return False
            
            # Wait and check multiple times over a longer period
            for i in range(3):
                time.sleep(2)  # Wait 2 seconds between checks
                
                verify_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
                if verify_response.status_code != 200:
                    self.log_result("Database Persistence", False, f"Verification {i+1} failed: {verify_response.status_code}")
                    return False
                
                config = verify_response.json()
                if config.get('coin_reward') != unique_value:
                    self.log_result("Database Persistence", False, f"Value changed after {(i+1)*2} seconds: expected {unique_value}, got {config.get('coin_reward')}")
                    return False
            
            self.log_result("Database Persistence", True, f"Configuration persisted correctly over 6 seconds with value {unique_value}")
            return True
            
        except Exception as e:
            self.log_result("Database Persistence", False, f"Persistence test failed: {str(e)}")
            return False
    
    def run_comprehensive_test(self):
        """Run all reward popup configuration tests"""
        print("🎯 REWARD POPUP CONFIGURATION SYSTEM TESTING")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 70)
        
        # Step 1: Admin login
        if not self.admin_login():
            print("❌ Cannot proceed without admin authentication")
            return
        
        # Step 2: Current configuration check
        print("\n1️⃣ CURRENT CONFIGURATION CHECK")
        success, initial_config = self.test_current_configuration_check()
        if not success:
            print("❌ Current configuration check failed")
            return
        
        # Step 3: Admin configuration update
        print("\n2️⃣ ADMIN CONFIGURATION UPDATE TEST")
        if not self.test_admin_configuration_update(initial_config):
            print("❌ Admin configuration update failed")
            return
        
        # Step 4: Verification after update
        print("\n3️⃣ VERIFICATION AFTER UPDATE")
        if not self.test_verification_after_update():
            print("❌ Post-update verification failed")
            return
        
        # Step 5: Multiple configuration changes
        print("\n4️⃣ MULTIPLE CONFIGURATION CHANGES TEST")
        if not self.test_multiple_configuration_changes():
            print("❌ Multiple configuration changes test failed")
            return
        
        # Step 6: Caching issues test
        print("\n5️⃣ CACHING ISSUES TEST")
        if not self.test_caching_issues():
            print("❌ Caching issues test failed")
            return
        
        # Step 7: Database persistence test
        print("\n6️⃣ DATABASE PERSISTENCE TEST")
        if not self.test_database_persistence():
            print("❌ Database persistence test failed")
            return
        
        # Summary
        passed = sum(1 for result in self.results if "✅ PASS" in result['status'])
        failed = sum(1 for result in self.results if "❌ FAIL" in result['status'])
        
        print(f"\n📊 REWARD POPUP CONFIGURATION TEST SUMMARY:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 ALL REWARD POPUP CONFIGURATION TESTS PASSED!")
            print(f"✅ Backend configuration changes are properly saved to database")
            print(f"✅ Public API returns updated configuration values")
            print(f"✅ Changes persist across requests")
            print(f"✅ No caching issues preventing updates")
        else:
            print(f"\n🚨 ISSUES IDENTIFIED:")
            for result in self.results:
                if "❌ FAIL" in result['status']:
                    print(f"   - {result['test']}: {result['message']}")

if __name__ == "__main__":
    try:
        tester = RewardPopupConfigTester()
        tester.run_comprehensive_test()
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)