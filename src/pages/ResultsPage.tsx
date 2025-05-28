import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Download, BarChart3, Calendar, Clock } from 'lucide-react';
import { useTestStore } from '../store/testStore';

export function ResultsPage() {
  const navigate = useNavigate();
  const { testResults, savedTests } = useTestStore();
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  
  // Sort results by submission date (newest first)
  const sortedResults = [...testResults].sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  
  const handleToggleResult = (resultId: string) => {
    if (selectedResults.includes(resultId)) {
      setSelectedResults(selectedResults.filter(id => id !== resultId));
    } else {
      setSelectedResults([...selectedResults, resultId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedResults.length === sortedResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(sortedResults.map(result => result.id));
    }
  };
  
  const handleDeleteSelected = () => {
    if (selectedResults.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedResults.length} selected result(s)?`)) {
      // We would delete the selected results here
      // For now, we'll just show an alert
      alert('Delete functionality would be implemented here.');
      setSelectedResults([]);
    }
  };
  
  const handleExportCSV = () => {
    const results = selectedResults.length > 0
      ? sortedResults.filter(result => selectedResults.includes(result.id))
      : sortedResults;
    
    if (results.length === 0) return;
    
    // Create CSV content
    const headers = ['Test Name', 'Score', 'Total Questions', 'Time Taken', 'Submitted At', 'Violations'];
    
    const csvContent = [
      headers.join(','),
      ...results.map(result => {
        const scorePercentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
        const formattedTime = formatTime(result.timeTaken);
        const formattedDate = new Date(result.submittedAt).toLocaleDateString();
        
        return [
          `"${result.testTitle}"`,
          `${scorePercentage}%`,
          result.totalQuestions,
          formattedTime,
          formattedDate,
          result.violations
        ].join(',');
      })
    ].join('\n');
    
    // Create and download blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'test_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Test Results</h1>
        
        {sortedResults.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded flex items-center hover:bg-indigo-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </button>
            
            {selectedResults.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-red-100 text-red-800 rounded flex items-center hover:bg-red-200"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </button>
            )}
          </div>
        )}
      </div>
      
      {sortedResults.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">No Results Yet</h2>
          <p className="text-gray-500 mb-6">
            You haven't taken any tests yet. Results will appear here once you complete a test.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedResults.length === sortedResults.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((result) => {
                  const scorePercentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
                  const submittedDate = new Date(result.submittedAt).toLocaleDateString();
                  
                  return (
                    <tr 
                      key={result.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleToggleResult(result.id)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedResults.includes(result.id)}
                            onChange={() => handleToggleResult(result.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.testTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.totalQuestions} questions
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          scorePercentage >= 70 
                            ? 'bg-green-100 text-green-800' 
                            : scorePercentage >= 40 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {scorePercentage}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {result.correctAnswers}/{result.totalQuestions} correct
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {submittedDate}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatTime(result.timeTaken)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''}
            {selectedResults.length > 0 && ` (${selectedResults.length} selected)`}
          </div>
        </>
      )}
    </div>
  );
}