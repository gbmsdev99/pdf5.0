import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, AlertCircle, Save, FunctionSquare as Function } from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { Question, QuestionOption } from '../types';
import { MathRenderer } from '../components/MathRenderer';
import { v4 as uuidv4 } from 'uuid';

export function ManualEntryPage() {
  const navigate = useNavigate();
  const { addQuestion } = useTestStore();
  const [bulkText, setBulkText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Question[]>([]);
  const [showLatexHelper, setShowLatexHelper] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImages(prev => ({
          ...prev,
          [file.name]: base64
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const parseQuestions = (text: string): Question[] => {
    const questions: Question[] = [];
    const questionBlocks = text.split(/(?=Q\d+\.)/);

    for (const block of questionBlocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n').map(line => line.trim());
      const questionMatch = lines[0].match(/Q\d+\.\s+(.*)/);
      if (!questionMatch) continue;

      let questionText = questionMatch[1];
      let questionLatex = null;
      const imageMatch = questionText.match(/\[image:\s*([^\]]+)\]/);
      const latexMatch = questionText.match(/\[latex:\s*([^\]]+)\]/);
      let imagePath = null;

      if (imageMatch) {
        const imageKey = imageMatch[1].trim();
        if (images[imageKey]) {
          imagePath = images[imageKey];
          questionText = questionText.replace(imageMatch[0], '').trim();
        }
      }

      if (latexMatch) {
        questionLatex = latexMatch[1].trim();
        questionText = questionText.replace(latexMatch[0], '').trim();
      }

      const options: QuestionOption[] = [];
      let correctOptionIndex = -1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const optionMatch = line.match(/([A-D])\.\s+(.*)/);
        const answerMatch = line.match(/Answer:\s+([A-D])/);

        if (optionMatch) {
          const optionText = optionMatch[2];
          const optionLatexMatch = optionText.match(/\[latex:\s*([^\]]+)\]/);
          
          options.push({
            id: uuidv4(),
            text: optionLatexMatch ? optionText.replace(optionLatexMatch[0], '').trim() : optionText,
            latex: optionLatexMatch ? optionLatexMatch[1].trim() : undefined
          });
        } else if (answerMatch) {
          correctOptionIndex = answerMatch[1].charCodeAt(0) - 'A'.charCodeAt(0);
        }
      }

      if (options.length === 4 && correctOptionIndex >= 0) {
        questions.push({
          id: uuidv4(),
          text: questionText,
          latex: questionLatex || undefined,
          options,
          correctOptionIndex,
          imagePath
        });
      }
    }

    return questions;
  };

  const handlePreview = () => {
    try {
      const parsedQuestions = parseQuestions(bulkText);
      setPreview(parsedQuestions);
      setError(null);
    } catch (error) {
      setError('Failed to parse questions. Please check the format.');
    }
  };

  const handleSubmit = () => {
    try {
      const questions = preview.length > 0 ? preview : parseQuestions(bulkText);
      
      if (questions.length === 0) {
        setError('No valid questions found. Please check the format.');
        return;
      }

      questions.forEach(question => {
        addQuestion(question);
      });

      navigate('/preview');
    } catch (error) {
      setError('Failed to parse questions. Please check the format.');
    }
  };

  const insertLatexTemplate = (template: string) => {
    setBulkText(prev => prev + `[latex: ${template}]`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-indigo-900">Manual Question Entry</h1>
        <p className="text-gray-600 mt-2">
          Enter multiple questions with LaTeX and image support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-indigo-600" />
              Question Input
            </h2>

            <div className="flex space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg flex items-center hover:bg-indigo-200 transition-colors"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Images
              </button>
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center hover:bg-emerald-200 transition-colors"
              >
                <Function className="h-5 w-5 mr-2" />
                Preview
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="mb-6">
            <button
              onClick={() => setShowLatexHelper(!showLatexHelper)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showLatexHelper ? 'Hide LaTeX Helper' : 'Show LaTeX Helper'}
            </button>

            {showLatexHelper && (
              <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">LaTeX Templates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => insertLatexTemplate('\\frac{a}{b}')}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-700">Fraction</div>
                    <div className="text-sm text-gray-500">a/b</div>
                  </button>
                  <button
                    onClick={() => insertLatexTemplate('x^2 + y^2 = z^2')}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-700">Pythagorean</div>
                    <div className="text-sm text-gray-500">x² + y² = z²</div>
                  </button>
                  <button
                    onClick={() => insertLatexTemplate('\\sqrt{x}')}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-700">Square Root</div>
                    <div className="text-sm text-gray-500">√x</div>
                  </button>
                  <button
                    onClick={() => insertLatexTemplate('\\int_{a}^{b} f(x) dx')}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-700">Integral</div>
                    <div className="text-sm text-gray-500">∫ f(x) dx</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-gray-50"
            placeholder={`Q1. Calculate the area: [latex: A = \\pi r^2]
[image: circle.png]
A. [latex: 12\\pi]
B. [latex: 16\\pi]
C. [latex: 20\\pi]
D. [latex: 25\\pi]
Answer: B`}
          />

          {error && (
            <div className="mt-4 flex items-center bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {Object.keys(images).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Images</h3>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(images).map(([name, src]) => (
                  <div key={name} className="relative group">
                    <img
                      src={src}
                      alt={name}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-3 rounded-b-lg">
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Preview</h3>
              <div className="space-y-8">
                {preview.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start space-x-4">
                      <span className="font-medium text-gray-700">Q{index + 1}.</span>
                      <div className="flex-1">
                        <div className="text-gray-800">
                          {question.text}
                          {question.latex && (
                            <div className="mt-3">
                              <MathRenderer latex={question.latex} block />
                            </div>
                          )}
                        </div>
                        {question.imagePath && (
                          <img
                            src={question.imagePath}
                            alt={`Question ${index + 1}`}
                            className="mt-4 max-h-64 rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="mt-4 space-y-3">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={option.id}
                              className={`flex items-center p-3 rounded-lg ${
                                optIndex === question.correctOptionIndex
                                  ? 'bg-green-50 border border-green-200'
                                  : 'hover:bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <span className="w-8 font-medium text-gray-700">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <div className="flex items-center">
                                <span>{option.text}</span>
                                {option.latex && (
                                  <MathRenderer latex={option.latex} className="ml-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Save className="h-5 w-5 mr-2" />
          Save and Continue
        </button>
      </div>

      <div className="mt-12 bg-amber-50 p-8 rounded-xl">
        <h2 className="text-xl font-semibold text-amber-800 mb-4">Format Instructions</h2>
        <p className="text-gray-700 mb-4">
          Use the following format to manually enter questions:
        </p>
        <pre className="bg-white p-6 rounded-lg border border-amber-200 text-sm overflow-x-auto">
{`Q1. Your question text here [latex: \\frac{x}{2} = 5]
[image: filename.png]  (optional)
A. First option [latex: x = 10]
B. Second option
C. Third option [latex: x = 8]
D. Fourth option
Answer: A`}
        </pre>
        <ul className="mt-6 space-y-3 text-gray-600">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
            Start each question with "Q\" and a number (e.g., Q1.)
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
            Include 4 options labeled A to D
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
            Use [latex: ...] for math equations
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
            Use [image: filename] to embed images
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
            Image files must be uploaded before referencing
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
            Correct answer should be stated with "Answer: X"
          </li>
        </ul>
      </div>
    </div>
  );
}