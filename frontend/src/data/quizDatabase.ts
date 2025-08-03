// Comprehensive Quiz Database with Original Content
// 50+ questions across 8 categories with multiple difficulty levels

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  fun_fact: string
  category: string
  subcategory: string
}

export interface QuizCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  subcategories: string[]
  entry_fee: number
  prize_pool: number
}

export const QUIZ_CATEGORIES: Record<string, QuizCategory> = {
  'swipe-personality': {
    id: 'swipe-personality',
    name: 'Swipe-Based Personality',
    icon: '🎉',
    color: 'from-pink-500 to-purple-600',
    description: 'Discover your vibe through rapid-fire choices',
    subcategories: ['Aesthetic', 'Lifestyle', 'Values', 'Preferences'],
    entry_fee: 25,
    prize_pool: 500,
  },
  'pop-culture-flash': {
    id: 'pop-culture-flash',
    name: 'Pop Culture Flash',
    icon: '🎬',
    color: 'from-red-500 to-pink-600',
    description: 'Decode trends and viral moments',
    subcategories: ['TikTok', 'Music', 'Celebrities', 'Memes'],
    entry_fee: 30,
    prize_pool: 600,
  },
  'micro-trivia': {
    id: 'micro-trivia',
    name: 'Micro-Trivia Tournaments',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-600',
    description: 'Lightning-fast knowledge battles',
    subcategories: ['Random Facts', 'Quick Fire', 'Brain Teasers', 'Speed Round'],
    entry_fee: 20,
    prize_pool: 400,
  },
  'social-identity': {
    id: 'social-identity',
    name: 'Social Identity Quizzes',
    icon: '🤳',
    color: 'from-purple-500 to-indigo-600',
    description: 'Find your digital persona match',
    subcategories: ['Influencer Type', 'Content Style', 'Social Vibe', 'Online Persona'],
    entry_fee: 35,
    prize_pool: 700,
  },
  'trend-vibes': {
    id: 'trend-vibes',
    name: 'Trend & Local Vibes',
    icon: '🎯',
    color: 'from-orange-500 to-yellow-600',
    description: 'Stay plugged into what\'s viral',
    subcategories: ['TikTok Slang', 'Viral Trends', 'Local Culture', 'Gen Z Language'],
    entry_fee: 40,
    prize_pool: 800,
  },
  'future-you': {
    id: 'future-you',
    name: 'Future-You Simulations',
    icon: '🔮',
    color: 'from-green-500 to-teal-600',
    description: 'Predict your path and tech trends',
    subcategories: ['Career Paths', 'Tech Future', 'Life Predictions', 'AI vs Human'],
    entry_fee: 45,
    prize_pool: 900,
  },
}

