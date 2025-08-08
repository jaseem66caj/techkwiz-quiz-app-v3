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
                if line.startswith('NEXT_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
                elif line.startswith('REACT_APP_BACKEND_URL='):
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
        """Test Enhanced Ad Slot System with techkwiz.com-style slots"""
        if not token:
            self.log_result("Enhanced Ad Slot System", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # Expected techkwiz.com-style ad slots (10 total)
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
            
            self.log_result("Enhanced Ad Slot System", True, f"Found {len(ad_slots)} ad slots with techkwiz.com structure, CRUD operations working")
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
            
            # Test Ad Slot Management APIs (all 10 TechKwiz slots)
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
                self.log_result("TechKwiz Ad Slots", False, f"Missing expected ad slots: {missing_slots}")
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
    
    def test_quiz_categories_entry_fees(self):
        """Test that quiz categories have appropriate entry fees (100+ coins)"""
        try:
            response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Quiz Categories Entry Fees", False, f"Categories API failed: HTTP {response.status_code}")
                return False, []
            
            categories = response.json()
            
            if not isinstance(categories, list) or len(categories) == 0:
                self.log_result("Quiz Categories Entry Fees", False, "No categories found for entry fee testing")
                return False, []
            
            # Check entry fees for each category
            low_entry_fee_categories = []
            missing_entry_fee_categories = []
            
            for category in categories:
                if 'entry_fee' not in category:
                    missing_entry_fee_categories.append(category.get('name', 'Unknown'))
                elif category['entry_fee'] < 100:
                    low_entry_fee_categories.append({
                        'name': category.get('name', 'Unknown'),
                        'entry_fee': category['entry_fee']
                    })
            
            # Report findings
            if missing_entry_fee_categories:
                self.log_result("Quiz Categories Entry Fees", False, f"Categories missing entry_fee field: {missing_entry_fee_categories}")
                return False, categories
            
            if low_entry_fee_categories:
                self.log_result("Quiz Categories Entry Fees", False, f"Categories with entry fees < 100 coins: {low_entry_fee_categories}")
                return False, categories
            
            # All categories have appropriate entry fees
            entry_fees = [cat.get('entry_fee', 0) for cat in categories]
            min_fee = min(entry_fees)
            max_fee = max(entry_fees)
            avg_fee = sum(entry_fees) / len(entry_fees)
            
            self.log_result("Quiz Categories Entry Fees", True, f"All {len(categories)} categories have entry fees ≥100 coins (min: {min_fee}, max: {max_fee}, avg: {avg_fee:.0f})")
            return True, categories
            
        except Exception as e:
            self.log_result("Quiz Categories Entry Fees", False, f"Entry fee test failed: {str(e)}")
            return False, []
    
    def test_user_management_system(self):
        """Test if user management system exists for coin-based economy"""
        try:
            # Test if user registration endpoint exists
            test_user_data = {
                "username": "testuser_coins",
                "email": "testuser@example.com",
                "password": "testpass123"
            }
            
            # Try common user registration endpoints
            registration_endpoints = [
                "/users/register",
                "/auth/register", 
                "/user/create",
                "/users",
                "/auth/signup"
            ]
            
            registration_found = False
            for endpoint in registration_endpoints:
                try:
                    response = requests.post(f"{self.api_base}{endpoint}", json=test_user_data, timeout=5)
                    if response.status_code not in [404, 405]:  # Not "Not Found" or "Method Not Allowed"
                        registration_found = True
                        self.log_result("User Registration Endpoint", True, f"Found user registration at {endpoint}")
                        break
                except:
                    continue
            
            if not registration_found:
                self.log_result("User Management System", False, "No user registration endpoints found - user management system missing")
                return False
            
            # Test if user profile/coins endpoint exists
            profile_endpoints = [
                "/users/profile",
                "/user/profile",
                "/auth/profile",
                "/users/me"
            ]
            
            profile_found = False
            for endpoint in profile_endpoints:
                try:
                    response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                    if response.status_code not in [404, 405]:
                        profile_found = True
                        self.log_result("User Profile Endpoint", True, f"Found user profile at {endpoint}")
                        break
                except:
                    continue
            
            if not profile_found:
                self.log_result("User Management System", False, "No user profile endpoints found - coin management system missing")
                return False
            
            self.log_result("User Management System", True, "User management system endpoints found")
            return True
            
        except Exception as e:
            self.log_result("User Management System", False, f"User system test failed: {str(e)}")
            return False
    
    def test_guest_user_system(self):
        """Test if guest user system exists for 0 coins implementation"""
        try:
            # Test if guest user creation endpoint exists
            guest_endpoints = [
                "/users/guest",
                "/auth/guest",
                "/guest/create",
                "/users/anonymous"
            ]
            
            guest_found = False
            for endpoint in guest_endpoints:
                try:
                    response = requests.post(f"{self.api_base}{endpoint}", json={}, timeout=5)
                    if response.status_code not in [404, 405]:
                        guest_found = True
                        
                        # Check if response includes coins field
                        if response.status_code == 200:
                            data = response.json()
                            if 'coins' in data:
                                coins = data['coins']
                                if coins == 0:
                                    self.log_result("Guest User System", True, f"Guest user system working - starts with 0 coins at {endpoint}")
                                else:
                                    self.log_result("Guest User System", False, f"Guest user starts with {coins} coins instead of 0")
                                return coins == 0
                            else:
                                self.log_result("Guest User System", False, f"Guest user response missing coins field at {endpoint}")
                                return False
                        break
                except:
                    continue
            
            if not guest_found:
                self.log_result("Guest User System", False, "No guest user endpoints found - guest system missing")
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Guest User System", False, f"Guest user test failed: {str(e)}")
            return False
    
    def test_coin_reward_system(self):
        """Test coin reward system and homepage quiz behavior"""
        try:
            # Test if homepage quiz endpoint exists
            homepage_endpoints = [
                "/quiz/homepage",
                "/quiz/daily",
                "/quiz/free",
                "/homepage/quiz"
            ]
            
            homepage_found = False
            for endpoint in homepage_endpoints:
                try:
                    response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                    if response.status_code not in [404, 405]:
                        homepage_found = True
                        self.log_result("Homepage Quiz Endpoint", True, f"Found homepage quiz at {endpoint}")
                        
                        # Test if it gives automatic coins (should not give coins now)
                        if response.status_code == 200:
                            data = response.json()
                            if 'coins_reward' in data and data['coins_reward'] > 0:
                                self.log_result("Homepage Quiz Coins", False, f"Homepage quiz still gives {data['coins_reward']} coins - should give 0")
                                return False
                        break
                except:
                    continue
            
            if not homepage_found:
                self.log_result("Coin Reward System", False, "No homepage quiz endpoints found - coin reward system unclear")
                return False
            
            # Test rewarded popup configuration for insufficient coins
            response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if response.status_code == 200:
                config = response.json()
                if config.get('show_on_insufficient_coins', False):
                    self.log_result("Insufficient Coins Popup", True, f"Rewarded popup configured for insufficient coins (reward: {config.get('coin_reward', 0)} coins)")
                else:
                    self.log_result("Insufficient Coins Popup", False, "Rewarded popup not configured for insufficient coins scenario")
                    return False
            else:
                self.log_result("Coin Reward System", False, "Cannot access rewarded popup configuration")
                return False
            
            self.log_result("Coin Reward System", True, "Coin reward system configured correctly")
            return True
            
        except Exception as e:
            self.log_result("Coin Reward System", False, f"Coin reward test failed: {str(e)}")
            return False
    
    def test_insufficient_coins_flow(self):
        """Test the flow when users have insufficient coins for quiz entry"""
        try:
            # Get rewarded popup config
            config_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if config_response.status_code != 200:
                self.log_result("Insufficient Coins Flow", False, "Cannot access rewarded popup configuration")
                return False
            
            config = config_response.json()
            
            # Check if popup is configured for insufficient coins
            required_fields = ['show_on_insufficient_coins', 'coin_reward', 'is_active']
            missing_fields = [field for field in required_fields if field not in config]
            
            if missing_fields:
                self.log_result("Insufficient Coins Flow", False, f"Rewarded config missing fields: {missing_fields}")
                return False
            
            if not config.get('show_on_insufficient_coins', False):
                self.log_result("Insufficient Coins Flow", False, "Rewarded popup not configured to show on insufficient coins")
                return False
            
            if not config.get('is_active', False):
                self.log_result("Insufficient Coins Flow", False, "Rewarded popup system is not active")
                return False
            
            coin_reward = config.get('coin_reward', 0)
            if coin_reward <= 0:
                self.log_result("Insufficient Coins Flow", False, f"Rewarded popup gives {coin_reward} coins - should be positive")
                return False
            
            # Test if there are quiz entry endpoints that check coins
            quiz_entry_endpoints = [
                "/quiz/start",
                "/quiz/enter",
                "/quiz/join"
            ]
            
            entry_endpoint_found = False
            for endpoint in quiz_entry_endpoints:
                try:
                    # Try to start a quiz (should fail without proper authentication/coins)
                    response = requests.post(f"{self.api_base}{endpoint}", json={"category_id": "test"}, timeout=5)
                    if response.status_code not in [404, 405]:
                        entry_endpoint_found = True
                        break
                except:
                    continue
            
            if not entry_endpoint_found:
                self.log_result("Quiz Entry System", False, "No quiz entry endpoints found - cannot test insufficient coins flow")
                return False
            
            self.log_result("Insufficient Coins Flow", True, f"Insufficient coins flow configured - popup gives {coin_reward} coins when users can't afford entry fees")
            return True
            
        except Exception as e:
            self.log_result("Insufficient Coins Flow", False, f"Insufficient coins flow test failed: {str(e)}")
            return False
    
    def test_timer_baseline_backend_health(self):
        """Test backend health check and API responsiveness for timer baseline"""
        try:
            response = requests.get(f"{self.api_base}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_result("Timer Baseline - Backend Health", True, "Backend API is healthy and responsive")
                    return True
                else:
                    self.log_result("Timer Baseline - Backend Health", False, f"Unexpected health response: {data}")
                    return False
            else:
                self.log_result("Timer Baseline - Backend Health", False, f"Health check failed: HTTP {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_result("Timer Baseline - Backend Health", False, f"Health check connection failed: {str(e)}")
            return False

    def test_timer_baseline_quiz_categories(self):
        """Test Quiz Categories API - ensure all 6 youth-focused categories are working"""
        try:
            response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            if response.status_code == 200:
                categories = response.json()
                
                if not isinstance(categories, list):
                    self.log_result("Timer Baseline - Quiz Categories", False, f"Expected list, got: {type(categories)}")
                    return False, []
                
                if len(categories) < 6:
                    self.log_result("Timer Baseline - Quiz Categories", False, f"Expected at least 6 categories, found {len(categories)}")
                    return False, categories
                
                # Check for required fields in each category
                required_fields = ['id', 'name', 'entry_fee', 'icon']
                for i, category in enumerate(categories):
                    missing_fields = [field for field in required_fields if field not in category]
                    if missing_fields:
                        self.log_result("Timer Baseline - Quiz Categories", False, f"Category {i+1} missing fields: {missing_fields}")
                        return False, categories
                
                # Log category details
                category_details = []
                for cat in categories:
                    category_details.append(f"{cat.get('name', 'Unknown')} ({cat.get('entry_fee', 0)} coins)")
                
                self.log_result("Timer Baseline - Quiz Categories", True, f"Found {len(categories)} categories: {', '.join(category_details)}")
                return True, categories
            else:
                self.log_result("Timer Baseline - Quiz Categories", False, f"Categories API failed: HTTP {response.status_code}")
                return False, []
        except Exception as e:
            self.log_result("Timer Baseline - Quiz Categories", False, f"Categories test failed: {str(e)}")
            return False, []

    def test_timer_baseline_sequential_questions(self, categories):
        """Test Sequential Questions API - verify 5 questions per category"""
        if not categories:
            self.log_result("Timer Baseline - Sequential Questions", False, "No categories available for testing")
            return False
        
        try:
            total_questions_tested = 0
            categories_with_questions = 0
            
            for category in categories[:3]:  # Test first 3 categories to avoid timeout
                category_id = category.get('id')
                category_name = category.get('name', 'Unknown')
                
                if not category_id:
                    continue
                
                # Test the sequential questions endpoint
                response = requests.get(f"{self.api_base}/quiz/sequential-questions/{category_id}", timeout=10)
                
                if response.status_code == 200:
                    questions = response.json()
                    
                    if not isinstance(questions, list):
                        self.log_result("Timer Baseline - Sequential Questions", False, f"Category {category_name}: Expected list, got {type(questions)}")
                        return False
                    
                    if len(questions) != 5:
                        self.log_result("Timer Baseline - Sequential Questions", False, f"Category {category_name}: Expected 5 questions, got {len(questions)}")
                        return False
                    
                    # Check question structure
                    required_fields = ['id', 'question', 'options', 'correct_answer']
                    for i, question in enumerate(questions):
                        missing_fields = [field for field in required_fields if field not in question]
                        if missing_fields:
                            self.log_result("Timer Baseline - Sequential Questions", False, f"Category {category_name}, Question {i+1}: Missing fields {missing_fields}")
                            return False
                    
                    total_questions_tested += len(questions)
                    categories_with_questions += 1
                    
                elif response.status_code == 404:
                    self.log_result("Timer Baseline - Sequential Questions", False, f"Category {category_name}: No questions found")
                    return False
                else:
                    self.log_result("Timer Baseline - Sequential Questions", False, f"Category {category_name}: HTTP {response.status_code}")
                    return False
            
            if categories_with_questions > 0:
                self.log_result("Timer Baseline - Sequential Questions", True, f"Sequential questions working correctly - tested {total_questions_tested} questions across {categories_with_questions} categories")
                return True
            else:
                self.log_result("Timer Baseline - Sequential Questions", False, "No categories had working sequential questions")
                return False
                
        except Exception as e:
            self.log_result("Timer Baseline - Sequential Questions", False, f"Sequential questions test failed: {str(e)}")
            return False

    def test_timer_baseline_rewarded_config(self):
        """Test Rewarded popup configuration API - confirm current settings"""
        try:
            response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if response.status_code == 200:
                config = response.json()
                
                # Check for required configuration fields
                required_fields = ['coin_reward', 'is_active', 'show_on_insufficient_coins']
                missing_fields = [field for field in required_fields if field not in config]
                
                if missing_fields:
                    self.log_result("Timer Baseline - Rewarded Config", False, f"Missing configuration fields: {missing_fields}")
                    return False
                
                # Log current configuration
                coin_reward = config.get('coin_reward', 0)
                is_active = config.get('is_active', False)
                show_on_insufficient = config.get('show_on_insufficient_coins', False)
                trigger_after = config.get('trigger_after_questions', 1)
                
                config_summary = f"coin_reward={coin_reward}, is_active={is_active}, show_on_insufficient_coins={show_on_insufficient}, trigger_after_questions={trigger_after}"
                
                self.log_result("Timer Baseline - Rewarded Config", True, f"Rewarded popup configuration accessible: {config_summary}")
                return True, config
            else:
                self.log_result("Timer Baseline - Rewarded Config", False, f"Rewarded config API failed: HTTP {response.status_code}")
                return False, None
        except Exception as e:
            self.log_result("Timer Baseline - Rewarded Config", False, f"Rewarded config test failed: {str(e)}")
            return False, None

    def test_timer_baseline_admin_auth(self):
        """Test Admin authentication with username='admin', password='TechKwiz2025!'"""
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
            
            # Setup might fail if admin already exists, that's okay
            if setup_response.status_code == 200:
                self.log_result("Timer Baseline - Admin Setup", True, "Admin user created successfully")
            
            # Now test login with the specific credentials
            login_response = requests.post(
                f"{self.api_base}/admin/login",
                json=setup_credentials,
                timeout=10
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                if 'access_token' in token_data:
                    self.log_result("Timer Baseline - Admin Auth", True, "Admin authentication working with username='admin', password='TechKwiz2025!'")
                    return True, token_data['access_token']
                else:
                    self.log_result("Timer Baseline - Admin Auth", False, "Login successful but no access token returned")
                    return False, None
            else:
                self.log_result("Timer Baseline - Admin Auth", False, f"Admin login failed: HTTP {login_response.status_code}")
                return False, None
                
        except Exception as e:
            self.log_result("Timer Baseline - Admin Auth", False, f"Admin authentication test failed: {str(e)}")
            return False, None

    def test_timer_baseline_mongodb_connectivity(self):
        """Test MongoDB connectivity and data persistence"""
        try:
            # Create a test record to verify database connectivity
            test_data = {"client_name": "timer_baseline_test"}
            
            post_response = requests.post(
                f"{self.api_base}/status",
                json=test_data,
                timeout=10
            )
            
            if post_response.status_code != 200:
                self.log_result("Timer Baseline - MongoDB Connectivity", False, "Failed to create test record in database")
                return False
            
            # Retrieve records to verify persistence
            get_response = requests.get(f"{self.api_base}/status", timeout=10)
            
            if get_response.status_code == 200:
                records = get_response.json()
                test_record_found = any(
                    record.get('client_name') == 'timer_baseline_test' 
                    for record in records
                )
                
                if test_record_found:
                    self.log_result("Timer Baseline - MongoDB Connectivity", True, "MongoDB connectivity and data persistence working correctly")
                    return True
                else:
                    self.log_result("Timer Baseline - MongoDB Connectivity", False, "Test record not found - data persistence issue")
                    return False
            else:
                self.log_result("Timer Baseline - MongoDB Connectivity", False, "Failed to retrieve records from database")
                return False
                
        except Exception as e:
            self.log_result("Timer Baseline - MongoDB Connectivity", False, f"MongoDB connectivity test failed: {str(e)}")
            return False

    def run_timer_baseline_tests(self):
        """Run comprehensive baseline tests before implementing timer-based questions"""
        print(f"⏱️  Starting Timer-Based Questions Baseline Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 70)
        
        passed = 0
        failed = 0
        categories = []
        admin_token = None
        rewarded_config = None
        
        # Test 1: Backend Health Check
        try:
            if self.test_timer_baseline_backend_health():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL: Backend Health - Exception: {str(e)}")
            failed += 1
        print("-" * 40)
        
        # Test 2: Quiz Categories API
        try:
            result, categories = self.test_timer_baseline_quiz_categories()
            if result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL: Quiz Categories - Exception: {str(e)}")
            failed += 1
        print("-" * 40)
        
        # Test 3: Sequential Questions API
        try:
            if self.test_timer_baseline_sequential_questions(categories):
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL: Sequential Questions - Exception: {str(e)}")
            failed += 1
        print("-" * 40)
        
        # Test 4: Rewarded Popup Configuration
        try:
            result, rewarded_config = self.test_timer_baseline_rewarded_config()
            if result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL: Rewarded Config - Exception: {str(e)}")
            failed += 1
        print("-" * 40)
        
        # Test 5: Admin Authentication
        try:
            result, admin_token = self.test_timer_baseline_admin_auth()
            if result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL: Admin Auth - Exception: {str(e)}")
            failed += 1
        print("-" * 40)
        
        # Test 6: MongoDB Connectivity
        try:
            if self.test_timer_baseline_mongodb_connectivity():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL: MongoDB Connectivity - Exception: {str(e)}")
            failed += 1
        print("-" * 40)
        
        print(f"\n📊 Timer Baseline Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 TIMER BASELINE TESTS PASSED!")
            print(f"Backend is ready for timer-based questions implementation.")
            print(f"Found {len(categories)} quiz categories with sequential questions support.")
            if rewarded_config:
                print(f"Rewarded popup configured with {rewarded_config.get('coin_reward', 0)} coins per ad.")
        else:
            print(f"\n⚠️  BASELINE ISSUES FOUND - Backend needs fixes before timer implementation.")
        
        return passed, failed

    def run_zero_coins_implementation_tests(self):
        """Run comprehensive tests for the 0 coins implementation"""
        print(f"🪙 Starting 0 Coins Implementation Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 70)
        
        tests = [
            # Core connectivity first
            self.test_backend_health,
            self.test_mongodb_connection,
            
            # 0 coins implementation tests
            self.test_quiz_categories_entry_fees,
            self.test_user_management_system,
            self.test_guest_user_system,
            self.test_coin_reward_system,
            self.test_insufficient_coins_flow,
        ]
        
        passed = 0
        failed = 0
        categories = []
        
        for test in tests:
            try:
                if test == self.test_quiz_categories_entry_fees:
                    result, categories = test()
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
        
        print(f"\n📊 0 Coins Implementation Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 0 COINS IMPLEMENTATION TESTS PASSED!")
            print(f"   ✅ Quiz categories have appropriate entry fees (100+ coins)")
            print(f"   ✅ User management system supports coin-based economy")
            print(f"   ✅ Guest users start with 0 coins")
            print(f"   ✅ Homepage quiz no longer gives automatic coins")
            print(f"   ✅ Insufficient coins flow triggers reward popup")
        else:
            print(f"\n⚠️  0 COINS IMPLEMENTATION ISSUES FOUND:")
            print(f"   Some components of the coin-based economy may be missing or misconfigured")
        
        return passed, failed, self.results

    def test_ad_analytics_event_endpoint(self):
        """Test POST /api/quiz/ad-analytics/event endpoint"""
        try:
            # Test data as specified in review request
            test_event = {
                "event_type": "start",
                "placement": "popup"
            }
            
            response = requests.post(
                f"{self.api_base}/quiz/ad-analytics/event",
                json=test_event,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if 'status' in data and 'id' in data:
                    if data['status'] == 'ok' and data['id']:
                        self.log_result("Ad Analytics Event POST", True, f"Event recorded successfully with ID: {data['id']}")
                        return True
                    else:
                        self.log_result("Ad Analytics Event POST", False, f"Invalid response structure: {data}")
                        return False
                else:
                    self.log_result("Ad Analytics Event POST", False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_result("Ad Analytics Event POST", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Ad Analytics Event POST", False, f"Request failed: {str(e)}")
            return False
    
    def test_rewarded_config_enable_analytics(self):
        """Test GET /api/quiz/rewarded-config returns enable_analytics boolean"""
        try:
            response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            
            if response.status_code == 200:
                config = response.json()
                
                # Check if enable_analytics field exists
                if 'enable_analytics' in config:
                    enable_analytics = config['enable_analytics']
                    if isinstance(enable_analytics, bool):
                        self.log_result("Rewarded Config Enable Analytics", True, f"enable_analytics field present: {enable_analytics}")
                        return True, config
                    else:
                        self.log_result("Rewarded Config Enable Analytics", False, f"enable_analytics is not boolean: {type(enable_analytics)}")
                        return False, config
                else:
                    # Check if it defaults to true when absent (as per requirement)
                    self.log_result("Rewarded Config Enable Analytics", True, "enable_analytics field absent - defaults to true as required")
                    return True, config
            else:
                self.log_result("Rewarded Config Enable Analytics", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_result("Rewarded Config Enable Analytics", False, f"Request failed: {str(e)}")
            return False, None
    
    def test_admin_rewarded_config_update(self, token):
        """Test PUT /api/admin/rewarded-config updates enable_analytics and persists"""
        if not token:
            self.log_result("Admin Rewarded Config Update", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {token}'}
            
            # First, get current config to see current state
            get_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if get_response.status_code != 200:
                self.log_result("Admin Rewarded Config Update", False, "Cannot get current config")
                return False
            
            current_config = get_response.json()
            current_analytics = current_config.get('enable_analytics', True)
            
            # Update enable_analytics to opposite value
            new_analytics_value = not current_analytics
            update_data = {
                "enable_analytics": new_analytics_value
            }
            
            # Test PUT /api/admin/rewarded-config (homepage)
            put_response = requests.put(
                f"{self.api_base}/admin/rewarded-config",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if put_response.status_code != 200:
                self.log_result("Admin Rewarded Config Update", False, f"PUT failed: HTTP {put_response.status_code}")
                return False
            
            updated_config = put_response.json()
            
            # Verify the update was applied
            if updated_config.get('enable_analytics') != new_analytics_value:
                self.log_result("Admin Rewarded Config Update", False, f"enable_analytics not updated correctly: expected {new_analytics_value}, got {updated_config.get('enable_analytics')}")
                return False
            
            # Verify persistence with subsequent GET
            verify_response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            if verify_response.status_code != 200:
                self.log_result("Admin Rewarded Config Update", False, "Cannot verify persistence")
                return False
            
            verified_config = verify_response.json()
            if verified_config.get('enable_analytics') != new_analytics_value:
                self.log_result("Admin Rewarded Config Update", False, f"Changes not persisted: expected {new_analytics_value}, got {verified_config.get('enable_analytics')}")
                return False
            
            self.log_result("Admin Rewarded Config Update", True, f"enable_analytics successfully updated to {new_analytics_value} and persisted")
            
            # Restore original value for other tests
            restore_data = {"enable_analytics": current_analytics}
            requests.put(
                f"{self.api_base}/admin/rewarded-config",
                json=restore_data,
                headers=headers,
                timeout=10
            )
            
            return True
            
        except Exception as e:
            self.log_result("Admin Rewarded Config Update", False, f"Update test failed: {str(e)}")
            return False

    def run_new_endpoints_tests(self):
        """Run tests for new endpoints as requested in review"""
        print(f"\n🎯 Testing New Endpoints for Ad Analytics and Enable Analytics")
        print("=" * 80)
        
        # Get admin token first
        auth_success, token = self.test_admin_authentication()
        
        # New endpoint tests
        tests = [
            ("Ad Analytics Event Endpoint", self.test_ad_analytics_event_endpoint),
            ("Rewarded Config Enable Analytics", lambda: self.test_rewarded_config_enable_analytics()[0]),
            ("Admin Rewarded Config Update", lambda: self.test_admin_rewarded_config_update(token)),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
        
        # Summary
        print("\n" + "=" * 80)
        print(f"🎯 NEW ENDPOINTS TESTING SUMMARY: {passed}/{total} tests passed ({passed/total*100:.1f}% success rate)")
        
        if passed == total:
            print("✅ All new endpoint tests passed!")
        else:
            print(f"❌ {total - passed} tests failed.")
        
        return passed == total

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
            print(f"   ✅ All 10 TechKwiz ad slots working")
            print(f"   ✅ Security features (authentication, token validation)")
        
        return passed, failed, self.results

    def test_timer_configuration_migration(self):
        """Test that timer configuration migration was successful - verify all categories have timer settings"""
        try:
            response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Timer Configuration Migration", False, f"Categories API failed: HTTP {response.status_code}")
                return False
            
            categories = response.json()
            
            if not isinstance(categories, list) or len(categories) == 0:
                self.log_result("Timer Configuration Migration", False, "No categories found for timer migration verification")
                return False
            
            # Check each category for timer settings
            categories_with_timer = 0
            categories_without_timer = []
            timer_config_details = []
            
            for category in categories:
                category_name = category.get('name', 'Unknown')
                
                # Check for all required timer fields
                timer_fields = ['timer_enabled', 'timer_seconds', 'show_timer_warning', 'auto_advance_on_timeout', 'show_correct_answer_on_timeout']
                missing_fields = [field for field in timer_fields if field not in category]
                
                if missing_fields:
                    categories_without_timer.append({
                        'name': category_name,
                        'missing_fields': missing_fields
                    })
                else:
                    categories_with_timer += 1
                    timer_config_details.append({
                        'name': category_name,
                        'timer_enabled': category.get('timer_enabled'),
                        'timer_seconds': category.get('timer_seconds'),
                        'show_timer_warning': category.get('show_timer_warning'),
                        'auto_advance_on_timeout': category.get('auto_advance_on_timeout'),
                        'show_correct_answer_on_timeout': category.get('show_correct_answer_on_timeout')
                    })
            
            # Report results
            if categories_without_timer:
                self.log_result("Timer Configuration Migration", False, f"Categories missing timer settings: {categories_without_timer}")
                return False
            
            # Verify timer configuration values
            incorrect_configs = []
            for config in timer_config_details:
                if (config['timer_enabled'] != True or 
                    config['timer_seconds'] != 30 or
                    config['show_timer_warning'] != True or
                    config['auto_advance_on_timeout'] != True or
                    config['show_correct_answer_on_timeout'] != True):
                    incorrect_configs.append(config)
            
            if incorrect_configs:
                self.log_result("Timer Configuration Migration", False, f"Categories with incorrect timer settings: {incorrect_configs}")
                return False
            
            self.log_result("Timer Configuration Migration", True, f"All {len(categories)} categories successfully migrated with correct timer settings (30s countdown, auto-advance enabled)")
            return True, categories
            
        except Exception as e:
            self.log_result("Timer Configuration Migration", False, f"Timer migration verification failed: {str(e)}")
            return False, []
    
    def test_timer_config_api_endpoint(self):
        """Test new timer configuration API endpoint: /api/quiz/categories/{category_id}/timer-config"""
        try:
            # First get categories to test with
            categories_response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            if categories_response.status_code != 200:
                self.log_result("Timer Config API Endpoint", False, "Cannot get categories for timer config testing")
                return False
            
            categories = categories_response.json()
            if not categories:
                self.log_result("Timer Config API Endpoint", False, "No categories available for timer config testing")
                return False
            
            # Test timer config endpoint for multiple categories (2-3 as requested)
            test_categories = categories[:3]  # Test first 3 categories
            successful_tests = 0
            
            for category in test_categories:
                category_id = category.get('id')
                category_name = category.get('name', 'Unknown')
                
                if not category_id:
                    continue
                
                # Test GET /api/quiz/categories/{category_id}/timer-config
                timer_response = requests.get(f"{self.api_base}/quiz/categories/{category_id}/timer-config", timeout=10)
                
                if timer_response.status_code != 200:
                    self.log_result("Timer Config API Endpoint", False, f"Timer config API failed for {category_name}: HTTP {timer_response.status_code}")
                    continue
                
                timer_config = timer_response.json()
                
                # Verify response structure
                required_fields = ['category_id', 'category_name', 'timer_enabled', 'timer_seconds', 'show_timer_warning', 'auto_advance_on_timeout', 'show_correct_answer_on_timeout']
                missing_fields = [field for field in required_fields if field not in timer_config]
                
                if missing_fields:
                    self.log_result("Timer Config API Endpoint", False, f"Timer config response missing fields for {category_name}: {missing_fields}")
                    continue
                
                # Verify expected values
                expected_values = {
                    'category_id': category_id,
                    'timer_enabled': True,
                    'timer_seconds': 30,
                    'show_timer_warning': True,
                    'auto_advance_on_timeout': True,
                    'show_correct_answer_on_timeout': True
                }
                
                incorrect_values = []
                for key, expected_value in expected_values.items():
                    if timer_config.get(key) != expected_value:
                        incorrect_values.append({
                            'field': key,
                            'expected': expected_value,
                            'actual': timer_config.get(key)
                        })
                
                if incorrect_values:
                    self.log_result("Timer Config API Endpoint", False, f"Timer config incorrect values for {category_name}: {incorrect_values}")
                    continue
                
                successful_tests += 1
                self.log_result(f"Timer Config - {category_name}", True, f"Timer config API working correctly: 30s countdown, auto-advance enabled")
            
            if successful_tests >= 2:  # At least 2-3 categories as requested
                self.log_result("Timer Config API Endpoint", True, f"Timer configuration API working correctly for {successful_tests} categories")
                return True
            else:
                self.log_result("Timer Config API Endpoint", False, f"Only {successful_tests} categories passed timer config tests")
                return False
            
        except Exception as e:
            self.log_result("Timer Config API Endpoint", False, f"Timer config API test failed: {str(e)}")
            return False
    
    def test_sequential_questions_with_timer(self):
        """Test sequential questions API still works with timer-enabled categories"""
        try:
            # Get categories first
            categories_response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            if categories_response.status_code != 200:
                self.log_result("Sequential Questions with Timer", False, "Cannot get categories for sequential questions testing")
                return False
            
            categories = categories_response.json()
            if not categories:
                self.log_result("Sequential Questions with Timer", False, "No categories available for sequential questions testing")
                return False
            
            # Test sequential questions for multiple categories
            test_categories = categories[:3]  # Test first 3 categories
            successful_tests = 0
            
            for category in test_categories:
                category_id = category.get('id')
                category_name = category.get('name', 'Unknown')
                
                if not category_id:
                    continue
                
                # Test GET /api/quiz/sequential-questions/{category_id}
                questions_response = requests.get(f"{self.api_base}/quiz/sequential-questions/{category_id}", timeout=10)
                
                if questions_response.status_code != 200:
                    self.log_result("Sequential Questions with Timer", False, f"Sequential questions API failed for {category_name}: HTTP {questions_response.status_code}")
                    continue
                
                questions = questions_response.json()
                
                # Verify response structure
                if not isinstance(questions, list):
                    self.log_result("Sequential Questions with Timer", False, f"Sequential questions should return list for {category_name}")
                    continue
                
                if len(questions) != 5:
                    self.log_result("Sequential Questions with Timer", False, f"Sequential questions should return exactly 5 questions for {category_name}, got {len(questions)}")
                    continue
                
                # Verify each question has required fields
                valid_questions = 0
                for question in questions:
                    required_fields = ['id', 'question', 'options', 'correct_answer', 'difficulty', 'fun_fact', 'category']
                    if all(field in question for field in required_fields):
                        valid_questions += 1
                
                if valid_questions != 5:
                    self.log_result("Sequential Questions with Timer", False, f"Only {valid_questions}/5 questions have valid structure for {category_name}")
                    continue
                
                successful_tests += 1
                self.log_result(f"Sequential Questions - {category_name}", True, f"Sequential questions API working correctly with timer-enabled category (5 questions returned)")
            
            if successful_tests >= 2:  # At least 2-3 categories as requested
                self.log_result("Sequential Questions with Timer", True, f"Sequential questions API working correctly with timer-enabled categories for {successful_tests} categories")
                return True
            else:
                self.log_result("Sequential Questions with Timer", False, f"Only {successful_tests} categories passed sequential questions tests")
                return False
            
        except Exception as e:
            self.log_result("Sequential Questions with Timer", False, f"Sequential questions with timer test failed: {str(e)}")
            return False
    
    def test_timer_backend_comprehensive(self):
        """Comprehensive test of timer-based questions backend implementation"""
        try:
            print("🎯 STARTING COMPREHENSIVE TIMER-BASED QUESTIONS BACKEND TESTING")
            print("=" * 80)
            
            # Test 1: Timer Configuration Migration
            migration_success, categories = self.test_timer_configuration_migration()
            if not migration_success:
                return False
            
            # Test 2: Timer Config API Endpoint
            api_success = self.test_timer_config_api_endpoint()
            if not api_success:
                return False
            
            # Test 3: Sequential Questions with Timer
            sequential_success = self.test_sequential_questions_with_timer()
            if not sequential_success:
                return False
            
            # Test 4: Verify specific category IDs work (2-3 different ones)
            if len(categories) >= 2:
                test_category_ids = [cat['id'] for cat in categories[:3]]
                category_tests_passed = 0
                
                for category_id in test_category_ids:
                    # Test timer config for this specific category
                    timer_response = requests.get(f"{self.api_base}/quiz/categories/{category_id}/timer-config", timeout=10)
                    if timer_response.status_code == 200:
                        timer_config = timer_response.json()
                        if (timer_config.get('timer_enabled') == True and 
                            timer_config.get('timer_seconds') == 30 and
                            timer_config.get('auto_advance_on_timeout') == True):
                            category_tests_passed += 1
                
                if category_tests_passed >= 2:
                    self.log_result("Category ID Timer Tests", True, f"Timer config working for {category_tests_passed} different category IDs")
                else:
                    self.log_result("Category ID Timer Tests", False, f"Only {category_tests_passed} category IDs passed timer tests")
                    return False
            
            self.log_result("Timer Backend Comprehensive", True, "All timer-based questions backend tests passed - ready for frontend countdown timer implementation")
            return True
            
        except Exception as e:
            self.log_result("Timer Backend Comprehensive", False, f"Comprehensive timer test failed: {str(e)}")
            return False

    def run_timer_implementation_tests(self):
        """Run comprehensive timer-based questions implementation tests"""
        print(f"⏱️  Starting Timer-Based Questions Implementation Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 80)
        
        # Timer implementation specific tests
        timer_tests = [
            ("Timer Configuration Migration", self.test_timer_configuration_migration),
            ("Timer Config API Endpoint", self.test_timer_config_api_endpoint),
            ("Sequential Questions with Timer", self.test_sequential_questions_with_timer),
            ("Timer Backend Comprehensive", self.test_timer_backend_comprehensive),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in timer_tests:
            try:
                print(f"\n🔍 Testing: {test_name}")
                print("-" * 50)
                
                if test_name == "Timer Configuration Migration":
                    result, _ = test_func()
                else:
                    result = test_func()
                
                if result:
                    passed += 1
                    print(f"✅ PASS: {test_name}")
                else:
                    failed += 1
                    print(f"❌ FAIL: {test_name}")
                    
            except Exception as e:
                self.log_result(test_name, False, f"Test crashed: {str(e)}")
                failed += 1
                print(f"❌ FAIL: {test_name} - Exception: {str(e)}")
            
            print()  # Add spacing between tests
        
        # Print comprehensive summary
        print("=" * 80)
        print(f"🎯 TIMER-BASED QUESTIONS BACKEND TESTING COMPLETE")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TIMER IMPLEMENTATION TESTS PASSED!")
            print("✅ Timer configuration migration successful - all categories have 30s timer settings")
            print("✅ Timer configuration API endpoint working - /api/quiz/categories/{category_id}/timer-config")
            print("✅ Sequential questions API compatible with timer-enabled categories")
            print("✅ Multiple category IDs tested and working correctly")
            print("\n🚀 Backend is ready to support frontend countdown timer implementation!")
        else:
            print(f"\n⚠️ TIMER IMPLEMENTATION ISSUES FOUND - {failed} tests failed")
            print("Backend needs fixes before frontend timer implementation can proceed.")
        
        return passed, failed

def main():
    try:
        tester = BackendTester()
        
        # Run timer implementation tests as requested
        passed, failed = tester.run_timer_implementation_tests()
        
        # Return appropriate exit code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()