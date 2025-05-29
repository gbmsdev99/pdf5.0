import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, FileText } from 'lucide-react';
import { parsePdf } from '../utils/pdfParser';
import { useTestStore } from '../store/testStore';

export function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addQuestion } = useTestStore();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file && file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files?.[0] || null;
    
    if (file && file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a PDF file.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const questions = await parsePdf(selectedFile);
      
      // Add each question to the store
      questions.forEach((question) => {
        addQuestion(question);
      });
      
      navigate('/preview');
    } catch (error) {
      console.error('Error parsing PDF:', error);
      setError(error instanceof Error ? error.message : 'Failed to parse PDF.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-indigo-900">Upload PDF File</h1>
        <p className="text-gray-600 mt-2">
          Upload a PDF file containing questions in the required format.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
            selectedFile 
              ? 'border-indigo-400 bg-indigo-50' 
              : 'border-gray-300 hover:border-indigo-300 bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-indigo-500 mb-2" />
              <p className="text-indigo-800 font-medium">{selectedFile.name}</p>
              <p className="text-gray-500 text-sm mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-700 font-medium">
                Click to select or drag and drop a PDF file
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Only PDF files are supported
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center bg-red-50 text-red-700 p-3 rounded mt-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className={`
              px-6 py-2 rounded-md font-medium flex items-center space-x-2
              ${selectedFile && !isUploading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Continue to Preview</span>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-12 bg-amber-50 p-5 rounded-lg">
        <h2 className="text-lg font-semibold text-amber-800 mb-2">PDF Format Requirements</h2>
        <p className="text-gray-700 mb-3">
          Your PDF should follow this specific format for each question:
        </p>
        <pre className="bg-white p-3 rounded border border-amber-200 text-sm overflow-x-auto">
{`Q1. What is the capital of Germany?
A. Berlin
B. Paris
C. Rome
D. Madrid
Answer: A`}
        </pre>
        <p className="text-gray-600 text-sm mt-3">
          Each question must start with "Q" followed by a number and a period.
          Each option must start with a letter (A-D) followed by a period.
          The correct answer must be indicated by "Answer:" followed by the option letter.
        </p>
      </div>
    </div>
  );
}