export const QUIZ_DATABASE: Record<string, QuizQuestion[]> = {
  programming: [
    // Beginner Level
    {
      id: 'prog_001',
      question: 'Which of the following is NOT a JavaScript data type?',
      options: ['String', 'Boolean', 'Float', 'Number'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'JavaScript has 7 primitive data types: string, number, boolean, null, undefined, symbol, and bigint.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_002',
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'HTML was first developed by Tim Berners-Lee in 1990 at CERN.',
      category: 'programming',
      subcategory: 'HTML'
    },
    {
      id: 'prog_003',
      question: 'Which symbol is used for single-line comments in Python?',
      options: ['//', '#', '/*', '--'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Python uses # for single-line comments and triple quotes for multi-line comments.',
      category: 'programming',
      subcategory: 'Python'
    },
    {
      id: 'prog_004',
      question: 'What is the correct way to declare a variable in JavaScript?',
      options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'JavaScript also supports let and const keywords for variable declaration with different scoping rules.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_005',
      question: 'Which language is known as the "mother of all programming languages"?',
      options: ['Assembly', 'C', 'FORTRAN', 'COBOL'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'C was developed by Dennis Ritchie at Bell Labs between 1969 and 1973.',
      category: 'programming',
      subcategory: 'C'
    },
    
    // Intermediate Level
    {
      id: 'prog_006',
      question: 'What does the "this" keyword refer to in JavaScript?',
      options: ['The current function', 'The current object', 'The global object', 'It depends on the context'],
      correct_answer: 3,
      difficulty: 'intermediate',
      fun_fact: 'The "this" keyword in JavaScript refers to different objects depending on how it\'s called.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_007',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Binary search works by repeatedly dividing the search interval in half.',
      category: 'programming',
      subcategory: 'Algorithms'
    },
    {
      id: 'prog_008',
      question: 'Which design pattern ensures a class has only one instance?',
      options: ['Factory', 'Observer', 'Singleton', 'Strategy'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'The Singleton pattern is useful for logging, driver objects, caching, and thread pools.',
      category: 'programming',
      subcategory: 'Design Patterns'
    },
    {
      id: 'prog_009',
      question: 'What is the difference between == and === in JavaScript?',
      options: ['No difference', '== checks type, === checks value', '=== checks both type and value', '== is deprecated'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: '=== is called strict equality operator and performs no type conversion.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_010',
      question: 'Which method is used to add elements to the end of an array in Python?',
      options: ['push()', 'append()', 'add()', 'insert()'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Python lists also have extend() method to add multiple elements at once.',
      category: 'programming',
      subcategory: 'Python'
    },
    
    // Advanced Level
    {
      id: 'prog_011',
      question: 'What is a closure in JavaScript?',
      options: ['A way to close a function', 'A function that has access to outer scope variables', 'A method to close loops', 'A type of callback'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'Closures are created every time a function is created, at function creation time.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_012',
      question: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'QuickSort\'s worst case occurs when the pivot is always the smallest or largest element.',
      category: 'programming',
      subcategory: 'Algorithms'
    }
  ],

  ai: [
    // Beginner Level
    {
      id: 'ai_001',
      question: 'What does AI stand for?',
      options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Intelligence', 'Algorithmic Intelligence'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The term "Artificial Intelligence" was coined by John McCarthy in 1956.',
      category: 'ai',
      subcategory: 'Fundamentals'
    },
    {
      id: 'ai_002',
      question: 'Which of these is a type of machine learning?',
      options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'All of the above'],
      correct_answer: 3,
      difficulty: 'beginner',
      fun_fact: 'Machine learning is broadly categorized into these three main types.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_003',
      question: 'What is the primary goal of machine learning?',
      options: ['To replace humans', 'To learn patterns from data', 'To create robots', 'To increase speed'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Machine learning enables computers to learn without being explicitly programmed.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_004',
      question: 'Which company developed ChatGPT?',
      options: ['Google', 'Microsoft', 'OpenAI', 'Meta'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'OpenAI was founded in 2015 by Sam Altman, Elon Musk, and others.',
      category: 'ai',
      subcategory: 'Companies'
    },
    {
      id: 'ai_005',
      question: 'What does NLP stand for in AI?',
      options: ['Natural Language Processing', 'Neural Learning Process', 'Network Layer Protocol', 'Numeric Logic Programming'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'NLP helps computers understand, interpret, and generate human language.',
      category: 'ai',
      subcategory: 'NLP'
    },
    
    // Intermediate Level
    {
      id: 'ai_006',
      question: 'What is overfitting in machine learning?',
      options: ['Model is too simple', 'Model performs well on training but poorly on new data', 'Model has too few parameters', 'Model trains too slowly'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Overfitting can be reduced using techniques like cross-validation and regularization.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_007',
      question: 'Which activation function is commonly used in hidden layers?',
      options: ['Sigmoid', 'ReLU', 'Tanh', 'Softmax'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'ReLU helps solve the vanishing gradient problem in deep networks.',
      category: 'ai',
      subcategory: 'Neural Networks'
    },
    {
      id: 'ai_008',
      question: 'What is the purpose of backpropagation?',
      options: ['Feed data forward', 'Calculate gradients and update weights', 'Initialize weights', 'Prevent overfitting'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Backpropagation is the backbone of training deep neural networks.',
      category: 'ai',
      subcategory: 'Neural Networks'
    },
    {
      id: 'ai_009',
      question: 'Which algorithm is used for clustering?',
      options: ['Linear Regression', 'K-Means', 'Decision Tree', 'Logistic Regression'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'K-Means is an unsupervised learning algorithm that groups similar data points.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_010',
      question: 'What is a transformer in deep learning?',
      options: ['A type of robot', 'An attention-based neural network architecture', 'A data preprocessing tool', 'A optimization algorithm'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Transformers revolutionized NLP and are the foundation of GPT and BERT models.',
      category: 'ai',
      subcategory: 'Deep Learning'
    },
    
    // Advanced Level
    {
      id: 'ai_011',
      question: 'What is the vanishing gradient problem?',
      options: ['Gradients become too large', 'Gradients become too small in deep networks', 'Gradients disappear entirely', 'Gradients become negative'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'This problem was a major obstacle in training deep networks before ReLU and other solutions.',
      category: 'ai',
      subcategory: 'Deep Learning'
    },
    {
      id: 'ai_012',
      question: 'What is the difference between GANs and VAEs?',
      options: ['No difference', 'GANs are generative, VAEs are discriminative', 'GANs use adversarial training, VAEs use variational inference', 'VAEs are newer than GANs'],
      correct_answer: 2,
      difficulty: 'advanced',
      fun_fact: 'Both are generative models but use different approaches to learn data distributions.',
      category: 'ai',
      subcategory: 'Deep Learning'
    }
  ],

  'web-dev': [
    // Beginner Level
    {
      id: 'web_001',
      question: 'What does CSS stand for?',
      options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'CSS was first proposed by Håkon Wium Lie in 1994.',
      category: 'web-dev',
      subcategory: 'CSS'
    },
    {
      id: 'web_002',
      question: 'Which HTTP status code indicates success?',
      options: ['404', '500', '200', '302'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'HTTP status codes starting with 2xx indicate success.',
      category: 'web-dev',
      subcategory: 'HTTP'
    },
    {
      id: 'web_003',
      question: 'Which HTML element is used for the largest heading?',
      options: ['<h6>', '<h1>', '<header>', '<title>'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'HTML headings go from <h1> (largest) to <h6> (smallest).',
      category: 'web-dev',
      subcategory: 'HTML'
    },
    {
      id: 'web_004',
      question: 'What is the purpose of the alt attribute in images?',
      options: ['To resize the image', 'To provide alternative text for accessibility', 'To add filters', 'To set image quality'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The alt attribute is crucial for screen readers and web accessibility.',
      category: 'web-dev',
      subcategory: 'HTML'
    },
    {
      id: 'web_005',
      question: 'Which method is used to make HTTP requests in modern JavaScript?',
      options: ['XMLHttpRequest', 'fetch()', 'ajax()', 'http()'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The fetch() API returns promises for easier async handling.',
      category: 'web-dev',
      subcategory: 'JavaScript'
    },
    
    // Intermediate Level
    {
      id: 'web_006',
      question: 'What is the Virtual DOM in React?',
      options: ['A real DOM element', 'A JavaScript representation of the real DOM', 'A browser API', 'A CSS framework'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Virtual DOM allows React to optimize rendering by batching updates.',
      category: 'web-dev',
      subcategory: 'React'
    },
    {
      id: 'web_007',
      question: 'What does CORS stand for?',
      options: ['Cross-Origin Resource Sharing', 'Cross-Object Resource System', 'Computer Origin Resource Security', 'Cross-Origin Request Security'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'CORS is a security feature implemented by web browsers.',
      category: 'web-dev',
      subcategory: 'Security'
    },
    {
      id: 'web_008',
      question: 'Which CSS property is used for flexbox layout?',
      options: ['display: flex', 'layout: flex', 'flex: true', 'flexbox: enable'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Flexbox provides a more efficient way to arrange and distribute items.',
      category: 'web-dev',
      subcategory: 'CSS'
    },
    {
      id: 'web_009',
      question: 'What is REST in web development?',
      options: ['A programming language', 'An architectural style for APIs', 'A database type', 'A JavaScript framework'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'REST stands for Representational State Transfer.',
      category: 'web-dev',
      subcategory: 'APIs'
    },
    {
      id: 'web_010',
      question: 'What is the purpose of webpack?',
      options: ['To pack web pages', 'To bundle JavaScript modules', 'To compress images', 'To test web applications'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Webpack is a module bundler that can transform and bundle assets.',
      category: 'web-dev',
      subcategory: 'Build Tools'
    },
    
    // Advanced Level
    {
      id: 'web_011',
      question: 'What is Server-Side Rendering (SSR)?',
      options: ['Rendering on the client', 'Rendering HTML on the server before sending to client', 'Rendering images on server', 'A type of API'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'SSR improves SEO and initial page load times.',
      category: 'web-dev',
      subcategory: 'Performance'
    },
    {
      id: 'web_012',
      question: 'What is the difference between localStorage and sessionStorage?',
      options: ['No difference', 'localStorage persists after browser close, sessionStorage doesn\'t', 'sessionStorage is larger', 'localStorage is newer'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'Both are part of the Web Storage API introduced in HTML5.',
      category: 'web-dev',
      subcategory: 'Browser APIs'
    }
  ],

  'mobile-dev': [
    // Beginner Level
    {
      id: 'mob_001',
      question: 'Which language is primarily used for iOS development?',
      options: ['Java', 'Swift', 'Python', 'C#'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Swift was introduced by Apple in 2014 to replace Objective-C.',
      category: 'mobile-dev',
      subcategory: 'iOS'
    },
    {
      id: 'mob_002',
      question: 'What is React Native?',
      options: ['A native mobile OS', 'A framework for building mobile apps using React', 'A mobile browser', 'A mobile testing tool'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'React Native was created by Facebook and open-sourced in 2015.',
      category: 'mobile-dev',
      subcategory: 'React Native'
    },
    {
      id: 'mob_003',
      question: 'Which company developed Flutter?',
      options: ['Facebook', 'Apple', 'Google', 'Microsoft'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Flutter uses Dart programming language, also developed by Google.',
      category: 'mobile-dev',
      subcategory: 'Flutter'
    },
    {
      id: 'mob_004',
      question: 'What is an APK file?',
      options: ['Apple Package Kit', 'Android Package Kit', 'Application Programming Kit', 'Advanced Package Kit'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'APK files contain all the components needed to run an Android app.',
      category: 'mobile-dev',
      subcategory: 'Android'
    },
    {
      id: 'mob_005',
      question: 'Which IDE is commonly used for Android development?',
      options: ['Xcode', 'Android Studio', 'Visual Studio', 'Eclipse'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Android Studio is based on IntelliJ IDEA and is the official IDE for Android.',
      category: 'mobile-dev',
      subcategory: 'Android'
    },
    
    // Intermediate Level
    {
      id: 'mob_006',
      question: 'What is the difference between React Native and native development?',
      options: ['No difference', 'React Native uses JavaScript, native uses platform-specific languages', 'React Native is faster', 'Native is web-based'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'React Native allows code sharing between iOS and Android platforms.',
      category: 'mobile-dev',
      subcategory: 'React Native'
    },
    {
      id: 'mob_007',
      question: 'What is the main thread in mobile development?',
      options: ['Background thread', 'UI thread', 'Network thread', 'Database thread'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Blocking the main thread can cause ANR (Application Not Responding) errors.',
      category: 'mobile-dev',
      subcategory: 'Performance'
    },
    {
      id: 'mob_008',
      question: 'What is auto layout in iOS?',
      options: ['Automatic app updates', 'A constraint-based layout system', 'Automatic testing', 'A design pattern'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Auto Layout helps create interfaces that adapt to different screen sizes.',
      category: 'mobile-dev',
      subcategory: 'iOS'
    }
  ],

  'data-science': [
    // Beginner Level
    {
      id: 'ds_001',
      question: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'SQL was initially developed by IBM in the early 1970s.',
      category: 'data-science',
      subcategory: 'SQL'
    },
    {
      id: 'ds_002',
      question: 'Which Python library is commonly used for data manipulation?',
      options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Pandas was created by Wes McKinney in 2008.',
      category: 'data-science',
      subcategory: 'Python'
    },
    {
      id: 'ds_003',
      question: 'What is a DataFrame in pandas?',
      options: ['A type of chart', 'A 2D labeled data structure', 'A machine learning model', 'A database'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'DataFrames are similar to tables in a database or Excel spreadsheet.',
      category: 'data-science',
      subcategory: 'Pandas'
    },
    {
      id: 'ds_004',
      question: 'Which of these is a measure of central tendency?',
      options: ['Mean', 'Median', 'Mode', 'All of the above'],
      correct_answer: 3,
      difficulty: 'beginner',
      fun_fact: 'Mean, median, and mode each provide different insights into data distribution.',
      category: 'data-science',
      subcategory: 'Statistics'
    },
    {
      id: 'ds_005',
      question: 'What does CSV stand for?',
      options: ['Computer Separated Values', 'Comma Separated Values', 'Column Separated Values', 'Cell Separated Values'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'CSV is one of the most common formats for data exchange.',
      category: 'data-science',
      subcategory: 'Data Formats'
    },
    
    // Intermediate Level
    {
      id: 'ds_006',
      question: 'What is the difference between correlation and causation?',
      options: ['No difference', 'Correlation implies relationship, causation implies cause-effect', 'Causation is stronger correlation', 'Correlation is for numbers only'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Correlation does not imply causation is a fundamental principle in statistics.',
      category: 'data-science',
      subcategory: 'Statistics'
    },
    {
      id: 'ds_007',
      question: 'What is normalization in data preprocessing?',
      options: ['Removing duplicates', 'Scaling data to a standard range', 'Sorting data', 'Converting data types'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Normalization helps algorithms that are sensitive to feature scales.',
      category: 'data-science',
      subcategory: 'Preprocessing'
    },
    {
      id: 'ds_008',
      question: 'What is a p-value in hypothesis testing?',
      options: ['Probability of the hypothesis being true', 'Probability of observing results given null hypothesis is true', 'Power of the test', 'Prediction value'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'A p-value less than 0.05 is often considered statistically significant.',
      category: 'data-science',
      subcategory: 'Statistics'
    }
  ],

  cybersecurity: [
    // Beginner Level
    {
      id: 'sec_001',
      question: 'What does HTTPS stand for?',
      options: ['HyperText Transfer Protocol Secure', 'HyperText Transfer Protocol System', 'HyperText Transfer Protocol Standard', 'HyperText Transfer Protocol Safe'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'HTTPS uses SSL/TLS to encrypt communication between browser and server.',
      category: 'cybersecurity',
      subcategory: 'Web Security'
    },
    {
      id: 'sec_002',
      question: 'What is phishing?',
      options: ['Catching fish online', 'A type of malware', 'Fraudulent attempt to obtain sensitive information', 'A programming technique'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Phishing attacks often use fake emails that appear to be from legitimate sources.',
      category: 'cybersecurity',
      subcategory: 'Social Engineering'
    },
    {
      id: 'sec_003',
      question: 'What is a firewall?',
      options: ['A physical wall that prevents fires', 'A network security device that monitors traffic', 'A type of virus', 'A programming language'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Firewalls can be hardware-based, software-based, or both.',
      category: 'cybersecurity',
      subcategory: 'Network Security'
    },
    {
      id: 'sec_004',
      question: 'What does VPN stand for?',
      options: ['Virtual Private Network', 'Very Private Network', 'Verified Private Network', 'Visual Private Network'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'VPNs create encrypted tunnels for secure data transmission.',
      category: 'cybersecurity',
      subcategory: 'Network Security'
    },
    {
      id: 'sec_005',
      question: 'What is malware?',
      options: ['Software for males', 'Malicious software', 'Mail software', 'Marketing software'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Malware includes viruses, worms, trojans, ransomware, and spyware.',
      category: 'cybersecurity',
      subcategory: 'Malware'
    },
    
    // Intermediate Level
    {
      id: 'sec_006',
      question: 'What is SQL injection?',
      options: ['A medical procedure', 'A type of cyberattack targeting databases', 'A database optimization technique', 'A programming method'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'SQL injection was first documented in 1998 and remains a top web vulnerability.',
      category: 'cybersecurity',
      subcategory: 'Web Security'
    },
    {
      id: 'sec_007',
      question: 'What is two-factor authentication?',
      options: ['Using two passwords', 'Authentication requiring two different verification methods', 'Logging in twice', 'Using two devices'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: '2FA significantly reduces the risk of unauthorized access even if passwords are compromised.',
      category: 'cybersecurity',
      subcategory: 'Authentication'
    },
    {
      id: 'sec_008',
      question: 'What is a DDoS attack?',
      options: ['Distributed Denial of Service', 'Direct Denial of Service', 'Distributed Data of Service', 'Dynamic Denial of Service'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'DDoS attacks use multiple compromised computers to flood a target with traffic.',
      category: 'cybersecurity',
      subcategory: 'Network Security'
    }
  ],

  cloud: [
    // Beginner Level
    {
      id: 'cloud_001',
      question: 'What does AWS stand for?',
      options: ['Amazon Web Services', 'Amazon Web Systems', 'Advanced Web Services', 'Amazon Web Solutions'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'AWS was launched in 2006 and is the largest cloud provider by market share.',
      category: 'cloud',
      subcategory: 'AWS'
    },
    {
      id: 'cloud_002',
      question: 'What is cloud computing?',
      options: ['Computing in the sky', 'Delivery of computing services over the internet', 'A type of weather prediction', 'Computing with clouds'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Cloud computing enables on-demand access to computing resources.',
      category: 'cloud',
      subcategory: 'Fundamentals'
    },
    {
      id: 'cloud_003',
      question: 'Which of these is a cloud service model?',
      options: ['SaaS', 'PaaS', 'IaaS', 'All of the above'],
      correct_answer: 3,
      difficulty: 'beginner',
      fun_fact: 'SaaS, PaaS, and IaaS represent different levels of cloud service abstraction.',
      category: 'cloud',
      subcategory: 'Service Models'
    },
    {
      id: 'cloud_004',
      question: 'What does S3 stand for in AWS?',
      options: ['Simple Storage Service', 'Secure Storage Service', 'Standard Storage Service', 'Smart Storage Service'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'S3 was one of the first services launched by AWS in 2006.',
      category: 'cloud',
      subcategory: 'AWS'
    },
    {
      id: 'cloud_005',
      question: 'What is Docker?',
      options: ['A cloud provider', 'A containerization platform', 'A programming language', 'A database'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Docker was first released in 2013 and revolutionized application deployment.',
      category: 'cloud',
      subcategory: 'Docker'
    },
    
    // Intermediate Level
    {
      id: 'cloud_006',
      question: 'What is the difference between horizontal and vertical scaling?',
      options: ['No difference', 'Horizontal adds more machines, vertical adds more power to existing machines', 'Vertical is cheaper', 'Horizontal is for databases only'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Horizontal scaling is often preferred for cloud applications due to flexibility.',
      category: 'cloud',
      subcategory: 'Scaling'
    },
    {
      id: 'cloud_007',
      question: 'What is Kubernetes?',
      options: ['A cloud provider', 'A container orchestration platform', 'A programming language', 'A monitoring tool'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Kubernetes was originally developed by Google and is now maintained by CNCF.',
      category: 'cloud',
      subcategory: 'Kubernetes'
    },
    {
      id: 'cloud_008',
      question: 'What is serverless computing?',
      options: ['Computing without servers', 'Computing where servers are managed by cloud provider', 'A type of database', 'Computing in space'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Serverless computing allows developers to focus on code without managing infrastructure.',
      category: 'cloud',
      subcategory: 'Serverless'
    }
  ],

  blockchain: [
    // Beginner Level
    {
      id: 'block_001',
      question: 'What is Bitcoin?',
      options: ['A physical coin', 'A digital cryptocurrency', 'A company', 'A programming language'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Bitcoin was created by the pseudonymous Satoshi Nakamoto in 2009.',
      category: 'blockchain',
      subcategory: 'Bitcoin'
    },
    {
      id: 'block_002',
      question: 'What is a blockchain?',
      options: ['A chain of blocks', 'A distributed ledger technology', 'A type of database', 'A mining tool'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Blockchain technology ensures transparency and immutability of records.',
      category: 'blockchain',
      subcategory: 'Fundamentals'
    },
    {
      id: 'block_003',
      question: 'What is Ethereum?',
      options: ['A type of Bitcoin', 'A blockchain platform for smart contracts', 'A mining hardware', 'A wallet'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Ethereum was proposed by Vitalik Buterin in 2013 when he was 19 years old.',
      category: 'blockchain',
      subcategory: 'Ethereum'
    },
    {
      id: 'block_004',
      question: 'What is cryptocurrency mining?',
      options: ['Digging for physical coins', 'Process of validating transactions and adding them to blockchain', 'Creating new cryptocurrencies', 'Stealing cryptocurrencies'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Mining requires significant computational power and energy consumption.',
      category: 'blockchain',
      subcategory: 'Mining'
    },
    {
      id: 'block_005',
      question: 'What is a smart contract?',
      options: ['A legal document', 'Self-executing contract with terms in code', 'A type of cryptocurrency', 'A mining algorithm'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Smart contracts automatically execute when predetermined conditions are met.',
      category: 'blockchain',
      subcategory: 'Smart Contracts'
    },
    
    // Intermediate Level
    {
      id: 'block_006',
      question: 'What is DeFi?',
      options: ['Defiant Finance', 'Decentralized Finance', 'Defined Finance', 'Delayed Finance'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'DeFi aims to recreate traditional financial systems using blockchain technology.',
      category: 'blockchain',
      subcategory: 'DeFi'
    },
    {
      id: 'block_007',
      question: 'What is the difference between Bitcoin and Ethereum?',
      options: ['No difference', 'Bitcoin is for payments, Ethereum is a platform for dApps', 'Ethereum is newer', 'Bitcoin is faster'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Ethereum\'s virtual machine enables complex programmable transactions.',
      category: 'blockchain',
      subcategory: 'Platforms'
    },
    {
      id: 'block_008',
      question: 'What is a DAO?',
      options: ['Decentralized Autonomous Organization', 'Distributed Application Object', 'Digital Asset Organization', 'Data Access Object'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'DAOs are governed by smart contracts and community voting rather than traditional management.',
      category: 'blockchain',
      subcategory: 'DAO'
    }
  ]
}

// Difficulty-based scoring and timing - Updated for youth engagement
export const DIFFICULTY_CONFIG = {
  beginner: {
    timeLimit: 30,
    coinsPerCorrect: 25,
    questions: 5
  },
  intermediate: {
    timeLimit: 45,
    coinsPerCorrect: 25,
    questions: 7
  },
  advanced: {
    timeLimit: 60,
    coinsPerCorrect: 25,
    questions: 10
  }
}

// Utility functions
export const getQuestionsForCategory = (categoryId: string, difficulty?: string, count?: number): QuizQuestion[] => {
  const categoryQuestions = QUIZ_DATABASE[categoryId] || []
  
  let filteredQuestions = categoryQuestions
  if (difficulty) {
    filteredQuestions = categoryQuestions.filter(q => q.difficulty === difficulty)
  }
  
  // Shuffle questions and return requested count
  const shuffled = filteredQuestions.sort(() => Math.random() - 0.5)
  return count ? shuffled.slice(0, count) : shuffled
}

export const getRandomQuestions = (categoryId: string, count: number = 5): QuizQuestion[] => {
  const allQuestions = QUIZ_DATABASE[categoryId] || []
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const getCategoryInfo = (categoryId: string) => {
  return QUIZ_CATEGORIES[categoryId] || QUIZ_CATEGORIES.programming
}