// Simple debug script to test imports
console.log('Testing imports...');

// Try to import the quiz database
import('./src/data/quizDatabase.ts')
  .then(module => {
    console.log('Successfully imported quiz database');
    console.log('Categories:', Object.keys(module.QUIZ_CATEGORIES));
  })
  .catch(err => {
    console.error('Failed to import quiz database:', err);
  });