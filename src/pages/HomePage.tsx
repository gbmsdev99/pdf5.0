import React from 'react';
import { Link } from 'react-router-dom';
import { FileUp, List, BarChart, Settings, Edit } from 'lucide-react';
import { useTestStore } from '../store/testStore';

export function HomePage() {
  const { savedTests, createNewTest } = useTestStore();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">
          Offline PDF Test Maker
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create, customize, and take tests securely from PDF files or manual entry. 
          All data is stored locally on your device.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/upload"
          onClick={createNewTest}
          className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <FileUp className="h-8 w-8 text-indigo-900" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload PDF</h2>
          <p className="text-gray-600 text-center">
            Upload a PDF file and create a new test with questions and answers.
          </p>
        </Link>
        
        <Link 
          to="/manual-entry"
          onClick={createNewTest}
          className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Edit className="h-8 w-8 text-emerald-700" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Manual Entry</h2>
          <p className="text-gray-600 text-center">
            Create a test by entering questions manually with support for images.
          </p>
        </Link>
        
        <Link 
          to="/results"
          className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <BarChart className="h-8 w-8 text-amber-700" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">View Results</h2>
          <p className="text-gray-600 text-center">
            See your past test results and performance analytics.
          </p>
        </Link>
      </div>
      
      {savedTests.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <List className="h-5 w-5 mr-2" />
            Your Tests
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {savedTests.map((test) => (
                <li key={test.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {test.settings.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {test.questions.length} questions | {test.settings.duration} min
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/preview/${test.id}`}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 text-sm"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/instructions/${test.id}`}
                        className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 text-sm"
                      >
                        Take Test
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}