import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, BarChart, AlertCircle } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { TestResult } from '../types';

export function SubmittedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { testResults } = useTestStore();
  
  const [result, setResult] = useState<TestResult | null>(null);
  
  useEffect(() => {
    const resultId = location.state?.resultId;
    
    if (!resultId) {
      navigate('/');
      return;
    }
    
    const foundResult = testResults.find((r) => r.id === resultId);
    
    if (!foundResult) {
      navigate('/');
      return;
    }
    
    setResult(foundResult);
  }, [location.state, testResults, navigate]);
  
  if (!result) {
    return <div className="text-center">Loading...</div>;
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const scorePercentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const submittedDate = new Date(result.submittedAt).toLocaleString();
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Test Submitted</h1>
        <p className="text-gray-600 mt-1">
          Your test has been completed and submitted successfully.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {result.testTitle}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Score</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      scorePercentage >= 70 
                        ? 'bg-green-500' 
                        : scorePercentage >= 40 
                        ? 'bg-amber-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${scorePercentage}%` }}
                  />
                </div>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-800">
                {scorePercentage}%
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              {result.correctAnswers} correct out of {result.totalQuestions} questions
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Details</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex justify-between">
                <span>Time Taken:</span>
                <span className="font-medium">{formatTime(result.timeTaken)}</span>
              </li>
              <li className="flex justify-between">
                <span>Submitted:</span>
                <span className="font-medium">{submittedDate}</span>
              </li>
              <li className="flex justify-between">
                <span>Security Violations:</span>
                <span className={`font-medium ${result.violations > 0 ? 'text-amber-600' : ''}`}>
                  {result.violations}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {result.violations > 0 && (
          <div className="mt-6 bg-amber-50 p-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm">
              This test recorded {result.violations} security violation(s). 
              These may include exiting fullscreen mode, switching tabs, or attempting to copy content.
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </button>
        
        <button
          onClick={() => navigate('/results')}
          className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <BarChart className="h-4 w-4 mr-2" />
          View All Results
        </button>
      </div>
    </div>
  );
}