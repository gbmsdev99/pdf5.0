import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shuffle, Navigation, Maximize, Save } from 'lucide-react';
import { useTestStore } from '../store/testStore';

export function SettingsPage() {
  const navigate = useNavigate();
  const { currentTest, updateTestSettings, saveTest } = useTestStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [freeNavigation, setFreeNavigation] = useState(true);
  
  useEffect(() => {
    if (!currentTest) {
      navigate('/');
      return;
    }
    
    // Initialize form with current test settings
    setTitle(currentTest.settings.title);
    setDescription(currentTest.settings.description);
    setDuration(currentTest.settings.duration);
    setShuffleQuestions(currentTest.settings.shuffleQuestions);
    setFreeNavigation(currentTest.settings.freeNavigation);
  }, [currentTest, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTest) return;
    
    if (!title.trim()) {
      alert('Please enter a test title');
      return;
    }
    
    if (duration < 1) {
      alert('Duration must be at least 1 minute');
      return;
    }
    
    // Update test settings in store
    updateTestSettings({
      title: title.trim(),
      description: description.trim(),
      duration,
      shuffleQuestions,
      freeNavigation,
      requireFullscreen: true, // Always required
    });
    
    // Save the test
    saveTest();
    
    // Navigate to instructions page
    navigate(`/instructions/${currentTest.id}`);
  };
  
  if (!currentTest) {
    return <div className="text-center">Loading...</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">
        Test Settings
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Test Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Enter test title"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            placeholder="Enter test description or instructions"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="duration" className="block text-gray-700 font-medium mb-2 flex items-center">
            <Clock className="h-5 w-5 mr-1 text-indigo-600" />
            Time Limit (minutes)
          </label>
          <input
            id="duration"
            type="number"
            min="1"
            max="240"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <input
              id="shuffle"
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="shuffle" className="ml-2 block text-gray-700 flex items-center">
              <Shuffle className="h-5 w-5 mr-1 text-indigo-600" />
              Shuffle Questions
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="navigation"
              type="checkbox"
              checked={freeNavigation}
              onChange={(e) => setFreeNavigation(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="navigation" className="ml-2 block text-gray-700 flex items-center">
              <Navigation className="h-5 w-5 mr-1 text-indigo-600" />
              Allow Free Navigation
            </label>
            <span className="ml-2 text-sm text-gray-500">
              (If disabled, questions must be answered in sequence)
            </span>
          </div>
          
          <div className="flex items-center opacity-75">
            <input
              id="fullscreen"
              type="checkbox"
              checked={true}
              disabled
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="fullscreen" className="ml-2 block text-gray-700 flex items-center">
              <Maximize className="h-5 w-5 mr-1 text-indigo-600" />
              Require Fullscreen Mode
            </label>
            <span className="ml-2 text-sm text-gray-500">
              (Always enabled for security)
            </span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Settings
          </button>
        </div>
      </form>
      
      <div className="mt-8 bg-amber-50 p-5 rounded-lg">
        <h2 className="text-lg font-semibold text-amber-800 mb-2">Security Features</h2>
        <p className="text-gray-700">
          This test will include the following security features:
        </p>
        <ul className="mt-2 space-y-1">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Full-screen mode is required during the test
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Exiting full-screen will trigger a warning
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Second violation will automatically submit the test
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Tab switching detection
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Copy/paste prevention
          </li>
        </ul>
      </div>
    </div>
  );
}