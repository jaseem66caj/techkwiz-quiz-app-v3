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
        """Test admin authentication flow"""
        try:
            # Try the test admin credentials we created
            test_credentials = {
                "username": "testadmin",
                "password": "testpass123"
            }
            
            login_response = requests.post(
                f"{self.api_base}/admin/login",
                json=test_credentials,
                timeout=10
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                if 'access_token' in token_data:
                    self.log_result("Admin Authentication", True, f"Admin login successful with {test_credentials['username']}")
                    return True, token_data['access_token']
            
            # If test credentials don't work, try common admin credentials
            common_credentials = [
                {"username": "admin", "password": "admin123"},
                {"username": "techkwiz_admin", "password": "admin123456"},
                {"username": "admin", "password": "password123"},
                {"username": "admin", "password": "admin"},
            ]
            
            # Try to login with existing credentials
            for creds in common_credentials:
                login_response = requests.post(
                    f"{self.api_base}/admin/login",
                    json=creds,
                    timeout=10
                )
                
                if login_response.status_code == 200:
                    token_data = login_response.json()
                    if 'access_token' in token_data:
                        self.log_result("Admin Authentication", True, f"Admin login successful with {creds['username']}")
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
    
    def test_backend_integration_protection(self, token):
        """Test that new endpoints are properly protected with admin authentication"""
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
    
    def run_all_tests(self):
        """Run all backend tests including enhanced admin dashboard features"""
        print(f"🚀 Starting Enhanced Admin Dashboard Backend Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 60)
        
        # Get admin token first
        auth_success, admin_token = self.test_admin_authentication()
        
        tests = [
            self.test_environment_configuration,
            self.test_backend_health,
            self.test_cors_configuration,
            self.test_api_route_prefix,
            self.test_status_api_post,
            self.test_status_api_get,
            self.test_mongodb_connection,
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
        
        print(f"\n📊 Enhanced Admin Dashboard Test Summary:")
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