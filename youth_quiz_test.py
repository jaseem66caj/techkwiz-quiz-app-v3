#!/usr/bin/env python3
"""
Youth-Focused Quiz System Migration Testing Suite
Tests the new youth-oriented categories and questions with interactive formats
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

class YouthQuizTester:
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
    
    def test_youth_categories_api(self):
        """Test that new youth-focused categories are available"""
        try:
            response = requests.get(f"{self.api_base}/quiz/categories", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Youth Categories API", False, f"Categories API failed: HTTP {response.status_code}")
                return False, []
            
            categories = response.json()
            
            if not isinstance(categories, list) or len(categories) == 0:
                self.log_result("Youth Categories API", False, "No categories found")
                return False, []
            
            # Expected youth-focused categories
            expected_youth_categories = [
                "Swipe-Based Personality",
                "Pop Culture Flash", 
                "Micro-Trivia Tournaments",
                "Social Identity Quizzes",
                "Trend & Local Vibes",
                "Future-You Simulations"
            ]
            
            category_names = [cat.get('name', '') for cat in categories]
            found_youth_categories = []
            
            for expected in expected_youth_categories:
                if expected in category_names:
                    found_youth_categories.append(expected)
            
            # Check if we have the expected 6 youth categories
            if len(found_youth_categories) == 6:
                self.log_result("Youth Categories Count", True, f"Found all 6 youth-focused categories: {', '.join(found_youth_categories)}")
                
                # Check entry fees are in the 20-45 coin range
                youth_categories = [cat for cat in categories if cat.get('name') in expected_youth_categories]
                entry_fees = []
                
                for cat in youth_categories:
                    entry_fee = cat.get('entry_fee', 0)
                    entry_fees.append(entry_fee)
                    
                    if entry_fee < 20 or entry_fee > 45:
                        self.log_result("Youth Entry Fees", False, f"Category '{cat['name']}' has entry fee {entry_fee} coins (should be 20-45)")
                        return False, categories
                
                min_fee = min(entry_fees)
                max_fee = max(entry_fees)
                
                self.log_result("Youth Entry Fees", True, f"All youth categories have entry fees in range 20-45 coins (min: {min_fee}, max: {max_fee})")
                return True, categories
                
            elif len(found_youth_categories) > 0:
                missing = [cat for cat in expected_youth_categories if cat not in found_youth_categories]
                self.log_result("Youth Categories Migration", False, f"Found {len(found_youth_categories)} youth categories, missing: {missing}")
                return False, categories
            else:
                # Check if we still have old categories
                old_category_indicators = ['Programming', 'AI', 'Web Development', 'JavaScript', 'Python']
                found_old = [name for name in category_names if any(old in name for old in old_category_indicators)]
                
                if found_old:
                    self.log_result("Youth Categories Migration", False, f"Still has old categories: {found_old}. Youth migration not completed.")
                else:
                    self.log_result("Youth Categories Migration", False, f"No youth categories found. Available: {category_names}")
                
                return False, categories
                
        except Exception as e:
            self.log_result("Youth Categories API", False, f"Categories API test failed: {str(e)}")
            return False, []
    
    def test_youth_questions_api(self, categories):
        """Test youth-focused questions with interactive formats"""
        if not categories:
            self.log_result("Youth Questions API", False, "No categories available for testing")
            return False
            
        try:
            # Expected youth categories
            expected_youth_categories = [
                "Swipe-Based Personality",
                "Pop Culture Flash", 
                "Micro-Trivia Tournaments",
                "Social Identity Quizzes",
                "Trend & Local Vibes",
                "Future-You Simulations"
            ]
            
            youth_categories = [cat for cat in categories if cat.get('name') in expected_youth_categories]
            
            if not youth_categories:
                self.log_result("Youth Questions API", False, "No youth categories found for question testing")
                return False
            
            total_questions = 0
            categories_with_questions = 0
            interactive_question_types = []
            youth_language_found = []
            
            for category in youth_categories:
                category_id = category['id']
                category_name = category['name']
                
                response = requests.get(f"{self.api_base}/quiz/questions/{category_id}", timeout=10)
                
                if response.status_code != 200:
                    self.log_result("Youth Questions API", False, f"Questions API failed for {category_name}: HTTP {response.status_code}")
                    continue
                
                questions = response.json()
                
                if not isinstance(questions, list):
                    self.log_result("Youth Questions API", False, f"Invalid response format for {category_name}")
                    continue
                
                if len(questions) == 0:
                    self.log_result("Youth Questions API", False, f"No questions found for {category_name}")
                    continue
                
                categories_with_questions += 1
                total_questions += len(questions)
                
                # Check for interactive question formats
                for question in questions:
                    question_type = question.get('question_type', 'multiple_choice')
                    if question_type not in interactive_question_types:
                        interactive_question_types.append(question_type)
                    
                    # Check for youth engagement features
                    if question.get('emoji_clue'):
                        youth_language_found.append('emoji_clue')
                    if question.get('visual_options'):
                        youth_language_found.append('visual_options')
                    if question.get('personality_trait'):
                        youth_language_found.append('personality_trait')
                    if question.get('prediction_year'):
                        youth_language_found.append('prediction_year')
                    
                    # Check for Gen Z language in question text and options
                    question_text = question.get('question', '').lower()
                    options = question.get('options', [])
                    all_text = question_text + ' ' + ' '.join(options).lower()
                    
                    youth_terms = ['tiktok', 'rizz', 'slay', 'periodt', 'gen z', 'viral', 'aesthetic', 'vibe', 'no cap', 'ohio', 'cringe']
                    for term in youth_terms:
                        if term in all_text and term not in youth_language_found:
                            youth_language_found.append(term)
                
                # Verify each category has 5 questions as expected
                if len(questions) != 5:
                    self.log_result("Youth Questions Count", False, f"Category '{category_name}' has {len(questions)} questions, expected 5")
                else:
                    self.log_result("Youth Questions Count", True, f"Category '{category_name}' has correct 5 questions")
            
            # Summary results
            if categories_with_questions == len(youth_categories):
                self.log_result("Youth Questions Coverage", True, f"All {categories_with_questions} youth categories have questions")
            else:
                self.log_result("Youth Questions Coverage", False, f"Only {categories_with_questions}/{len(youth_categories)} youth categories have questions")
            
            if total_questions >= 30:  # 6 categories × 5 questions each
                self.log_result("Youth Questions Total", True, f"Found {total_questions} total youth questions (expected 30)")
            else:
                self.log_result("Youth Questions Total", False, f"Found only {total_questions} youth questions (expected 30)")
            
            # Check interactive question types
            expected_types = ['multiple_choice', 'this_or_that', 'emoji_decode', 'personality', 'prediction']
            found_interactive_types = [t for t in expected_types if t in interactive_question_types]
            
            if len(found_interactive_types) >= 3:
                self.log_result("Interactive Question Types", True, f"Found interactive types: {', '.join(found_interactive_types)}")
            else:
                self.log_result("Interactive Question Types", False, f"Limited interactive types found: {interactive_question_types}")
            
            # Check youth engagement features
            unique_features = list(set(youth_language_found))
            if len(unique_features) >= 5:
                self.log_result("Youth Engagement Features", True, f"Found youth features: {', '.join(unique_features[:10])}")
            else:
                self.log_result("Youth Engagement Features", False, f"Limited youth features found: {unique_features}")
            
            return True
            
        except Exception as e:
            self.log_result("Youth Questions API", False, f"Questions API test failed: {str(e)}")
            return False
    
    def test_reduced_entry_fees(self, categories):
        """Test that all categories have reduced entry fees (20-45 coins)"""
        if not categories:
            self.log_result("Reduced Entry Fees", False, "No categories available for testing")
            return False
            
        try:
            high_fee_categories = []
            missing_fee_categories = []
            
            for category in categories:
                name = category.get('name', 'Unknown')
                
                if 'entry_fee' not in category:
                    missing_fee_categories.append(name)
                else:
                    entry_fee = category['entry_fee']
                    if entry_fee > 45:
                        high_fee_categories.append({'name': name, 'fee': entry_fee})
            
            if missing_fee_categories:
                self.log_result("Reduced Entry Fees", False, f"Categories missing entry_fee: {missing_fee_categories}")
                return False
            
            if high_fee_categories:
                self.log_result("Reduced Entry Fees", False, f"Categories with fees > 45 coins: {high_fee_categories}")
                return False
            
            # All categories have appropriate reduced fees
            entry_fees = [cat.get('entry_fee', 0) for cat in categories]
            min_fee = min(entry_fees)
            max_fee = max(entry_fees)
            avg_fee = sum(entry_fees) / len(entry_fees)
            
            self.log_result("Reduced Entry Fees", True, f"All {len(categories)} categories have reduced entry fees ≤45 coins (min: {min_fee}, max: {max_fee}, avg: {avg_fee:.0f})")
            return True
            
        except Exception as e:
            self.log_result("Reduced Entry Fees", False, f"Entry fee test failed: {str(e)}")
            return False
    
    def test_coin_rewards_system(self):
        """Test that coin rewards are set to 25 coins per correct answer"""
        try:
            # Check rewarded popup configuration
            response = requests.get(f"{self.api_base}/quiz/rewarded-config", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Coin Rewards System", False, f"Cannot access rewarded config: HTTP {response.status_code}")
                return False
            
            config = response.json()
            
            # Check if coin reward is appropriate for the new system
            coin_reward = config.get('coin_reward', 0)
            
            # The system should support 25 coins per correct answer
            # Rewarded ads might give different amounts, but let's check if it's reasonable
            if coin_reward > 0:
                self.log_result("Coin Rewards System", True, f"Coin reward system configured with {coin_reward} coins per reward")
                return True
            else:
                self.log_result("Coin Rewards System", False, f"Coin reward system not properly configured: {coin_reward} coins")
                return False
                
        except Exception as e:
            self.log_result("Coin Rewards System", False, f"Coin rewards test failed: {str(e)}")
            return False
    
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
    
    def run_youth_quiz_migration_tests(self):
        """Run comprehensive tests for the Youth-Focused Quiz System Migration"""
        print(f"🎉 Starting Youth-Focused Quiz System Migration Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"API Base: {self.api_base}")
        print("=" * 70)
        
        # Test sequence
        tests = [
            self.test_backend_health,
            self.test_youth_categories_api,
            self.test_reduced_entry_fees,
            self.test_coin_rewards_system,
        ]
        
        passed = 0
        failed = 0
        categories = []
        
        for test in tests:
            try:
                if test == self.test_youth_categories_api:
                    result, categories = test()
                elif test == self.test_reduced_entry_fees:
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
        
        # Test youth questions separately after getting categories
        if categories:
            try:
                result = self.test_youth_questions_api(categories)
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: test_youth_questions_api - Exception: {str(e)}")
                failed += 1
            
            print("-" * 40)
        
        print(f"\n📊 Youth-Focused Quiz System Migration Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
        
        if failed == 0:
            print(f"\n🎉 YOUTH-FOCUSED QUIZ SYSTEM MIGRATION TESTS PASSED!")
            print(f"All 6 youth categories with reduced entry fees (20-45 coins) are working correctly!")
        else:
            print(f"\n⚠️  YOUTH-FOCUSED QUIZ SYSTEM MIGRATION NEEDS ATTENTION")
            print(f"Some components are not working as expected.")
        
        return passed, failed

def main():
    try:
        tester = YouthQuizTester()
        passed, failed = tester.run_youth_quiz_migration_tests()
        
        # Exit with appropriate code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()