import React, { useState, useEffect } from 'react';

export const QuizInterface = ({ questionData, currentQuestion, totalQuestions, selectedAnswer, onAnswerSelect }) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
    const timer = setTimeout(() => setAnimateIn(false), 500);
    return () => clearTimeout(timer);
  }, [currentQuestion]);

  return (
    <div className={`quiz-interface ${animateIn ? 'animate-in' : ''}`}>
      <div className="quick-start-section">
        <h2 className="quick-start-title">Quick Start!</h2>
        <p className="quick-start-subtitle">Answer 2 questions and win upto 200 coins.</p>
        
        <div className="question-counter">
          <span className="counter-text">{currentQuestion + 1}/{totalQuestions} Question</span>
        </div>
        
        <div className="question-container">
          <h3 className="question-text">{questionData.question}</h3>
          
          <div className="options-grid">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswer === index ? 'selected' : ''} ${
                  selectedAnswer !== null && index === questionData.correctAnswer ? 'correct' : ''
                } ${
                  selectedAnswer !== null && selectedAnswer === index && index !== questionData.correctAnswer ? 'incorrect' : ''
                }`}
                onClick={() => onAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FunFact = ({ fact }) => {
  return (
    <div className="fun-fact-container">
      <div className="fun-fact-card">
        <h4 className="fun-fact-title">#Fun Fact</h4>
        <p className="fun-fact-text">{fact}</p>
      </div>
    </div>
  );
};

export const Features = () => {
  const features = [
    "Play Quizzes in 25+ categories like Programming, AI, Web Development, Mobile Development, Data Science & more!",
    "Compete with thousands of other tech enthusiasts!",
    "Win coins for every game",
    "Trusted by millions of other quiz enthusiasts like YOU!"
  ];

  return (
    <div className="features-container">
      <div className="features-card">
        <h3 className="features-title">Play Quiz and Win Coins!</h3>
        <div className="features-divider"></div>
        <ul className="features-list">
          {features.map((feature, index) => (
            <li key={index} className="features-item">
              <span className="features-bullet">•</span>
              <span className="features-text">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const CategorySelector = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="category-selector">
      <h3 className="category-title">Choose Your Category</h3>
      <div className="category-grid">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-btn ${selectedCategory === category ? 'selected' : ''}`}
            onClick={() => onCategorySelect(category)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};