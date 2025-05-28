import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, AlertTriangle, Copy, ExternalLink, Maximize } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { requestFullscreen } from '../utils/security';

export function InstructionsPage() {
  const navigate = useNavigate();
  const { testId } = useParams();
  
  const { savedTests, startTest } = useTestStore();
  
  useEffect(() => {
    // If no testId, redirect to home
    if (!testId) {
      navigate('/');
      return;
    }
    
    // Check if test exists
    const test = savedTests.find((t) => t.id === testId);
    if (!test) {
      navigate('/');
    }
  }, [testId, savedTests, navigate]);
  
  const test = savedTests.find((t) => t.id === testId);
  
  if (!test) {
    return <div className="text-center">Loading...</div>;
  }
  
  const handleStartTest = async () => {
    try {
      // Request fullscreen before starting
      await requestFullscreen();
      
      // Start the test
      startTest(test.id);
      
      // Navigate to test page
      navigate('/test');
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      alert('Fullscreen mode is required to take the test. Please try again.');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-indigo-900">{test.settings.title}</h1>
        {test.settings.description && (
          <p className="text-gray-600 mt-2">{test.settings.description}</p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Test Information
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <span className="font-medium w-32">Questions:</span>
            <span>{test.questions.length} questions</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <span className="font-medium w-32">Time Limit:</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-indigo-600" />
              <span>{test.settings.duration} minutes</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <span className="font-medium w-32">Question Order:</span>
            <span>
              {test.settings.shuffleQuestions ? 'Randomized' : 'As presented'}
            </span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <span className="font-medium w-32">Navigation:</span>
            <span>
              {test.settings.freeNavigation 
                ? 'Free navigation between questions' 
                : 'Sequential (one question at a time)'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Important Rules
        </h2>
        
        <ul className="space-y-3">
          <li className="flex items-start">
            <Maximize className="h-5 w-5 mr-2 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Full-screen mode is required</p>
              <p className="text-gray-700 text-sm">
                The test will run in full-screen mode. Exiting full-screen will trigger a warning,
                and a second violation will automatically submit your test.
              </p>
            </div>
          </li>
          
          <li className="flex items-start">
            <ExternalLink className="h-5 w-5 mr-2 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">No tab switching</p>
              <p className="text-gray-700 text-sm">
                Switching to another browser tab or window will count as a security violation.
              </p>
            </div>
          </li>
          
          <li className="flex items-start">
            <Copy className="h-5 w-5 mr-2 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Copy/paste is disabled</p>
              <p className="text-gray-700 text-sm">
                Copying and pasting content is not allowed during the test.
              </p>
            </div>
          </li>
          
          <li className="flex items-start">
            <Clock className="h-5 w-5 mr-2 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Time limit enforced</p>
              <p className="text-gray-700 text-sm">
                The test will be automatically submitted when the time limit is reached.
              </p>
            </div>
          </li>
        </ul>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleStartTest}
          className="px-8 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
        >
          Begin Test
        </button>
        <p className="text-sm text-gray-500 mt-2">
          By starting the test, you agree to follow the rules above.
        </p>
      </div>
    </div>
  );
}