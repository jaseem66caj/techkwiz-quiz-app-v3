import { Metadata } from 'next'

// SEO-optimized metadata for different pages
export const seoConfig = {
  // Homepage metadata
  homepage: {
    title: "TechKwiz - Free Online Tech Quiz Platform | Test Your Programming Knowledge",
    description: "Test your programming, AI, web development, and tech skills with TechKwiz's free online quizzes. Earn coins, compete on leaderboards, and master technology concepts with 50+ expert-created questions.",
    keywords: "programming quiz, tech quiz online, javascript quiz, python quiz, AI quiz, web development quiz, coding test, programming test, tech knowledge test, free online quiz, computer science quiz",
    openGraph: {
      title: "TechKwiz - Master Technology Through Interactive Quizzes",
      description: "Join thousands of developers testing their skills on TechKwiz. Free quizzes covering Programming, AI, Web Dev, Mobile, Data Science, Cybersecurity, Cloud, and Blockchain.",
      type: "website",
      siteName: "TechKwiz",
      images: [
        {
          url: "/og-image-homepage.jpg",
          width: 1200,
          height: 630,
          alt: "TechKwiz - Free Tech Quiz Platform"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "TechKwiz - Free Online Tech Quiz Platform",
      description: "Test your programming and tech skills with interactive quizzes. Earn coins, compete globally, and master technology concepts.",
      images: ["/og-image-homepage.jpg"]
    }
  },

  // Categories page metadata
  categories: {
    title: "Tech Quiz Categories | Programming, AI, Web Dev & More - TechKwiz",
    description: "Choose from 8 comprehensive tech quiz categories: Programming (JavaScript, Python), AI & Machine Learning, Web Development, Mobile Dev, Data Science, Cybersecurity, Cloud Computing, and Blockchain.",
    keywords: "programming categories, tech quiz topics, javascript quiz, python quiz, react quiz, AI machine learning quiz, data science quiz, cybersecurity quiz, blockchain quiz, cloud computing quiz",
    openGraph: {
      title: "8 Tech Quiz Categories - Find Your Perfect Challenge",
      description: "Explore specialized quizzes in Programming, AI, Web Development, Mobile, Data Science, Cybersecurity, Cloud Computing, and Blockchain. Choose your difficulty level.",
      type: "website",
      images: [
        {
          url: "/og-image-categories.jpg",
          width: 1200,
          height: 630,
          alt: "TechKwiz Quiz Categories"
        }
      ]
    }
  },

  // Quiz page metadata generator
  quiz: (category: string, categoryName: string) => ({
    title: `${categoryName} Quiz - Test Your Knowledge | TechKwiz`,
    description: `Challenge yourself with our comprehensive ${categoryName.toLowerCase()} quiz. Multiple difficulty levels, instant feedback, and detailed explanations. Perfect for students, developers, and tech enthusiasts.`,
    keywords: `${categoryName.toLowerCase()} quiz, ${categoryName.toLowerCase()} test, ${categoryName.toLowerCase()} questions, tech quiz, programming test, online ${categoryName.toLowerCase()} assessment`,
    openGraph: {
      title: `${categoryName} Quiz Challenge - TechKwiz`,
      description: `Test your ${categoryName.toLowerCase()} skills with expert-crafted questions. Three difficulty levels available.`,
      type: "website",
      images: [
        {
          url: `/og-image-${category}.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryName} Quiz - TechKwiz`
        }
      ]
    }
  }),

  // Profile page metadata
  profile: {
    title: "Your Profile & Quiz Statistics | TechKwiz",
    description: "View your quiz performance, achievements, coin balance, and learning progress. Track your technology knowledge growth with detailed statistics and badges.",
    keywords: "quiz profile, quiz statistics, quiz achievements, learning progress, quiz history, tech quiz performance",
    openGraph: {
      title: "Your TechKwiz Profile - Track Your Learning Journey",
      description: "Monitor your quiz performance, unlock achievements, and see your technology knowledge growth over time.",
      type: "profile"
    }
  },

  // Leaderboard page metadata
  leaderboard: {
    title: "Global Tech Quiz Leaderboard | Top Performers - TechKwiz",
    description: "See the top tech quiz performers globally. Compete with thousands of developers, engineers, and tech enthusiasts. View all-time, monthly, and weekly rankings.",
    keywords: "tech quiz leaderboard, programming quiz rankings, top quiz performers, tech quiz competition, global tech quiz scores",
    openGraph: {
      title: "TechKwiz Global Leaderboard - Top Tech Quiz Performers",
      description: "Compete with the best tech minds globally. See who ranks highest in programming, AI, web development, and more.",
      type: "website"
    }
  }
}

// Structured data generators for rich snippets
export const generateStructuredData = {
  // Website structured data
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TechKwiz",
    "alternateName": "Tech Quiz Platform",
    "url": "https://techkwiz.com",
    "description": "Free online technology quiz platform for developers and tech enthusiasts",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://techkwiz.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/techkwiz",
      "https://facebook.com/techkwiz",
      "https://linkedin.com/company/techkwiz"
    ]
  }),

  // Organization structured data
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TechKwiz",
    "url": "https://techkwiz.com",
    "logo": "https://techkwiz.com/logo.png",
    "description": "Leading online platform for technology education through interactive quizzes",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@techkwiz.com"
    }
  }),

  // Quiz structured data
  quiz: (categoryName: string, questionCount: number) => ({
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": `${categoryName} Quiz`,
    "description": `Comprehensive ${categoryName.toLowerCase()} quiz with ${questionCount} expert-crafted questions`,
    "educationalLevel": "Beginner to Advanced",
    "learningResourceType": "Quiz",
    "author": {
      "@type": "Organization",
      "name": "TechKwiz"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TechKwiz",
      "logo": "https://techkwiz.com/logo.png"
    },
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "typicalAgeRange": "18-65"
  }),

  // FAQ structured data for better SERP features
  faq: () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is TechKwiz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "TechKwiz is a free online quiz platform designed for developers, students, and tech enthusiasts to test and improve their technology knowledge across 8 categories including Programming, AI, Web Development, and more."
        }
      },
      {
        "@type": "Question",
        "name": "How many quiz categories are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "TechKwiz offers 8 comprehensive categories: Programming (JavaScript, Python, Java), AI & Machine Learning, Web Development, Mobile Development, Data Science, Cybersecurity, Cloud Computing, and Blockchain."
        }
      },
      {
        "@type": "Question",
        "name": "Is TechKwiz free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, TechKwiz is completely free to use. You can take quizzes, earn coins, track your progress, and compete on leaderboards without any cost."
        }
      },
      {
        "@type": "Question",
        "name": "What difficulty levels are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each quiz category offers three difficulty levels: Beginner (suitable for newcomers), Intermediate (for those with some experience), and Advanced (for experts and professionals)."
        }
      }
    ]
  }),

  // Breadcrumb structured data
  breadcrumb: (items: Array<{name: string, url: string}>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  })
}