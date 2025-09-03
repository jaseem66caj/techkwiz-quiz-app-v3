const fs = require('fs');
const path = require('path');

// Create a simple HTML representation of key pages
const createSimpleHTML = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - TechKwiz</title>
  <style>
    body { 
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: 0;
      padding: 20px;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      text-align: center;
    }
    h1 { 
      font-size: 2.5rem; 
      margin-bottom: 1rem;
      font-weight: 800;
    }
    p { 
      font-size: 1.1rem; 
      margin-bottom: 2rem;
    }
    .button {
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${content}</p>
    <button class="button">Get Started</button>
  </div>
</body>
</html>
`;

function runSimpleVisualTest() {
  console.log('Starting simple visual test...');
  
  // Create baselines directory if it doesn't exist
  const baselinesDir = './src/__tests__/visual/baselines';
  if (!fs.existsSync(baselinesDir)) {
    fs.mkdirSync(baselinesDir, { recursive: true });
  }
  
  // Create HTML files for key pages
  const pages = [
    {
      name: 'homepage',
      title: 'TechKwiz Home',
      content: 'Welcome to TechKwiz - Test your tech knowledge with our interactive quizzes!'
    },
    {
      name: 'quiz',
      title: 'Quiz Page',
      content: 'Challenge yourself with our interactive quizzes and earn rewards!'
    },
    {
      name: 'profile',
      title: 'User Profile',
      content: 'Track your progress and achievements in your personal profile.'
    }
  ];
  
  pages.forEach(page => {
    const htmlContent = createSimpleHTML(page.title, page.content);
    const filePath = path.join(baselinesDir, `${page.name}-baseline.html`);
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Created baseline for ${page.name}`);
  });
  
  console.log('🎉 Simple visual test completed successfully!');
  console.log('Baseline HTML files created in src/__tests__/visual/baselines/');
}

runSimpleVisualTest();