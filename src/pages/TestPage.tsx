import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { Question, SecurityViolationType } from '../types';
import { setupSecurityMonitoring, exitFullscreen } from '../utils/security';
import { MathRenderer } from '../components/MathRenderer';

export function TestPage() {
  const navigate = useNavigate();
  const { activeTest, submitTest, recordViolation } = useTestStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const securityCleanupRef = useRef<(() => void) | null>(null);
  const violationsRef = useRef<number>(0);
  
  const questions = useRef<Question[]>([]);
  
  useEffect(() => {
    if (!activeTest) {
      navigate('/');
      return;
    }
    
    if (activeTest.settings.shuffleQuestions) {
      questions.current = [...activeTest.questions].sort(() => Math.random() - 0.5);
    } else {
      questions.current = [...activeTest.questions];
    }
    
    const durationMs = activeTest.settings.duration * 60 * 1000;
    setRemainingTime(durationMs);
    startTimeRef.current = Date.now();
    
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, durationMs - elapsed);
      setRemainingTime(remaining);
      
      if (remaining <= 0) {
        handleSubmitTest();
      }
    }, 1000);
    
    securityCleanupRef.current = setupSecurityMonitoring({
      onViolation: (type) => {
        handleSecurityViolation(type);
      },
      enableFullscreenCheck: true,
      enableTabFocusCheck: true,
      enableCopyPasteCheck: true
    });
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (securityCleanupRef.current) {
        securityCleanupRef.current();
      }
      
      exitFullscreen().catch(() => {});
    };
  }, [activeTest, navigate]);
  
  const handleSecurityViolation = (type: SecurityViolationType) => {
    violationsRef.current += 1;
    recordViolation();
    
    if (violationsRef.current === 1) {
      setShowWarning(true);
    } else {
      handleSubmitTest();
    }
  };
  
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.current.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmitTest = () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (securityCleanupRef.current) {
      securityCleanupRef.current();
    }
    
    exitFullscreen().catch(() => {});
    
    const result = submitTest(selectedAnswers, timeTaken);
    
    navigate('/submitted', { state: { resultId: result?.id } });
  };
  
  const closeWarning = () => {
    setShowWarning(false);
  };
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (!activeTest || questions.current.length === 0) {
    return <div className="text-center">Loading...</div>;
  }
  
  const currentQuestion = questions.current[currentQuestionIndex];
  const answeredQuestionsCount = Object.keys(selectedAnswers).length;
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-indigo-600 mr-2" />
          <span className="font-medium">Time Remaining: </span>
          <span className={`ml-1 ${remainingTime < 60000 ? 'text-red-600 font-bold' : ''}`}>
            {formatTime(remainingTime)}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="font-medium">
            {answeredQuestionsCount} of {questions.current.length} answered
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Question {currentQuestionIndex + 1} of {questions.current.length}
          </h2>
          
          {activeTest.settings.freeNavigation && questions.current.length > 1 && (
            <div className="flex space-x-1">
              {questions.current.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentQuestionIndex === index
                      ? 'bg-indigo-600 text-white'
                      : selectedAnswers[questions.current[index]?.id] !== undefined
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <p className="text-gray-800 text-lg">{currentQuestion.text}</p>
          {currentQuestion.latex && (
            <MathRenderer latex={currentQuestion.latex} block className="mt-3" />
          )}
          {currentQuestion.imagePath && (
            <div className="mt-4">
              <img
                src={currentQuestion.imagePath}
                alt="Question diagram"
                className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={option.id}
              onClick={() => handleSelectAnswer(currentQuestion.id, index)}
              className={`p-3 border rounded-md cursor-pointer flex items-center ${
                selectedAnswers[currentQuestion.id] === index
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-6 h-6 flex-shrink-0 rounded-full border flex items-center justify-center mr-3 ${
                selectedAnswers[currentQuestion.id] === index
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-400'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex items-center flex-1">
                <span>{option.text}</span>
                {option.latex && (
                  <MathRenderer latex={option.latex} className="ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        {activeTest.settings.freeNavigation ? (
          <div className="flex space-x-3">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-4 py-2 rounded-md ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.current.length - 1}
              className={`flex items-center px-4 py-2 rounded-md ${
                currentQuestionIndex === questions.current.length - 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        ) : (
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentQuestionIndex === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </button>
        )}
        
        {!activeTest.settings.freeNavigation && currentQuestionIndex < questions.current.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Next Question
            <ArrowRight className="h-5 w-5 ml-1" />
          </button>
        ) : (
          <button
            onClick={handleSubmitTest}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Submit Test
          </button>
        )}
      </div>
      
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-start mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Security Warning</h3>
                <p className="text-gray-700 mt-1">
                  A security violation has been detected. If this happens again, your test will be
                  automatically submitted.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Remember to stay in fullscreen mode and don't switch tabs.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeWarning}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}