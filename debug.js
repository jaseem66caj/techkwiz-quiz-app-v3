const { QUIZ_CATEGORIES } = require('./src/data/quizDatabase');

console.log('Quiz Categories:');
console.log(Object.keys(QUIZ_CATEGORIES));

// Test the reward calculator
const { calculateCategoryMaxCoins } = require('./src/utils/rewardCalculator');
console.log('Prize pool for programming category:', calculateCategoryMaxCoins('programming'));