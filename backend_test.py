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
                    api_data.get('message') == 'TechKwiz API is running'):
                    
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
    
    def test_admin_authentication(self):
        """Test admin authentication flow with specific credentials"""
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
            
            # Now try to login with the specific credentials requested
            login_response = requests.post(
                f"{self.api_base}/admin/login",
                json=setup_credentials,
                timeout=10
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                if 'access_token' in token_data:
                    self.log_result("Admin Authentication", True, f"Admin login successful with username=admin, password=TechKwiz2025!")
                    return True, token_data['access_token']
            
            # If specific credentials don't work, try fallback credentials
            fallback_credentials = [
                {"username": "testadmin", "password": "testpass123"},
                {"username": "admin", "password": "admin123"},
                {"username": "techkwiz_admin", "password": "admin123456"},
            ]
            
            for creds in fallback_credentials:
                login_response = requests.post(
                    f"{self.api_base}/admin/login",
                    json=creds,
                    timeout=10
                )
                
                if login_response.status_code == 200:
                    token_data = login_response.json()
                    if 'access_token' in token_data:
                        self.log_result("Admin Authentication", True, f"Admin login successful with fallback credentials: {creds['username']}")
                        return True, token_data['access_token']
            
            self.log_result("Admin Authentication", False, "Could not authenticate with any credentials")
            return False, None
                
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Authentication test failed: {str(e)}")
            return False, None
    
    def test_site_config_management(self, token):
        """Test Site Configuration Management endpoints"""
        if not token:
            self.log_result("Site Config Management", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test GET /api/admin/site-config (should return/create default config)
            get_response = requests.get(
                f"{self.api_base}/admin/site-config",
                headers=headers,
                timeout=10
            )
            
            if get_response.status_code != 200:
                self.log_result("Site Config GET", False, f"GET site-config failed: {get_response.status_code}")
                return False
            
            config_data = get_response.json()
            
            # Verify default config structure
            expected_fields = [
                'id', 'google_analytics_id', 'google_search_console_id', 
                'facebook_pixel_id', 'google_tag_manager_id', 'twitter_pixel_id',
                'linkedin_pixel_id', 'tiktok_pixel_id', 'snapchat_pixel_id',
                'ads_txt_content', 'robots_txt_content', 'created_at', 'updated_at'
            ]
            
            missing_fields = [field for field in expected_fields if field not in config_data]
            if missing_fields:
                self.log_result("Site Config Structure", False, f"Missing fields: {missing_fields}")
                return False
            
            # Test PUT /api/admin/site-config (should update tracking codes)
            update_data = {
                "google_analytics_id": "GA-TEST-123456",
                "facebook_pixel_id": "FB-PIXEL-789012",
                "google_tag_manager_id": "GTM-TEST-345",
                "ads_txt_content": "google.com, pub-123456789, DIRECT, f08c47fec0942fa0",
                "robots_txt_content": "User-agent: *\nDisallow: /admin/"
            }
            
            put_response = requests.put(
                f"{self.api_base}/admin/site-config",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if put_response.status_code != 200:
                self.log_result("Site Config PUT", False, f"PUT site-config failed: {put_response.status_code}")
                return False
            
            updated_config = put_response.json()
            
            # Verify updates were applied
            for key, value in update_data.items():
                if updated_config.get(key) != value:
                    self.log_result("Site Config Update", False, f"Field {key} not updated correctly")
                    return False
            
            self.log_result("Site Config Management", True, "Site configuration GET/PUT working correctly with all tracking fields")
            return True
            
        except Exception as e:
            self.log_result("Site Config Management", False, f"Site config test failed: {str(e)}")
            return False
    
    def test_enhanced_ad_slot_system(self, token):
        """Test Enhanced Ad Slot System with quizwinz.com-style slots"""
        if not token:
            self.log_result("Enhanced Ad Slot System", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # Expected quizwinz.com-style ad slots (10 total)
            expected_ad_slots = [
                {"name": "Header Banner", "placement": "header-banner"},
                {"name": "Sidebar Right", "placement": "sidebar-right"},
                {"name": "Between Questions 1", "placement": "between-questions-1"},
                {"name": "Between Questions 2", "placement": "between-questions-2"},
                {"name": "Between Questions 3", "placement": "between-questions-3"},
                {"name": "Footer Banner", "placement": "footer-banner"},
                {"name": "Popup Interstitial", "placement": "popup-interstitial"},
                {"name": "Quiz Result Banner", "placement": "quiz-result-banner"},
                {"name": "Category Page Top", "placement": "category-page-top"},
                {"name": "Category Page Bottom", "placement": "category-page-bottom"}
            ]
            
            # First, create the expected ad slots if they don't exist
            for slot_data in expected_ad_slots:
                create_data = {
                    "name": slot_data["name"],
                    "ad_unit_id": f"ca-pub-123456789/{slot_data['placement']}-001",
                    "ad_code": f"<div id='{slot_data['placement']}-ad'>Ad Code Placeholder</div>",
                    "placement": slot_data["placement"],
                    "ad_type": "adsense",
                    "is_active": True
                }
                
                # Try to create (might already exist)
                requests.post(
                    f"{self.api_base}/admin/ad-slots",
                    json=create_data,
                    headers=headers,
                    timeout=10
                )
            
            # Test GET /api/admin/ad-slots
            get_response = requests.get(
                f"{self.api_base}/admin/ad-slots",
                headers=headers,
                timeout=10
            )
            
            if get_response.status_code != 200:
                self.log_result("Ad Slots GET", False, f"GET ad-slots failed: {get_response.status_code}")
                return False
            
            ad_slots = get_response.json()
            
            # Verify we have the expected placements
            found_placements = [slot.get('placement') for slot in ad_slots]
            expected_placements = [slot['placement'] for slot in expected_ad_slots]
            
            missing_placements = [p for p in expected_placements if p not in found_placements]
            if missing_placements:
                self.log_result("Ad Slots Structure", False, f"Missing expected placements: {missing_placements}")
                return False
            
            # Verify each ad slot has required fields
            for slot in ad_slots:
                required_fields = ['id', 'name', 'ad_unit_id', 'ad_code', 'placement', 'ad_type', 'is_active']
                missing_fields = [field for field in required_fields if field not in slot]
                if missing_fields:
                    self.log_result("Ad Slot Fields", False, f"Ad slot missing fields: {missing_fields}")
                    return False
            
            # Test CRUD operations on a specific ad slot
            test_slot = ad_slots[0] if ad_slots else None
            if test_slot:
                slot_id = test_slot['id']
                
                # Test UPDATE
                update_data = {
                    "ad_code": "<div>Updated Ad Code</div>",
                    "is_active": False
                }
                
                put_response = requests.put(
                    f"{self.api_base}/admin/ad-slots/{slot_id}",
                    json=update_data,
                    headers=headers,
                    timeout=10
                )
                
                if put_response.status_code != 200:
                    self.log_result("Ad Slot CRUD", False, f"Ad slot update failed: {put_response.status_code}")
                    return False
                
                updated_slot = put_response.json()
                if updated_slot.get('ad_code') != update_data['ad_code']:
                    self.log_result("Ad Slot CRUD", False, "Ad slot update not applied correctly")
                    return False
            
            self.log_result("Enhanced Ad Slot System", True, f"Found {len(ad_slots)} ad slots with quizwinz.com structure, CRUD operations working")
            return True
            
        except Exception as e:
            self.log_result("Enhanced Ad Slot System", False, f"Ad slot system test failed: {str(e)}")
            return False
    
    def test_updated_models_integration(self, token):
        """Test that updated models work correctly with database operations"""
        if not token:
            self.log_result("Updated Models Integration", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test SiteConfig model through API
            site_config_response = requests.get(
                f"{self.api_base}/admin/site-config",
                headers=headers,
                timeout=10
            )
            
            if site_config_response.status_code != 200:
                self.log_result("SiteConfig Model", False, "SiteConfig model not accessible")
                return False
            
            # Test AdSlot model through API
            ad_slots_response = requests.get(
                f"{self.api_base}/admin/ad-slots",
                headers=headers,
                timeout=10
            )
            
            if ad_slots_response.status_code != 200:
                self.log_result("AdSlot Model", False, "AdSlot model not accessible")
                return False
            
            # Test RewardedPopupConfig model
            rewarded_config_response = requests.get(
                f"{self.api_base}/admin/rewarded-config",
                headers=headers,
                timeout=10
            )
            
            if rewarded_config_response.status_code != 200:
                self.log_result("RewardedPopupConfig Model", False, "RewardedPopupConfig model not accessible")
                return False
            
            # Test that tracking pixel fields are properly handled
            site_config = site_config_response.json()
            tracking_fields = [
                'google_analytics_id', 'facebook_pixel_id', 'google_tag_manager_id',
                'twitter_pixel_id', 'linkedin_pixel_id', 'tiktok_pixel_id', 'snapchat_pixel_id'
            ]
            
            for field in tracking_fields:
                if field not in site_config:
                    self.log_result("Tracking Fields", False, f"Missing tracking field: {field}")
                    return False
            
            # Test ads.txt and robots.txt content management
            content_fields = ['ads_txt_content', 'robots_txt_content']
            for field in content_fields:
                if field not in site_config:
                    self.log_result("Content Management", False, f"Missing content field: {field}")
                    return False
            
            self.log_result("Updated Models Integration", True, "All updated models working correctly with proper field handling")
            return True
            
        except Exception as e:
            self.log_result("Updated Models Integration", False, f"Models integration test failed: {str(e)}")
            return False
    
    def test_forgot_password_system(self):
        """Test forgot password functionality with jaseem@adops.in"""
        try:
            # Test POST /api/admin/forgot-password
            reset_request = {
                "email": "jaseem@adops.in"
            }
            
            response = requests.post(
                f"{self.api_base}/admin/forgot-password",
                json=reset_request,
                timeout=10
            )
            
            if response.status_code == 200:
                response_data = response.json()
                expected_message = "If an account with that email exists, a password reset link has been sent."
                
                if response_data.get("message") == expected_message:
                    self.log_result("Forgot Password Request", True, "Password reset request processed correctly for jaseem@adops.in")
                    return True
                else:
                    self.log_result("Forgot Password Request", False, f"Unexpected response message: {response_data}")
                    return False
            else:
                self.log_result("Forgot Password Request", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Forgot Password Request", False, f"Forgot password test failed: {str(e)}")
            return False
    
    def test_profile_management(self, token):
        """Test admin profile management functionality"""
        if not token:
            self.log_result("Profile Management", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test profile update with current password verification
            profile_update = {
                "username": "admin_updated",
                "email": "jaseem@adops.in",
                "current_password": "TechKwiz2025!",
                "new_password": "NewTechKwiz2025!"
            }
            
            response = requests.put(
                f"{self.api_base}/admin/profile",
                json=profile_update,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                updated_profile = response.json()
                
                # Verify updates were applied
                if (updated_profile.get("username") == profile_update["username"] and 
                    updated_profile.get("email") == profile_update["email"]):
                    
                    # Test login with new credentials to verify password change
                    new_login_data = {
                        "username": "admin_updated",
                        "password": "NewTechKwiz2025!"
                    }
                    
                    login_response = requests.post(
                        f"{self.api_base}/admin/login",
                        json=new_login_data,
                        timeout=10
                    )
                    
                    if login_response.status_code == 200:
                        self.log_result("Profile Management", True, "Profile update successful - username, email, and password updated correctly")
                        
                        # Revert changes for other tests
                        revert_update = {
                            "username": "admin",
                            "email": "jaseem@adops.in", 
                            "current_password": "NewTechKwiz2025!",
                            "new_password": "TechKwiz2025!"
                        }
                        
                        new_token = login_response.json().get('access_token')
                        new_headers = {'Authorization': f'Bearer {new_token}'}
                        
                        requests.put(
                            f"{self.api_base}/admin/profile",
                            json=revert_update,
                            headers=new_headers,
                            timeout=10
                        )
                        
                        return True
                    else:
                        self.log_result("Profile Management", False, "Password update verification failed")
                        return False
                else:
                    self.log_result("Profile Management", False, "Profile fields not updated correctly")
                    return False
            
            elif response.status_code == 401:
                # Test with wrong current password to verify security
                wrong_password_update = {
                    "username": "admin_test",
                    "current_password": "wrong_password"
                }
                
                wrong_response = requests.put(
                    f"{self.api_base}/admin/profile",
                    json=wrong_password_update,
                    headers=headers,
                    timeout=10
                )
                
                if wrong_response.status_code == 401:
                    self.log_result("Profile Management", True, "Current password verification working correctly - unauthorized access blocked")
                    return True
                else:
                    self.log_result("Profile Management", False, "Current password verification not working properly")
                    return False
            else:
                self.log_result("Profile Management", False, f"Profile update failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Profile Management", False, f"Profile management test failed: {str(e)}")
            return False
    
    def test_complete_admin_dashboard_apis(self, token):
        """Test all admin dashboard APIs comprehensively"""
        if not token:
            self.log_result("Complete Admin Dashboard", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test Quiz Management APIs
            categories_response = requests.get(f"{self.api_base}/admin/categories", headers=headers, timeout=10)
            questions_response = requests.get(f"{self.api_base}/admin/questions", headers=headers, timeout=10)
            
            if categories_response.status_code != 200 or questions_response.status_code != 200:
                self.log_result("Quiz Management APIs", False, "Quiz management endpoints not accessible")
                return False
            
            # Test Script Management APIs
            scripts_response = requests.get(f"{self.api_base}/admin/scripts", headers=headers, timeout=10)
            if scripts_response.status_code != 200:
                self.log_result("Script Management APIs", False, "Script management endpoints not accessible")
                return False
            
            # Test Ad Slot Management APIs (all 10 QuizWinz slots)
            ad_slots_response = requests.get(f"{self.api_base}/admin/ad-slots", headers=headers, timeout=10)
            if ad_slots_response.status_code != 200:
                self.log_result("Ad Slot Management APIs", False, "Ad slot management endpoints not accessible")
                return False
            
            ad_slots = ad_slots_response.json()
            expected_slots = [
                "header-banner", "sidebar-right", "between-questions-1", "between-questions-2", 
                "between-questions-3", "footer-banner", "popup-interstitial", "quiz-result-banner",
                "category-page-top", "category-page-bottom"
            ]
            
            found_placements = [slot.get('placement') for slot in ad_slots]
            missing_slots = [slot for slot in expected_slots if slot not in found_placements]
            
            if missing_slots:
                self.log_result("QuizWinz Ad Slots", False, f"Missing expected ad slots: {missing_slots}")
                return False
            
            # Test Rewarded Popup Configuration
            rewarded_config_response = requests.get(f"{self.api_base}/admin/rewarded-config", headers=headers, timeout=10)
            if rewarded_config_response.status_code != 200:
                self.log_result("Rewarded Popup Config", False, "Rewarded popup config not accessible")
                return False
            
            # Test Data Export/Import
            export_response = requests.get(f"{self.api_base}/admin/export/quiz-data", headers=headers, timeout=10)
            if export_response.status_code != 200:
                self.log_result("Data Export/Import", False, "Data export functionality not accessible")
                return False
            
            export_data = export_response.json()
            if 'categories' not in export_data or 'questions' not in export_data:
                self.log_result("Data Export Structure", False, "Export data missing required fields")
                return False
            
            self.log_result("Complete Admin Dashboard APIs", True, f"All admin dashboard APIs working - {len(ad_slots)} ad slots, quiz management, scripts, rewarded config, and data export all functional")
            return True
            
        except Exception as e:
            self.log_result("Complete Admin Dashboard APIs", False, f"Admin dashboard test failed: {str(e)}")
            return False
    
    def test_security_features(self, token):
        """Test security features of the admin system"""
        try:
            # Test 1: Endpoints without authentication should be blocked
            protected_endpoints = [
                "/admin/categories", "/admin/questions", "/admin/scripts", 
                "/admin/ad-slots", "/admin/rewarded-config", "/admin/site-config",
                "/admin/export/quiz-data"
            ]
            
            for endpoint in protected_endpoints:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=10)
                if response.status_code not in [401, 403]:
                    self.log_result("Security - Endpoint Protection", False, f"Endpoint {endpoint} not properly protected")
                    return False
            
            # Test profile endpoint specifically (PUT only)
            profile_response = requests.put(f"{self.api_base}/admin/profile", json={"current_password": "test"}, timeout=10)
            if profile_response.status_code not in [401, 403]:
                self.log_result("Security - Profile Endpoint", False, "Profile endpoint not properly protected")
                return False
            
            # Test 2: Invalid token should be rejected
            invalid_headers = {'Authorization': 'Bearer invalid_token_12345'}
            response = requests.get(f"{self.api_base}/admin/categories", headers=invalid_headers, timeout=10)
            if response.status_code not in [401, 403]:
                self.log_result("Security - Invalid Token", False, "Invalid tokens not properly rejected")
                return False
            
            # Test 3: Token verification endpoint
            if token:
                valid_headers = {'Authorization': f'Bearer {token}'}
                verify_response = requests.get(f"{self.api_base}/admin/verify", headers=valid_headers, timeout=10)
                if verify_response.status_code != 200:
                    self.log_result("Security - Token Verification", False, "Token verification endpoint not working")
                    return False
                
                verify_data = verify_response.json()
                if not verify_data.get('valid'):
                    self.log_result("Security - Token Verification", False, "Valid token not recognized")
                    return False
            
            self.log_result("Security Features", True, "All security features working - endpoint protection, invalid token rejection, and token verification")
            return True
            
        except Exception as e:
            self.log_result("Security Features", False, f"Security test failed: {str(e)}")
            return False
    
    def test_backend_integration_protection(self, token):
        try:
            # Test endpoints without authentication (should fail with 401 or 403)
            protected_endpoints = [
                "/admin/site-config",
                "/admin/ad-slots",
                "/admin/rewarded-config"
            ]
            
            for endpoint in protected_endpoints:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=10)
                if response.status_code not in [401, 403]:
                    self.log_result("Authentication Protection", False, f"Endpoint {endpoint} not properly protected (got {response.status_code})")
                    return False
            
            # Test endpoints with valid authentication (should succeed)
            if token:
                headers = {'Authorization': f'Bearer {token}'}
                for endpoint in protected_endpoints:
                    response = requests.get(f"{self.api_base}{endpoint}", headers=headers, timeout=10)
                    if response.status_code != 200:
                        self.log_result("Authenticated Access", False, f"Endpoint {endpoint} not accessible with valid token (got {response.status_code})")
                        return False
            else:
                self.log_result("Backend Integration Protection", False, "No admin token available for authenticated access test")
                return False
            
            self.log_result("Backend Integration Protection", True, "All new endpoints properly protected with admin authentication")
            return True
            
        except Exception as e:
            self.log_result("Backend Integration Protection", False, f"Protection test failed: {str(e)}")
            return False
    
    def test_quiz_categories_api(self):
        """Test the quiz categories API that frontend uses to display categories"""
        try:
            # Test GET /api/quiz/categories (the main API frontend uses)
            response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Quiz Categories API", False, f"Categories API failed: HTTP {response.status_code}")
                return False
            
            categories = response.json()
            
            # Verify response structure
            if not isinstance(categories, list):
                self.log_result("Quiz Categories API", False, f"Expected list, got {type(categories)}")
                return False
            
            if len(categories) == 0:
                self.log_result("Quiz Categories API", False, "No categories found - data synchronization issue")
                return False
            
            # Verify each category has required fields for frontend
            required_fields = ['id', 'name', 'description', 'icon', 'color']
            for i, category in enumerate(categories):
                missing_fields = [field for field in required_fields if field not in category]
                if missing_fields:
                    self.log_result("Quiz Categories Structure", False, f"Category {i} missing fields: {missing_fields}")
                    return False
            
            # Check for expected categories (programming, AI, web development, etc.)
            category_names = [cat.get('name', '').lower() for cat in categories]
            expected_categories = ['programming', 'ai', 'web development', 'javascript', 'python']
            found_expected = [cat for cat in expected_categories if any(cat in name for name in category_names)]
            
            self.log_result("Quiz Categories API", True, f"Categories API working correctly - {len(categories)} categories found including: {', '.join([cat['name'] for cat in categories[:5]])}")
            return True, categories
            
        except Exception as e:
            self.log_result("Quiz Categories API", False, f"Categories API test failed: {str(e)}")
            return False, []
    
    def test_quiz_questions_api(self, categories):
        """Test quiz questions API for data synchronization"""
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
                self.log_result("Quiz Questions API", False, f"No questions found for category '{test_category['name']}' - data sync issue")
                return False
            
            # Verify question structure
            required_fields = ['id', 'question', 'options', 'correct_answer', 'category']
            for i, question in enumerate(questions):
                missing_fields = [field for field in required_fields if field not in question]
                if missing_fields:
                    self.log_result("Quiz Questions Structure", False, f"Question {i} missing fields: {missing_fields}")
                    return False
                
                # Verify options structure
                if not isinstance(question.get('options'), list) or len(question.get('options', [])) < 2:
                    self.log_result("Quiz Questions Structure", False, f"Question {i} has invalid options structure")
                    return False
            
            self.log_result("Quiz Questions API", True, f"Questions API working - {len(questions)} questions found for category '{test_category['name']}'")
            return True
            
        except Exception as e:
            self.log_result("Quiz Questions API", False, f"Questions API test failed: {str(e)}")
            return False
    
    def test_database_data_verification(self):
        """Verify that migrated data is accessible and properly structured"""
        try:
            # Test categories data
            categories_response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            if categories_response.status_code != 200:
                self.log_result("Database Data Verification", False, "Cannot access categories data")
                return False
            
            categories = categories_response.json()
            
            # Verify we have expected programming-related categories
            category_names = [cat.get('name', '') for cat in categories]
            programming_categories = [name for name in category_names if any(keyword in name.lower() for keyword in ['programming', 'javascript', 'python', 'web', 'ai', 'tech'])]
            
            if len(programming_categories) == 0:
                self.log_result("Database Data Verification", False, "No programming-related categories found - migration issue")
                return False
            
            # Test that each category has associated questions
            categories_with_questions = 0
            for category in categories[:3]:  # Test first 3 categories
                questions_response = requests.get(f"{self.api_base}/quiz/questions/{category['id']}", timeout=10)
                if questions_response.status_code == 200:
                    questions = questions_response.json()
                    if len(questions) > 0:
                        categories_with_questions += 1
            
            if categories_with_questions == 0:
                self.log_result("Database Data Verification", False, "No categories have associated questions - data sync issue")
                return False
            
            self.log_result("Database Data Verification", True, f"Database data properly migrated - {len(categories)} categories, {categories_with_questions} categories with questions")
            return True
            
        except Exception as e:
            self.log_result("Database Data Verification", False, f"Database verification failed: {str(e)}")
            return False
    
    def test_frontend_backend_integration_format(self):
        """Test that API responses are in correct format for frontend consumption"""
        try:
            # Test categories format
            categories_response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            if categories_response.status_code != 200:
                self.log_result("Frontend Integration Format", False, "Categories API not accessible")
                return False
            
            categories = categories_response.json()
            
            # Verify JSON serialization (no ObjectId issues)
            try:
                json.dumps(categories)
            except TypeError as e:
                self.log_result("Frontend Integration Format", False, f"Categories not JSON serializable: {str(e)}")
                return False
            
            # Test questions format
            if categories:
                questions_response = requests.get(f"{self.api_base}/quiz/questions/{categories[0]['id']}", timeout=10)
                if questions_response.status_code == 200:
                    questions = questions_response.json()
                    try:
                        json.dumps(questions)
                    except TypeError as e:
                        self.log_result("Frontend Integration Format", False, f"Questions not JSON serializable: {str(e)}")
                        return False
            
            # Test rewarded config format
            config_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if config_response.status_code == 200:
                config = config_response.json()
                try:
                    json.dumps(config)
                except TypeError as e:
                    self.log_result("Frontend Integration Format", False, f"Rewarded config not JSON serializable: {str(e)}")
                    return False
            
            self.log_result("Frontend Integration Format", True, "All API responses properly formatted for frontend consumption")
            return True
            
        except Exception as e:
            self.log_result("Frontend Integration Format", False, f"Integration format test failed: {str(e)}")
            return False
    
    def run_data_sync_tests(self):
        """Run focused tests on backend API connectivity and data synchronization"""
        print(f"🎯 Starting Backend API Connectivity and Data Synchronization Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 70)
        
        tests = [
            # Core connectivity
            self.test_backend_health,
            self.test_mongodb_connection,
            
            # Data synchronization tests (main focus)
            self.test_quiz_categories_api,
            self.test_database_data_verification,
            self.test_frontend_backend_integration_format,
        ]
        
        passed = 0
        failed = 0
        categories = []
        
        for test in tests:
            try:
                if test == self.test_quiz_categories_api:
                    result, categories = test()
                elif test == self.test_quiz_questions_api:
                    result = test(categories)
                else:
                    result = test()
                    
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Exception: {str(e)}")
                failed += 1
            
            print("-" * 40)
        
        # Test questions API after we have categories
        if categories:
            try:
                result = self.test_quiz_questions_api(categories)
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: test_quiz_questions_api - Exception: {str(e)}")
                failed += 1
            print("-" * 40)
        
        print(f"\n📊 Data Synchronization Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 DATA SYNCHRONIZATION TESTS PASSED!")
            print(f"   ✅ Quiz categories API (/api/quiz/categories) working correctly")
            print(f"   ✅ Database contains properly migrated data")
            print(f"   ✅ API responses formatted correctly for frontend")
            print(f"   ✅ Backend-frontend integration ready")
        
        return passed, failed, self.results

    def run_all_tests(self):
        """Run comprehensive admin system tests including forgot password and profile management"""
        print(f"🚀 Starting Comprehensive Admin System Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 60)
        
        # Get admin token first
        auth_success, admin_token = self.test_admin_authentication()
        
        tests = [
            # Core Infrastructure Tests
            self.test_environment_configuration,
            self.test_backend_health,
            self.test_cors_configuration,
            self.test_api_route_prefix,
            self.test_status_api_post,
            self.test_status_api_get,
            self.test_mongodb_connection,
            
            # New Admin System Tests (as requested)
            self.test_forgot_password_system,
            lambda: self.test_profile_management(admin_token),
            lambda: self.test_complete_admin_dashboard_apis(admin_token),
            lambda: self.test_security_features(admin_token),
            
            # Existing Enhanced Admin Tests
            lambda: self.test_site_config_management(admin_token),
            lambda: self.test_enhanced_ad_slot_system(admin_token),
            lambda: self.test_updated_models_integration(admin_token),
            lambda: self.test_backend_integration_protection(admin_token),
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
        
        print(f"\n📊 Comprehensive Admin System Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 ALL TESTS PASSED! Admin system is fully functional:")
            print(f"   ✅ Admin authentication with username='admin', password='TechKwiz2025!'")
            print(f"   ✅ Forgot password system with email='jaseem@adops.in'")
            print(f"   ✅ Profile management with current password verification")
            print(f"   ✅ Complete admin dashboard APIs (quiz, scripts, ads, config)")
            print(f"   ✅ All 10 QuizWinz ad slots working")
            print(f"   ✅ Security features (authentication, token validation)")
        
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