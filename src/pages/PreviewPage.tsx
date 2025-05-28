import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, Trash2, Edit2, Check, AlertTriangle } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { Question, QuestionOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function PreviewPage() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const {
    currentTest,
    savedTests,
    addQuestion,
    updateQuestion,
    removeQuestion,
    saveTest
  } = useTestStore();

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  useEffect(() => {
    if (testId && !currentTest) {
      const test = savedTests.find(t => t.id === testId);
      if (test) {
        navigate('/');
      }
    }

    if (!currentTest && !testId) {
      navigate('/upload');
    }
  }, [currentTest, testId, savedTests, navigate]);

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.text);
    setOptions([...question.options]);
    setCorrectOptionIndex(question.correctOptionIndex);
  };

  const handleAddQuestion = () => {
    setEditingQuestionId('new');
    setQuestionText('');
    setOptions([
      { id: uuidv4(), text: '' },
      { id: uuidv4(), text: '' },
      { id: uuidv4(), text: '' },
      { id: uuidv4(), text: '' }
    ]);
    setCorrectOptionIndex(0);
  };

  const handleSaveQuestion = () => {
    if (!questionText.trim()) {
      alert('Question text cannot be empty');
      return;
    }

    const validOptions = options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      alert('At least two options are required');
      return;
    }

    if (correctOptionIndex >= validOptions.length) {
      setCorrectOptionIndex(0);
    }

    const questionData = {
      text: questionText.trim(),
      options: validOptions,
      correctOptionIndex
    };

    if (editingQuestionId === 'new') {
      addQuestion(questionData);
    } else if (editingQuestionId) {
      updateQuestion(editingQuestionId, questionData);
    }

    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setOptions([]);
    setCorrectOptionIndex(0);
  };

  const handleUpdateOption = (index: number, text: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], text };
    setOptions(updatedOptions);
  };

  const handleSaveTest = () => {
    if (!currentTest) return;

    if (currentTest.questions.length === 0) {
      alert('Your test must have at least one question');
      return;
    }

    saveTest();
    navigate('/settings');
  };

  if (!currentTest) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">
          Preview and Edit Questions
        </h1>

        <div className="flex space-x-3">
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md flex items-center hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </button>

          <button
            onClick={handleSaveTest}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-1" />
            Save and Continue
          </button>
        </div>
      </div>

      {currentTest.questions.length === 0 && !editingQuestionId && (
        <div className="bg-amber-50 p-5 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-800 font-medium">No questions found</p>
            <p className="text-gray-600 mt-1">
              No questions were extracted from your PDF or you haven't added any questions yet.
              Click "Add Question" to create questions manually.
            </p>
          </div>
        </div>
      )}

      {editingQuestionId && (
        <div className="bg-white p-5 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingQuestionId === 'new' ? 'Add New Question' : 'Edit Question'}
          </h2>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Question Text
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={3}
              placeholder="Enter the question text"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Options
            </label>

            {options.map((option, index) => (
              <div key={option.id} className="flex items-center mb-2">
                <div className="w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-gray-500 font-medium">
                    {String.fromCharCode(65 + index)}.
                  </span>
                </div>

                <div className="flex-grow">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>

                <div className="ml-2">
                  <input
                    type="radio"
                    checked={correctOptionIndex === index}
                    onChange={() => setCorrectOptionIndex(index)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}

            <p className="text-sm text-gray-500 mt-1">
              Select the radio button next to the correct answer.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Question
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {currentTest.questions.map((question, index) => (
          <div key={question.id} className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                Q{index + 1}. {question.text}
              </h3>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditQuestion(question)}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => removeQuestion(question.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              {question.options.map((option, optionIndex) => (
                <div
                  key={option.id}
                  className={`flex items-center py-1 px-2 rounded ${
                    question.correctOptionIndex === optionIndex ? 'bg-green-50' : ''
                  }`}
                >
                  <span className="w-6 font-medium text-gray-700">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  <span>{option.text}</span>
                  {question.correctOptionIndex === optionIndex && (
                    <Check className="h-4 w-4 text-green-600 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {currentTest.questions.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSaveTest}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Save and Continue to Test Settings
          </button>
        </div>
      )}
    </div>
  );
}
