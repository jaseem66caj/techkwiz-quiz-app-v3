import React, { useState, useEffect } from 'react';
import './App.css';
import { QuizInterface, FunFact, Features } from './components';

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Mock quiz data for TechKwiz
  const quizData = [
    {
      question: "Which programming language is known as the 'language of the web'?",
      options: ["JavaScript", "Python", "Java", "C++"],
      correctAnswer: 0,
      funFact: "JavaScript was created in just 10 days by Brendan Eich at Netscape in 1995."
    },
    {
      question: "What does 'AI' stand for in technology?",
      options: ["Advanced Intelligence", "Artificial Intelligence", "Automated Intelligence", "Algorithmic Intelligence"],
      correctAnswer: 1,
      funFact: "The term 'Artificial Intelligence' was coined by John McCarthy in 1956 at the Dartmouth Conference."
    }
  ];

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    
    setTimeout(() => {
      if (answerIndex === quizData[currentQuestion].correctAnswer) {
        setScore(score + 1);
        setCoins(coins + 100);
      }
      
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setQuizCompleted(true);
        setShowResult(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setShowResult(false);
  };

  return (
    <div className="App">
      <div className="quiz-container">
        <header className="quiz-header">
          <h1 className="brand-title">TechKwiz.com</h1>
          <div className="coins-display">
            <span className="coins-icon">🪙</span>
            <span className="coins-text">{coins} Coins</span>
          </div>
        </header>
        
        {!quizCompleted ? (
          <QuizInterface
            questionData={quizData[currentQuestion]}
            currentQuestion={currentQuestion}
            totalQuestions={quizData.length}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
          />
        ) : (
          <div className="result-container">
            <div className="result-card">
              <h2 className="result-title">Quiz Complete! 🎉</h2>
              <p className="result-text">You scored {score} out of {quizData.length}</p>
              <p className="result-coins">Earned: {coins} coins</p>
              <button className="restart-btn" onClick={resetQuiz}>
                Play Again
              </button>
            </div>
          </div>
        )}
        
        <FunFact fact={quizData[currentQuestion]?.funFact || "TechKwiz offers over 25+ technology categories including Programming, AI, Web Development, and more!"} />
        
        <Features />
      </div>
    </div>
  );
}

export default App;