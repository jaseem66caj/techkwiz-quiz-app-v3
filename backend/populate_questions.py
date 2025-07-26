#!/usr/bin/env python3
"""
Comprehensive Quiz Questions Population Script
Populates the database with extensive questions for all categories
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Comprehensive quiz questions for all categories
QUIZ_QUESTIONS = {
    "programming": [
        {
            "id": "prog_001",
            "question": "Which of the following is NOT a JavaScript data type?",
            "options": ["String", "Boolean", "Float", "Number"],
            "correct_answer": 2,
            "difficulty": "beginner",
            "fun_fact": "JavaScript has 7 primitive data types: string, number, boolean, null, undefined, symbol, and bigint.",
            "category": "programming",
            "subcategory": "JavaScript"
        },
        {
            "id": "prog_002",
            "question": "What does HTML stand for?",
            "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
            "correct_answer": 0,
            "difficulty": "beginner",
            "fun_fact": "HTML was invented by Tim Berners-Lee in 1993 and is the standard markup language for creating web pages.",
            "category": "programming",
            "subcategory": "Web Development"
        },
        {
            "id": "prog_003",
            "question": "Which Python keyword is used to define a function?",
            "options": ["function", "def", "define", "func"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Python's 'def' keyword comes from 'define', making function definition clear and readable.",
            "category": "programming",
            "subcategory": "Python"
        },
        {
            "id": "prog_004",
            "question": "What is the time complexity of binary search?",
            "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            "correct_answer": 1,
            "difficulty": "intermediate",
            "fun_fact": "Binary search divides the search space in half with each comparison, achieving logarithmic time complexity.",
            "category": "programming",
            "subcategory": "Algorithms"
        },
        {
            "id": "prog_005",
            "question": "Which design pattern ensures a class has only one instance?",
            "options": ["Factory", "Observer", "Singleton", "Strategy"],
            "correct_answer": 2,
            "difficulty": "intermediate",
            "fun_fact": "The Singleton pattern is useful for database connections, logging, and configuration settings.",
            "category": "programming",
            "subcategory": "Design Patterns"
        },
        {
            "id": "prog_006",
            "question": "What does CSS stand for?",
            "options": ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "CSS was first proposed by Håkon Wium Lie in 1994 to separate content from presentation.",
            "category": "programming",
            "subcategory": "CSS"
        },
        {
            "id": "prog_007",
            "question": "Which HTTP status code indicates 'Not Found'?",
            "options": ["200", "404", "500", "301"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "The 404 error is named after room 404 at CERN where the first web server was located.",
            "category": "programming",
            "subcategory": "Web Development"
        },
        {
            "id": "prog_008",
            "question": "What is React primarily used for?",
            "options": ["Backend development", "Database management", "Building user interfaces", "Server configuration"],
            "correct_answer": 2,
            "difficulty": "beginner",
            "fun_fact": "React was created by Facebook and is now maintained by Meta and the open-source community.",
            "category": "programming",
            "subcategory": "React"
        }
    ],
    "ai": [
        {
            "id": "ai_001",
            "question": "What does 'AI' stand for in technology?",
            "options": ["Advanced Intelligence", "Artificial Intelligence", "Automated Intelligence", "Algorithmic Intelligence"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "The term 'Artificial Intelligence' was coined by John McCarthy in 1956 at the Dartmouth Conference.",
            "category": "ai",
            "subcategory": "Fundamentals"
        },
        {
            "id": "ai_002",
            "question": "Which algorithm is commonly used for training neural networks?",
            "options": ["Gradient Descent", "Bubble Sort", "Binary Search", "Dijkstra's Algorithm"],
            "correct_answer": 0,
            "difficulty": "intermediate",
            "fun_fact": "Gradient descent optimizes neural networks by iteratively moving in the direction of steepest descent.",
            "category": "ai",
            "subcategory": "Machine Learning"
        },
        {
            "id": "ai_003",
            "question": "What is the main purpose of a neural network's activation function?",
            "options": ["Store data", "Introduce non-linearity", "Reduce memory usage", "Increase speed"],
            "correct_answer": 1,
            "difficulty": "intermediate",
            "fun_fact": "Without activation functions, neural networks would just be linear regression models.",
            "category": "ai",
            "subcategory": "Neural Networks"
        },
        {
            "id": "ai_004",
            "question": "What does 'NLP' stand for in AI?",
            "options": ["Neural Language Processing", "Natural Language Processing", "Network Learning Protocol", "New Learning Paradigm"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "NLP enables computers to understand, interpret, and generate human language.",
            "category": "ai",
            "subcategory": "NLP"
        },
        {
            "id": "ai_005",
            "question": "Which type of machine learning learns without labeled data?",
            "options": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Semi-supervised Learning"],
            "correct_answer": 1,
            "difficulty": "intermediate",
            "fun_fact": "Unsupervised learning finds hidden patterns in data without human guidance.",
            "category": "ai",
            "subcategory": "Machine Learning"
        }
    ],
    "web-dev": [
        {
            "id": "web_001",
            "question": "Which HTML tag is used for the largest heading?",
            "options": ["<h6>", "<h1>", "<header>", "<head>"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "HTML headings range from <h1> (largest) to <h6> (smallest) for proper document structure.",
            "category": "web-dev",
            "subcategory": "HTML"
        },
        {
            "id": "web_002",
            "question": "What is the purpose of the CSS 'flexbox' layout?",
            "options": ["Create animations", "Arrange items in a flexible container", "Handle user input", "Store data"],
            "correct_answer": 1,
            "difficulty": "intermediate",
            "fun_fact": "Flexbox revolutionized CSS layouts by making it easy to create responsive designs.",
            "category": "web-dev",
            "subcategory": "CSS"
        },
        {
            "id": "web_003",
            "question": "Which JavaScript method adds an element to the end of an array?",
            "options": ["append()", "push()", "add()", "insert()"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "The push() method modifies the original array and returns the new length.",
            "category": "web-dev",
            "subcategory": "JavaScript"
        },
        {
            "id": "web_004",
            "question": "What does API stand for?",
            "options": ["Application Programming Interface", "Automated Program Integration", "Advanced Programming Instructions", "Application Process Integration"],
            "correct_answer": 0,
            "difficulty": "beginner",
            "fun_fact": "APIs allow different software applications to communicate with each other.",
            "category": "web-dev",
            "subcategory": "APIs"
        },
        {
            "id": "web_005",
            "question": "Which HTTP method is used to retrieve data?",
            "options": ["POST", "PUT", "GET", "DELETE"],
            "correct_answer": 2,
            "difficulty": "beginner",
            "fun_fact": "GET requests should be safe and idempotent, meaning they don't change server state.",
            "category": "web-dev",
            "subcategory": "HTTP"
        }
    ],
    "mobile-dev": [
        {
            "id": "mobile_001",
            "question": "Which language is primarily used for iOS app development?",
            "options": ["Java", "Swift", "Python", "JavaScript"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Swift was introduced by Apple in 2014 as a modern replacement for Objective-C.",
            "category": "mobile-dev",
            "subcategory": "iOS"
        },
        {
            "id": "mobile_002",
            "question": "What is React Native primarily used for?",
            "options": ["Web development", "Cross-platform mobile app development", "Backend services", "Database management"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "React Native allows developers to build mobile apps using React and JavaScript for both iOS and Android.",
            "category": "mobile-dev",
            "subcategory": "React Native"
        },
        {
            "id": "mobile_003",
            "question": "Which programming language is used for Android app development?",
            "options": ["Swift", "Kotlin", "Ruby", "PHP"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Kotlin became Google's preferred language for Android development in 2019.",
            "category": "mobile-dev",
            "subcategory": "Android"
        },
        {
            "id": "mobile_004",
            "question": "What is Flutter developed by?",
            "options": ["Facebook", "Google", "Apple", "Microsoft"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Flutter uses Dart programming language and can compile to native code for multiple platforms.",
            "category": "mobile-dev",
            "subcategory": "Flutter"
        }
    ],
    "data-science": [
        {
            "id": "data_001",
            "question": "Which Python library is most commonly used for data manipulation?",
            "options": ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Pandas provides data structures and tools for effective data manipulation and analysis.",
            "category": "data-science",
            "subcategory": "Python"
        },
        {
            "id": "data_002",
            "question": "What does SQL stand for?",
            "options": ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
            "correct_answer": 0,
            "difficulty": "beginner",
            "fun_fact": "SQL was developed by IBM in the 1970s and became an ANSI standard in 1986.",
            "category": "data-science",
            "subcategory": "SQL"
        },
        {
            "id": "data_003",
            "question": "Which statistical measure represents the middle value in a dataset?",
            "options": ["Mean", "Mode", "Median", "Range"],
            "correct_answer": 2,
            "difficulty": "beginner",
            "fun_fact": "The median is less affected by outliers compared to the mean.",
            "category": "data-science",
            "subcategory": "Statistics"
        },
        {
            "id": "data_004",
            "question": "What is the primary purpose of data visualization?",
            "options": ["Store data", "Analyze patterns", "Communicate insights", "Clean data"],
            "correct_answer": 2,
            "difficulty": "beginner",
            "fun_fact": "Good data visualization can reveal patterns that might be missed in raw data.",
            "category": "data-science",
            "subcategory": "Visualization"
        }
    ],
    "cybersecurity": [
        {
            "id": "cyber_001",
            "question": "What does 'phishing' refer to in cybersecurity?",
            "options": ["Network monitoring", "Fraudulent attempts to obtain sensitive information", "Data encryption", "Firewall configuration"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Phishing attacks often use fake emails or websites that look legitimate to steal credentials.",
            "category": "cybersecurity",
            "subcategory": "Social Engineering"
        },
        {
            "id": "cyber_002",
            "question": "What is the purpose of encryption?",
            "options": ["Speed up data transfer", "Protect data confidentiality", "Reduce file size", "Improve network performance"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Encryption transforms readable data into coded form that can only be decoded with the correct key.",
            "category": "cybersecurity",
            "subcategory": "Cryptography"
        },
        {
            "id": "cyber_003",
            "question": "What does VPN stand for?",
            "options": ["Virtual Private Network", "Very Personal Network", "Verified Protection Network", "Variable Proxy Network"],
            "correct_answer": 0,
            "difficulty": "beginner",
            "fun_fact": "VPNs create secure, encrypted connections over public networks.",
            "category": "cybersecurity",
            "subcategory": "Network Security"
        },
        {
            "id": "cyber_004",
            "question": "What is ethical hacking?",
            "options": ["Illegal system access", "Authorized security testing", "Data theft", "Virus creation"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Ethical hackers, also called white hat hackers, help organizations find and fix security vulnerabilities.",
            "category": "cybersecurity",
            "subcategory": "Ethical Hacking"
        }
    ],
    "cloud": [
        {
            "id": "cloud_001",
            "question": "What does AWS stand for?",
            "options": ["Amazon Web Services", "Advanced Web Solutions", "Automated Web Systems", "Amazon Website Solutions"],
            "correct_answer": 0,
            "difficulty": "beginner",
            "fun_fact": "AWS was launched in 2006 and is now the world's largest cloud computing platform.",
            "category": "cloud",
            "subcategory": "AWS"
        },
        {
            "id": "cloud_002",
            "question": "Which cloud service model provides the most control over the infrastructure?",
            "options": ["SaaS", "PaaS", "IaaS", "FaaS"],
            "correct_answer": 2,
            "difficulty": "intermediate",
            "fun_fact": "IaaS (Infrastructure as a Service) gives users control over operating systems and applications.",
            "category": "cloud",
            "subcategory": "Cloud Models"
        },
        {
            "id": "cloud_003",
            "question": "What is Docker primarily used for?",
            "options": ["Database management", "Containerization", "Web design", "Network security"],
            "correct_answer": 1,
            "difficulty": "intermediate",
            "fun_fact": "Docker containers package applications with all their dependencies for consistent deployment.",
            "category": "cloud",
            "subcategory": "Docker"
        },
        {
            "id": "cloud_004",
            "question": "What does Kubernetes orchestrate?",
            "options": ["Databases", "Containers", "Networks", "Files"],
            "correct_answer": 1,
            "difficulty": "intermediate",
            "fun_fact": "Kubernetes automates the deployment, scaling, and management of containerized applications.",
            "category": "cloud",
            "subcategory": "Kubernetes"
        }
    ],
    "blockchain": [
        {
            "id": "blockchain_001",
            "question": "What is a blockchain?",
            "options": ["A type of database", "A distributed ledger", "A programming language", "A web browser"],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "Blockchain technology was first described in 2008 by an unknown person using the name Satoshi Nakamoto.",
            "category": "blockchain",
            "subcategory": "Fundamentals"
        },
        {
            "id": "blockchain_002",
            "question": "What is Bitcoin?",
            "options": ["A company", "A programming language", "A cryptocurrency", "A web framework"],
            "correct_answer": 2,
            "difficulty": "beginner",
            "fun_fact": "Bitcoin was the first successful cryptocurrency, launched in 2009.",
            "category": "blockchain",
            "subcategory": "Bitcoin"
        },
        {
            "id": "blockchain_003",
            "question": "What are smart contracts?",
            "options": ["Legal documents", "Self-executing contracts with code", "Traditional contracts", "Insurance policies"],
            "correct_answer": 1,
            "difficulty": "intermediate",
            "fun_fact": "Smart contracts automatically execute when predetermined conditions are met.",
            "category": "blockchain",
            "subcategory": "Smart Contracts"
        },
        {
            "id": "blockchain_004",
            "question": "What does DeFi stand for?",
            "options": ["Decentralized Finance", "Digital Finance", "Distributed Finance", "Direct Finance"],
            "correct_answer": 0,
            "difficulty": "intermediate",
            "fun_fact": "DeFi aims to recreate traditional financial systems using blockchain technology.",
            "category": "blockchain",
            "subcategory": "DeFi"
        }
    ]
}

async def populate_questions():
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[os.environ.get('DB_NAME', 'test_database')]
    
    total_added = 0
    
    for category_id, questions in QUIZ_QUESTIONS.items():
        for question in questions:
            # Add timestamp
            question['created_at'] = datetime.now().isoformat()
            question['updated_at'] = datetime.now().isoformat()
            
            # Insert or update question
            await db.quiz_questions.update_one(
                {'id': question['id']},
                {'$set': question},
                upsert=True
            )
            total_added += 1
            print(f"✅ Added/Updated: {question['question'][:50]}...")
    
    print(f"\n🎉 Successfully populated {total_added} questions across all categories!")
    
    # Print summary
    for category_id in QUIZ_QUESTIONS.keys():
        count = await db.quiz_questions.count_documents({'category': category_id})
        print(f"📊 {category_id}: {count} questions")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_questions())